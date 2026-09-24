/** Tầng 3 · Nội dung: Kho Trí tuệ (trình soạn cây), Module, Trang công khai, Bài viết. */
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronRight, Eye, EyeOff, FileEdit, Lock, Plus, Users } from 'lucide-react';
import { layBaiViet, layCay, layModule, suaNut, themNut, type SuaNutInput, type ThemNutInput } from '@/lib/nguon';
import { useAuth } from '@/hooks/useAuth';
import { QUYEN } from '@/lib/quyen';
import { ChiNhan } from '@/components/kho/ChiNhan';
import { Button } from '@/components/ui/button';
import { DangTai, Nhan, O, OVung, The, TieuDeMuc, Trong } from '@/components/ui/co-ban';
import { HopThoai, OChon, Truong } from '@/components/ui/hop-thoai';
import { TEN_LOAI, TEN_NHAN, TEN_TRANG_THAI_ND, type Nhan as NhanNut, type Nut, type PhamVi, type TrangThaiND } from '@/types/kho';
import { boDau, cn, loTag } from '@/lib/utils';

const BIEU_PHAM_VI: Record<PhamVi, { chu: string; Icon: typeof Eye; lop: string }> = {
  cong_khai: { chu: 'Công khai', Icon: Eye, lop: 'bg-nhan-nhe text-nhan' },
  thanh_vien: { chu: 'Thành viên', Icon: Users, lop: 'bg-muc/5 text-nhat' },
  gioi_han: { chu: 'Giới hạn', Icon: Lock, lop: 'bg-canh text-am' },
};

/* ═══ Kho Trí tuệ — trình soạn cây ════════════════════════════════════ */
export function KhoNoiDung() {
  const { coQuyen } = useAuth();
  const [slug, setSlug] = useState('cay-kien-thuc');
  const [loc, setLoc] = useState('');
  const [chon, setChon] = useState<Nut | null>(null);
  const [hop, setHop] = useState<'them' | 'sua' | 'pham_vi' | null>(null);
  const dongHop = useCallback(() => setHop(null), []);
  const qc = useQueryClient();

  const { data: mods } = useQuery({ queryKey: ['module'], queryFn: layModule });
  const moduleId = mods?.find((m) => m.slug === slug)?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['kho-admin', moduleId],
    queryFn: () => layCay(moduleId!),
    enabled: Boolean(moduleId),
  });

  const goc = useMemo(() => {
    if (!data) return [];
    const con = new Set(data.nut.filter((n) => n.cha_id).map((n) => n.id));
    return data.nut.filter((n) => !n.cha_id || !con.has(n.id)).filter((n) => !n.cha_id);
  }, [data]);

  const q = boDau(loc.trim());
  const suaDuoc = coQuyen(QUYEN.ND_SUA);
  const xuatBanDuoc = coQuyen(QUYEN.ND_XUAT_BAN);

  const daLuu = (n: Nut, loiNhan: string) => {
    setChon(n);
    setHop(null);
    void qc.invalidateQueries({ queryKey: ['kho-admin', moduleId] });
    toast.success(loiNhan);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <TieuDeMuc phu="Toàn bộ nội dung nằm trong một cây. Chọn module ở dưới, bấm vào một mục để xem và sửa.">
            Kho Trí tuệ
          </TieuDeMuc>
        </div>
        <Button size="sm" disabled={!suaDuoc || !moduleId} onClick={() => setHop('them')}>
          <Plus size={15} /> Thêm mục
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(mods ?? []).map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSlug(m.slug);
              setChon(null);
            }}
            className={cn(
              'rounded-full px-3 py-1.5 text-vi transition-colors',
              slug === m.slug ? 'bg-nhan text-white' : 'border border-vien bg-giay text-nhat hover:text-muc'
            )}
          >
            {m.ten}
          </button>
        ))}
      </div>

      <input
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        type="search"
        placeholder="Lọc trong module này…"
        className="mb-4 h-9 w-full max-w-sm rounded-lg border border-vien bg-giay px-3 text-ghi placeholder:text-nhat/70 focus:border-nhan/40 focus:outline-none focus:ring-2 focus:ring-nhan/15"
      />

      {isLoading && <DangTai dong={8} />}

      {data && (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-1.5">
            {goc
              .filter((n) => !q || boDau(`${n.ma} ${n.tieu_de}`).includes(q))
              .map((n) => (
                <DongNut key={n.id} nut={n} theoCha={data.theoCha} sau={0} chon={chon} datChon={setChon} loc={q} />
              ))}
            {!goc.length && <Trong>Module này chưa có nội dung.</Trong>}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {chon ? (
              <BangSua
                nut={chon}
                suaDuoc={suaDuoc}
                xuatBanDuoc={xuatBanDuoc}
                moSua={() => setHop('sua')}
                moPhamVi={() => setHop('pham_vi')}
              />
            ) : (
              <The className="text-ghi text-nhat">Chọn một mục bên trái để xem chi tiết.</The>
            )}
          </aside>
        </div>
      )}

      {hop === 'sua' && chon && (
        <FormSua nut={chon} dong={dongHop} xong={(n) => daLuu(n, 'Đã lưu thay đổi.')} />
      )}
      {hop === 'pham_vi' && chon && (
        <FormPhamVi nut={chon} dong={dongHop} xong={(n) => daLuu(n, 'Đã đổi phạm vi.')} />
      )}
      {hop === 'them' && data && moduleId && (
        <FormThem
          moduleId={moduleId}
          cha={chon}
          tatCa={data.nut}
          theoCha={data.theoCha}
          xuatBanDuoc={xuatBanDuoc}
          dong={dongHop}
          xong={(n) => daLuu(n, 'Đã thêm mục mới.')}
        />
      )}
    </div>
  );
}

