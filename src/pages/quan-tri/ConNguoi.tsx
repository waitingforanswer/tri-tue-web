/** Tầng 3 · Con người: duyệt hồ sơ, danh sách thành viên, vai trò & quyền. */
import { Fragment, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, MailCheck, MailX, ShieldQuestion, X } from 'lucide-react';
import { duyetThanhVien, layHoSo } from '@/lib/nguon';
import { MO_TA_QUYEN, QUYEN_SUB_ADMIN, TAT_CA_QUYEN, type MaQuyen } from '@/lib/quyen';
import { Button } from '@/components/ui/button';
import { DangTai, Nhan, OVung, The, TieuDeMuc, Trong } from '@/components/ui/co-ban';
import { TEN_TRANG_THAI_TV, type HoSo, type TrangThaiTV } from '@/types/kho';
import { cn, ngayVN } from '@/lib/utils';

/* ═══ Một hồ sơ chờ duyệt ═════════════════════════════════════════════ */
function TheHoSo({ hs, xuLy, dangChay }: {
  hs: HoSo;
  xuLy: (id: string, tt: TrangThaiTV, ghi?: string) => void;
  dangChay: boolean;
}) {
  const [ghi, setGhi] = useState('');
  const [moGhi, setMoGhi] = useState(false);

  return (
    <The className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-chu text-dan font-semibold">{hs.ho_ten}</div>
          <div className="mt-0.5 text-ghi text-nhat">
            {[hs.email, hs.dien_thoai].filter(Boolean).join(' · ')} · gửi {ngayVN(hs.created_at)}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hs.nguoi_gioi_thieu && <Nhan className="bg-nhan-nhe text-nhan">Giới thiệu: {hs.nguoi_gioi_thieu}</Nhan>}
          {hs.email_da_xac_nhan ? (
            <Nhan className="gap-1 bg-nhan-nhe text-nhan"><MailCheck size={10} /> Email đã xác nhận</Nhan>
          ) : (
            <Nhan className="gap-1 bg-canh text-am"><MailX size={10} /> Email chưa xác nhận</Nhan>
          )}
        </div>
      </div>

      {!hs.email_da_xac_nhan && (
        <div className="rounded-lg bg-canh px-4 py-3 text-ghi leading-relaxed">
          Người này chưa bấm link xác nhận trong email, nên chưa có gì chứng minh địa chỉ email là có thật.
          <b> Nên chờ họ xác nhận rồi hãy duyệt</b> — nếu không, sau này không liên lạc lại được.
        </div>
      )}

      <div className="space-y-3 rounded-lg bg-muc/[0.03] p-4">
        <div>
          <div className="text-mac font-semibold uppercase text-nhat">Vì sao muốn học</div>
          <p className="mt-1 text-phu leading-relaxed">
            {hs.ly_do_hoc || <span className="text-nhat">— không viết —</span>}
          </p>
        </div>
        <div>
          <div className="text-mac font-semibold uppercase text-nhat">Bất ổn đang gặp</div>
          <p className="mt-1 text-phu leading-relaxed">
            {hs.van_de_dang_gap || <span className="text-nhat">— không viết —</span>}
          </p>
        </div>
      </div>

      {moGhi && (
        <OVung
          rows={2}
          value={ghi}
          onChange={(e) => setGhi(e.target.value)}
          placeholder="Ghi chú cho người này (họ đọc được nếu bị từ chối)…"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={dangChay} onClick={() => xuLy(hs.id, 'hoat_dong', ghi)}>
          <Check size={14} /> Duyệt — mở khu học
        </Button>
        <Button size="sm" variant="vien" onClick={() => setMoGhi(!moGhi)}>
          {moGhi ? 'Ẩn ghi chú' : 'Thêm ghi chú'}
        </Button>
        <Button size="sm" variant="mo" disabled={dangChay} onClick={() => xuLy(hs.id, 'tu_choi', ghi)}>
          <X size={14} /> Chưa duyệt
        </Button>
      </div>
    </The>
  );
}

/* ═══ Chờ duyệt ═══════════════════════════════════════════════════════ */
export function Duyet() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['ho-so', 'cho_duyet'],
    queryFn: () => layHoSo('cho_duyet'),
  });

  const duyet = useMutation({
    mutationFn: ({ id, tt, ghi }: { id: string; tt: TrangThaiTV; ghi?: string }) =>
      duyetThanhVien(id, tt, ghi),
    onSuccess: (_d, v) => {
      toast.success(v.tt === 'hoat_dong' ? 'Đã duyệt — người này vào được khu học.' : 'Đã ghi nhận chưa duyệt.');
      void qc.invalidateQueries({ queryKey: ['ho-so'] });
      void qc.invalidateQueries({ queryKey: ['thong-ke'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Không duyệt được.'),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <TieuDeMuc phu="Đọc kỹ hai câu trả lời trước khi mở quyền. Đây là cửa giữ cho nội dung đến đúng người.">
        Hồ sơ chờ duyệt {data && data.length > 0 && `(${data.length})`}
      </TieuDeMuc>

      <div className="mb-5 rounded-xl bg-nhan-nhe px-5 py-4 text-ghi leading-relaxed">
        <b className="font-semibold">Gợi ý khi xét:</b> người viết cụ thể về bất ổn của mình thường học được ngay.
        Người viết chung chung thì nên liên hệ hỏi thêm một câu trước khi duyệt, đừng từ chối vội. Người có dấu
        hiệu tìm đến để bán hàng, rủ đầu tư, hoặc lôi kéo cho nhóm khác thì không duyệt.
      </div>

      {isLoading && <DangTai dong={3} />}
      {error && <Trong>Không đọc được danh sách. Kiểm tra quyền QL_THANH_VIEN của tài khoản này.</Trong>}
      {data?.length === 0 && <Trong>Không còn hồ sơ nào chờ duyệt.</Trong>}

      <div className="space-y-4">
        {data?.map((h) => (
          <TheHoSo
            key={h.id}
            hs={h}
            dangChay={duyet.isPending}
            xuLy={(id, tt, ghi) => duyet.mutate({ id, tt, ghi })}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══ Danh sách thành viên ════════════════════════════════════════════ */
const LOC: (TrangThaiTV | 'tat_ca')[] = ['tat_ca', 'cho_duyet', 'hoat_dong', 'tam_khoa', 'tu_choi'];

const MAU_TRANG_THAI: Record<TrangThaiTV, string> = {
  cho_duyet: 'bg-canh text-am',
  hoat_dong: 'bg-nhan-nhe text-nhan',
  tam_khoa: 'bg-muc/5 text-nhat',
  tu_choi: 'bg-muc/5 text-nhat',
};

export function ThanhVien() {
  const qc = useQueryClient();
  const [loc, setLoc] = useState<TrangThaiTV | 'tat_ca'>('tat_ca');
  const { data, isLoading, error } = useQuery({ queryKey: ['ho-so', 'tat-ca'], queryFn: () => layHoSo() });

  const doi = useMutation({
    mutationFn: ({ id, tt }: { id: string; tt: TrangThaiTV }) => duyetThanhVien(id, tt),
    onSuccess: () => {
      toast.success('Đã cập nhật.');
      void qc.invalidateQueries({ queryKey: ['ho-so'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Không đổi được.'),
  });

  const hien = (data ?? []).filter((h) => loc === 'tat_ca' || h.trang_thai === loc);

  return (
    <div className="mx-auto max-w-5xl">
      <TieuDeMuc phu="Toàn bộ người đã đăng ký. Tạm khóa dùng khi cần dừng quyền truy cập mà không xoá tài khoản.">
        Thành viên {data && `(${data.length})`}
      </TieuDeMuc>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {LOC.map((t) => (
          <button
            key={t}
            onClick={() => setLoc(t)}
            className={cn(
              'rounded-full px-3 py-1.5 text-vi transition-colors',
              loc === t ? 'bg-nhan text-white' : 'border border-vien bg-giay text-nhat hover:text-muc'
            )}
          >
            {t === 'tat_ca' ? 'Tất cả' : TEN_TRANG_THAI_TV[t]}
            {data && <span className="ml-1.5 opacity-70">
              {t === 'tat_ca' ? data.length : data.filter((h) => h.trang_thai === t).length}
            </span>}
          </button>
        ))}
      </div>

      {isLoading && <DangTai dong={5} />}
      {error && <Trong>Không đọc được danh sách. Kiểm tra quyền QL_THANH_VIEN.</Trong>}
      {data && hien.length === 0 && <Trong>Không có ai trong nhóm này.</Trong>}

      {hien.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-vien bg-giay">
          <table className="w-full min-w-[720px] border-collapse text-ghi">
            <thead>
              <tr className="border-b border-vien text-left text-mac uppercase text-nhat">
                <th className="px-4 py-3 font-semibold">Người học</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Đăng ký</th>
                <th className="px-4 py-3 font-semibold">Đổi</th>
              </tr>
            </thead>
            <tbody>
              {hien.map((h) => (
                <tr key={h.id} className="border-b border-vien last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-muc">{h.ho_ten}</div>
                    <div className="text-vi text-nhat">{h.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Nhan className={MAU_TRANG_THAI[h.trang_thai]}>{TEN_TRANG_THAI_TV[h.trang_thai]}</Nhan>
                  </td>
                  <td className="px-4 py-3">
                    {h.email_da_xac_nhan
                      ? <span className="text-nhan">đã xác nhận</span>
                      : <span className="text-am">chưa xác nhận</span>}
                  </td>
                  <td className="px-4 py-3 text-nhat">{ngayVN(h.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {h.trang_thai !== 'hoat_dong' && (
                        <Button size="sm" variant="vien" disabled={doi.isPending}
                          onClick={() => doi.mutate({ id: h.id, tt: 'hoat_dong' })}>Mở</Button>
                      )}
                      {h.trang_thai === 'hoat_dong' && (
                        <Button size="sm" variant="mo" disabled={doi.isPending}
                          onClick={() => doi.mutate({ id: h.id, tt: 'tam_khoa' })}>Tạm khóa</Button>
                      )}
                    </div>
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

/* ═══ Vai trò & quyền (chỉ admin) ═════════════════════════════════════ */
function Dau({ co, capDuoc }: { co: boolean; capDuoc?: boolean }) {
  if (co) return <Check size={16} className="text-nhan" strokeWidth={2.5} />;
  if (capDuoc) return <span className="text-vi text-nhat">cấp được</span>;
  return <span className="text-nhat/40">—</span>;
}

export function PhanQuyen() {
  const nhom = Array.from(new Set(TAT_CA_QUYEN.map((q) => MO_TA_QUYEN[q].nhom)));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <TieuDeMuc phu="Ba vai trò, và bộ quyền chi tiết để cắt gọt sub-admin cho vừa việc của từng người.">
          Vai trò &amp; quyền
        </TieuDeMuc>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['admin', 'Admin', 'Toàn quyền, kể cả cấp vai trò. Nên giữ ở mức 2–3 người.'],
            ['sub_admin', 'Sub-admin', 'Vào được khu quản trị, làm đúng những việc được cấp quyền.'],
            ['thanh_vien', 'Thành viên', 'Chỉ khu học. Không thấy khu quản trị.'],
          ].map(([ma, ten, mo]) => (
            <The key={ma} className="p-4">
              <div className="font-chu text-than font-semibold">{ten}</div>
              <code className="text-mac text-nhat">{ma}</code>
              <p className="mt-2 text-ghi leading-relaxed text-nhat">{mo}</p>
            </The>
          ))}
        </div>
      </div>

      <div>
        <TieuDeMuc phu="Dấu ✓ là quyền mặc định. Admin có tất cả và không cần cấp riêng.">
          Ma trận quyền
        </TieuDeMuc>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-ghi">
            <thead>
              <tr className="border-b border-vien text-left text-mac uppercase text-nhat">
                <th className="py-2.5 pr-4 font-semibold">Quyền</th>
                <th className="w-24 py-2.5 font-semibold">Admin</th>
                <th className="w-28 py-2.5 font-semibold">Sub-admin</th>
                <th className="w-28 py-2.5 font-semibold">Thành viên</th>
              </tr>
            </thead>
            <tbody>
              {nhom.map((g) => (
                <Fragment key={g}>
                  <tr>
                    <td colSpan={4} className="pb-1 pt-5 text-mac font-semibold uppercase text-nhan">{g}</td>
                  </tr>
                  {TAT_CA_QUYEN.filter((q) => MO_TA_QUYEN[q].nhom === g).map((q) => (
                    <tr key={q} className="border-b border-vien last:border-0">
                      <td className="py-2.5 pr-4">
                        <div className="font-medium">{MO_TA_QUYEN[q].ten}</div>
                        <div className="text-vi text-nhat">{MO_TA_QUYEN[q].mo_ta}</div>
                      </td>
                      <td className="py-2.5"><Dau co /></td>
                      <td className="py-2.5"><Dau co={QUYEN_SUB_ADMIN.includes(q as MaQuyen)} capDuoc /></td>
                      <td className="py-2.5"><Dau co={false} /></td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <The className="flex gap-3">
        <ShieldQuestion size={18} className="mt-0.5 shrink-0 text-nhan" strokeWidth={1.9} />
        <div className="text-ghi leading-relaxed text-nhat">
          Quyền ghi trong bảng này được thực thi ở <b className="text-muc">hai chỗ</b>: giao diện ẩn mục không có
          quyền, và Postgres từ chối truy vấn qua chính sách RLS. Chỉ ẩn ở giao diện là không đủ — người biết gọi
          API vẫn lấy được dữ liệu.
          <div className="mt-2">
            Cấp vai trò cho người khác hiện làm bằng SQL trong Supabase. Màn hình cấp quyền trực tiếp nằm ở
            giai đoạn sau.
          </div>
        </div>
      </The>
    </div>
  );
}
