/** Danh mục quyền — PHẢI khớp bảng public.quyen trong migration 01. */

export const QUYEN = {
  QL_THANH_VIEN: 'QL_THANH_VIEN',
  QL_VAI_TRO: 'QL_VAI_TRO',
  ND_XEM_NHAP: 'ND_XEM_NHAP',
  ND_SUA: 'ND_SUA',
  ND_XUAT_BAN: 'ND_XUAT_BAN',
  QL_MODULE: 'QL_MODULE',
  QL_TRANG: 'QL_TRANG',
  QL_BAI_VIET: 'QL_BAI_VIET',
  QL_GOP_Y: 'QL_GOP_Y',
  XEM_THONG_KE: 'XEM_THONG_KE',
  XEM_NHAT_KY: 'XEM_NHAT_KY',
} as const;

export type MaQuyen = (typeof QUYEN)[keyof typeof QUYEN];

export const MO_TA_QUYEN: Record<MaQuyen, { ten: string; nhom: string; mo_ta: string }> = {
  QL_THANH_VIEN: { ten: 'Quản lý thành viên', nhom: 'Con người', mo_ta: 'Xem hồ sơ, duyệt / từ chối / tạm khóa' },
  QL_VAI_TRO: { ten: 'Phân vai trò & quyền', nhom: 'Con người', mo_ta: 'Cấp vai trò sub-admin (chỉ admin)' },
  ND_XEM_NHAP: { ten: 'Xem bản nháp', nhom: 'Nội dung', mo_ta: 'Xem nội dung chưa xuất bản' },
  ND_SUA: { ten: 'Soạn & sửa nội dung', nhom: 'Nội dung', mo_ta: 'Thêm / sửa / xoá nút trong Kho Trí tuệ' },
  ND_XUAT_BAN: { ten: 'Xuất bản nội dung', nhom: 'Nội dung', mo_ta: 'Đổi trạng thái và phạm vi hiển thị' },
  QL_MODULE: { ten: 'Quản lý module học', nhom: 'Nội dung', mo_ta: 'Tạo module và cấp cho thành viên' },
  QL_TRANG: { ten: 'Quản lý trang công khai', nhom: 'Tầng 1', mo_ta: 'Sửa landing page và các trang giới thiệu' },
  QL_BAI_VIET: { ten: 'Quản lý bài viết', nhom: 'Tầng 1', mo_ta: 'Viết / sửa / xuất bản bài viết' },
  QL_GOP_Y: { ten: 'Xử lý góp ý', nhom: 'Vận hành', mo_ta: 'Đọc và trả lời góp ý' },
  XEM_THONG_KE: { ten: 'Xem thống kê', nhom: 'Vận hành', mo_ta: 'Bảng điều khiển và số liệu' },
  XEM_NHAT_KY: { ten: 'Xem nhật ký', nhom: 'Vận hành', mo_ta: 'Lịch sử thao tác quản trị' },
};

/** Bộ quyền mặc định của sub-admin. Admin luôn có TẤT CẢ. */
export const QUYEN_SUB_ADMIN: MaQuyen[] = [
  QUYEN.ND_XEM_NHAP,
  QUYEN.ND_SUA,
  QUYEN.QL_BAI_VIET,
  QUYEN.QL_GOP_Y,
  QUYEN.XEM_THONG_KE,
];

export const TAT_CA_QUYEN = Object.values(QUYEN) as MaQuyen[];
