/** Các thành phần giao diện nhỏ dùng chung. */
import { forwardRef, type HTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function The({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('the p-5', className)} {...p} />;
}

export function Nhan({ className, ...p }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-mac font-medium leading-5',
        className
      )}
      {...p}
    />
  );
}

export const O = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-vien bg-giay px-3 text-sm text-muc',
        'placeholder:text-nhat/70 focus:border-nhan/40 focus:outline-none focus:ring-2 focus:ring-nhan/15',
        className
      )}
      {...p}
    />
  )
);
O.displayName = 'O';

export const OVung = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-vien bg-giay px-3 py-2 text-sm text-muc',
        'placeholder:text-nhat/70 focus:border-nhan/40 focus:outline-none focus:ring-2 focus:ring-nhan/15',
        className
      )}
      {...p}
    />
  )
);
OVung.displayName = 'OVung';

export function DongNhan({ children, phu }: { children: React.ReactNode; phu?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-ghi font-medium text-muc">{children}</span>
      {phu && <span className="block text-xs text-nhat">{phu}</span>}
    </label>
  );
}

export function Trong({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-vien px-5 py-10 text-center text-sm text-nhat">
      {children}
    </div>
  );
}

export function DangTai({ dong = 3 }: { dong?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: dong }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-muc/5" />
      ))}
    </div>
  );
}

export function TieuDeMuc({ children, phu }: { children: React.ReactNode; phu?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-muc">{children}</h2>
      {phu && <p className="mt-1 text-sm text-nhat">{phu}</p>}
    </div>
  );
}
