-- ═══════════════════════════════════════════════════════════════════════
-- 04 · XÁC NHẬN EMAIL
--
-- Vì sao cần: trigger tạo hồ sơ chạy ngay khi có auth.users, tức là NGAY CẢ
-- KHI người đó chưa bấm vào link xác nhận trong email. Người duyệt cần thấy
-- được điều đó — không nên mở quyền cho một địa chỉ email chưa ai chứng minh
-- là có thật.
--
-- Bảng auth.users không đọc được từ phía trình duyệt, nên đồng bộ cờ sang
-- public.ho_so.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.ho_so
  add column if not exists email_da_xac_nhan boolean not null default false;

-- Cờ chỉ sống trong một transaction (tham số thứ ba = true), dùng để nói với
-- trigger chan_tu_duyet rằng lần ghi này là do hệ thống đồng bộ, không phải
-- người dùng tự sửa. Không dựa vào auth.uid() vì không chắc chắn ngữ cảnh nào
-- GoTrue chạy lệnh cập nhật email_confirmed_at.
create or replace function public.dong_bo_xac_nhan_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.dong_bo_xac_nhan', '1', true);
  update public.ho_so
     set email_da_xac_nhan = (new.email_confirmed_at is not null)
   where id = new.id;
  perform set_config('app.dong_bo_xac_nhan', '', true);
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.dong_bo_xac_nhan_email();

-- Đồng bộ cho những tài khoản đã có sẵn
update public.ho_so h
   set email_da_xac_nhan = (u.email_confirmed_at is not null)
  from auth.users u
 where u.id = h.id;

-- Người dùng không được tự đổi cờ này
create or replace function public.chan_tu_duyet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() null = chạy từ phía máy chủ (service_role, script seed, psql).
  -- RLS đã chặn người dùng ẩn danh ghi vào bảng này rồi, nên bỏ qua là an toàn.
  if auth.uid() is not null and not public.co_quyen(auth.uid(), 'QL_THANH_VIEN') then
    new.trang_thai    := old.trang_thai;
    new.duyet_boi     := old.duyet_boi;
    new.duyet_luc     := old.duyet_luc;
    new.ghi_chu_admin := old.ghi_chu_admin;
  end if;
  -- Cờ xác nhận email CHỈ do trigger đồng bộ từ auth.users đặt, không ai sửa tay
  if coalesce(current_setting('app.dong_bo_xac_nhan', true), '') <> '1' then
    new.email_da_xac_nhan := old.email_da_xac_nhan;
  end if;
  return new;
end;
$$;

-- Thống kê: thêm số hồ sơ chờ duyệt mà chưa xác nhận email
create or replace function public.thong_ke_tong_quan()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when not public.co_quyen(auth.uid(), 'XEM_THONG_KE') then '{}'::jsonb
  else jsonb_build_object(
    'cho_duyet',        (select count(*) from public.ho_so where trang_thai = 'cho_duyet'),
    'cho_duyet_da_xn',  (select count(*) from public.ho_so where trang_thai = 'cho_duyet' and email_da_xac_nhan),
    'hoat_dong',        (select count(*) from public.ho_so where trang_thai = 'hoat_dong'),
    'tam_khoa',         (select count(*) from public.ho_so where trang_thai = 'tam_khoa'),
    'nut_xuat_ban',     (select count(*) from public.nut where trang_thai = 'xuat_ban'),
    'nut_nhap',         (select count(*) from public.nut where trang_thai = 'nhap'),
    'nut_trong',        (select count(*) from public.nut where nhan = 'trong'),
    'module',           (select count(*) from public.module),
    'gop_y_moi',        (select count(*) from public.gop_y where trang_thai = 'moi'),
    'phieu_7ngay',      (select count(*) from public.phieu_ung_dung where created_at > now() - interval '7 days')
  ) end;
$$;
