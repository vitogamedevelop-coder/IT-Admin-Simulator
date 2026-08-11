import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, CheckSquare, Clock, Shield } from 'lucide-react';
import { completeQuest, setActiveQuest } from '../lib/gameState';
import { questById } from '../lib/questData';
import { recordAnswer, saveSession } from '../lib/competency';
import { playQuizFeedback } from '../lib/sound';
import GlossaryText from '../components/GlossaryText';
import DifficultyFeedback from '../components/DifficultyFeedback';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';
import { storyAsset } from '../lib/rpgAssets';
import { getOrderedOptions } from '../lib/shuffleOptions';

export default function Quest() {
  const { questId } = useParams();
  const navigate = useNavigate();
  useAppBack();
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [reputation, setReputation] = useState({});
  const [quality, setQuality] = useState({ diagnosis: 0, security: 0, maintainability: 0 });
  const [finished, setFinished] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const stepStarted = useRef(Date.now());
  const questStarted = useRef(Date.now());
  const saved = useRef(false);

  if (questId?.startsWith('cisco-')) {
    navigate(`/mission/${questId}`, { replace: true });
    return null;
  }

  const quest = questById(questId);

  if (!quest) return <div className="py-10 text-center text-[#ff3355]">Einsatz nicht gefunden.</div>;
  const step = quest.steps[stepIndex];
  const stepOptions = getOrderedOptions(step.options, `${quest.id}-${stepIndex}`);

  if (quest.steps.length === 0) return <div className="py-10 text-center text-[#ff3355]">Einsatz hat keine Schritte.</div>;

  function begin() {
    setActiveQuest(quest.id);
    questStarted.current = Date.now();
    stepStarted.current = Date.now();
    setStarted(true);
  }

  function select(option) {
    if (choice) return;
    setChoice(option);
    playQuizFeedback(option.correct);
    if (option.correct) setCorrect((value) => value + 1);
    setQuality((current) => ({
      diagnosis: current.diagnosis + (['evidence', 'tool', 'result'].includes(step.type) ? (option.correct ? 2 : 0) : (option.correct ? 1 : 0)),
      security: current.security + (option.effects?.security ? Math.max(0, option.effects.security) : (option.correct && quest.department === 'Security' ? 2 : 0)),
      maintainability: current.maintainability + (['decision', 'documentation', 'recovery'].includes(step.type) ? (option.correct ? 2 : 0) : (option.correct ? 1 : 0)),
    }));
    if (option.effects) setReputation((current) => {
      const next = { ...current };
      Object.entries(option.effects).forEach(([key, amount]) => { next[key] = (next[key] || 0) + amount; });
      return next;
    });
    recordAnswer({
      question: { id: `${quest.id}-${stepIndex}`, question: step.prompt, answer: step.options.find((item) => item.correct)?.label, difficulty: quest.difficulty, type: 'scenario', topic: quest.department, misconception: step.type },
      module: { title: quest.department }, correct: option.correct, elapsedMs: Date.now() - stepStarted.current, confidence: 2, mode: 'quest',
    });
  }

  function next() {
    if (stepIndex + 1 >= quest.steps.length) {
      const totalMinutes = Math.max(1, Math.round((Date.now() - questStarted.current) / 60000));
      const xp = 40 + correct * 15 + (quest.boss ? 80 : 0);
      if (!saved.current) {
        completeQuest(quest, { xp, reputation });
        saveSession({ type: 'quest', title: quest.title, questions: quest.steps.length, correct, minutes: totalMinutes });
        saved.current = true;
      }
      setFinished(true);
      return;
    }
    setStepIndex((value) => value + 1);
    setChoice(null);
    setShowEvidence(false);
    stepStarted.current = Date.now();
  }

  const cover = storyAsset(quest.id);
  if (!started) return (
    <div className="flex flex-col gap-4 py-2">
      {cover && <div className="cyber-card overflow-hidden"><img src={cover} alt={quest.title} className="h-40 w-full object-cover" /></div>}
      <div className={`cyber-card p-5 border-l-4 ${quest.boss ? 'border-[#ff3355]' : 'border-[#00f0ff]'}`}>
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#8b949e]"><span>Kapitel {quest.chapter} &middot; {quest.department}</span>{quest.boss && <span className="text-[#ff3355]">Kritischer Vorfall</span>}</div>
        <h2 className="text-xl text-white font-bold mt-2">{quest.title}</h2>
        <p className="text-sm text-[#00f0ff] mt-1">{quest.subtitle}</p>
        <GlossaryText as="p" className="text-sm text-[#c9d1d9] leading-relaxed mt-4">{quest.briefing}</GlossaryText>
        <div className="flex items-center gap-4 mt-4 text-xs text-[#8b949e]"><span>{quest.steps.length} Entscheidungen</span><span className="flex items-center gap-1"><Clock size={13} /> ca. {quest.minutes} Minuten</span></div>
      </div>
      <div className="cyber-card p-4 text-xs text-[#8b949e]">Es gibt keine verlorenen Leben. Riskante Entscheidungen werden erkl&#228;rt und die Schwierigkeit passt sich im Hintergrund an.</div>
      <button onClick={begin} className="cyber-btn w-full">Fall {'ü'}bernehmen</button>
    </div>
  );

  if (finished) {
    const percent = Math.round((correct / quest.steps.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Shield size={58} className="text-[#00ff66]" />
        <h2 className="text-xl font-bold text-white">St{'ö'}rung behoben</h2>
        <GlossaryText as="p" className="text-sm text-[#c9d1d9]">{quest.resolution}</GlossaryText>
        <div className="grid grid-cols-2 gap-3 w-full"><div className="cyber-card p-3"><div className="text-xl text-[#00ff66] font-bold">{percent}%</div><div className="text-[10px] text-[#8b949e]">Entscheidungen</div></div><div className="cyber-card p-3"><div className="text-xl text-[#00f0ff] font-bold">+{40 + correct * 15 + (quest.boss ? 80 : 0)}</div><div className="text-[10px] text-[#8b949e]">Karriere-XP</div></div></div>
        <div className="cyber-card p-4 w-full"><div className="text-xs font-bold text-[#00f0ff]">L{'ö'}sungsqualit{'ä'}t</div><div className="grid grid-cols-3 gap-2 mt-3">{Object.entries(quality).map(([key, value]) => <div key={key} className="border border-[#1f2937] rounded p-2"><div className="text-sm text-white font-bold">{value}</div><div className="text-[9px] text-[#8b949e]">{key === 'diagnosis' ? 'Diagnose' : key === 'security' ? 'Sicherheit' : 'Wartbarkeit'}</div></div>)}</div></div>
        {quest.unlockTools?.length > 0 && <div className="cyber-card p-4 w-full text-left"><div className="text-xs text-[#ffcc00] font-bold">Werkzeuge freigeschaltet</div><div className="text-sm text-[#c9d1d9] mt-2">{quest.unlockTools.join(' · ')}</div></div>}
        {quest.reflection && (
          <div className="cyber-card p-4 w-full text-left">
            <div className="text-xs font-bold text-[#00f0ff] mb-3">Reflexion</div>
            <div className="flex flex-col gap-3 text-sm">
              <div><span className="text-[#8b949e] text-xs block mb-1">Was war die richtige Hypothese?</span><span className="text-white">{quest.reflection.hypothesis}</span></div>
              <div><span className="text-[#8b949e] text-xs block mb-1">Welche Information war entscheidend?</span><span className="text-white">{quest.reflection.decisiveInfo}</span></div>
              <div><span className="text-[#8b949e] text-xs block mb-1">Was war nicht zielf{'ü'}hrend?</span><span className="text-white">{quest.reflection.unnecessarySteps}</span></div>
              <div className="border-t border-[#1f2937] pt-3"><span className="text-[#ffcc00] text-xs block mb-1">Merksatz</span><span className="text-white font-medium">{quest.reflection.takeaway}</span></div>
            </div>
          </div>
        )}
        <DifficultyFeedback onSubmit={(rating) => { localStorage.setItem(`it-learn:difficulty:${quest.id}`, rating); }} />
        <button onClick={() => navigate('/')} className="cyber-btn w-full">Zur{'ü'}ck zum Arbeitsplatz</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Arbeitsplatz" />
      <div className="cyber-card p-4"><div className="flex justify-between text-xs text-[#8b949e]"><span>{quest.title}</span><span>{stepIndex + 1}/{quest.steps.length}</span></div><div className="h-1.5 bg-[#1f2937] rounded mt-2"><div className="h-full bg-[#00ff66] rounded" style={{ width: `${(stepIndex / quest.steps.length) * 100}%` }} /></div></div>
      {quest.checklist && (
        <div className="cyber-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#00f0ff] mb-3">Diagnose-Plan</div>
          <div className="flex flex-col gap-2">
            {quest.checklist.map((item, index) => {
              const done = stepIndex > index;
              const active = stepIndex === index;
              return (
                <div key={item.id} className={`flex items-center gap-2 text-xs ${done ? 'text-[#00ff66]' : active ? 'text-white' : 'text-[#8b949e]'}`}>
                  {done ? <CheckSquare size={14} className="text-[#00ff66]" /> : <div className={`h-3.5 w-3.5 rounded border ${active ? 'border-[#00f0ff] bg-[#00f0ff]/20' : 'border-[#30363d]'}`} />}
                  <span className={active ? 'font-bold' : ''}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00f0ff] mb-3">Schritt {stepIndex + 1}</div>
        <GlossaryText as="h3" className="font-bold text-white mb-4">{step.prompt}</GlossaryText>
        {step.output && !showEvidence && <button onClick={() => setShowEvidence(true)} className="cyber-btn-outline w-full mb-4">Diagnoseausgabe {'ö'}ffnen</button>}
        {step.output && showEvidence && <div className="mb-4"><pre className="overflow-x-auto whitespace-pre-wrap rounded border border-[#30363d] bg-black p-3 text-xs text-[#00ff66]">{step.output}</pre>{step.irrelevant && <p className="mt-2 text-xs text-[#8b949e]">Ticket-Zusatz: {step.irrelevant}</p>}</div>}
        {(!step.output || showEvidence) && <div className="flex flex-col gap-2">{stepOptions.map((option) => <button key={option.id} disabled={Boolean(choice)} onClick={() => select(option)} className={`text-left p-3 rounded border text-sm ${choice?.id === option.id ? option.correct ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]' : 'border-[#ff3355] bg-[#ff3355]/10 text-[#ff3355]' : choice ? 'border-[#1f2937] text-[#8b949e]' : 'border-[#30363d] text-[#c9d1d9]'}`}><GlossaryText>{option.label}</GlossaryText></button>)}</div>}
        {choice && <div className={`mt-4 p-3 rounded border ${choice.correct ? 'border-[#00ff66]' : 'border-[#ffcc00]'}`}><div className={`flex items-center gap-2 font-bold text-sm ${choice.correct ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>{choice.correct ? <CheckCircle size={17} /> : <AlertTriangle size={17} />}{choice.correct ? 'Das passt' : 'Noch nicht ganz'}</div><GlossaryText as="p" className="text-sm text-[#c9d1d9] mt-2">{choice.feedback}</GlossaryText>{!choice.correct && <p className="text-xs text-[#8b949e] mt-2">Das war noch nicht ganz richtig. In der Erklärung siehst du, woran es lag.</p>}</div>}
        {choice && <button onClick={next} className="cyber-btn w-full mt-4">{stepIndex + 1 === quest.steps.length ? 'Fall abschließen' : 'Nächster Schritt'}</button>}
      </div>
    </div>
  );
}
