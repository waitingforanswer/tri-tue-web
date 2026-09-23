/** Các trang nội dung tầng 1. Sau này admin sửa được qua bảng `trang` (jsonb khối). */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { guiGopY, layBaiViet, layModuleTheoSlug, layNut } from '@/lib/nguon';
import { Button } from '@/components/ui/button';
import { DangTai, DongNhan, O, OVung, The, Trong } from '@/components/ui/co-ban';
import { cn, loTag } from '@/lib/utils';

function Bia({ tren, tieu, mo }: { tren: string; tieu: string; mo: string }) {
  return (
    <div className="border-b border-vien">
      <div className="container max-w-3xl py-16">
        <div className="text-vi font-semibold uppercase tracking-wide text-nhan">{tren}</div>
        <h1 className="mt-2 text-de-bia font-semibold leading-tight">{tieu}</h1>
        <p className="mt-4 text-dan leading-relaxed text-nhat">{mo}</p>
      </div>
    </div>
  );
}

/* ═══ Trí tuệ là gì ═══════════════════════════════════════════════════ */
export function TriTueLaGi() {
  const { data } = useQuery({
    queryKey: ['cong-khai', 'nguyen-ly'],
    queryFn: async () => {
      const m = await layModuleTheoSlug('cay-kien-thuc');
      if (!m) return [];
      const phan = await layNut({ module: m.id, loai: 'phan' });
      return phan;
    },
  });

  return (
    <>
      <Bia
        tren="Vào cửa"
        tieu="Trí tuệ là gì"
        mo="Không phải sự thông minh, cũng không phải kiến thức sách vở. Trí tuệ ở đây là cái nhìn xuyên suốt: thấy được gốc của việc đang xảy ra, và biết việc cần làm."
      />

      <div className="container max-w-3xl space-y-10 py-14">
        <section className="van space-y-4 text-dan text-muc">
          <p>
            Một việc bất ổn xảy ra, phần lớn chúng ta xử lý ở phần <b>ngọn</b>: ai sai, ai đúng, làm sao cho qua
            chuyện. Xong việc này thì việc khác lại đến, cùng một dạng. Đó là dấu hiệu chưa chạm tới gốc.
          </p>
          <p>
            Vốn sống Trí tuệ đưa ra một cách nhìn khác: mỗi cảnh xảy ra đều có <b>nhân</b> của nó. Truy được quả về
            nhân thì biết phải sửa ở đâu. Và quan trọng hơn — có sẵn <b>khuôn</b> để làm, không phải tự nghĩ ra.
          </p>
          <p>
            Cả hệ thống đứng trên ba chân: <b>nguyên lý</b> (cái không đổi), <b>đạo</b> (cách sống theo nguyên lý), và
            <b> pháp</b> (việc làm cụ thể khi gặp cảnh). Thiếu một chân là đổ.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-de-nho font-semibold">Khung kiến thức — 11 phần quy chuẩn</h2>
          <p className="mb-5 text-phu leading-relaxed text-nhat">
            Đây là toàn bộ mục lục. Nội dung chi tiết nằm trong khu học, mở cho thành viên đã được duyệt.
          </p>
          <ol className="space-y-2">
            {(data ?? []).map((p) => (
              <li key={p.id} className="flex gap-3 rounded-lg border border-vien bg-giay px-4 py-3">
                <span className="text-ghi font-semibold text-nhan">{p.ma}</span>
                <div>
                  <div className="text-phu font-medium">{p.tieu_de}</div>
                  <div className="text-ghi leading-snug text-nhat">{loTag(p.tom_tat)}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="rounded-xl bg-nhan-nhe px-5 py-5">
          <p className="text-phu leading-relaxed">
            Đọc đến đây mà thấy có gì đó đúng với tình cảnh của mình, thì bước tiếp theo là xin học. Không thấy gì thì
            cũng không sao — chưa đúng lúc thôi.
          </p>
          <Link to="/dang-ky" className="mt-4 inline-block">
            <Button>Xin học</Button>
          </Link>
        </div>
      </div>
    </>
  );
}

/* ═══ Học thế nào ═════════════════════════════════════════════════════ */
export function HocTheNao() {
  const { data } = useQuery({
    queryKey: ['cong-khai', 'lo-trinh'],
    queryFn: async () => {
      const m = await layModuleTheoSlug('lo-trinh');
      if (!m) return { buoc: [], nhom: [] };
      const [buoc, nhom] = await Promise.all([
        layNut({ module: m.id, loai: 'buoc' }),
        layNut({ module: m.id, loai: 'nhom_hoc' }),
      ]);
      return { buoc, nhom };
    },
  });

  return (
    <>
      <Bia
        tren="Lộ trình"
        tieu="Học thế nào"
        mo="Năm bước, ba giai đoạn, và một trục chạy suốt đời. Học để làm — mỗi tuần làm thật một việc, không học cho biết."
      />

      <div className="container max-w-3xl space-y-12 py-14">
        <section>
          <h2 className="mb-5 text-de-nho font-semibold">Mạch 5 bước</h2>
          <ol className="space-y-3">
            {(data?.buoc ?? []).map((b, i) => (
              <li key={b.id}>
                <The className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-nhan text-phu font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-chu text-dan font-semibold">{b.tieu_de}</div>
                    <p className="mt-1 text-phu leading-relaxed text-nhat">{loTag(b.tom_tat)}</p>
                    {typeof b.du_lieu?.mach === 'string' && (
                      <p className="mt-2 text-ghi text-nhat">Mạch: {b.du_lieu.mach as string}</p>
                    )}
                  </div>
                </The>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-de-nho font-semibold">Bạn thuộc nhóm nào?</h2>
          <p className="mb-5 text-phu leading-relaxed text-nhat">
            Người mới và người đã đi được một đoạn có cách học khác nhau. Tự định vị trước để không học lệch.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(data?.nhom ?? []).map((n) => (
              <The key={n.id} className="p-4">
                <div className="text-phu font-medium">{n.tieu_de}</div>
                <div className="mt-1 text-ghi leading-snug text-nhat">{loTag(n.tom_tat)}</div>
              </The>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

/* ═══ Cam kết ═════════════════════════════════════════════════════════ */
const CAM_KET = [
  ['Miễn phí, mãi mãi', 'Không học phí, không gói trả tiền, không bán tài liệu, không nhận quyên góp qua website. Nếu có ai nhân danh nơi này để thu tiền của bạn, đó là việc làm sai — xin báo lại cho chúng tôi.'],
  ['Không tổ chức, không ràng buộc', 'Đăng ký học không phải là gia nhập. Không lễ nhập môn, không danh sách hội viên, không nghĩa vụ đóng góp, không sinh hoạt bắt buộc. Bạn ngừng học lúc nào cũng được, không cần giải thích.'],
  ['Không thần thánh hoá người dạy', 'Ở đây không có giáo chủ. Người đi trước chỉ là người đi trước. Đích của việc học là để bạn không cần hỏi ai nữa — tự làm thầy cho mình.'],
  ['Không can thiệp vào đời sống riêng của bạn', 'Chúng tôi không khuyên bạn bỏ việc, bỏ gia đình, cắt quan hệ, đổi tín ngưỡng hay chuyển chỗ ở. Trí tuệ dùng để làm tròn hơn những gì bạn đang có.'],
  ['Không dính đến tiền bạc và đầu tư', 'Không dự án, không cơ hội kinh doanh, không mạng lưới, không sản phẩm. Nếu một cuộc trò chuyện nào đó chuyển sang tiền, hãy dừng lại và báo cho chúng tôi.'],
  ['Dữ liệu của bạn là của bạn', 'Ghi chú, phiếu ứng dụng và những gì bạn viết ra trong quá trình học là riêng tư — quản trị viên không đọc được nội dung, chỉ thấy số liệu tổng hợp. Chúng tôi không bán, không chia sẻ thông tin của bạn cho bất kỳ ai.'],
  ['Nói rõ chỗ nào còn trống', 'Tài liệu gốc có những mục mới có tiêu đề, chưa có nội dung. Chỗ nào như vậy đều được đánh dấu "bản gốc còn trống" thay vì bịa cho đủ.'],
];

export function CamKet() {
  return (
    <>
      <Bia
        tren="Minh bạch"
        tieu="Cam kết của chúng tôi"
        mo="Bảy điều dưới đây là ranh giới chúng tôi tự đặt cho mình. Bạn có quyền nhắc lại bất cứ điều nào nếu thấy nơi này làm sai."
      />
      <div className="container max-w-3xl py-14">
        <ol className="space-y-4">
          {CAM_KET.map(([t, n], i) => (
            <li key={t}>
              <The className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nhan-nhe text-vi font-semibold text-nhan">
                  {i + 1}
                </span>
                <div>
                  <div className="font-chu text-dan font-semibold">{t}</div>
                  <p className="mt-1.5 text-phu leading-relaxed text-nhat">{n}</p>
                </div>
              </The>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-xl border border-vien bg-canh px-5 py-4 text-phu leading-relaxed">
          Thấy điều gì ở đây không đúng với thực tế bạn gặp?{' '}
          <Link to="/gop-y" className="font-medium text-nhan underline-offset-2 hover:underline">
            Gửi cho chúng tôi biết
          </Link>
          . Việc đó giúp giữ nơi này sạch.
        </div>
      </div>
    </>
  );
}

/* ═══ Hỏi đáp ═════════════════════════════════════════════════════════ */
const HOI_DAP: [string, string][] = [
  ['Đây có phải là tôn giáo hay một đạo phái không?', 'Không. Không có nghi lễ nhập môn, không có tổ chức để gia nhập, không có người để tôn thờ. Nội dung có nói đến những khái niệm tâm linh vì tài liệu gốc nói như vậy, nhưng bạn hoàn toàn có thể học phần nguyên lý và cách hành xử mà không cần tin vào phần đó.'],
  ['Có phải đóng tiền không?', 'Không, dưới mọi hình thức. Website không có cổng thanh toán.'],
  ['Tôi bận, mỗi tuần chỉ có vài tiếng thì học được không?', 'Được. Lộ trình thiết kế theo kiểu mỗi tuần làm thật một việc nhỏ. Đọc nhiều mà không làm thì cũng không có tác dụng, nên chậm mà làm còn hơn nhanh mà biết suông.'],
  ['Học xong tôi có phải đi rủ người khác không?', 'Không bắt buộc. Nếu bạn thấy nó giúp được mình thì tự nhiên sẽ muốn chỉ lại cho người thân — đó là chuyện của bạn, không phải chỉ tiêu của ai.'],
  ['Vì sao phải chờ duyệt? Bao lâu thì được?', 'Để người phụ trách biết bạn đang gặp gì mà chỉ đúng chỗ bắt đầu, và để chặn những người tìm đến với ý định khác. Thường vài ngày.'],
  ['Hồ sơ tôi viết ra có ai đọc không?', 'Phần đăng ký thì có — người có quyền quản lý thành viên đọc để xét duyệt. Còn ghi chú và phiếu ứng dụng bạn viết trong lúc học thì không ai đọc được ngoài bạn.'],
  ['Tôi không đồng ý với một nội dung nào đó thì sao?', 'Thì cứ để đó, đừng làm theo. Không ai kiểm tra bạn. Trí tuệ nói rất rõ: kiểm chứng bằng thực tế của chính mình, đừng tin vì người khác nói.'],
];

export function CauHoi() {
  const [mo, setMo] = useState<number | null>(0);
  return (
    <>
      <Bia tren="Hỏi đáp" tieu="Những câu hay được hỏi" mo="Phần lớn là câu hỏi về sự an toàn và ràng buộc. Hỏi được như vậy là tốt." />
      <div className="container max-w-3xl py-14">
        <div className="divide-y divide-vien overflow-hidden rounded-xl border border-vien bg-giay">
          {HOI_DAP.map(([h, d], i) => (
            <div key={h}>
              <button
                onClick={() => setMo(mo === i ? null : i)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muc/[0.02]"
              >
                <span className="flex-1 text-than font-medium">{h}</span>
                <ChevronDown size={16} className={cn('shrink-0 text-nhat transition-transform', mo === i && 'rotate-180')} />
              </button>
              {mo === i && <p className="px-5 pb-5 text-phu leading-relaxed text-nhat">{d}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══ Bài viết ════════════════════════════════════════════════════════ */
export function BaiViet() {
  const { data, isLoading } = useQuery({ queryKey: ['bai-viet-cong-khai'], queryFn: layBaiViet });

  return (
    <>
      <Bia tren="Chia sẻ" tieu="Bài viết" mo="Những ghi chép, ví dụ thực tế và câu chuyện của người đang học. Đọc không cần tài khoản." />
      <div className="container max-w-3xl py-14">
        {isLoading && <DangTai dong={4} />}

        {data && (
          data.length ? (
            <div className="divide-y divide-vien">
              {data.map((b) => (
                <article key={b.id} className="py-6 first:pt-0">
                  <h2 className="font-chu text-de-nho font-semibold leading-snug">{b.tieu_de}</h2>
                  {b.xuat_ban_luc && (
                    <div className="mt-1 text-vi text-nhat">
                      {new Date(b.xuat_ban_luc).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                  {b.tom_tat && <p className="mt-2 text-phu leading-relaxed text-nhat">{loTag(b.tom_tat)}</p>}
                </article>
              ))}
            </div>
          ) : (
            <Trong>
              Chưa có bài viết nào được xuất bản.
              <div className="mt-2 text-ghi">
                Quản trị viên đăng bài trong <b>Khu quản trị → Bài viết</b>; bài có phạm vi “công khai” sẽ hiện ở đây.
              </div>
            </Trong>
          )
        )}
      </div>
    </>
  );
}

/* ═══ Góp ý ═══════════════════════════════════════════════════════════ */
export function GopY() {
  const [xong, setXong] = useState(false);
  const gui = useMutation({
    mutationFn: guiGopY,
    onSuccess: () => setXong(true),
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Chưa gửi được, thử lại giúp tôi.'),
  });

  return (
    <>
      <Bia
        tren="Liên hệ"
        tieu="Gửi góp ý"
        mo="Câu hỏi, phản ánh, hay báo cho chúng tôi biết nếu có ai mượn danh nơi này để làm việc không đúng."
      />
      <div className="container max-w-2xl py-14">
        {xong ? (
          <The className="text-center">
            <div className="font-chu text-de-nho font-semibold">Đã nhận được. Cảm ơn bạn.</div>
            <p className="mt-2 text-phu text-nhat">Chúng tôi sẽ đọc và liên hệ lại nếu cần.</p>
          </The>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const lienHe = String(f.get('lien_he') ?? '').trim();
              gui.mutate({
                ho_ten: String(f.get('ho_ten')),
                // Một ô cho cả email lẫn điện thoại — đoán theo dấu @
                email: lienHe.includes('@') ? lienHe : undefined,
                dien_thoai: lienHe && !lienHe.includes('@') ? lienHe : undefined,
                noi_dung: String(f.get('noi_dung')),
              });
            }}
          >
            <DongNhan>Họ tên</DongNhan>
            <O name="ho_ten" required placeholder="Tên bạn" />
            <DongNhan phu="Để chúng tôi trả lời được — không bắt buộc">Email hoặc số điện thoại</DongNhan>
            <O name="lien_he" placeholder="email@vidu.vn" />
            <DongNhan>Nội dung</DongNhan>
            <OVung name="noi_dung" required rows={6} placeholder="Bạn muốn nói gì với chúng tôi?" />
            <Button type="submit" size="lg" disabled={gui.isPending}>
              {gui.isPending ? 'Đang gửi…' : 'Gửi'}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
