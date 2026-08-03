import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Target, Clock, ArrowRight, Lightbulb } from 'lucide-react';
import { buildDailyMission } from '../lib/missionPlanner';
import { expectedSeconds, recordAnswer, saveSession } from '../lib/competency';
import { playQuizFeedback } from '../lib/sound';
import GlossaryText from '../components/GlossaryText';
import { getOrderedOptions, findCorrectOption } from '../lib/shuffleOptions';

export default function GuidedMission() {
  const navigate = useNavigate();
  const [mission] = useState(() => buildDailyMission());
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confidence, setConfidence] = useState(2);
  const [result, setResult] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const startedAt = useRef(Date.now());
  const questionStartedAt = useRef(Date.now());
  const sessionSaved = useRef(false);
  const question = mission.questions[active];
  const questionOptions = question?.options ? getOrderedOptions(question.options.map((label) => ({ label, correct: label === question.answer })), `${mission.title}-${active}`) : [];

  function begin() {
    setStarted(true);
    startedAt.current = Date.now();
    questionStartedAt.current = Date.now();
  }

  function check() {
    if (selected === null || !question) return;
    let correct;
    if (useFreeAnswer) {
      const accepted = [question.answer, ...(question.acceptedAnswers || [])].map((value) => String(value).trim().toLowerCase());
      correct = accepted.includes(String(selected).trim().toLowerCase());
    } else {
      const selectedOption = questionOptions.find((option) => option.id === selected);
      correct = selectedOption?.correct || false;
    }
    recordAnswer({ question: { ...question, answer: question.answer || findCorrectOption(questionOptions)?.label }, module: { title: question.moduleTitle }, correct, elapsedMs: Date.now() - questionStartedAt.current, confidence, usedHint, mode: 'mission' });
    playQuizFeedback(correct);
    setCorrectCount((count) => count + (correct ? 1 : 0));
    setResult({ correct });
  }

  function next() {
    setActive((value) => value + 1);
    setSelected(null);
    setConfidence(2);
    setResult(null);
    setUsedHint(false);
    questionStartedAt.current = Date.now();
  }

  const complete = started && active >= mission.questions.length;
  if (complete) {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    const score = Math.round((correctCount / mission.questions.length) * 100);
    if (!sessionSaved.current) {
      saveSession({ type: 'mission', title: mission.title, questions: mission.questions.length, correct: correctCount, minutes });
      sessionSaved.current = true;
    }
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle size={58} className="text-[#00ff66]" />
        <h2 className="text-xl font-bold text-white">Mission erfüllt</h2>
        <p className="text-sm text-[#c9d1d9]">Heute hast du {mission.questions.length} Aufgaben bearbeitet und {correctCount} richtig gelöst.</p>
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="cyber-card p-3"><div className="text-xl font-bold text-[#00ff66]">{score}%</div><div className="text-[10px] text-[#8b949e]">Trefferquote</div></div>
          <div className="cyber-card p-3"><div className="text-xl font-bold text-[#00f0ff]">{minutes} Min.</div><div className="text-[10px] text-[#8b949e]">konzentriert</div></div>
        </div>
        <p className="text-xs text-[#8b949e]">Deine nächste Mission wird automatisch an diese Ergebnisse angepasst.</p>
        <button onClick={() => navigate('/')} className="cyber-btn w-full">Für heute beenden</button>
        <button onClick={() => window.location.reload()} className="cyber-btn-outline w-full">Noch eine Mission</button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-4 py-2">
        <div className="cyber-card p-5 border-l-4 border-[#00ff66]">
          <div className="flex items-center gap-2 text-[#00f0ff] mb-3"><Target size={20} /><span className="text-xs uppercase tracking-widest">Empfohlene Mission</span></div>
          <h2 className="text-xl font-bold text-white">{mission.title}</h2>
          <p className="text-sm text-[#8b949e] mt-2">{mission.description}</p>
          <div className="flex items-center gap-4 mt-4 text-xs text-[#c9d1d9]"><span>{mission.questions.length} Aufgaben</span><span className="flex items-center gap-1"><Clock size={13} /> ca. {mission.minutes} Minuten</span></div>
        </div>
        <div className="cyber-card p-4 text-sm text-[#c9d1d9]">
          Du startest leicht, wendest Wissen praktisch an und wiederholst am Ende gezielt ältere Inhalte. Die Länge berücksichtigt Textmenge und Komplexität.
        </div>
        <button onClick={begin} className="cyber-btn w-full flex items-center justify-center gap-2">Mission starten <ArrowRight size={16} /></button>
      </div>
    );
  }

  const useFreeAnswer = question.type === 'free' || (active === 3 && String(question.answer).length <= 30);
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex justify-between text-xs text-[#8b949e]"><span>Mission · Aufgabe {active + 1}/{mission.questions.length}</span><span>ca. {expectedSeconds(question)} Sek.</span></div>
        <div className="h-1.5 bg-[#1f2937] rounded mt-2"><div className="h-full bg-[#00ff66] rounded transition-all" style={{ width: `${(active / mission.questions.length) * 100}%` }} /></div>
      </div>
      <div className="cyber-card p-4">
        <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest mb-2">{question.topic} · {active === 0 ? 'Einstieg' : active === 2 ? 'Anwendung' : active === 3 ? 'Aktiver Abruf' : active === 4 ? 'Abschluss' : 'Wissen'}</div>
        <GlossaryText as="h3" className="font-bold text-white mb-4">{question.question}</GlossaryText>
        {useFreeAnswer ? (
          <input value={selected || ''} disabled={result !== null} onChange={(event) => setSelected(event.target.value)} className="cyber-input w-full" placeholder="Antwort ohne Auswahl eingeben" />
        ) : (
          <div className="flex flex-col gap-2">{questionOptions.map((option) => <button key={option.id} disabled={result !== null} onClick={() => setSelected(option.id)} className={`text-left p-3 rounded border text-sm ${selected === option.id ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#c9d1d9]'}`}><GlossaryText>{option.label}</GlossaryText></button>)}</div>
        )}
        {!result && selected !== null && <div className="mt-3 flex justify-between items-center"><span className="text-[10px] text-[#8b949e]">Wie sicher?</span><div className="flex gap-1">{[['geraten', 1], ['unsicher', 2], ['sicher', 3]].map(([label, value]) => <button key={value} onClick={() => setConfidence(value)} className={`px-2 py-1 rounded border text-[10px] ${confidence === value ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#8b949e]'}`}>{label}</button>)}</div></div>}
        {!result && question.hint && <button onClick={() => setUsedHint(true)} className="mt-3 flex items-center gap-1 text-xs text-[#ffcc00]"><Lightbulb size={13} />{usedHint ? question.hint : 'Hinweis anzeigen'}</button>}
        {result && <div className={`mt-4 p-3 rounded border ${result.correct ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#ff3355] text-[#ff3355]'}`}><div className="flex items-center gap-2 font-bold">{result.correct ? <CheckCircle size={17} /> : <XCircle size={17} />}{result.correct ? 'Richtig' : `Richtig wäre: ${question.answer}`}</div><GlossaryText as="p" className="text-sm text-[#c9d1d9] mt-2">{result.correct ? question.explanation : question.diagnostic}</GlossaryText></div>}
        {!result ? <button onClick={check} disabled={selected === null || selected === ''} className="cyber-btn w-full mt-4">antwort prüfen</button> : <button onClick={next} className="cyber-btn w-full mt-4">weiter</button>}
      </div>
    </div>
  );
}
