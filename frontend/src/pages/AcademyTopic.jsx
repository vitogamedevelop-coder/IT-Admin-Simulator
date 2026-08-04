import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { findTopic, topicKey, TOPIC_STATUS } from '../lib/academyTopics';
import { getFullTopic } from '../lib/academyProgress';
import {
  applyMentorLesson, applyQuiz,
  recordContentSeen, isTopicMastered, topicOverallProgress,
} from '../lib/academyEngine';
import { LESSONS, getTopicScoreDimensions } from '../lib/academyLessonData';
import { LEARNING_MODES, readAcademyMode } from '../lib/academyMode';
import { shuffleOptions } from '../lib/shuffleOptions';
import LessonRunner from '../components/LessonRunner';
import { characterAsset } from '../lib/rpgAssets';
import ErrorBoundary from '../components/ErrorBoundary';
import BackBar from '../components/BackBar';
import { useAppBack, pushBackHandler } from '../lib/useAppBack';

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
const BASICS_BEATS = [
  { type: 'say', text: 'Fangen wir ganz vorne an: Ein Netzwerk verbindet mehrere Geräte, damit sie miteinander Daten austauschen können.' },
  { type: 'say', text: 'Ohne Netzwerk müsstest du jede Datei einzeln von Hand übertragen. Mit einem Netzwerk könnt ihr Dateien, Drucker und Dienste gemeinsam nutzen - genau deshalb setzen Unternehmen Netzwerke ein.', endOfSection: true },
  { type: 'question', prompt: 'Warum setzen Unternehmen Netzwerke ein?', options: ['Damit jedes Gerät unabhängig von den anderen läuft', 'Damit Ressourcen wie Dateien und Drucker gemeinsam genutzt werden können'], correct: 1, explanation: 'Netzwerke verbinden Geräte, damit Ressourcen gemeinsam genutzt werden können.' },
  { type: 'say', text: 'Ein Netzwerk stellt Dienste bereit - zum Beispiel eine Dateifreigabe, einen Drucker oder E-Mail. Ein Dienst ist einfach eine Funktion, die ein Gerät im Netzwerk anbietet.' },
  { type: 'say', text: 'Damit sich zwei Geräte überhaupt verstehen, brauchen sie eine gemeinsame Sprache - ein Protokoll. Ein Protokoll legt fest, wie Daten aufgebaut und ausgetauscht werden.' },
  { type: 'say', text: 'Zwei der wichtigsten Protokolle - TCP und UDP - lernst du gleich im eigenen Thema im Detail. Hier reicht erstmal: Ein Protokoll ist ein Regelwerk für die Kommunikation.', endOfSection: true },
  { type: 'question', prompt: 'Was ist ein Protokoll am ehesten?', options: ['Ein physisches Netzwerkkabel', 'Ein Regelwerk für die Kommunikation zwischen Geräten'], correct: 1, explanation: 'Ein Protokoll definiert die Regeln, nach denen Geräte Daten austauschen.' },
  { type: 'say', text: 'Kommunikation kann unterschiedlich ablaufen: Unicast (eins zu eins), Broadcast (an alle) oder Multicast (an eine bestimmte Gruppe). Die Details dazu gehen wir später im Thema „Kommunikations- und Übertragungsarten“ durch.' },
  { type: 'say', text: 'Und es gibt die Betriebsart: Simplex (nur eine Richtung), Halbduplex (abwechselnd in beide Richtungen) oder Vollduplex (gleichzeitig in beide Richtungen). Auch das vertiefen wir dort weiter.', endOfSection: true },
  { type: 'question', prompt: 'Ein Videoanruf, bei dem beide Seiten gleichzeitig sprechen und hören können, ist ein Beispiel für...', options: ['Simplex', 'Vollduplex'], correct: 1, explanation: 'Bei Vollduplex können beide Seiten gleichzeitig senden und empfangen, wie bei einem Videoanruf.' },
];

function GrundbegriffeLesson({ onDone }) {
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

  function advance() {
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
        <button onClick={onDone} className="cyber-btn w-full mt-3 py-2 text-sm">Fertig</button>
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
      <button onClick={advance} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
    </div>
  );
}

