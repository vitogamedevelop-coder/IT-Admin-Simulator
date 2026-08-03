import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Meh, Frown, Smile } from 'lucide-react';

export default function DifficultyFeedback({ onSubmit }) {
  const [selected, setSelected] = useState(null);
  const options = [
    { id: 'too-easy', label: 'Zu leicht', icon: Smile, color: 'text-[#00ff66]' },
    { id: 'just-right', label: 'Genau richtig', icon: ThumbsUp, color: 'text-[#00f0ff]' },
    { id: 'guessing', label: 'Ich habe geraten', icon: Meh, color: 'text-[#ffcc00]' },
    { id: 'too-hard', label: 'Zu schwer', icon: Frown, color: 'text-[#ff3355]' },
  ];

  return (
    <div className="cyber-card p-4 w-full">
      <div className="text-xs font-bold text-white mb-1">Wie war das für dich?</div>
      <p className="text-xs text-[#8b949e] mb-3">Deine Antwort hilft uns, die nächsten Einsätze besser an dich anzupassen.</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => { setSelected(opt.id); onSubmit?.(opt.id); }}
              className={`flex items-center gap-2 p-2 rounded border text-xs text-left ${selected === opt.id ? 'border-[#00f0ff] bg-[#00f0ff]/10' : 'border-[#30363d] text-[#c9d1d9]'}`}
            >
              <Icon size={16} className={opt.color} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
