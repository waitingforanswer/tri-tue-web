/**
 * Khu riêng tư của người học: phiếu ứng dụng, ghi chú, hồ sơ.
 *
 * RLS trong Postgres chỉ cho chủ tài khoản đọc và ghi ba bảng này — quản trị
 * viên không xem được nội dung, kể cả để "hỗ trợ". Đừng nới chính sách đó.
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  capNhatHoSo, layGhiChu, layPhieu, luuGhiChu, xoaGhiChu, xoaPhieu,
} from '@/lib/nguon';
import { DangTai, DongNhan, Nhan, O, OVung, The, TieuDeMuc, Trong } from '@/components/ui/co-ban';
import { Button } from '@/components/ui/button';
import { TEN_TRANG_THAI_TV } from '@/types/kho';
import { ngayVN } from '@/lib/utils';

/* ═══ Phiếu ứng dụng ══════════════════════════════════════════════════ */
export function Phieu() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['phieu'], queryFn: layPhieu });

  const xoa = useMutation({
    mutationFn: xoaPhieu,
    onSuccess: () => {
      toast.success('Đã xóa phiếu.');
      void qc.invalidateQueries({ queryKey: ['phieu'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Chưa xóa được.'),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <TieuDeMuc phu="Mỗi lần chạy Thước Trí tuệ, phiếu được lưu ở đây. Chỉ mình bạn đọc được.">
        Phiếu ứng dụng của tôi
      </TieuDeMuc>

      {isLoading && <DangTai dong={4} />}
      {error && <Trong>Chưa đọc được phiếu của bạn.</Trong>}

      {data && (
        data.length ? (
          <div className="space-y-3">
            {data.map((p) => (
              <The key={p.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-vien pb-3">
                  <div>
                    <div className="font-chu text-phu font-semibold">{p.tieu_de ?? 'Phiếu ứng dụng'}</div>
                    <div className="text-ghi text-nhat">{ngayVN(p.created_at)}</div>
                  </div>
                  <button
                    onClick={() => xoa.mutate(p.id)}
                    className="shrink-0 text-nhat transition-colors hover:text-am"
                    aria-label="Xóa phiếu"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {p.van_de.length > 0 && (
                  <Muc ten="Bất ổn đang gặp">
                    <ul className="space-y-1">
                      {p.van_de.map((v) => <li key={v} className="text-ghi">· {v}</li>)}
                    </ul>
                  </Muc>
                )}

                {p.goc_do.length > 0 && (
                  <Muc ten="Góc độ tác động">
                    <div className="flex flex-wrap gap-1.5">
                      {p.goc_do.map((g) => <Nhan key={g} className="bg-nhan-nhe text-nhan">{g}</Nhan>)}
                    </div>
                  </Muc>
                )}

                {p.khuon.length > 0 && (
                  <Muc ten="Việc cần làm">
                    <ol className="space-y-1">
                      {p.khuon.map((k, i) => <li key={k} className="text-ghi">{i + 1}. {k}</li>)}
                    </ol>
                  </Muc>
                )}

                {p.cam_ket && (
                  <Muc ten="Tuần này tôi sẽ làm">
                    <p className="text-ghi leading-relaxed">{p.cam_ket}</p>
                  </Muc>
                )}
              </The>
            ))}
          </div>
        ) : (
          <Trong>
            Chưa có phiếu nào.
            <div className="mt-2 text-ghi">
              Vào <b>Có vấn đề bất ổn</b>, chạy hết bốn bước rồi bấm “Lưu vào phiếu của tôi”.
            </div>
          </Trong>
        )
      )}
    </div>
  );
}

function Muc({ ten, children }: { ten: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-mac font-semibold uppercase text-nhat">{ten}</div>
      {children}
    </div>
  );
}

/* ═══ Ghi chú ═════════════════════════════════════════════════════════ */
export function GhiChu() {
  const qc = useQueryClient();
  const [soan, setSoan] = useState('');
  const { data, isLoading, error } = useQuery({ queryKey: ['ghi-chu'], queryFn: layGhiChu });

  const lam = () => void qc.invalidateQueries({ queryKey: ['ghi-chu'] });

  const them = useMutation({
    mutationFn: (t: string) => luuGhiChu(t),
    onSuccess: () => {
      setSoan('');
      toast.success('Đã lưu ghi chú.');
      lam();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Chưa lưu được.'),
  });

  const xoa = useMutation({
    mutationFn: xoaGhiChu,
    onSuccess: lam,
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Chưa xóa được.'),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <TieuDeMuc phu="Ghi lại điều bạn nhận ra khi học, gắn với từng mục nội dung.">Ghi chú của tôi</TieuDeMuc>

      <form
        className="mb-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (soan.trim()) them.mutate(soan.trim());
        }}
      >
        <OVung
          rows={3}
          value={soan}
          onChange={(e) => setSoan(e.target.value)}
          placeholder="Hôm nay tôi nhận ra…"
        />
        <Button type="submit" size="sm" disabled={!soan.trim() || them.isPending}>
          {them.isPending ? 'Đang lưu…' : 'Lưu ghi chú'}
        </Button>
      </form>

      {isLoading && <DangTai dong={3} />}
      {error && <Trong>Chưa đọc được ghi chú của bạn.</Trong>}

      {data && (
        data.length ? (
          <div className="space-y-2.5">
            {data.map((g) => (
              <The key={g.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line text-phu leading-relaxed">{g.noi_dung}</p>
                  <div className="mt-1.5 text-mac text-nhat">{ngayVN(g.created_at)}</div>
                </div>
                <button
                  onClick={() => xoa.mutate(g.id)}
                  className="shrink-0 text-nhat transition-colors hover:text-am"
                  aria-label="Xóa ghi chú"
                >
                  <Trash2 size={15} />
                </button>
              </The>
            ))}
          </div>
        ) : (
          <Trong>Chưa có ghi chú nào.</Trong>
        )
      )}
    </div>
  );
}

/* ═══ Hồ sơ ═══════════════════════════════════════════════════════════ */
export function HoSo() {
  const { hoSo, vaiTro, dangXuat, napLai } = useAuth();
  const [sua, setSua] = useState(false);

  const luu = useMutation({
    mutationFn: capNhatHoSo,
    onSuccess: async () => {
      await napLai();
      setSua(false);
      toast.success('Đã cập nhật hồ sơ.');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Chưa lưu được.'),
  });

  if (!hoSo) return null;

  const dong = (t: string, v: React.ReactNode) => (
    <div className="flex gap-4 border-b border-vien py-3 last:border-0">
      <div className="w-40 shrink-0 text-ghi text-nhat">{t}</div>
      <div className="text-phu">{v}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <TieuDeMuc>Hồ sơ của tôi</TieuDeMuc>

      {sua ? (
        <The>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              luu.mutate({
                ho_ten: String(f.get('ho_ten')),
                dien_thoai: String(f.get('dien_thoai') ?? '') || null,
              });
            }}
          >
            <div>
              <DongNhan>Họ và tên</DongNhan>
              <O name="ho_ten" required defaultValue={hoSo.ho_ten} />
            </div>
            <div>
              <DongNhan>Số điện thoại</DongNhan>
              <O name="dien_thoai" defaultValue={hoSo.dien_thoai ?? ''} />
            </div>
            <p className="text-vi leading-relaxed text-nhat">
              Email không đổi được ở đây — email là khóa đăng nhập. Cần đổi thì gửi góp ý cho người phụ trách.
            </p>
            <div className="flex gap-2 border-t border-vien pt-4">
              <Button type="submit" disabled={luu.isPending}>
                {luu.isPending ? 'Đang lưu…' : 'Lưu'}
              </Button>
              <Button type="button" variant="mo" onClick={() => setSua(false)}>Hủy</Button>
            </div>
          </form>
        </The>
      ) : (
        <>
          <The>
            {dong('Họ tên', hoSo.ho_ten)}
            {dong('Email', hoSo.email ?? '—')}
            {dong('Điện thoại', hoSo.dien_thoai ?? '—')}
            {dong('Trạng thái', TEN_TRANG_THAI_TV[hoSo.trang_thai])}
            {dong('Vai trò', vaiTro.join(', ') || 'thanh_vien')}
            {dong('Được duyệt', ngayVN(hoSo.duyet_luc))}
            {dong('Vì sao muốn học', hoSo.ly_do_hoc ?? '—')}
          </The>

          <div className="mt-5 flex gap-2">
            <Button variant="vien" onClick={() => setSua(true)}>Sửa hồ sơ</Button>
            <Button variant="mo" onClick={() => void dangXuat()}>Đăng xuất</Button>
          </div>
        </>
      )}

      <p className="mt-6 text-vi leading-relaxed text-nhat">
        Ghi chú và phiếu ứng dụng của bạn là riêng tư: chính sách RLS trong cơ sở dữ liệu chỉ cho phép chủ tài khoản
        đọc, quản trị viên không truy cập được nội dung.
      </p>
    </div>
  );
}
