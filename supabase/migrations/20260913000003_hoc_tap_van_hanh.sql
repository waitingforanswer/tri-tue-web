-- ═══════════════════════════════════════════════════════════════════════
-- 03 · HỌC TẬP & VẬN HÀNH — tiến độ, phiếu ứng dụng, ghi chú, góp ý, nhật ký
-- ═══════════════════════════════════════════════════════════════════════

create type public.trang_thai_hoc as enum ('chua_hoc', 'dang_hoc', 'da_xong');

-- ── Tiến độ học của từng người trên từng nút ──────────────────────────
create table public.tien_do (
  user_id    uuid not null references auth.users(id) on delete cascade,
  nut_id     uuid not null references public.nut(id) on delete cascade,
  trang_thai public.trang_thai_hoc not null default 'dang_hoc',
  ghi_chu    text,
  updated_at timestamptz not null default now(),
  primary key (user_id, nut_id)
);

create index tien_do_user_idx on public.tien_do (user_id, trang_thai);

-- ── Phiếu ứng dụng — kết quả chạy "Thước Trí tuệ" (wizard 4 bước) ─────
create table public.phieu_ung_dung (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tieu_de     text,
  khoi_ma     text,                                   -- 'bt' | 'gd' | 'cv' …
  van_de      jsonb not null default '[]'::jsonb,     -- các bất ổn đã chọn
  bieu_hien   jsonb not null default '[]'::jsonb,
  goc_do      jsonb not null default '[]'::jsonb,
  khuon       jsonb not null default '[]'::jsonb,     -- khuôn hệ thống gợi ra
  cam_ket     text,                                   -- người học tự viết
  ket_qua     text,                                   -- ghi lại sau khi làm
  hoan_thanh  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index phieu_user_idx on public.phieu_ung_dung (user_id, created_at desc);

-- ── Ghi chú cá nhân ───────────────────────────────────────────────────
create table public.ghi_chu (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nut_id     uuid references public.nut(id) on delete set null,
  noi_dung   text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ghi_chu_user_idx on public.ghi_chu (user_id, created_at desc);

-- ── Góp ý từ trang công khai ──────────────────────────────────────────
create type public.trang_thai_gop_y as enum ('moi', 'dang_xu_ly', 'xong');

create table public.gop_y (
  id         uuid primary key default gen_random_uuid(),
  ho_ten     text not null,
  email      text,
  dien_thoai text,
  noi_dung   text not null,
  trang_thai public.trang_thai_gop_y not null default 'moi',
  phan_hoi   text,
  xu_ly_boi  uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── Nhật ký thao tác quản trị ─────────────────────────────────────────
create table public.nhat_ky (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete set null,
  hanh_dong   text not null,       -- 'duyet_thanh_vien' | 'sua_nut' | 'xuat_ban' …
  bang        text,
  ban_ghi_id  text,
  chi_tiet    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index nhat_ky_time_idx on public.nhat_ky (created_at desc);

create trigger tien_do_updated_at   before update on public.tien_do        for each row execute function public.cham_updated_at();
create trigger phieu_updated_at     before update on public.phieu_ung_dung for each row execute function public.cham_updated_at();
create trigger ghi_chu_updated_at   before update on public.ghi_chu        for each row execute function public.cham_updated_at();

-- ═══ RLS ══════════════════════════════════════════════════════════════
alter table public.tien_do        enable row level security;
alter table public.phieu_ung_dung enable row level security;
alter table public.ghi_chu        enable row level security;
alter table public.gop_y          enable row level security;
alter table public.nhat_ky        enable row level security;

-- Dữ liệu học tập là RIÊNG TƯ. Quản trị viên chỉ xem được số liệu tổng
-- hợp qua view bên dưới, không đọc được nội dung phiếu / ghi chú.
create policy "tien_do_rieng" on public.tien_do
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "phieu_rieng" on public.phieu_ung_dung
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ghi_chu_rieng" on public.ghi_chu
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Góp ý: ai cũng gửi được, chỉ người có quyền mới đọc
create policy "gop_y_gui" on public.gop_y for insert with check (true);
create policy "gop_y_doc" on public.gop_y
  for select using (public.co_quyen(auth.uid(), 'QL_GOP_Y'));
create policy "gop_y_sua" on public.gop_y
  for update using (public.co_quyen(auth.uid(), 'QL_GOP_Y'))
  with check (public.co_quyen(auth.uid(), 'QL_GOP_Y'));

-- Nhật ký: chỉ đọc, ghi qua hàm SECURITY DEFINER
create policy "nhat_ky_doc" on public.nhat_ky
  for select using (public.co_quyen(auth.uid(), 'XEM_NHAT_KY'));

create or replace function public.ghi_nhat_ky(
  _hanh_dong text, _bang text default null,
  _ban_ghi_id text default null, _chi_tiet jsonb default '{}'::jsonb
) returns void language sql security definer set search_path = public as $$
  insert into public.nhat_ky (user_id, hanh_dong, bang, ban_ghi_id, chi_tiet)
  values (auth.uid(), _hanh_dong, _bang, _ban_ghi_id, _chi_tiet);
$$;

-- ── Thống kê tổng hợp cho bảng điều khiển (không lộ nội dung riêng tư) ──
create or replace function public.thong_ke_tong_quan()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when not public.co_quyen(auth.uid(), 'XEM_THONG_KE') then '{}'::jsonb
  else jsonb_build_object(
    'cho_duyet',   (select count(*) from public.ho_so where trang_thai = 'cho_duyet'),
    'hoat_dong',   (select count(*) from public.ho_so where trang_thai = 'hoat_dong'),
    'tam_khoa',    (select count(*) from public.ho_so where trang_thai = 'tam_khoa'),
    'nut_xuat_ban',(select count(*) from public.nut where trang_thai = 'xuat_ban'),
    'nut_nhap',    (select count(*) from public.nut where trang_thai = 'nhap'),
    'nut_trong',   (select count(*) from public.nut where nhan = 'trong'),
    'module',      (select count(*) from public.module),
    'gop_y_moi',   (select count(*) from public.gop_y where trang_thai = 'moi'),
    'phieu_7ngay', (select count(*) from public.phieu_ung_dung where created_at > now() - interval '7 days')
  ) end;
$$;

-- ── Duyệt thành viên (một cửa, có ghi nhật ký) ────────────────────────
create or replace function public.duyet_thanh_vien(
  _user_id uuid, _trang_thai public.trang_thai_tv, _ghi_chu text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.co_quyen(auth.uid(), 'QL_THANH_VIEN') then
    raise exception 'Không có quyền duyệt thành viên';
  end if;

  update public.ho_so
     set trang_thai = _trang_thai,
         ghi_chu_admin = coalesce(_ghi_chu, ghi_chu_admin),
         duyet_boi = auth.uid(),
         duyet_luc = now()
   where id = _user_id;

  perform public.ghi_nhat_ky(
    'duyet_thanh_vien', 'ho_so', _user_id::text,
    jsonb_build_object('trang_thai', _trang_thai, 'ghi_chu', _ghi_chu)
  );
end;
$$;
