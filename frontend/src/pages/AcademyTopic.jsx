import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { findTopic, topicKey, TOPIC_STATUS } from '../lib/academyTopics';
import { getFullTopic } from '../lib/academyProgress';
import {
  applyMentorLesson, applyQuiz, applyMiniExercise, applyConversationPractice,
  recordContentSeen, topicOverallProgress,
} from '../lib/academyEngine';
import { LESSONS, getTopicScoreDimensions } from '../lib/academyLessonData';
import { LEARNING_MODES, readAcademyMode } from '../lib/academyMode';
import { shuffleOptions } from '../lib/shuffleOptions';
import { collectQuestionsFromLesson } from '../lib/academyThemencheck';
import LessonRunner from '../components/LessonRunner';
import { characterAsset } from '../lib/rpgAssets';
import ErrorBoundary from '../components/ErrorBoundary';
import BackBar from '../components/BackBar';
import { useAppBack, pushBackHandler } from '../lib/useAppBack';
import SpeakButton from '../components/SpeakButton';
import { stop as stopSpeech } from '../lib/speechSynthesis';
import { BASICS_BEATS, pickDiverseBasicsQuestions } from '../lib/academyLessons/grundbegriffe';

// -----------------------------------------------------------------------
// "Grundbegriffe" has a small custom mini-lesson (guided Sam dialogue). All
// other finished lessons - including the merged "TCP & UDP" topic (Milestone
// C5.3) - use the generic LessonRunner. Topics without lesson content show
// a clearly-labeled placeholder.
// -----------------------------------------------------------------------

const STATUS_LABEL = {
  [TOPIC_STATUS.LOCKED]: 'Gesperrt', [TOPIC_STATUS.AVAILABLE]: 'Verfügbar', [TOPIC_STATUS.STARTED]: 'Begonnen',
  [TOPIC_STATUS.LEARNED]: 'Gelernt', [TOPIC_STATUS.APPLIED]: 'Angewendet', [TOPIC_STATUS.CONSOLIDATED]: 'Gefestigt',
};

function PlaceholderLesson({ title }) {
  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Platzhalter</div>
      <p className="text-sm text-[#c9d1d9] mt-2">Diese Lektion zu „{title}“ wird später ergänzt. Aktuell dient dieser Bereich nur als Grundgerüst der NEXUS Academy.</p>
    </div>
  );
}

// "Grundbegriffe" (Milestone A) - short Sam dialogue beats grouped into 3
// sections, each ending in a small, non-punitive comprehension question.
// Explicitly covers: Was ist ein Netzwerk? / Warum genutzt? / Dienste /
// Protokolle (references, does NOT duplicate, the "TCP & UDP" topic)
// / Kommunikationsarten / Betriebsarten (both only briefly introduced here -
// the "Kommunikations- und Übertragungsarten" topic goes deeper later).
// -----------------------------------------------------------------------

