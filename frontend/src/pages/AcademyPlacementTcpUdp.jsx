import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { evaluatePlacementTest, markLearnedFromPlacement } from '../lib/academyEngine';
import { recordPlacementResult } from '../lib/academyMode';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

const TEST_ID = 'fundamentals/tcp-udp';

// Covers exactly the three required dimensions: matching application
// situations to TCP/UDP, judging statements about TCP/UDP, and explicitly
// distinguishing reliability vs. latency (question 6).
const QUESTIONS = [
  { id: 'scenario-file', type: 'scenario', prompt: 'Dateiübertragung - eher TCP oder UDP?', options: ['TCP', 'UDP'], correct: 'TCP', topic: 'tcp-vs-udp' },
  { id: 'scenario-voice', type: 'scenario', prompt: 'Sprachchat (Live-Telefonie) - eher TCP oder UDP?', options: ['TCP', 'UDP'], correct: 'UDP', topic: 'tcp-vs-udp' },
  // Precisely scoped: DNS is not "always UDP" - only the common, small
  // lookup case is asked here, with an explicit note that TCP is also used
  // in certain situations. No deeper DNS lesson is implied.
  {
    id: 'scenario-dns', type: 'scenario',
    prompt: 'Eine gewöhnliche kleine DNS-Namensabfrage wird normalerweise zuerst über welches Transportprotokoll gesendet?',
    options: ['TCP', 'UDP'], correct: 'UDP', topic: 'tcp-vs-udp',
    explanation: 'UDP ist bei normalen DNS-Abfragen üblich. DNS kann in bestimmten Fällen jedoch auch TCP verwenden.',
  },
  { id: 'stmt-tcp-connection', type: 'statement', prompt: 'TCP baut vor der Datenübertragung eine Verbindung auf.', options: ['Wahr', 'Falsch'], correct: 'Wahr', topic: 'tcp' },
  { id: 'stmt-udp-delivery', type: 'statement', prompt: 'UDP garantiert die Zustellung jedes Pakets.', options: ['Wahr', 'Falsch'], correct: 'Falsch', topic: 'udp' },
  { id: 'stmt-udp-latency', type: 'statement', prompt: 'UDP hat im Vergleich zu TCP eine geringere Verzögerung (Latenz).', options: ['Wahr', 'Falsch'], correct: 'Wahr', topic: 'tcp-vs-udp' },
  { id: 'stmt-handshake-order', type: 'statement', prompt: 'Der TCP Three-Way Handshake läuft in der Reihenfolge SYN → SYN-ACK → ACK ab.', options: ['Wahr', 'Falsch'], correct: 'Wahr', topic: 'tcp' },
];

export default function AcademyPlacementTcpUdp() {
  const navigate = useNavigate();
  useAppBack();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [pendingExplanation, setPendingExplanation] = useState(null);
  const done = step >= QUESTIONS.length;
  const question = QUESTIONS[step];

  function answer(choice) {
    setAnswers((a) => ({ ...a, [question.id]: choice }));
    // Only DNS currently carries a short clarifying explanation - shown
    // briefly before moving on, no separate lesson.
    if (question.explanation) setPendingExplanation(question.explanation);
    else setStep((s) => s + 1);
  }

  function continueAfterExplanation() {
    setPendingExplanation(null);
    setStep((s) => s + 1);
  }

  // Side effects (writing progress/placement results, emitting unlock
  // events) must not run during render - this fires once, right after the
  // last answer is committed.
  useEffect(() => {
    if (!done || result) return;
    const correctCount = QUESTIONS.filter((q) => answers[q.id] === q.correct).length;
    const evaluation = evaluatePlacementTest(correctCount, QUESTIONS.length);
    const weakTopics = [...new Set(QUESTIONS.filter((q) => answers[q.id] !== q.correct).map((q) => q.topic))];
    if (evaluation.passed) {
      markLearnedFromPlacement([
        { categoryId: 'fundamentals', topicId: 'tcp-udp' },
      ]);
    }
    recordPlacementResult(TEST_ID, { percent: evaluation.percent, passed: evaluation.passed, weakTopics });
    setResult({ ...evaluation, weakTopics, correctCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, result, answers]);

  if (done && !result) return null;

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Lernmodus" />
      <div className="cyber-card p-4">
        <h2 className="font-bold text-white">Einstufungstest · TCP/UDP</h2>
        <p className="text-xs text-[#8b949e] mt-2">Anwendungssituationen zuordnen, Aussagen bewerten, Zuverlässigkeit gegen Verzögerung abwägen.</p>
      </div>

      {!result ? (
        <div className="cyber-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Frage {step + 1}/{QUESTIONS.length}</div>
          <p className="text-sm text-[#c9d1d9] mt-2">{question.prompt}</p>
          {!pendingExplanation ? (
            <div className="flex gap-2 mt-4">
              {question.options.map((opt) => (
                <button key={opt} onClick={() => answer(opt)} className="cyber-btn-outline flex-1 py-2 text-sm">{opt}</button>
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-[#00f0ff] mt-3">{pendingExplanation}</p>
              <button onClick={continueAfterExplanation} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="cyber-card p-4">
            <div className="flex items-center gap-2">
              {result.passed ? <CheckCircle2 size={20} className="text-[#00ff66]" /> : <XCircle size={20} className="text-[#ffcc00]" />}
              <span className="font-bold text-white">{result.percent}% richtig</span>
            </div>
            {result.passed ? (
              <p className="text-sm text-[#00ff66] mt-3">Bestanden. TCP, UDP und TCP-vs-UDP sind jetzt als „gelernt“ markiert. Fortgeschrittene Inhalte werden verfügbar.</p>
            ) : (
              <>
                <p className="text-sm text-[#c9d1d9] mt-3">Noch nicht ganz sicher - das ist kein Problem. Sam schlägt eine gezielte Wiederholung vor, es gibt keine Strafe.</p>
                {result.weakTopics.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Empfehlung zur Wiederholung</div>
                    <ul className="mt-1 flex flex-col gap-1">
                      {result.weakTopics.map((t) => <li key={t} className="text-xs text-[#ffcc00]">{t}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          <button onClick={() => navigate('/academy')} className="cyber-btn w-full py-2 text-sm">Zurück zur Academy</button>
        </>
      )}
    </div>
  );
}