function DongNut({
  nut, theoCha, sau, chon, datChon, loc,
}: {
  nut: Nut;
  theoCha: Map<string | null, Nut[]>;
  sau: number;
  chon: Nut | null;
  datChon: (n: Nut) => void;
  loc: string;
}) {
  const [mo, setMo] = useState(false);
  const con = theoCha.get(nut.id) ?? [];
  const pv = BIEU_PHAM_VI[nut.pham_vi];

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
          chon?.id === nut.id ? 'border-nhan bg-nhan-nhe' : 'border-vien bg-giay hover:border-nhan/30'
        )}
        style={{ marginLeft: sau * 16 }}
      >
        <button
          onClick={() => setMo(!mo)}
          disabled={!con.length}
          className={cn('shrink-0 text-nhat', !con.length && 'invisible')}
          aria-label="Mở/đóng"
        >
          <ChevronRight size={14} className={cn('transition-transform', mo && 'rotate-90')} />
        </button>

        <button onClick={() => datChon(nut)} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <Nhan className="bg-muc/5 text-mac text-nhat">{TEN_LOAI[nut.loai] ?? nut.loai}</Nhan>
            {nut.ma && <code className="text-mac text-nhan">{nut.ma}</code>}
            <span className="truncate text-ghi font-medium">{nut.tieu_de}</span>
          </div>
        </button>

        <ChiNhan nhan={nut.nhan} className="shrink-0" />
        <Nhan className={cn('shrink-0 gap-1', pv.lop)}>
          <pv.Icon size={10} /> {pv.chu}
        </Nhan>
        {nut.trang_thai !== 'xuat_ban' && (
          <Nhan className="shrink-0 gap-1 bg-canh text-am"><EyeOff size={10} /> Nháp</Nhan>
        )}
        {con.length > 0 && <span className="shrink-0 text-mac text-nhat">{con.length}</span>}
      </div>

      {mo &&
        con
          .filter((c) => !loc || boDau(`${c.ma} ${c.tieu_de}`).includes(loc))
          .map((c) => (
            <DongNut key={c.id} nut={c} theoCha={theoCha} sau={sau + 1} chon={chon} datChon={datChon} loc={loc} />
          ))}
    </>
  );
}

