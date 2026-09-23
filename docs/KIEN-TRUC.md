# Kiến trúc website Vốn sống Trí tuệ

> Bản v0.2 · 14/09/2026 · dựng từ prototype `thuoc-tri-tue-offline.html`

## 0. Điều quyết định mọi thứ khác

Nội dung này khó ở chỗ: người nghe lần đầu hay dè chừng — sợ bị rủ vào một
nhóm nào đó, sợ mất tiền, sợ mất gia đình. Sự dè chừng đó **hợp lý**, và
kiến trúc website phải phục vụ nó chứ không né tránh nó. Ba hệ quả:

1. **Tầng 1 phải nói thẳng "đây không phải là gì" ngay trên trang chủ**, trước
   khi mời ai đăng ký. Khối "Nói trước cho rõ" và trang Cam kết không phải
   trang phụ — chúng là lý do người ta dám bước vào.
2. **Cửa duyệt là để bảo vệ, không phải để tạo cảm giác bí truyền.** Vì vậy
   trang chủ giải thích rõ vì sao phải duyệt, và biểu mẫu đăng ký hỏi đúng hai
   câu giúp người xét chỉ được chỗ bắt đầu.
3. **Dữ liệu học của người dùng là riêng tư tuyệt đối** — kể cả admin cũng
   không đọc được ghi chú và phiếu ứng dụng. Điều này được thực thi ở tầng
   cơ sở dữ liệu, không phải chỉ hứa suông.

---

## 1. Ba tầng

| | Tầng 1 · Công khai | Tầng 2 · Khu học | Tầng 3 · Quản trị |
|---|---|---|---|
| Ai vào được | Bất kỳ ai | Thành viên `hoat_dong` | `admin`, `sub_admin` |
| Đường dẫn | `/`, `/tri-tue-la-gi`, `/cam-ket`… | `/hoc/*` | `/quan-tri/*` |
| Mục đích | Hiểu · tin · muốn học | Học và làm | Vận hành |
| Cổng chắn | không | `<CanDuyet>` + RLS | `<CanQuyen>` + RLS |

### Tầng 1 — sơ đồ trang

```
/                    Trang chủ (landing)
                     ├ Mở đầu — "Tự làm thầy cho cuộc đời mình"
                     ├ Bạn đang bất ổn ở đâu? — 7 khối, lấy từ DB
                     ├ Nói trước cho rõ: đây KHÔNG phải là gì  ★
                     ├ Học thế nào — 5 bước
                     ├ Vì sao phải đăng ký và chờ duyệt        ★
                     └ Kết — lời mời
/tri-tue-la-gi       Khái niệm + mục lục 11 phần (chỉ tiêu đề, không mở nội dung)
/hoc-the-nao         Lộ trình 5 bước + tự định vị nhóm
/cam-ket             7 cam kết minh bạch                       ★
/cau-hoi             Hỏi đáp — phần lớn là câu hỏi về an toàn
/bai-viet            Bài viết công khai
/gop-y               Gửi góp ý (kể cả tố giác người mượn danh)
/dang-ky /dang-nhap  Tài khoản
/cho-duyet           Màn hình chờ, cho người đã đăng ký
/xac-thuc            Nơi Supabase trả về sau khi bấm link xác nhận email
/quen-mat-khau       Xin link đặt lại mật khẩu
/dat-lai-mat-khau    Nơi Supabase trả về sau khi bấm link đặt lại
```

Ba địa chỉ cuối phải được khai trong Supabase → Authentication → URL
Configuration → Redirect URLs, nếu không link trong email sẽ bị từ chối.

★ = ba trang gánh việc xây lòng tin. Đừng cắt gọn khi thiếu chỗ.

### Tầng 2 — khu học `/hoc`

Giữ nguyên cách chia của prototype, vì cách chia đó đi theo **việc người học
cần làm hôm nay**, không đi theo cấu trúc tài liệu:

