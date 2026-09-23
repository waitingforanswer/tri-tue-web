# Hệ thống giao diện

> v0.3 · 15/09/2026 · xem tận mắt tại **`/bang-mau`** trên website

Tài liệu này để làm hai việc:

1. **Giữ giao diện đều tay** — mọi màu, cỡ chữ, khối đều lấy từ một chỗ.
2. **Cho chúng ta một ngôn ngữ chung** — để nói “sửa M2 bậc `text-than`” thay
   vì “chữ chỗ đó hơi nhỏ”.

---

## Ba lớp, đừng lẫn

Khi muốn đổi gì, trước hết xác định nó nằm ở lớp nào — vì mỗi lớp sửa một chỗ
khác nhau và tốn công khác nhau.

| Lớp | Là gì | Sửa ở đâu | Đổi một lần ảnh hưởng |
|---|---|---|---|
| **1 · Token** | Màu, cỡ chữ, bo góc, bóng | `src/index.css` + `tailwind.config.ts` | Toàn bộ website |
| **2 · Thành phần** | Nút, thẻ, ô nhập, chip | `src/components/ui/` | Mọi chỗ dùng thành phần đó |
| **3 · Bố cục** | Sắp xếp khối trên từng trang, hình ảnh | `src/pages/` | Riêng trang đó |

Lớp 1 và 2 hiện đã ổn định — anh Thong đã duyệt màu và kiểu chữ. Phần còn
đang mở là **lớp 3**: bố cục tổng thể của tầng 1.

---

## Lớp 1 · Token

### Màu — 9 màu

Giá trị thật là biến CSS trong `src/index.css`, khai hai lần: một cho nền
sáng, một cho nền tối. **Đổi ở đó, đừng viết mã màu thẳng vào component.**

| Token | Việc |
|---|---|
| `nen` | Nền trang |
| `giay` | Nền thẻ, ô nhập — nổi lên trên nền trang |
| `muc` | Chữ chính |
| `nhat` | Chữ phụ, chú thích |
| `vien` | Đường viền, đường kẻ chia |
| `nhan` | Màu nhấn (xanh ngọc trầm) — nút chính, link, mục đang chọn |
| `nhan-nhe` | Nền vùng được nhấn |
| `am` | Màu ấm (đất nung) — **chỉ** để nhắc nhở, cảnh báo |
| `canh` | Nền dịu cho khối lưu ý |

**Quy tắc màu ấm:** dùng nhiều thì mất tác dụng. Hiện chỉ ba chỗ được dùng:
email chưa xác nhận, nhãn “bản gốc còn trống”, và khối cảnh báo.

### Chữ — 11 bậc

Trước v0.3 có **25 cỡ chữ tuỳ ý** rải khắp mã nguồn (`text-[13.5px]`,
`text-[14px]`, `text-[15.5px]`…). Giờ mỗi bậc có tên và có việc:

| Bậc | Cỡ | Dùng cho |
|---|---|---|
| `text-hero` | 31→46px co giãn | Tiêu đề trang chủ |
| `text-de-bia` | 26→34px co giãn | Tiêu đề trang tĩnh |
| `text-de-lon` | 28px | Tiêu đề trang |
| `text-de-vua` | 22px | Tiêu đề mục lớn |
| `text-de-nho` | 19px | Tiêu đề mục |
| `text-dan` | 16.5px | Đoạn dẫn dưới tiêu đề |
| `text-than` | 15px | Chữ thân chính |
| `text-phu` | 14.5px | Chữ phụ cỡ lớn |
| `text-ghi` | 13.5px | Chú thích, dòng meta |
| `text-vi` | 12.5px | Chú thích nhỏ |
| `text-mac` | 11.5px | Nhãn chữ hoa, chip |

Mỗi bậc đã kèm sẵn chiều cao dòng và độ giãn chữ — **không thêm `tracking-*`
hay `leading-*` lên trên nữa**, sẽ đè mất.

