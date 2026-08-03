import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { BarChart3, Target, BookOpen, Flame } from 'lucide-react';
import { competencyOverview, readCompetencies } from '../lib/competency';

export default function Stats() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/api/user/stats').then(setStats); }, []);
  if (!stats) return <div className="text-[#00ff66] py-10 text-center">statistik wird geladen...</div>;
  const accuracy = stats.totals.attempts ? Math.round((stats.totals.correct / stats.totals.attempts) * 100) : 0;
  const activeDays = stats.days.filter((day) => day.attempts > 0).length;
  const competencies = competencyOverview();
  const sessions = readCompetencies().sessions || [];
  return <div className="flex flex-col gap-4 py-2">
    <div className="cyber-card p-4"><div className="flex items-center gap-2 text-[#00f0ff]"><BarChart3 size={20} /><h2 className="font-bold">lernstatistik</h2></div><p className="text-xs text-[#8b949e] mt-2">Deine Antworten und Fortschritte der letzten 28 Tage.</p></div>
    <div className="grid grid-cols-2 gap-3">
      <Metric icon={Target} label="Trefferquote" value={`${accuracy}%`} />
      <Metric icon={BookOpen} label="Antworten" value={stats.totals.attempts} />
      <Metric icon={Flame} label="Lerntage" value={activeDays} />
      <Metric icon={BarChart3} label="Fragen entdeckt" value={stats.totals.unique_questions} />
    </div>
    <div className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-3">modulfortschritt</h3>{stats.modules.length ? stats.modules.map((module) => <div key={module.title} className="mb-3 last:mb-0"><div className="flex justify-between gap-2 text-xs"><span className="text-[#c9d1d9] truncate">{module.title}</span><span className="text-[#00ff66]">{module.score}%</span></div><div className="h-2 bg-[#1f2937] rounded mt-1"><div className="h-full bg-[#00ff66] rounded" style={{ width: `${module.score}%` }} /></div></div>) : <p className="text-sm text-[#8b949e]">Noch keine abgeschlossenen Antworten.</p>}</div>
    {competencies.length > 0 && <div className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-3">Kompetenzen</h3><div className="flex flex-col gap-3">{competencies.map((item) => <div key={item.name}><div className="flex justify-between text-xs"><span className="text-[#c9d1d9]">{item.name}</span><span className="text-[#00ff66]">{Math.round(item.mastery * 100)}%</span></div><div className="h-2 bg-[#1f2937] rounded mt-1"><div className="h-full bg-[#00f0ff] rounded" style={{ width: `${Math.round(item.mastery * 100)}%` }} /></div><div className="text-[9px] text-[#8b949e] mt-1">Wissen {Math.round(item.knowledge * 100)} · Anwendung {Math.round(item.application * 100)} · Langzeit {Math.round(item.stability * 100)}</div></div>)}</div></div>}
    {sessions.length > 0 && <div className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-3">Letzte Missionen</h3>{sessions.slice(-5).reverse().map((session, index) => <div key={`${session.at}-${index}`} className="flex justify-between text-xs py-2 border-b border-[#1f2937] last:border-0"><span className="text-[#c9d1d9]">{session.title}</span><span className="text-[#00ff66]">{session.correct}/{session.questions} · {session.minutes} Min.</span></div>)}</div>}
    <div className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-3">letzte aktive tage</h3><div className="grid grid-cols-7 gap-1">{stats.days.map((day) => <div key={day.date} title={`${day.date}: ${day.correct}/${day.attempts}`} className="aspect-square rounded-sm bg-[#00ff66]" style={{ opacity: Math.max(0.2, day.attempts ? day.correct / day.attempts : 0.2) }} />)}</div></div>
  </div>;
}

function Metric({ icon: Icon, label, value }) { return <div className="cyber-card p-3"><Icon size={18} className="text-[#00f0ff]" /><div className="text-lg text-white font-bold mt-2">{value}</div><div className="text-[10px] uppercase tracking-wide text-[#8b949e]">{label}</div></div>; }