```
Tổng quan            /hoc
Làm gì hôm nay
  Đang học           /hoc/lo-trinh          5 bước · 11 mục bổ trợ · công thức học
  Sống hằng ngày     /hoc/song-hang-ngay    chu kỳ · phản xạ · cảnh phát sinh
  Có vấn đề bất ổn   /hoc/thuoc             ★ Thước Trí tuệ — wizard 4 bước
Tra cứu
  Cây kiến thức      /hoc/cay-kien-thuc     11 phần · 52 mảng · 227 ý
  Thư viện khuôn     /hoc/thu-vien-khuon    24 khuôn + 6 khuôn khối
  Từ điển thuật ngữ  /hoc/tu-dien           46 thuật ngữ · 7 cặp dễ nhầm · 24 ý bám
  Tìm kiếm           /hoc/tim?q=            không dấu, toàn kho
Của tôi
  Phiếu ứng dụng     /hoc/phieu             riêng tư
  Ghi chú            /hoc/ghi-chu           riêng tư
  Hồ sơ              /hoc/ho-so
```

**Thước Trí tuệ** là thứ có giá trị nhất của cả website: chọn khối → khai thác
dữ liệu (truy quả tầm nhân) → chọn góc độ tác động → hệ thống ánh xạ ra đúng
khuôn → in ra phiếu ứng dụng. Ánh xạ góc độ → khuôn nằm trong bảng
`lien_ket_nut` với `quan_he = 'goc_do_khuon'` (60 liên kết).

### Tầng 3 — quản trị `/quan-tri`

```
Tổng quan   Bảng điều khiển     XEM_THONG_KE
Con người   Chờ duyệt           QL_THANH_VIEN   ← màn hình quan trọng nhất
            Thành viên          QL_THANH_VIEN
            Vai trò & quyền     chỉ admin
Nội dung    Kho Trí tuệ         ND_SUA          ← một trình soạn cây cho toàn bộ nội dung
            Module học          QL_MODULE
            Trang công khai     QL_TRANG
            Bài viết            QL_BAI_VIET
Vận hành    Góp ý               QL_GOP_Y
            Nhật ký             XEM_NHAT_KY
```

---

## 2. Mô hình nội dung: một cây, không phải hai mươi bảng

Prototype có 24 cấu trúc dữ liệu khác nhau. Nếu mỗi thứ một bảng thì admin
phải học 20 màn hình CRUD, và mỗi lần tài liệu gốc thêm một dạng nội dung mới
lại phải chạy migration.

Thay vào đó, mọi thứ là một **nút** trong một cây:

```
nut(id, loai, cha_id, module_id, ma, tieu_de, tom_tat, noi_dung,
    nhan, du_lieu jsonb, thu_tu, pham_vi, trang_thai, tu_khoa)
lien_ket_nut(tu_id, den_id, quan_he, thu_tu)
```

* `loai` phân biệt dạng nội dung: `phan`, `nhanh`, `y`, `khoi`, `khuon`, `tu`,
  `buoc`, `bo_tro`… Thêm loại mới **không cần migration**.
* `du_lieu` giữ những trường riêng của từng loại (khuôn có `bam`, `chu_ky`;
  chu kỳ có danh sách `viec`…).
* `nhan` giữ nguyên quy ước của tài liệu gốc: `qc` Quy chuẩn · `qchieu` Quy
  chiếu · `ud` Ứng dụng · **`trong` = bản gốc còn trống**. Mục còn trống được
  hiển thị đúng là còn trống, không bịa nội dung lấp vào.
* `tu_khoa` là cột sinh sẵn đã bỏ dấu (`unaccent`), có chỉ mục trigram → tìm
  "nghiep" ra "nghiệp".
* `ma` chỉ duy nhất **trong phạm vi nút cha** — tài liệu gốc dùng lại các mã
  như "①", "MẢNG 1" ở nhiều phần khác nhau.

Kết quả seed từ prototype: **7 module · 694 nút · 60 liên kết**.

| Module | Nội dung |
|---|---|
| `mo-dau` | 14 điểm bám |
| `lo-trinh` | 5 bước (23 ý) · 11 mục bổ trợ · 4 nhóm người học · 4 công thức học |
| `song-hang-ngay` | 7 chu kỳ · 2 bộ phản xạ · 2 cảnh phát sinh · khuôn ngoài |
| `thuoc-tri-tue` | 7 khối (33 bất ổn, 51 mục khai thác) · 12 biểu hiện · 10 góc độ · 3 pháp |
| `cay-kien-thuc` | 11 phần · 52 mảng · 227 ý |
| `thu-vien-khuon` | 24 khuôn (100 việc cần làm) · 6 khuôn khối |
| `tu-dien` | 5 nhóm · 46 thuật ngữ · 7 cặp dễ nhầm · 24 ý bám |

