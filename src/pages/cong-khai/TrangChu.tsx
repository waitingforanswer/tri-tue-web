/**
 * Trang chủ — Hướng A "Thoáng" (chốt 15/09/2026).
 *
 * Nguyên tắc của hướng này: mở bằng MỘT câu, thật nhiều khoảng trống, danh
 * sách mảnh thay vì thẻ đóng khung. Cảm giác như trang đầu một cuốn sách —
 * đủ thông tin, không thúc ép.
 *
 * Thứ tự khối có chủ đích, đừng đảo: nói rõ "đây không phải là gì" TRƯỚC khi
 * mời đăng ký. Đó là lý do người dè chừng dám bước vào.
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check } from 'lucide-react';
import { layModuleTheoSlug, layNut } from '@/lib/nguon';
import { SO_LIEU } from '@/data/so-lieu';
import { Button } from '@/components/ui/button';
import { loTag } from '@/lib/utils';

/* ── Khối 1 · Mở đầu ───────────────────────────────────────────────── */
function MoDau() {
  return (
    <section>
      <div className="container flex flex-col items-center px-5 py-24 text-center sm:py-32">
        <p className="mb-8 text-mac font-semibold uppercase text-nhan">
          Học miễn phí · phi lợi nhuận
        </p>

        <h1 className="max-w-[16ch] font-chu text-hero font-semibold animate-hien-len">
          Tự làm thầy cho cuộc đời mình
        </h1>

        <p className="mt-8 max-w-[54ch] text-dan text-nhat">
          Vốn sống Trí tuệ không dạy bạn tin vào ai. Nó đưa cho bạn một cái thước: nhìn ra
          <b className="font-medium text-muc"> gốc </b> của việc đang xảy ra, biết
          <b className="font-medium text-muc"> mình cần làm gì</b>, rồi tự làm.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/tri-tue-la-gi">
            <Button size="lg">Trí tuệ là gì — xem thử <ArrowRight size={16} /></Button>
          </Link>
          <Link to="/dang-ky">
            <Button size="lg" variant="vien">Xin học</Button>
          </Link>
        </div>

        <p className="mt-7 max-w-[58ch] text-ghi text-nhat">
          Xem trước không cần tài khoản. Muốn học sâu thì đăng ký, và sẽ có người trong nhóm đọc hồ sơ của bạn
          trước khi mở quyền — để nội dung đến đúng người, đúng lúc.
        </p>
      </div>
    </section>
  );
}

/* ── Khối 2 · Ba con số, một dòng mảnh ────────────────────────────── */
const SO = [
  { s: SO_LIEU.theoLoai.phan, t: 'phần quy chuẩn' },
  { s: SO_LIEU.theoLoai.khuon, t: 'khuôn ứng dụng' },
  { s: SO_LIEU.theoLoai.buoc, t: 'bước lộ trình' },
];

