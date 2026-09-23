import { Nhan } from '@/components/ui/co-ban';
import { TEN_NHAN, type Nhan as LoaiNhan } from '@/types/kho';
import { cn } from '@/lib/utils';

/** Chip nhãn nguồn gốc: Quy chuẩn / Quy chiếu / Ứng dụng / bản gốc còn trống. */
export function ChiNhan({ nhan, className }: { nhan?: string | null; className?: string }) {
  if (!nhan || !(nhan in TEN_NHAN)) return null;
  const m = TEN_NHAN[nhan as LoaiNhan];
  return <Nhan className={cn(m.lop, className)}>{m.chu}</Nhan>;
}

/** Đoạn văn giữ nguyên thẻ <b>/<em> của tài liệu gốc. */
export function VanGoc({ html, className }: { html?: string | null; className?: string }) {
  if (!html) return null;
  return <div className={cn('van', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
