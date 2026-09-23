/** Kiểu dữ liệu chung của Kho Trí tuệ — khớp 1-1 với bảng trong Supabase. */

export type PhamVi = 'cong_khai' | 'thanh_vien' | 'gioi_han';
export type TrangThaiND = 'nhap' | 'xuat_ban' | 'luu_tru';
export type TrangThaiTV = 'cho_duyet' | 'hoat_dong' | 'tam_khoa' | 'tu_choi';
export type VaiTro = 'admin' | 'sub_admin' | 'thanh_vien';

/** Nhãn nguồn gốc của một nội dung, giữ nguyên quy ước của tài liệu gốc. */
export type Nhan = 'qc' | 'qchieu' | 'ud' | 'trong';

/** Các loại nút hiện có. Thêm loại mới KHÔNG cần migration. */
export type LoaiNut =
  | 'phan' | 'nhanh' | 'y'                                   // cây kiến thức
  | 'khoi' | 'van_de' | 'khai_thac' | 'bieu_hien' | 'goc_do' | 'phap'  // thước
  | 'khuon' | 'viec' | 'khuon_khoi' | 'khuon_ngoai'          // thư viện khuôn
  | 'nhom_tu' | 'tu' | 'cap_de_nham' | 'y_bam' | 'bam_14'    // từ điển
  | 'buoc' | 'buoc_y' | 'bo_tro' | 'nhom_hoc' | 'cong_thuc_hoc'        // lộ trình
  | 'chu_ky' | 'phan_xa' | 'canh_phat_sinh' | 'dat_ten_canh'; // sống hằng ngày

export interface Nut {
  id: string;
  loai: LoaiNut | string;
  cha_id: string | null;
  module_id: string | null;
  ma: string | null;
  tieu_de: string;
  tom_tat: string | null;
  noi_dung: string | null;
  nhan: Nhan | null;
  du_lieu: Record<string, unknown>;
  thu_tu: number;
  pham_vi: PhamVi;
  trang_thai: TrangThaiND;
}

export interface LienKet {
  tu_id: string;
  den_id: string;
  quan_he: 'goc_do_khuon' | 'bieu_hien_khoi' | 'dan_toi' | 'lien_quan' | string;
  thu_tu: number;
}

export interface Module {
  id: string;
  slug: string;
  ten: string;
  mo_ta: string | null;
  icon: string | null;
  thu_tu: number;
  pham_vi: PhamVi;
  trang_thai: TrangThaiND;
}

export interface HoSo {
  id: string;
  ho_ten: string;
  email: string | null;
  dien_thoai: string | null;
  trang_thai: TrangThaiTV;
  ly_do_hoc: string | null;
  van_de_dang_gap: string | null;
  nguoi_gioi_thieu: string | null;
  ghi_chu_admin: string | null;
  duyet_luc: string | null;
  /** Đồng bộ từ auth.users — người này đã bấm link xác nhận trong email chưa */
  email_da_xac_nhan: boolean;
  created_at: string;
}

export type TrangThaiGopY = 'moi' | 'dang_xu_ly' | 'xong';

export interface GopY {
  id: string;
  ho_ten: string;
  email: string | null;
  dien_thoai: string | null;
  noi_dung: string;
  trang_thai: TrangThaiGopY;
  phan_hoi: string | null;
  created_at: string;
}

export interface NhatKy {
  id: number;
  user_id: string | null;
  hanh_dong: string;
  bang: string | null;
  ban_ghi_id: string | null;
  chi_tiet: Record<string, unknown>;
  created_at: string;
}

/** Kết quả một lần chạy Thước Trí tuệ. Riêng tư — chỉ chủ phiếu đọc được. */
export interface PhieuUngDung {
  id: string;
  user_id: string;
  tieu_de: string | null;
  khoi_ma: string | null;
  van_de: string[];
  bieu_hien: string[];
  goc_do: string[];
  khuon: string[];
  cam_ket: string | null;
  ket_qua: string | null;
  hoan_thanh: boolean;
  created_at: string;
  updated_at: string;
}

export interface GhiChu {
  id: string;
  user_id: string;
  nut_id: string | null;
  noi_dung: string;
  created_at: string;
  updated_at: string;
}

export interface BaiViet {
  id: string;
  slug: string;
  tieu_de: string;
  tom_tat: string | null;
  noi_dung: string | null;
  anh_bia: string | null;
  pham_vi: PhamVi;
  trang_thai: TrangThaiND;
  xuat_ban_luc: string | null;
  created_at: string;
}

export const TEN_TRANG_THAI_GOP_Y: Record<TrangThaiGopY, string> = {
  moi: 'Mới',
  dang_xu_ly: 'Đang xử lý',
  xong: 'Đã xong',
};

export interface KetQuaTim {
  nut: Nut;
  duong: string;
}

export const TEN_NHAN: Record<Nhan, { chu: string; lop: string }> = {
  qc: { chu: 'Quy chuẩn', lop: 'bg-nhan-nhe text-nhan' },
  qchieu: { chu: 'Quy chiếu', lop: 'bg-am/10 text-am' },
  ud: { chu: 'Ứng dụng', lop: 'bg-muc/8 text-muc' },
  trong: { chu: 'Bản gốc còn trống', lop: 'bg-canh text-am' },
};

export const TEN_LOAI: Record<string, string> = {
  phan: 'Phần', nhanh: 'Mảng', y: 'Ý',
  khoi: 'Khối', van_de: 'Bất ổn', khai_thac: 'Khai thác', bieu_hien: 'Biểu hiện',
  goc_do: 'Góc độ tác động', phap: 'Pháp',
  khuon: 'Khuôn', viec: 'Việc cần làm', khuon_khoi: 'Khuôn khối', khuon_ngoai: 'Khuôn ngoài',
  nhom_tu: 'Nhóm thuật ngữ', tu: 'Thuật ngữ', cap_de_nham: 'Cặp dễ nhầm',
  y_bam: 'Ý bám', bam_14: 'Điểm bám',
  buoc: 'Bước', buoc_y: 'Nội dung bước', bo_tro: 'Mục bổ trợ',
  nhom_hoc: 'Nhóm người học', cong_thuc_hoc: 'Công thức học',
  chu_ky: 'Chu kỳ', phan_xa: 'Phản xạ', canh_phat_sinh: 'Cảnh phát sinh',
  dat_ten_canh: 'Đặt tên cảnh',
};

export const TEN_TRANG_THAI_ND: Record<TrangThaiND, string> = {
  nhap: 'Nháp',
  xuat_ban: 'Đã xuất bản',
  luu_tru: 'Lưu trữ',
};

export const TEN_TRANG_THAI_TV: Record<TrangThaiTV, string> = {
  cho_duyet: 'Chờ duyệt',
  hoat_dong: 'Đang học',
  tam_khoa: 'Tạm khóa',
  tu_choi: 'Đã từ chối',
};
