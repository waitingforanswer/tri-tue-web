import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Bỏ dấu tiếng Việt để tìm kiếm — "nghiệp" khớp "nghiep". */
export function boDau(s: string) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function loTag(s?: string | null) {
  return String(s ?? '').replace(/<[^>]*>/g, '');
}

export function ngayVN(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function slugHoa(s: string) {
  return boDau(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
