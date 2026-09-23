import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * HỆ THỐNG GIAO DIỆN — nguồn sự thật duy nhất.
 * Mọi màu, cỡ chữ, bo góc, đổ bóng đều khai ở đây và chỉ ở đây.
 * Xem docs/HE-THONG-GIAO-DIEN.md để biết dùng cái nào lúc nào,
 * và mở /bang-mau trên website để nhìn tận mắt.
 */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1180px' } },
    extend: {
      /* ── Màu ───────────────────────────────────────────────────
         Giá trị thật nằm ở biến CSS trong src/index.css, nên đổi
         màu một lần là cả sáng lẫn tối đều đổi theo.              */
      colors: {
        nen: 'hsl(var(--nen))',          // nền trang
        giay: 'hsl(var(--giay))',        // nền thẻ, khối nội dung
        muc: 'hsl(var(--muc))',          // chữ chính
        nhat: 'hsl(var(--nhat))',        // chữ phụ
        vien: 'hsl(var(--vien))',        // đường viền
        nhan: 'hsl(var(--nhan))',        // màu nhấn — xanh ngọc trầm
        'nhan-nhe': 'hsl(var(--nhan-nhe))',
        am: 'hsl(var(--am))',            // màu ấm — dùng rất tiết chế
        canh: 'hsl(var(--canh))',        // nền nhắc nhở
      },

      /* ── Độ mờ ─────────────────────────────────────────────────
         Thang mặc định của Tailwind KHÔNG có 8, 15, 85. Viết
         bg-muc/8 mà không khai ở đây thì class im lặng không sinh
         ra CSS — lỗi đã từng xảy ra. Thêm đủ, và tools/kiem-lop.mjs
         canh để không tái diễn.                                   */
      opacity: { 8: '0.08', 15: '0.15', 85: '0.85' },

      /* ── Cỡ chữ ────────────────────────────────────────────────
         Mười một bậc, mỗi bậc một việc. Không dùng text-[__px] nữa. */
      fontSize: {
        // KHÔNG đặt tên bậc chữ trùng tên màu (nhan, muc, nhat…) — Tailwind sẽ
        // sinh ra hai class cùng tên và áp cả cỡ chữ lẫn màu cùng lúc.
        mac: ['11.5px', { lineHeight: '1.45', letterSpacing: '0.06em' }], // chữ trên nhãn, chip
        vi: ['12.5px', { lineHeight: '1.5' }],      // chú thích rất nhỏ
        ghi: ['13.5px', { lineHeight: '1.55' }],    // chữ phụ, dòng meta
        phu: ['14.5px', { lineHeight: '1.65' }],    // chữ phụ cỡ lớn
        than: ['15px', { lineHeight: '1.7' }],      // chữ thân chính
        dan: ['16.5px', { lineHeight: '1.65' }],    // đoạn dẫn dưới tiêu đề
        'de-nho': ['19px', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        'de-vua': ['22px', { lineHeight: '1.3', letterSpacing: '-0.012em' }],
        'de-lon': ['28px', { lineHeight: '1.22', letterSpacing: '-0.015em' }],
        'de-bia': ['clamp(26px, 4.2vw, 34px)', { lineHeight: '1.18', letterSpacing: '-0.018em' }],
        hero: ['clamp(31px, 5.2vw, 46px)', { lineHeight: '1.12', letterSpacing: '-0.022em' }],
      },

      fontFamily: {
        // Be Vietnam Pro vẽ riêng cho tiếng Việt — dấu đặt đúng chỗ, không chồng lên nhau
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Times New Roman đứng trước Georgia: Georgia thiếu nhiều chữ có dấu tiếng Việt
        // (ữ, ệ, ẳ…) nên máy phải mượn phông khác cho từng chữ, nhìn lộm cộm
        chu: ['"Noto Serif"', '"Times New Roman"', 'Times', 'Georgia', 'serif'],
      },

      borderRadius: { xl: '14px', '2xl': '20px' },

      boxShadow: {
        nhe: '0 1px 2px hsl(var(--muc) / 0.05), 0 8px 24px -16px hsl(var(--muc) / 0.18)',
        noi: '0 2px 6px hsl(var(--muc) / 0.06), 0 18px 40px -24px hsl(var(--muc) / 0.28)',
      },

      keyframes: {
        'hien-len': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { 'hien-len': 'hien-len .35s ease-out both' },
    },
  },
  plugins: [animate],
} satisfies Config;
