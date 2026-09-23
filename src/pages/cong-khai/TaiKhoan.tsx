import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Clock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DongNhan, O, OVung, The } from '@/components/ui/co-ban';

function Khung({ tieu, mo, children }: { tieu: string; mo: string; children: React.ReactNode }) {
  return (
    <div className="container max-w-lg py-16">
      <h1 className="text-de-lon font-semibold leading-tight">{tieu}</h1>
      <p className="mt-2.5 text-than leading-relaxed text-nhat">{mo}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

/* ═══ Đăng ký ═════════════════════════════════════════════════════════ */
export function DangKy() {
  const { dangKy, guiLaiXacNhan } = useAuth();
  const [dangGui, setDangGui] = useState(false);
  const [xong, setXong] = useState(false);
  const [camKet, setCamKet] = useState(false);
  const [emailDaGui, setEmailDaGui] = useState('');

  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setDangGui(true);
    setEmailDaGui(String(f.get('email')));
    try {
      await dangKy({
        email: String(f.get('email')),
        matKhau: String(f.get('mat_khau')),
        ho_ten: String(f.get('ho_ten')),
        dien_thoai: String(f.get('dien_thoai') ?? ''),
        ly_do_hoc: String(f.get('ly_do_hoc') ?? ''),
        van_de_dang_gap: String(f.get('van_de') ?? ''),
        nguoi_gioi_thieu: String(f.get('gioi_thieu') ?? ''),
        cam_ket: camKet,
      });
      setXong(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chưa gửi được, thử lại giúp tôi.');
    } finally {
      setDangGui(false);
    }
  };

  if (xong) {
    return (
      <Khung tieu="Kiểm tra hòm thư của bạn" mo={`Chúng tôi vừa gửi một email tới ${emailDaGui}.`}>
        <The className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail size={18} className="mt-0.5 shrink-0 text-nhan" />
            <p className="text-phu leading-relaxed">
              Bấm vào link trong email đó để xác nhận địa chỉ email là có thật. Link dùng được một lần và hết hạn sau
              24 giờ.
            </p>
          </div>

          <div className="rounded-lg bg-canh px-4 py-3 text-ghi leading-relaxed">
            <b>Không thấy email?</b> Xem trong hộp <b>Spam</b> hoặc <b>Quảng cáo</b>. Email gửi từ địa chỉ của website,
            lần đầu hay bị lọc nhầm.
          </div>

          <p className="text-phu leading-relaxed text-nhat">
            Xác nhận email xong <b className="text-muc">chưa phải là được vào học</b>. Sau đó người phụ trách mới đọc
            hồ sơ của bạn — thường trong vài ngày — rồi mở quyền.
          </p>

          <div className="flex flex-wrap gap-2 border-t border-vien pt-4">
            <Button
              variant="vien"
              onClick={async () => {
                try {
                  await guiLaiXacNhan(emailDaGui);
                  toast.success('Đã gửi lại email xác nhận.');
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Chưa gửi lại được.');
                }
              }}
            >
              Gửi lại email
            </Button>
            <Link to="/"><Button variant="mo">Về trang chủ</Button></Link>
          </div>
        </The>
      </Khung>
    );
  }

  return (
    <Khung
      tieu="Xin học"
      mo="Hai câu hỏi ở dưới là phần quan trọng nhất. Viết thật, viết ngắn cũng được — để người đọc biết chỉ bạn bắt đầu từ đâu."
    >
      <form className="space-y-4" onSubmit={gui}>
        <div>
          <DongNhan>Họ và tên</DongNhan>
          <O name="ho_ten" required placeholder="Nguyễn Văn A" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <DongNhan>Email</DongNhan>
            <O name="email" type="email" required placeholder="email@vidu.vn" />
          </div>
          <div>
            <DongNhan>Số điện thoại</DongNhan>
            <O name="dien_thoai" placeholder="09xx xxx xxx" />
          </div>
        </div>
        <div>
          <DongNhan phu="Ít nhất 8 ký tự">Mật khẩu</DongNhan>
          <O name="mat_khau" type="password" required minLength={8} />
        </div>

        <div className="border-t border-vien pt-4">
          <DongNhan phu="Không cần dài. Điều gì khiến bạn đi tìm đến đây?">Vì sao bạn muốn học Vốn sống Trí tuệ?</DongNhan>
          <OVung name="ly_do_hoc" rows={3} required />
        </div>
        <div>
          <DongNhan phu="Sức khỏe, gia đình, công việc, quan hệ, tiền bạc… nói được đến đâu hay đến đó">
            Bạn đang gặp bất ổn gì?
          </DongNhan>
          <OVung name="van_de" rows={3} />
        </div>
        <div>
          <DongNhan phu="Nếu có ai đó chỉ bạn đến đây">Người giới thiệu</DongNhan>
          <O name="gioi_thieu" />
        </div>

        <label className="flex gap-3 rounded-lg border border-vien bg-giay p-4 text-ghi leading-relaxed">
          <input
            type="checkbox"
            checked={camKet}
            onChange={(e) => setCamKet(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--nhan))]"
          />
          <span className="text-nhat">
            Tôi đã đọc{' '}
            <Link to="/cam-ket" className="font-medium text-nhan underline-offset-2 hover:underline">cam kết</Link> và
            hiểu rằng việc học ở đây là miễn phí, không ràng buộc, và tôi có thể dừng bất cứ lúc nào.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={dangGui}>
          {dangGui ? 'Đang gửi…' : 'Gửi hồ sơ'}
        </Button>
        <p className="text-center text-ghi text-nhat">
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="font-medium text-nhan underline-offset-2 hover:underline">Đăng nhập</Link>
        </p>
      </form>
    </Khung>
  );
}

/* ═══ Đăng nhập ═══════════════════════════════════════════════════════ */
export function DangNhap() {
  const { dangNhap, guiLaiXacNhan } = useAuth();
  const [dangGui, setDangGui] = useState(false);
  const [chuaXacNhan, setChuaXacNhan] = useState('');
  const di = useNavigate();

  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email'));
    setDangGui(true);
    setChuaXacNhan('');
    try {
      await dangNhap(email, String(f.get('mat_khau')));
      di('/hoc');
    } catch (err) {
      const tin = err instanceof Error ? err.message : '';
      // Supabase trả lỗi bằng tiếng Anh — dịch những trường hợp hay gặp
      if (/email not confirmed/i.test(tin)) {
        setChuaXacNhan(email);
      } else if (/invalid login credentials/i.test(tin)) {
        toast.error('Email hoặc mật khẩu không đúng.');
      } else {
        toast.error(tin || 'Đăng nhập không được.');
      }
    } finally {
      setDangGui(false);
    }
  };

  return (
    <Khung tieu="Đăng nhập" mo="Vào lại khu học.">
      {chuaXacNhan && (
        <div className="mb-5 rounded-lg border border-vien bg-canh px-4 py-4 text-ghi leading-relaxed">
          <b>Email này chưa được xác nhận.</b> Bạn cần bấm vào link trong email chúng tôi đã gửi trước khi đăng nhập.
          Không tìm thấy email đó (nhớ xem cả hộp Spam) thì gửi lại:
          <Button
            size="sm"
            variant="vien"
            className="mt-3"
            onClick={async () => {
              try {
                await guiLaiXacNhan(chuaXacNhan);
                toast.success('Đã gửi lại email xác nhận.');
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Chưa gửi lại được.');
              }
            }}
          >
            Gửi lại email xác nhận
          </Button>
        </div>
      )}

      <form className="space-y-4" onSubmit={gui}>
        <div>
          <DongNhan>Email</DongNhan>
          <O name="email" type="email" required />
        </div>
        <div>
          <DongNhan>Mật khẩu</DongNhan>
          <O name="mat_khau" type="password" required />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={dangGui}>
          {dangGui ? 'Đang vào…' : 'Đăng nhập'}
        </Button>
        <div className="flex items-center justify-between text-ghi text-nhat">
          <Link to="/quen-mat-khau" className="font-medium text-nhan underline-offset-2 hover:underline">
            Quên mật khẩu?
          </Link>
          <span>
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="font-medium text-nhan underline-offset-2 hover:underline">Xin học</Link>
          </span>
        </div>
      </form>
    </Khung>
  );
}

