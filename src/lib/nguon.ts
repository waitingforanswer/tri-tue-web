/**
 * nguon.ts — LỚP TRUY CẬP DỮ LIỆU DUY NHẤT của ứng dụng.
 *
 * Mọi màn hình gọi qua đây, không gọi thẳng supabase. Đổi backend sau này chỉ
 * sửa một file. RLS ở phía Postgres vẫn là hàng rào thật; lớp này chỉ là tiện ích.
 */
import { sb } from '@/lib/supabase';
import { boDau } from '@/lib/utils';
import { SO_LIEU } from '@/data/so-lieu';
import type {
  BaiViet, GhiChu, GopY, HoSo, KetQuaTim, LienKet, Module, NhatKy,
  Nut, PhieuUngDung, TrangThaiTV,
} from '@/types/kho';

/* ══ KHO NỘI DUNG ═══════════════════════════════════════════════════ */

export async function layModule(): Promise<Module[]> {
  const { data, error } = await sb().from('module').select('*').order('thu_tu');
  if (error) throw error;
  return data as Module[];
}

export async function layModuleTheoSlug(slug: string): Promise<Module | null> {
  return (await layModule()).find((m) => m.slug === slug) ?? null;
}

export interface LocNut {
  module?: string;
  loai?: string | string[];
  cha?: string | null;
}

export async function layNut(loc: LocNut = {}): Promise<Nut[]> {
  let q = sb().from('nut').select('*');
  if (loc.module) q = q.eq('module_id', loc.module);
  if (loc.loai) q = Array.isArray(loc.loai) ? q.in('loai', loc.loai) : q.eq('loai', loc.loai);
  if (loc.cha === null) q = q.is('cha_id', null);
  else if (loc.cha) q = q.eq('cha_id', loc.cha);
  const { data, error } = await q.order('thu_tu');
  if (error) throw error;
  return data as Nut[];
}

export async function layNutTheoMa(loai: string, ma: string): Promise<Nut | null> {
  const { data, error } = await sb().from('nut').select('*').eq('loai', loai).eq('ma', ma).maybeSingle();
  if (error) throw error;
  return (data as Nut) ?? null;
}

const sapXep = (a: Nut, b: Nut) => a.thu_tu - b.thu_tu || a.tieu_de.localeCompare(b.tieu_de, 'vi');

/** Lấy cả cây con của một module (dùng cho Cây kiến thức, Thư viện khuôn). */
export async function layCay(module_id: string): Promise<{ nut: Nut[]; theoCha: Map<string | null, Nut[]> }> {
  const ds = await layNut({ module: module_id });
  const theoCha = new Map<string | null, Nut[]>();
  for (const n of ds) {
    if (!theoCha.has(n.cha_id)) theoCha.set(n.cha_id, []);
    theoCha.get(n.cha_id)!.push(n);
  }
  for (const v of theoCha.values()) v.sort(sapXep);
  return { nut: ds, theoCha };
}

/* ── Soạn nội dung (tầng 3) ──────────────────────────────────────────
 * RLS chặn bằng cách "không khớp dòng nào" chứ không báo lỗi — nên luôn
 * .select() lại để biết thật sự có dòng nào được ghi hay không. */

export type SuaNutInput = Partial<
  Pick<Nut, 'ma' | 'tieu_de' | 'tom_tat' | 'noi_dung' | 'nhan' | 'thu_tu' | 'pham_vi' | 'trang_thai' | 'du_lieu'>
>;

export async function suaNut(id: string, t: SuaNutInput): Promise<Nut> {
  const { data, error } = await sb().from('nut').update(t).eq('id', id).select('*');
  if (error) throw error;
  if (!data?.length) throw new Error('Không lưu được — tài khoản chưa có quyền sửa mục này.');
  const moi = data[0] as Nut;
  // Trigger chan_tu_xuat_ban lặng lẽ giữ nguyên phạm vi/trạng thái nếu thiếu quyền ND_XUAT_BAN
  if ((t.pham_vi && moi.pham_vi !== t.pham_vi) || (t.trang_thai && moi.trang_thai !== t.trang_thai)) {
    throw new Error('Đã lưu nội dung, nhưng đổi phạm vi / trạng thái cần quyền ND_XUAT_BAN.');
  }
  return moi;
}

export type ThemNutInput = Pick<Nut, 'loai' | 'tieu_de' | 'pham_vi' | 'trang_thai'> &
  Partial<Pick<Nut, 'cha_id' | 'module_id' | 'ma' | 'tom_tat' | 'noi_dung' | 'nhan' | 'thu_tu'>>;

export async function themNut(t: ThemNutInput): Promise<Nut> {
  const { data: phien } = await sb().auth.getUser();
  const { data, error } = await sb()
    .from('nut')
    .insert({ ...t, tao_boi: phien.user?.id ?? null, sua_boi: phien.user?.id ?? null })
    .select('*');
  if (error) {
    if (error.code === '23505') throw new Error('Mã này đã có trong cùng mục cha. Chọn mã khác.');
    throw error;
  }
  if (!data?.length) throw new Error('Không thêm được — tài khoản chưa có quyền soạn nội dung.');
  return data[0] as Nut;
}

export async function layLienKet(quan_he: string, tu_id?: string): Promise<LienKet[]> {
  let q = sb().from('lien_ket_nut').select('*').eq('quan_he', quan_he);
  if (tu_id) q = q.eq('tu_id', tu_id);
  const { data, error } = await q.order('thu_tu');
  if (error) throw error;
  return data as LienKet[];
}