function BangSua({
  nut, suaDuoc, xuatBanDuoc, moSua, moPhamVi,
}: {
  nut: Nut;
  suaDuoc: boolean;
  xuatBanDuoc: boolean;
  moSua: () => void;
  moPhamVi: () => void;
}) {
  const dong = (t: string, v: React.ReactNode) => (
    <div className="border-b border-vien py-2.5 last:border-0">
      <div className="text-mac uppercase text-nhat">{t}</div>
      <div className="mt-0.5 text-ghi">{v}</div>
    </div>
  );

  return (
    <The className="space-y-1">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="font-chu text-than font-semibold leading-snug">{nut.tieu_de}</div>
        <FileEdit size={15} className="mt-1 shrink-0 text-nhat" />
      </div>

      {dong('Loại', TEN_LOAI[nut.loai] ?? nut.loai)}
      {nut.ma && dong('Mã', <code>{nut.ma}</code>)}
      {dong('Phạm vi', BIEU_PHAM_VI[nut.pham_vi].chu)}
      {dong('Trạng thái', TEN_TRANG_THAI_ND[nut.trang_thai] ?? nut.trang_thai)}
      {nut.nhan && dong('Nhãn', <ChiNhan nhan={nut.nhan} />)}
      {nut.tom_tat && dong('Tóm tắt', <span className="text-nhat">{loTag(nut.tom_tat)}</span>)}
      {nut.noi_dung && dong('Nội dung', <span className="text-nhat">{loTag(nut.noi_dung).slice(0, 260)}…</span>)}
      {Object.keys(nut.du_lieu ?? {}).length > 0 &&
        dong(
          'Dữ liệu riêng',
          <pre className="overflow-x-auto rounded bg-muc/5 p-2 text-mac leading-snug">
            {JSON.stringify(nut.du_lieu, null, 1)}
          </pre>
        )}

      <div className="flex gap-2 pt-3">
        <Button size="sm" disabled={!suaDuoc} onClick={moSua}>Sửa</Button>
        <Button size="sm" variant="vien" disabled={!xuatBanDuoc} onClick={moPhamVi}>Đổi phạm vi</Button>
      </div>
      {!suaDuoc && <p className="pt-2 text-vi text-nhat">Cần quyền <code>ND_SUA</code> mới sửa được.</p>}
      {suaDuoc && !xuatBanDuoc && (
        <p className="pt-2 text-vi text-nhat">Đổi phạm vi cần quyền <code>ND_XUAT_BAN</code>.</p>
      )}
    </The>
  );
}

/* ═══ Các hộp thoại soạn nội dung ═════════════════════════════════════ */

const loiRa = (e: unknown) => (e instanceof Error ? e.message : 'Chưa lưu được. Thử lại sau.');
const rongThanhNull = (v: string) => (v.trim() ? v : null);

function ChonNhan({ gia, doi }: { gia: string; doi: (v: string) => void }) {
  return (
    <OChon value={gia} onChange={(e) => doi(e.target.value)}>
      <option value="">— Không gắn nhãn —</option>
      {(Object.keys(TEN_NHAN) as NhanNut[]).map((k) => (
        <option key={k} value={k}>{TEN_NHAN[k].chu}</option>
      ))}
    </OChon>
  );
}

function NutLuu({ dangLuu, dong, chu }: { dangLuu: boolean; dong: () => void; chu: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" size="sm" variant="vien" onClick={dong} disabled={dangLuu}>Huỷ</Button>
      <Button type="submit" size="sm" disabled={dangLuu}>{dangLuu ? 'Đang lưu…' : chu}</Button>
    </div>
  );
}

