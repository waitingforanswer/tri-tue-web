/**
 * seed-gen.mjs — chuyển dữ liệu prototype thành seed cho Supabase.
 *
 *   node tools/extract.mjs <duong-dan-prototype.html>   → tools/out/prototype-data.json
 *   node tools/seed-gen.mjs                             → supabase/seed.sql
 *
 * UUID sinh theo v5 (namespace cố định) nên chạy lại nhiều lần vẫn ra cùng id
 * → seed idempotent, `on conflict do update` không tạo bản ghi trùng.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/out/prototype-data.json'), 'utf8'));

/* ── UUID v5 ─────────────────────────────────────────────────────────── */
const NS = 'f1a1c0de-7a11-5e11-9b00-56e17a11c0de'; // namespace riêng của dự án
const hexToBytes = (h) => Buffer.from(h.replace(/-/g, ''), 'hex');
function uuid5(name) {
  const h = crypto.createHash('sha1').update(Buffer.concat([hexToBytes(NS), Buffer.from(name, 'utf8')])).digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50;
  b[8] = (b[8] & 0x3f) | 0x80;
  const s = b.toString('hex');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/* ── Bộ gom nút ──────────────────────────────────────────────────────── */
const MODULES = [];
const NUTS = [];
const LINKS = [];

const mod = (slug, ten, mo_ta, icon, thu_tu) => {
  const id = uuid5('module:' + slug);
  MODULES.push({ id, slug, ten, mo_ta, icon, thu_tu, pham_vi: 'thanh_vien', trang_thai: 'xuat_ban' });
  return id;
};

/** khoa: chuỗi định danh duy nhất → uuid ổn định */
const nut = (khoa, o) => {
  const id = uuid5('nut:' + khoa);
  NUTS.push({
    id,
    loai: o.loai,
    cha_id: o.cha_id ?? null,
    module_id: o.module_id ?? null,
    ma: o.ma ?? null,
    tieu_de: o.tieu_de,
    tom_tat: o.tom_tat ?? null,
    noi_dung: o.noi_dung ?? null,
    nhan: o.nhan ?? null,
    du_lieu: o.du_lieu ?? {},
    thu_tu: o.thu_tu ?? 0,
    pham_vi: o.pham_vi ?? 'thanh_vien',
    trang_thai: 'xuat_ban',
  });
  return id;
};

const link = (tu_id, den_id, quan_he, thu_tu = 0) => LINKS.push({ tu_id, den_id, quan_he, thu_tu });
const loTag = (s) => String(s ?? '').replace(/<[^>]*>/g, '').trim();
const catNgan = (s, n = 160) => (loTag(s).length > n ? loTag(s).slice(0, n - 1) + '…' : loTag(s));

/* ══ 1 · MỞ ĐẦU ══════════════════════════════════════════════════════ */
const mModau = mod('mo-dau', 'Mở đầu', 'Vào cửa: Trí tuệ là gì, dùng vào lúc nào, ba điều nên biết trước khi bắt đầu', 'compass', 1);

D.BAM14.forEach((t, i) =>
  nut(`bam14:${i}`, { loai: 'bam_14', module_id: mModau, ma: D.BAM14ID[i], tieu_de: t, thu_tu: i,
    du_lieu: D.BAMY[D.BAM14ID[i]] ?? {} }));

/* ══ 2 · LỘ TRÌNH HỌC ════════════════════════════════════════════════ */
const mLoTrinh = mod('lo-trinh', 'Lộ trình học', 'Mạch 5 bước, 11 mục bổ trợ, ba giai đoạn và công thức học', 'route', 2);

D.NAMBUOC.forEach((b, i) => {
  const idB = nut(`buoc:${b.n}`, {
    loai: 'buoc', module_id: mLoTrinh, ma: `B${b.n}`, tieu_de: b.ten,
    tom_tat: b.dich, thu_tu: i, du_lieu: { mach: b.mach, tt: b.tt },
  });
  b.ds.forEach((d, j) =>
    nut(`buoc:${b.n}:y:${j}`, { loai: 'buoc_y', cha_id: idB, module_id: mLoTrinh, tieu_de: catNgan(d, 200), noi_dung: d, thu_tu: j }));
});

D.BOTRO.forEach((b, i) =>
  nut(`botro:${b.n}`, {
    loai: 'bo_tro', module_id: mLoTrinh, ma: `BT${b.n}`, tieu_de: b.ten,
    tom_tat: b.lam, thu_tu: i, nhan: b.trong ? 'trong' : null,
    du_lieu: { loai_bt: b.loai, khi: b.khi, di: b.di ?? null },
  }));

D.NHOMHOC.forEach((n, i) =>
  nut(`nhomhoc:${n.n}`, { loai: 'nhom_hoc', module_id: mLoTrinh, ma: `NH${n.n}`, tieu_de: n.t, tom_tat: n.g, thu_tu: i }));

D.CTHOC.forEach((c, i) =>
  nut(`cthoc:${i}`, { loai: 'cong_thuc_hoc', module_id: mLoTrinh, tieu_de: c.c, tom_tat: c.h, thu_tu: i }));

/* ══ 3 · SỐNG HẰNG NGÀY ══════════════════════════════════════════════ */
const mHangNgay = mod('song-hang-ngay', 'Sống hằng ngày', 'Một ngày chạy thế nào, phản xạ của người Trí tuệ, chu kỳ việc gì làm lúc nào', 'sun', 3);

D.CHUKY.forEach((c, i) =>
  nut(`chuky:${i}`, { loai: 'chu_ky', module_id: mHangNgay, tieu_de: c.t, thu_tu: i, du_lieu: { viec: c.v } }));

Object.entries(D.PHANXA).forEach(([k, v], i) =>
  nut(`phanxa:${k}`, { loai: 'phan_xa', module_id: mHangNgay, ma: k, tieu_de: v.t, thu_tu: i, du_lieu: { buoc: v.b } }));

D.CANHPHATSINH.forEach((c, i) =>
  nut(`canh:${i}`, { loai: 'canh_phat_sinh', module_id: mHangNgay, tieu_de: c.t, tom_tat: c.dh, noi_dung: c.ung, thu_tu: i }));

D.DATTENCANH.forEach((t, i) =>
  nut(`dattencanh:${i}`, { loai: 'dat_ten_canh', module_id: mHangNgay, tieu_de: catNgan(t), noi_dung: t, thu_tu: i }));

nut('khuonngoai', {
  loai: 'khuon_ngoai', module_id: mHangNgay, ma: 'khuon-ngoai',
  tieu_de: 'Khuôn bên ngoài — khi giao tiếp ra ngoài', du_lieu: D.KHUONNGOAI, thu_tu: 90,
});

/* ══ 4 · THƯỚC TRÍ TUỆ (giải vấn đề bất ổn) ═══════════════════════════ */
const mThuoc = mod('thuoc-tri-tue', 'Thước Trí tuệ', 'Bốn bước: định khối → khai thác → chọn góc độ tác động → sử dụng pháp', 'ruler', 4);

const idKhoi = {};
D.KHOI.forEach((k, i) => {
  const id = nut(`khoi:${k.id}`, {
    loai: 'khoi', module_id: mThuoc, ma: k.id, tieu_de: k.ten, tom_tat: k.mo, thu_tu: i,
  });
  idKhoi[k.id] = id;
  (k.vande ?? []).forEach((v, j) =>
    nut(`khoi:${k.id}:vande:${j}`, { loai: 'van_de', cha_id: id, module_id: mThuoc, tieu_de: v, thu_tu: j }));
  (k.khaithac ?? []).forEach((x, j) =>
    nut(`khoi:${k.id}:khaithac:${j}`, {
      loai: 'khai_thac', cha_id: id, module_id: mThuoc, tieu_de: x.y,
      tom_tat: x.chi, noi_dung: x.lam, thu_tu: j,
    }));
});

D.BIEUHIEN.forEach((b, i) => {
  const id = nut(`bieuhien:${i}`, {
    loai: 'bieu_hien', module_id: mThuoc, ma: `BH${i + 1}`, tieu_de: b.t, tom_tat: b.n, thu_tu: i,
  });
  (b.g ?? []).forEach((g, j) => idKhoi[g] && link(id, idKhoi[g], 'bieu_hien_khoi', j));
});

const idGocDo = {};
D.GOCDO.forEach((g, i) => {
  idGocDo[g.id] = nut(`gocdo:${g.id}`, {
    loai: 'goc_do', module_id: mThuoc, ma: g.id, tieu_de: g.ten, tom_tat: g.mo, thu_tu: i,
  });
});

D.PHAP.forEach((p, i) =>
  nut(`phap:${p.id}`, {
    loai: 'phap', module_id: mThuoc, ma: p.id, tieu_de: p.ten, tom_tat: p.mo, thu_tu: i,
    du_lieu: { khi: p.khi, lam: p.lam },
  }));

/* ══ 5 · CÂY KIẾN THỨC ═══════════════════════════════════════════════ */
const mCay = mod('cay-kien-thuc', 'Cây kiến thức', 'Quy chuẩn 11 phần — toàn bộ khung kiến thức Vốn sống Trí tuệ', 'tree', 5);

D.CAY.forEach((p) => {
  const idP = nut(`phan:${p.so}`, {
    loai: 'phan', module_id: mCay, ma: `P${p.so}`, tieu_de: p.ten, tom_tat: p.hoi, thu_tu: p.so,
  });
  (p.nhanh ?? []).forEach((n, j) => {
    const idN = nut(`phan:${p.so}:nhanh:${j}`, {
      loai: 'nhanh', cha_id: idP, module_id: mCay, ma: n.ma, tieu_de: n.ten,
      tom_tat: n.noi, nhan: n.nhan ?? null, thu_tu: j,
    });
    (n.ds ?? []).forEach((d, k) =>
      nut(`phan:${p.so}:nhanh:${j}:y:${k}`, {
        loai: 'y', cha_id: idN, module_id: mCay, tieu_de: catNgan(d, 200), noi_dung: d, thu_tu: k,
      }));
  });
});

/* ══ 6 · THƯ VIỆN KHUÔN ══════════════════════════════════════════════ */
// LƯU Ý: trong prototype có dòng `KHUON.push(...KHUON_THEM)`, nên mảng KHUON
// lúc trích ra ĐÃ chứa cả KHUON_THEM. Duyệt thêm KHUON_THEM nữa là nhân đôi.
const KHUON_GOP = D.KHUON;
const mKhuon = mod('thu-vien-khuon', 'Thư viện khuôn',
  `${KHUON_GOP.length} khuôn đưa Trí tuệ vào từng khối của cuộc sống`, 'layout', 6);

const idKhuon = {};
KHUON_GOP.forEach((k, i) => {
  const id = nut(`khuon:${k.id}`, {
    loai: 'khuon', module_id: mKhuon, ma: k.id, tieu_de: k.ten, tom_tat: k.nra, thu_tu: k.so ?? i,
    du_lieu: { so: k.so, nhom: k.nhom, giai: k.giai ?? [], bam: k.bam ?? [], chu_ky: k.chuky ?? null },
  });
  idKhuon[k.id] = id;
  (k.lam ?? []).forEach((l, j) =>
    nut(`khuon:${k.id}:viec:${j}`, { loai: 'viec', cha_id: id, module_id: mKhuon, tieu_de: catNgan(l, 200), noi_dung: l, thu_tu: j }));
});

D.KHUONKHOI.forEach((k, i) =>
  nut(`khuonkhoi:${k.id}`, {
    loai: 'khuon_khoi', module_id: mKhuon, ma: k.id, tieu_de: k.ten, thu_tu: i,
    du_lieu: { ung_dung: k.ud ?? [], them: k.them ?? [], bam: k.bam ?? [] },
  }));

// Ánh xạ: chọn góc độ tác động nào thì hệ thống gợi ra khuôn nào
Object.entries(D.ANHXA).forEach(([g, ds]) => {
  const tu = idGocDo[g];
  if (!tu) return;
  ds.forEach((kid, j) => idKhuon[kid] && link(tu, idKhuon[kid], 'goc_do_khuon', j));
});

/* ══ 7 · TỪ ĐIỂN ═════════════════════════════════════════════════════ */
const mTuDien = mod('tu-dien', 'Từ điển thuật ngữ', 'Thuật ngữ cốt lõi và những cặp câu từ dễ nhầm', 'book', 7);

const slug = (s) => loTag(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

D.TUDIEN.forEach((g, i) => {
  const idG = nut(`nhomtu:${slug(g.nhom)}`, {
    loai: 'nhom_tu', module_id: mTuDien, ma: slug(g.nhom), tieu_de: g.nhom, thu_tu: i,
  });
  (g.tu ?? []).forEach(([t, ng], j) =>
    nut(`tu:${slug(g.nhom)}:${slug(t)}`, {
      loai: 'tu', cha_id: idG, module_id: mTuDien, ma: slug(t), tieu_de: t, tom_tat: ng, thu_tu: j,
    }));
});

D.THUCTE7.forEach((c, i) =>
  nut(`capnham:${i}`, { loai: 'cap_de_nham', module_id: mTuDien, tieu_de: c.t, tom_tat: c.h, thu_tu: i }));

Object.entries(D.BAMY).forEach(([k, v], i) =>
  nut(`ybam:${k}`, { loai: 'y_bam', module_id: mTuDien, ma: k, tieu_de: v.t, tom_tat: v.n, thu_tu: i, du_lieu: { phan: v.p ?? null } }));

/* ══ Xuất ra SQL ═════════════════════════════════════════════════════ */
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

let sql = `-- ═══════════════════════════════════════════════════════════════════
-- seed.sql — SINH TỰ ĐỘNG bởi tools/seed-gen.mjs. ĐỪNG SỬA TAY.
-- Nguồn: prototype "Thước Trí tuệ" (7 tài liệu Trí tuệ trong project).
-- Chạy lại an toàn: id sinh theo UUID v5 nên luôn ổn định.
--   ${MODULES.length} module · ${NUTS.length} nút · ${LINKS.length} liên kết
-- ═══════════════════════════════════════════════════════════════════
begin;

`;

sql += '-- ── MODULE ──────────────────────────────────────────────────────\n';
for (const m of MODULES) {
  sql += `insert into public.module (id, slug, ten, mo_ta, icon, thu_tu, pham_vi, trang_thai) values (${q(m.id)}, ${q(m.slug)}, ${q(m.ten)}, ${q(m.mo_ta)}, ${q(m.icon)}, ${m.thu_tu}, ${q(m.pham_vi)}::public.pham_vi, ${q(m.trang_thai)}::public.trang_thai_nd)\n  on conflict (id) do update set ten = excluded.ten, mo_ta = excluded.mo_ta, thu_tu = excluded.thu_tu;\n`;
}

sql += '\n-- ── NÚT (chèn theo tầng để khoá ngoại cha_id luôn hợp lệ) ───────\n';
// sắp xếp: cha trước con
const byId = new Map(NUTS.map((n) => [n.id, n]));
const depth = (n) => { let d = 0, c = n; while (c.cha_id && byId.has(c.cha_id)) { c = byId.get(c.cha_id); d++; if (d > 20) break; } return d; };
const sorted = [...NUTS].sort((a, b) => depth(a) - depth(b));
for (const n of sorted) {
  sql += `insert into public.nut (id, loai, cha_id, module_id, ma, tieu_de, tom_tat, noi_dung, nhan, du_lieu, thu_tu, pham_vi, trang_thai) values (${q(n.id)}, ${q(n.loai)}, ${q(n.cha_id)}, ${q(n.module_id)}, ${q(n.ma)}, ${q(n.tieu_de)}, ${q(n.tom_tat)}, ${q(n.noi_dung)}, ${q(n.nhan)}, ${j(n.du_lieu)}, ${n.thu_tu}, ${q(n.pham_vi)}::public.pham_vi, ${q(n.trang_thai)}::public.trang_thai_nd)\n  on conflict (id) do update set tieu_de = excluded.tieu_de, tom_tat = excluded.tom_tat, noi_dung = excluded.noi_dung, nhan = excluded.nhan, du_lieu = excluded.du_lieu, thu_tu = excluded.thu_tu;\n`;
}

sql += '\n-- ── LIÊN KẾT ────────────────────────────────────────────────────\n';
for (const l of LINKS) {
  sql += `insert into public.lien_ket_nut (tu_id, den_id, quan_he, thu_tu) values (${q(l.tu_id)}, ${q(l.den_id)}, ${q(l.quan_he)}, ${l.thu_tu}) on conflict do nothing;\n`;
}

sql += '\ncommit;\n';

fs.writeFileSync(path.join(ROOT, 'supabase/seed.sql'), sql);

fs.mkdirSync(path.join(ROOT, 'src/data'), { recursive: true });

/* Kiểm tra trước khi ghi: `ma` phải duy nhất trong phạm vi nút cha
   (khớp chỉ mục nut_ma_trong_cha_uniq trong migration 02). */
const thay = new Map();
for (const n of NUTS) {
  if (!n.ma) continue;
  const k = `${n.cha_id ?? '·'}|${n.loai}|${n.ma}`;
  if (thay.has(k)) {
    console.error(`✗ TRÙNG MÃ: loai=${n.loai} ma=${n.ma} trong cùng một nút cha`);
    console.error(`  ${thay.get(k)}\n  ${n.tieu_de}`);
    process.exit(1);
  }
  thay.set(k, n.tieu_de);
}

const dem = {};
for (const n of NUTS) dem[n.loai] = (dem[n.loai] ?? 0) + 1;

// Số liệu nhỏ, nhúng thẳng vào bundle để trang chủ không phải tải cả kho
fs.writeFileSync(
  path.join(ROOT, 'src/data/so-lieu.ts'),
  `/* SINH TỰ ĐỘNG bởi tools/seed-gen.mjs — đừng sửa tay. */\n` +
    `export const SO_LIEU = ${JSON.stringify(
      { module: MODULES.length, nut: NUTS.length, lienKet: LINKS.length, theoLoai: dem },
      null,
      2
    )} as const;\n`
);
console.log('→ src/data/so-lieu.ts');
console.log(`✓ ${MODULES.length} module · ${NUTS.length} nút · ${LINKS.length} liên kết`);
console.log('  ' + Object.entries(dem).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join('  '));
console.log('→ supabase/seed.sql');
