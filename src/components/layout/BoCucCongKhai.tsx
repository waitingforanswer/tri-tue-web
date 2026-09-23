import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DoiNen } from './DoiNen';
import { cn } from '@/lib/utils';

const MENU = [
  { den: '/tri-tue-la-gi', ten: 'Trí tuệ là gì' },
  { den: '/hoc-the-nao', ten: 'Học thế nào' },
  { den: '/cam-ket', ten: 'Cam kết của chúng tôi' },
  { den: '/bai-viet', ten: 'Bài viết' },
  { den: '/cau-hoi', ten: 'Hỏi đáp' },
];

export function Dau() {
  const { daDangNhap, daDuyet, laQuanTri, hoSo } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-vien bg-nen/85 backdrop-blur">
      <div className="container flex h-16 items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-nhan text-than font-semibold text-white">
            T
          </span>
          <span className="font-chu text-de-nho font-semibold leading-tight">
            Vốn sống Trí tuệ
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {MENU.map((m) => (
            <NavLink
              key={m.den}
              to={m.den}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-phu transition-colors',
                  isActive ? 'bg-nhan-nhe text-nhan' : 'text-nhat hover:bg-muc/5 hover:text-muc'
                )
              }
            >
              {m.ten}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <DoiNen />
          {daDangNhap ? (
            <>
              {laQuanTri && (
                <Link to="/quan-tri">
                  <Button variant="mo" size="sm">Quản trị</Button>
                </Link>
              )}
              <Link to={daDuyet ? '/hoc' : '/cho-duyet'}>
                <Button size="sm">{daDuyet ? 'Vào học' : `Chào ${hoSo?.ho_ten.split(' ').pop()}`}</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dang-nhap" className="hidden sm:block">
                <Button variant="mo" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/dang-ky">
                <Button size="sm">Xin học</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Chan() {
  return (
    <footer className="mt-24 border-t border-vien bg-giay">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-chu text-dan font-semibold">Vốn sống Trí tuệ</div>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-nhat">
            Nơi học để tự làm thầy cho cuộc đời mình. Học miễn phí. Không thu tiền, không kêu gọi đầu tư,
            không ràng buộc ai vào tổ chức nào.
          </p>
        </div>
        <div>
          <div className="mb-3 text-ghi font-semibold">Tìm hiểu</div>
          <ul className="space-y-2 text-sm text-nhat">
            {MENU.map((m) => (
              <li key={m.den}>
                <Link to={m.den} className="hover:text-muc">{m.ten}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-3 text-ghi font-semibold">Liên hệ</div>
          <ul className="space-y-2 text-sm text-nhat">
            <li><Link to="/gop-y" className="hover:text-muc">Gửi góp ý</Link></li>
            <li><Link to="/dang-ky" className="hover:text-muc">Xin học</Link></li>
            <li><Link to="/dang-nhap" className="hover:text-muc">Đăng nhập</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-vien">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-nhat">
          <span>Nội dung lấy nguyên văn từ tài liệu của nhóm học Vốn sống Trí tuệ.</span>
          <span>Phi lợi nhuận · Không thu phí</span>
        </div>
      </div>
    </footer>
  );
}

export function BoCucCongKhai() {
  return (
    <div className="flex min-h-screen flex-col">
      <Dau />
      <main className="flex-1">
        <Outlet />
      </main>
      <Chan />
    </div>
  );
}
