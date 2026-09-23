/**
 * Ba màn hình liên quan tới email:
 *   /xac-thuc            nơi Supabase trả về sau khi bấm link xác nhận
 *   /quen-mat-khau       xin gửi email đặt lại mật khẩu
 *   /dat-lai-mat-khau    nơi Supabase trả về sau khi bấm link đặt lại
 *
 * Cả ba địa chỉ này PHẢI được khai báo trong Supabase →
 * Authentication → URL Configuration → Redirect URLs, nếu không link trong
 * email sẽ bị từ chối.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { sb } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { DongNhan, O, The } from '@/components/ui/co-ban';

function Khung({ tieu, mo, children }: { tieu: string; mo?: string; children: React.ReactNode }) {
  return (
    <div className="container max-w-lg py-16">
      <h1 className="text-de-lon font-semibold leading-tight">{tieu}</h1>
      {mo && <p className="mt-2.5 text-than leading-relaxed text-nhat">{mo}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

/** Đọc lỗi Supabase gửi kèm, dù nằm ở query hay ở hash. */
function docLoiTuUrl(): string | null {
  const u = new URL(window.location.href);
  const h = new URLSearchParams(u.hash.replace(/^#/, ''));
  return u.searchParams.get('error_description') ?? h.get('error_description')
      ?? u.searchParams.get('error') ?? h.get('error');
}

/* ═══ /xac-thuc — sau khi bấm link trong email ════════════════════════ */
export function XacThuc() {
  const { daDuyet, dangTai } = useAuth();
  const [tt, setTt] = useState<'dang_xu_ly' | 'xong' | 'loi'>('dang_xu_ly');
  const [loi, setLoi] = useState('');

  useEffect(() => {
    let huy = false;

    (async () => {
      const thongBaoLoi = docLoiTuUrl();
      if (thongBaoLoi) {
        setTt('loi');
        setLoi(thongBaoLoi);
        return;
      }

      // Luồng PKCE trả về ?code=… ; luồng implicit trả về #access_token=…
      const code = new URL(window.location.href).searchParams.get('code');
      if (code) {
        const { error } = await sb().auth.exchangeCodeForSession(code);
        if (error && !huy) {
          setTt('loi');
          setLoi(error.message);
          return;
        }
      }

      // Trình duyệt cần một nhịp để đọc xong phần hash của URL
      for (let i = 0; i < 6 && !huy; i++) {
        const { data } = await sb().auth.getSession();
        if (data.session) {
          if (!huy) setTt('xong');
          return;
        }
        await new Promise((r) => setTimeout(r, 350));
      }

      if (!huy) {
        setTt('loi');
        setLoi('Link đã hết hạn hoặc đã được dùng rồi.');
      }
    })();

    return () => {
      huy = true;
    };
  }, []);

  if (tt === 'dang_xu_ly') {
    return (
      <Khung tieu="Đang xác thực…">
        <div className="flex items-center gap-3 text-nhat">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-phu">Chờ một chút.</span>
        </div>
      </Khung>
    );
  }

  if (tt === 'loi') {
    return (
      <Khung tieu="Chưa xác thực được" mo="Link trong email chỉ dùng được một lần và có hạn.">
        <The className="space-y-4">
          <div className="flex items-start gap-3 text-am">
            <MailWarning size={18} className="mt-0.5 shrink-0" />
            <span className="text-phu leading-relaxed">{loi}</span>
          </div>
          <p className="text-phu leading-relaxed text-nhat">
            Cách xử lý: đăng nhập lại bằng email và mật khẩu bạn đã đặt. Nếu hệ thống báo email chưa xác nhận, ở đó có
            nút gửi lại email mới.
          </p>
          <div className="flex gap-2 border-t border-vien pt-4">
            <Link to="/dang-nhap"><Button>Đăng nhập</Button></Link>
            <Link to="/gop-y"><Button variant="mo">Báo cho chúng tôi</Button></Link>
          </div>
        </The>
      </Khung>
    );
  }

  return (
    <Khung tieu="Đã xác thực email" mo="Cảm ơn bạn. Địa chỉ email của bạn đã được xác nhận.">
      <The className="space-y-4">
        <div className="flex items-center gap-3 text-nhan">
          <CheckCircle2 size={18} />
          <span className="text-phu font-medium">Xong bước xác nhận</span>
        </div>
        <p className="text-phu leading-relaxed text-nhat">
          Bước tiếp theo là người phụ trách đọc hồ sơ của bạn. Xác nhận email chỉ chứng minh địa chỉ có thật, chưa
          phải là được duyệt vào khu học.
        </p>
        <div className="border-t border-vien pt-4">
          <Link to={dangTai ? '/cho-duyet' : daDuyet ? '/hoc' : '/cho-duyet'}>
            <Button>{daDuyet ? 'Vào khu học' : 'Tiếp tục'}</Button>
          </Link>
        </div>
      </The>
    </Khung>
  );
}

/* ═══ /quen-mat-khau ══════════════════════════════════════════════════ */
export function QuenMatKhau() {
  const { guiEmailDatLaiMatKhau } = useAuth();
  const [dangGui, setDangGui] = useState(false);
  const [xong, setXong] = useState(false);

  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email'));
    setDangGui(true);
    try {
      await guiEmailDatLaiMatKhau(email);
      setXong(true);
    } catch (err) {
      // Không tiết lộ email nào có trong hệ thống — lỗi nào cũng vẫn báo "đã gửi",
      // trừ khi mạng/cấu hình hỏng thì mới nói thật để người dùng biết đường báo.
      const tin = err instanceof Error ? err.message : '';
      if (/fetch|network|cấu hình/i.test(tin)) toast.error(tin || 'Chưa gửi được.');
      else setXong(true);
    } finally {
      setDangGui(false);
    }
  };

  if (xong) {
    return (
      <Khung tieu="Đã gửi email" mo="Nếu địa chỉ đó có trong hệ thống, bạn sẽ nhận được email trong vài phút.">
        <The className="space-y-3 text-phu leading-relaxed text-nhat">
          <p>Link trong email dùng được một lần và hết hạn sau 1 giờ.</p>
          <p>Không thấy email? Xem trong hộp <b className="text-muc">Spam</b> hoặc <b className="text-muc">Quảng cáo</b>.</p>
          <div className="border-t border-vien pt-4">
            <Link to="/dang-nhap"><Button variant="vien">Về trang đăng nhập</Button></Link>
          </div>
        </The>
      </Khung>
    );
  }

  return (
    <Khung tieu="Quên mật khẩu" mo="Nhập email bạn đã dùng để đăng ký. Chúng tôi gửi cho bạn một link đặt lại.">
      <form className="space-y-4" onSubmit={gui}>
        <div>
          <DongNhan>Email</DongNhan>
          <O name="email" type="email" required autoFocus />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={dangGui}>
          {dangGui ? 'Đang gửi…' : 'Gửi link đặt lại'}
        </Button>
        <p className="text-center text-ghi text-nhat">
          <Link to="/dang-nhap" className="font-medium text-nhan underline-offset-2 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </Khung>
  );
}

/* ═══ /dat-lai-mat-khau — sau khi bấm link đặt lại ════════════════════ */
export function DatLaiMatKhau() {
  const { datLaiMatKhau } = useAuth();
  const [sanSang, setSanSang] = useState<boolean | null>(null);
  const [dangGui, setDangGui] = useState(false);
  const di = useNavigate();

  useEffect(() => {
    let huy = false;
    (async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (code) await sb().auth.exchangeCodeForSession(code).catch(() => undefined);

      for (let i = 0; i < 6 && !huy; i++) {
        const { data } = await sb().auth.getSession();
        if (data.session) {
          if (!huy) setSanSang(true);
          return;
        }
        await new Promise((r) => setTimeout(r, 350));
      }
      if (!huy) setSanSang(false);
    })();
    return () => {
      huy = true;
    };
  }, []);

  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const a = String(f.get('mk1'));
    const b = String(f.get('mk2'));
    if (a !== b) {
      toast.error('Hai ô mật khẩu chưa giống nhau.');
      return;
    }
    setDangGui(true);
    try {
      await datLaiMatKhau(a);
      toast.success('Đã đổi mật khẩu.');
      di('/hoc');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chưa đổi được mật khẩu.');
    } finally {
      setDangGui(false);
    }
  };

  if (sanSang === null) {
    return (
      <Khung tieu="Đang kiểm tra link…">
        <Loader2 size={18} className="animate-spin text-nhat" />
      </Khung>
    );
  }

  if (!sanSang) {
    return (
      <Khung tieu="Link không dùng được" mo="Link đặt lại mật khẩu chỉ dùng một lần và hết hạn sau 1 giờ.">
        <The className="space-y-4">
          <p className="text-phu leading-relaxed text-nhat">Xin một link mới, rồi bấm vào ngay khi nhận được.</p>
          <Link to="/quen-mat-khau"><Button>Xin link mới</Button></Link>
        </The>
      </Khung>
    );
  }

  return (
    <Khung tieu="Đặt mật khẩu mới">
      <form className="space-y-4" onSubmit={gui}>
        <div>
          <DongNhan phu="Ít nhất 8 ký tự">Mật khẩu mới</DongNhan>
          <O name="mk1" type="password" required minLength={8} autoFocus />
        </div>
        <div>
          <DongNhan>Nhập lại mật khẩu mới</DongNhan>
          <O name="mk2" type="password" required minLength={8} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : 'Lưu mật khẩu mới'}
        </Button>
      </form>
    </Khung>
  );
}
