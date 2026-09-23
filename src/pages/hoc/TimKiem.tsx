import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timKiem } from '@/lib/nguon';
import { ChiNhan, VanGoc } from '@/components/kho/ChiNhan';
import { DangTai, Nhan, The, Trong } from '@/components/ui/co-ban';
import { TEN_LOAI } from '@/types/kho';

export default function TimKiem() {
  const [sp] = useSearchParams();
  const q = sp.get('q') ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['tim', q],
    queryFn: () => timKiem(q),
    enabled: q.trim().length >= 2,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-de-vua font-semibold">
        Kết quả cho “{q}”
        {data && <span className="ml-2 text-phu font-normal text-nhat">{data.length} mục</span>}
      </h1>

      <div className="mt-6 space-y-2.5">
        {isLoading && <DangTai dong={5} />}
        {data?.length === 0 && (
          <Trong>
            Không tìm thấy gì.
            <div className="mt-1.5 text-ghi">Thử từ ngắn hơn, hoặc bỏ dấu — “nghiep”, “diem tua”, “tuy duyen”.</div>
          </Trong>
        )}
        {data?.map(({ nut, duong }) => (
          <The key={nut.id} className="p-4">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Nhan className="bg-muc/5 text-nhat">{TEN_LOAI[nut.loai] ?? nut.loai}</Nhan>
              <span className="text-vi text-nhat">{duong}</span>
              <ChiNhan nhan={nut.nhan} />
            </div>
            <div className="font-chu text-than font-semibold leading-snug">{nut.tieu_de}</div>
            <VanGoc html={nut.tom_tat} className="mt-1 text-ghi text-nhat" />
          </The>
        ))}
      </div>
    </div>
  );
}
