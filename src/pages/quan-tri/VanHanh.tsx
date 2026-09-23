/** Tầng 3 · Vận hành: góp ý và nhật ký thao tác. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { layGopY, layNhatKy, xuLyGopY } from '@/lib/nguon';
import { Button } from '@/components/ui/button';
import { DangTai, Nhan, The, TieuDeMuc, Trong } from '@/components/ui/co-ban';
import { TEN_TRANG_THAI_GOP_Y, type GopY } from '@/types/kho';
import { ngayVN } from '@/lib/utils';

const MAU: Record<GopY['trang_thai'], string> = {
  moi: 'bg-canh text-am',
  dang_xu_ly: 'bg-nhan-nhe text-nhan',
  xong: 'bg-muc/5 text-nhat',
};

export function GopYQL() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['gop-y'], queryFn: layGopY });

  const doi = useMutation({
    mutationFn: ({ id, tt }: { id: string; tt: GopY['trang_thai'] }) => xuLyGopY(id, tt),
    onSuccess: () => {
      toast.success('Đã cập nhật.');
      void qc.invalidateQueries({ queryKey: ['gop-y'] });
      void qc.invalidateQueries({ queryKey: ['thong-ke'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Không đổi được.'),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <TieuDeMuc phu="Góp ý gửi từ trang công khai. Ai cũng gửi được, chỉ người có quyền QL_GOP_Y đọc được.">
        Góp ý {data && data.length > 0 && `(${data.length})`}
      </TieuDeMuc>

      <The className="mb-5 text-ghi leading-relaxed text-nhat">
        <b className="text-muc">Chú ý loại góp ý quan trọng nhất:</b> báo cáo về việc có người mượn danh nhóm để
        thu tiền, rủ đầu tư, hoặc lôi kéo. Những tin này nên xử lý trước, và nên trả lời người gửi để họ biết đã
        có người tiếp nhận.
      </The>

      {isLoading && <DangTai dong={3} />}
      {error && <Trong>Không đọc được. Tài khoản này cần quyền <code>QL_GOP_Y</code>.</Trong>}
      {data?.length === 0 && <Trong>Chưa có góp ý nào.</Trong>}

      <div className="space-y-3">
        {data?.map((g) => (
          <The key={g.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-phu font-medium">{g.ho_ten}</div>
                <div className="text-vi text-nhat">
                  {[g.email, g.dien_thoai].filter(Boolean).join(' · ') || 'không để lại cách liên lạc'}
                  {' · '}{ngayVN(g.created_at)}
                </div>
              </div>
              <Nhan className={MAU[g.trang_thai]}>{TEN_TRANG_THAI_GOP_Y[g.trang_thai]}</Nhan>
            </div>

            <p className="whitespace-pre-line rounded-lg bg-muc/[0.03] p-4 text-phu leading-relaxed">
              {g.noi_dung}
            </p>

            <div className="flex flex-wrap gap-2 border-t border-vien pt-3">
              {g.trang_thai !== 'dang_xu_ly' && (
                <Button size="sm" variant="vien" disabled={doi.isPending}
                  onClick={() => doi.mutate({ id: g.id, tt: 'dang_xu_ly' })}>Đang xử lý</Button>
              )}
              {g.trang_thai !== 'xong' && (
                <Button size="sm" disabled={doi.isPending}
                  onClick={() => doi.mutate({ id: g.id, tt: 'xong' })}>Đánh dấu xong</Button>
              )}
            </div>
          </The>
        ))}
      </div>
    </div>
  );
}

export function NhatKyQL() {
  const { data, isLoading, error } = useQuery({ queryKey: ['nhat-ky'], queryFn: () => layNhatKy() });

  return (
    <div className="mx-auto max-w-4xl">
      <TieuDeMuc phu="Ai duyệt ai, ai sửa gì, lúc nào. Ghi tự động, không sửa được — để mọi quyết định đều truy được về người chịu trách nhiệm.">
        Nhật ký hệ thống
      </TieuDeMuc>

      {isLoading && <DangTai dong={5} />}
      {error && <Trong>Không đọc được. Tài khoản này cần quyền <code>XEM_NHAT_KY</code>.</Trong>}
      {data?.length === 0 && <Trong>Chưa có bản ghi nào.</Trong>}

      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-vien bg-giay">
          <table className="w-full min-w-[640px] border-collapse text-ghi">
            <thead>
              <tr className="border-b border-vien text-left text-mac uppercase text-nhat">
                <th className="px-4 py-3 font-semibold">Lúc</th>
                <th className="px-4 py-3 font-semibold">Hành động</th>
                <th className="px-4 py-3 font-semibold">Bảng</th>
                <th className="px-4 py-3 font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {data.map((n) => (
                <tr key={n.id} className="border-b border-vien last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-nhat">
                    {new Date(n.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 font-medium text-muc">{n.hanh_dong}</td>
                  <td className="px-4 py-3 text-nhat"><code className="text-vi">{n.bang ?? '—'}</code></td>
                  <td className="px-4 py-3 text-nhat">
                    <code className="text-vi">{JSON.stringify(n.chi_tiet)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
