/** Hộp thoại nổi giữa màn hình — đóng bằng Esc, bấm nền, hoặc nút ×. */
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HopThoai({
  mo, dong, tieuDe, phu, children, rong = 'max-w-lg',
}: {
  mo: boolean;
  dong: () => void;
  tieuDe: ReactNode;
  phu?: ReactNode;
  children: ReactNode;
  rong?: string;
}) {
  useEffect(() => {
    if (!mo) return;
    const phim = (e: KeyboardEvent) => e.key === 'Escape' && dong();
    document.addEventListener('keydown', phim);
    const cu = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', phim);
      document.body.style.overflow = cu;
    };
  }, [mo, dong]);

  if (!mo) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-muc/25" onClick={dong} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn('the relative my-8 w-full bg-giay p-5 shadow-lg', rong)}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-chu text-than font-semibold">{tieuDe}</h3>
            {phu && <p className="mt-0.5 text-vi text-nhat">{phu}</p>}
          </div>
          <button onClick={dong} className="shrink-0 text-nhat hover:text-muc" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/** Ô chọn cùng kiểu dáng với <O>. */
export function OChon({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-lg border border-vien bg-giay px-3 text-ghi text-muc',
        'focus:border-nhan/40 focus:outline-none focus:ring-2 focus:ring-nhan/15',
        className
      )}
      {...p}
    />
  );
}

/** Nhãn + ô nhập, xếp dọc. */
export function Truong({ nhan, phu, children }: { nhan: string; phu?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-vi font-medium text-muc">{nhan}</span>
      {children}
      {phu && <span className="block text-mac text-nhat">{phu}</span>}
    </label>
  );
}
