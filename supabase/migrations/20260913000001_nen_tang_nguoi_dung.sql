-- ═══════════════════════════════════════════════════════════════════════
-- 01 · NỀN TẢNG NGƯỜI DÙNG — hồ sơ, vai trò, quyền
-- Website Vốn sống Trí tuệ · 3 tầng: công khai → thành viên → quản trị
-- ═══════════════════════════════════════════════════════════════════════

-- ── Kiểu dữ liệu ──────────────────────────────────────────────────────
create type public.trang_thai_tv as enum (
  'cho_duyet',   -- vừa đăng ký, đang chờ admin xét
  'hoat_dong',   -- đã được duyệt, vào được tầng 2
  'tam_khoa',    -- tạm dừng quyền truy cập
  'tu_choi'      -- admin từ chối
);

create type public.vai_tro as enum ('admin', 'sub_admin', 'thanh_vien');

create type public.trang_thai_nd as enum ('nhap', 'xuat_ban', 'luu_tru');

-- Phạm vi hiển thị của một nội dung
create type public.pham_vi as enum (
  'cong_khai',   -- tầng 1 · ai cũng xem được
  'thanh_vien',  -- tầng 2 · thành viên đã duyệt
  'gioi_han'     -- tầng 2 hạn chế · phải được cấp module/quyền riêng
);

-- ── Hồ sơ người dùng ──────────────────────────────────────────────────
-- Gắn 1-1 với auth.users của Supabase Auth.
create table public.ho_so (
  id                uuid primary key references auth.users(id) on delete cascade,
  ho_ten            text not null,
  email             text,
  dien_thoai        text,
  anh_dai_dien      text,
  trang_thai        public.trang_thai_tv not null default 'cho_duyet',

  -- Câu trả lời lúc đăng ký — cơ sở để admin xét duyệt "đúng người"
  ly_do_hoc         text,          -- "Vì sao bạn muốn học Vốn sống Trí tuệ?"
  van_de_dang_gap   text,          -- "Bạn đang gặp bất ổn gì?"
  nguoi_gioi_thieu  text,          -- ai giới thiệu (nếu có)
  cam_ket           boolean not null default false,

  ghi_chu_admin     text,
  duyet_boi         uuid references auth.users(id) on delete set null,
  duyet_luc         timestamptz,
  dang_nhap_cuoi    timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index ho_so_trang_thai_idx on public.ho_so (trang_thai);

-- ── Vai trò ───────────────────────────────────────────────────────────
create table public.vai_tro_nguoi_dung (
  user_id    uuid not null references auth.users(id) on delete cascade,
  vai_tro    public.vai_tro not null,
  cap_boi    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, vai_tro)
);

-- ── Quyền chi tiết (dành cho sub-admin) ───────────────────────────────
create table public.quyen (
  ma      text primary key,
  ten     text not null,
  nhom    text not null,
  mo_ta   text
);

create table public.quyen_vai_tro (
  vai_tro  public.vai_tro not null,
  quyen_ma text not null references public.quyen(ma) on delete cascade,
  primary key (vai_tro, quyen_ma)
);

-- Cấp/thu quyền riêng cho từng người, đè lên quyền của vai trò
create table public.quyen_nguoi_dung (
  user_id   uuid not null references auth.users(id) on delete cascade,
  quyen_ma  text not null references public.quyen(ma) on delete cascade,
  cho_phep  boolean not null default true,
  cap_boi   uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, quyen_ma)
);

-- ── Hàm kiểm tra (SECURITY DEFINER để RLS không đệ quy) ───────────────
create or replace function public.co_vai_tro(_uid uuid, _vt public.vai_tro)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vai_tro_nguoi_dung where user_id = _uid and vai_tro = _vt);
$$;

create or replace function public.la_admin(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vai_tro_nguoi_dung where user_id = _uid and vai_tro = 'admin');
$$;

create or replace function public.la_quan_tri(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vai_tro_nguoi_dung
    where user_id = _uid and vai_tro in ('admin', 'sub_admin')
  );
