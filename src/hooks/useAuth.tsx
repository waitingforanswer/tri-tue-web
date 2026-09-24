import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { sb } from '@/lib/supabase';
import { QUYEN_SUB_ADMIN, TAT_CA_QUYEN, type MaQuyen } from '@/lib/quyen';
import type { HoSo, VaiTro } from '@/types/kho';

interface NgLieuAuth {
  dangTai: boolean;
  daDangNhap: boolean;
  hoSo: HoSo | null;
  vaiTro: VaiTro[];
  quyen: MaQuyen[];
  laAdmin: boolean;
  laQuanTri: boolean;
  daDuyet: boolean;
  coQuyen: (ma: MaQuyen) => boolean;
  napLai: () => Promise<void>;
  dangNhap: (email: string, matKhau: string) => Promise<void>;
  dangKy: (t: DangKyInput) => Promise<void>;
  dangXuat: () => Promise<void>;
  guiLaiXacNhan: (email: string) => Promise<void>;
  guiEmailDatLaiMatKhau: (email: string) => Promise<void>;
  datLaiMatKhau: (matKhauMoi: string) => Promise<void>;
}

export interface DangKyInput {
  email: string;
  matKhau: string;
  ho_ten: string;
  dien_thoai?: string;
  ly_do_hoc?: string;
  van_de_dang_gap?: string;
  nguoi_gioi_thieu?: string;
  cam_ket: boolean;
}

const Ctx = createContext<NgLieuAuth | null>(null);

/**
 * Địa chỉ Supabase quay về sau khi người dùng bấm link trong email.
 * Dùng origin lúc chạy nên cùng một bản build chạy được cả localhost lẫn tên
 * miền thật. Nhớ khai trong Supabase → Authentication → URL Configuration.
 */
const veLai = (duong: string) => `${window.location.origin}${duong}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [dangTai, setDangTai] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [vaiTro, setVaiTro] = useState<VaiTro[]>([]);
  const [quyenRieng, setQuyenRieng] = useState<MaQuyen[]>([]);

  const napHoSo = useCallback(async (id: string, lan = 0): Promise<void> => {
    const [{ data: hs, error: e1 }, { data: vt, error: e2 }, { data: qr, error: e3 }] = await Promise.all([
      sb().from('ho_so').select('*').eq('id', id).maybeSingle(),
      sb().from('vai_tro_nguoi_dung').select('vai_tro').eq('user_id', id),
      sb().from('quyen_nguoi_dung').select('quyen_ma').eq('user_id', id).eq('cho_phep', true),
    ]);
    /* Ngay sau khi đăng nhập, token mới có thể bị PostgREST từ chối vài trăm ms
     * (401 · PGRST303 — lệch đồng hồ). Trước đây lỗi bị nuốt và vai trò thành
     * rỗng → admin mất quyền trên giao diện. Nay: giữ nguyên trạng thái cũ và thử lại. */
    if (e1 || e2 || e3) {
      if (lan < 3) {
        await new Promise((r) => setTimeout(r, 600 * (lan + 1)));
        return napHoSo(id, lan + 1);
      }
      console.error('Không nạp được hồ sơ / vai trò:', e1 ?? e2 ?? e3);
      return;
    }
    setHoSo((hs as HoSo) ?? null);
    setVaiTro(((vt ?? []) as { vai_tro: VaiTro }[]).map((r) => r.vai_tro));
    setQuyenRieng(((qr ?? []) as { quyen_ma: MaQuyen }[]).map((r) => r.quyen_ma));
  }, []);

  const xoaPhien = useCallback(() => {
    setUid(null);
    setHoSo(null);
    setVaiTro([]);
    setQuyenRieng([]);
  }, []);

  useEffect(() => {
    let huy = false;

    sb().auth.getSession().then(async ({ data }) => {
      if (huy) return;
      if (data.session?.user) {
        setUid(data.session.user.id);
        await napHoSo(data.session.user.id);
      }
      setDangTai(false);
    });

    const { data: sub } = sb().auth.onAuthStateChange((_e, phien) => {
      if (phien?.user) {
        setUid(phien.user.id);
        void napHoSo(phien.user.id);
      } else {
        xoaPhien();
      }
    });

    return () => {
      huy = true;
      sub.subscription.unsubscribe();
    };
  }, [napHoSo, xoaPhien]);

  const napLai = useCallback(async () => {
    if (uid) await napHoSo(uid);
  }, [uid, napHoSo]);

  const laAdmin = vaiTro.includes('admin');
  const laQuanTri = laAdmin || vaiTro.includes('sub_admin');
  const daDuyet = hoSo?.trang_thai === 'hoat_dong';

  const quyen = useMemo<MaQuyen[]>(() => {
    if (laAdmin) return TAT_CA_QUYEN;
    if (!vaiTro.includes('sub_admin')) return [];
    return Array.from(new Set([...QUYEN_SUB_ADMIN, ...quyenRieng]));
  }, [laAdmin, vaiTro, quyenRieng]);

  const coQuyen = useCallback((ma: MaQuyen) => laAdmin || quyen.includes(ma), [laAdmin, quyen]);

  /* ── Hành động ─────────────────────────────────────────────────── */
  const dangNhap = useCallback(async (email: string, matKhau: string) => {
    const { error } = await sb().auth.signInWithPassword({ email, password: matKhau });
    if (error) throw error;
  }, []);

  const dangKy = useCallback(async (t: DangKyInput) => {
    const { error } = await sb().auth.signUp({
      email: t.email,
      password: t.matKhau,
      options: {
        emailRedirectTo: veLai('/xac-thuc'),
        data: {
          ho_ten: t.ho_ten,
          dien_thoai: t.dien_thoai ?? null,
          ly_do_hoc: t.ly_do_hoc ?? null,
          van_de_dang_gap: t.van_de_dang_gap ?? null,
          nguoi_gioi_thieu: t.nguoi_gioi_thieu ?? null,
          cam_ket: t.cam_ket,
        },
      },
    });
    if (error) throw error;
  }, []);

  const dangXuat = useCallback(async () => {
    await sb().auth.signOut();
  }, []);

  const guiLaiXacNhan = useCallback(async (email: string) => {
    const { error } = await sb().auth.resend({
      type: 'signup', email, options: { emailRedirectTo: veLai('/xac-thuc') },
    });
    if (error) throw error;
  }, []);

  const guiEmailDatLaiMatKhau = useCallback(async (email: string) => {
    const { error } = await sb().auth.resetPasswordForEmail(email, {
      redirectTo: veLai('/dat-lai-mat-khau'),
    });
    if (error) throw error;
  }, []);

  const datLaiMatKhau = useCallback(async (matKhauMoi: string) => {
    const { error } = await sb().auth.updateUser({ password: matKhauMoi });
    if (error) throw error;
  }, []);

  const gia: NgLieuAuth = {
    dangTai,
    daDangNhap: Boolean(uid),
    hoSo,
    vaiTro,
    quyen,
    laAdmin,
    laQuanTri,
    daDuyet,
    coQuyen,
    napLai,
    dangNhap,
    dangKy,
    dangXuat,
    guiLaiXacNhan,
    guiEmailDatLaiMatKhau,
    datLaiMatKhau,
  };

  return <Ctx.Provider value={gia}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth phải nằm trong <AuthProvider>');
  return c;
}