/* ── Sửa nội dung một mục ── */
function FormSua({ nut, dong, xong }: { nut: Nut; dong: () => void; xong: (n: Nut) => void }) {
  const [ma, setMa] = useState(nut.ma ?? '');
  const [tieuDe, setTieuDe] = useState(nut.tieu_de);
  const [tomTat, setTomTat] = useState(nut.tom_tat ?? '');
  const [noiDung, setNoiDung] = useState(nut.noi_dung ?? '');
  const [nhan, setNhan] = useState<string>(nut.nhan ?? '');
  const [thuTu, setThuTu] = useState(String(nut.thu_tu));

  const luu = useMutation({
    mutationFn: (t: SuaNutInput) => suaNut(nut.id, t),
    onSuccess: xong,
    onError: (e) => toast.error(loiRa(e)),
  });

  return (
    <HopThoai mo dong={dong} tieuDe="Sửa mục" phu={`${TEN_LOAI[nut.loai] ?? nut.loai}${nut.ma ? ` · ${nut.ma}` : ''}`} rong="max-w-2xl">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!tieuDe.trim()) return toast.error('Tiêu đề không được để trống.');
          luu.mutate({
            ma: rongThanhNull(ma),
            tieu_de: tieuDe.trim(),
            tom_tat: rongThanhNull(tomTat),
            noi_dung: rongThanhNull(noiDung),
            nhan: (nhan || null) as NhanNut | null,
            thu_tu: Number.parseInt(thuTu, 10) || 0,
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <Truong nhan="Mã"><O value={ma} onChange={(e) => setMa(e.target.value)} /></Truong>
          <Truong nhan="Tiêu đề"><O value={tieuDe} onChange={(e) => setTieuDe(e.target.value)} required /></Truong>
        </div>
        <Truong nhan="Tóm tắt" phu="Cho phép thẻ HTML đơn giản như <b>, <i>, <br>.">
          <OVung rows={3} value={tomTat} onChange={(e) => setTomTat(e.target.value)} />
        </Truong>
        <Truong nhan="Nội dung">
          <OVung rows={8} value={noiDung} onChange={(e) => setNoiDung(e.target.value)} />
        </Truong>
        <div className="grid gap-3 sm:grid-cols-2">
          <Truong nhan="Nhãn nguồn gốc"><ChonNhan gia={nhan} doi={setNhan} /></Truong>
          <Truong nhan="Thứ tự" phu="Số nhỏ đứng trước.">
            <O type="number" value={thuTu} onChange={(e) => setThuTu(e.target.value)} />
          </Truong>
        </div>
        {Object.keys(nut.du_lieu ?? {}).length > 0 && (
          <p className="text-mac text-nhat">Phần “Dữ liệu riêng” chưa sửa được ở đây — giữ nguyên.</p>
        )}
        <NutLuu dangLuu={luu.isPending} dong={dong} chu="Lưu" />
      </form>
    </HopThoai>
  );
}

/* ── Đổi phạm vi & trạng thái ── */
const MO_TA_PHAM_VI: Record<PhamVi, string> = {
  cong_khai: 'Ai cũng xem được, kể cả người chưa đăng ký.',
  thanh_vien: 'Chỉ thành viên đã được duyệt.',
  gioi_han: 'Chỉ người được cấp riêng module này.',
};

function FormPhamVi({ nut, dong, xong }: { nut: Nut; dong: () => void; xong: (n: Nut) => void }) {
  const [phamVi, setPhamVi] = useState<PhamVi>(nut.pham_vi);
  const [trangThai, setTrangThai] = useState<TrangThaiND>(nut.trang_thai);

  const luu = useMutation({
    mutationFn: () => suaNut(nut.id, { pham_vi: phamVi, trang_thai: trangThai }),
    onSuccess: xong,
    onError: (e) => toast.error(loiRa(e)),
  });

  return (
    <HopThoai mo dong={dong} tieuDe="Đổi phạm vi" phu={nut.tieu_de}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); luu.mutate(); }}>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-vi font-medium text-muc">Ai được xem</legend>
          {(Object.keys(BIEU_PHAM_VI) as PhamVi[]).map((k) => {
            const pv = BIEU_PHAM_VI[k];
            return (
              <label
                key={k}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5',
                  phamVi === k ? 'border-nhan bg-nhan-nhe' : 'border-vien hover:border-nhan/30'
                )}
              >
                <input type="radio" name="pham_vi" className="mt-1" checked={phamVi === k} onChange={() => setPhamVi(k)} />
                <span>
                  <span className="flex items-center gap-1.5 text-ghi font-medium"><pv.Icon size={13} /> {pv.chu}</span>
                  <span className="block text-vi text-nhat">{MO_TA_PHAM_VI[k]}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
        <Truong nhan="Trạng thái" phu="Chỉ mục “Đã xuất bản” mới hiện cho người học.">
          <OChon value={trangThai} onChange={(e) => setTrangThai(e.target.value as TrangThaiND)}>
            {(Object.keys(TEN_TRANG_THAI_ND) as TrangThaiND[]).map((k) => (
              <option key={k} value={k}>{TEN_TRANG_THAI_ND[k]}</option>
            ))}
          </OChon>
        </Truong>
        {nut.pham_vi !== phamVi && (
          <p className="text-vi text-nhat">Chỉ đổi mục này — các mục con giữ phạm vi riêng của chúng.</p>
        )}
        <NutLuu dangLuu={luu.isPending} dong={dong} chu="Lưu" />
      </form>
    </HopThoai>
  );
}