### Module và phân phối nội dung

`module` là đơn vị admin cấp cho thành viên. Ba mức `pham_vi`:

* `cong_khai` — hiện ở tầng 1
* `thanh_vien` — mọi thành viên đã duyệt
* `gioi_han` — chỉ ai được cấp riêng qua bảng `cap_module`

Đây là cách để về sau mở nội dung theo giai đoạn: người mới chỉ thấy Mở đầu +
Lộ trình, học xong bước 2 mới được cấp Thư viện khuôn.

---

## 3. Phân quyền

### Vai trò

| Vai trò | Nghĩa |
|---|---|
| `admin` | Toàn quyền, kể cả cấp vai trò. Nên giữ 2–3 người. |
| `sub_admin` | Vào khu quản trị, làm đúng việc được cấp quyền. |
| `thanh_vien` | Chỉ khu học. |

Vai trò và trạng thái là **hai trục khác nhau**: một người có thể là
`thanh_vien` nhưng `trang_thai = 'cho_duyet'` → chưa vào được tầng 2.

### 11 quyền chi tiết

| Mã | Việc | Admin | Sub-admin |
|---|---|---|---|
| `QL_THANH_VIEN` | Duyệt / khóa thành viên | ✓ | cấp được |
| `QL_VAI_TRO` | Cấp vai trò | ✓ | — |
| `ND_XEM_NHAP` | Xem bản nháp | ✓ | ✓ |
| `ND_SUA` | Soạn & sửa nội dung | ✓ | ✓ |
| `ND_XUAT_BAN` | Xuất bản, đổi phạm vi | ✓ | cấp được |
| `QL_MODULE` | Module & cấp module | ✓ | cấp được |
| `QL_TRANG` | Trang công khai | ✓ | cấp được |
| `QL_BAI_VIET` | Bài viết | ✓ | ✓ |
| `QL_GOP_Y` | Xử lý góp ý | ✓ | ✓ |
| `XEM_THONG_KE` | Thống kê | ✓ | ✓ |
| `XEM_NHAT_KY` | Nhật ký | ✓ | cấp được |

Tách `ND_SUA` khỏi `ND_XUAT_BAN` là có chủ ý: cộng tác viên soạn nội dung
được, nhưng việc quyết định thứ gì hiện ra cho người học thì cần người khác
duyệt.

### Hai hàng rào, không phải một

1. **Giao diện** — `<CanDuyet>`, `<CanQuyen quyen={...}>` ẩn mục và chuyển hướng.
2. **Cơ sở dữ liệu** — chính sách RLS trong Postgres. Đây mới là hàng rào thật:
   ai gọi thẳng API cũng không lấy được nội dung tầng 2.

Kiểm chứng thực tế trên Postgres 16 (đã chạy, xem `docs/KIEM-CHUNG.md`):

| Người | Nút đọc được | Nút nháp | Hồ sơ đọc được |
|---|---|---|---|
| Khách | chỉ nút công khai | 0 | 0 |
| Đã đăng ký, chờ duyệt | chỉ nút công khai | 0 | 1 (của mình) |
| Thành viên đã duyệt | 691 | 0 | 1 (của mình) |
| Admin | 694 | 3 | tất cả |

Ngoài ra: người chờ duyệt **không tự đổi được** `trang_thai` của mình (trigger
`chan_tu_duyet`), thành viên thường **không sửa được** nội dung, và **admin
không đọc được** phiếu ứng dụng của người khác.

---

## 4. Luồng kết nạp

```
Đăng ký ──► ho_so.trang_thai = 'cho_duyet'   (trigger tự tạo khi có auth.users)
   │        + vai_tro_nguoi_dung = 'thanh_vien'
   │
   ▼
Admin đọc hồ sơ ở /quan-tri/duyet
   │   Hai câu trả lời là căn cứ chính:
   │     · "Vì sao bạn muốn học?"
   │     · "Bạn đang gặp bất ổn gì?"
   │
   ├─► duyet_thanh_vien(uid, 'hoat_dong')  ──► vào được /hoc, ghi nhật ký
   ├─► duyet_thanh_vien(uid, 'tu_choi', 'lý do')  ──► màn /khong-duoc-duyet, đọc được ghi chú
   └─► duyet_thanh_vien(uid, 'tam_khoa')  ──► dừng quyền, không xoá tài khoản
```

