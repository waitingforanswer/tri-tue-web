# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Dự án

Website học **Vốn sống Trí tuệ** — ba tầng: công khai → khu học → quản trị.
Phi lợi nhuận, không thu tiền. Đọc `docs/KIEN-TRUC.md` trước khi sửa gì đáng kể;
`docs/HUONG-DAN.md` là hướng dẫn vận hành (chạy thử, Supabase, email).

## Lệnh

```bash
npm run dev        # cổng 8080
npm run build      # tsc -b && vite build
npm run lint
npm run seed:gen   # sinh lại nội dung từ tools/prototype.html
```

Chưa có bộ kiểm thử tự động.

## Kiến trúc — bốn điều cần nhớ

**1. Nội dung là MỘT cây, không phải 20 bảng.** Bảng `nut` có `loai` +
`du_lieu jsonb`, cộng `lien_ket_nut` cho quan hệ ngang. Thêm dạng nội dung mới
thì thêm giá trị `loai`, **không** tạo bảng mới, **không** chạy migration.

**2. Phân quyền có hai hàng rào.** Giao diện (`components/guards/Cong.tsx`) và
RLS trong Postgres. Khi thêm bảng hay route mới, phải làm **cả hai**. Chỉ ẩn ở
giao diện là chưa an toàn.

**3. Mọi truy cập dữ liệu đi qua `src/lib/nguon.ts`.** Không import
`supabase` trực tiếp trong component. Đổi backend sau này chỉ sửa một file.

**4. `src/data/*` sinh tự động.** Sửa `tools/seed-gen.mjs` rồi chạy
`npm run seed:gen`, đừng sửa tay file trong `src/data/`.

## Hệ thống giao diện — đọc `docs/HE-THONG-GIAO-DIEN.md`

Mở `/bang-mau` trên website để xem tận mắt mọi token và component.

* **Không viết `text-[__px]`.** Dùng 11 bậc đã khai: `text-mac` `text-vi`
  `text-ghi` `text-phu` `text-than` `text-dan` `text-de-nho` `text-de-vua`
  `text-de-lon` `text-de-bia` `text-hero`. Mỗi bậc đã kèm line-height và
  letter-spacing — đừng thêm `tracking-*` / `leading-*` lên trên.
* **Không viết mã màu thẳng.** Chín màu: `nen giay muc nhat vien nhan
  nhan-nhe am canh`. Giá trị thật ở `src/index.css`.
* **Độ mờ chỉ dùng giá trị đã khai** (thêm 8, 15, 85 ngoài thang mặc định).
  Tailwind KHÔNG báo lỗi khi class không hợp lệ — nó im lặng bỏ qua và mất
  kiểu dáng. Đã có 4 lỗi như vậy lọt vào v0.2.
* `npm run lint` chạy `tools/kiem-lop.mjs` để canh ba điều trên.

## Quy ước

* Tên nghiệp vụ dùng **tiếng Việt không dấu**: bảng `nut`, cột `pham_vi`,
  component `BoCucThanhVien`. Từ vựng Trí tuệ không dịch sang tiếng Anh được.
* Ngoại lệ: `src/components/ui/` giữ tên shadcn tiếng Anh.
* Màu qua biến CSS trong `src/index.css` (`--nen`, `--muc`, `--nhan`…), không
  viết mã màu thẳng trong class. Hỗ trợ sáng/tối qua `[data-theme]`.
* Nội dung lấy nguyên văn từ tài liệu gốc thì render bằng `<VanGoc html={...}>`
  để giữ thẻ `<b>`, `<em>` của bản gốc.

## Quy tắc về nội dung — quan trọng

**Không bịa nội dung Trí tuệ.** Tài liệu gốc có những mục mới có tiêu đề,
chưa có nội dung; chúng mang nhãn `nhan = 'trong'` và phải hiển thị đúng là
"bản gốc còn trống". Nếu được yêu cầu "viết đầy đủ hơn" cho một mục như vậy,
hãy hỏi lại trước khi viết — người học tin đây là nguyên văn.

**Đừng làm nhẹ đi phần "đây không phải là gì".** Khối `KHONG_PHAI` trên trang
chủ và trang `/cam-ket` là lý do người mới dám bước vào. Có thể sửa cho hay
hơn, nhưng đừng rút gọn hay đẩy xuống dưới.

**Dữ liệu học của người dùng là riêng tư.** `ghi_chu`, `phieu_ung_dung`,
`tien_do` — RLS chỉ cho chủ tài khoản đọc, admin cũng không xem được nội dung.
Đừng thêm chính sách cho admin đọc, kể cả để "hỗ trợ người học".

## Vị trí mã nguồn

| Việc | Ở đâu |
|---|---|
| Định tuyến + provider | `src/App.tsx` |
| Cổng chắn theo tầng | `src/components/guards/Cong.tsx` |
| Phiên đăng nhập, vai trò, quyền | `src/hooks/useAuth.tsx` |
| Danh mục quyền (khớp migration 01) | `src/lib/quyen.ts` |
| Lớp dữ liệu | `src/lib/nguon.ts` |
| Kiểu dữ liệu | `src/types/kho.ts` |
| Luồng email (xác thực, quên mật khẩu) | `src/pages/cong-khai/Email.tsx` |
| Migration | `supabase/migrations/` |
| Mẫu email tiếng Việt | `supabase/email-templates/` |
| Bộ sinh seed | `tools/seed-gen.mjs` |

## Biến môi trường

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Bắt buộc cả hai. Thiếu → `src/pages/ThieuCauHinh.tsx` chặn toàn bộ app và nói
rõ thiếu biến nào. **Không thêm lại chế độ demo bằng dữ liệu tĩnh**: khai sai
tên biến trên Netlify thì web vẫn lên nhưng chạy dữ liệu giả mà không báo gì —
đó là cái bẫy đã bỏ ở v0.4.