function AcademyEntryCard({
  topic, categoryId, topicId, isBasicsTopic, isTcpUdpFamily,
  onIntro, onReview, onBack, onPlacement,
}) {
  const portrait = characterAsset('sam');
  const hasExercises = (LESSONS[topicKey(categoryId, topicId)]?.exercises || []).length > 0;
  const hasQuiz = (LESSONS[topicKey(categoryId, topicId)]?.quiz || []).length > 0;
  const scoreDimensions = getTopicScoreDimensions(categoryId, topicId);
  const contentSeen = topic.contentSeenPercent || 0;
  const perfectQuizzes = topic.quizPerfectCount || 0;
  const mastered = isTopicMastered(categoryId, topicId, scoreDimensions.practice);
  const overall = topicOverallProgress(topic);

  let greeting;
  let subtext = null;
  if (mastered) {
    greeting = '„Das Thema sitzt. Du kannst es trotzdem wiederholen oder direkt zu den Übungen gehen.“';
  } else if (contentSeen >= 100 && perfectQuizzes < 3) {
    greeting = '„Die Erklärung kennst du bereits. Für einen sicheren Abschluss fehlen dir noch fehlerfreie Wiederholungen.“';
    subtext = `Fehlerfreie Quizze: ${perfectQuizzes} / 3`;
  } else if (topic.status !== TOPIC_STATUS.AVAILABLE && (topic.theoryScore > 0 || topic.practiceScore > 0 || topic.retentionScore > 0 || contentSeen > 0)) {
    greeting = '„Du hast das Thema schon einmal angefangen. Ein paar Punkte sollten wir noch festigen.“';
    subtext = `Gesamtfortschritt: ${overall}%`;
  } else {
    greeting = isBasicsTopic ? '„Bereit? Dann gehen wir die Grundbegriffe zusammen durch.“' : '„Lass uns das Thema Schritt für Schritt durchgehen.“';
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
      <div className="flex flex-col gap-2 mt-4">
        {mastered && hasExercises && (
          <button onClick={onReview} className="cyber-btn-outline w-full py-2 text-sm">Direkt zu den Übungen</button>
        )}
        {!mastered && !isBasicsTopic && contentSeen >= 100 && (
          <button onClick={onReview} className="cyber-btn-outline w-full py-2 text-sm">{hasQuiz ? 'Abschlussquiz starten' : 'Kurze Wiederholung'}</button>
        )}
        <button onClick={onIntro} className="cyber-btn w-full py-2 text-sm">
          {contentSeen >= 100 ? 'Erklärung wiederholen' : (isBasicsTopic ? 'Lektion starten' : 'Einführung')}
        </button>
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
  const [activeSection, setActiveSection] = useState(null); // null | 'intro' | 'review'
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
  const scoreDimensions = getTopicScoreDimensions(categoryId, topicId);
  const scoreCols = [scoreDimensions.theory, scoreDimensions.practice, scoreDimensions.retention].filter(Boolean).length;

  // Opening a lesson no longer awards points upfront. Real activities inside
  // the lesson (questions, exercises, quizzes, full completion) call the
  // engine themselves, and the engine guards against locked topics and
  // repeated farming. Placeholder topics therefore cannot be used to score.
  function openIntro() {
    setActiveSection('intro');
    setRefreshTick((t) => t + 1);
  }
  function openReview() {
    setActiveSection('review');
    setRefreshTick((t) => t + 1);
  }
  function closeLesson() {
    setActiveSection(null);
    setRefreshTick((t) => t + 1);
  }

  function renderLesson() {
    if (isBasicsTopic) return <GrundbegriffeLesson onDone={closeLesson} />;
    if (hasLessonRunner) {
      return (
        <LessonRunner
          lesson={LESSONS[topicKey(categoryId, topicId)]}
          categoryId={categoryId}
          topicId={topicId}
          topic={topic}
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
            {scoreDimensions.theory && <div><div className="text-[9px] text-[#8b949e]">Theorie</div><div className="text-sm text-[#00f0ff] font-bold">{topic.theoryScore}%</div></div>}
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
          categoryId={categoryId}
          topicId={topicId}
          isBasicsTopic={isBasicsTopic}
          isTcpUdpFamily={isTcpUdpTopic}
          onIntro={openIntro}
          onReview={openReview}
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
