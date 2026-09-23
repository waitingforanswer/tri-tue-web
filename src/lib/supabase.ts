import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Thiếu cấu hình thì website KHÔNG chạy — và nói thẳng là thiếu.
 *
 * Bản v0.3 từng có "chế độ demo" tự chạy dữ liệu tĩnh khi thiếu biến môi
 * trường. Lên môi trường thật thì đó là bẫy: khai sai tên biến trên Netlify,
 * web vẫn lên nhưng chạy dữ liệu giả mà không báo gì. Nay thiếu là báo.
 */
export const thieuCauHinh = !URL || !KEY;

export const supabase: SupabaseClient | null = thieuCauHinh
  ? null
  : createClient(URL!, KEY!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });

export function sb(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Chưa cấu hình Supabase. Cần VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return supabase;
}
