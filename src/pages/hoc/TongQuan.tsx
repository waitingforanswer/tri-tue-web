import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { demTheoLoai, layModule } from '@/lib/nguon';
import { useAuth } from '@/hooks/useAuth';
import { The, TieuDeMuc } from '@/components/ui/co-ban';
import { TEN_LOAI } from '@/types/kho';
import { Button } from '@/components/ui/button';

const DUONG: Record<string, string> = {
  'mo-dau': '/hoc/lo-trinh',
  'lo-trinh': '/hoc/lo-trinh',
  'song-hang-ngay': '/hoc/song-hang-ngay',
  'thuoc-tri-tue': '/hoc/thuoc',
  'cay-kien-thuc': '/hoc/cay-kien-thuc',
  'thu-vien-khuon': '/hoc/thu-vien-khuon',
  'tu-dien': '/hoc/tu-dien',
};

export default function TongQuan() {
  const { hoSo } = useAuth();
  const { data: mods } = useQuery({ queryKey: ['module'], queryFn: layModule });
  const { data: dem } = useQuery({ queryKey: ['dem-loai'], queryFn: demTheoLoai });

  const ten = hoSo?.ho_ten.split(' ').pop() ?? '';

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-de-lon font-semibold leading-tight">Chào {ten}</h1>
        <p className="mt-2 max-w-2xl text-than leading-relaxed text-nhat">
          Hôm nay bạn muốn làm gì? Nếu đang có việc bất ổn thì vào{' '}
          <Link to="/hoc/thuoc" className="font-medium text-nhan hover:underline">Thước Trí tuệ</Link>. Nếu không có
          gì gấp thì đi tiếp{' '}
          <Link to="/hoc/lo-trinh" className="font-medium text-nhan hover:underline">lộ trình</Link>.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { den: '/hoc/thuoc', t: 'Có vấn đề bất ổn', n: 'Chạy bốn bước, nhận đúng khuôn để làm' },
          { den: '/hoc/lo-trinh', t: 'Đang học', n: 'Bước nào rồi, tuần này làm gì' },
          { den: '/hoc/song-hang-ngay', t: 'Sống hằng ngày', n: 'Một ngày chạy như thế nào' },
        ].map((o) => (
          <Link key={o.den} to={o.den}>
            <The className="h-full transition-shadow hover:shadow-noi">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-chu text-dan font-semibold">{o.t}</div>
                  <p className="mt-1 text-ghi leading-snug text-nhat">{o.n}</p>
                </div>
                <ArrowRight size={16} className="mt-1 shrink-0 text-nhan" />
              </div>
            </The>
          </Link>
        ))}
      </section>

      <section>
        <TieuDeMuc phu="Nội dung được mở cho bạn. Admin có thể cấp thêm module riêng.">Kho của bạn</TieuDeMuc>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(mods ?? []).map((m) => (
            <Link key={m.id} to={DUONG[m.slug] ?? '/hoc'}>
              <The className="h-full p-4 transition-shadow hover:shadow-noi">
                <div className="font-chu text-than font-semibold">{m.ten}</div>
                <p className="mt-1 text-ghi leading-snug text-nhat">{m.mo_ta}</p>
              </The>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <TieuDeMuc phu="Số mục hiện có trong kho, theo từng dạng.">Kho đang có gì</TieuDeMuc>
        <div className="flex flex-wrap gap-2">
          {Object.entries(dem ?? {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([k, v]) => (
              <span key={k} className="rounded-lg border border-vien bg-giay px-3 py-1.5 text-vi text-nhat">
                {TEN_LOAI[k] ?? k} <b className="ml-1 font-semibold text-muc">{v}</b>
              </span>
            ))}
        </div>
      </section>

      <section className="rounded-xl bg-nhan-nhe px-5 py-5">
        <div className="font-chu text-than font-semibold">Nhắc một câu trước khi học</div>
        <p className="mt-2 max-w-2xl text-phu leading-relaxed">
          Học Trí tuệ là học để làm. Đọc mười mục mà không làm mục nào thì bằng không. Mỗi tuần chọn <b>một</b> khuôn,
          làm thật, rồi ghi lại kết quả vào phiếu ứng dụng của bạn.
        </p>
        <Link to="/hoc/phieu" className="mt-4 inline-block">
          <Button variant="vien" size="sm">Xem phiếu ứng dụng của tôi</Button>
        </Link>
      </section>
    </div>
  );
}
