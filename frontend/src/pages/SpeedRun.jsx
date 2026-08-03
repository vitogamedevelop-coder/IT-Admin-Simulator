import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Play, RotateCcw, Trophy } from 'lucide-react';

export default function SpeedRun() {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [active, setActive] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [current, setCurrent] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoadError('');
    api(`/api/modules/questions?faculty=${encodeURIComponent(facultyId)}`)
      .then((questions) => setAll([...questions].sort(() => Math.random() - 0.5)))
      .catch((error) => setLoadError(error.message));
  }, [facultyId]);

  useEffect(() => {
    if (!playing) return;
    if (time <= 0) {
      setDone(true);
      setPlaying(false);
      return;
    }
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [playing, time]);

  useEffect(() => {
    if (all.length && active < all.length) {
      const q = all[active];
      const choices = [...q.options].sort(() => Math.random() - 0.5).slice(0, 4);
      if (!choices.includes(q.answer)) choices[0] = q.answer;
      setCurrent({ ...q, choices: choices.sort(() => Math.random() - 0.5) });
    } else if (all.length && active >= all.length) {
      setDone(true);
      setPlaying(false);
    }
  }, [all, active]);

  function start() {
    setActive(0);
    setScore(0);
    setTime(60);
    setDone(false);
    setPlaying(true);
  }

  function pick(ans) {
    if (!playing) return;
    if (ans === current.answer) setScore((s) => s + 1);
    setActive((i) => i + 1);
  }

  if (loadError) return <div className="py-10 text-center text-[#ff3355]">Speed-Run konnte nicht geladen werden: {loadError}</div>;
  if (!all.length) return <div className="text-[#00ff66] py-10 text-center">speed run wird geladen...</div>;

  if (!playing && !done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Trophy size={48} className="text-[#00f0ff]" />
        <h2 className="text-xl font-bold text-white">Speed Run</h2>
        <p className="text-sm text-[#8b949e] text-center max-w-xs">60 sekunden. ordne so viele begriffe wie möglich zu.</p>
        <button onClick={start} className="cyber-btn"><Play size={18} className="mr-2" /> start</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Trophy size={48} className={score > 5 ? 'text-[#00ff66]' : 'text-[#ffcc00]'} />
        <h2 className="text-xl font-bold text-white">zeit abgelaufen</h2>
        <p className="text-2xl text-[#00ff66] font-bold">{score} zugeordnet</p>
        <button onClick={start} className="cyber-btn"><RotateCcw size={18} className="mr-2" /> wiederholen</button>
        <button onClick={() => navigate(-1)} className="cyber-btn-outline text-sm">zurück</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex justify-between items-center cyber-card p-3">
        <span className="text-[#ff3355] font-bold text-lg">{time}s</span>
        <span className="text-[#00ff66] font-bold">punkte: {score}</span>
      </div>
      {current && (
        <div className="cyber-card p-4 flex flex-col gap-4">
          <h3 className="text-white font-bold text-center">{current.term}</h3>
          <div className="grid grid-cols-1 gap-2">
            {current.choices.map((c, i) => (
              <button key={i} onClick={() => pick(c)} className="py-3 px-4 rounded border border-[#30363d] text-sm text-white hover:border-[#00ff66] hover:text-[#00ff66] transition">
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
