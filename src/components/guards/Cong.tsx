/**
 * Cổng chắn route — hàng rào thứ nhất (trải nghiệm).
 * Hàng rào thật nằm ở RLS trong Postgres: kể cả gọi thẳng API cũng không
 * lấy được nội dung tầng 2 nếu hồ sơ chưa ở trạng thái 'hoat_dong'.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { MaQuyen } from '@/lib/quyen';

function DangCho() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-nhat">Đang mở cửa…</div>
  );
}

export function CanDangNhap({ children }: { children: React.ReactNode }) {
  const { dangTai, daDangNhap } = useAuth();
  const vt = useLocation();
  if (dangTai) return <DangCho />;
  if (!daDangNhap) return <Navigate to="/dang-nhap" state={{ tu: vt.pathname }} replace />;
  return <>{children}</>;
}

/** Tầng 2 — chỉ thành viên đã được admin duyệt. */
export function CanDuyet({ children }: { children: React.ReactNode }) {
  const { dangTai, daDangNhap, daDuyet, hoSo } = useAuth();
  const vt = useLocation();
  if (dangTai) return <DangCho />;
  if (!daDangNhap) return <Navigate to="/dang-nhap" state={{ tu: vt.pathname }} replace />;
  if (!daDuyet) {
    return <Navigate to={hoSo?.trang_thai === 'tu_choi' ? '/khong-duoc-duyet' : '/cho-duyet'} replace />;
  }
  return <>{children}</>;
}

/** Tầng 3 — admin và sub-admin, kèm quyền chi tiết nếu cần. */
export function CanQuyen({
  children,
  quyen,
  chiAdmin = false,
}: {
  children: React.ReactNode;
  quyen?: MaQuyen;
  chiAdmin?: boolean;
}) {
  const { dangTai, daDangNhap, laQuanTri, laAdmin, coQuyen } = useAuth();
  const vt = useLocation();
  if (dangTai) return <DangCho />;
  if (!daDangNhap) return <Navigate to="/dang-nhap" state={{ tu: vt.pathname }} replace />;
  if (!laQuanTri) return <Navigate to="/" replace />;
  if (chiAdmin && !laAdmin) return <Navigate to="/quan-tri/thieu-quyen" replace />;
  if (quyen && !coQuyen(quyen)) return <Navigate to="/quan-tri/thieu-quyen" replace />;
  return <>{children}</>;
}
