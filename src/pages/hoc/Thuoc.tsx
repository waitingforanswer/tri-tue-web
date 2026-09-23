/**
 * Thước Trí tuệ — công cụ 4 bước giải một việc bất ổn.
 *   1 · Định khối          2 · Khai thác dữ liệu + chọn góc độ tác động
 *   3 · Sử dụng pháp       4 · Phiếu ứng dụng (in được / lưu lại)
 */
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Printer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { layCay, layLienKet, layModuleTheoSlug, luuPhieu } from '@/lib/nguon';
import { VanGoc } from '@/components/kho/ChiNhan';
import { Button } from '@/components/ui/button';
import { DangTai, Nhan, OVung, The, Trong } from '@/components/ui/co-ban';
import { cn, loTag } from '@/lib/utils';
import type { Nut } from '@/types/kho';

const TEN_BUOC = ['Định khối', 'Khai thác', 'Sử dụng pháp', 'Phiếu ứng dụng'];

function ThanhBuoc({ buoc, dat, moKhoa }: { buoc: number; dat: (n: number) => void; moKhoa: (n: number) => boolean }) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2">
      {TEN_BUOC.map((t, i) => {
        const n = i + 1;
        const duoc = moKhoa(n);
        return (
          <li key={t}>
            <button
              disabled={!duoc}
              onClick={() => duoc && dat(n)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-ghi transition-colors',
                buoc === n
                  ? 'border-nhan bg-nhan text-white'
                  : duoc
                    ? 'border-vien bg-giay text-muc hover:border-nhan/40'
                    : 'border-vien bg-giay text-nhat/50'
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full text-mac font-semibold',
                  buoc === n ? 'bg-white/20' : 'bg-muc/5'
                )}
              >
                {buoc > n ? <Check size={11} strokeWidth={3} /> : n}
              </span>
              {t}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function ONhieu({ chon, bat, ten }: { chon: boolean; bat: () => void; ten: React.ReactNode }) {
  return (
    <button
      onClick={bat}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-3 text-left text-phu transition-colors',
        chon ? 'border-nhan bg-nhan-nhe' : 'border-vien bg-giay hover:border-nhan/30'
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border',
          chon ? 'border-nhan bg-nhan text-white' : 'border-vien'
        )}
      >
        {chon && <Check size={10} strokeWidth={3.5} />}
      </span>
      <span className="min-w-0 flex-1">{ten}</span>
    </button>
  );
}

export default function Thuoc() {
  const [buoc, setBuoc] = useState(1);
  const [khoi, setKhoi] = useState<string | null>(null);
  const [vanDe, setVanDe] = useState<Set<string>>(new Set());
  const [gocDo, setGocDo] = useState<Set<string>>(new Set());
  const [camKet, setCamKet] = useState('');
  const [daLuu, setDaLuu] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['thuoc'],
    queryFn: async () => {
      const [mT, mK] = await Promise.all([layModuleTheoSlug('thuoc-tri-tue'), layModuleTheoSlug('thu-vien-khuon')]);
      if (!mT || !mK) return null;
      const [cayT, cayK, anhXa] = await Promise.all([layCay(mT.id), layCay(mK.id), layLienKet('goc_do_khuon')]);
      return { cayT, cayK, anhXa };
    },
  });

  const dsKhoi = useMemo(() => (data?.cayT.nut ?? []).filter((n) => n.loai === 'khoi'), [data]);
  const dsGocDo = useMemo(() => (data?.cayT.nut ?? []).filter((n) => n.loai === 'goc_do'), [data]);
  const dsPhap = useMemo(() => (data?.cayT.nut ?? []).filter((n) => n.loai === 'phap'), [data]);
  const nutKhoi = dsKhoi.find((k) => k.id === khoi) ?? null;

  const conKhoi = (loai: string): Nut[] =>
    nutKhoi ? (data?.cayT.theoCha.get(nutKhoi.id) ?? []).filter((n) => n.loai === loai) : [];

  const khuonGoiY = useMemo(() => {
    if (!data) return [];
    const ids = new Set<string>();
    for (const l of data.anhXa) if (gocDo.has(l.tu_id)) ids.add(l.den_id);
    return data.cayK.nut.filter((n) => ids.has(n.id));
  }, [data, gocDo]);

  const bat = (s: Set<string>, d: (v: Set<string>) => void, id: string) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    d(n);
  };

  const moKhoa = (n: number) => n === 1 || (n === 2 && !!khoi) || (n >= 3 && !!khoi && gocDo.size > 0);

  const lamLai = () => {
    setBuoc(1);
    setKhoi(null);
    setVanDe(new Set());
    setGocDo(new Set());
    setCamKet('');
    setDaLuu(false);
  };

  const ten = (ds: Nut[], chon: Set<string>) => ds.filter((n) => chon.has(n.id)).map((n) => n.tieu_de);

  const luu = useMutation({
    mutationFn: () =>
      luuPhieu({
        tieu_de: nutKhoi ? `Khối ${nutKhoi.tieu_de}` : null,
        khoi_ma: nutKhoi?.ma ?? null,
        van_de: ten(conKhoi('van_de'), vanDe),
        bieu_hien: [],
        goc_do: ten(dsGocDo, gocDo),
        khuon: khuonGoiY.map((k) => k.tieu_de),
        cam_ket: camKet || null,
        ket_qua: null,
        hoan_thanh: false,
      }),
    onSuccess: () => {
      setDaLuu(true);
      toast.success('Đã lưu vào phiếu của bạn.');
      void qc.invalidateQueries({ queryKey: ['phieu'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Chưa lưu được phiếu.'),
  });

  if (isLoading) return <DangTai dong={6} />;
  if (!data) return <Trong>Chưa có dữ liệu cho Thước Trí tuệ.</Trong>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 print:hidden">
        <h1 className="text-de-vua font-semibold leading-tight">Giải một việc bất ổn</h1>
        <p className="mt-1.5 text-phu leading-relaxed text-nhat">
          Đi từ hiện tượng về gốc, rồi ra việc phải làm. Bốn bước, làm một lần cho một việc.
        </p>
      </div>

      <div className="print:hidden">
        <ThanhBuoc buoc={buoc} dat={setBuoc} moKhoa={moKhoa} />
      </div>

      {/* ── Bước 1 ────────────────────────────────────────────────── */}
      {buoc === 1 && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-1 text-dan font-semibold">Bất ổn của bạn thuộc khối nào?</h2>
            <p className="mb-4 text-ghi text-nhat">Chọn một khối. Gọi sai tên khối thì chữa sai chỗ.</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {dsKhoi.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    setKhoi(k.id);
                    setVanDe(new Set());
                  }}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-left transition-colors',
                    khoi === k.id ? 'border-nhan bg-nhan-nhe' : 'border-vien bg-giay hover:border-nhan/30'
                  )}
                >
                  <div className="font-chu text-than font-semibold">{k.tieu_de}</div>
                  <div className="mt-0.5 text-ghi leading-snug text-nhat">{loTag(k.tom_tat)}</div>
                </button>
              ))}
            </div>
          </section>

          {nutKhoi && (
            <section>
              <h2 className="mb-1 text-dan font-semibold">Cụ thể hơn — chọn những gì đúng với bạn</h2>
              <p className="mb-4 text-ghi text-nhat">Chọn được bao nhiêu thì chọn, không cần đủ.</p>
              <div className="space-y-2">
                {conKhoi('van_de').map((v) => (
                  <ONhieu key={v.id} chon={vanDe.has(v.id)} bat={() => bat(vanDe, setVanDe, v.id)} ten={v.tieu_de} />
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-end">
            <Button disabled={!khoi} onClick={() => setBuoc(2)}>Tiếp — khai thác</Button>
          </div>
        </div>
      )}

      {/* ── Bước 2 ────────────────────────────────────────────────── */}
      {buoc === 2 && nutKhoi && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-1 text-dan font-semibold">Khai thác dữ liệu — khối {nutKhoi.tieu_de}</h2>
            <p className="mb-4 text-ghi text-nhat">
              Đọc từng ý, soi vào việc của mình. Đây là phần <b className="font-medium text-muc">truy quả tầm nhân</b>.
            </p>
            <div className="space-y-2.5">
              {conKhoi('khai_thac').map((x) => (
                <The key={x.id} className="p-4">
                  <div className="font-chu text-phu font-semibold">{x.tieu_de}</div>
                  <div className="mt-1.5 text-ghi leading-relaxed text-nhat">
                    <b className="font-medium text-muc">Chỉ ra:</b> {loTag(x.tom_tat)}
                  </div>
                  <div className="mt-1 text-ghi leading-relaxed">
                    <b className="font-medium">Cần làm:</b> {loTag(x.noi_dung)}
                  </div>
                </The>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-dan font-semibold">Chọn góc độ tác động chính</h2>
            <p className="mb-4 text-ghi text-nhat">
              Chọn 1–3 góc độ đúng nhất. Hệ thống sẽ lấy ra đúng khuôn tương ứng.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {dsGocDo.map((g) => (
                <ONhieu
                  key={g.id}
                  chon={gocDo.has(g.id)}
                  bat={() => bat(gocDo, setGocDo, g.id)}
                  ten={
                    <>
                      <span className="block font-medium">{g.tieu_de}</span>
                      <span className="block text-vi leading-snug text-nhat">{loTag(g.tom_tat)}</span>
                    </>
                  }
                />
              ))}
            </div>
          </section>

          <div className="flex justify-between">
            <Button variant="mo" onClick={() => setBuoc(1)}>← Quay lại</Button>
            <Button disabled={!gocDo.size} onClick={() => setBuoc(3)}>Tiếp — sử dụng pháp</Button>
          </div>
        </div>
      )}

      {/* ── Bước 3 ────────────────────────────────────────────────── */}
      {buoc === 3 && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-1 text-dan font-semibold">Sử dụng pháp</h2>
            <p className="mb-4 text-ghi text-nhat">Biết gốc rồi thì dùng pháp. Đây là phần làm, không phải phần nghĩ.</p>
            <div className="space-y-2.5">
              {dsPhap.map((p) => (
                <The key={p.id} className="p-4">
                  <div className="font-chu text-than font-semibold">{p.tieu_de}</div>
                  {typeof p.du_lieu?.khi === 'string' && (
                    <div className="mt-1 text-ghi text-nhat">Khi nào: {p.du_lieu.khi as string}</div>
                  )}
                  <VanGoc html={p.tom_tat} className="mt-1.5 text-ghi" />
                  <ul className="mt-2.5 space-y-1.5">
                    {((p.du_lieu?.lam as string[]) ?? []).map((l, i) => (
                      <li key={i} className="flex gap-2 text-ghi">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-nhan" />
                        <VanGoc html={l} />
                      </li>
                    ))}
                  </ul>
                </The>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-dan font-semibold">Khuôn dành cho bạn</h2>
            <p className="mb-4 text-ghi text-nhat">
              {khuonGoiY.length} khuôn, lấy ra từ những góc độ bạn đã chọn.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {khuonGoiY.map((k) => (
                <The key={k.id} className="p-4">
                  <div className="font-chu text-phu font-semibold">{k.tieu_de}</div>
                  <VanGoc html={k.tom_tat} className="mt-1 text-ghi text-nhat" />
                </The>
              ))}
            </div>
          </section>

          <div className="flex justify-between">
            <Button variant="mo" onClick={() => setBuoc(2)}>← Quay lại</Button>
            <Button onClick={() => setBuoc(4)}>Lập phiếu ứng dụng</Button>
          </div>
        </div>
      )}

      {/* ── Bước 4 · Phiếu ───────────────────────────────────────── */}
      {buoc === 4 && nutKhoi && (
        <div className="space-y-6">
          <The className="space-y-5 print:border-0 print:shadow-none">
            <div className="flex items-start justify-between gap-4 border-b border-vien pb-4">
              <div>
                <h2 className="font-chu text-de-nho font-semibold">Phiếu ứng dụng</h2>
                <p className="text-ghi text-nhat">
                  Khối {nutKhoi.tieu_de} · {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>
              <Nhan className="bg-nhan-nhe text-nhan">{khuonGoiY.length} khuôn</Nhan>
            </div>

            {vanDe.size > 0 && (
              <div>
                <div className="mb-1.5 text-mac font-semibold uppercase text-nhat">Bất ổn đang gặp</div>
                <ul className="space-y-1">
                  {conKhoi('van_de').filter((v) => vanDe.has(v.id)).map((v) => (
                    <li key={v.id} className="text-phu">· {v.tieu_de}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="mb-1.5 text-mac font-semibold uppercase text-nhat">Góc độ tác động</div>
              <div className="flex flex-wrap gap-1.5">
                {dsGocDo.filter((g) => gocDo.has(g.id)).map((g) => (
                  <Nhan key={g.id} className="bg-nhan-nhe text-nhan">{g.tieu_de}</Nhan>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-mac font-semibold uppercase text-nhat">Việc cần làm</div>
              <ol className="space-y-3">
                {khuonGoiY.map((k, i) => (
                  <li key={k.id} className="border-l-2 border-nhan/30 pl-3.5">
                    <div className="text-phu font-medium">{i + 1}. {k.tieu_de}</div>
                    <ul className="mt-1.5 space-y-1">
                      {(data.cayK.theoCha.get(k.id) ?? []).map((v) => (
                        <li key={v.id} className="flex gap-2 text-ghi text-nhat">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-nhat/50" />
                          <VanGoc html={v.noi_dung ?? v.tieu_de} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>

            <div className="print:hidden">
              <div className="mb-1.5 text-mac font-semibold uppercase text-nhat">
                Tuần này tôi sẽ làm
              </div>
              <OVung
                rows={3}
                value={camKet}
                onChange={(e) => setCamKet(e.target.value)}
                placeholder="Chọn MỘT việc nhỏ, làm được ngay trong tuần này. Ghi cụ thể: làm gì, với ai, lúc nào."
              />
            </div>
            {camKet && (
              <div className="hidden print:block">
                <div className="mb-1.5 text-mac font-semibold uppercase">Tuần này tôi sẽ làm</div>
                <p className="text-phu">{camKet}</p>
              </div>
            )}
          </The>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button onClick={() => window.print()}><Printer size={15} /> In phiếu</Button>
            <Button variant="vien" disabled={luu.isPending || daLuu} onClick={() => luu.mutate()}>
              {daLuu ? 'Đã lưu' : luu.isPending ? 'Đang lưu…' : 'Lưu vào phiếu của tôi'}
            </Button>
            <Button variant="mo" onClick={lamLai}><RotateCcw size={15} /> Làm lại</Button>
          </div>
          <p className="text-vi text-nhat print:hidden">
            Phiếu lưu vào bảng <code>phieu_ung_dung</code> và chỉ mình bạn đọc được — quản trị viên không xem được nội
            dung, chỉ thấy số phiếu đã lập.
          </p>
        </div>
      )}
    </div>
  );
}
