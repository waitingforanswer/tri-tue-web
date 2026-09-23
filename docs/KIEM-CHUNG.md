# Kiểm chứng — những gì đã chạy thật

Ghi lại để lần sau không phải kiểm lại từ đầu, và để biết chỗ nào đã chắc,
chỗ nào mới chỉ là khung.

## 1. Build & lint

```
npm run lint   → 0 lỗi, 0 cảnh báo
npm run build  → thành công
                 index.js   ~228 KB (gzip 71 KB)
                 index.css   ~26 KB (gzip  6 KB)
```

## 2. Migration + seed trên Postgres 16 thật

Chạy trên một cluster Postgres 16 dựng tạm, với schema `auth` giả lập tối
thiểu (`auth.users`, `auth.uid()`):

* 3 migration chạy sạch, không lỗi.
* `seed.sql` nạp đủ **7 module · 694 nút · 60 liên kết**.
* Chạy `seed.sql` **lần thứ hai** vẫn đúng 694 nút — seed idempotent nhờ UUID v5.

## 3. RLS — kiểm bằng bốn nhân vật

Dùng đúng vai `anon` / `authenticated` như Supabase, đặt `auth.uid()` qua
`request.jwt.claim.sub`:

| Người | Nút đọc được | Nút nháp | Hồ sơ đọc được |
|---|---|---|---|
| Khách (chưa đăng nhập) | 7 (chỉ nút công khai) | 0 | 0 |
| Đã đăng ký, **chờ duyệt** | 7 | 0 | 1 — của mình |
| Thành viên **đã duyệt** | 691 | 0 | 1 — của mình |
| Admin | 694 | 3 | 3 — tất cả |

Ba phép thử tấn công:

| Thử | Kết quả |
|---|---|
| Người chờ duyệt tự `update ho_so set trang_thai='hoat_dong'` | Bị hoàn lại `cho_duyet` |
| Thành viên thường `update nut set tieu_de=...` | 0 dòng bị sửa |
| Admin `select * from phieu_ung_dung` của người khác | 0 dòng |

## 4. Giao diện — chụp màn hình 16 trang, 4 vai

Chạy bằng Chromium headless trên bản build production. Các chuyển hướng của
cổng chắn đều đúng:

| Vai | Vào | Bị đẩy tới | Đúng? |
|---|---|---|---|
| Khách | `/hoc` | `/dang-nhap` | ✓ |
| Chờ duyệt | `/hoc` | `/cho-duyet` | ✓ |
| Thành viên | `/quan-tri` | `/` | ✓ |
| Sub-admin | `/quan-tri/phan-quyen` | `/quan-tri/thieu-quyen` | ✓ |
| Admin | `/quan-tri/phan-quyen` | vào được | ✓ |

Không có lỗi JavaScript trên bất kỳ trang nào. (Các lỗi mạng trong log là do
môi trường thử nghiệm chặn Google Fonts, không phải lỗi mã.)

## 5. Hai lỗi thật đã phát hiện nhờ chạy kiểm chứng

Ghi lại vì cả hai đều là loại lỗi mà đọc code không thấy được:

**a. Ràng buộc duy nhất sai phạm vi.** Ban đầu đặt `unique(loai, ma)`. Nạp
seed thì vỡ: tài liệu gốc dùng lại mã "①" ở nhiều phần khác nhau. Đã sửa
thành `unique(cha_id, loai, ma) nulls not distinct` — mã chỉ duy nhất trong
phạm vi nút cha. Bộ sinh seed nay cũng tự kiểm tra trùng trước khi ghi file.

**b. Trigger chặn tự duyệt chặn nhầm cả máy chủ.** `chan_tu_duyet` và
`chan_tu_xuat_ban` kiểm tra `co_quyen(auth.uid(), ...)`. Khi chạy từ
`service_role`, script seed hay psql thì `auth.uid()` là null → hàm trả false
→ trigger **âm thầm** hoàn lại thay đổi. Hậu quả: không thể duyệt thành viên
hay xuất bản nội dung bằng script. Đã sửa: bỏ qua kiểm tra khi `auth.uid()`
là null, vì RLS đã chặn người dùng ẩn danh ghi vào các bảng đó rồi.

## 6. Bản v0.2 — luồng email

Thêm migration 04 (đồng bộ cờ xác nhận email) và ba màn hình `/xac-thuc`,
`/quen-mat-khau`, `/dat-lai-mat-khau`. Chạy lại toàn bộ trên Postgres 16:

* 4 migration + seed chạy sạch, vẫn đúng 7 · 694 · 60.
* Bốn phép thử luồng xác nhận email:

| Thử | Kết quả |
|---|---|
| Tài khoản mới, chưa bấm link | `email_da_xac_nhan = false` |
| Cập nhật `auth.users.email_confirmed_at` | Tự đồng bộ sang `true` |
| Người dùng tự đặt cờ `true` và tự duyệt mình | Cả hai bị hoàn lại |
| `thong_ke_tong_quan()` | Tách đúng: 2 chờ duyệt, 1 đã xác nhận email |

Lint và build sạch; không có lỗi JavaScript trên bốn màn hình mới.

### Lỗi thứ ba bắt được nhờ chạy kiểm chứng

**Trigger chống sửa chặn nhầm trigger đồng bộ.** `chan_tu_duyet` hoàn lại mọi
thay đổi của `email_da_xac_nhan` để người dùng không tự đánh dấu mình đã xác
nhận — nhưng nó chặn luôn cả trigger hợp lệ đồng bộ từ `auth.users`. Hậu quả:
cờ vĩnh viễn là `false`, người duyệt không bao giờ thấy ai xác nhận email cả.

Đã sửa bằng một cờ chỉ sống trong transaction (`app.dong_bo_xac_nhan`): trigger
đồng bộ bật cờ trước khi ghi, `chan_tu_duyet` thấy cờ thì cho qua. Không dựa vào
`auth.uid()` vì không chắc GoTrue chạy lệnh cập nhật trong ngữ cảnh nào.

Đáng chú ý: cả ba lỗi tìm được cho tới giờ đều là **lỗi im lặng** — không báo gì,
chỉ âm thầm làm sai. Đọc code không thấy được.

## 7. Chỗ chưa kiểm được ở bước này

* Chưa chạy trên Supabase thật — mới là Postgres 16 với schema `auth` giả lập.
  Cần kiểm lại `auth.uid()`, xác thực email, và quyền của `service_role`.
* **Chưa gửi được một email thật nào.** Toàn bộ phần C của `docs/HUONG-DAN.md`
  (Resend, DNS, mẫu email) viết theo tài liệu chính thức, chưa chạy thử — vì
  cần tên miền thật. Bảng kiểm ở mục C8 là để làm việc đó.
* Chưa có kiểm thử tự động. Nên thêm khi bắt đầu sửa nội dung qua giao diện.
* Các màn hình ghi dữ liệu (lưu phiếu, ghi chú, sửa hồ sơ, duyệt thành viên,
  xử lý góp ý) đã nối vào DB ở v0.4 nhưng **chưa chạy thử trên Supabase thật** —
  cần làm lại bảng kiểm mục 3 sau khi có project thật.
* Trình soạn nội dung ở `/quan-tri/kho` mới đọc, chưa ghi: nút *Sửa*, *Đổi phạm
  vi*, *Thêm mục* còn khoá.

## Chạy lại bộ kiểm chứng

```bash
npm run lint && npm run build           # 1
# 2–3: cần một Postgres 16 và schema auth giả lập, xem docs/KIEN-TRUC.md
npx vite preview --port 4173 --host 127.0.0.1   # rồi chụp màn hình
```
