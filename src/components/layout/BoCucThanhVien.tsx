import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookMarked, Compass, FileText, Home, Layers, LogOut, Menu, NotebookPen,
  Route, Search, Shield, Sun, TreeDeciduous, User, X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DoiNen } from './DoiNen';
import { cn } from '@/lib/utils';

const NHOM: { nhan?: string; muc: { den: string; ten: string; Icon: typeof Home; cuoi?: boolean }[] }[] = [
  { muc: [{ den: '/hoc', ten: 'Tổng quan', Icon: Home, cuoi: true }] },
  {
    nhan: 'Làm gì hôm nay',
    muc: [
      { den: '/hoc/lo-trinh', ten: 'Đang học', Icon: Route },
      { den: '/hoc/song-hang-ngay', ten: 'Sống hằng ngày', Icon: Sun },
      { den: '/hoc/thuoc', ten: 'Có vấn đề bất ổn', Icon: Compass },
    ],
  },
  {
    nhan: 'Tra cứu',
    muc: [
      { den: '/hoc/cay-kien-thuc', ten: 'Cây kiến thức', Icon: TreeDeciduous },
      { den: '/hoc/thu-vien-khuon', ten: 'Thư viện khuôn', Icon: Layers },
      { den: '/hoc/tu-dien', ten: 'Từ điển thuật ngữ', Icon: BookMarked },
    ],
  },
  {
    nhan: 'Của tôi',
    muc: [
      { den: '/hoc/phieu', ten: 'Phiếu ứng dụng', Icon: FileText },
      { den: '/hoc/ghi-chu', ten: 'Ghi chú', Icon: NotebookPen },
      { den: '/hoc/ho-so', ten: 'Hồ sơ', Icon: User },
    ],
  },
];

export function BoCucThanhVien() {
  const { hoSo, laQuanTri, dangXuat } = useAuth();
  const [tim, setTim] = useState('');
  const [moRay, setMoRay] = useState(false);
  const dieuHuong = useNavigate();

  const guiTim = (e: React.FormEvent) => {
    e.preventDefault();
    if (tim.trim().length >= 2) dieuHuong(`/hoc/tim?q=${encodeURIComponent(tim.trim())}`);
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* ── Ray điều hướng ─────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[248px] shrink-0 overflow-y-auto border-r border-vien bg-giay',
          'transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          moRay ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-vien px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-nhan text-than font-semibold text-white">T</span>
            <span className="font-chu text-than font-semibold leading-tight">Vốn sống Trí tuệ</span>
          </Link>
          <button onClick={() => setMoRay(false)} className="ml-auto text-nhat lg:hidden" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-5 p-3">
          {NHOM.map((n, i) => (
            <div key={i}>
              {n.nhan && (
                <div className="mb-1.5 px-2.5 text-mac font-semibold uppercase text-nhat">
                  {n.nhan}
                </div>
              )}
              <div className="space-y-0.5">
                {n.muc.map(({ den, ten, Icon, cuoi }) => (
                  <NavLink
                    key={den}
                    to={den}
                    end={cuoi}
                    onClick={() => setMoRay(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-ghi transition-colors',
                        isActive ? 'bg-nhan-nhe font-medium text-nhan' : 'text-nhat hover:bg-muc/5 hover:text-muc'
                      )
                    }
                  >
                    <Icon size={15} strokeWidth={1.9} />
                    {ten}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-vien p-3">
          {laQuanTri && (
            <Link
              to="/quan-tri"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-ghi text-nhat hover:bg-muc/5 hover:text-muc"
            >
              <Shield size={15} strokeWidth={1.9} /> Khu quản trị
            </Link>
          )}
          <button
            onClick={() => void dangXuat()}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-ghi text-nhat hover:bg-muc/5 hover:text-muc"
          >
            <LogOut size={15} strokeWidth={1.9} /> Đăng xuất
          </button>
        </div>
      </aside>

      {moRay && (
        <div className="fixed inset-0 z-40 bg-muc/25 lg:hidden" onClick={() => setMoRay(false)} aria-hidden />
      )}

      {/* ── Thân ───────────────────────────────────────────────────── */}
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-vien bg-nen/85 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setMoRay(true)} className="text-nhat lg:hidden" aria-label="Mở menu">
            <Menu size={18} />
          </button>

          <form onSubmit={guiTim} className="relative max-w-lg flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-nhat" />
            <input
              value={tim}
              onChange={(e) => setTim(e.target.value)}
              type="search"
              placeholder="Tìm trong kho Trí tuệ — thử: nghiệp, điểm tựa, tùy duyên…"
              className="h-10 w-full rounded-lg border border-vien bg-giay pl-9 pr-3 text-sm placeholder:text-nhat/70 focus:border-nhan/40 focus:outline-none focus:ring-2 focus:ring-nhan/15"
            />
          </form>

          <DoiNen />
          <span className="hidden text-ghi text-nhat sm:block">{hoSo?.ho_ten}</span>
        </div>

        <div className="px-4 py-8 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
