# Mẫu email tiếng Việt

Supabase gửi email mặc định bằng tiếng Anh. Ba file trong thư mục này thay bằng
tiếng Việt, theo đúng giọng của website: nói thẳng, không hù doạ, và luôn nhắc
rằng việc học miễn phí và không ai hỏi mật khẩu của bạn.

## Dán vào đâu

Supabase Dashboard → **Authentication** → **Emails** → chọn từng mẫu:

| File | Mẫu trong Supabase | Tiêu đề (Subject) |
|---|---|---|
| `1-xac-nhan-dang-ky.html` | Confirm signup | `Xác nhận email để hoàn tất đăng ký — Vốn sống Trí tuệ` |
| `2-dat-lai-mat-khau.html` | Reset Password | `Đặt lại mật khẩu — Vốn sống Trí tuệ` |
| `3-doi-email.html` | Change Email Address | `Xác nhận địa chỉ email mới — Vốn sống Trí tuệ` |

Chép **toàn bộ** nội dung file (kể cả dòng chú thích đầu), dán đè vào ô soạn
thảo, rồi bấm Save. Mỗi mẫu lưu riêng.

Các mẫu còn lại (Invite user, Magic Link, Reauthentication) website chưa dùng
tới — để nguyên cũng không sao.

## Biến Supabase thay vào lúc gửi

| Biến | Nghĩa |
|---|---|
| `{{ .ConfirmationURL }}` | Link bấm vào — Supabase tự dựng, đừng sửa |
| `{{ .Email }}` | Email của người nhận |
| `{{ .NewEmail }}` | Email mới, chỉ có ở mẫu đổi email |
| `{{ .Token }}` | Mã 6 số, dùng khi muốn cho nhập mã thay vì bấm link |
| `{{ .SiteURL }}` | Site URL đã đặt trong URL Configuration |

## Vì sao viết kiểu bảng HTML cũ kỹ như vậy

Gmail, Outlook và các ứng dụng mail trên điện thoại không hỗ trợ CSS hiện đại
(flexbox, grid, biến CSS). Bố cục bằng `<table>` và CSS viết thẳng trong thuộc
tính `style` là cách duy nhất hiển thị đúng ở mọi nơi. Đừng "dọn dẹp" cho gọn —
email sẽ vỡ.

Cũng vì vậy: **không chèn ảnh từ bên ngoài**. Phần lớn ứng dụng mail chặn ảnh
theo mặc định, và ảnh chặn làm email trông như thư rác.

## Thử trước khi dùng thật

Gửi thử tới ít nhất ba nơi: một hòm Gmail, một hòm Outlook/Hotmail, và một hòm
của nhà cung cấp Việt Nam nếu có. Xem cả hộp **Spam**. Chi tiết cách thử nằm ở
phần C của `docs/HUONG-DAN.md`.
