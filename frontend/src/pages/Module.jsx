import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { playQuizFeedback } from '../lib/sound';
import { queueAnswer } from '../lib/offline';
import { initialQuestionOrder, pickNextQuestions, updateSkill, setModuleSkill, getModuleSkill } from '../lib/adaptiveQuiz';
import { expectedSeconds, recordAnswer } from '../lib/competency';
import { BookOpen, Play, CheckCircle, XCircle, AlertTriangle, Terminal, Lightbulb } from 'lucide-react';
import OsiOrderExercise from '../components/OsiOrderExercise';
import GlossaryText from '../components/GlossaryText';

export default function Module() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [tab, setTab] = useState('content');
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [xpGain, setXpGain] = useState(null);
  const [final, setFinal] = useState(null);
  const [ordered, setOrdered] = useState([]);
  const [skill, setSkill] = useState(1);
  const [recentWrong, setRecentWrong] = useState(0);
  const [confidence, setConfidence] = useState(2);
  const [usedHint, setUsedHint] = useState(false);
  const questionStartedAt = useRef(Date.now());

  useEffect(() => {
    api(`/api/modules/${id}`).then((data) => {
      const parsedQuestions = data.questions.map((q) => ({ ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options }));
      setModule({ ...data, questions: parsedQuestions });
      setSkill(getModuleSkill(id));
      setOrdered(initialQuestionOrder(parsedQuestions, id));
      questionStartedAt.current = Date.now();
    });
  }, [id]);

  const currentQuestion = ordered[active] || null;

  async function submitAnswer() {
    if (selected === null || !currentQuestion) return;
    const locallyCorrect = selected === currentQuestion.answer;
    let res;
    try {
      res = await api(`/api/modules/${id}/answer`, {
        method: 'POST',
        body: JSON.stringify({ questionId: currentQuestion.id, answer: selected }),
      });
    } catch (error) {
      if (!navigator.onLine) {
        queueAnswer({ moduleId: id, questionId: currentQuestion.id, answer: selected });
        setResult({ correct: locallyCorrect, answer: currentQuestion.answer, explanation: currentQuestion.explanation || 'Offline gespeichert.', diagnostic: locallyCorrect ? null : currentQuestion.diagnostic, queued: true });
        recordAnswer({ question: currentQuestion, module, correct: locallyCorrect, elapsedMs: Date.now() - questionStartedAt.current, confidence, usedHint });
        finishAnswer(locallyCorrect);
        return;
      }
      throw error;
    }
    setResult(res);
    playQuizFeedback(res.correct);
    if (res.progress) {
      setModule((m) => ({ ...m, progress: res.progress }));
      if (res.progress.completed) setFinal(res.progress);
    }
    if (res.xp) setXpGain(res.xp);
    recordAnswer({ question: currentQuestion, module, correct: res.correct, elapsedMs: Date.now() - questionStartedAt.current, confidence, usedHint });
    finishAnswer(res.correct);
  }

  function finishAnswer(correct) {
    const questionDifficulty = Number.parseInt(currentQuestion.difficulty, 10) || 2;
    const nextSkill = updateSkill(skill, questionDifficulty, correct);
    setSkill(nextSkill);
    setModuleSkill(id, nextSkill);
    const nextWrong = correct ? 0 : Math.min(recentWrong + 1, 3);
    setRecentWrong(nextWrong);
    const remaining = ordered.slice(active + 1);
    if (remaining.length > 0) {
      const reordered = pickNextQuestions(remaining, id, { rescue: nextWrong >= 2 });
      setOrdered([...ordered.slice(0, active + 1), ...reordered]);
    }
  }

  function nextQuestion() {
    if (active + 1 >= ordered.length) {
      setFinal(module?.progress);
      setTab('complete');
      return;
    }
    setActive((value) => value + 1);
    setSelected(null);
    setResult(null);
    setConfidence(2);
    setUsedHint(false);
    questionStartedAt.current = Date.now();
  }

  if (!module) return <div className="text-[#00ff66] py-10 text-center">modul wird geladen...</div>;

  if (tab === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <CheckCircle size={56} className="text-[#00ff66]" />
        <h2 className="text-xl font-bold text-white">modul abgeschlossen</h2>
        <p className="text-[#8b949e] text-sm">score: {final?.score || module?.progress?.score || 0}%</p>
        {xpGain && <p className="text-[#00ff66] text-sm">+{xpGain.xp} XP · {xpGain.rank}</p>}
        <button onClick={() => navigate(-1)} className="cyber-btn mt-4">zurück zur akademie</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">modul {module.order_index}</div>
        <h2 className="text-lg font-bold text-white mt-1">{module.title}</h2>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setTab('content')} className={`px-3 py-1 text-xs rounded border ${tab === 'content' ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#1f2937] text-[#8b949e]'}`}>
            <BookOpen size={14} className="inline mr-1" /> lernen
          </button>
          <button onClick={() => setTab('quiz')} className={`px-3 py-1 text-xs rounded border ${tab === 'quiz' ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#1f2937] text-[#8b949e]'}`}>
            <Play size={14} className="inline mr-1" /> quiz
          </button>
          <button onClick={() => navigate(`/sandbox/${id}`)} className="px-3 py-1 text-xs rounded border border-[#1f2937] text-[#00f0ff]">
            <Terminal size={14} className="inline mr-1" /> sandbox
          </button>
        </div>
      </div>

      {tab === 'content' && (
        <div className="flex flex-col gap-3">
          {module.id === 1 && <OsiOrderExercise />}
          {module.content.sections?.map((s, i) => (
            <div key={i} className="cyber-card p-4">
              <h3 className="font-bold text-[#00f0ff] text-sm">{s.title}</h3>
              {s.body.map((p, j) => (
                <GlossaryText key={j} as="p" className="text-sm text-[#8b949e] mt-2 leading-relaxed">{p}</GlossaryText>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'quiz' && currentQuestion && (
        <div className="cyber-card p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-[#8b949e]">F{active + 1} / {ordered.length} · ca. {expectedSeconds(currentQuestion)} Sek.</span>
            {xpGain && <span className="text-xs text-[#00ff66]">{xpGain.xp} XP</span>}
          </div>
          <GlossaryText as="h3" className="text-white font-bold mb-4">{currentQuestion.question}</GlossaryText>
          {currentQuestion.type === 'free' ? (
            <input value={selected || ''} disabled={result !== null} onChange={(event) => setSelected(event.target.value)} className="cyber-input w-full" placeholder="Antwort selbst eingeben" />
          ) : <div className="flex flex-col gap-2">
            {(currentQuestion.options || []).map((opt, i) => {
              const color = result
                ? opt === result.answer
                  ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                  : opt === selected && opt !== result.answer
                  ? 'border-[#ff3355] bg-[#ff3355]/10 text-[#ff3355]'
                  : 'border-[#1f2937] text-[#8b949e]'
                : opt === selected
                ? 'border-[#00ff66] text-[#00ff66]'
                : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00ff66]';
              return (
                <button
                  key={i}
                  disabled={result !== null}
                  onClick={() => setSelected(opt)}
                  className={`text-left p-3 rounded-lg border text-sm transition ${color}`}
                >
                  <GlossaryText>{opt}</GlossaryText>
                </button>
              );
            })}
          </div>}

          {!result && selected !== null && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#8b949e]">Wie sicher bist du?</span>
              <div className="flex gap-1">
                {[['geraten', 1], ['unsicher', 2], ['sicher', 3]].map(([label, value]) => <button key={value} onClick={() => setConfidence(value)} className={`px-2 py-1 rounded border text-[10px] ${confidence === value ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#8b949e]'}`}>{label}</button>)}
              </div>
            </div>
          )}
          {!result && currentQuestion.hint && <button onClick={() => setUsedHint(true)} className="mt-3 text-xs text-[#ffcc00] flex items-center gap-1"><Lightbulb size={13} />{usedHint ? currentQuestion.hint : 'Hinweis anzeigen'}</button>}

          {result && (
            <div className="mt-4 p-3 rounded-lg border border-[#1f2937] bg-[#0d1117]">
              <div className={`font-bold text-sm flex items-center gap-2 ${result.correct ? 'text-[#00ff66]' : 'text-[#ff3355]'}`}>
                {result.correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {result.queued ? 'offline vorgemerkt' : result.correct ? 'richtig' : 'falsch'}
              </div>
              {!result.correct && (
                <div className="mt-2 text-sm text-[#ffcc00] flex items-start gap-2">
                  <AlertTriangle size={18} />
                  <GlossaryText>{result.diagnostic}</GlossaryText>
                </div>
              )}
              <GlossaryText as="p" className="mt-2 text-sm text-[#8b949e]">{result.explanation}</GlossaryText>
            </div>
          )}

          <div className="mt-4">
            {!result ? (
              <button onClick={submitAnswer} disabled={selected === null} className="cyber-btn w-full">antwort prüfen</button>
            ) : (
              <button onClick={nextQuestion} className="cyber-btn w-full">weiter</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
