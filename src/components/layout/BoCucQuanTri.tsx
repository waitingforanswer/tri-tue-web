import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen, FileStack, GaugeCircle, Inbox, KeyRound, Layers, Menu,
  MessageSquare, ScrollText, UserCheck, Users, X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { QUYEN, type MaQuyen } from '@/lib/quyen';
import { DoiNen } from './DoiNen';
import { cn } from '@/lib/utils';

type Muc = { den: string; ten: string; Icon: typeof Users; quyen?: MaQuyen; chiAdmin?: boolean; cuoi?: boolean };

const NHOM: { nhan: string; muc: Muc[] }[] = [
  {
    nhan: 'Tổng quan',
    muc: [{ den: '/quan-tri', ten: 'Bảng điều khiển', Icon: GaugeCircle, quyen: QUYEN.XEM_THONG_KE, cuoi: true }],
  },
  {
    nhan: 'Con người',
    muc: [
      { den: '/quan-tri/duyet', ten: 'Chờ duyệt', Icon: UserCheck, quyen: QUYEN.QL_THANH_VIEN },
      { den: '/quan-tri/thanh-vien', ten: 'Thành viên', Icon: Users, quyen: QUYEN.QL_THANH_VIEN },
      { den: '/quan-tri/phan-quyen', ten: 'Vai trò & quyền', Icon: KeyRound, chiAdmin: true },
    ],
  },
  {
    nhan: 'Nội dung',
    muc: [
      { den: '/quan-tri/kho', ten: 'Kho Trí tuệ', Icon: BookOpen, quyen: QUYEN.ND_SUA },
      { den: '/quan-tri/module', ten: 'Module học', Icon: Layers, quyen: QUYEN.QL_MODULE },
      { den: '/quan-tri/trang', ten: 'Trang công khai', Icon: FileStack, quyen: QUYEN.QL_TRANG },
      { den: '/quan-tri/bai-viet', ten: 'Bài viết', Icon: MessageSquare, quyen: QUYEN.QL_BAI_VIET },
    ],
  },
  {
    nhan: 'Vận hành',
    muc: [
      { den: '/quan-tri/gop-y', ten: 'Góp ý', Icon: Inbox, quyen: QUYEN.QL_GOP_Y },
      { den: '/quan-tri/nhat-ky', ten: 'Nhật ký', Icon: ScrollText, quyen: QUYEN.XEM_NHAT_KY },
    ],
  },
];

export function BoCucQuanTri() {
  const { hoSo, laAdmin, coQuyen } = useAuth();
  const [moRay, setMoRay] = useState(false);

  const duocVao = (m: Muc) => (m.chiAdmin ? laAdmin : m.quyen ? coQuyen(m.quyen) : true);

  return (
    <div className="min-h-screen bg-nen lg:grid lg:grid-cols-[240px_1fr]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[240px] overflow-y-auto border-r border-vien bg-giay',
          'transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          moRay ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-vien px-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-muc text-ghi font-semibold text-nen">QT</span>
          <div className="leading-tight">
            <div className="font-chu text-phu font-semibold">Khu quản trị</div>
            <div className="text-mac text-nhat">{laAdmin ? 'Admin' : 'Sub-admin'}</div>
          </div>
          <button onClick={() => setMoRay(false)} className="ml-auto text-nhat lg:hidden" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-5 p-3">
          {NHOM.map((n) => {
            const muc = n.muc.filter(duocVao);
            if (!muc.length) return null;
            return (
              <div key={n.nhan}>
                <div className="mb-1.5 px-2.5 text-mac font-semibold uppercase text-nhat">{n.nhan}</div>
                <div className="space-y-0.5">
                  {muc.map(({ den, ten, Icon, cuoi }) => (
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
            );
          })}
        </nav>

        <div className="border-t border-vien p-3">
          <Link to="/hoc" className="block rounded-lg px-2.5 py-2 text-ghi text-nhat hover:bg-muc/5 hover:text-muc">
            ← Về khu học
          </Link>
        </div>
      </aside>

      {moRay && <div className="fixed inset-0 z-40 bg-muc/25 lg:hidden" onClick={() => setMoRay(false)} aria-hidden />}

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-vien bg-nen/85 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setMoRay(true)} className="text-nhat lg:hidden" aria-label="Mở menu">
            <Menu size={18} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <DoiNen />
            <span className="text-ghi text-nhat">{hoSo?.ho_ten}</span>
          </div>
        </div>
        <div className="px-4 py-8 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