> **Vì sao tên bậc không trùng tên màu:** Tailwind sinh class theo tên. Nếu có
> bậc chữ tên `nhan` thì `text-nhan` vừa là cỡ chữ vừa là màu, áp cả hai cùng
> lúc. Đó là lý do bậc nhỏ nhất tên là `mac` chứ không phải `nhan`.

### Kiểu chữ — 2 bộ

| Lớp | Phông | Dùng |
|---|---|---|
| `font-sans` | Be Vietnam Pro | Mọi chữ thường. Vẽ riêng cho tiếng Việt |
| `font-chu` | Noto Serif | Tiêu đề, tên gọi. Tự áp cho `h1`, `h2`, `h3` |

Phông dự phòng của `font-chu` là **Times New Roman trước Georgia** — Georgia
thiếu nhiều chữ có dấu tiếng Việt (ữ, ệ, ẳ…) nên máy phải mượn phông khác cho
từng chữ, nhìn lộm cộm. `font-synthesis-weight: none` cũng đã bật để trình
duyệt không tự bôi đậm giả, vì chữ có dấu bôi giả thì dấu dính vào thân chữ.

### Bo góc, bóng, độ mờ

| Nhóm | Giá trị cho phép |
|---|---|
| Bo góc | `rounded-lg` (8px) · `rounded-xl` (14px, mặc định của thẻ) · `rounded-2xl` (20px) · `rounded-full` |
| Đổ bóng | `shadow-nhe` (thẻ nghỉ) · `shadow-noi` (thẻ nổi, khi rê chuột) |
| Độ mờ | 0, 5, **8**, 10, **15**, 20, 25, 30, 40, 50, 60, 70, 75, 80, **85**, 90, 95, 100 |

Ba giá trị in đậm là bổ sung riêng của dự án. **Viết độ mờ ngoài thang thì
Tailwind im lặng bỏ qua** — không báo lỗi, chỉ mất kiểu dáng. Xem mục cuối.

---

## Lớp 2 · Thành phần

Tất cả nằm ở `src/components/ui/`. Xem đầy đủ ở `/bang-mau`.

| Thành phần | File | Ghi chú |
|---|---|---|
| `Button` | `button.tsx` | 5 kiểu: `chinh`, `vien`, `mo`, `nhan`, `canhbao` · 4 cỡ |
| `The` | `co-ban.tsx` | Thẻ nội dung |
| `Nhan` | `co-ban.tsx` | Chip tròn |
| `O`, `OVung` | `co-ban.tsx` | Ô nhập một dòng / nhiều dòng |
| `DongNhan` | `co-ban.tsx` | Nhãn của ô nhập, kèm dòng giải thích |
| `TieuDeMuc` | `co-ban.tsx` | Tiêu đề mục + dòng phụ |
| `Trong` | `co-ban.tsx` | Trạng thái chưa có gì |
| `DangTai` | `co-ban.tsx` | Khung xám lúc đang tải |
| `ChiNhan` | `kho/ChiNhan.tsx` | Nhãn nguồn gốc nội dung |
| `VanGoc` | `kho/ChiNhan.tsx` | Render nguyên văn tài liệu, giữ `<b>`, `<em>` |

### Quy tắc dùng

**Mỗi màn hình một nút chính.** Nhiều nút `chinh` cạnh nhau thì không còn cái
nào là chính.

**Không phải khối nào cũng là thẻ.** Viền, nền, bo góc, bóng — mỗi thứ đều nói
“đây là vật riêng”. Dùng cả bốn cho mọi khối thì bẹt hết, không còn phân biệt
cái nào quan trọng.

**Nhãn nằm trên ô nhập, không nằm trong ô.** Chữ gợi ý trong ô biến mất khi
người ta bắt đầu gõ — người lớn tuổi hay quên mất ô đó hỏi gì.

**Nút ghi đúng việc nó làm.** “Gửi hồ sơ”, không phải “Xác nhận”.

---

## Lớp 3 · Bố cục