$$;

-- Thành viên đã được duyệt → mở tầng 2
create or replace function public.la_thanh_vien(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ho_so where id = _uid and trang_thai = 'hoat_dong');
$$;

-- Quyền hiệu lực: admin có tất cả; sub-admin theo vai trò + đè theo người
create or replace function public.co_quyen(_uid uuid, _ma text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.la_admin(_uid) then true
    when exists (select 1 from public.quyen_nguoi_dung
                 where user_id = _uid and quyen_ma = _ma and cho_phep = false) then false
    when exists (select 1 from public.quyen_nguoi_dung
                 where user_id = _uid and quyen_ma = _ma and cho_phep = true) then true
    else exists (
      select 1 from public.quyen_vai_tro qv
      join public.vai_tro_nguoi_dung vt on vt.vai_tro = qv.vai_tro
      where vt.user_id = _uid and qv.quyen_ma = _ma
    )
  end;
$$;

-- ── Tự tạo hồ sơ khi có tài khoản mới ─────────────────────────────────
create or replace function public.xu_ly_nguoi_dung_moi()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.ho_so (id, ho_ten, email, dien_thoai, ly_do_hoc, van_de_dang_gap, nguoi_gioi_thieu, cam_ket)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'ho_ten', split_part(coalesce(new.email, 'thanh vien'), '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'dien_thoai',
    new.raw_user_meta_data ->> 'ly_do_hoc',
    new.raw_user_meta_data ->> 'van_de_dang_gap',
    new.raw_user_meta_data ->> 'nguoi_gioi_thieu',
    coalesce((new.raw_user_meta_data ->> 'cam_ket')::boolean, false)
  )
  on conflict (id) do nothing;

  insert into public.vai_tro_nguoi_dung (user_id, vai_tro)
  values (new.id, 'thanh_vien')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.xu_ly_nguoi_dung_moi();

-- ── updated_at ────────────────────────────────────────────────────────
create or replace function public.cham_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger ho_so_updated_at before update on public.ho_so
  for each row execute function public.cham_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────
alter table public.ho_so                enable row level security;
alter table public.vai_tro_nguoi_dung   enable row level security;
alter table public.quyen                enable row level security;
alter table public.quyen_vai_tro        enable row level security;
alter table public.quyen_nguoi_dung     enable row level security;

-- Hồ sơ: xem của mình; quản trị viên có quyền QL_THANH_VIEN xem tất cả
create policy "ho_so_xem_cua_minh" on public.ho_so
  for select using (auth.uid() = id);
create policy "ho_so_quan_tri_xem" on public.ho_so
  for select using (public.co_quyen(auth.uid(), 'QL_THANH_VIEN'));
create policy "ho_so_sua_cua_minh" on public.ho_so
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
create policy "ho_so_quan_tri_sua" on public.ho_so
  for all using (public.co_quyen(auth.uid(), 'QL_THANH_VIEN'))
  with check (public.co_quyen(auth.uid(), 'QL_THANH_VIEN'));

-- QUAN TRỌNG: người dùng KHÔNG được tự đổi trang_thai của mình.
-- Chặn ở tầng trigger cho chắc, vì RLS không so sánh được cột cũ/mới.
create or replace function public.chan_tu_duyet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() null = chạy từ phía máy chủ (service_role, script seed, psql).
  -- RLS đã chặn người dùng ẩn danh ghi vào bảng này rồi, nên bỏ qua là an toàn.
  if auth.uid() is not null and not public.co_quyen(auth.uid(), 'QL_THANH_VIEN') then
    new.trang_thai   := old.trang_thai;
    new.duyet_boi    := old.duyet_boi;
    new.duyet_luc    := old.duyet_luc;
    new.ghi_chu_admin := old.ghi_chu_admin;
  end if;
  return new;
end;
$$;

create trigger ho_so_chan_tu_duyet before update on public.ho_so
  for each row execute function public.chan_tu_duyet();

-- Vai trò: chỉ admin thao tác; ai cũng đọc được vai trò của chính mình
create policy "vai_tro_xem_cua_minh" on public.vai_tro_nguoi_dung
  for select using (auth.uid() = user_id);
create policy "vai_tro_admin_xem" on public.vai_tro_nguoi_dung
  for select using (public.la_quan_tri(auth.uid()));
create policy "vai_tro_admin_sua" on public.vai_tro_nguoi_dung
  for all using (public.la_admin(auth.uid()))
  with check (public.la_admin(auth.uid()));

-- Danh mục quyền: ai đăng nhập cũng đọc được (để dựng giao diện)
create policy "quyen_doc" on public.quyen
  for select using (auth.uid() is not null);
create policy "quyen_admin_sua" on public.quyen
  for all using (public.la_admin(auth.uid())) with check (public.la_admin(auth.uid()));

create policy "quyen_vai_tro_doc" on public.quyen_vai_tro
  for select using (auth.uid() is not null);
create policy "quyen_vai_tro_admin_sua" on public.quyen_vai_tro
  for all using (public.la_admin(auth.uid())) with check (public.la_admin(auth.uid()));

create policy "quyen_nd_xem_cua_minh" on public.quyen_nguoi_dung
  for select using (auth.uid() = user_id or public.la_quan_tri(auth.uid()));
create policy "quyen_nd_admin_sua" on public.quyen_nguoi_dung
  for all using (public.la_admin(auth.uid())) with check (public.la_admin(auth.uid()));

-- ── Danh mục quyền chuẩn ──────────────────────────────────────────────
insert into public.quyen (ma, ten, nhom, mo_ta) values
  ('QL_THANH_VIEN',  'Quản lý thành viên',        'Con người', 'Xem hồ sơ, duyệt / từ chối / tạm khóa thành viên'),
  ('QL_VAI_TRO',     'Phân vai trò & quyền',      'Con người', 'Cấp vai trò sub-admin và quyền chi tiết (chỉ admin)'),
  ('ND_XEM_NHAP',    'Xem nội dung bản nháp',     'Nội dung',  'Xem các nút nội dung chưa xuất bản'),
  ('ND_SUA',         'Soạn & sửa nội dung',       'Nội dung',  'Thêm / sửa / xoá nút trong Kho Trí tuệ'),
  ('ND_XUAT_BAN',    'Xuất bản nội dung',         'Nội dung',  'Đổi trạng thái nháp → xuất bản, đặt phạm vi hiển thị'),
  ('QL_MODULE',      'Quản lý module học',        'Nội dung',  'Tạo module, xếp nội dung vào module, cấp module cho thành viên'),
  ('QL_TRANG',       'Quản lý trang công khai',   'Tầng 1',    'Sửa landing page, trang giới thiệu, cam kết minh bạch'),
  ('QL_BAI_VIET',    'Quản lý bài viết',          'Tầng 1',    'Viết / sửa / xuất bản bài viết, tin tức'),
  ('QL_GOP_Y',       'Xử lý góp ý',               'Vận hành',  'Đọc và xử lý góp ý gửi từ trang công khai'),
  ('XEM_THONG_KE',   'Xem thống kê',              'Vận hành',  'Bảng điều khiển, số liệu thành viên và nội dung'),
  ('XEM_NHAT_KY',    'Xem nhật ký hệ thống',      'Vận hành',  'Lịch sử thao tác của quản trị viên')
on conflict (ma) do nothing;

-- Bộ quyền mặc định của sub-admin (admin luôn có tất cả, không cần liệt kê)
insert into public.quyen_vai_tro (vai_tro, quyen_ma) values
  ('sub_admin', 'ND_XEM_NHAP'),
  ('sub_admin', 'ND_SUA'),
  ('sub_admin', 'QL_BAI_VIET'),
  ('sub_admin', 'QL_GOP_Y'),
  ('sub_admin', 'XEM_THONG_KE')
on conflict do nothing;
