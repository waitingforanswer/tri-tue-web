-- ═══════════════════════════════════════════════════════════════════════
-- 02 · KHO NỘI DUNG — mô hình "nút" (node) dùng chung cho toàn bộ Kho Trí tuệ
--
-- Vì sao một bảng thay vì 20 bảng?
--   Prototype có 24 cấu trúc khác nhau (cây kiến thức, từ điển, khuôn,
--   khối, lộ trình, bổ trợ, chu kỳ…). Nếu mỗi thứ một bảng thì admin phải
--   học 20 màn hình CRUD. Gom về một cây có `loai` + `du_lieu` jsonb thì
--   admin chỉ cần MỘT trình soạn cây, và thêm dạng nội dung mới sau này
--   không phải chạy migration.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Module học: đơn vị admin cấp cho thành viên ───────────────────────
create table public.module (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  ten         text not null,
  mo_ta       text,
  icon        text,
  thu_tu      int not null default 0,
  pham_vi     public.pham_vi not null default 'thanh_vien',
  trang_thai  public.trang_thai_nd not null default 'nhap',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Cấp module cho một người cụ thể (dùng khi module có pham_vi = 'gioi_han')
create table public.cap_module (
  module_id  uuid not null references public.module(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  cap_boi    uuid references auth.users(id) on delete set null,
  ghi_chu    text,
  created_at timestamptz not null default now(),
  primary key (module_id, user_id)
);

-- ── Nút nội dung ──────────────────────────────────────────────────────
create table public.nut (
  id          uuid primary key default gen_random_uuid(),
  loai        text not null,           -- 'phan' | 'nhanh' | 'y' | 'khoi' | 'khuon' | 'tu' | 'buoc' | …
  cha_id      uuid references public.nut(id) on delete cascade,
  module_id   uuid references public.module(id) on delete set null,

  ma          text,                    -- mã gốc trong tài liệu: "NLCĐ 1", "MẢNG 3", "bt"…
  tieu_de     text not null,
  tom_tat     text,                    -- HTML ngắn (dòng "nói")
  noi_dung    text,                    -- HTML dài
  nhan        text,                    -- 'qc' | 'qchieu' | 'ud' | 'trong'
  du_lieu     jsonb not null default '{}'::jsonb,  -- trường riêng theo loai

  thu_tu      int not null default 0,
  pham_vi     public.pham_vi not null default 'thanh_vien',
  trang_thai  public.trang_thai_nd not null default 'xuat_ban',

  tao_boi     uuid references auth.users(id) on delete set null,
  sua_boi     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index nut_loai_idx    on public.nut (loai);
create index nut_cha_idx     on public.nut (cha_id, thu_tu);
create index nut_module_idx  on public.nut (module_id);
create index nut_pham_vi_idx on public.nut (pham_vi, trang_thai);
-- `ma` chỉ duy nhất TRONG PHẠM VI NÚT CHA, không duy nhất toàn cục:
-- tài liệu gốc dùng lại các mã như "①", "MẢNG 1" ở nhiều phần khác nhau.
-- NULLS NOT DISTINCT để các nút gốc (cha_id = null) cũng bị bắt trùng.
create unique index nut_ma_trong_cha_uniq
  on public.nut (cha_id, loai, ma) nulls not distinct
  where ma is not null;

-- Tìm kiếm không dấu: cột sinh sẵn + chỉ mục trigram
create extension if not exists unaccent;
create extension if not exists pg_trgm;

create or replace function public.bo_dau(t text)
returns text language sql immutable strict parallel safe as $$
  select lower(public.unaccent('public.unaccent', coalesce(t, '')));
$$;

alter table public.nut add column tu_khoa text
  generated always as (
    public.bo_dau(coalesce(ma, '') || ' ' || tieu_de || ' ' ||
                  coalesce(regexp_replace(tom_tat,  '<[^>]*>', '', 'g'), '') || ' ' ||
                  coalesce(regexp_replace(noi_dung, '<[^>]*>', '', 'g'), ''))
  ) stored;

create index nut_tu_khoa_idx on public.nut using gin (tu_khoa gin_trgm_ops);

-- ── Liên kết giữa các nút (ánh xạ góc độ → khuôn, biểu hiện → khối…) ──
create table public.lien_ket_nut (
  tu_id     uuid not null references public.nut(id) on delete cascade,
  den_id    uuid not null references public.nut(id) on delete cascade,
  quan_he   text not null,   -- 'goc_do_khuon' | 'bieu_hien_khoi' | 'dan_toi' | 'lien_quan'
  thu_tu    int not null default 0,
  primary key (tu_id, den_id, quan_he)
);

create index lien_ket_den_idx on public.lien_ket_nut (den_id, quan_he);

-- ── Trang công khai (tầng 1) do admin soạn ────────────────────────────
create table public.trang (
  slug        text primary key,        -- 'trang-chu' | 'tri-tue-la-gi' | 'cam-ket' …
  tieu_de     text not null,
  mo_ta       text,
  khoi        jsonb not null default '[]'::jsonb,  -- mảng section: {loai, ...}
  trang_thai  public.trang_thai_nd not null default 'nhap',
  sua_boi     uuid references auth.users(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- ── Bài viết ──────────────────────────────────────────────────────────
create table public.bai_viet (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  tieu_de       text not null,
  tom_tat       text,
  noi_dung      text,
  anh_bia       text,
  pham_vi       public.pham_vi not null default 'cong_khai',
  trang_thai    public.trang_thai_nd not null default 'nhap',
  tac_gia       uuid references auth.users(id) on delete set null,
  xuat_ban_luc  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index bai_viet_xb_idx on public.bai_viet (trang_thai, pham_vi, xuat_ban_luc desc);

-- ── updated_at ────────────────────────────────────────────────────────
create trigger module_updated_at   before update on public.module   for each row execute function public.cham_updated_at();
create trigger nut_updated_at      before update on public.nut      for each row execute function public.cham_updated_at();
create trigger trang_updated_at    before update on public.trang    for each row execute function public.cham_updated_at();
create trigger bai_viet_updated_at before update on public.bai_viet for each row execute function public.cham_updated_at();

-- ═══ RLS ══════════════════════════════════════════════════════════════
alter table public.module       enable row level security;
alter table public.cap_module   enable row level security;
alter table public.nut          enable row level security;
alter table public.lien_ket_nut enable row level security;
alter table public.trang        enable row level security;
alter table public.bai_viet     enable row level security;

-- Người dùng có xem được module này không?
create or replace function public.xem_duoc_module(_uid uuid, _module uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when _module is null then true
    when public.la_quan_tri(_uid) then true
    else exists (
      select 1 from public.module m
      where m.id = _module
        and m.trang_thai = 'xuat_ban'
        and (
          m.pham_vi = 'cong_khai'
          or (m.pham_vi = 'thanh_vien' and public.la_thanh_vien(_uid))
          or (m.pham_vi = 'gioi_han'  and public.la_thanh_vien(_uid)
              and exists (select 1 from public.cap_module c
                          where c.module_id = m.id and c.user_id = _uid))
        )
    )
  end;
$$;

-- MODULE
create policy "module_cong_khai" on public.module
  for select using (trang_thai = 'xuat_ban' and pham_vi = 'cong_khai');
create policy "module_thanh_vien" on public.module
  for select using (
    trang_thai = 'xuat_ban' and public.la_thanh_vien(auth.uid())
    and (pham_vi = 'thanh_vien'
         or exists (select 1 from public.cap_module c
                    where c.module_id = id and c.user_id = auth.uid()))
  );
create policy "module_quan_tri" on public.module
  for all using (public.co_quyen(auth.uid(), 'QL_MODULE'))
  with check (public.co_quyen(auth.uid(), 'QL_MODULE'));

-- CẤP MODULE
create policy "cap_module_cua_minh" on public.cap_module
  for select using (auth.uid() = user_id or public.co_quyen(auth.uid(), 'QL_MODULE'));
create policy "cap_module_quan_tri" on public.cap_module
  for all using (public.co_quyen(auth.uid(), 'QL_MODULE'))
  with check (public.co_quyen(auth.uid(), 'QL_MODULE'));

-- NÚT — ba lớp đọc, tách bạch theo đúng 3 tầng của website
create policy "nut_tang1_cong_khai" on public.nut
  for select using (trang_thai = 'xuat_ban' and pham_vi = 'cong_khai');

create policy "nut_tang2_thanh_vien" on public.nut
  for select using (
    trang_thai = 'xuat_ban'
    and public.la_thanh_vien(auth.uid())
    and (pham_vi in ('cong_khai', 'thanh_vien')
         or (pham_vi = 'gioi_han' and public.xem_duoc_module(auth.uid(), module_id)))
    and public.xem_duoc_module(auth.uid(), module_id)
  );

create policy "nut_tang3_xem_nhap" on public.nut
  for select using (public.co_quyen(auth.uid(), 'ND_XEM_NHAP'));

create policy "nut_soan" on public.nut
  for insert with check (public.co_quyen(auth.uid(), 'ND_SUA'));
create policy "nut_sua" on public.nut
  for update using (public.co_quyen(auth.uid(), 'ND_SUA'))
  with check (public.co_quyen(auth.uid(), 'ND_SUA'));
create policy "nut_xoa" on public.nut
  for delete using (public.co_quyen(auth.uid(), 'ND_SUA'));

-- Chỉ người có quyền ND_XUAT_BAN mới được đổi trạng thái / phạm vi
create or replace function public.chan_tu_xuat_ban()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() null = chạy từ phía máy chủ (service_role, script seed, psql).
  -- RLS đã chặn người không có ND_SUA ghi vào bảng này rồi.
  if auth.uid() is not null and not public.co_quyen(auth.uid(), 'ND_XUAT_BAN') then
    new.trang_thai := old.trang_thai;
    new.pham_vi    := old.pham_vi;
  end if;
  new.sua_boi := coalesce(auth.uid(), old.sua_boi);
  return new;
end;
$$;

create trigger nut_chan_xuat_ban before update on public.nut
  for each row execute function public.chan_tu_xuat_ban();

-- LIÊN KẾT — đọc được nếu đọc được nút nguồn
create policy "lien_ket_doc" on public.lien_ket_nut
  for select using (exists (select 1 from public.nut n where n.id = tu_id));
create policy "lien_ket_sua" on public.lien_ket_nut
  for all using (public.co_quyen(auth.uid(), 'ND_SUA'))
  with check (public.co_quyen(auth.uid(), 'ND_SUA'));

-- TRANG công khai
create policy "trang_doc" on public.trang
  for select using (trang_thai = 'xuat_ban' or public.co_quyen(auth.uid(), 'QL_TRANG'));
create policy "trang_sua" on public.trang
  for all using (public.co_quyen(auth.uid(), 'QL_TRANG'))
  with check (public.co_quyen(auth.uid(), 'QL_TRANG'));

-- BÀI VIẾT
create policy "bai_viet_cong_khai" on public.bai_viet
  for select using (trang_thai = 'xuat_ban' and pham_vi = 'cong_khai');
create policy "bai_viet_thanh_vien" on public.bai_viet
  for select using (trang_thai = 'xuat_ban' and public.la_thanh_vien(auth.uid()));
create policy "bai_viet_quan_tri" on public.bai_viet
  for all using (public.co_quyen(auth.uid(), 'QL_BAI_VIET'))
  with check (public.co_quyen(auth.uid(), 'QL_BAI_VIET'));