Đây là phần đang mở để bàn. Xem mục **Cách góp ý** bên dưới.

Hiện tại tầng 1 xếp theo thứ tự: mở đầu → bảy khối bất ổn → “đây không phải là
gì” → học thế nào → vì sao phải duyệt → kết. Thứ tự này có chủ đích: nói rõ
mình không phải cái gì **trước** khi mời đăng ký.

Nếu đổi bố cục, giữ nguyên nguyên tắc đó.

---

## Cách góp ý cho nhanh

Theo thứ tự hiệu quả:

### 1. Gửi ảnh hoặc link — nhanh nhất

Thấy website nào có cảm giác đúng ý thì **chụp màn hình hoặc gửi link**. Không
cần giải thích gì thêm. Nhìn ảnh là hiểu được bố cục, mật độ, cách dùng ảnh,
nhịp của trang — những thứ tả bằng lời rất khó.

Cũng làm được với chính website này: chụp màn hình, khoanh bút đỏ chỗ muốn
sửa, gửi kèm một câu.

### 2. Chọn giữa các phương án

Khi chưa rõ mình muốn gì, nói “dựng cho tôi vài phương án” — sẽ có mấy bản
khác nhau đặt cạnh nhau, cùng nội dung thật, chỉ khác bố cục. Nhìn rồi chọn,
hoặc ghép: “lấy phần mở đầu của A, phần khối của B”.

### 3. Gọi tên theo bảng mẫu — cho sửa nhỏ

Khi đã chốt hướng và chỉ muốn tinh chỉnh, mở `/bang-mau` và gọi tên:

> “M1 — màu nhấn đậm hơn một chút”
> “M2 — bậc `text-than` tăng lên 16px”
> “M4 — nút `vien` bo góc tròn hơn”

### Ba câu hỏi giúp tả bố cục dễ hơn

Khi muốn đổi bố cục mà chưa biết nói sao, trả lời ba câu này là đủ:

- **Thoáng hay dày?** Nhiều khoảng trắng, ít chữ mỗi màn — hay dày đặc thông tin?
- **Có ảnh không?** Hiện tại website **không có ảnh nào**, toàn chữ và khối.
  Muốn có ảnh thì ảnh gì — người thật đang học, cảnh vật, hình vẽ minh hoạ, hay
  chỉ hoa văn trang trí?
- **Trang chủ mở ra thấy gì đầu tiên?** Một câu lớn? Một câu hỏi? Một tấm ảnh?
  Hay vào thẳng bảy khối bất ổn để người ta tự nhận ra mình?

---

## Canh cho hệ thống không bị trôi

```bash
npm run lint              # eslint + kiểm tra hệ thống giao diện
npm run kiem-giao-dien    # chỉ kiểm tra giao diện
```

`tools/kiem-lop.mjs` quét mã nguồn và chặn ba loại sai:

1. **Độ mờ ngoài thang** — `bg-muc/8` khi 8 chưa khai
2. **Cỡ chữ tuỳ ý** — `text-[13.5px]` thay vì `text-ghi`
3. **Tên màu lạ** — `text-xanh`

Bộ kiểm tra này có vì một lý do cụ thể: **Tailwind không báo lỗi khi gặp class
không hợp lệ.** Nó im lặng bỏ qua, và chỗ đó mất kiểu dáng mà không ai biết.
Bản v0.2 đã có bốn lỗi như vậy lọt qua:

| Lỗi | Hậu quả |
|---|---|
| `bg-nen/85` (3 thanh dính) | Thanh trên cùng **không có nền** — nội dung trôi xuyên qua khi cuộn |
| `ring-nhan/15` (5 ô nhập) | **Mọi ô nhập** không có viền sáng lúc chọn |
| `border-nhan/15` | Đường kẻ trong thẻ ở trang chủ biến mất |
| `bg-muc/8` | Nhãn “Ứng dụng” không có nền |

Cả bốn đều không báo lỗi gì khi chạy. Đó là lý do phải có máy canh.