function BasicsVisual({ type }) {
  if (type === 'network') return (
    <div className="mt-3 rounded-lg border border-[#00f0ff]/30 bg-[#07111f] p-3 text-center text-xs text-[#c9d1d9]">
      <div className="grid grid-cols-3 items-center gap-2"><span>PC</span><span className="text-[#00f0ff]">↔ Netzwerk ↔</span><span>Server</span></div>
      <div className="mt-2 text-[#00ff66]">gemeinsame Ressource · Information · Dienst</div>
    </div>
  );
  if (type === 'service-protocol') return (
    <div className="mt-3 rounded-lg border border-[#00f0ff]/30 bg-[#07111f] p-3 text-xs text-[#c9d1d9]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <div><div className="font-bold text-[#00ff66]">WEB-DIENST</div><div>angebotene Funktion</div></div>
        <div className="text-[#00f0ff]">↔</div>
        <div><div className="font-bold text-[#ffcc00]">HTTP</div><div>Kommunikationsregeln</div></div>
      </div>
      <div className="mt-2 text-center text-[#8b949e]">Dienst = WAS? · Protokoll = nach welchen REGELN?</div>
    </div>
  );
  if (type === 'communication-axes') return (
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-lg border border-[#00f0ff]/30 bg-[#07111f] p-3"><div className="font-bold text-[#00f0ff]">Vermittlungsart</div><div>leitungsvermittelt</div><div>paketvermittelt</div></div>
      <div className="rounded-lg border border-[#ffcc00]/30 bg-[#07111f] p-3"><div className="font-bold text-[#ffcc00]">Verbindungsverhalten</div><div>verbindungsorientiert</div><div>verbindungslos</div></div>
      <div className="col-span-2 text-center text-[#00ff66]">Zwei unterschiedliche Eigenschaften – nicht gleichsetzen.</div>
    </div>
  );
  return null;
}

function BasicsPractice({ mode, onDone }) {
  const questions = useMemo(() => pickDiverseBasicsQuestions(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const shuffled = useMemo(() => questions.map((q) => shuffleOptions(q.options, q.correct)), [questions]);
  const question = questions[index];
  const current = shuffled[index];
  const finished = index >= questions.length;

  function answer(optionIndex) {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === current.correct) {
      if (mode === 'interview') applyConversationPractice('fundamentals', 'grundbegriffe');
      else applyMiniExercise('fundamentals', 'grundbegriffe');
    }
  }

  if (finished) return (
    <div className="cyber-card p-4">
      <div className="text-xs text-[#00ff66]">Sam Richter · {mode === 'interview' ? 'Fachgespräch' : 'Praxis'}</div>
      <p className="mt-2 text-sm text-[#c9d1d9]">„Die Runde deckt bewusst verschiedene Kernbegriffe ab. Entscheidend ist, dass du Dienst, Protokoll und die beiden Kommunikationsachsen nicht vermischst.“</p>
      <button onClick={onDone} className="cyber-btn mt-3 w-full py-2 text-sm">Fertig</button>
    </div>
  );

  const isCorrect = selected !== null && selected === current.correct;
  const prompt = mode === 'interview' ? `„${question.question}“` : question.question;
  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">{mode === 'interview' ? 'Sam · Fachgespräch' : 'Praxis'} · {index + 1}/{questions.length}</div>
      <p className="mt-2 text-sm font-bold text-white">{prompt}</p>
      <div className="mt-3 flex flex-col gap-2">
        {current.options.map((option, optionIndex) => (
          <button key={option} onClick={() => answer(optionIndex)} disabled={selected !== null} className="cyber-btn-outline w-full px-3 py-2 text-left text-sm">{option}</button>
        ))}
      </div>
      {selected !== null && (
        <>
          <p className={`mt-3 text-xs ${isCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>{isCorrect ? 'Richtig. ' : 'Nicht ganz. '}{question.explanation}</p>
          <button onClick={() => { setSelected(null); setIndex((value) => value + 1); }} className="cyber-btn mt-3 w-full py-2 text-sm">Weiter</button>
        </>
      )}
    </div>
  );
}

function GrundbegriffeLesson({ mode = 'theory', onDone }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  // Pre-shuffle all questions once on mount so the correct answer position
  // varies per attempt but stays stable during the same session.
  const shuffledQuestions = useMemo(() => {
    const map = {};
    BASICS_BEATS.forEach((beat, i) => {
      if (beat.type === 'question') {
        map[i] = shuffleOptions(beat.options, beat.correct);
      }
    });
    return map;
  }, []);
  const beat = BASICS_BEATS[index];

  useEffect(() => {
    if (finished) recordContentSeen('fundamentals', 'grundbegriffe', 100);
  }, [finished]);

  if (mode === 'practice' || mode === 'interview') return <BasicsPractice mode={mode} onDone={onDone} />;

  function advance() {
    stopSpeech().catch(() => {});
    // One mentorLesson (theory) bump per finished section - not per line, so
    // scoring stays coarse and predictable instead of spamming tiny deltas.
    if (beat.endOfSection) applyMentorLesson('fundamentals', 'grundbegriffe');
    if (index + 1 >= BASICS_BEATS.length) setFinished(true);
    else setIndex((i) => i + 1);
  }

  function answer(optionIndex) {
    setSelected(optionIndex);
    // Points only for correct answers; evaluation uses shuffled correct index.
    const shuffled = shuffledQuestions[index];
    if (optionIndex === shuffled.correct) {
      applyQuiz('fundamentals', 'grundbegriffe', 'theory');
    }
  }

  function nextAfterQuestion() {
    stopSpeech().catch(() => {});
    setSelected(null);
    if (index + 1 >= BASICS_BEATS.length) setFinished(true);
    else setIndex((i) => i + 1);
  }

  if (finished) {
    return (
      <div className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Sam</div>
        <p className="text-sm text-[#c9d1d9] mt-2">„Das reicht für heute. Du musst Netzwerke nicht auswendig lernen - du musst verstehen, warum sie funktionieren.“</p>
        <p className="text-sm text-[#c9d1d9] mt-2">Sam nimmt seine Kaffeetasse: „Das Netzwerk läuft vielleicht nicht immer... aber der Kaffee muss laufen.“</p>
        <button onClick={() => { stopSpeech().catch(() => {}); onDone(); }} className="cyber-btn w-full mt-3 py-2 text-sm">Fertig</button>
      </div>
    );
  }

  if (beat.type === 'question') {
    const shuffled = shuffledQuestions[index];
    const isCorrect = selected !== null && selected === shuffled.correct;
    return (
      <div className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Verständnisfrage</div>
        <p className="text-sm text-white font-bold mt-2">{beat.prompt}</p>
        {selected === null ? (
          <div className="flex flex-col gap-2 mt-3">
            {shuffled.options.map((opt, i) => (
              <button key={opt} onClick={() => answer(i)} className="cyber-btn-outline w-full py-2 text-sm text-left px-3">{opt}</button>
            ))}
          </div>
        ) : (
          <>
            <p className={`text-xs mt-3 ${isCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>{isCorrect ? 'Richtig! ' : 'Nicht ganz. '}{beat.explanation}</p>
            <button onClick={nextAfterQuestion} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Sam erklärt · {index + 1}/{BASICS_BEATS.length}</div>
      <p className="text-sm text-[#c9d1d9] mt-2">{beat.text}</p>
      {beat.visual && <BasicsVisual type={beat.visual} />}
      <div className="flex items-center justify-between mt-3">
        <SpeakButton text={beat.text} />
        <button onClick={advance} className="cyber-btn py-2 px-4 text-sm">Weiter</button>
      </div>
    </div>
  );
}

// Every normal lesson inside an Academy category now offers exactly the same
// three-mode entry screen first: Theorie, Praxis, Fachgespräch. The player
// chooses the mode; only then does the matching LessonRunner mode start.
// The old single "Lektion starten" / "Einführung" button is removed from
// this level. If a mode has no data (e.g. no question pool yet) it is shown
// disabled with "Noch nicht verfügbar", but the selection screen itself is
// always visible. ThemenChecks are unaffected and bypass this component.
function ModeButton({ icon, title, description, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        'w-full text-left p-3 rounded-lg border transition ' +
        (disabled
          ? 'opacity-50 cursor-not-allowed bg-[#0a1628]/30 border-[#30363d] text-[#8b949e]'
          : 'bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9] hover:border-[#00f0ff]/60')
      }
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="font-bold text-sm">{title}</div>
      </div>
      <div className="text-xs text-[#8b949e] mt-1 pl-7">{description}</div>
      {disabled && <div className="text-[10px] text-[#ffcc00] mt-1 pl-7">Noch nicht verfügbar</div>}
    </button>
  );
}

function AcademyEntryCard({
  topic, isTcpUdpFamily, hasPractice, hasInterview,
  onTheory, onPractice, onInterview, onBack, onPlacement,
}) {
  const portrait = characterAsset('sam');
  const contentSeen = topic.contentSeenPercent || 0;
  const overall = topicOverallProgress(topic);

  let greeting = '„Wie möchtest du diese Lektion angehen?"';
  let subtext = null;
  if (contentSeen >= 100) {
    subtext = `Gesamtfortschritt: ${overall}%`;
  } else if (topic.status !== TOPIC_STATUS.AVAILABLE && (topic.theoryScore > 0 || topic.practiceScore > 0 || topic.retentionScore > 0 || contentSeen > 0)) {
    greeting = '„Du hast das Thema schon angefangen. Wie geht es weiter?"';
    subtext = `Gesamtfortschritt: ${overall}%`;
  }

  return (
    <div className="cyber-card p-4">
      <div className="flex items-center gap-3">
        {portrait ? <img src={portrait} alt="Sam Richter" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
        <div>
          <div className="text-xs text-[#00ff66]">Sam Richter · Senior-Administrator</div>
          <p className="text-sm text-[#c9d1d9] mt-1">{greeting}</p>
          {subtext && <p className="text-xs text-[#8b949e] mt-1">{subtext}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-4">
        <ModeButton
          icon="📖"
          title="Theorie"
          description="Lerne die Inhalte Schritt für Schritt."
          onClick={onTheory}
        />
        <ModeButton
          icon="🧠"
          title="Praxis"
          description="Starte direkt eine zufällige Übungsrunde ohne Theorie."
          onClick={onPractice}
          disabled={!hasPractice}
        />
        <ModeButton
          icon="🎤"
          title="Fachgespräch"
          description="Beantworte offene Fragen und erkläre Zusammenhänge frei."
          onClick={onInterview}
          disabled={!hasInterview}
        />
        <button onClick={onBack} className="w-full text-xs text-[#8b949e] py-1 flex items-center justify-center gap-1">
          ← Zur Themenübersicht
        </button>
      </div>
      {isTcpUdpFamily && (
        <button onClick={onPlacement} className="w-full text-xs text-[#00f0ff] py-1 mt-1 underline">
          Stattdessen Einstufungstest machen
        </button>
      )}
    </div>
  );
}

export default function AcademyTopic() {
  const { categoryId, topicId } = useParams();
  const navigate = useNavigate();
  useAppBack();
  const [activeSection, setActiveSection] = useState(null); // null | 'theory' | 'practice' | 'interview'
  // Bumped after any engine call so the component re-renders and re-reads
  // the just-updated scores/status from academyProgress.js (getFullTopic is
  // not memoized - it always reflects the latest localStorage state on
  // every render, this state only exists to trigger that re-render).
  const [, setRefreshTick] = useState(0);
  // Only registers a back-handler while a lesson is actually open, so
  // Android back on the plain Sam-question view falls through to normal
  // router navigation (back to the category) instead of being swallowed.
  useEffect(() => {
    if (!activeSection) return;
    return pushBackHandler(() => setActiveSection(null));
  }, [activeSection]);

  const topicDef = findTopic(categoryId, topicId);
  const topic = topicDef ? getFullTopic(categoryId, topicId) : null;

  if (!topic) return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Kategorie" />
      <div className="cyber-card p-4 text-sm text-[#ff3355]">Dieses Thema existiert nicht.</div>
    </div>
  );

  const mode = readAcademyMode().mode;
  const courseMode = mode === LEARNING_MODES.COURSE;
  const locked = topic.status === TOPIC_STATUS.LOCKED;
  const effectiveLocked = locked && !courseMode;
  const isTcpUdpTopic = topic.topicId === 'tcp-udp' && topic.categoryId === 'fundamentals';

  const isBasicsTopic = topic.topicId === 'grundbegriffe' && topic.categoryId === 'fundamentals';
  const hasLessonRunner = !!LESSONS[topicKey(categoryId, topicId)];
  const questionPool = hasLessonRunner ? collectQuestionsFromLesson(LESSONS[topicKey(categoryId, topicId)], topicId) : [];
  const hasPractice = isBasicsTopic || questionPool.length > 0;
  const hasInterview = isBasicsTopic || questionPool.length > 0;
  const scoreDimensions = getTopicScoreDimensions(categoryId, topicId);
  const scoreCols = [scoreDimensions.theory, scoreDimensions.practice, scoreDimensions.retention].filter(Boolean).length;

  // Opening a lesson no longer awards points upfront. Real activities inside
  // the lesson (questions, exercises, quizzes, full completion) call the
  // engine themselves, and the engine guards against locked topics and
  // repeated farming. Placeholder topics therefore cannot be used to score.
  function openTheory() {
    setActiveSection('theory');
    setRefreshTick((t) => t + 1);
  }
  function openPractice() {
    setActiveSection('practice');
    setRefreshTick((t) => t + 1);
  }
  function openInterview() {
    setActiveSection('interview');
    setRefreshTick((t) => t + 1);
  }
  function closeLesson() {
    stopSpeech().catch(() => {});
    setActiveSection(null);
    setRefreshTick((t) => t + 1);
  }

  function renderLesson() {
    if (isBasicsTopic) return <GrundbegriffeLesson mode={activeSection} onDone={closeLesson} />;
    if (hasLessonRunner) {
      return (
        <LessonRunner
          lesson={LESSONS[topicKey(categoryId, topicId)]}
          categoryId={categoryId}
          topicId={topicId}
          topic={topic}
          mode={activeSection}
          onDone={closeLesson}
        />
      );
    }

    return <PlaceholderLesson title={topic.title} />;
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Kategorie" />
      <div className="cyber-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-white">{topic.title}</h2>
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 text-[#00f0ff] border-[#00f0ff]/40 shrink-0">
            {[TOPIC_STATUS.LEARNED, TOPIC_STATUS.APPLIED, TOPIC_STATUS.CONSOLIDATED].includes(topic.status) && <CheckCircle2 size={11} className="text-[#00ff66]" />}
            {STATUS_LABEL[topic.status]}
          </span>
        </div>
        {topic.description && <p className="text-xs text-[#8b949e] mt-2">{topic.description}</p>}
        {!locked && (
          <div className={`grid gap-3 mt-3 text-center ${scoreCols === 1 ? 'grid-cols-1' : scoreCols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {scoreDimensions.theory && <div><div className="text-[9px] text-[#8b949e]">Theorie</div><div className="text-sm text-[#00f0ff] font-bold">{(topic.theoryCompletion ?? topic.theoryScore) ?? 0}%</div></div>}
            {scoreDimensions.practice && <div><div className="text-[9px] text-[#8b949e]">Praxis</div><div className="text-sm text-[#00f0ff] font-bold">{topic.practiceScore}%</div></div>}
            {scoreDimensions.retention && <div><div className="text-[9px] text-[#8b949e]">Festigung</div><div className="text-sm text-[#00f0ff] font-bold">{topic.retentionScore}%</div></div>}
          </div>
        )}
      </div>

      {effectiveLocked ? (
        <div className="cyber-card p-4 flex items-center gap-3">
          <Lock size={20} className="text-[#8b949e] shrink-0" />
          <p className="text-sm text-[#8b949e]">Dieses Thema ist noch gesperrt. Schließe zuerst die Voraussetzungen ab.</p>
        </div>
      ) : !activeSection ? (
        <AcademyEntryCard
          topic={topic}
          isTcpUdpFamily={isTcpUdpTopic}
          hasPractice={hasPractice}
          hasInterview={hasInterview}
          onTheory={openTheory}
          onPractice={openPractice}
          onInterview={openInterview}
          onBack={() => navigate(`/academy/${categoryId}`)}
          onPlacement={() => navigate('/academy/placement/tcp-udp')}
        />
      ) : (
        <>
          <ErrorBoundary
            context={`Lektion: ${topicKey(categoryId, topicId)}`}
            categoryId={categoryId}
            topicId={topicId}
            onBack={closeLesson}
          >
            {renderLesson()}
          </ErrorBoundary>
          <button onClick={closeLesson} className="cyber-btn-outline w-full py-2 text-sm">Zurück zu Sam</button>
        </>
      )}
    </div>
  );
}
