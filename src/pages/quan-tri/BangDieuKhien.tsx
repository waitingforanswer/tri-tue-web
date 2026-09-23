import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BookOpen, Inbox, UserCheck } from 'lucide-react';
import { demTheoLoai, thongKe } from '@/lib/nguon';
import { useAuth } from '@/hooks/useAuth';
import { DangTai, The, TieuDeMuc } from '@/components/ui/co-ban';
import { TEN_LOAI } from '@/types/kho';

function O({ nhan, so, phu, Icon, den }: {
  nhan: string; so: React.ReactNode; phu?: string; Icon: typeof Inbox; den?: string;
}) {
  const noi = (
    <The className="h-full p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-vi text-nhat">{nhan}</div>
          <div className="mt-1 font-chu text-de-lon font-semibold leading-none">{so}</div>
          {phu && <div className="mt-1.5 text-vi text-nhat">{phu}</div>}
        </div>
        <Icon size={17} className="shrink-0 text-nhan" strokeWidth={1.9} />
      </div>
    </The>
  );
  return den ? <Link to={den} className="block transition-shadow hover:shadow-noi">{noi}</Link> : noi;
}

export default function BangDieuKhien() {
  const { hoSo, laAdmin } = useAuth();
  const { data: tk, isLoading, error } = useQuery({ queryKey: ['thong-ke'], queryFn: thongKe });
  const { data: dem } = useQuery({ queryKey: ['dem-loai'], queryFn: demTheoLoai });

  const s = (k: string) => (isLoading ? '…' : (tk?.[k] ?? 0).toLocaleString('vi-VN'));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-de-lon font-semibold">Bảng điều khiển</h1>
        <p className="mt-1.5 text-phu text-nhat">
          {hoSo?.ho_ten} · {laAdmin ? 'Admin — toàn quyền' : 'Sub-admin — theo quyền được cấp'}
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-vien bg-canh px-5 py-4 text-ghi leading-relaxed">
          Không đọc được số liệu. Tài khoản này cần quyền <code>XEM_THONG_KE</code>.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <O nhan="Chờ duyệt" so={s('cho_duyet')}
           phu={tk ? `${tk.cho_duyet_da_xn ?? 0} đã xác nhận email` : undefined}
           Icon={UserCheck} den="/quan-tri/duyet" />
        <O nhan="Thành viên đang học" so={s('hoat_dong')} Icon={UserCheck} den="/quan-tri/thanh-vien" />
        <O nhan="Mục nội dung" so={s('nut_xuat_ban')}
           phu={tk ? `${tk.module ?? 0} module · ${tk.nut_nhap ?? 0} bản nháp` : undefined}
           Icon={BookOpen} den="/quan-tri/kho" />
        <O nhan="Góp ý chưa xử lý" so={s('gop_y_moi')} Icon={Inbox} den="/quan-tri/gop-y" />
      </div>

      <section>
        <TieuDeMuc phu="Số mục trong kho theo từng dạng nội dung. Rê chuột để xem mã nội bộ.">
          Kho Trí tuệ
        </TieuDeMuc>
        {!dem && <DangTai dong={2} />}
        <div className="flex flex-wrap gap-2">
          {Object.entries(dem ?? {})
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => (
              <span key={k} title={`mã nội bộ: ${k}`}
                className="rounded-lg border border-vien bg-giay px-3 py-1.5 text-vi text-nhat">
                {TEN_LOAI[k] ?? k} <b className="ml-1 font-semibold text-muc">{v}</b>
              </span>
            ))}
        </div>
      </section>

      <section>
        <TieuDeMuc phu="Việc nên làm tiếp, theo thứ tự ưu tiên.">Cần chú ý</TieuDeMuc>
        <div className="space-y-2.5">
          {(tk?.cho_duyet ?? 0) > 0 && (
            <The className="flex gap-3 p-4">
              <UserCheck size={17} className="mt-0.5 shrink-0 text-nhan" strokeWidth={1.9} />
              <div>
                <div className="text-phu font-medium">
                  {tk?.cho_duyet} hồ sơ đang chờ người đọc
                </div>
                <p className="mt-1 text-ghi leading-relaxed text-nhat">
                  Người gửi hồ sơ đang ngồi chờ, không biết bao lâu. Xét sớm là giữ lời với họ.
                </p>
                <Link to="/quan-tri/duyet" className="mt-2 inline-block text-ghi font-medium text-nhan hover:underline">
                  Mở danh sách chờ →
                </Link>
              </div>
            </The>
          )}

          <The className="flex gap-3 p-4">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-am" strokeWidth={1.9} />
            <div>
              <div className="text-phu font-medium">
                {tk?.nut_trong ? `${tk.nut_trong} mục “bản gốc còn trống”` : 'Những mục “bản gốc còn trống”'}
              </div>
              <p className="mt-1 text-ghi leading-relaxed text-nhat">
                Tài liệu gốc có các mục mới có tiêu đề, chưa có nội dung. Chúng được đánh dấu <b>trong</b> và hiện
                nguyên trạng cho người học — đừng bịa nội dung để lấp chỗ. Bổ sung dần khi có bản gốc đầy đủ.
              </p>
              <Link to="/quan-tri/kho" className="mt-2 inline-block text-ghi font-medium text-nhan hover:underline">
                Mở Kho Trí tuệ →
              </Link>
            </div>
          </The>
        </div>
      </section>
    </div>
  );
}
