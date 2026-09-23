/** Ba màn hình tra cứu: Cây kiến thức · Thư viện khuôn · Từ điển. */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { layCay, layModuleTheoSlug } from '@/lib/nguon';
import { ChiNhan, VanGoc } from '@/components/kho/ChiNhan';
import { DangTai, Nhan, The, TieuDeMuc, Trong } from '@/components/ui/co-ban';
import { boDau, cn, loTag } from '@/lib/utils';
import type { Nut } from '@/types/kho';

function useModuleCay(slug: string) {
  return useQuery({
    queryKey: ['cay', slug],
    queryFn: async () => {
      const m = await layModuleTheoSlug(slug);
      if (!m) return null;
      return { module: m, ...(await layCay(m.id)) };
    },
  });
}

function OLoc({ gt, dat, gioiThieu }: { gt: string; dat: (v: string) => void; gioiThieu: string }) {
  return (
    <input
      value={gt}
      onChange={(e) => dat(e.target.value)}
      type="search"
      placeholder={gioiThieu}
      className="h-9 w-full max-w-sm rounded-lg border border-vien bg-giay px-3 text-ghi placeholder:text-nhat/70 focus:border-nhan/40 focus:outline-none focus:ring-2 focus:ring-nhan/15"
    />
  );
}

/* ═══ Cây kiến thức ═══════════════════════════════════════════════════ */
export function CayKienThuc() {
  const { data, isLoading } = useModuleCay('cay-kien-thuc');
  const [mo, setMo] = useState<Set<string>>(new Set());
  const [loc, setLoc] = useState('');

  const bat = (id: string) =>
    setMo((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  if (isLoading) return <DangTai dong={6} />;
  if (!data) return <Trong>Chưa có nội dung cho module này.</Trong>;

  const q = boDau(loc.trim());
  const phan = (data.theoCha.get(null) ?? []).filter((p) => p.loai === 'phan');

  return (
    <div className="mx-auto max-w-4xl">
      <TieuDeMuc phu="Quy chuẩn 11 phần — toàn bộ khung kiến thức. Bấm vào từng phần để mở.">
        Cây kiến thức
      </TieuDeMuc>
      <div className="mb-5"><OLoc gt={loc} dat={setLoc} gioiThieu="Lọc trong cây — thử: nghiệp, kiểm soát, đích…" /></div>

      <div className="space-y-2.5">
        {phan.map((p) => {
          const nhanh = (data.theoCha.get(p.id) ?? []).filter((n) =>
            !q || boDau(`${n.ma} ${n.tieu_de} ${loTag(n.tom_tat)}`).includes(q)
          );
          if (q && !nhanh.length && !boDau(p.tieu_de).includes(q)) return null;
          const dangMo = mo.has(p.id) || Boolean(q);

          return (
            <div key={p.id} className="the overflow-hidden p-0">
              <button
                onClick={() => bat(p.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muc/[0.02]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-nhan-nhe text-vi font-semibold text-nhan">
                  {p.ma?.replace('P', '')}
                </span>
                <span className="flex-1">
                  <span className="block font-chu text-than font-semibold">{p.tieu_de}</span>
                  <span className="block text-ghi leading-snug text-nhat">{loTag(p.tom_tat)}</span>
                </span>
                <ChevronRight size={16} className={cn('shrink-0 text-nhat transition-transform', dangMo && 'rotate-90')} />
              </button>

              {dangMo && (
                <div className="space-y-4 border-t border-vien px-5 py-5">
                  {nhanh.map((n) => (
                    <NhanhCay key={n.id} nut={n} y={data.theoCha.get(n.id) ?? []} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NhanhCay({ nut, y }: { nut: Nut; y: Nut[] }) {
  const [mo, setMo] = useState(false);
  return (
    <div className="border-l-2 border-vien pl-4">
      <div className="flex flex-wrap items-baseline gap-2">
        {nut.ma && <span className="text-vi font-semibold text-nhan">{nut.ma}</span>}
        <span className="font-chu text-than font-semibold">{nut.tieu_de}</span>
        <ChiNhan nhan={nut.nhan} />
      </div>
      <VanGoc html={nut.tom_tat} className="mt-1 text-phu text-nhat" />

      {y.length > 0 && (
        <>
          <button onClick={() => setMo(!mo)} className="mt-2 text-vi font-medium text-nhan hover:underline">
            {mo ? 'Thu lại' : `Mở ${y.length} ý`}
          </button>
          {mo && (
            <ul className="mt-3 space-y-2.5">
              {y.map((i) => (
                <li key={i.id} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-nhan" />
                  <VanGoc html={i.noi_dung ?? i.tieu_de} className="text-phu" />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/* ═══ Thư viện khuôn ══════════════════════════════════════════════════ */
export function ThuVienKhuon() {
  const { data, isLoading } = useModuleCay('thu-vien-khuon');
  const [loc, setLoc] = useState('');
  const [nhom, setNhom] = useState<string>('tat-ca');

  const khuon = useMemo(() => (data?.nut ?? []).filter((n) => n.loai === 'khuon'), [data]);
  const nhomDS = useMemo(
    () => Array.from(new Set(khuon.map((k) => String(k.du_lieu?.nhom ?? 'Khác')))),
    [khuon]
  );

  if (isLoading) return <DangTai dong={6} />;
  if (!data) return <Trong>Chưa có nội dung cho module này.</Trong>;

  const q = boDau(loc.trim());
  const hien = khuon.filter(
    (k) =>
      (nhom === 'tat-ca' || String(k.du_lieu?.nhom) === nhom) &&
      (!q || boDau(`${k.tieu_de} ${loTag(k.tom_tat)}`).includes(q))
  );

  return (
    <div className="mx-auto max-w-4xl">
      <TieuDeMuc phu="Mỗi khuôn là một việc làm cụ thể: nhìn ra cái gì, rồi làm những gì.">
        Thư viện khuôn
      </TieuDeMuc>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <OLoc gt={loc} dat={setLoc} gioiThieu="Lọc khuôn…" />
        <div className="flex flex-wrap gap-1.5">
          {['tat-ca', ...nhomDS].map((n) => (
            <button
              key={n}
              onClick={() => setNhom(n)}
              className={cn(
                'rounded-full px-3 py-1.5 text-vi transition-colors',
                nhom === n ? 'bg-nhan text-white' : 'border border-vien bg-giay text-nhat hover:text-muc'
              )}
            >
              {n === 'tat-ca' ? 'Tất cả' : n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {hien.map((k) => (
          <TheKhuon key={k.id} nut={k} viec={data.theoCha.get(k.id) ?? []} />
        ))}
      </div>
      {!hien.length && <Trong>Không có khuôn nào khớp.</Trong>}
    </div>
  );
}

export function TheKhuon({ nut, viec }: { nut: Nut; viec: Nut[] }) {
  const [mo, setMo] = useState(false);
  const bam = (nut.du_lieu?.bam as string[] | undefined) ?? [];
  const chuKy = nut.du_lieu?.chu_ky as string | undefined;

  return (
    <The className="flex flex-col p-4">
      <div className="flex items-start gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-nhan-nhe text-mac font-semibold text-nhan">
          {String(nut.du_lieu?.so ?? '')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-chu text-than font-semibold leading-snug">{nut.tieu_de}</div>
          <VanGoc html={nut.tom_tat} className="mt-1 text-ghi text-nhat" />
        </div>
      </div>

      {mo && (
        <div className="mt-3 space-y-3 border-t border-vien pt-3">
          {viec.length > 0 && (
            <div>
              <div className="mb-1.5 text-mac font-semibold uppercase text-nhat">Việc cần làm</div>
              <ul className="space-y-2">
                {viec.map((v) => (
                  <li key={v.id} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-nhan" />
                    <VanGoc html={v.noi_dung ?? v.tieu_de} className="text-ghi" />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bam.length > 0 && (
            <div>
              <div className="mb-1.5 text-mac font-semibold uppercase text-nhat">Bám vào</div>
              <div className="flex flex-wrap gap-1.5">
                {bam.map((b, i) => (
                  <Nhan key={i} className="bg-muc/5 text-nhat">{b}</Nhan>
                ))}
              </div>
            </div>
          )}
          {chuKy && <div className="text-vi text-nhat">Chu kỳ: <b className="text-muc">{chuKy}</b></div>}
        </div>
      )}

      <button onClick={() => setMo(!mo)} className="mt-3 self-start text-vi font-medium text-nhan hover:underline">
        {mo ? 'Thu lại' : 'Xem cách làm'}
      </button>
    </The>
  );
}

/* ═══ Từ điển ═════════════════════════════════════════════════════════ */
export function TuDien() {
  const { data, isLoading } = useModuleCay('tu-dien');
  const [loc, setLoc] = useState('');

  if (isLoading) return <DangTai dong={6} />;
  if (!data) return <Trong>Chưa có nội dung cho module này.</Trong>;

  const q = boDau(loc.trim());
  const nhom = data.nut.filter((n) => n.loai === 'nhom_tu');
  const capNham = data.nut.filter((n) => n.loai === 'cap_de_nham');

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <TieuDeMuc phu="Dùng sai từ là hiểu sai việc. Đây là nghĩa dùng trong tài liệu Trí tuệ, không phải nghĩa từ điển phổ thông.">
          Từ điển thuật ngữ
        </TieuDeMuc>
        <OLoc gt={loc} dat={setLoc} gioiThieu="Tìm thuật ngữ — thử: nghiệp, tùy duyên, oan gia…" />
      </div>

      {nhom.map((g) => {
        const tu = (data.theoCha.get(g.id) ?? []).filter(
          (t) => !q || boDau(`${t.tieu_de} ${loTag(t.tom_tat)}`).includes(q)
        );
        if (!tu.length) return null;
        return (
          <section key={g.id}>
            <h3 className="mb-3 text-than font-semibold">{g.tieu_de}</h3>
            <dl className="grid gap-2.5 md:grid-cols-2">
              {tu.map((t) => (
                <div key={t.id} className="the p-4">
                  <dt className="font-chu text-phu font-semibold">{t.tieu_de}</dt>
                  <VanGoc html={t.tom_tat} className="mt-1 text-ghi text-nhat" />
                </div>
              ))}
            </dl>
          </section>
        );
      })}

      {!q && capNham.length > 0 && (
        <section>
          <h3 className="mb-3 text-than font-semibold">Những cặp câu từ dễ nhầm</h3>
          <div className="space-y-2.5">
            {capNham.map((c) => (
              <div key={c.id} className="the p-4">
                <div className="font-chu text-phu font-semibold">{c.tieu_de}</div>
                <VanGoc html={c.tom_tat} className="mt-1 text-ghi text-nhat" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