/* ── Thêm mục mới ── */
function FormThem({
  moduleId, cha, tatCa, theoCha, xuatBanDuoc, dong, xong,
}: {
  moduleId: string;
  cha: Nut | null;
  tatCa: Nut[];
  theoCha: Map<string | null, Nut[]>;
  xuatBanDuoc: boolean;
  dong: () => void;
  xong: (n: Nut) => void;
}) {
  const [chaId, setChaId] = useState<string>(cha?.id ?? '');
  const anhEm = theoCha.get(chaId || null) ?? [];
  const loaiGoiY = anhEm[0]?.loai ?? cha?.loai ?? 'phan';

  const [loai, setLoai] = useState<string>(loaiGoiY);
  const [ma, setMa] = useState('');
  const [tieuDe, setTieuDe] = useState('');
  const [tomTat, setTomTat] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [nhan, setNhan] = useState('');
  const [phamVi, setPhamVi] = useState<PhamVi>(cha?.pham_vi ?? 'thanh_vien');
  const [trangThai, setTrangThai] = useState<TrangThaiND>(xuatBanDuoc ? 'xuat_ban' : 'nhap');

  const doiCha = (id: string) => {
    setChaId(id);
    const ae = theoCha.get(id || null) ?? [];
    const c = tatCa.find((n) => n.id === id);
    setLoai(ae[0]?.loai ?? c?.loai ?? 'phan');
    if (c) setPhamVi(c.pham_vi);
  };

  const luu = useMutation({
    mutationFn: (t: ThemNutInput) => themNut(t),
    onSuccess: xong,
    onError: (e) => toast.error(loiRa(e)),
  });

  const dsCha = useMemo(
    () => [...tatCa].sort((a, b) => (a.ma ?? a.tieu_de).localeCompare(b.ma ?? b.tieu_de, 'vi', { numeric: true })),
    [tatCa]
  );

  return (
    <HopThoai mo dong={dong} tieuDe="Thêm mục" phu="Mục mới sẽ nằm cuối danh sách con của mục cha." rong="max-w-2xl">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!tieuDe.trim()) return toast.error('Tiêu đề không được để trống.');
          const thuTu = Math.max(-1, ...anhEm.map((n) => n.thu_tu)) + 1;
          luu.mutate({
            module_id: moduleId,
            cha_id: chaId || null,
            loai,
            ma: rongThanhNull(ma),
            tieu_de: tieuDe.trim(),
            tom_tat: rongThanhNull(tomTat),
            noi_dung: rongThanhNull(noiDung),
            nhan: (nhan || null) as NhanNut | null,
            thu_tu: thuTu,
            pham_vi: phamVi,
            trang_thai: xuatBanDuoc ? trangThai : 'nhap',
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Truong nhan="Nằm trong">
            <OChon value={chaId} onChange={(e) => doiCha(e.target.value)}>
              <option value="">— Cấp gốc của module —</option>
              {dsCha.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.ma ? `${n.ma} · ` : ''}{n.tieu_de.slice(0, 60)}
                </option>
              ))}
            </OChon>
          </Truong>
          <Truong nhan="Loại">
            <OChon value={loai} onChange={(e) => setLoai(e.target.value)}>
              {!TEN_LOAI[loai] && <option value={loai}>{loai}</option>}
              {Object.entries(TEN_LOAI).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </OChon>
          </Truong>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <Truong nhan="Mã" phu="Không bắt buộc."><O value={ma} onChange={(e) => setMa(e.target.value)} /></Truong>
          <Truong nhan="Tiêu đề"><O value={tieuDe} onChange={(e) => setTieuDe(e.target.value)} required autoFocus /></Truong>
        </div>
        <Truong nhan="Tóm tắt">
          <OVung rows={2} value={tomTat} onChange={(e) => setTomTat(e.target.value)} />
        </Truong>
        <Truong nhan="Nội dung">
          <OVung rows={5} value={noiDung} onChange={(e) => setNoiDung(e.target.value)} />
        </Truong>
        <div className="grid gap-3 sm:grid-cols-3">
          <Truong nhan="Nhãn nguồn gốc"><ChonNhan gia={nhan} doi={setNhan} /></Truong>
          <Truong nhan="Phạm vi">
            <OChon value={phamVi} onChange={(e) => setPhamVi(e.target.value as PhamVi)}>
              {(Object.keys(BIEU_PHAM_VI) as PhamVi[]).map((k) => (
                <option key={k} value={k}>{BIEU_PHAM_VI[k].chu}</option>
              ))}
            </OChon>
          </Truong>
          <Truong nhan="Trạng thái" phu={xuatBanDuoc ? undefined : 'Cần quyền xuất bản — sẽ lưu dạng Nháp.'}>
            <OChon value={xuatBanDuoc ? trangThai : 'nhap'} disabled={!xuatBanDuoc}
              onChange={(e) => setTrangThai(e.target.value as TrangThaiND)}>
              {(Object.keys(TEN_TRANG_THAI_ND) as TrangThaiND[]).map((k) => (
                <option key={k} value={k}>{TEN_TRANG_THAI_ND[k]}</option>
              ))}
            </OChon>
          </Truong>
        </div>
        <NutLuu dangLuu={luu.isPending} dong={dong} chu="Thêm" />
      </form>
    </HopThoai>
  );
}

