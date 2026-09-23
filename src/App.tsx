import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { thieuCauHinh } from '@/lib/supabase';
import { AuthProvider } from '@/hooks/useAuth';
import { CanDuyet, CanQuyen } from '@/components/guards/Cong';
import { QUYEN } from '@/lib/quyen';

import { BoCucCongKhai } from '@/components/layout/BoCucCongKhai';
import { BoCucThanhVien } from '@/components/layout/BoCucThanhVien';
import { BoCucQuanTri } from '@/components/layout/BoCucQuanTri';

/* ── Tầng 1 · công khai ─────────────────────────────────────────────── */
import TrangChu from '@/pages/cong-khai/TrangChu';
import ThieuCauHinh from '@/pages/ThieuCauHinh';
import BangMau from '@/pages/BangMau';
import { BaiViet, CamKet, CauHoi, GopY, HocTheNao, TriTueLaGi } from '@/pages/cong-khai/TrangTinh';
import {
  ChoDuyet, DangKy, DangNhap, KhongDuocDuyet, KhongTimThay, ThieuQuyen,
} from '@/pages/cong-khai/TaiKhoan';
import { DatLaiMatKhau, QuenMatKhau, XacThuc } from '@/pages/cong-khai/Email';

/* ── Tầng 2 · khu học ───────────────────────────────────────────────── */
import TongQuan from '@/pages/hoc/TongQuan';
import Thuoc from '@/pages/hoc/Thuoc';
import TimKiem from '@/pages/hoc/TimKiem';
import { CayKienThuc, ThuVienKhuon, TuDien } from '@/pages/hoc/TraCuu';
import { LoTrinh, SongHangNgay } from '@/pages/hoc/LamHomNay';
import { GhiChu, HoSo, Phieu } from '@/pages/hoc/CuaToi';

/* ── Tầng 3 · quản trị ──────────────────────────────────────────────── */
import BangDieuKhien from '@/pages/quan-tri/BangDieuKhien';
import { Duyet, PhanQuyen, ThanhVien } from '@/pages/quan-tri/ConNguoi';
import { BaiVietQL, KhoNoiDung, ModuleQL, TrangQL } from '@/pages/quan-tri/NoiDung';
import { GopYQL, NhatKyQL } from '@/pages/quan-tri/VanHanh';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60_000, refetchOnWindowFocus: false } },
});

export default function App() {
  // Thiếu biến môi trường thì dừng ở đây và nói rõ thiếu cái gì — thà trắng
  // màn hình có giải thích còn hơn chạy tiếp rồi lỗi rải rác khắp nơi.
  if (thieuCauHinh) return <ThieuCauHinh />;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Bảng mẫu hệ thống giao diện — không nằm trong menu, dùng nội bộ */}
            <Route path="/bang-mau" element={<BangMau />} />

            {/* ══ TẦNG 1 — ai cũng vào được ══════════════════════════ */}
            <Route element={<BoCucCongKhai />}>
              <Route path="/" element={<TrangChu />} />
              <Route path="/tri-tue-la-gi" element={<TriTueLaGi />} />
              <Route path="/hoc-the-nao" element={<HocTheNao />} />
              <Route path="/cam-ket" element={<CamKet />} />
              <Route path="/cau-hoi" element={<CauHoi />} />
              <Route path="/bai-viet" element={<BaiViet />} />
              <Route path="/gop-y" element={<GopY />} />
              <Route path="/dang-ky" element={<DangKy />} />
              <Route path="/dang-nhap" element={<DangNhap />} />
              <Route path="/cho-duyet" element={<ChoDuyet />} />
              <Route path="/khong-duoc-duyet" element={<KhongDuocDuyet />} />
              {/* Ba địa chỉ dưới đây phải khai trong Supabase → Redirect URLs */}
              <Route path="/xac-thuc" element={<XacThuc />} />
              <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
              <Route path="/dat-lai-mat-khau" element={<DatLaiMatKhau />} />
              <Route path="*" element={<KhongTimThay />} />
            </Route>

            {/* ══ TẦNG 2 — thành viên đã được duyệt ══════════════════ */}
            <Route
              path="/hoc"
              element={
                <CanDuyet>
                  <BoCucThanhVien />
                </CanDuyet>
              }
            >
              <Route index element={<TongQuan />} />
              <Route path="lo-trinh" element={<LoTrinh />} />
              <Route path="song-hang-ngay" element={<SongHangNgay />} />
              <Route path="thuoc" element={<Thuoc />} />
              <Route path="cay-kien-thuc" element={<CayKienThuc />} />
              <Route path="thu-vien-khuon" element={<ThuVienKhuon />} />
              <Route path="tu-dien" element={<TuDien />} />
              <Route path="tim" element={<TimKiem />} />
              <Route path="phieu" element={<Phieu />} />
              <Route path="ghi-chu" element={<GhiChu />} />
              <Route path="ho-so" element={<HoSo />} />
              <Route path="*" element={<Navigate to="/hoc" replace />} />
            </Route>

            {/* ══ TẦNG 3 — admin & sub-admin ═════════════════════════ */}
            <Route
              path="/quan-tri"
              element={
                <CanQuyen>
                  <BoCucQuanTri />
                </CanQuyen>
              }
            >
              <Route index element={<CanQuyen quyen={QUYEN.XEM_THONG_KE}><BangDieuKhien /></CanQuyen>} />
              <Route path="duyet" element={<CanQuyen quyen={QUYEN.QL_THANH_VIEN}><Duyet /></CanQuyen>} />
              <Route path="thanh-vien" element={<CanQuyen quyen={QUYEN.QL_THANH_VIEN}><ThanhVien /></CanQuyen>} />
              <Route path="phan-quyen" element={<CanQuyen chiAdmin><PhanQuyen /></CanQuyen>} />
              <Route path="kho" element={<CanQuyen quyen={QUYEN.ND_SUA}><KhoNoiDung /></CanQuyen>} />
              <Route path="module" element={<CanQuyen quyen={QUYEN.QL_MODULE}><ModuleQL /></CanQuyen>} />
              <Route path="trang" element={<CanQuyen quyen={QUYEN.QL_TRANG}><TrangQL /></CanQuyen>} />
              <Route path="bai-viet" element={<CanQuyen quyen={QUYEN.QL_BAI_VIET}><BaiVietQL /></CanQuyen>} />
              <Route path="gop-y" element={<CanQuyen quyen={QUYEN.QL_GOP_Y}><GopYQL /></CanQuyen>} />
              <Route path="nhat-ky" element={<CanQuyen quyen={QUYEN.XEM_NHAT_KY}><NhatKyQL /></CanQuyen>} />
              <Route path="thieu-quyen" element={<ThieuQuyen />} />
              <Route path="*" element={<Navigate to="/quan-tri" replace />} />
            </Route>
          </Routes>

          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
