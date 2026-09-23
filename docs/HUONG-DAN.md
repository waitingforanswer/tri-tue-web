# Hướng dẫn vận hành

Ba phần, làm theo thứ tự:

- **[Phần A](#phần-a--chạy-thử-trên-máy-của-bạn)** — cài và chạy trên máy *(15 phút, cần Node.js)*
- **[Phần B](#phần-b--nối-supabase-thật)** — nối cơ sở dữ liệu *(khoảng 1 giờ)*
- **[Phần C](#phần-c--hòm-thư-của-hệ-thống)** — hòm thư hệ thống và email xác nhận *(1–2 giờ, cộng thời gian chờ DNS)*

**Phần B là bắt buộc, không bỏ qua được.** Website không có chế độ chạy bằng dữ
liệu giả: thiếu cấu hình Supabase thì trang đầu tiên báo thiếu và dừng ở đó.
Làm xong A và B là xem được toàn bộ website bằng tài khoản thật. Phần C cần khi
muốn người ngoài tự đăng ký.

---

# PHẦN A — Chạy thử trên máy của bạn

## A1. Cài Node.js

Cần Node.js phiên bản 18 trở lên. Kiểm tra:

```bash
node -v
```

Ra `v18.x` trở lên là được. Chưa có thì tải bản LTS ở [nodejs.org](https://nodejs.org).

## A2. Chạy

```bash
cd tri-tue-web
npm install      # lần đầu, khoảng 1 phút
npm run dev
```

Màn hình hiện:

```
  ➜  Local:   http://localhost:8080/
```

Mở địa chỉ đó bằng trình duyệt.

Lần đầu chạy, chưa có file `.env`, website sẽ hiện màn hình **“Chưa cấu hình cơ
sở dữ liệu”** và dừng ở đó. Đúng như vậy — làm tiếp [Phần B](#phần-b--nối-supabase-thật)
rồi quay lại đây.

Muốn dừng: bấm `Ctrl + C` trong cửa sổ lệnh.

## A3. Xem đủ ba tầng

> Phần này làm **sau** khi xong Phần B (đã có `.env` và đã nạp nội dung). Cách
> đổi vai để xem: đăng nhập bằng tài khoản admin đã tạo ở
> [B5](#b5-tạo-tài-khoản-admin-đầu-tiên), rồi tự đăng ký thêm một tài khoản
> thường ở `/dang-ky` để xem tầng 2 và màn hình chờ duyệt. Trình duyệt ẩn danh
> giúp mở hai tài khoản cùng lúc.

### Tầng 1 — chưa đăng nhập

| Xem gì | Đường dẫn | Chú ý điều gì |
|---|---|---|
| Trang chủ | `/` | Cuộn hết. Khối **“Nói trước cho rõ: đây không phải là gì”** và khối **“Vì sao phải đăng ký và chờ duyệt”** là hai phần quan trọng nhất — đọc kỹ xem chữ đã đúng ý các anh chị chưa |
| Trí tuệ là gì | `/tri-tue-la-gi` | Mục lục 11 phần, chỉ hiện tiêu đề |
| Học thế nào | `/hoc-the-nao` | Mạch 5 bước |
| Cam kết | `/cam-ket` | 7 điều minh bạch |
| Hỏi đáp | `/cau-hoi` | Bấm từng câu để mở |
| Xin học | `/dang-ky` | Xem biểu mẫu và hai câu hỏi xét duyệt |

Thử vào `/hoc` — bị đẩy về trang đăng nhập. Đó là cổng chắn đang làm việc.

### Tầng 2 — đăng nhập bằng tài khoản đã được duyệt

| Xem gì | Đường dẫn | Chú ý điều gì |
|---|---|---|
| Tổng quan | `/hoc` | Cửa vào, ba lối đi chính |
| **Có vấn đề bất ổn** | `/hoc/thuoc` | ★ Thứ đáng xem nhất. Chọn một khối → *Tiếp* → đọc phần khai thác → chọn 1–3 góc độ tác động → *Tiếp* → *Lập phiếu ứng dụng*. Xem hệ thống lấy ra đúng khuôn nào. Bấm **In phiếu** để xem bản in |
| Cây kiến thức | `/hoc/cay-kien-thuc` | Bấm mở từng phần, rồi mở tiếp các ý bên trong |
| Thư viện khuôn | `/hoc/thu-vien-khuon` | Lọc theo nhóm, bấm *Xem cách làm* |
| Từ điển | `/hoc/tu-dien` | 46 thuật ngữ |
| Tìm kiếm | ô tìm trên cùng | Gõ `nghiep` **không dấu** — vẫn ra “nghiệp”. Thử thêm: `tuy duyen`, `oan gia`, `diem tua` |
| Đang học | `/hoc/lo-trinh` | 5 bước và 11 mục bổ trợ |
| Sống hằng ngày | `/hoc/song-hang-ngay` | Chu kỳ, phản xạ, cảnh phát sinh |

Tài khoản vừa đăng ký mà chưa được duyệt, vào `/hoc` — bị đẩy sang màn hình
chờ duyệt. Tài khoản thành viên vào `/quan-tri` — bị đẩy về trang chủ.

### Tầng 3 — đăng nhập bằng tài khoản admin

| Xem gì | Đường dẫn | Chú ý điều gì |
|---|---|---|
| Chờ duyệt | `/quan-tri/duyet` | ★ Hồ sơ thật đang chờ. Đọc phần gợi ý khi xét. Chú ý nhãn **Email chưa xác nhận** |
| Kho Trí tuệ | `/quan-tri/kho` | Chuyển giữa 7 module, mở cây, bấm một mục để xem chi tiết bên phải |
| Vai trò & quyền | `/quan-tri/phan-quyen` | Ma trận 11 quyền |
| Module học | `/quan-tri/module` | Bảy module và phạm vi của từng cái |

Hạ một tài khoản xuống **sub_admin** rồi vào `/quan-tri/phan-quyen` — bị chặn,
vì đó là mục chỉ admin mới vào được. Để ý cả ray bên trái ngắn đi: những mục
không có quyền thì không hiện ra.

### Còn nữa

Nút **mặt trăng** trên thanh trên cùng đổi sang nền tối. Thu hẹp cửa sổ trình
duyệt xuống cỡ điện thoại để xem bố cục co lại.

## A4. Những gì cần anh xem và cho ý kiến

Code thì sửa lúc nào cũng được, nhưng **chữ trên tầng 1 nên chốt sớm**, vì đó
là thứ quyết định người mới có bước vào hay không:

1. Bốn ô trong khối “đây không phải là gì” — đã đủ chưa, có điều gì các anh chị
   hay bị hiểu lầm mà chưa nói tới?
2. Bảy cam kết ở `/cam-ket` — có điều nào nhóm không muốn cam kết, hoặc cam kết
   rồi mà thực tế làm không nổi?
3. Bảy câu hỏi ở `/cau-hoi` — người thật hay hỏi gì mà chưa có trong đó?
4. Hai câu hỏi trong biểu mẫu đăng ký — hỏi vậy đã đủ để xét duyệt chưa?

## A5. Trục trặc thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `npm: command not found` | Chưa cài Node.js, xem A1 |
| `Port 8080 is in use` | Có chương trình khác chiếm cổng. Chạy `npm run dev -- --port 3000` rồi mở `localhost:3000` |
| `npm install` lỗi mạng | Chạy lại. Vẫn lỗi thì `npm cache clean --force` rồi cài lại |
| Trang trắng, không hiện gì | Mở Console của trình duyệt (F12) xem lỗi. Thường do dừng `npm run dev` giữa chừng — chạy lại |
| Chữ hiện sai phông | Phông tải từ Google Fonts, cần mạng. Không có mạng thì vẫn đọc được, chỉ khác kiểu chữ |
| Hiện “Chưa cấu hình cơ sở dữ liệu” | Thiếu `.env` hoặc sai tên biến — xem [B2](#b2-lấy-khoá-và-điền-vào-env). Nhớ tên biến thứ hai là `PUBLISHABLE_KEY`, không phải `ANON_KEY` |

---

# PHẦN B — Nối Supabase thật

Xong phần này thì website mới chạy được: người thật đăng ký được, admin duyệt
được, và toàn bộ nội dung đọc từ cơ sở dữ liệu.

## B1. Tạo project Supabase

1. Vào [supabase.com](https://supabase.com) → **Start your project** → đăng nhập
   bằng GitHub hoặc email.
2. **New project**:
   - **Name**: `von-song-tri-tue`
   - **Database Password**: bấm *Generate*, rồi **lưu lại ngay** vào nơi an toàn.
     Mật khẩu này không xem lại được, và phần B3 sẽ cần đến.
   - **Region**: chọn **Southeast Asia (Singapore)** — gần Việt Nam nhất, website
     sẽ nhanh hơn rõ rệt so với chọn Mỹ hay châu Âu.
   - **Plan**: Free.
3. Chờ khoảng 2 phút cho project dựng xong.

> **Về gói miễn phí:** đủ dùng cho quy mô này. Một điểm cần biết: project không
> có hoạt động nào trong 7 ngày sẽ bị **tạm dừng**, phải vào dashboard bấm khôi
> phục. Không mất dữ liệu, nhưng website sẽ chết trong lúc đó. Khi đã có người
> học dùng thật thì nên cân nhắc gói trả phí.

## B2. Lấy khoá và điền vào `.env`

Trong project: **Project Settings** (bánh răng) → **API**.

Lấy hai giá trị:
- **Project URL** — dạng `https://abcdefgh.supabase.co`
- **anon / public key** — chuỗi dài bắt đầu bằng `eyJ…`

Ở thư mục dự án:

```bash
cp .env.example .env
```

Mở file `.env`, điền vào:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```

Dừng `npm run dev` rồi chạy lại (file `.env` chỉ đọc lúc khởi động).

**Dấu hiệu đã nối đúng:** màn hình “Chưa cấu hình cơ sở dữ liệu” không còn hiện
nữa, trang chủ lên bình thường.

> **Về khoá:** khoá `publishable` (Supabase đời cũ gọi là `anon key`) là khoá công khai, lộ ra cũng không sao — hàng rào
> thật là RLS trong cơ sở dữ liệu. Nhưng `service_role key` trong cùng trang đó
> thì **tuyệt đối không** đưa vào `.env` của website hay đẩy lên GitHub; khoá đó
> bỏ qua mọi RLS.

## B3. Nạp cấu trúc và nội dung

Có bốn file migration và một file seed. Seed nặng 566 KB nên **dán vào SQL
Editor của dashboard sẽ rất chậm hoặc treo trình duyệt** — dùng dòng lệnh.

### Cách 1 — Supabase CLI *(khuyến nghị)*

```bash
npm install -g supabase
supabase login                     # mở trình duyệt để xác thực
supabase link --project-ref abcdefgh   # lấy ref trong URL dashboard của bạn
supabase db push                   # chạy 4 migration
```

Nạp nội dung:

```bash
supabase db execute --file supabase/seed.sql
```

### Cách 2 — psql *(nếu CLI trục trặc)*

Lấy chuỗi kết nối: **Project Settings** → **Database** → **Connection string** →
tab **URI**. Thay `[YOUR-PASSWORD]` bằng mật khẩu đã lưu ở B1.

```bash
psql "postgresql://postgres:MAT_KHAU@db.abcdefgh.supabase.co:5432/postgres" \
  -f supabase/migrations/20260913000001_nen_tang_nguoi_dung.sql \
  -f supabase/migrations/20260913000002_kho_noi_dung.sql \
  -f supabase/migrations/20260913000003_hoc_tap_van_hanh.sql \
  -f supabase/migrations/20260914000004_xac_nhan_email.sql \
  -f supabase/seed.sql
```

### Cách 3 — dán vào SQL Editor *(chỉ cho migration)*

Dashboard → **SQL Editor** → **New query**. Mở lần lượt từng file migration,
chép toàn bộ, dán, bấm **Run**. Làm **đúng thứ tự 01 → 02 → 03 → 04**.

Riêng `seed.sql` thì vẫn phải dùng cách 1 hoặc 2.

### Kiểm tra đã nạp đúng

SQL Editor, chạy:

```sql
select (select count(*) from module) as module,
       (select count(*) from nut)    as nut,
       (select count(*) from lien_ket_nut) as lien_ket;
```

Phải ra **7 · 694 · 60**. Ra đúng ba số đó là xong phần nội dung.

> Chạy lại `seed.sql` nhiều lần không sao — id sinh cố định nên không tạo bản
> ghi trùng.

## B4. Khai báo địa chỉ website

**Authentication** → **URL Configuration**:

| Ô | Điền gì |
|---|---|
| **Site URL** | `http://localhost:8080` lúc đang làm; đổi thành tên miền thật khi đã lên mạng |
| **Redirect URLs** | Thêm từng dòng: `http://localhost:8080/**` và sau này `https://tenmien-cua-ban/**` |

**Bước này bắt buộc.** Không khai báo thì link trong email xác nhận sẽ bị
Supabase từ chối, người dùng bấm vào chỉ thấy lỗi.

## B5. Tạo tài khoản admin đầu tiên

Đăng ký một tài khoản qua chính website (`/dang-ky`) bằng email của anh. Sau đó
vào SQL Editor chạy — nhớ thay email:

```sql
-- 1. Duyệt cho chính mình
update public.ho_so
   set trang_thai = 'hoat_dong'
 where email = 'haquangthong14@gmail.com';

-- 2. Cấp vai trò admin
insert into public.vai_tro_nguoi_dung (user_id, vai_tro)
select id, 'admin' from public.ho_so
 where email = 'haquangthong14@gmail.com'
on conflict do nothing;
```

Đăng xuất rồi đăng nhập lại — thanh trên cùng sẽ có nút **Quản trị**.

> Lúc này chưa cấu hình email nên tài khoản có thể chưa xác nhận được. Nếu bị
> chặn vì lý do đó, chạy thêm:
> ```sql
> update auth.users set email_confirmed_at = now()
>  where email = 'haquangthong14@gmail.com';
> ```
> Chỉ dùng cách này cho tài khoản admin đầu tiên của chính anh, không dùng cho
> người khác.

## B6. Người thứ hai giữ quyền admin

Làm ngay, đừng để sau. Một người giữ khoá là rủi ro cho cả nhóm — ốm đau, mất
máy, quên mật khẩu là không ai vào được khu quản trị nữa.

Nhờ một anh/chị trong nhóm đăng ký, rồi chạy đúng hai câu SQL ở B5 với email
của họ.

## B7. Kiểm tra cả vòng

1. Mở **cửa sổ ẩn danh** của trình duyệt → `/dang-ky` → đăng ký bằng một email khác.
2. Vào tài khoản admin → `/quan-tri/duyet` → thấy hồ sơ vừa gửi, đọc được hai
   câu trả lời.
3. Bấm **Duyệt**.
4. Quay lại cửa sổ ẩn danh, đăng nhập → vào được `/hoc`.

Chạy trọn vòng này là phần B xong.

## B8. Đưa lên mạng bằng Netlify

1. Đẩy mã nguồn lên một kho **riêng tư** trên GitHub.
2. [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project** → chọn kho đó.
3. Netlify tự nhận cấu hình Vite. Kiểm tra cho đúng:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Site settings** → **Environment variables** → thêm đúng hai biến trong `.env`:
   `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. **Deploy**.
6. Quay lại Supabase → **URL Configuration** → đổi **Site URL** thành địa chỉ
   Netlify, và thêm `https://ten-site.netlify.app/**` vào **Redirect URLs**.

File `public/_redirects` đã có sẵn trong repo — nó làm cho các đường dẫn con
(`/cam-ket`, `/hoc/thuoc`…) không bị lỗi 404 khi tải lại trang.

> **Trước khi đưa cho người ngoài:** làm xong phần C. Không có email xác nhận
> thì người đăng ký sẽ mắc kẹt ở màn hình chờ.

---

# PHẦN C — Hòm thư của hệ thống

## C0. Ba loại email, đừng lẫn lộn

| Loại | Là gì | Ai lo |
|---|---|---|
| **Email hệ thống** (transactional) | Xác nhận đăng ký, đặt lại mật khẩu. Máy gửi tự động, một chiều, từ `no-reply@…` | Phần C này |
| **Hòm thư liên lạc** | `lienhe@…` — nơi người ta viết thư đến và có người thật đọc, trả lời | C7 |
| **Email hàng loạt** (marketing) | Gửi thư cho cả danh sách thành viên | Chưa cần, và nên cân nhắc kỹ trước khi làm |

Hai loại đầu **phải tách nhau**. Gửi email hệ thống từ một hòm thư thật sẽ làm
hỏng uy tín của hòm thư đó, và thư trả lời sẽ rơi vào hư không.

## C1. Vì sao không dùng được email mặc định của Supabase

Supabase có sẵn dịch vụ gửi email, nhưng theo tài liệu chính thức thì nó chỉ
dành cho thử nghiệm:

- **2 email mỗi giờ** — và Supabase nói rõ con số này có thể đổi bất cứ lúc nào.
- **Chỉ gửi được cho thành viên trong team** của project. Gửi cho địa chỉ khác
  sẽ báo lỗi *Email address not authorized*.
- **Không cam kết gì về việc thư có đến nơi hay không.**

Nghĩa là: với dịch vụ mặc định, người ngoài đăng ký sẽ **không bao giờ nhận
được email**. Bắt buộc phải cấu hình SMTP riêng.

## C2. Đăng ký Resend

Anh đã chọn Resend. Gói miễn phí: **3.000 email/tháng, tối đa 100 email/ngày,
1 tên miền, lưu nhật ký 30 ngày**. Với vài chục hồ sơ đăng ký mỗi tháng thì dư
sức.

1. Vào [resend.com](https://resend.com) → **Sign up**.
2. Xác nhận email tài khoản.

Chưa có tên miền vẫn dùng thử được ngay — xem C6.

## C3. Xác thực tên miền

Phần này cần tên miền. Khi nhóm đã chốt tên miền thì làm như sau.

Resend → **Domains** → **Add Domain**.

**Dùng tên miền con để gửi, đừng dùng tên miền gốc.** Ví dụ tên miền là
`vonsongtritue.vn` thì khai `send.vonsongtritue.vn`. Lý do: tách uy tín gửi thư
ra khỏi tên miền chính, và tránh đụng bản ghi MX của hòm thư liên lạc.

Resend sẽ hiện ra một danh sách bản ghi DNS. Thêm chúng vào nơi quản lý DNS của
tên miền:

| Loại | Tên | Dùng để làm gì |
|---|---|---|
| **MX** | `send` | Nhận báo thư hỏng, thư bị từ chối |
| **TXT** (SPF) | `send` | Cho phép hạ tầng của Resend gửi thư nhân danh tên miền |
| **CNAME** (DKIM) | ba bản ghi `…_domainkey` | Chữ ký số chứng minh thư không bị sửa giữa đường |

**Chép đúng giá trị Resend hiện ra trong dashboard của anh** — giá trị khác nhau
theo từng tên miền và từng vùng, đừng chép từ hướng dẫn nào khác.

Thêm xong, bấm **Verify**. DNS lan truyền thường mất 15 phút đến vài giờ, đôi
khi tới 24 giờ. Chưa xanh thì chờ rồi bấm lại, đừng sửa đi sửa lại.

### Thêm DMARC

Không bắt buộc để gửi, nhưng nên có — Gmail và Yahoo ngày càng khắt khe. Thêm
một bản ghi TXT nữa:

| Loại | Tên | Giá trị |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@tenmien-cua-ban;` |

`p=none` nghĩa là “chỉ theo dõi, chưa chặn gì”. Chạy vài tuần, xem báo cáo, ổn
rồi mới nâng lên `p=quarantine`. Nâng vội mà cấu hình chưa chuẩn thì thư thật
của mình cũng bị chặn.

## C4. Nối Resend vào Supabase

**Bước 1 — lấy API key.** Resend → **API Keys** → **Create API Key**. Quyền
*Sending access* là đủ. **Chép ngay và lưu lại** — key chỉ hiện một lần.

**Bước 2 — bật SMTP riêng.** Supabase → **Project Settings** → **Authentication**
→ mục **SMTP Settings** → bật **Enable Custom SMTP**, rồi điền:

| Ô | Điền |
|---|---|
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` — đúng chữ đó, không phải email của anh |
| **Password** | API key vừa tạo, **cả tiền tố `re_`** |
| **Sender email** | `no-reply@send.vonsongtritue.vn` — phải thuộc tên miền đã xác thực ở C3 |
| **Sender name** | `Vốn sống Trí tuệ` |

Bấm **Save**.

**Bước 3 — nới hạn mức.** Supabase đặt sẵn **30 email/giờ** sau khi bật SMTP
riêng. Vào **Authentication** → **Rate Limits** → mục *Rate limit for sending
emails*, nâng lên khoảng **100/giờ**. Đừng nâng quá cao — hạn mức chính là cái
chặn thiệt hại khi có người dùng máy đăng ký hàng loạt.

## C5. Dán mẫu email tiếng Việt

Mặc định Supabase gửi email bằng tiếng Anh. Repo có sẵn ba mẫu tiếng Việt trong
`supabase/email-templates/`.

**Authentication** → **Emails** → chọn từng mẫu, chép toàn bộ nội dung file dán
đè, sửa cả dòng **Subject**, rồi Save:

| File | Mẫu | Subject |
|---|---|---|
| `1-xac-nhan-dang-ky.html` | Confirm signup | `Xác nhận email để hoàn tất đăng ký — Vốn sống Trí tuệ` |
| `2-dat-lai-mat-khau.html` | Reset Password | `Đặt lại mật khẩu — Vốn sống Trí tuệ` |
| `3-doi-email.html` | Change Email Address | `Xác nhận địa chỉ email mới — Vốn sống Trí tuệ` |

Cả ba mẫu đều có sẵn một câu quan trọng: *việc học miễn phí, chúng tôi không bao
giờ hỏi mật khẩu, không nhờ chuyển tiền*. Câu đó vừa giữ đúng tinh thần của
nhóm, vừa là cách chặn người mạo danh sau này. Đừng xoá đi.

## C6. Khi chưa có tên miền

Chưa chốt tên miền thì vẫn làm việc được, nhưng biết rõ giới hạn:

**Cách tạm:** Resend cho gửi từ `onboarding@resend.dev` mà không cần tên miền —
nhưng **chỉ gửi được tới chính địa chỉ email đã đăng ký tài khoản Resend**. Đủ
để anh tự thử luồng đăng ký và đặt lại mật khẩu một mình.

**Không làm được:** cho các anh chị khác đăng ký thử. Thư sẽ không tới.

**Cũng đừng làm:** gửi email hệ thống từ Gmail. Được vài chục thư đầu rồi Google
sẽ chặn vì cho là gửi tự động, và tên miền `gmail.com` không ký DKIM nhân danh
website được nên thư rất dễ vào spam.

→ **Kết luận:** chốt tên miền trước khi mở đăng ký cho người ngoài. Trước đó cứ
làm phần A, B và soạn nội dung thoải mái.

## C7. Hòm thư để người ta viết thư đến

`no-reply@…` chỉ gửi đi. Nhưng người học sẽ trả lời email, và trang `/gop-y` cần
một nơi nhận — nhất là để nhận **tin báo có người mượn danh nhóm**, thứ mà tôi
để hẳn một mục riêng trên trang cam kết.

Vậy cần thêm một hòm thư thật, ví dụ `lienhe@vonsongtritue.vn`. Hai cách:

| Cách | Chi phí | Nhận xét |
|---|---|---|
| **Chuyển tiếp email** (email forwarding) | Thường miễn phí kèm tên miền | Thư gửi tới `lienhe@…` được chuyển vào Gmail cá nhân. Đơn giản nhất, nhưng trả lời thì hiện ra địa chỉ Gmail |
| **Zoho Mail** | Có gói miễn phí cho tên miền riêng | Hòm thư thật, trả lời đúng tên miền. Cấu hình lằng nhằng hơn một chút |

Với quy mô này, **chuyển tiếp email là đủ** cho lúc đầu. Nhớ để địa chỉ đó vào
phần chân trang và trang góp ý.

## C8. Kiểm tra trước khi mở cho người ngoài

Làm đủ, đừng bỏ bước nào:

- [ ] Mở cửa sổ ẩn danh, đăng ký bằng một **Gmail** → nhận được email trong 1 phút
- [ ] Email hiện **tiếng Việt**, có dấu đúng, tên người gửi là `Vốn sống Trí tuệ`
- [ ] Bấm link trong email → về trang `/xac-thuc` báo **“Đã xác thực email”**
- [ ] Bấm lại link đó lần nữa → báo link đã dùng rồi *(đúng như thiết kế)*
- [ ] Vào admin `/quan-tri/duyet` → hồ sơ đó có nhãn **Email đã xác nhận**
- [ ] Thử `/quen-mat-khau` → nhận email → đặt mật khẩu mới → đăng nhập được
- [ ] Lặp lại với một hòm **Outlook/Hotmail** và một hòm của nhà mạng Việt Nam
- [ ] Mỗi lần đều **xem cả hộp Spam** — vào spam là phải sửa, xem C9

Xem lịch sử gửi ở Resend → **Emails**: mỗi thư có trạng thái *Delivered*,
*Bounced* hay *Complained*.

## C9. Xử lý sự cố

### Email rơi vào Spam

Hay gặp nhất, và gần như luôn do một trong các nguyên nhân sau:

1. **DNS chưa xanh hết.** Vào Resend → Domains, cả ba bản ghi phải *Verified*.
2. **Chưa có DMARC.** Thêm bản ghi ở C3.
3. **Gửi từ tên miền gốc thay vì `send.…`** Đổi sang tên miền con.
4. **Tên miền còn quá mới.** Tên miền vừa đăng ký chưa có uy tín. Vài chục thư
   đầu vào spam là bình thường; đánh dấu *Not spam* và uy tín sẽ lên dần.
5. **Nội dung email.** Mẫu trong repo đã tránh sẵn những thứ dễ bị lọc: không ảnh
   ngoài, không chữ in hoa toàn bộ, không dấu chấm than, không rút gọn link.

### Không nhận được email nào

Lần theo đúng thứ tự này, đừng nhảy cóc:

1. Resend → **Emails**: có bản ghi nào không?
   - **Không có** → Supabase chưa gửi. Kiểm tra lại SMTP Settings ở C4; sai
     username (phải là `resend`) hoặc thiếu tiền tố `re_` trong API key là hai
     lỗi hay gặp nhất.
   - **Có, trạng thái Bounced** → địa chỉ nhận sai hoặc không tồn tại.
   - **Có, trạng thái Delivered** → thư đã tới, nằm trong Spam.
2. Kiểm tra **Sender email** có thuộc tên miền đã xác thực không.
3. Xem Supabase → **Logs** → **Auth Logs** tìm dòng lỗi.

### “Email rate limit exceeded”

Chạm hạn mức của Supabase. Nâng ở **Authentication → Rate Limits** (C4 bước 3).
Nếu chưa bật SMTP riêng thì hạn mức là 2/giờ — quay lại làm C4.

### Bấm link trong email ra trang lỗi hoặc về sai chỗ

Gần như chắc chắn là **Redirect URLs** chưa khai (B4). Phải có đủ:

```
http://localhost:8080/**
https://tenmien-that-cua-ban/**
```

Và **Site URL** phải là địa chỉ website thật, không còn là `localhost` sau khi
đã lên mạng.

### “Email link is invalid or has expired”

Link xác nhận sống 24 giờ, link đặt lại mật khẩu sống 1 giờ, và **mỗi link chỉ
dùng được một lần**. Website đã có sẵn lối thoát: người dùng đăng nhập lại sẽ
thấy nút **Gửi lại email xác nhận**, hoặc vào `/quen-mat-khau` xin link mới.

Một nguyên nhân ít ai ngờ: **phần mềm quét thư của cơ quan** tự bấm vào mọi link
trong email để kiểm tra an toàn, làm link bị dùng mất trước khi người thật kịp
bấm. Gặp trường hợp này thì bảo họ dùng email cá nhân.

## C10. Việc chưa làm — email báo khi được duyệt

Hiện tại người được duyệt **không nhận được thông báo** — họ phải tự vào website
kiểm tra. Nên có email báo, nhưng cần thêm một Edge Function gọi API của Resend,
chạy khi `ho_so.trang_thai` đổi sang `hoat_dong`.

Việc này chưa làm. Trong lúc chưa có, cách làm tạm: sau khi duyệt, admin
nhắn cho người đó qua Zalo hoặc điện thoại — số điện thoại đã có trong hồ sơ.
Mà thật ra, với nhóm học kiểu này, một tin nhắn thật từ người thật còn đúng tinh
thần hơn email máy gửi.

---

## Tóm tắt những gì phải giữ bí mật

| Thứ | Để đâu | Lộ ra thì sao |
|---|---|---|
| `anon key` | `.env`, biến môi trường Netlify | Không sao — RLS vẫn chặn |
| `service_role key` | **Không đưa vào website** | Nguy hiểm: bỏ qua toàn bộ RLS, đọc và sửa được mọi thứ |
| Mật khẩu database | Trình quản lý mật khẩu | Toàn quyền với cơ sở dữ liệu |
| API key Resend | Chỉ trong SMTP Settings của Supabase | Người khác gửi thư nhân danh tên miền của nhóm |

File `.env` đã nằm trong `.gitignore` — đừng bỏ ra.
