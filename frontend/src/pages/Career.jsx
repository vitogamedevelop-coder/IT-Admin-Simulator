import { useState } from 'react';
import { BriefcaseBusiness, Star, TrendingUp, Users } from 'lucide-react';
import { readGameState } from '../lib/gameState';
import { competencyOverview, weakestTopics } from '../lib/competency';
import { companyAsset } from '../lib/rpgAssets';
import { companyStage } from '../lib/officeWorld';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

export default function Career() {
  useAppBack();
  const [state] = useState(readGameState);
  const competencies = competencyOverview();
  const weak = weakestTopics(3);
  const stage = companyStage(state.completedQuests.length);
  const solved = state.incidentsResolved || 0;

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Arbeitsplatz" />
      <div className="cyber-card overflow-hidden">
        <img src={companyAsset(stage.id)} alt={`Firmenstufe ${stage.id}`} className="h-32 w-full object-cover" />
        <div className="p-5 text-center">
          <BriefcaseBusiness size={42} className="mx-auto text-[#00f0ff]" />
          <div className="text-[10px] uppercase tracking-widest text-[#8b949e] mt-3">Deine Entwicklung</div>
          <h2 className="text-xl text-[#00ff66] font-bold mt-1">IT-Trainee bei NEXUS Systems</h2>
          <p className="text-xs text-[#8b949e] mt-2">{solved} {solved === 1 ? 'Vorfall' : 'Vorfälle'} gelöst · {competencies.length} {competencies.length === 1 ? 'Kompetenz' : 'Kompetenzen'} begonnen</p>
        </div>
      </div>

      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] font-bold text-sm"><TrendingUp size={17} /> Deine Kompetenzen</div>
        <p className="text-xs text-[#8b949e] mt-2">Hier siehst du, in welchen Bereichen du dich entwickelst. Jede Mission bringt dir echte Fähigkeiten, keine abstrakte XP.</p>
        {competencies.length === 0 ? (
          <p className="text-xs text-[#8b949e] mt-4">Löse deinen ersten Vorfall, um deine ersten Kompetenzen zu entdecken.</p>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            {competencies.map((item) => {
              const percent = Math.round(item.mastery * 100);
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#c9d1d9] font-bold">{item.name}</span>
                    <span className="text-[#00ff66]">{percent}%</span>
                  </div>
                  <div className="h-2 bg-[#1f2937] rounded mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-[10px] text-[#8b949e] mt-1">{item.attempts} Übungen · {item.correct} richtig</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {weak.length > 0 && (
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 text-[#ffcc00] font-bold text-sm"><Star size={17} /> Übungs-Empfehlungen</div>
          <p className="text-xs text-[#8b949e] mt-2">Diese Bereiche könnten noch etwas Stärkung vertragen:</p>
          <div className="flex flex-col gap-2 mt-3">
            {weak.map((topic) => (
              <div key={topic.name} className="flex items-center justify-between p-2 rounded border border-[#30363d]">
                <span className="text-xs text-[#c9d1d9]">{topic.name}</span>
                <span className="text-xs text-[#ffcc00]">{Math.round(topic.mastery * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] font-bold text-sm"><Users size={17} /> NEXUS Systems</div>
        <p className="text-xs text-[#8b949e] mt-2">Mit jedem gelösten Vorfall wächst die Firma. Du siehst den Fortschritt direkt im Serverraum.</p>
        <div className="mt-3 text-sm text-[#c9d1d9]">Aktuelle Stufe: <span className="text-[#00ff66] font-bold">{stage.title}</span></div>
        <div className="text-xs text-[#8b949e] mt-1">{stage.description}</div>
      </div>
    </div>
  );
}
