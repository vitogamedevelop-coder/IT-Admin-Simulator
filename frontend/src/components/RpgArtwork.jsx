import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function RpgArtwork({ src, alt, className = '', aspect = 'aspect-video', fallbackLabel = 'Illustration folgt' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`${aspect} ${className} flex items-center justify-center overflow-hidden rounded-xl border border-[#1f2937] bg-gradient-to-br from-[#0d1117] to-[#07130c]`}><div className="text-center text-[#8b949e]"><ImageIcon size={28} className="mx-auto text-[#00f0ff]" /><div className="mt-2 text-[10px] uppercase tracking-widest">{fallbackLabel}</div></div></div>;
  return <div className={`${aspect} ${className} overflow-hidden rounded-xl border border-[#1f2937] bg-[#0d1117]`}><img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" /></div>;
}
