import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const KHOA = 'tri-tue:nen';

export function DoiNen() {
  const [toi, setToi] = useState(false);

  useEffect(() => {
    let v = false;
    try {
      v = localStorage.getItem(KHOA) === 'dark';
    } catch {
      /* bỏ qua */
    }
    setToi(v);
    document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light');
  }, []);

  const doi = () => {
    const v = !toi;
    setToi(v);
    document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light');
    try {
      localStorage.setItem(KHOA, v ? 'dark' : 'light');
    } catch {
      /* bỏ qua */
    }
  };

  return (
    <button
      onClick={doi}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-nhat hover:bg-muc/5 hover:text-muc"
      aria-label={toi ? 'Chuyển nền sáng' : 'Chuyển nền tối'}
    >
      {toi ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
