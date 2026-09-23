/**
 * /bang-mau — BẢNG MẪU SỐNG của hệ thống giao diện.
 *
 * Trang này KHÔNG vẽ lại gì cả: nó dựng bằng đúng những component và token mà
 * website thật đang dùng. Đổi màu trong src/index.css hay đổi bậc chữ trong
 * tailwind.config.ts là trang này đổi theo ngay — nên nó không bao giờ nói dối.
 *
 * Dùng để: gọi tên thứ mình muốn sửa, và kiểm tra nhanh sau khi đổi token.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DangTai, DongNhan, Nhan, O, OVung, The, TieuDeMuc, Trong } from '@/components/ui/co-ban';
import { ChiNhan } from '@/components/kho/ChiNhan';
import { DoiNen } from '@/components/layout/DoiNen';
import { TEN_NHAN } from '@/types/kho';

/* ── Khung chung ─────────────────────────────────────────────────────── */
function Muc({ ma, ten, mo, children }: { ma: string; ten: string; mo: string; children: React.ReactNode }) {
  return (
    <section id={ma} className="scroll-mt-20 border-t border-vien pt-10">
      <div className="mb-6 flex items-baseline gap-3">
        <code className="text-vi font-semibold text-nhan">{ma}</code>
        <div>
          <h2 className="text-de-vua font-semibold">{ten}</h2>
          <p className="mt-1 max-w-2xl text-phu text-nhat">{mo}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Hang({ ten, ma, children }: { ten: string; ma: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-vien py-4 last:border-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-baseline">
      <div>
        <div className="text-phu font-medium">{ten}</div>
        <code className="text-vi text-nhat">{ma}</code>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ── 1 · Màu ─────────────────────────────────────────────────────────── */
const MAU = [
  ['nen', 'Nền trang', 'Nền lớn nhất, phía sau mọi thứ'],
  ['giay', 'Nền thẻ', 'Thẻ, khối nội dung, ô nhập — nổi lên trên nền trang'],
  ['muc', 'Chữ chính', 'Chữ người ta đọc để hiểu nội dung'],
  ['nhat', 'Chữ phụ', 'Chú thích, dòng mô tả, chữ không phải trọng tâm'],
  ['vien', 'Đường viền', 'Viền thẻ, đường kẻ chia'],
  ['nhan', 'Màu nhấn', 'Xanh ngọc trầm — nút chính, link, mục đang chọn'],
  ['nhan-nhe', 'Nhấn nhạt', 'Nền của vùng được nhấn, chip màu nhấn'],
  ['am', 'Màu ấm', 'Đất nung — chỉ dùng để nhắc nhở, cảnh báo. Rất tiết chế'],
  ['canh', 'Nền nhắc', 'Nền dịu cho khối lưu ý, đi cùng màu ấm'],
] as const;

function BangMauSac() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {MAU.map(([ma, ten, mo]) => (
        <The key={ma} className="flex gap-3.5 p-3.5">
          <span
            className="h-12 w-12 shrink-0 rounded-lg border border-vien"
            style={{ background: `hsl(var(--${ma}))` }}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="text-phu font-medium">{ten}</div>
            <code className="text-vi text-nhan">{ma}</code>
            <p className="mt-0.5 text-vi leading-snug text-nhat">{mo}</p>
          </div>
        </The>
      ))}
    </div>
  );
}

/* ── 2 · Chữ ─────────────────────────────────────────────────────────── */
const CHU = [
  ['text-hero', 'Tiêu đề trang chủ', 'Tự làm thầy cho cuộc đời mình', 'font-chu font-semibold'],
  ['text-de-bia', 'Tiêu đề trang tĩnh', 'Cam kết của chúng tôi', 'font-chu font-semibold'],
  ['text-de-lon', 'Tiêu đề trang', 'Hồ sơ chờ duyệt', 'font-chu font-semibold'],
  ['text-de-vua', 'Tiêu đề mục lớn', 'Bạn đang bất ổn ở đâu?', 'font-chu font-semibold'],
  ['text-de-nho', 'Tiêu đề mục', 'Chương trình 5 bước', 'font-chu font-semibold'],
  ['text-dan', 'Đoạn dẫn', 'Nó đưa cho bạn một cái thước để nhìn ra gốc của việc đang xảy ra.', 'text-nhat'],
  ['text-than', 'Chữ thân', 'Mọi bất ổn của một đời người đều rơi vào bảy khối này.', ''],
  ['text-phu', 'Chữ phụ', 'Chọn được bao nhiêu thì chọn, không cần đủ.', 'text-nhat'],
  ['text-ghi', 'Chú thích, meta', 'duyen@vidu.vn · 0901 234 567 · gửi 13/09/2026', 'text-nhat'],
  ['text-vi', 'Chú thích nhỏ', 'Nội dung lấy nguyên văn từ tài liệu của nhóm.', 'text-nhat'],
  ['text-mac', 'Nhãn chữ hoa', 'VÌ SAO MUỐN HỌC', 'font-semibold uppercase text-nhat'],
] as const;

/* ── 3 · Bo góc, bóng, khoảng cách ───────────────────────────────────── */
const BO_GOC = [
  ['rounded-lg', '8px', 'Nút, ô nhập, chip vuông, khối nhỏ'],
  ['rounded-xl', '14px', 'Thẻ nội dung — đây là bo góc mặc định của thẻ'],
  ['rounded-2xl', '20px', 'Khối lớn, hiếm dùng'],
  ['rounded-full', 'tròn', 'Chip, huy hiệu, nút lọc'],
] as const;

const BONG = [
  ['shadow-nhe', 'Thẻ ở trạng thái nghỉ — gần như không thấy, chỉ tách khỏi nền'],
  ['shadow-noi', 'Thẻ khi rê chuột, hoặc khối cần nổi hẳn lên'],
] as const;

/* ── Trang ───────────────────────────────────────────────────────────── */
const MUC_LUC = [
  ['M1', 'Màu'], ['M2', 'Chữ'], ['M3', 'Hình khối'],
  ['M4', 'Nút'], ['M5', 'Biểu mẫu'], ['M6', 'Thẻ & nhãn'], ['M7', 'Trạng thái'],
];

export default function BangMau() {
  const [oMau, setOMau] = useState('Nguyễn Văn An');

  return (
    <div className="min-h-screen bg-nen">
      <header className="border-b border-vien">
        <div className="container flex flex-wrap items-end justify-between gap-4 py-10">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-nhan-nhe px-3 py-1 text-vi font-medium text-nhan">
              <Sparkles size={13} /> Hệ thống giao diện · v0.3
            </div>
            <h1 className="text-de-bia font-semibold">Bảng mẫu</h1>
            <p className="mt-2 max-w-2xl text-dan text-nhat">
              Mọi màu, cỡ chữ và khối trên website đều lấy từ đây. Trang này dựng bằng chính component thật,
              nên nhìn thấy gì ở đây là website đang như thế.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DoiNen />
            <Button variant="vien" size="sm" onClick={() => window.print()}>
              <Printer size={14} /> In
            </Button>
            <Link to="/"><Button variant="mo" size="sm">Về website</Button></Link>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <nav className="mb-10 flex flex-wrap gap-1.5">
          {MUC_LUC.map(([ma, ten]) => (
            <a
              key={ma}
              href={`#${ma}`}
              className="rounded-full border border-vien bg-giay px-3 py-1.5 text-vi text-nhat transition-colors hover:border-nhan/30 hover:text-muc"
            >
              <span className="font-semibold text-nhan">{ma}</span> {ten}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {/* ── M1 · Màu ── */}
          <Muc
            ma="M1"
            ten="Màu"
            mo="Chín màu, mỗi màu một việc. Giá trị thật nằm ở biến CSS trong src/index.css — đổi ở đó là cả nền sáng lẫn nền tối đổi theo."
          >
            <BangMauSac />
            <div className="mt-5 rounded-xl border-l-2 border-nhan bg-nhan-nhe px-5 py-4 text-phu leading-relaxed">
              <b>Quy tắc màu ấm:</b> màu <code>am</code> chỉ dùng khi cần người ta dừng lại và chú ý — email chưa xác
              nhận, bản gốc còn trống, cảnh báo. Dùng nhiều thì mất tác dụng.
            </div>
          </Muc>

          {/* ── M2 · Chữ ── */}
          <Muc
            ma="M2"
            ten="Chữ"
            mo="Mười một bậc, không hơn. Trước đây có 25 cỡ chữ tuỳ ý rải rác khắp nơi — giờ mỗi bậc có tên và có việc riêng."
          >
            <The className="p-0">
              <div className="border-b border-vien px-5 py-3">
                <div className="text-mac font-semibold uppercase text-nhat">
                  Tên bậc · dùng cho · chữ mẫu
                </div>
              </div>
              <div className="px-5">
                {CHU.map(([lop, dung, mau, them]) => (
                  <Hang key={lop} ten={dung} ma={lop}>
                    <span className={`${lop} ${them} block`}>{mau}</span>
                  </Hang>
                ))}
              </div>
            </The>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <The>
                <div className="text-phu font-medium">Hai kiểu chữ</div>
                <div className="mt-3 space-y-2.5">
                  <div>
                    <code className="text-vi text-nhan">font-sans</code>
                    <div className="font-sans text-than">Be Vietnam Pro — vẽ riêng cho tiếng Việt, dấu đặt đúng chỗ. Dùng cho mọi chữ thường.</div>
                  </div>
                  <div>
                    <code className="text-vi text-nhan">font-chu</code>
                    <div className="font-chu text-than">Noto Serif — dùng cho tiêu đề và tên gọi. Tự động áp cho h1, h2, h3.</div>
                  </div>
                </div>
              </The>
              <The>
                <div className="text-phu font-medium">Chữ có dấu</div>
                <p className="mt-2 text-ghi leading-relaxed text-nhat">
                  Thử đủ dấu để bắt lỗi phông: ằ ẳ ẵ ặ · ề ể ễ ệ · ồ ổ ỗ ộ · ừ ử ữ ự · ỳ ỷ ỹ ỵ · Đ đ
                </p>
                <p className="mt-2 font-chu text-de-nho font-semibold">Vốn sống Trí tuệ — ỨNG DỤNG</p>
                <p className="mt-2 text-vi leading-relaxed text-nhat">
                  Dấu nào nằm lệch, dính vào thân chữ, hoặc khác nét với chữ bên cạnh là phông đang lỗi.
                </p>
              </The>
            </div>
          </Muc>

          {/* ── M3 · Hình khối ── */}
          <Muc ma="M3" ten="Hình khối" mo="Bo góc, đổ bóng, khoảng cách. Ít lựa chọn thì giao diện mới đều tay.">
            <div className="grid gap-3 md:grid-cols-2">
              <The>
                <div className="mb-3 text-phu font-medium">Bo góc</div>
                {BO_GOC.map(([lop, gt, dung]) => (
                  <div key={lop} className="flex items-center gap-3 border-b border-vien py-2.5 last:border-0">
                    <span className={`h-9 w-9 shrink-0 border border-vien bg-nhan-nhe ${lop}`} aria-hidden />
                    <div className="min-w-0">
                      <code className="text-vi text-nhan">{lop}</code>
                      <span className="ml-2 text-vi text-nhat">{gt}</span>
                      <div className="text-vi leading-snug text-nhat">{dung}</div>
                    </div>
                  </div>
                ))}
              </The>
              <The>
                <div className="mb-3 text-phu font-medium">Đổ bóng</div>
                {BONG.map(([lop, dung]) => (
                  <div key={lop} className="flex items-center gap-3 border-b border-vien py-3 last:border-0">
                    <span className={`h-9 w-14 shrink-0 rounded-lg bg-giay ${lop}`} aria-hidden />
                    <div className="min-w-0">
                      <code className="text-vi text-nhan">{lop}</code>
                      <div className="text-vi leading-snug text-nhat">{dung}</div>
                    </div>
                  </div>
                ))}
                <div className="mt-3 text-vi leading-relaxed text-nhat">
                  Không phải khối nào cũng là thẻ. Viền, nền, bo góc và bóng mỗi thứ đều nói &ldquo;đây là vật
                  riêng&rdquo; — dùng hết cả bốn cho mọi khối thì không còn phân biệt được cái nào quan trọng.
                </div>
              </The>
            </div>
          </Muc>

          {/* ── M4 · Nút ── */}
          <Muc ma="M4" ten="Nút" mo="Năm kiểu, bốn cỡ. Mỗi màn hình chỉ nên có một nút chính.">
            <The className="space-y-5">
              <div>
                <div className="mb-2.5 text-mac font-semibold uppercase text-nhat">Kiểu</div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button>chinh — việc chính</Button>
                  <Button variant="vien">vien — việc phụ</Button>
                  <Button variant="mo">mo — việc nhẹ nhất</Button>
                  <Button variant="nhan">nhan — nhấn nhẹ</Button>
                  <Button variant="canhbao">canhbao — việc cần cân nhắc</Button>
                  <Button disabled>đang khoá</Button>
                </div>
              </div>
              <div className="border-t border-vien pt-4">
                <div className="mb-2.5 text-mac font-semibold uppercase text-nhat">Cỡ</div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button size="sm">sm</Button>
                  <Button size="md">md — mặc định</Button>
                  <Button size="lg">lg — nút chính trên trang</Button>
                  <Button size="icon" aria-label="Ví dụ nút icon"><Printer size={15} /></Button>
                </div>
              </div>
            </The>
          </Muc>

          {/* ── M5 · Biểu mẫu ── */}
          <Muc ma="M5" ten="Biểu mẫu" mo="Ô nhập, vùng nhập, nhãn. Bấm vào ô để xem viền sáng lúc chọn.">
            <div className="grid gap-3 md:grid-cols-2">
              <The className="space-y-3.5">
                <div>
                  <DongNhan>Họ và tên</DongNhan>
                  <O value={oMau} onChange={(e) => setOMau(e.target.value)} />
                </div>
                <div>
                  <DongNhan phu="Dòng phụ giải thích thêm cho người điền">Email</DongNhan>
                  <O type="email" placeholder="email@vidu.vn" />
                </div>
                <div>
                  <DongNhan>Bạn đang gặp bất ổn gì?</DongNhan>
                  <OVung rows={3} placeholder="Viết ngắn cũng được." />
                </div>
              </The>
              <The className="space-y-3">
                <div className="text-phu font-medium">Quy tắc biểu mẫu</div>
                <ul className="space-y-2 text-ghi leading-relaxed text-nhat">
                  <li>· Nhãn luôn nằm <b className="text-muc">trên</b> ô, không nằm trong ô — chữ gợi ý trong ô biến
                    mất khi người ta bắt đầu gõ, và người lớn tuổi hay quên mất ô đó hỏi gì.</li>
                  <li>· Câu giải thích đi kèm nhãn, không đi kèm lỗi.</li>
                  <li>· Lỗi nói rõ <b className="text-muc">sai gì và sửa thế nào</b>, không chỉ nói &ldquo;không hợp lệ&rdquo;.</li>
                  <li>· Nút gửi ghi đúng việc nó làm: &ldquo;Gửi hồ sơ&rdquo;, không phải &ldquo;Xác nhận&rdquo;.</li>
                </ul>
              </The>
            </div>
          </Muc>

          {/* ── M6 · Thẻ & nhãn ── */}
          <Muc ma="M6" ten="Thẻ và nhãn" mo="Khối nội dung và các chip trạng thái.">
            <div className="grid gap-3 md:grid-cols-2">
              <The>
                <TieuDeMuc phu="Dòng phụ của tiêu đề mục, giải thích mục này để làm gì.">
                  Tiêu đề mục
                </TieuDeMuc>
                <p className="text-phu leading-relaxed text-nhat">
                  Đây là một thẻ <code>The</code> — nền giấy, viền mảnh, bo góc 14px, bóng rất nhẹ.
                </p>
              </The>
              <The className="space-y-4">
                <div>
                  <div className="mb-2 text-mac font-semibold uppercase text-nhat">Nhãn nguồn gốc nội dung</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(TEN_NHAN) as (keyof typeof TEN_NHAN)[]).map((k) => (
                      <ChiNhan key={k} nhan={k} />
                    ))}
                  </div>
                  <p className="mt-2 text-vi leading-relaxed text-nhat">
                    <b className="text-muc">Bản gốc còn trống</b> là nhãn quan trọng nhất: tài liệu gốc có mục mới chỉ
                    có tiêu đề. Hiện đúng như vậy, không bịa nội dung lấp vào.
                  </p>
                </div>
                <div className="border-t border-vien pt-3">
                  <div className="mb-2 text-mac font-semibold uppercase text-nhat">Chip khác</div>
                  <div className="flex flex-wrap gap-1.5">
                    <Nhan className="bg-nhan-nhe text-nhan">Màu nhấn</Nhan>
                    <Nhan className="bg-canh text-am">Cần chú ý</Nhan>
                    <Nhan className="bg-muc/5 text-nhat">Trung tính</Nhan>
                  </div>
                </div>
              </The>
            </div>
          </Muc>

          {/* ── M7 · Trạng thái ── */}
          <Muc ma="M7" ten="Trạng thái" mo="Lúc đang tải và lúc chưa có gì — hai trạng thái dễ bị bỏ quên nhất.">
            <div className="grid gap-3 md:grid-cols-2">
              <The>
                <div className="mb-3 text-phu font-medium">Đang tải · <code className="text-vi text-nhan">DangTai</code></div>
                <DangTai dong={3} />
              </The>
              <The>
                <div className="mb-3 text-phu font-medium">Chưa có gì · <code className="text-vi text-nhan">Trong</code></div>
                <Trong>
                  Chưa có phiếu nào.
                  <div className="mt-2 text-ghi">Nói luôn cho người ta biết làm gì tiếp theo, đừng chỉ báo trống.</div>
                </Trong>
              </The>
            </div>
          </Muc>
        </div>

        <footer className="mt-14 border-t border-vien pt-6 text-vi leading-relaxed text-nhat">
          <p>
            Muốn sửa gì thì nhắc mã mục — ví dụ &ldquo;M2, bậc text-than hơi nhỏ&rdquo; hoặc &ldquo;M1, màu nhấn đậm
            hơn một chút&rdquo;. Xem thêm <code>docs/HE-THONG-GIAO-DIEN.md</code>.
          </p>
          <p className="mt-1.5">
            Chạy <code>npm run lint</code> để kiểm tra mã nguồn không đi lệch khỏi hệ thống này.
          </p>
        </footer>
      </div>
    </div>
  );
}
