import { useEffect, useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { glossary, glossaryTerms } from '../lib/glossary';

const pattern = new RegExp(`(${glossaryTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

export default function GlossaryText({ children, as: Tag = 'span', className = '' }) {
  const [active, setActive] = useState(null);
  const parts = useMemo(() => typeof children === 'string' ? children.split(pattern) : [children], [children]);

  useEffect(() => {
    if (!active) return undefined;
    const hide = () => setActive(null);
    window.addEventListener('pointerup', hide, { once: true });
    window.addEventListener('pointercancel', hide, { once: true });
    window.addEventListener('blur', hide, { once: true });
    return () => {
      window.removeEventListener('pointerup', hide);
      window.removeEventListener('pointercancel', hide);
      window.removeEventListener('blur', hide);
    };
  }, [active]);

  return <>
    <Tag className={className}>{parts.map((part, index) => glossary[part] ? <span
      key={`${part}-${index}`}
      role="button"
      tabIndex="0"
      onPointerDown={(event) => { event.stopPropagation(); setActive({ entry: glossary[part], placement: event.clientY > window.innerHeight / 2 ? 'top' : 'bottom' }); }}
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActive({ entry: glossary[part], placement: 'bottom' }); }}
      onKeyUp={() => setActive(null)}
      onContextMenu={(event) => event.preventDefault()}
      className="text-[#00f0ff] underline decoration-dotted underline-offset-2 cursor-help select-none"
      aria-label={`${part}: gedrückt halten für Erklärung`}
    >{part}</span> : <span key={index}>{part}</span>)}</Tag>
    {active && <div className={`fixed inset-x-3 z-[120] mx-auto max-h-[42vh] max-w-md overflow-y-auto rounded-xl border-2 border-[#00f0ff] bg-[#050505] p-4 shadow-[0_0_2rem_rgba(0,240,255,0.45)] pointer-events-none ${active.placement === 'top' ? 'top-4' : 'bottom-5'}`}>
      <div className="flex items-center gap-2 text-[#00f0ff]"><BookOpen size={17} /><strong className="text-sm">{active.entry.title}</strong></div>
      <p className="mt-2 text-sm leading-relaxed text-[#c9d1d9]">{active.entry.text}</p>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-[#8b949e]">Loslassen zum Schließen</p>
    </div>}
  </>;
}
