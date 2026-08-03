import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { playQuizFeedback } from '../lib/sound';
import { CalendarCheck, CheckCircle, XCircle } from 'lucide-react';

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => { api('/api/user/daily-challenge').then(setChallenge); }, []);

  async function submit() {
    if (selected === null) return;
    const response = await api('/api/user/daily-challenge', { method: 'POST', body: JSON.stringify({ answer: selected }) });
    playQuizFeedback(response.correct);
    setResult(response);
    if (response.correct) setChallenge((item) => ({ ...item, completed: true }));
  }

  if (!challenge) return <div className="text-[#00ff66] py-10 text-center">tageschallenge wird geladen...</div>;
  const { question } = challenge;
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff]"><CalendarCheck size={20} /><h2 className="font-bold">tageschallenge</h2></div>
        <p className="text-xs text-[#8b949e] mt-2">Eine Aufgabe pro Tag. Richtige Lösung: +25 XP.</p>
      </div>
      {challenge.completed ? <div className="cyber-card p-4 text-[#00ff66] flex items-center gap-2"><CheckCircle /> Bereits heute abgeschlossen. Komm morgen wieder.</div> : (
        <div className="cyber-card p-4">
          <h3 className="text-white font-bold mb-4">{question.question}</h3>
          <div className="flex flex-col gap-2">{question.options.map((option) => <button key={option} onClick={() => setSelected(option)} className={`text-left p-3 rounded-lg border text-sm ${selected === option ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#c9d1d9]'}`}>{option}</button>)}</div>
          {result && <div className={`mt-4 text-sm flex items-center gap-2 ${result.correct ? 'text-[#00ff66]' : 'text-[#ff3355]'}`}>{result.correct ? <CheckCircle size={18} /> : <XCircle size={18} />}{result.correct ? `Erledigt: +${result.xp.xp} XP · ${result.xp.rank}` : 'Nicht ganz. Versuch es morgen erneut.'}</div>}
          {!result && <button disabled={selected === null} onClick={submit} className="cyber-btn w-full mt-4">antwort prüfen</button>}
        </div>
      )}
    </div>
  );
}
