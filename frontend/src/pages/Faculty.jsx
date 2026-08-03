import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ChevronRight, Trophy, Zap, Lock } from 'lucide-react';

export default function Faculty() {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/modules')
      .then((m) => setModules(m.filter((x) => x.faculty_id === facultyId)))
      .finally(() => setLoading(false));
  }, [facultyId]);

  const name = facultyId === 'it' ? 'IT & Systeme Akademie' : 'Coding Academy (C# / Unity)';

  if (loading) return <div className="text-[#00ff66] py-10 text-center">module werden geladen...</div>;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <h2 className="text-lg font-bold text-[#00f0ff]">&gt; {name}</h2>
        <p className="text-xs text-[#8b949e] mt-1">geordneter lernpfad. absolviere jedes modul, um fortzuschreiten.</p>
      </div>
      <button
        onClick={() => navigate(`/speedrun/${facultyId}`)}
        className="cyber-btn-outline py-3 text-sm"
      >
        <Zap size={18} className="mr-2" /> Speed-Run-Modus
      </button>
      <div className="flex flex-col gap-3">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => !m.locked && navigate(`/module/${m.id}`)}
            disabled={m.locked}
            className={`cyber-card p-4 text-left transition ${m.locked ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98] hover:border-[#00ff66]'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">modul {m.order_index}</div>
                <div className="font-bold text-white mt-0.5">{m.title}</div>
                <div className="text-xs text-[#8b949e] mt-1">{m.description}</div>
                {m.progress && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Trophy size={14} className={m.progress.completed ? 'text-[#00ff66]' : 'text-[#8b949e]'} />
                    <span className={m.progress.completed ? 'text-[#00ff66]' : 'text-[#8b949e]'}>
                      {m.progress.completed ? 'abgeschlossen' : `${m.progress.score}%`}
                    </span>
                  </div>
                )}
              </div>
              {m.locked ? <Lock size={20} className="text-[#8b949e]" /> : <ChevronRight size={20} className="text-[#00f0ff]" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