/* ═══ Chờ duyệt ═══════════════════════════════════════════════════════ */
export function ChoDuyet() {
  const { hoSo, dangXuat } = useAuth();
  return (
    <Khung tieu="Hồ sơ của bạn đang được xem" mo="Chưa vào khu học được, nhưng không phải chờ vô hạn.">
      <The className="space-y-4">
        <div className="flex items-center gap-3 text-nhan">
          <Clock size={18} />
          <span className="text-phu font-medium">Đang chờ duyệt</span>
        </div>
        {hoSo && !hoSo.email_da_xac_nhan && (
          <div className="rounded-lg bg-canh px-4 py-3 text-ghi leading-relaxed">
            <b>Email của bạn chưa được xác nhận.</b> Hãy tìm email chúng tôi đã gửi (xem cả hộp Spam) và bấm vào link
            trong đó. Người phụ trách thường chờ bước này xong mới xét hồ sơ.
          </div>
        )}
        <p className="text-phu leading-relaxed text-nhat">
          Chào {hoSo?.ho_ten}. Người phụ trách đọc hồ sơ theo thứ tự và thường trả lời trong vài ngày. Nếu cần hỏi
          thêm, chúng tôi sẽ liên hệ qua email hoặc số điện thoại bạn để lại.
        </p>
        <p className="text-phu leading-relaxed text-nhat">
          Trong lúc chờ, bạn đọc được phần công khai:{' '}
          <Link to="/tri-tue-la-gi" className="font-medium text-nhan hover:underline">Trí tuệ là gì</Link>,{' '}
          <Link to="/hoc-the-nao" className="font-medium text-nhan hover:underline">Học thế nào</Link>, và{' '}
          <Link to="/cam-ket" className="font-medium text-nhan hover:underline">Cam kết</Link>.
        </p>
        <div className="flex gap-2 border-t border-vien pt-4">
          <Link to="/"><Button variant="vien">Về trang chủ</Button></Link>
          <Button variant="mo" onClick={() => void dangXuat()}>Đăng xuất</Button>
        </div>
      </The>
    </Khung>
  );
}

