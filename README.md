# Vốn sống Trí tuệ

Website học Vốn sống Trí tuệ — ba tầng: trang công khai để người mới hiểu và
tin, khu học cho thành viên đã được duyệt, khu quản trị cho admin và sub-admin.

Phi lợi nhuận. Không thu tiền dưới bất kỳ hình thức nào.

## Chạy thử

```bash
npm install
cp .env.example .env      # điền VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev               # http://localhost:8080
```

Website cần Supabase để chạy — không có chế độ chạy bằng dữ liệu tĩnh. Thiếu
một trong hai biến trên thì trang đầu tiên nói thẳng là thiếu cái gì, thay vì
im lặng chạy sai.

## Nối cơ sở dữ liệu

Trên Supabase:

```bash
supabase db push                              # 4 migration trong supabase/migrations
supabase db execute --file supabase/seed.sql  # nạp 694 mục nội dung
```

**Từng bước đầy đủ — kể cả cấu hình hòm thư và email xác nhận — nằm ở
[`docs/HUONG-DAN.md`](docs/HUONG-DAN.md).**

Rồi tạo tài khoản admin đầu tiên:

```sql
-- sau khi đã đăng ký qua giao diện
update public.ho_so set trang_thai = 'hoat_dong' where email = 'ban@email.vn';
insert into public.vai_tro_nguoi_dung (user_id, vai_tro)
select id, 'admin' from public.ho_so where email = 'ban@email.vn';
```

## Lệnh

```bash
npm run dev        # máy chủ phát triển, cổng 8080
npm run build      # dựng bản production vào dist/
npm run preview    # xem thử bản production
npm run lint       # ESLint + kiểm tra hệ thống giao diện
npm run kiem-giao-dien  # chỉ kiểm tra giao diện
npm run seed:gen   # sinh lại seed từ prototype (xem bên dưới)
```

## Sinh lại nội dung từ prototype

Toàn bộ nội dung đến từ file prototype `thuoc-tri-tue-offline.html`. Khi bản
prototype có thay đổi:

```bash
cp <duong-dan>/thuoc-tri-tue-offline.html tools/prototype.html
npm run seed:gen
```

Sinh ra `supabase/seed.sql`, `src/data/kho-tri-tue.json` và `src/data/so-lieu.ts`.
Id sinh theo UUID v5 nên chạy lại nhiều lần vẫn ra cùng id — seed idempotent,
nạp lại không tạo bản ghi trùng.

## Cấu trúc thư mục

```
docs/
  HUONG-DAN.md          ★ chạy thử · nối Supabase · hòm thư và email
  HE-THONG-GIAO-DIEN.md   màu, chữ, component — và cách góp ý cho nhanh
  KIEN-TRUC.md            thiết kế 3 tầng, mô hình nội dung, phân quyền
  KIEM-CHUNG.md           những gì đã chạy thật, và ba lỗi đã bắt được
src/
  lib/nguon.ts          ★ lớp truy cập dữ liệu duy nhất
  lib/quyen.ts            danh mục 11 quyền (khớp với migration 01)
  hooks/useAuth.tsx       phiên đăng nhập + vai trò + quyền
  components/guards/      cổng chắn route theo tầng
  components/layout/      3 bố cục tương ứng 3 tầng
  pages/cong-khai/        tầng 1
  pages/hoc/              tầng 2
  pages/quan-tri/         tầng 3
  pages/BangMau.tsx       /bang-mau — bảng mẫu sống của hệ thống giao diện
  data/                   sinh tự động — đừng sửa tay
supabase/
  migrations/             4 migration: người dùng · nội dung · học tập · xác nhận email
  email-templates/        3 mẫu email tiếng Việt, dán vào Supabase
  seed.sql                sinh tự động
tools/
  extract.mjs             trích 24 mảng dữ liệu từ prototype HTML
  seed-gen.mjs            chuyển thành seed
  kiem-lop.mjs            canh giao diện không đi lệch hệ thống
```

## Quy ước đặt tên

Mã nguồn dùng **tiếng Việt không dấu** cho mọi thứ thuộc về nghiệp vụ — tên
bảng, tên cột, tên biến, tên component (`nut`, `pham_vi`, `BoCucThanhVien`).
Lý do: từ vựng của tài liệu Trí tuệ không dịch sang tiếng Anh được mà không
mất nghĩa — "khuôn", "pháp", "ý bám", "góc độ tác động" — nên dịch một nửa sẽ
rối hơn là giữ nguyên.

Ngoại lệ: thư mục `src/components/ui/` giữ tên tiếng Anh theo chuẩn shadcn/ui
để còn thêm được component bằng `npx shadcn@latest add`.

## Nội dung

Toàn bộ nội dung lấy **nguyên văn** từ tài liệu của nhóm học Vốn sống Trí tuệ.
Những mục mà bản gốc mới có tiêu đề, chưa có nội dung, được đánh nhãn
`trong` = "bản gốc còn trống" và hiển thị đúng như vậy.

**Đừng bịa nội dung để lấp chỗ trống.** Chỗ trống ghi rõ là trống thì người
học biết đường mà hỏi; lấp bừa thì họ học sai mà không biết.
