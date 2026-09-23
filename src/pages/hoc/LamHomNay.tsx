/** Hai màn hình "làm gì hôm nay": Lộ trình học · Sống hằng ngày. */
import { useQuery } from '@tanstack/react-query';
import { layCay, layModuleTheoSlug } from '@/lib/nguon';
import { ChiNhan, VanGoc } from '@/components/kho/ChiNhan';
import { DangTai, Nhan, The, TieuDeMuc, Trong } from '@/components/ui/co-ban';
import { loTag } from '@/lib/utils';

function useCay(slug: string) {
  return useQuery({
    queryKey: ['cay', slug],
    queryFn: async () => {
      const m = await layModuleTheoSlug(slug);
      if (!m) return null;
      return { module: m, ...(await layCay(m.id)) };
    },
  });
}

/* ═══ Lộ trình học ════════════════════════════════════════════════════ */
export function LoTrinh() {
  const { data, isLoading } = useCay('lo-trinh');
  if (isLoading) return <DangTai dong={6} />;
  if (!data) return <Trong>Chưa có nội dung cho module này.</Trong>;

  const buoc = data.nut.filter((n) => n.loai === 'buoc');
  const boTro = data.nut.filter((n) => n.loai === 'bo_tro');
  const nhomHoc = data.nut.filter((n) => n.loai === 'nhom_hoc');
  const ctHoc = data.nut.filter((n) => n.loai === 'cong_thuc_hoc');

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <section>
        <TieuDeMuc phu="Đi tuần tự. Mỗi bước có đích riêng — chưa đạt đích thì chưa sang bước sau.">
          Chương trình 5 bước
        </TieuDeMuc>
        <ol className="space-y-3">
          {buoc.map((b, i) => (
            <li key={b.id}>
              <The className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-nhan text-than font-semibold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-chu text-dan font-semibold">{b.tieu_de}</div>
                  <p className="mt-1 text-phu leading-relaxed text-nhat">
                    <b className="font-medium text-muc">Đích:</b> {loTag(b.tom_tat)}
                  </p>
                  {typeof b.du_lieu?.mach === 'string' && (
                    <p className="mt-1 text-ghi text-nhat">Mạch: {b.du_lieu.mach as string}</p>
                  )}
                  <ul className="mt-3 space-y-2">
                    {(data.theoCha.get(b.id) ?? []).map((y) => (
                      <li key={y.id} className="flex gap-2.5">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-nhan" />
                        <VanGoc html={y.noi_dung ?? y.tieu_de} className="text-phu" />
                      </li>
                    ))}
                  </ul>
                </div>
              </The>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <TieuDeMuc phu="Chạy song song với 5 bước — dùng khi gặp đúng tình huống, không phải học tuần tự.">
          Chương trình bổ trợ — {boTro.length} mục
        </TieuDeMuc>
        <div className="grid gap-2.5 md:grid-cols-2">
          {boTro.map((b) => (
            <The key={b.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="font-chu text-phu font-semibold">{b.tieu_de}</div>
                <ChiNhan nhan={b.nhan} />
              </div>
              <VanGoc html={b.tom_tat} className="mt-1.5 text-ghi text-nhat" />
              {typeof b.du_lieu?.khi === 'string' && (
                <div className="mt-2 text-vi text-nhat">
                  <b className="font-medium text-muc">Khi nào:</b> {b.du_lieu.khi as string}
                </div>
              )}
            </The>
          ))}
        </div>
      </section>

      <section>
        <TieuDeMuc phu="Định vị đúng nhóm để không học lệch.">Bạn thuộc nhóm nào</TieuDeMuc>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {nhomHoc.map((n) => (
            <The key={n.id} className="p-4">
              <div className="text-phu font-medium">{n.tieu_de}</div>
              <div className="mt-1 text-ghi leading-snug text-nhat">{loTag(n.tom_tat)}</div>
            </The>
          ))}
        </div>
      </section>

      <section>
        <TieuDeMuc phu="Dùng mỗi khi học một ý mới.">Công thức học</TieuDeMuc>
        <div className="flex flex-wrap gap-2">
          {ctHoc.map((c) => (
            <div key={c.id} className="rounded-lg border border-vien bg-giay px-4 py-3">
              <div className="text-phu font-medium">{c.tieu_de}</div>
              <div className="text-vi text-nhat">{loTag(c.tom_tat)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══ Sống hằng ngày ══════════════════════════════════════════════════ */
export function SongHangNgay() {
  const { data, isLoading } = useCay('song-hang-ngay');
  if (isLoading) return <DangTai dong={6} />;
  if (!data) return <Trong>Chưa có nội dung cho module này.</Trong>;

  const chuKy = data.nut.filter((n) => n.loai === 'chu_ky');
  const phanXa = data.nut.filter((n) => n.loai === 'phan_xa');
  const canh = data.nut.filter((n) => n.loai === 'canh_phat_sinh');
  const datTen = data.nut.filter((n) => n.loai === 'dat_ten_canh');
  const ngoai = data.nut.find((n) => n.loai === 'khuon_ngoai');

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <section>
        <TieuDeMuc phu="Việc gì làm lúc nào — chạy đều thì không phải nghĩ.">Chu kỳ</TieuDeMuc>
        <div className="grid gap-2.5 md:grid-cols-2">
          {chuKy.map((c) => (
            <The key={c.id} className="p-4">
              <div className="font-chu text-phu font-semibold">{c.tieu_de}</div>
              <ul className="mt-2 space-y-1.5">
                {((c.du_lieu?.viec as string[]) ?? []).map((v, i) => (
                  <li key={i} className="flex gap-2 text-ghi">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-nhan" />
                    <VanGoc html={v} />
                  </li>
                ))}
              </ul>
            </The>
          ))}
        </div>
      </section>

      <section>
        <TieuDeMuc phu="Gặp việc thì chạy theo mạch này, không tự nghĩ.">Phản xạ của người Trí tuệ</TieuDeMuc>
        <div className="grid gap-2.5 md:grid-cols-2">
          {phanXa.map((p) => (
            <The key={p.id} className="p-4">
              <div className="font-chu text-phu font-semibold">{p.tieu_de}</div>
              <ol className="mt-2 space-y-1.5">
                {((p.du_lieu?.buoc as string[]) ?? []).map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-ghi">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-nhan-nhe text-mac font-semibold text-nhan">
                      {i + 1}
                    </span>
                    <VanGoc html={b} />
                  </li>
                ))}
              </ol>
            </The>
          ))}
        </div>
      </section>

      <section>
        <TieuDeMuc phu="Việc ngoài kế hoạch không phải là rủi ro — là cảnh đến để mình xử.">
          Khi có việc phát sinh
        </TieuDeMuc>
        <div className="space-y-2.5">
          {canh.map((c) => (
            <The key={c.id} className="p-4">
              <div className="font-chu text-phu font-semibold">{c.tieu_de}</div>
              <VanGoc html={c.tom_tat} className="mt-1 text-ghi text-nhat" />
              <VanGoc html={c.noi_dung} className="mt-1.5 text-ghi" />
            </The>
          ))}
        </div>
        {datTen.length > 0 && (
          <div className="mt-4 rounded-xl bg-nhan-nhe px-5 py-4">
            <div className="mb-2 text-ghi font-semibold text-nhan">Đặt tên cho cảnh</div>
            <ul className="space-y-1.5">
              {datTen.map((d) => (
                <li key={d.id} className="text-phu">
                  <VanGoc html={d.noi_dung ?? d.tieu_de} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {ngoai && (
        <section>
          <TieuDeMuc>{ngoai.tieu_de}</TieuDeMuc>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(ngoai.du_lieu as Record<string, unknown>).map(([k, v]) => (
              <The key={k} className="p-4">
                <div className="mb-2 text-mac font-semibold uppercase text-nhat">{k}</div>
                <ul className="space-y-1.5">
                  {(Array.isArray(v) ? v : []).map((item, i) => (
                    <li key={i} className="flex gap-2 text-ghi">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-nhan" />
                      {typeof item === 'string' ? (
                        <VanGoc html={item} />
                      ) : (
                        <span>
                          <b className="font-medium">{(item as { t: string }).t}</b> — {(item as { n: string }).n}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </The>
            ))}
          </div>
          <p className="mt-3 text-vi text-nhat">
            <Nhan className="bg-canh text-am">Lưu ý</Nhan> Khối này lấy nguyên văn từ tài liệu gốc; cấu trúc chi tiết
            sẽ được admin biên tập lại trong Khu quản trị.
          </p>
        </section>
      )}
    </div>
  );
}