/* ═══ Module ══════════════════════════════════════════════════════════ */
export function ModuleQL() {
  const { data } = useQuery({ queryKey: ['module'], queryFn: layModule });

  return (
    <div className="mx-auto max-w-4xl">
      <TieuDeMuc phu="Module là đơn vị bạn cấp cho thành viên. Đặt phạm vi 'Giới hạn' thì chỉ ai được cấp riêng mới thấy.">
        Module học
      </TieuDeMuc>

      <div className="space-y-2.5">
        {(data ?? []).map((m) => {
          const pv = BIEU_PHAM_VI[m.pham_vi];
          return (
            <The key={m.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-chu text-than font-semibold">{m.ten}</span>
                  <code className="text-mac text-nhat">{m.slug}</code>
                </div>
                <p className="mt-0.5 text-ghi text-nhat">{m.mo_ta}</p>
              </div>
              <Nhan className={cn('gap-1', pv.lop)}><pv.Icon size={10} /> {pv.chu}</Nhan>
              <Button size="sm" variant="vien" disabled>Cấp cho thành viên</Button>
            </The>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ Trang công khai ═════════════════════════════════════════════════ */
const TRANG = [
  ['trang-chu', 'Trang chủ', 'Landing page — khối mở đầu, bảy khối bất ổn, “đây không phải là gì”, lộ trình, vì sao phải duyệt'],
  ['tri-tue-la-gi', 'Trí tuệ là gì', 'Giải thích khái niệm và mục lục 11 phần'],
  ['hoc-the-nao', 'Học thế nào', 'Mạch 5 bước và cách tự định vị'],
  ['cam-ket', 'Cam kết của chúng tôi', 'Bảy cam kết minh bạch — phần quan trọng nhất để người mới yên tâm'],
  ['cau-hoi', 'Hỏi đáp', 'Những câu hay được hỏi'],
];

export function TrangQL() {
  return (
    <div className="mx-auto max-w-4xl">
      <TieuDeMuc phu="Nội dung tầng 1. Mỗi trang lưu thành mảng khối trong cột jsonb — sửa được từng khối, không đụng vào code.">
        Trang công khai
      </TieuDeMuc>
      <div className="space-y-2.5">
        {TRANG.map(([slug, ten, mo]) => (
          <The key={slug} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-chu text-than font-semibold">{ten}</span>
                <code className="text-mac text-nhat">/{slug === 'trang-chu' ? '' : slug}</code>
              </div>
              <p className="mt-0.5 text-ghi text-nhat">{mo}</p>
            </div>
            <Button size="sm" variant="vien" disabled>Sửa</Button>
          </The>
        ))}
      </div>
      <p className="mt-4 text-vi leading-relaxed text-nhat">
        Giai đoạn 1 các trang này viết cứng trong code để đi nhanh. Bảng <code>trang</code> đã sẵn sàng; giai đoạn 2
        chuyển nội dung vào DB rồi bật trình soạn khối ở đây.
      </p>
    </div>
  );
}

/* ═══ Bài viết ════════════════════════════════════════════════════════ */
export function BaiVietQL() {
  const { data, isLoading, error } = useQuery({ queryKey: ['bai-viet'], queryFn: layBaiViet });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-end justify-between gap-3">
        <TieuDeMuc phu="Bài công khai hiện ở tầng 1; bài phạm vi 'thành viên' chỉ người đã duyệt đọc được.">
          Bài viết
        </TieuDeMuc>
        <Button size="sm" disabled><Plus size={15} /> Viết bài</Button>
      </div>

      {isLoading && <DangTai dong={4} />}
      {error && <Trong>Chưa đọc được danh sách bài viết.</Trong>}

      {data && (
        data.length ? (
          <div className="space-y-2.5">
            {data.map((b) => {
              const pv = BIEU_PHAM_VI[b.pham_vi];
              return (
                <The key={b.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-chu text-than font-semibold">{b.tieu_de}</span>
                      <code className="text-mac text-nhat">/{b.slug}</code>
                    </div>
                    {b.tom_tat && <p className="mt-0.5 text-ghi text-nhat">{loTag(b.tom_tat)}</p>}
                  </div>
                  <Nhan className={cn('gap-1', pv.lop)}><pv.Icon size={10} /> {pv.chu}</Nhan>
                  <Button size="sm" variant="vien" disabled>Sửa</Button>
                </The>
              );
            })}
          </div>
        ) : (
          <Trong>Chưa có bài viết nào.</Trong>
        )
      )}
    </div>
  );
}