Nguyên tắc xét đã ghi thẳng trên màn hình duyệt: viết cụ thể thì duyệt được
ngay; viết chung chung thì hỏi thêm chứ đừng từ chối vội; có dấu hiệu bán
hàng / rủ đầu tư / lôi kéo cho nhóm khác thì không duyệt.

---

## 5. Công nghệ

Giống dự án gia phả `hoha-main` để tái dùng được kinh nghiệm:

| Lớp | Chọn |
|---|---|
| Giao diện | Vite + React 18 + TypeScript |
| Kiểu dáng | Tailwind CSS (biến màu HSL, sáng/tối) |
| Trạng thái máy chủ | TanStack Query |
| Định tuyến | React Router v6 |
| Backend | Supabase — Auth, Postgres, RLS, Storage |
| Triển khai | Netlify / Vercel (SPA, cần `_redirects`) |

**Khác với dự án gia phả một điểm quan trọng:** ở đây dùng **Supabase Auth
chuẩn** (email + mật khẩu) thay vì hệ auth tự viết qua Edge Function. Lý do:
website này mở đăng ký công khai, nên cần sẵn xác thực email, đặt lại mật
khẩu, chống dò mật khẩu — những thứ Supabase Auth đã làm sẵn và làm đúng.
`ho_so` gắn 1-1 với `auth.users`.

### Lớp truy cập dữ liệu

Mọi màn hình gọi qua `src/lib/nguon.ts`, không gọi thẳng supabase. Đổi backend
sau này chỉ phải sửa một file, và mọi truy vấn nằm cùng một chỗ để soát lại.

Bản v0.3 từng có **chế độ demo**: thiếu `.env` thì chạy dữ liệu tĩnh kèm bộ
chọn vai. Bỏ ở v0.4 vì lên môi trường thật nó là bẫy — khai sai tên biến trên
Netlify, website vẫn lên nhưng chạy dữ liệu giả mà không báo gì. Nay thiếu cấu
hình là dừng và nói rõ thiếu biến nào.

---

## 6. Lộ trình triển khai

**Giai đoạn 1 — đang ở đây.** Khung 3 tầng chạy được, nội dung seed đủ 694
mục, phân quyền và RLS đã kiểm chứng, Thước Trí tuệ chạy hết 4 bước, landing
page hoàn chỉnh, luồng email (xác nhận, quên mật khẩu) đã dựng xong ở phía
giao diện và cơ sở dữ liệu.

**Giai đoạn 2 — nối Supabase thật.**
1. Tạo project Supabase, chạy 3 migration, chạy `seed.sql`.
2. Tạo tài khoản admin đầu tiên, cấp `vai_tro = 'admin'` bằng SQL.
3. Bật xác thực email; sửa mẫu email sang tiếng Việt.
4. Hoàn thiện: lưu phiếu ứng dụng, ghi chú, tiến độ học, biểu mẫu góp ý.
5. Màn hình duyệt thành viên nối vào hàm `duyet_thanh_vien`.

**Giai đoạn 3 — trao quyền cho admin.**
6. Trình soạn nút đầy đủ (thêm / sửa / kéo thả thứ tự / đổi phạm vi).
7. Chuyển nội dung 5 trang công khai vào bảng `trang`, bật trình soạn khối.
8. Cấp module theo giai đoạn học.

**Giai đoạn 4 — mở rộng.**
9. Bài viết + câu chuyện người học (cần cơ chế duyệt trước khi đăng).
10. Thống kê học tập tổng hợp, không xâm phạm riêng tư.
11. Cân nhắc mã giới thiệu để ưu tiên hồ sơ có người trong nhóm bảo lãnh.

### Việc nên làm sớm dù chưa gấp

* **Sao lưu.** Bật point-in-time recovery của Supabase ngay khi có dữ liệu thật.
* **Người thứ hai giữ quyền admin.** Một người giữ khoá là rủi ro cho cả nhóm.
* **Nội quy xét duyệt viết thành văn bản** để nhiều người cùng duyệt mà vẫn
  nhất quán.