function BaConSo() {
  return (
    <section>
      <div className="container flex flex-wrap items-stretch justify-center gap-x-14 gap-y-8 px-5 pb-24 sm:gap-x-20">
        {SO.map((o, i) => (
          <div key={o.t} className="flex items-stretch gap-x-14 sm:gap-x-20">
            {i > 0 && <span className="w-px bg-vien" aria-hidden />}
            <div className="text-center">
              <div className="font-chu text-de-lon font-semibold text-nhan">{o.s}</div>
              <div className="mt-1.5 text-ghi text-nhat">{o.t}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Khối 3 · Bảy khối bất ổn — danh sách mảnh, không đóng khung ──── */
function BayKhoi() {
  const { data } = useQuery({
    queryKey: ['landing', 'khoi'],
    queryFn: async () => {
      const m = await layModuleTheoSlug('thuoc-tri-tue');
      return m ? layNut({ module: m.id, loai: 'khoi' }) : [];
    },
  });

  return (
    <section className="border-y border-vien bg-giay">
      <div className="container px-5 py-24">
        <div className="mb-14 max-w-[62ch]">
          <h2 className="font-chu text-de-bia font-semibold">Bạn đang bất ổn ở đâu?</h2>
          <p className="mt-4 text-dan text-nhat">
            Mọi bất ổn của một đời người đều rơi vào bảy khối này. Việc đầu tiên khi học là gọi đúng tên khối
            mình đang gặp — vì gọi sai tên thì chữa sai chỗ.
          </p>
        </div>

        <ol className="grid gap-x-16 md:grid-cols-2">
          {(data ?? []).map((k, i) => (
            <li key={k.id} className="flex gap-5 border-t border-vien py-5 last:border-b md:[&:nth-last-child(2)]:border-b">
              <span className="w-6 shrink-0 font-chu text-phu text-nhan">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="font-chu text-de-nho font-semibold">{k.tieu_de}</div>
                <div className="mt-1 text-phu text-nhat">{loTag(k.tom_tat)}</div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-[70ch] text-phu text-nhat">
          Trong khu học có một công cụ tên là <b className="font-medium text-muc">Thước Trí tuệ</b>: chọn khối →
          xem biểu hiện → tìm góc độ tác động → nhận đúng khuôn để làm, kèm phiếu ứng dụng in ra được.
        </p>
      </div>
    </section>
  );
}

/* ── Khối 4 · Đây KHÔNG phải là gì ────────────────────────────────── */
const KHONG_PHAI: [string, string][] = [
  [
    'Không thu tiền, không bán khoá học',
    'Không học phí, không gói nâng cấp, không bán sách, không quyên góp. Ai nhân danh nơi này để thu tiền của bạn là làm sai — xin báo cho chúng tôi.',
  ],
  [
    'Không kêu gọi đầu tư, không bán hàng',
    'Không có dự án, không có mạng lưới kinh doanh, không giới thiệu cơ hội làm giàu. Trí tuệ nói rõ: thời này không phải thời làm giàu.',
  ],
  [
    'Không phải đạo phái, không tôn thờ ai',
    'Không kết nạp, không lễ nhập môn, không thầy để sùng bái, không cấm bạn học nơi khác. Đích của việc học là để bạn tự làm thầy cho mình.',
  ],
  [
    'Không bắt bạn rời bỏ điều gì',
    'Không phải bỏ việc, bỏ gia đình, cắt quan hệ hay thay đổi tín ngưỡng. Học Trí tuệ là để làm tròn hơn những việc bạn đang có, không phải để rời đi.',
  ],
];

function KhongPhai() {
  return (
    <section>
      <div className="container px-5 py-24">
        <div className="mb-14 max-w-[62ch]">
          <h2 className="font-chu text-de-bia font-semibold">Nói trước cho rõ: đây không phải là gì</h2>
          <p className="mt-4 text-dan text-nhat">
            Nhiều người nghe đến “vốn sống Trí tuệ” là dè chừng, sợ bị rủ vào một nhóm nào đó, sợ mất tiền, sợ
            mất gia đình. Dè chừng như vậy là đúng và là điều nên làm. Nên chúng tôi nói thẳng ngay từ cửa:
          </p>
        </div>

        <dl>
          {KHONG_PHAI.map(([t, n]) => (
            <div key={t} className="flex flex-col gap-2 border-t border-vien py-7 last:border-b md:flex-row md:gap-8">
              <dt className="font-chu text-de-nho font-semibold md:w-[330px] md:shrink-0">{t}</dt>
              <dd className="text-than text-nhat">{n}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-[74ch] text-than text-nhat">
          <b className="font-medium text-muc">Cách kiểm chứng:</b> đọc trước, thử một khuôn nhỏ trong đời sống
          của bạn khoảng một tuần, tự xem có thay đổi gì không. Không ai giục bạn tin. Không tin thì thôi, không
          mất gì cả.{' '}
          <Link to="/cam-ket" className="font-medium text-nhan underline-offset-2 hover:underline">
            Xem cam kết đầy đủ →
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ── Khối 5 · Học thế nào ─────────────────────────────────────────── */
function HocTheNao() {
  const { data } = useQuery({
    queryKey: ['landing', 'buoc'],
    queryFn: async () => {
      const m = await layModuleTheoSlug('lo-trinh');
      return m ? layNut({ module: m.id, loai: 'buoc' }) : [];
    },
  });

  return (
    <section className="border-y border-vien bg-giay">
      <div className="container px-5 py-24">
        <div className="mb-14 max-w-[62ch]">
          <h2 className="font-chu text-de-bia font-semibold">Học thế nào</h2>
          <p className="mt-4 text-dan text-nhat">
            Có một mạch năm bước, đi tuần tự. Không có đường tắt, nhưng cũng không có gì bí ẩn — mỗi bước đều
            nói rõ đích là gì và làm gì để đạt.
          </p>
        </div>

        <ol className="grid gap-x-14 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((b, i) => (
            <li key={b.id} className="border-t border-vien py-5">
              <div className="text-mac font-semibold uppercase text-nhan">Bước {i + 1}</div>
              <div className="mt-1.5 font-chu text-de-nho font-semibold">{b.tieu_de}</div>
              <p className="mt-1.5 text-phu text-nhat">{loTag(b.tom_tat)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Khối 6 · Vì sao phải duyệt ───────────────────────────────────── */
const LY_DO = [
  'Kiến thức này nếu đọc lệch thì hại hơn không đọc. Người trong nhóm cần biết bạn đang gặp gì để chỉ đúng chỗ bắt đầu, thay vì thả bạn vào giữa kho tài liệu.',
  'Đã có người mượn danh những nội dung dạng này để lôi kéo, thu tiền, dẫn người khác đi sai. Một cửa vào có người thật đứng đó là cách chặn việc đó.',
  'Học Trí tuệ là học để làm, không phải để biết. Bước duyệt là lúc hỏi bạn một câu duy nhất: bạn định làm gì với nó.',
];

const QUY_TRINH: [string, string][] = [
  ['Đăng ký', 'Điền tên, cách liên lạc và trả lời hai câu: vì sao muốn học, đang gặp bất ổn gì.'],
  ['Chờ xét', 'Người phụ trách đọc và liên hệ lại nếu cần. Thường trong vài ngày.'],
  ['Được mở quyền', 'Vào khu học, bắt đầu từ Mở đầu và Lộ trình — đúng chỗ dành cho tình huống của bạn.'],
  ['Học và làm', 'Mỗi tuần chọn một khuôn để làm thật. Ghi lại kết quả vào phiếu ứng dụng của riêng bạn.'],
];

function ViSaoDuyet() {
  return (
    <section>
      <div className="container grid gap-14 px-5 py-24 lg:grid-cols-2">
        <div>
          <h2 className="font-chu text-de-bia font-semibold">Vì sao phải đăng ký và chờ duyệt?</h2>
          <p className="mt-4 text-dan text-nhat">
            Không phải để làm khó, cũng không phải để tạo cảm giác “bí truyền”. Lý do rất thực tế:
          </p>
          <ul className="mt-7 space-y-4">
            {LY_DO.map((t) => (
              <li key={t} className="flex gap-3">
                <Check size={17} className="mt-1 shrink-0 text-nhan" strokeWidth={2.2} />
                <span className="text-than text-nhat">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="self-start lg:pt-2">
          <div className="text-mac font-semibold uppercase text-nhat">Quy trình vào học</div>
          <ol className="mt-5">
            {QUY_TRINH.map(([t, n], i) => (
              <li key={t} className="flex gap-4 border-t border-vien py-4 last:border-b">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-nhan-nhe text-mac font-semibold text-nhan">
                  {i + 1}
                </span>
                <div>
                  <div className="text-phu font-medium">{t}</div>
                  <div className="mt-0.5 text-ghi text-nhat">{n}</div>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/dang-ky" className="mt-6 block">
            <Button className="w-full" size="lg">Xin học</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Khối 7 · Kết ─────────────────────────────────────────────────── */
function Ket() {
  return (
    <section className="border-t border-vien bg-giay">
      <div className="container px-5 py-24 text-center">
        <h2 className="mx-auto max-w-[24ch] font-chu text-de-bia font-semibold">
          Người người nhà nhà có vốn sống Trí tuệ — để tự giúp được mình
        </h2>
        <p className="mx-auto mt-5 max-w-[56ch] text-dan text-nhat">
          Đó là việc đáng làm nhất của thời này. Bạn học được, làm được, rồi chỉ lại cho một người nữa — thế là đủ.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/dang-ky"><Button size="lg">Xin học</Button></Link>
          <Link to="/gop-y"><Button size="lg" variant="vien">Gửi câu hỏi</Button></Link>
        </div>
        <p className="mt-10 text-vi text-nhat">
          Kho hiện có {SO_LIEU.nut.toLocaleString('vi-VN')} mục nội dung, lấy nguyên văn từ tài liệu của nhóm.
          Chỗ nào bản gốc còn trống đều được ghi rõ là còn trống.
        </p>
      </div>
    </section>
  );
}

export default function TrangChu() {
  return (
    <>
      <MoDau />
      <BaConSo />
      <BayKhoi />
      <KhongPhai />
      <HocTheNao />
      <ViSaoDuyet />
      <Ket />
    </>
  );
}
