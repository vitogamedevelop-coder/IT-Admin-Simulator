import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GraduationCap, ListChecks, BookOpen, FlaskConical, CheckCircle2 } from 'lucide-react';
import { LEARNING_MODES, readAcademyMode, setLearningMode } from '../lib/academyMode';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

const MODE_OPTIONS = [
  {
    id: LEARNING_MODES.BEGINNER, icon: GraduationCap, label: 'Anfänger',
    desc: 'Normaler, geführter Pfad. Sam begleitet dich Thema für Thema.',
  },
  {
    id: LEARNING_MODES.PRIOR_KNOWLEDGE, icon: ListChecks, label: 'Vorkenntnisse',
    desc: 'Einstufungstest pro Kategorie. Aktuell nur für TCP/UDP verfügbar - weitere Kategorien folgen.',
  },
  {
    id: LEARNING_MODES.COURSE, icon: BookOpen, label: 'Lehrgangsmodus',
    desc: 'Alle Lehrgangsthemen sind direkt zugänglich. Fortschritt wird im normalen Academy-Speicher gespeichert, gesperrte Themen vergeben aber keine Punkte.',
  },
  {
    // Disabled (option A from the task) until sandbox has its own, truly
    // separate progress store: the player must not be led to believe their
    // exploration here is already isolated from normal progress when it
    // currently is not.
    id: LEARNING_MODES.SANDBOX, icon: FlaskConical, label: 'Sandbox', disabled: true,
    desc: 'Noch nicht verfügbar. Sandbox wird freigeschaltet, sobald ein eigener, vom normalen Fortschritt getrennter Speicher existiert.',
  },
];

export default function AcademyModeSelect() {
  const navigate = useNavigate();
  useAppBack();
  const [mode, setMode] = useState(() => readAcademyMode().mode);

  function choose(option) {
    if (option.disabled) return;
    setLearningMode(option.id);
    setMode(option.id);
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="NEXUS Academy" />
      <div className="cyber-card p-4">
        <h2 className="font-bold text-white">Lernmodus wählen</h2>
        <p className="text-xs text-[#8b949e] mt-2">Der Lernmodus bestimmt, wie dir Inhalte in der Academy angeboten werden. Du kannst ihn später jederzeit ändern.</p>
      </div>
      <div className="flex flex-col gap-2">
        {MODE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = mode === option.id;
          return (
            <button key={option.id} onClick={() => choose(option)} disabled={option.disabled}
              className={`cyber-card p-3 text-left flex items-start gap-3 ${active ? 'border-[#00f0ff]/50' : ''} ${option.disabled ? 'opacity-50' : ''}`}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00f0ff]/10 border border-[#00f0ff]/20 shrink-0">
                <Icon size={20} className="text-[#00f0ff]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{option.label}</span>
                  {active && <CheckCircle2 size={15} className="text-[#00ff66]" />}
                  {option.disabled && <span className="text-[9px] uppercase tracking-widest border border-[#8b949e]/40 text-[#8b949e] rounded px-1.5 py-0.5">Noch nicht verfügbar</span>}
                </div>
                <div className="text-xs text-[#8b949e] mt-1">{option.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
      {mode === LEARNING_MODES.PRIOR_KNOWLEDGE && (
        <button onClick={() => navigate('/academy/placement/tcp-udp')} className="cyber-btn w-full py-2 text-sm">
          Einstufungstest TCP/UDP starten
        </button>
      )}
    </div>
  );
}