/* ═══ Không được duyệt ════════════════════════════════════════════════ */
export function KhongDuocDuyet() {
  const { hoSo, dangXuat } = useAuth();
  return (
    <Khung tieu="Chưa mở quyền học lúc này" mo="">
      <The className="space-y-4">
        <div className="flex items-center gap-3 text-am">
          <ShieldAlert size={18} />
          <span className="text-phu font-medium">Hồ sơ chưa được duyệt</span>
        </div>
        <p className="text-phu leading-relaxed text-nhat">
          Việc này không có nghĩa là bạn không phù hợp — thường chỉ là chưa đúng lúc, hoặc hồ sơ chưa đủ để người
          phụ trách hiểu bạn cần gì.
        </p>
        {hoSo?.ghi_chu_admin && (
          <div className="rounded-lg bg-canh px-4 py-3 text-phu leading-relaxed">{hoSo.ghi_chu_admin}</div>
        )}
        <p className="text-phu leading-relaxed text-nhat">
          Bạn có thể{' '}
          <Link to="/gop-y" className="font-medium text-nhan hover:underline">nhắn cho chúng tôi</Link> để nói rõ thêm.
        </p>
        <div className="flex gap-2 border-t border-vien pt-4">
          <Link to="/"><Button variant="vien">Về trang chủ</Button></Link>
          <Button variant="mo" onClick={() => void dangXuat()}>Đăng xuất</Button>
        </div>
      </The>
    </Khung>
  );
}

/* ═══ 404 ═════════════════════════════════════════════════════════════ */
export function KhongTimThay() {
  return (
    <Khung tieu="Không có trang này" mo="Đường dẫn sai, hoặc nội dung đã được chuyển đi chỗ khác.">
      <Link to="/"><Button>Về trang chủ</Button></Link>
    </Khung>
  );
}

/* ═══ Thiếu quyền (trong khu quản trị) ════════════════════════════════ */
export function ThieuQuyen() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <ShieldAlert size={28} className="mx-auto text-am" />
      <h1 className="mt-4 text-de-vua font-semibold">Bạn chưa được cấp quyền cho mục này</h1>
      <p className="mt-2 text-phu leading-relaxed text-nhat">
        Tài khoản của bạn vào được khu quản trị nhưng chưa có quyền dùng chức năng này. Admin cấp thêm ở
        <b> Vai trò &amp; quyền</b>.
      </p>
      <Link to="/quan-tri" className="mt-6 inline-block"><Button variant="vien">Về bảng điều khiển</Button></Link>
    </div>
  );
}
