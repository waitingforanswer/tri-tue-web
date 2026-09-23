/**
 * Màn hình khi thiếu biến môi trường. Thà báo thẳng còn hơn im lặng chạy sai.
 * Đây chính là cái bẫy đã gặp: khai nhầm tên biến trên Netlify thì web vẫn
 * lên nhưng không nối được cơ sở dữ liệu.
 */
export default function ThieuCauHinh() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nen px-5 py-16">
      <div className="the max-w-xl p-7">
        <h1 className="font-chu text-de-lon font-semibold">Chưa cấu hình cơ sở dữ liệu</h1>
        <p className="mt-3 text-than text-nhat">
          Website cần hai biến môi trường để nối tới Supabase. Thiếu một trong hai là không chạy được.
        </p>

        <div className="mt-5 rounded-lg border border-vien bg-nen px-4 py-3">
          <pre className="overflow-x-auto text-ghi leading-relaxed text-muc">
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY</pre>
        </div>

        <ul className="mt-5 space-y-2 text-phu text-nhat">
          <li>· Chạy trên máy: khai trong file <code>.env</code> ở gốc dự án, rồi khởi động lại.</li>
          <li>· Trên Netlify: <b className="text-muc">Site settings → Environment variables</b>, rồi deploy lại.</li>
          <li>· Lấy hai giá trị ở Supabase → <b className="text-muc">Project Settings → API</b>.</li>
        </ul>

        <p className="mt-5 text-vi text-nhat">
          Chú ý tên biến thứ hai là <code>PUBLISHABLE_KEY</code>, không phải <code>ANON_KEY</code>.
        </p>
      </div>
    </div>
  );
}