export async function timKiem(tu: string, gioiHan = 60): Promise<KetQuaTim[]> {
  const q = boDau(tu.trim());
  if (q.length < 2) return [];

  const [mods, { data, error }] = await Promise.all([
    layModule(),
    sb().from('nut').select('*').like('tu_khoa', `%${q}%`).limit(gioiHan),
  ]);
  if (error) throw error;

  const ds = data as Nut[];
  const theoId = new Map(ds.map((x) => [x.id, x]));
  const tenModule = new Map(mods.map((m) => [m.id, m.ten]));

  return ds.map((n) => {
    const duong: string[] = [];
    let c: Nut | undefined = n;
    for (let i = 0; c?.cha_id && theoId.has(c.cha_id) && i < 6; i++) {
      c = theoId.get(c.cha_id)!;
      duong.unshift(c.ma ?? c.tieu_de);
    }
    const m = n.module_id ? tenModule.get(n.module_id) : undefined;
    return { nut: n, duong: [m, ...duong].filter(Boolean).join(' · ') };
  });
}

export async function demTheoLoai(): Promise<Record<string, number>> {
  const ds = await layNut();
  const dem: Record<string, number> = {};
  for (const n of ds) dem[n.loai] = (dem[n.loai] ?? 0) + 1;
  return dem;
}

/** Số liệu tĩnh cho trang chủ — nhúng sẵn lúc build, không phải gọi DB. */
export const soLieuTinh = { module: SO_LIEU.module, nut: SO_LIEU.nut, lienKet: SO_LIEU.lienKet };

/* ══ THÀNH VIÊN (tầng 3) ════════════════════════════════════════════ */

export async function layHoSo(trang_thai?: TrangThaiTV): Promise<HoSo[]> {
  let q = sb().from('ho_so').select('*');
  if (trang_thai) q = q.eq('trang_thai', trang_thai);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return data as HoSo[];
}

export async function duyetThanhVien(user_id: string, trang_thai: TrangThaiTV, ghi_chu?: string) {
  const { error } = await sb().rpc('duyet_thanh_vien', {
    _user_id: user_id,
    _trang_thai: trang_thai,
    _ghi_chu: ghi_chu ?? null,
  });
  if (error) throw error;
}

export async function thongKe(): Promise<Record<string, number>> {
  const { data, error } = await sb().rpc('thong_ke_tong_quan');
  if (error) throw error;
  return (data ?? {}) as Record<string, number>;
}

export async function layNhatKy(gioiHan = 100): Promise<NhatKy[]> {
  const { data, error } = await sb()
    .from('nhat_ky').select('*').order('created_at', { ascending: false }).limit(gioiHan);
  if (error) throw error;
  return data as NhatKy[];
}

/* ══ GÓP Ý ══════════════════════════════════════════════════════════ */

export async function guiGopY(t: { ho_ten: string; email?: string; dien_thoai?: string; noi_dung: string }) {
  const { error } = await sb().from('gop_y').insert({
    ho_ten: t.ho_ten,
    email: t.email || null,
    dien_thoai: t.dien_thoai || null,
    noi_dung: t.noi_dung,
  });
  if (error) throw error;
}

export async function layGopY(): Promise<GopY[]> {
  const { data, error } = await sb()
    .from('gop_y').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as GopY[];
}

export async function xuLyGopY(id: string, trang_thai: GopY['trang_thai'], phan_hoi?: string) {
  const { error } = await sb().from('gop_y')
    .update({ trang_thai, phan_hoi: phan_hoi ?? null }).eq('id', id);
  if (error) throw error;
}

/* ══ CỦA NGƯỜI HỌC (riêng tư, RLS chỉ cho chủ tài khoản) ═══════════ */

export async function layPhieu(): Promise<PhieuUngDung[]> {
  const { data, error } = await sb()
    .from('phieu_ung_dung').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as PhieuUngDung[];
}

export async function luuPhieu(p: Omit<PhieuUngDung, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data: phien } = await sb().auth.getUser();
  if (!phien.user) throw new Error('Chưa đăng nhập.');
  const { error } = await sb().from('phieu_ung_dung').insert({ ...p, user_id: phien.user.id });
  if (error) throw error;
}

export async function xoaPhieu(id: string) {
  const { error } = await sb().from('phieu_ung_dung').delete().eq('id', id);
  if (error) throw error;
}

export async function layGhiChu(): Promise<GhiChu[]> {
  const { data, error } = await sb()
    .from('ghi_chu').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as GhiChu[];
}

export async function luuGhiChu(noi_dung: string, nut_id?: string | null) {
  const { data: phien } = await sb().auth.getUser();
  if (!phien.user) throw new Error('Chưa đăng nhập.');
  const { error } = await sb().from('ghi_chu')
    .insert({ noi_dung, nut_id: nut_id ?? null, user_id: phien.user.id });
  if (error) throw error;
}

export async function xoaGhiChu(id: string) {
  const { error } = await sb().from('ghi_chu').delete().eq('id', id);
  if (error) throw error;
}

export async function capNhatHoSo(t: Partial<Pick<HoSo, 'ho_ten' | 'dien_thoai'>>) {
  const { data: phien } = await sb().auth.getUser();
  if (!phien.user) throw new Error('Chưa đăng nhập.');
  const { error } = await sb().from('ho_so').update(t).eq('id', phien.user.id);
  if (error) throw error;
}

/* ══ BÀI VIẾT ═══════════════════════════════════════════════════════ */

export async function layBaiViet(): Promise<BaiViet[]> {
  const { data, error } = await sb()
    .from('bai_viet').select('*')
    .eq('trang_thai', 'xuat_ban')
    .order('xuat_ban_luc', { ascending: false });
  if (error) throw error;
  return data as BaiViet[];
}
