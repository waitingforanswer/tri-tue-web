import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nhan/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        chinh: 'bg-nhan text-white hover:bg-nhan/90 shadow-nhe',
        vien: 'border border-vien bg-giay text-muc hover:bg-nhan-nhe hover:border-nhan/30',
        mo: 'text-muc hover:bg-muc/5',
        nhan: 'bg-nhan-nhe text-nhan hover:bg-nhan-nhe/70',
        canhbao: 'bg-am text-white hover:bg-am/90',
      },
      size: {
        sm: 'h-8 px-3 text-ghi',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-than',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'chinh', size: 'md' },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
