/**
 * kiem-lop.mjs — canh cho hệ thống giao diện không bị trôi.
 *
 * Tailwind KHÔNG báo lỗi khi gặp class không hợp lệ: nó im lặng bỏ qua, và
 * chỗ đó mất luôn kiểu dáng mà không ai biết. Đã có bốn lỗi như vậy lọt vào
 * bản v0.2 — thanh dính mất nền, ô nhập mất viền lúc chọn.
 *
 * Script này quét mã nguồn và bắt ba loại sai:
 *   1. Độ mờ ngoài thang đã khai   (bg-muc/8 khi 8 chưa khai)
 *   2. Cỡ chữ tuỳ ý                (text-[13.5px] thay vì text-ghi)
 *   3. Tên màu không có trong bảng (text-xanh)
 *
 * Chạy: node tools/kiem-lop.mjs   — đã gắn sẵn vào `npm run lint`
 */
import fs from 'node:fs';
import path from 'node:path';

const GOC = path.resolve(import.meta.dirname, '..');

/* ── Đọc thang cho phép thẳng từ tailwind.config.ts ──────────────────── */
const cfg = fs.readFileSync(path.join(GOC, 'tailwind.config.ts'), 'utf8');

const MAU = [...cfg.matchAll(/^\s*'?([a-z-]+)'?:\s*'hsl\(var\(--/gm)].map((m) => m[1]);
const MO_THEM = [...(cfg.match(/opacity:\s*\{([^}]*)\}/)?.[1] ?? '').matchAll(/(\d+):/g)].map((m) => +m[1]);
const CO_CHU = [...(cfg.match(/fontSize:\s*\{([\s\S]*?)\n      \}/)?.[1] ?? '').matchAll(/^\s*'?([a-z-]+)'?:\s*\[/gm)].map((m) => m[1]);

const MO_MAC_DINH = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
const MO_OK = new Set([...MO_MAC_DINH, ...MO_THEM]);
const MAU_OK = new Set([...MAU, 'white', 'black', 'transparent', 'current', 'inherit']);

/* ── Quét mã nguồn ───────────────────────────────────────────────────── */
const tep = [];
(function quet(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) quet(p);
    else if (/\.tsx?$/.test(e.name)) tep.push(p);
  }
})(path.join(GOC, 'src'));

const loi = [];
const bao = (f, dong, loai, chiTiet) =>
  loi.push({ f: path.relative(GOC, f), dong, loai, chiTiet });

const TIEN_ICH = 'bg|text|border|ring|divide|outline|placeholder|from|to|via|shadow|decoration|accent|caret|fill|stroke';

/**
 * Những đuôi đi sau bg- / text- / border- / ring- mà KHÔNG phải tên màu —
 * đây là tiện ích sẵn có của Tailwind (căn lề, kiểu viền, cỡ chữ mặc định…).
 */
const KHONG_PHAI_MAU = new RegExp(
  '^(' +
    // căn chỉnh & xử lý chữ
    'left|right|center|justify|start|end|wrap|nowrap|balance|pretty|clip|ellipsis|' +
    // cỡ chữ mặc định của Tailwind
    'xs|sm|base|lg|xl|[2-9]xl|' +
    // kiểu viền và bảng
    'solid|dashed|dotted|double|hidden|none|collapse|separate|spacing(-.+)?|' +
    // nền
    'cover|contain|auto|fixed|local|scroll|repeat(-.+)?|no-repeat|origin(-.+)?|' +
    'blend(-.+)?|gradient-to-(t|b|l|r|tl|tr|bl|br)|top|bottom|' +
    // ring
    'inset|offset(-.+)?|' +
    // số (border-2, ring-1…) và hướng (border-t…)
    '[0-9]+|t|b|l|r|x|y|s|e' +
  ')$'
);

for (const f of tep) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((d, i) => {
    // bỏ qua dòng chú thích
    if (/^\s*(\/\/|\*|\/\*)/.test(d)) return;

    for (const m of d.matchAll(new RegExp(`\\b(?:${TIEN_ICH})-([a-z-]+)\\/(\\d+)\\b`, 'g'))) {
      if (!MO_OK.has(+m[2])) bao(f, i + 1, 'độ mờ ngoài thang', `${m[0]} — thang cho phép: ${[...MO_OK].sort((a, b) => a - b).join(', ')}`);
    }
    for (const m of d.matchAll(/\btext-\[[\d.]+(px|rem|em)\]/g)) {
      bao(f, i + 1, 'cỡ chữ tuỳ ý', `${m[0]} — dùng một trong: ${CO_CHU.join(', ')}`);
    }
    for (const m of d.matchAll(new RegExp(`\\b(?:bg|text|border|ring)-([a-z]+(?:-[a-z]+)*)(?=[\\s"'\`/]|$)`, 'g'))) {
      const ten = m[1];
      if (CO_CHU.includes(ten)) continue;         // là bậc chữ, không phải màu
      if (KHONG_PHAI_MAU.test(ten)) continue;     // là tiện ích sẵn có của Tailwind
      if (!MAU_OK.has(ten)) bao(f, i + 1, 'tên màu lạ', `${m[0]} — bảng màu: ${[...MAU_OK].join(', ')}`);
    }
  });
}

/* ── Báo cáo ─────────────────────────────────────────────────────────── */
if (!loi.length) {
  console.log(`✓ Giao diện đúng hệ thống — ${tep.length} file, ${MAU.length} màu, ${CO_CHU.length} bậc chữ.`);
  process.exit(0);
}

const theoLoai = {};
for (const l of loi) (theoLoai[l.loai] ??= []).push(l);

console.error(`✗ ${loi.length} chỗ lệch khỏi hệ thống giao diện:\n`);
for (const [loai, ds] of Object.entries(theoLoai)) {
  console.error(`  ── ${loai.toUpperCase()} (${ds.length}) ──`);
  for (const l of ds.slice(0, 12)) console.error(`     ${l.f}:${l.dong}  ${l.chiTiet}`);
  if (ds.length > 12) console.error(`     … và ${ds.length - 12} chỗ nữa`);
  console.error('');
}
console.error('  Sửa ở mã nguồn, hoặc khai thêm vào tailwind.config.ts nếu thật sự cần.');
process.exit(1);
