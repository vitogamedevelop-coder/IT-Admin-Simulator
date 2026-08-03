import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleAppBack } from '../lib/useAppBack';

// Shared back-bar component with consistent styling.
// Uses the central navigation logic so hardware back and UI back behave identically.
export default function BackBar({ label, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const go = onBack || (() => handleAppBack(navigate, location));
  return (
    <div className="flex items-center gap-2 p-2 shrink-0">
      <button onClick={go} className="p-2 rounded-lg bg-black/60 border border-[#1f2937] text-[#8b949e] backdrop-blur-sm active:scale-90 transition-transform">
        <ChevronLeft size={18} />
      </button>
      {label && <span className="text-xs text-[#8b949e]">{label}</span>}
    </div>
  );
}
