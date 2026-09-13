import { characterAsset } from '../lib/rpgAssets';

export default function SamLine({ text, mood = 'neutral', className = '' }) {
  const portrait = characterAsset('sam');
  const borderColor = {
    neutral: 'border-[#00f0ff]',
    positive: 'border-[#00ff66]',
    hint: 'border-[#ffcc00]',
    error: 'border-[#ff7b72]',
  }[mood] || 'border-[#00f0ff]';

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {portrait && (
        <img
          src={portrait}
          alt="Sam"
          className={`h-10 w-10 rounded-full border ${borderColor} object-cover shrink-0`}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[#00f0ff] font-medium">Sam Richter</div>
        <p className="text-sm text-[#c9d1d9] mt-0.5 whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}
