import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronRight, Network, Router, ShieldCheck, TerminalSquare, Server, SlidersHorizontal, ClipboardCheck, Lock } from 'lucide-react';
import { categoriesSorted } from '../lib/academyTopics';
import { LEARNING_MODES, readAcademyMode } from '../lib/academyMode';
import { ensureInitialUnlocks } from '../lib/academyEngine';
import { isAbschlusscheckAvailable, getCategorySummary } from '../lib/academyThemencheck';
import { characterAsset } from '../lib/rpgAssets';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

const ACADEMY_INTRO_KEY = 'cyberlearn:academy-intro-seen';

const MODE_LABEL = {
  [LEARNING_MODES.BEGINNER]: 'Anfänger',
  [LEARNING_MODES.PRIOR_KNOWLEDGE]: 'Vorkenntnisse',
  [LEARNING_MODES.SANDBOX]: 'Sandbox',
};

const CATEGORY_ICONS = {
  'fundamentals': Network,
  'cisco-packet-tracer': Router,
  'information-security': ShieldCheck,
  'linux-virtualbox': TerminalSquare,
  'active-directory-virtualbox': Server,
};

export default function Academy() {
  const navigate = useNavigate();
  useAppBack();
  useEffect(() => { ensureInitialUnlocks(); }, []);
  const categories = categoriesSorted();
  const mode = readAcademyMode().mode;
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem(ACADEMY_INTRO_KEY) !== 'true');
  const portrait = characterAsset('sam');

  function dismissIntro() {
    localStorage.setItem(ACADEMY_INTRO_KEY, 'true');
    setShowIntro(false);
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Arbeitsplatz" />
      {showIntro && (
        <div className="cyber-card p-4">
          <div className="flex items-center gap-3">
            {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
            <div>
              <div className="text-xs text-[#00f0ff]">Sam Richter</div>
              <p className="text-sm text-[#c9d1d9] mt-1">
                „Bevor wir starten, noch ein kurzer Hinweis: Über <span className="text-[#00f0ff] font-bold">Lernmodus wählen</span> entscheidest du selbst, wie du lernen möchtest. Im normalen Modus arbeitest du dir alle Themen Schritt für Schritt frei. Im Lehrgangsmodus stehen dir dagegen alle fertigen Lektionen sofort zur Verfügung. Du kannst das jederzeit wieder ändern."
              </p>
            </div>
          </div>
          <button onClick={dismissIntro} className="cyber-btn w-full mt-3 py-2 text-sm">Verstanden</button>
        </div>
      )}
      <div className="cyber-card p-4 text-center">
        <GraduationCap size={36} className="mx-auto text-[#00f0ff]" />
        <h2 className="font-bold text-white mt-2">NEXUS Academy</h2>
        <p className="text-xs text-[#8b949e] mt-2">Sam begleitet dich durch die Grundlagen - von der Theorie bis zur praktischen Anwendung.</p>
      </div>
      <button onClick={() => navigate('/academy/mode')} className={`cyber-card p-3 flex items-center gap-3 text-left ${showIntro ? 'ring-2 ring-[#00f0ff] ring-offset-2 ring-offset-[#0d1117]' : ''}`}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00f0ff]/10 border border-[#00f0ff]/20 shrink-0">
          <SlidersHorizontal size={18} className="text-[#00f0ff]" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-white text-sm">Lernmodus</div>
          <div className="text-xs text-[#8b949e]">{mode ? MODE_LABEL[mode] : 'Noch nicht gewählt'}</div>
        </div>
        <ChevronRight size={18} className="text-[#8b949e] shrink-0" />
      </button>
      <div className="flex flex-col gap-2">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.categoryId] || GraduationCap;
          const summary = getCategorySummary(category.categoryId);
          return (
            <button key={category.categoryId} onClick={() => navigate(`/academy/${category.categoryId}`)}
              className="cyber-card p-3 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00f0ff]/10 border border-[#00f0ff]/20 shrink-0">
                <Icon size={20} className="text-[#00f0ff]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{category.title}</div>
                <div className="text-xs text-[#8b949e]">{category.description}</div>
                {/* Progress bar */}
                {summary.lessonCount > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-[#1f2937] rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded transition-all" style={{ width: `${summary.progressPercent}%` }} />
                    </div>
                    <div className="text-[9px] text-[#8b949e] mt-0.5">{summary.completedLessons}/{summary.lessonCount} abgeschlossen</div>
                  </div>
                )}
              </div>
              <ChevronRight size={18} className="text-[#8b949e] shrink-0" />
            </button>
          );
        })}
      </div>
      {/* Abschlusscheck */}
      {(() => {
        const available = isAbschlusscheckAvailable();
        return (
          <button
            disabled={!available}
            onClick={() => navigate('/academy/themencheck/global')}
            className={`cyber-card p-3 text-left flex items-center gap-3 ${available ? 'border-[#ffcc00]/40 active:border-[#ffcc00]' : 'opacity-50'}`}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ffcc00]/10 border border-[#ffcc00]/20 shrink-0">
              <ClipboardCheck size={20} className="text-[#ffcc00]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">Abschlusscheck</div>
              <div className="text-xs text-[#8b949e]">
                {available
                  ? 'Simulierte Prüfung über alle Kategorien – ideal als Generalprobe.'
                  : 'Schließe zuerst die Themenchecks aller Kategorien ab.'}
              </div>
            </div>
            {available && <ChevronRight size={18} className="text-[#8b949e] shrink-0" />}
            {!available && <Lock size={16} className="text-[#8b949e] shrink-0" />}
          </button>
        );
      })()}
    </div>
  );
}
