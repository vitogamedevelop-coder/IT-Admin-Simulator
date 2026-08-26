import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2, XCircle, ArrowLeft, ArrowRight, HelpCircle, Lightbulb, BookOpen,
  MessageCircle, ArrowUp, ArrowDown, Volume2, VolumeX,
} from 'lucide-react';
import { characterAsset } from '../lib/rpgAssets';
import { readAcademyProgress, updateTopicProgress } from '../lib/academyProgress';
import {
  recordLessonStart, recordSectionCompletion, recordQuestionAnswer,
  recordExerciseCompletion, recordLessonCompletion, recordPreferredStyle,
  recordQuizResult,
} from '../lib/academyEngine';
import { shuffleOptions } from '../lib/shuffleOptions';
import { collectQuestionsFromLesson, collectCliTasksFromLesson } from '../lib/academyThemencheck';
import { checkCiscoInput } from '../lib/ciscoCli';
import { speak, stop, ttsTextFromBlocks, normalizeCiscoText } from '../lib/speechSynthesis';
import {
  calculateNetworkId, calculateBroadcast, calculateFirstHost, calculateLastHost,
  calculateJumpSize, getRelevantOctet, generateUniqueSubnetProblems,
} from '../lib/networking/ipv4Math';
import {
  generateQuestion, generateSubnettingQuestion, generateExamQuestions,
  checkAnswer, getRandomTip, DIFFICULTY_NAMES, DIFFICULTY_LABELS,
} from '../lib/academyLessons/ipv4Generator';

const STYLE_SEQUENCE = ['classic', 'intuitive', 'example', 'visual', 'mnemonic'];

// Small reusable TTS button for lesson blocks.
function SpeakButton({ text, label }) {
  const [speaking, setSpeaking] = useState(false);
  if (!text) return null;

  async function handleToggle() {
    if (speaking) {
      await stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    await speak(text, {
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={speaking ? 'Vorlesen stoppen' : (label || 'Text vorlesen')}
      className="inline-flex items-center justify-center p-1.5 rounded text-[#00f0ff] hover:bg-[#00f0ff]/10 border border-[#00f0ff]/30 ml-2"
    >
      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );
}

// Every lesson now exposes three independent ways to engage with it, chosen
// by the player on AcademyTopic's entry card before LessonRunner mounts:
//  - 'theory'    (default): the existing explanation -> exercises -> quiz
//    flow, now with a short comprehension check after every section.
//  - 'practice': skips straight to a quiz drawn from a random subset of the
//    lesson's full question pool (quiz + inline questions) - no theory.
//  - 'interview': skips straight to a simulated oral exam ("Fachgespräch")
//    built from the same question pool, presented as a Sam dialogue.
// Both new modes deliberately reuse collectQuestionsFromLesson() (already
// used by the Themencheck) instead of introducing a second question format.
const PRACTICE_QUESTION_COUNT = 5;
const INTERVIEW_QUESTION_COUNT = 5;

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LessonRunner({ lesson, categoryId, topicId, topic, mode = 'theory', onDone }) {
  const portrait = characterAsset('sam');
  const progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
  const savedStyle = readAcademyProgress().playerProfile?.preferredExplanationStyle;
  const initialStyle = savedStyle || progress?.lastExplanationStyle || 'classic';

  // Sections are groups of explanations keyed by the part before the last dash.
  const { sectionIds, explanationsBySection } = useMemo(() => {
    const map = new Map();
    lesson.explanations.forEach((ex) => {
      const dash = ex.id.lastIndexOf('-');
      const sectionId = dash > 0 ? ex.id.slice(0, dash) : ex.id;
      const style = dash > 0 ? ex.id.slice(dash + 1) : ex.style || 'classic';
      if (!map.has(sectionId)) map.set(sectionId, {});
      map.get(sectionId)[style] = ex;
    });
    return { sectionIds: Array.from(map.keys()), explanationsBySection: map };
  }, [lesson.explanations]);

  // Resume from stored progress: start on the section after the last completed one.
  const resumeIndex = useMemo(() => {
    const last = progress?.lastCompletedSectionId;
    if (!last) return 0;
    const idx = sectionIds.indexOf(last);
    return idx >= 0 ? Math.min(idx + 1, sectionIds.length - 1) : 0;
  }, [progress, sectionIds]);
  const resuming = resumeIndex > 0;

  const [phase, setPhase] = useState('explanation');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(resumeIndex);
  const [currentStyle, setCurrentStyle] = useState(initialStyle);
  const [completedExercises, setCompletedExercises] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizResults, setQuizResults] = useState({});
  const [finished, setFinished] = useState(false);
  // Comprehension check shown after every theory section (see
  // findSectionCheckQuestion below): either a real question reused from
  // that section's own content, or - if the section has none - a short
  // generic self-assessment. null while no check is pending.
  const [sectionCheckQuestion, setSectionCheckQuestion] = useState(null);
  const [sectionCheckAnswer, setSectionCheckAnswer] = useState(null);
  const explanationRef = useRef(null);
  const hasScrolledRef = useRef(false);
  const sectionMountedRef = useRef(false);
  const quizResultRecordedRef = useRef(false);

  // Derived values – declared BEFORE any useEffect that references them so
  // that the production bundler never emits a Temporal Dead Zone access.
  const currentSectionId = sectionIds[currentSectionIndex];
  const availableStyles = explanationsBySection.get(currentSectionId)
    ? Object.keys(explanationsBySection.get(currentSectionId))
    : [];
  const currentExplanation = explanationsBySection.get(currentSectionId)?.[currentStyle]
    || explanationsBySection.get(currentSectionId)?.[availableStyles[0]]
    || lesson.explanations[0];

  useEffect(() => {
    recordLessonStart(categoryId, topicId);
  }, [categoryId, topicId]);

  // Record the full quiz result once the player leaves the quiz phase.
  useEffect(() => {
    if (phase !== 'help' || !lesson.quiz?.length || quizResultRecordedRef.current) return;
    const correct = Object.values(quizResults).filter(Boolean).length;
    recordQuizResult(categoryId, topicId, { total: lesson.quiz.length, correct });
    quizResultRecordedRef.current = true;
  }, [phase, categoryId, topicId, lesson.quiz, quizResults]);

  // Each new explanation section starts with the default "classic" style so the
  // player always begins with "Warum", even if a different style was used before.
  useEffect(() => {
    if (!sectionMountedRef.current) { sectionMountedRef.current = true; return; }
    const section = explanationsBySection.get(currentSectionId) || {};
    const styles = Object.keys(section);
    const defaultStyle = styles.includes('classic') ? 'classic' : (styles[0] || 'classic');
    setCurrentStyle(defaultStyle);
  }, [currentSectionId, explanationsBySection]);

  // Smoothly scroll the explanation card into view whenever the section or the
  // chosen explanation style changes - the player should always see the freshly
  // loaded content instead of staring at the bottom of the page.
  useEffect(() => {
    if (!hasScrolledRef.current) { hasScrolledRef.current = true; return; }
    if (explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSectionId, currentStyle]);

  function switchStyle(style) {
    if (style === currentStyle) return;
    setCurrentStyle(style);
    recordPreferredStyle(style);
  }

  // Looks for an inline `type: 'question'` block anywhere in the current
  // section (any explanation style) so the same content already authored
  // for that section can double as its comprehension check - no new
  // per-section content had to be written for this.
  function findSectionCheckQuestion(sectionId) {
    const section = explanationsBySection.get(sectionId) || {};
    for (const style of Object.keys(section)) {
      const q = (section[style]?.blocks || []).find((b) => b.type === 'question');
      if (q) return q;
    }
    return null;
  }

  // Moves on to the next section (or exercises/quiz once the last section
  // is done) - shared by both the question-based and generic self-check.
  function proceedPastSection() {
    setSectionCheckQuestion(null);
    setSectionCheckAnswer(null);
    if (currentSectionIndex < sectionIds.length - 1) {
      setCurrentSectionIndex((i) => i + 1);
      setPhase('explanation');
    } else {
      const hasExercises = (lesson.exercises || []).length > 0;
      setPhase(hasExercises ? 'exercises' : 'quiz');
    }
  }

  // "Weiter" on a theory section no longer advances directly - it first
  // records the section as read, then always shows one short comprehension
  // check (reusing the section's own inline question if it has one, or a
  // generic self-assessment otherwise) before moving on.
  function advanceSection() {
    recordSectionCompletion(categoryId, topicId, currentSectionId, currentExplanation.title || '');
    setSectionCheckQuestion(findSectionCheckQuestion(currentSectionId));
    setSectionCheckAnswer(null);
    setPhase('section-check');
  }

  function previousSection() {
    if (currentSectionIndex > 0) setCurrentSectionIndex((i) => i - 1);
  }

  function completeExercise(exerciseId) {
    if (completedExercises[exerciseId]) return;
    setCompletedExercises((prev) => ({ ...prev, [exerciseId]: true }));
    recordExerciseCompletion(categoryId, topicId, exerciseId);
  }

  // ---------- Exercises ----------
  function renderExercise(ex, index) {
    const stateKey = `${ex.id || `ex-${index}`}`;
    if (ex.type === 'ordering') return <OrderingExercise key={stateKey} exercise={ex} index={index} onComplete={() => completeExercise(stateKey)} />;
    if (ex.type === 'matching') return <MatchingExercise key={stateKey} exercise={ex} index={index} onComplete={() => completeExercise(stateKey)} />;
    if (ex.type === 'input') return <InputExercise key={stateKey} exercise={ex} index={index} onComplete={() => completeExercise(stateKey)} />;
    if (ex.type === 'cli-input') return <CliInputExercise key={stateKey} exercise={ex} index={index} onComplete={() => completeExercise(stateKey)} />;
    if (ex.type === 'select-best') return <SelectBestExercise key={stateKey} exercise={ex} index={index} onComplete={() => completeExercise(stateKey)} />;
    if (ex.type === 'guided-subnetting') return <GuidedSubnettingExercise key={stateKey} exercise={ex} index={index} onComplete={() => completeExercise(stateKey)} />;
    if (ex.type === 'adaptive-subnetting') return <AdaptiveSubnettingExercise key={stateKey} exercise={ex} index={index} onComplete={() => completeExercise(stateKey)} />;
    if (ex.type === 'difficulty-drill') return <DifficultyDrillExercise key={stateKey} exercise={ex} categoryId={categoryId} topicId={topicId} onComplete={() => completeExercise(stateKey)} />;
    return null;
  }

  // ---------- Quiz ----------
  const currentQuizQuestion = lesson.quiz?.[currentQuizIndex];
  const quizFinished = lesson.quiz && currentQuizIndex >= lesson.quiz.length;

  function answerQuiz(index) {
    if (quizAnswers[currentQuizIndex] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [currentQuizIndex]: index }));
    const isCorrect = index === currentQuizShuffled.correct;
    setQuizResults((prev) => ({ ...prev, [currentQuizIndex]: isCorrect }));
    recordQuestionAnswer(categoryId, topicId, `quiz-${currentQuizIndex}`, currentQuizIndex === lesson.quiz.length - 1 ? 'retention' : 'theory', isCorrect);
  }

  const currentQuizShuffled = useMemo(() => {
    if (!currentQuizQuestion) return null;
    return shuffleOptions(currentQuizQuestion.options, currentQuizQuestion.correct);
  }, [currentQuizQuestion]);

  function nextQuiz() {
    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex((i) => i + 1);
    } else {
      setPhase('help');
    }
  }

  // ---------- Feedback / completion ----------
  function getNextAlternativeStyle() {
    const currentRank = STYLE_SEQUENCE.indexOf(currentStyle);
    for (let i = currentRank + 1; i < STYLE_SEQUENCE.length; i += 1) {
      const style = STYLE_SEQUENCE[i];
      if (sectionIds.some((id) => explanationsBySection.get(id)?.[style])) return style;
    }
    return null;
  }

  function handleHelpResponse(helped) {
    if (helped) {
      completeLesson();
    } else {
      const nextStyle = getNextAlternativeStyle();
      if (nextStyle) {
        setCurrentSectionIndex(0);
        setSectionCheckQuestion(null);
        setSectionCheckAnswer(null);
        setCompletedExercises({});
        setQuizAnswers({});
        setQuizResults({});
        setCurrentQuizIndex(0);
        quizResultRecordedRef.current = false;
        setPhase('explanation');
        switchStyle(nextStyle);
      } else {
        setFinished(true);
      }
    }
  }

  function completeLesson() {
    recordLessonCompletion(categoryId, topicId, currentStyle);
    setFinished(true);
  }

  // ---------- Render phases ----------
  // Practice and Fachgespräch never touch the theory/exercises/quiz state
  // machine above - they're short-circuited here into their own small,
  // self-contained components, both fed from the exact same question pool
  // (collectQuestionsFromLesson) as the Themencheck already uses.
  if (mode === 'practice') {
    return <PracticeQuiz lesson={lesson} categoryId={categoryId} topicId={topicId} onDone={onDone} />;
  }
  if (mode === 'interview') {
    return <FachgespraechRunner lesson={lesson} categoryId={categoryId} topicId={topicId} onDone={onDone} />;
  }

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-3">
            {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00ff66] object-cover" /> : null}
            <div>
              <div className="text-xs text-[#00ff66]">Sam Richter</div>
              <p className="text-sm text-[#c9d1d9] mt-1">„Gut gemacht! Hier nochmal die wichtigsten Merksätze für dich.“</p>
            </div>
          </div>
        </div>
        <div className="cyber-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Zusammenfassung</div>
          <ul className="mt-3 flex flex-col gap-2">
            {lesson.summary.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#c9d1d9]">
                <CheckCircle2 size={15} className="text-[#00ff66] shrink-0 mt-0.5" />
                {line}
              </li>
            ))}
          </ul>
          <button onClick={onDone} className="cyber-btn w-full mt-4 py-2 text-sm">Fertig</button>
        </div>
      </div>
    );
  }

  if (phase === 'section-check') {
    if (sectionCheckQuestion) {
      return (
        <SectionCheckQuestion
          question={sectionCheckQuestion}
          onContinue={proceedPastSection}
          answer={sectionCheckAnswer}
          setAnswer={setSectionCheckAnswer}
          categoryId={categoryId}
          topicId={topicId}
          sectionId={currentSectionId}
        />
      );
    }
    // No inline question authored for this section - a short, generic
    // self-assessment still confirms understanding before moving on, using
    // the exact same wording/pattern as the end-of-lesson check below.
    return (
      <div className="cyber-card p-4">
        <div className="flex items-center gap-3">
          {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
          <div>
            <div className="text-xs text-[#00f0ff]">Sam Richter</div>
            <p className="text-sm text-[#c9d1d9] mt-1">„Kurze Zwischenfrage: Hast du diesen Abschnitt soweit verstanden?“</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={proceedPastSection} className="cyber-btn w-full py-2 text-sm">Ja, weiter geht's.</button>
          <button onClick={() => setPhase('explanation')} className="cyber-btn-outline w-full py-2 text-sm">Ich schau mir den Abschnitt nochmal an.</button>
        </div>
      </div>
    );
  }

  if (phase === 'help') {
    const hasAlternative = getNextAlternativeStyle() !== null;
    return (
      <div className="cyber-card p-4">
        <div className="flex items-center gap-3">
          {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
          <div>
            <div className="text-xs text-[#00f0ff]">Sam Richter</div>
            <p className="text-sm text-[#c9d1d9] mt-1">„Hast du das soweit verstanden?“</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={() => handleHelpResponse(true)} className="cyber-btn w-full py-2 text-sm">Ja, verstanden.</button>
          <button onClick={() => handleHelpResponse(true)} className="cyber-btn-outline w-full py-2 text-sm">Ich glaube schon.</button>
          <button onClick={() => handleHelpResponse(false)} className="cyber-btn-outline w-full py-2 text-sm">Noch nicht wirklich.</button>
        </div>
        {!hasAlternative && (
          <p className="text-xs text-[#ffcc00] mt-3">Wenn „Noch nicht“ gewählt wird, geht Sam die Erklärung später noch einmal mit dir durch.</p>
        )}
      </div>
    );
  }

  if (phase === 'exercises') {
    const allDone = (lesson.exercises || []).every((_, i) => completedExercises[`ex-${i}`] || completedExercises[lesson.exercises[i].id]);
    return (
      <div className="flex flex-col gap-4">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-3">
            {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
            <div>
              <div className="text-xs text-[#00f0ff]">Sam Richter</div>
              <p className="text-sm text-[#c9d1d9] mt-1">„Jetzt üben wir das gemeinsam. Keine Sorge – es zählt nicht jeder Fehler, sondern dass du es wirklich probierst.“</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {(lesson.exercises || []).map((ex, i) => renderExercise(ex, i))}
        </div>
        {allDone && (
          <button onClick={() => setPhase('quiz')} className="cyber-btn w-full py-2 text-sm">
            Weiter zum Abschlussquiz
          </button>
        )}
      </div>
    );
  }

  if (phase === 'quiz') {
    if (quizFinished || !currentQuizQuestion || !currentQuizShuffled) return null;
    const answered = quizAnswers[currentQuizIndex];
    const shuffledOptions = currentQuizShuffled.options;
    const shuffledCorrect = currentQuizShuffled.correct;
    const isCorrect = answered === shuffledCorrect;
    return (
      <div className="flex flex-col gap-4">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-3">
            {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
            <div>
              <div className="text-xs text-[#00f0ff]">Sam Richter</div>
              <p className="text-sm text-[#c9d1d9] mt-1">„Zeit für das Abschlussquiz. Frage {currentQuizIndex + 1} von {lesson.quiz.length}.“</p>
            </div>
          </div>
        </div>
        <div className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Quiz</div>
            <SpeakButton text={normalizeCiscoText(currentQuizQuestion.question + '. ' + (currentQuizQuestion.options || []).join('. '))} label="Frage vorlesen" />
          </div>
          <p className="text-sm text-white font-bold mt-2">{currentQuizQuestion.question}</p>
          {answered === undefined ? (
            <div className="flex flex-col gap-2 mt-3">
              {shuffledOptions.map((opt, i) => (
                <button key={i} onClick={() => answerQuiz(i)} className="cyber-btn-outline w-full py-2 text-sm text-left px-3">
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="mt-3 flex items-start gap-2">
                {isCorrect ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
                <p className={classNames('text-xs', isCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
                  {isCorrect ? 'Richtig!' : 'Nicht ganz.'} {currentQuizQuestion.explanation}
                </p>
              </div>
              <button onClick={nextQuiz} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Explanation phase
  return (
    <div className="flex flex-col gap-4">
      {resuming && currentSectionIndex === resumeIndex && (
        <div className="cyber-card p-4">
          <div className="flex items-center gap-3">
            {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00ff66] object-cover" /> : null}
            <div>
              <div className="text-xs text-[#00ff66]">Sam Richter</div>
              <p className="text-sm text-[#c9d1d9] mt-1">
                {progress?.lastCompletedSectionTitle
                  ? `Willkommen zurück. Beim letzten Mal waren wir bei „${progress.lastCompletedSectionTitle}“. Wir machen da weiter.`
                  : progress?.lastExplanationStyle && progress.lastExplanationStyle !== 'classic'
                    ? 'Willkommen zurück. Wir probieren die anschauliche Erklärung gleich wieder.'
                    : 'Willkommen zurück. Wir machen da weiter, wo wir aufgehört haben.'}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="cyber-card p-4">
        <div className="flex items-center gap-3">
          {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
          <div>
            <div className="text-xs text-[#00f0ff]">Sam Richter · {topic?.title || 'Lektion'}</div>
            <p className="text-[10px] text-[#8b949e]">Abschnitt {currentSectionIndex + 1} von {sectionIds.length}</p>
          </div>
        </div>
      </div>

      <div ref={explanationRef} className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">
          {currentExplanation.style === 'classic' && 'Erklärung'}
          {currentExplanation.style === 'intuitive' && 'Einfacher erklärt'}
          {currentExplanation.style === 'example' && 'Beispiel'}
          {currentExplanation.style === 'visual' && 'Visuell'}
          {currentExplanation.style === 'mnemonic' && 'Merksatz'}
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {currentExplanation.blocks.map((block, i) => {
            // Inline question blocks are no longer shown here - they're
            // reused as the section's comprehension check (see
            // findSectionCheckQuestion/phase 'section-check') so the same
            // question isn't presented twice.
            if (block.type === 'question') return null;
            return <StaticBlock key={i} block={block} index={i} />;
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={previousSection} disabled={currentSectionIndex === 0} className="cyber-btn-outline py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40">
            <ArrowLeft size={14} /> Zurück
          </button>
          <button onClick={advanceSection} className="cyber-btn py-2 text-sm flex items-center justify-center gap-1">
            Weiter <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="cyber-card p-3">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">Erklärung anpassen</div>
        <div className="flex flex-wrap gap-2">
          {[
            { style: 'intuitive', icon: Lightbulb, label: 'Einfacher' },
            { style: 'example', icon: BookOpen, label: 'Beispiel' },
            { style: 'classic', icon: HelpCircle, label: 'Warum' },
            { style: 'mnemonic', icon: MessageCircle, label: 'Merksatz' },
          ].map(({ style, icon: Icon, label }) => (
            <button
              key={style}
              onClick={() => switchStyle(style)}
              disabled={currentStyle === style || !explanationsBySection.get(currentSectionId)?.[style]}
              className="cyber-btn-outline px-3 py-2 text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Static content block ----------
function StaticBlock({ block }) {
  const speakableText = ttsTextFromBlocks([block]);
  const header = (
    <div className="flex items-start justify-end -mt-1 mb-1">
      <SpeakButton text={speakableText} label="Block vorlesen" />
    </div>
  );

  if (block.type === 'text') {
    return (
      <div>
        {header}
        <p className="text-sm text-[#c9d1d9] leading-relaxed">{block.content}</p>
      </div>
    );
  }
  if (block.type === 'diagram') {
    return (
      <div
        className="my-3 p-3 rounded-xl border border-[#00f0ff]/20 bg-[#0a1628]/60"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  }
  if (block.type === 'list') {
    return (
      <div className="my-2">
        {header}
        {block.title && <div className="text-xs font-bold text-[#00f0ff] mb-1">{block.title}</div>}
        <ul className="flex flex-col gap-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#c9d1d9]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00ff66] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (block.type === 'table') {
    return (
      <div className="my-2 overflow-x-auto">
        {header}
        <table className="min-w-full text-xs text-[#c9d1d9] border border-[#30363d]">
          <thead>
            <tr className="bg-[#0a1628]">
              {block.headers.map((h, i) => <th key={i} className="text-left p-2 border border-[#30363d]">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j} className="p-2 border border-[#30363d]">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

// ---------- Section comprehension check ----------
// Reuses a section's own inline `question` block (see
// findSectionCheckQuestion in LessonRunner) as its post-section check,
// instead of introducing a second question format. Answering immediately
// unlocks a "Weiter" that moves straight to the next section - no need to
// revisit the theory text.
function SectionCheckQuestion({ question, onContinue, answer, setAnswer, categoryId, topicId, sectionId }) {
  const key = question.id || `${sectionId}-${question.question}`;
  const { options, correct } = useMemo(() => shuffleOptions(question.options, question.correct), [question]);
  const isCorrect = answer === correct;

  function handleAnswer(index) {
    if (answer !== null) return;
    setAnswer(index);
    recordQuestionAnswer(categoryId, topicId, key, 'theory', index === correct);
  }

  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Verständnisfrage</div>
      <p className="text-sm text-white font-bold mt-2">{question.question}</p>
      {answer === null ? (
        <div className="flex flex-col gap-2 mt-3">
          {options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)} className="cyber-btn-outline w-full py-2 text-sm text-left px-3">
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-start gap-2">
            {isCorrect ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
            <p className={classNames('text-xs', isCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
              {isCorrect ? 'Richtig!' : 'Nicht ganz.'} {question.explanation}
            </p>
          </div>
          <button onClick={onContinue} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
        </>
      )}
    </div>
  );
}

// ---------- Ordering exercise ----------
function OrderingExercise({ exercise, index, onComplete }) {
  const [items, setItems] = useState(() => [...exercise.items].sort(() => Math.random() - 0.5));
  const [done, setDone] = useState(false);
  const correct = items.every((item, i) => item.id === exercise.correctOrder[i]);

  function move(pos, dir) {
    const next = pos + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    [copy[pos], copy[next]] = [copy[next], copy[pos]];
    setItems(copy);
  }

  function check() {
    setDone(true);
    if (correct) onComplete();
  }

  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Übung {index + 1} – Reihenfolge</div>
      <p className="text-sm text-white font-bold mt-1">{exercise.question}</p>
      <div className="flex flex-col gap-2 mt-3">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="flex-1 p-2 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/60 text-sm text-[#c9d1d9]">
              {item.label}
            </div>
            <button disabled={done} onClick={() => move(i, -1)} className="p-2 rounded-lg border border-[#00f0ff]/30 disabled:opacity-30"><ArrowUp size={14} /></button>
            <button disabled={done} onClick={() => move(i, 1)} className="p-2 rounded-lg border border-[#00f0ff]/30 disabled:opacity-30"><ArrowDown size={14} /></button>
          </div>
        ))}
      </div>
      {!done ? (
        <button onClick={check} className="cyber-btn w-full mt-3 py-2 text-sm">Prüfen</button>
      ) : (
        <div className="mt-3 flex items-start gap-2">
          {correct ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
          <p className={classNames('text-xs', correct ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
            {correct ? 'Richtig! ' : 'Noch nicht ganz. '} {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- Matching exercise ----------
function MatchingExercise({ exercise, index, onComplete }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches, setMatches] = useState({});
  const [done, setDone] = useState(false);
  const allMatched = exercise.pairs.every((p) => matches[p.left] === p.right);

  // Many-to-one: count how many left items should map to each right value
  const rightExpectedCount = useMemo(() => {
    const counts = {};
    for (const p of exercise.pairs) { counts[p.right] = (counts[p.right] || 0) + 1; }
    return counts;
  }, [exercise.pairs]);

  function selectLeft(item) {
    if (done || matches[item.left]) return;
    setSelectedLeft(item);
  }

  function selectRight(right) {
    if (!selectedLeft || done) return;
    const pair = exercise.pairs.find((p) => p.left === selectedLeft.left && p.right === right);
    if (pair) {
      setMatches((prev) => ({ ...prev, [selectedLeft.left]: right }));
    }
    setSelectedLeft(null);
  }

  function check() {
    setDone(true);
    if (allMatched) onComplete();
  }

  const rights = useMemo(() => {
    const set = new Set(exercise.pairs.map((p) => p.right));
    return Array.from(set).sort(() => Math.random() - 0.5);
  }, [exercise.pairs]);

  // How many left items are already matched to a given right value
  function matchedCountFor(right) {
    return Object.values(matches).filter((v) => v === right).length;
  }

  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Übung {index + 1} – Zuordnung</div>
      <p className="text-sm text-white font-bold mt-1">{exercise.question}</p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex flex-col gap-2">
          {exercise.pairs.map((p) => (
            <button
              key={p.left}
              disabled={matches[p.left] || done}
              onClick={() => selectLeft(p)}
              className={classNames(
                'p-2 rounded-lg border text-sm text-left',
                matches[p.left] ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]' : selectedLeft?.left === p.left ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-white' : 'bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9]'
              )}
            >
              {matches[p.left] && <CheckCircle2 size={14} className="inline mr-1" />}
              {p.leftLabel || p.left}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {rights.map((r) => {
            const fullyMatched = matchedCountFor(r) >= rightExpectedCount[r];
            return (
              <button
                key={r}
                disabled={done || fullyMatched}
                onClick={() => selectRight(r)}
                className={classNames(
                  'p-2 rounded-lg border text-sm text-left',
                  fullyMatched ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]' : 'bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9]'
                )}
              >
                {fullyMatched && <CheckCircle2 size={14} className="inline mr-1" />}
                {r}
                {rightExpectedCount[r] > 1 && matchedCountFor(r) > 0 && !fullyMatched && (
                  <span className="text-[9px] text-[#00f0ff] ml-1">({matchedCountFor(r)}/{rightExpectedCount[r]})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {selectedLeft && !done && (
        <p className="text-xs text-[#00f0ff] mt-2">Ausgewählt: <span className="font-bold">{selectedLeft.leftLabel || selectedLeft.left}</span> – tippe auf die passende Beschreibung.</p>
      )}
      {!done && Object.keys(matches).length === exercise.pairs.length && (
        <button onClick={check} className="cyber-btn w-full mt-3 py-2 text-sm">Prüfen</button>
      )}
      {done && (
        <div className="mt-3 flex items-start gap-2">
          {allMatched ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
          <p className={classNames('text-xs', allMatched ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
            {allMatched ? 'Richtig! ' : 'Noch nicht ganz. '} {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- Input exercise ----------
function InputExercise({ exercise, index, onComplete }) {
  const [value, setValue] = useState('');
  const [done, setDone] = useState(false);
  const normalized = String(value).trim().toLowerCase();
  const stripSlash = (s) => s.replace(/^\//, '');
  const correct = exercise.answers.some((a) => {
    const expected = String(a).trim().toLowerCase();
    if (expected === normalized) return true;
    // Accept /26 when answer is 26 and vice versa (prefix questions)
    if (/^\/?(\d+)$/.test(normalized) && /^\/?(\d+)$/.test(expected)) {
      return stripSlash(normalized) === stripSlash(expected);
    }
    return false;
  });

  function check() {
    setDone(true);
    if (correct) onComplete();
  }

  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Übung {index + 1} – Berechnung</div>
      <p className="text-sm text-white font-bold mt-1">{exercise.question}</p>
      <input
        type={exercise.numeric ? 'text' : 'text'}
        inputMode={exercise.numeric ? 'numeric' : 'text'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={done}
        placeholder={exercise.placeholder || 'Antwort eingeben...'}
        className="w-full mt-3 p-2 rounded-lg bg-[#0a1628] border border-[#00f0ff]/30 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#00f0ff]"
      />
      {!done ? (
        <button onClick={check} disabled={!normalized} className="cyber-btn w-full mt-3 py-2 text-sm disabled:opacity-40">Prüfen</button>
      ) : (
        <div className="mt-3 flex items-start gap-2">
          {correct ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
          <p className={classNames('text-xs', correct ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
            {correct ? 'Richtig! ' : 'Leider nicht. '} {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- CLI input exercise ----------
// Multi-line Cisco console input, graded line by line with abbreviation- and
// case-tolerant matching (see lib/ciscoCli.js) instead of one exact string -
// this is the primary Praxis exercise type for Cisco lessons, since the
// learner has to actively type the commands instead of just recognizing them.
function CliInputExercise({ exercise, index, onComplete }) {
  const [value, setValue] = useState('');
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);

  function check() {
    const outcome = checkCiscoInput(value, exercise.expectedLines);
    setResult(outcome);
    setDone(true);
    if (outcome.allCorrect) onComplete();
  }

  function retry() {
    setDone(false);
    setResult(null);
  }

  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Übung {index + 1} – CLI-Eingabe</div>
      <p className="text-sm text-white font-bold mt-1">{exercise.question}</p>
      {exercise.hint && <p className="text-xs text-[#8b949e] mt-1">{exercise.hint}</p>}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={done && result?.allCorrect}
        rows={Math.max(3, exercise.expectedLines.length)}
        placeholder={'Switch(config)# ...\nEinen Befehl pro Zeile eingeben'}
        spellCheck={false}
        className="w-full mt-3 p-2 rounded-lg bg-[#0a1628] border border-[#00f0ff]/30 text-sm text-[#c9d1d9] placeholder-[#8b949e] font-mono focus:outline-none focus:border-[#00f0ff]"
      />
      {!done ? (
        <button onClick={check} disabled={!value.trim()} className="cyber-btn w-full mt-3 py-2 text-sm disabled:opacity-40">Prüfen</button>
      ) : (
        <div className="mt-3">
          <div className="flex flex-col gap-1">
            {result.results.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {r.ok ? <CheckCircle2 size={14} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={14} className="text-[#ffcc00] shrink-0 mt-0.5" />}
                <span className={r.ok ? 'text-[#00ff66]' : 'text-[#ffcc00]'}>
                  {r.userLine || <span className="italic text-[#8b949e]">(fehlt)</span>}
                  {!r.ok && <span className="text-[#8b949e]"> – erwartet: {r.expected}</span>}
                </span>
              </div>
            ))}
            {result.extraLines.map((line, i) => (
              <div key={`extra-${i}`} className="flex items-start gap-2 text-xs">
                <XCircle size={14} className="text-[#ffcc00] shrink-0 mt-0.5" />
                <span className="text-[#ffcc00]">{line} <span className="text-[#8b949e]">– nicht erwartet</span></span>
              </div>
            ))}
          </div>
          <p className={classNames('text-xs mt-2', result.allCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
            {result.allCorrect ? 'Richtig! ' : 'Noch nicht ganz. '} {exercise.explanation}
          </p>
          {!result.allCorrect && (
            <button onClick={retry} className="cyber-btn-outline w-full mt-3 py-2 text-sm">Erneut versuchen</button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Select-best exercise ----------
function SelectBestExercise({ exercise, index, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const correct = selected === exercise.correct;

  function answer(i) {
    if (done) return;
    setSelected(i);
    setDone(true);
    if (i === exercise.correct) onComplete();
  }

  return (
    <div className="cyber-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Übung {index + 1} – Auswahl</div>
      <p className="text-sm text-white font-bold mt-1">{exercise.question}</p>
      <div className="flex flex-col gap-2 mt-3">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            disabled={done}
            onClick={() => answer(i)}
            className={classNames(
              'w-full py-2 text-sm text-left px-3 rounded-lg border',
              done && i === exercise.correct ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]' : done && i === selected ? 'bg-[#ffcc00]/10 border-[#ffcc00]/40 text-[#ffcc00]' : 'bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9]'
            )}
          >
            {done && i === exercise.correct && <CheckCircle2 size={14} className="inline mr-1" />}
            {opt}
          </button>
        ))}
      </div>
      {done && (
        <div className="mt-3 flex items-start gap-2">
          {correct ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
          <p className={classNames('text-xs', correct ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
            {correct ? 'Richtig! ' : 'Nicht ganz. '} {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- Guided subnetting exercise ----------
function GuidedSubnettingExercise({ exercise, onComplete }) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const { ip, prefix } = exercise;
  const network = calculateNetworkId(ip, prefix);
  const broadcast = calculateBroadcast(ip, prefix);
  const firstHost = calculateFirstHost(ip, prefix);
  const lastHost = calculateLastHost(ip, prefix);
  const bounds = { lower: Number(network.split('.')[getRelevantOctet(prefix)]), upper: Number(broadcast.split('.')[getRelevantOctet(prefix)]) };
  const steps = [
    { label: 'Welches Oktett ist relevant? (1-4)', answer: String(getRelevantOctet(prefix) + 1), explanation: `/${prefix} endet im ${getRelevantOctet(prefix) + 1}. Oktett.` },
    { label: `Wie groß ist die Sprungweite im ${getRelevantOctet(prefix) + 1}. Oktett?`, answer: String(calculateJumpSize(prefix)), explanation: `Der Maskenwert im relevanten Oktett ergibt eine Sprungweite von ${calculateJumpSize(prefix)}.` },
    { label: `Zwischen welchen Blöcken liegt ${ip.split('.')[getRelevantOctet(prefix)]}? (z.B. 0-63)`, answer: `${bounds.lower}-${bounds.upper}`, explanation: `${ip.split('.')[getRelevantOctet(prefix)]} liegt im Block ${bounds.lower} bis ${bounds.upper}.` },
    { label: 'Netz-ID?', answer: network, explanation: `Der Block beginnt bei ${network}.` },
    { label: 'Broadcast?', answer: broadcast, explanation: `Der Block endet bei ${broadcast}.` },
    { label: 'Erster Host?', answer: firstHost, explanation: `Netz-ID + 1 = ${firstHost}.` },
    { label: 'Letzter Host?', answer: lastHost, explanation: `Broadcast − 1 = ${lastHost}.` },
  ];

  function submit(e) {
    e.preventDefault();
    if (done) return;
    const normalized = value.trim().replace(/\s+/g, ' ');
    const accepted = steps[step].answer.split(',').map((s) => s.trim()).filter(Boolean);
    if (accepted.some((a) => a.toLowerCase() === normalized.toLowerCase())) {
      setWrong(false);
      setValue('');
      if (step < steps.length - 1) {
        setStep((s) => s + 1);
      } else {
        setDone(true);
        onComplete();
      }
    } else {
      setWrong(true);
    }
  }

  return (
    <div className="mt-4 p-3 rounded-xl border border-[#00f0ff]/20 bg-[#0a1628]/40">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Geführte Berechnung: {ip}/{prefix}</div>
      <p className="text-sm text-white font-bold mt-2">{steps[step].label}</p>
      {!done && (
        <form onSubmit={submit} className="flex flex-col gap-2 mt-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Antwort"
            className="w-full bg-black/30 border border-[#00f0ff]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
          />
          <button type="submit" className="cyber-btn w-full py-2 text-sm">Prüfen</button>
        </form>
      )}
      {wrong && (
        <p className="text-xs text-[#ffcc00] mt-2">{steps[step].explanation}</p>
      )}
      {done && (
        <div className="mt-3 flex items-start gap-2">
          <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" />
          <p className="text-xs text-[#00ff66]">Alle Schritte korrekt – das Subnetting sitzt.</p>
        </div>
      )}
    </div>
  );
}

// ---------- Adaptive subnetting drill ----------
const DIFFICULTY_LEVELS = {
  easy: { prefixMin: 24, prefixMax: 30 },
  medium: { prefixMin: 16, prefixMax: 30 },
  hard: { prefixMin: 8, prefixMax: 30 },
};
const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

function AdaptiveSubnettingExercise({ onComplete }) {
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [current, setCurrent] = useState(() => generateUniqueSubnetProblems(1, DIFFICULTY_LEVELS.easy)[0]);
  const [answerMode, setAnswerMode] = useState('network'); // network | broadcast | firstHost | lastHost
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(false);

  const expected = answerMode === 'network' ? current.network
    : answerMode === 'broadcast' ? current.broadcast
      : answerMode === 'firstHost' ? current.firstHost
        : current.lastHost;
  const questionText = answerMode === 'network' ? `Netz-ID von ${current.ip}/${current.prefix}?`
    : answerMode === 'broadcast' ? `Broadcast von ${current.ip}/${current.prefix}?`
      : answerMode === 'firstHost' ? `Erster Host in ${current.network}/${current.prefix}?`
        : `Letzter Host in ${current.network}/${current.prefix}?`;

  function pickNextProblem(adjustDifficulty) {
    let nextIndex = difficultyIndex;
    if (adjustDifficulty === 'harder' && difficultyIndex < DIFFICULTY_ORDER.length - 1) nextIndex += 1;
    if (adjustDifficulty === 'easier' && difficultyIndex > 0) nextIndex -= 1;
    setDifficultyIndex(nextIndex);
    const level = DIFFICULTY_ORDER[nextIndex];
    const [problem] = generateUniqueSubnetProblems(1, DIFFICULTY_LEVELS[level]);
    setCurrent(problem);
  }

  function nextQuestion() {
    const modes = ['network', 'broadcast', 'firstHost', 'lastHost'];
    const nextMode = modes[Math.floor(Math.random() * modes.length)];
    setAnswerMode(nextMode);
    setInput('');
    setFeedback(null);
  }

  function submit(e) {
    e.preventDefault();
    if (done) return;
    const normalized = input.trim();
    if (normalized === expected) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setFeedback({ ok: true, text: `Richtig! ${current.ip}/${current.prefix}: Netz-ID ${current.network}, Broadcast ${current.broadcast}, Hosts ${current.firstHost} − ${current.lastHost}` });
      if (newCorrect >= 5) {
        setDone(true);
        onComplete();
      } else {
        if (wrongCount === 0) pickNextProblem('harder');
        nextQuestion();
      }
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setFeedback({ ok: false, text: `Das war noch nicht ganz richtig. Richtig wäre ${expected}. Probiere es noch einmal.` });
      if (newWrong >= 2) pickNextProblem('easier');
      setInput('');
    }
  }

  return (
    <div className="mt-4 p-3 rounded-xl border border-[#00f0ff]/20 bg-[#0a1628]/40">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8b949e]">
        <span>Adaptive Übung</span>
        <span className="text-[#00f0ff]">{DIFFICULTY_ORDER[difficultyIndex]}</span>
      </div>
      <p className="text-sm text-white font-bold mt-2">{questionText}</p>
      {!done && (
        <form onSubmit={submit} className="flex flex-col gap-2 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="IPv4-Adresse"
            className="w-full bg-black/30 border border-[#00f0ff]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
          />
          <button type="submit" className="cyber-btn w-full py-2 text-sm">Prüfen</button>
        </form>
      )}
      {feedback && (
        <div className={`mt-3 flex items-start gap-2 ${feedback.ok ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>
          {feedback.ok ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <XCircle size={16} className="shrink-0 mt-0.5" />}
          <p className="text-xs">{feedback.text}</p>
        </div>
      )}
      {done && (
        <p className="text-xs text-[#00ff66] mt-3">Gut gemacht! Die adaptive Übung ist abgeschlossen.</p>
      )}
    </div>
  );
}

// ---------- Difficulty drill with exam gating ----------
const DRILL_PHASE = { PRACTICE: 'practice', EXAM: 'exam', LEVEL_UP: 'levelUp', COMPLETE: 'complete' };
const EXAM_QUESTION_COUNT = 10;
const EXAM_PASS_THRESHOLD = 0.8;
const ADAPTIVE_CORRECT_TO_ADVANCE = 3;
const ADAPTIVE_WRONG_TO_EASE = 2;

function DifficultyDrillExercise({ exercise, categoryId, topicId, onComplete }) {
  const generator = exercise.generator || 'ipv4'; // 'ipv4' | 'subnetting'
  const genFn = generator === 'subnetting' ? generateSubnettingQuestion : generateQuestion;

  // Load persisted difficulty
  const savedProgress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
  const savedLevel = savedProgress?.difficultyLevel || 0;
  const savedExamsPassed = savedProgress?.difficultyExamsPassed || [];

  const [difficultyLevel, setDifficultyLevel] = useState(savedLevel); // 0,1,2
  const [phase, setPhase] = useState(DRILL_PHASE.PRACTICE);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [tempDifficulty, setTempDifficulty] = useState(savedLevel); // adaptive: can temporarily go down
  const [currentQ, setCurrentQ] = useState(() => genFn(DIFFICULTY_NAMES[savedLevel]));
  const [input, setInput] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [samTip, setSamTip] = useState(null);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Exam state
  const [examQuestions, setExamQuestions] = useState([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examCorrect, setExamCorrect] = useState(0);
  const [examAnswered, setExamAnswered] = useState(false);
  const [examResult, setExamResult] = useState(null); // null | 'passed' | 'failed'

  const difficultyName = DIFFICULTY_NAMES[difficultyLevel];
  const difficultyLabel = DIFFICULTY_LABELS[difficultyName];
  const tempDifficultyName = DIFFICULTY_NAMES[tempDifficulty];

  function nextPracticeQuestion() {
    setCurrentQ(genFn(DIFFICULTY_NAMES[tempDifficulty]));
    setInput('');
    setSelectedOption(null);
    setFeedback(null);
    setSamTip(null);
  }

  function handleCorrect(explanation) {
    const newCorrect = sessionCorrect + 1;
    setSessionCorrect(newCorrect);
    setTotalAnswered(t => t + 1);
    setFeedback({ ok: true, text: explanation });
    setSamTip(null);

    // Adaptive: if doing well, bump temp difficulty back up (but not above unlocked level)
    if (newCorrect >= ADAPTIVE_CORRECT_TO_ADVANCE && tempDifficulty < difficultyLevel) {
      setTempDifficulty(d => Math.min(d + 1, difficultyLevel));
      setSessionCorrect(0);
      setSessionWrong(0);
    }

    // After enough correct answers at the current level, offer exam
    if (totalAnswered + 1 >= 5 && newCorrect >= 4 && !savedExamsPassed.includes(difficultyLevel)) {
      setTimeout(() => setPhase(DRILL_PHASE.EXAM), 1500);
      const questions = generateExamQuestions(difficultyName, EXAM_QUESTION_COUNT);
      setExamQuestions(questions);
      setExamIndex(0);
      setExamCorrect(0);
      setExamAnswered(false);
      setExamResult(null);
    }
  }

  function handleWrong(explanation) {
    const newWrong = sessionWrong + 1;
    setSessionWrong(newWrong);
    setTotalAnswered(t => t + 1);
    setFeedback({ ok: false, text: explanation });
    setSamTip(getRandomTip(currentQ.tipCategory));

    // Adaptive: temporarily ease difficulty
    if (newWrong >= ADAPTIVE_WRONG_TO_EASE && tempDifficulty > 0) {
      setTempDifficulty(d => Math.max(0, d - 1));
      setSessionWrong(0);
      setSessionCorrect(0);
    }
  }

  function submitPractice(e) {
    e?.preventDefault();
    if (feedback) { nextPracticeQuestion(); return; }

    if (currentQ.type === 'select') {
      if (selectedOption === null) return;
      if (selectedOption === currentQ.correct) {
        handleCorrect(currentQ.explanation);
      } else {
        handleWrong(currentQ.explanation);
      }
    } else {
      const userAnswer = input.trim();
      if (!userAnswer) return;
      if (checkAnswer(currentQ, userAnswer)) {
        handleCorrect(currentQ.explanation);
      } else {
        handleWrong(`Richtig wäre: ${currentQ.answer}. ${currentQ.explanation}`);
      }
    }
  }

  function submitExam(e) {
    e?.preventDefault();
    if (examAnswered) {
      // Move to next question
      if (examIndex < examQuestions.length - 1) {
        setExamIndex(i => i + 1);
        setInput('');
        setSelectedOption(null);
        setFeedback(null);
        setExamAnswered(false);
      } else {
        // Exam complete
        const score = examCorrect / examQuestions.length;
        if (score >= EXAM_PASS_THRESHOLD) {
          setExamResult('passed');
          // Persist: mark this level's exam as passed
          const newPassed = [...savedExamsPassed, difficultyLevel].filter((v, i, a) => a.indexOf(v) === i);
          const newLevel = Math.min(difficultyLevel + 1, 2);
          updateTopicProgress(categoryId, topicId, {
            difficultyLevel: newLevel,
            difficultyExamsPassed: newPassed,
          });
          if (newLevel <= 2 && difficultyLevel < 2) {
            setDifficultyLevel(newLevel);
            setTempDifficulty(newLevel);
            setTimeout(() => setPhase(DRILL_PHASE.LEVEL_UP), 1500);
          } else {
            // All levels complete
            setTimeout(() => { setPhase(DRILL_PHASE.COMPLETE); onComplete(); }, 1500);
          }
        } else {
          setExamResult('failed');
        }
      }
      return;
    }

    const q = examQuestions[examIndex];
    if (q.type === 'select') {
      if (selectedOption === null) return;
      if (selectedOption === q.correct) {
        setExamCorrect(c => c + 1);
        setFeedback({ ok: true, text: q.explanation });
      } else {
        setFeedback({ ok: false, text: q.explanation });
      }
    } else {
      const userAnswer = input.trim();
      if (!userAnswer) return;
      if (checkAnswer(q, userAnswer)) {
        setExamCorrect(c => c + 1);
        setFeedback({ ok: true, text: q.explanation });
      } else {
        setFeedback({ ok: false, text: `Richtig wäre: ${q.answer}. ${q.explanation}` });
      }
    }
    setExamAnswered(true);
  }

  function retryExam() {
    const questions = generateExamQuestions(difficultyName, EXAM_QUESTION_COUNT);
    setExamQuestions(questions);
    setExamIndex(0);
    setExamCorrect(0);
    setExamAnswered(false);
    setExamResult(null);
    setInput('');
    setSelectedOption(null);
    setFeedback(null);
  }

  function continuePractice() {
    setPhase(DRILL_PHASE.PRACTICE);
    setSessionCorrect(0);
    setSessionWrong(0);
    setTotalAnswered(0);
    nextPracticeQuestion();
  }

  // --- LEVEL UP screen ---
  if (phase === DRILL_PHASE.LEVEL_UP) {
    const messages = [
      'Sehr gut. Die Grundlagen sitzen. Ab jetzt bekommst du etwas anspruchsvollere Aufgaben.',
      'Jetzt wird es langsam prüfungsrelevant. Die schweren Aufgaben kommen.',
    ];
    return (
      <div className="mt-4 p-4 rounded-xl border border-[#00ff66]/30 bg-[#0a1628]/60">
        <div className="flex items-center gap-3">
          <img src={characterAsset('sam')} alt="Sam" className="h-10 w-10 rounded-full border border-[#00ff66] object-cover" />
          <div>
            <div className="text-xs text-[#00ff66]">Sam Richter</div>
            <p className="text-sm text-[#c9d1d9] mt-1">„{messages[Math.min(difficultyLevel - 1, messages.length - 1)]}"</p>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className="text-xs text-[#8b949e]">Neue Stufe: </span>
          <span className="text-sm font-bold text-[#00f0ff]">{DIFFICULTY_LABELS[DIFFICULTY_NAMES[difficultyLevel]]}</span>
        </div>
        <button onClick={continuePractice} className="cyber-btn w-full mt-4 py-2 text-sm">Weiter üben</button>
      </div>
    );
  }

  // --- COMPLETE screen ---
  if (phase === DRILL_PHASE.COMPLETE) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-[#00ff66]/30 bg-[#0a1628]/60">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={24} className="text-[#00ff66]" />
          <div>
            <p className="text-sm text-[#00ff66] font-bold">Alle Schwierigkeitsstufen gemeistert!</p>
            <p className="text-xs text-[#c9d1d9] mt-1">Du hast Leicht, Mittel und Schwer erfolgreich abgeschlossen.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- EXAM phase ---
  if (phase === DRILL_PHASE.EXAM) {
    if (examResult === 'passed') {
      return (
        <div className="mt-4 p-4 rounded-xl border border-[#00ff66]/30 bg-[#0a1628]/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#00ff66]" />
            <p className="text-sm text-[#00ff66] font-bold">Prüfung bestanden! ({examCorrect}/{examQuestions.length})</p>
          </div>
          <p className="text-xs text-[#c9d1d9] mt-2">Du hast die Stufe „{difficultyLabel}" bestanden.</p>
        </div>
      );
    }
    if (examResult === 'failed') {
      return (
        <div className="mt-4 p-4 rounded-xl border border-[#ffcc00]/30 bg-[#0a1628]/60">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-[#ffcc00]" />
            <p className="text-sm text-[#ffcc00] font-bold">Noch nicht bestanden ({examCorrect}/{examQuestions.length})</p>
          </div>
          <p className="text-xs text-[#c9d1d9] mt-2">Du brauchst mindestens {Math.ceil(EXAM_QUESTION_COUNT * EXAM_PASS_THRESHOLD)} von {EXAM_QUESTION_COUNT} richtigen Antworten.</p>
          <div className="flex gap-2 mt-3">
            <button onClick={retryExam} className="cyber-btn flex-1 py-2 text-sm">Nochmal versuchen</button>
            <button onClick={continuePractice} className="cyber-btn-outline flex-1 py-2 text-sm">Weiter üben</button>
          </div>
        </div>
      );
    }

    const q = examQuestions[examIndex];
    if (!q) return null;
    return (
      <div className="mt-4 p-4 rounded-xl border border-[#00f0ff]/30 bg-[#0a1628]/60">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8b949e]">
          <span>Prüfung – {difficultyLabel}</span>
          <span className="text-[#00f0ff]">{examIndex + 1}/{examQuestions.length}</span>
        </div>
        <p className="text-sm text-white font-bold mt-2">{q.question}</p>
        {q.type === 'select' ? (
          <div className="flex flex-col gap-2 mt-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                disabled={examAnswered}
                onClick={() => { if (!examAnswered) setSelectedOption(i); }}
                className={classNames(
                  'w-full py-2 text-sm text-left px-3 rounded-lg border',
                  examAnswered && i === q.correct ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]' :
                  examAnswered && i === selectedOption ? 'bg-[#ffcc00]/10 border-[#ffcc00]/40 text-[#ffcc00]' :
                  selectedOption === i ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-white' :
                  'bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9]'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={submitExam} className="mt-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={examAnswered}
              placeholder="Antwort eingeben"
              className="w-full bg-black/30 border border-[#00f0ff]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
            />
          </form>
        )}
        {feedback && (
          <div className={`mt-3 flex items-start gap-2 ${feedback.ok ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>
            {feedback.ok ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <XCircle size={14} className="shrink-0 mt-0.5" />}
            <p className="text-xs">{feedback.text}</p>
          </div>
        )}
        <button onClick={submitExam} className="cyber-btn w-full mt-3 py-2 text-sm">
          {examAnswered ? 'Weiter' : 'Prüfen'}
        </button>
      </div>
    );
  }

  // --- PRACTICE phase ---
  return (
    <div className="mt-4 p-4 rounded-xl border border-[#00f0ff]/20 bg-[#0a1628]/40">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8b949e]">
        <span>Übungsmodus</span>
        <span className="text-[#00f0ff]">{DIFFICULTY_LABELS[tempDifficultyName]}{tempDifficulty !== difficultyLevel ? ' (angepasst)' : ''}</span>
      </div>
      <div className="mt-1 flex gap-1">
        {DIFFICULTY_NAMES.map((name, i) => (
          <div key={name} className={classNames('h-1 flex-1 rounded-full', i <= difficultyLevel ? 'bg-[#00f0ff]' : 'bg-[#8b949e]/30')} />
        ))}
      </div>
      <p className="text-sm text-white font-bold mt-3">{currentQ.question}</p>

      {currentQ.type === 'select' ? (
        <div className="flex flex-col gap-2 mt-3">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              disabled={!!feedback}
              onClick={() => { if (!feedback) setSelectedOption(i); }}
              className={classNames(
                'w-full py-2 text-sm text-left px-3 rounded-lg border',
                feedback && i === currentQ.correct ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]' :
                feedback && i === selectedOption ? 'bg-[#ffcc00]/10 border-[#ffcc00]/40 text-[#ffcc00]' :
                selectedOption === i ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-white' :
                'bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9]'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={submitPractice} className="mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!!feedback}
            placeholder="Antwort eingeben"
            className="w-full bg-black/30 border border-[#00f0ff]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
          />
        </form>
      )}

      {samTip && (
        <div className="mt-3 flex items-start gap-2 text-[#00f0ff]">
          <Lightbulb size={14} className="shrink-0 mt-0.5" />
          <p className="text-xs italic">Sam: „{samTip}"</p>
        </div>
      )}

      {feedback && (
        <div className={`mt-3 flex items-start gap-2 ${feedback.ok ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>
          {feedback.ok ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <XCircle size={14} className="shrink-0 mt-0.5" />}
          <p className="text-xs">{feedback.text}</p>
        </div>
      )}

      <button onClick={submitPractice} className="cyber-btn w-full mt-3 py-2 text-sm">
        {feedback ? 'Nächste Aufgabe' : 'Prüfen'}
      </button>

      {totalAnswered >= 5 && sessionCorrect >= 4 && !savedExamsPassed.includes(difficultyLevel) && !feedback && (
        <button
          onClick={() => {
            const questions = generateExamQuestions(difficultyName, EXAM_QUESTION_COUNT);
            setExamQuestions(questions);
            setExamIndex(0);
            setExamCorrect(0);
            setExamAnswered(false);
            setExamResult(null);
            setInput('');
            setSelectedOption(null);
            setFeedback(null);
            setPhase(DRILL_PHASE.EXAM);
          }}
          className="cyber-btn-outline w-full mt-2 py-2 text-sm"
        >
          Zur Prüfung ({difficultyLabel})
        </button>
      )}

      {savedExamsPassed.includes(difficultyLevel) && difficultyLevel >= 2 && (
        <button onClick={onComplete} className="cyber-btn w-full mt-3 py-2 text-sm">Übung abschließen</button>
      )}
    </div>
  );
}

// Picks `count` random, non-repeating questions from `pool` (or the whole
// pool if it's smaller than `count`). Re-rolled once per mount via useMemo,
// so every practice/interview run gets a different combination.
function pickRandomQuestions(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const tagged = shuffled.filter((question) => question.facet);
  if (!tagged.length) return shuffled.slice(0, Math.min(count, shuffled.length));
  const selected = [];
  const usedFacets = new Set();
  for (const question of tagged) {
    if (usedFacets.has(question.facet)) continue;
    selected.push(question);
    usedFacets.add(question.facet);
    if (selected.length === count) return selected;
  }
  for (const question of shuffled) {
    if (selected.includes(question)) continue;
    selected.push(question);
    if (selected.length === count) break;
  }
  return selected;
}

// ---------- Praxis (practice quiz) ----------
// No theory, no exercises - just `PRACTICE_QUESTION_COUNT` random questions
// drawn from the lesson's full pool (quiz + inline theory questions, via the
// same collectQuestionsFromLesson used by the Themencheck). A fresh random
// subset is picked every time this mounts, so repeated practice runs feel
// varied instead of always asking the same five questions.
function PracticeQuiz({ lesson, categoryId, topicId, onDone }) {
  // The pool mixes classic multiple-choice questions with Cisco CLI-input
  // tasks (lesson.cliTasks) so Praxis for Cisco lessons is dominated by
  // actively typing commands rather than just recognizing them - see
  // collectCliTasksFromLesson in academyThemencheck.js. This pool is used
  // ONLY here and in FachgespraechRunner, never in Themencheck/Abschlusscheck,
  // which stay pure multiple-choice.
  const pool = useMemo(() => [
    ...collectQuestionsFromLesson(lesson, topicId),
    ...collectCliTasksFromLesson(lesson, topicId),
  ], [lesson, topicId]);
  const questions = useMemo(() => pickRandomQuestions(pool, PRACTICE_QUESTION_COUNT), [pool]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [finished, setFinished] = useState(false);
  const resultRecordedRef = useRef(false);
  const question = questions[index];
  const isCliQuestion = question?.type === 'cli';
  const shuffled = useMemo(() => (question && !isCliQuestion ? shuffleOptions(question.options, question.correct) : null), [question, isCliQuestion]);

  useEffect(() => {
    if (!finished || resultRecordedRef.current || questions.length === 0) return;
    const correct = Object.values(results).filter(Boolean).length;
    recordQuizResult(categoryId, topicId, { total: questions.length, correct });
    resultRecordedRef.current = true;
  }, [finished, results, categoryId, topicId, questions.length]);

  function answer(i) {
    if (answers[index] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [index]: i }));
    const isCorrect = i === shuffled.correct;
    setResults((prev) => ({ ...prev, [index]: isCorrect }));
    recordQuestionAnswer(categoryId, topicId, `practice-${index}`, 'retention', isCorrect);
  }

  function answerCli(outcome) {
    if (answers[index] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [index]: outcome }));
    setResults((prev) => ({ ...prev, [index]: outcome.allCorrect }));
    recordQuestionAnswer(categoryId, topicId, `practice-${index}`, 'retention', outcome.allCorrect);
  }

  function next() {
    if (index + 1 >= questions.length) setFinished(true);
    else setIndex((i) => i + 1);
  }

  if (questions.length === 0) {
    return (
      <div className="cyber-card p-4">
        <p className="text-sm text-[#c9d1d9]">Für dieses Thema gibt es noch keinen Übungsfragenpool.</p>
        <button onClick={onDone} className="cyber-btn w-full mt-3 py-2 text-sm">Zurück</button>
      </div>
    );
  }

  if (finished) {
    const correct = Object.values(results).filter(Boolean).length;
    return (
      <div className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Praxis abgeschlossen</div>
        <p className="text-sm text-white font-bold mt-2">{correct} von {questions.length} richtig</p>
        <p className="text-xs text-[#8b949e] mt-1">Jede Runde stellt eine neue, zufällige Auswahl aus dem Fragenpool zusammen - probier es gern noch einmal.</p>
        <button onClick={onDone} className="cyber-btn w-full mt-3 py-2 text-sm">Fertig</button>
      </div>
    );
  }

  const answered = answers[index];
  if (isCliQuestion) {
    return (
      <div className="flex flex-col gap-4">
        <div className="cyber-card p-3">
          <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">⌨️ Praxis · Aufgabe {index + 1} von {questions.length}</div>
        </div>
        <CliTaskCard task={question} answered={answered} onAnswer={answerCli} onNext={next} />
      </div>
    );
  }
  const isCorrect = answered === shuffled.correct;
  return (
    <div className="flex flex-col gap-4">
      <div className="cyber-card p-3">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">🧠 Praxis · Frage {index + 1} von {questions.length}</div>
      </div>
      <div className="cyber-card p-4">
        <p className="text-sm text-white font-bold">{question.question}</p>
        {answered === undefined ? (
          <div className="flex flex-col gap-2 mt-3">
            {shuffled.options.map((opt, i) => (
              <button key={i} onClick={() => answer(i)} className="cyber-btn-outline w-full py-2 text-sm text-left px-3">{opt}</button>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-start gap-2">
              {isCorrect ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
              <p className={classNames('text-xs', isCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
                {isCorrect ? 'Richtig!' : 'Nicht ganz.'} {question.explanation}
              </p>
            </div>
            <button onClick={next} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
          </>
        )}
      </div>
    </div>
  );
}

// Shared CLI task card used by both Praxis (PracticeQuiz) and Fachgespräch
// (FachgespraechRunner) for lesson.cliTasks entries - a multi-line console
// input graded with the same abbreviation-/case-tolerant logic as the
// theory-mode "cli-input" exercise (see lib/ciscoCli.js).
function CliTaskCard({ task, answered, onAnswer, onNext, showQuestion = true }) {
  const [value, setValue] = useState('');

  function submit() {
    if (answered !== undefined) return;
    onAnswer(checkCiscoInput(value, task.expectedLines));
  }

  return (
    <div className="cyber-card p-4">
      {showQuestion && <p className="text-sm text-white font-bold">{task.question}</p>}
      {task.hint && <p className="text-xs text-[#8b949e] mt-1">{task.hint}</p>}
      {answered === undefined ? (
        <>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={Math.max(3, task.expectedLines.length)}
            placeholder={'Switch(config)# ...\nEinen Befehl pro Zeile eingeben'}
            spellCheck={false}
            className="w-full mt-3 p-2 rounded-lg bg-[#0a1628] border border-[#00f0ff]/30 text-sm text-[#c9d1d9] placeholder-[#8b949e] font-mono focus:outline-none focus:border-[#00f0ff]"
          />
          <button onClick={submit} disabled={!value.trim()} className="cyber-btn w-full mt-3 py-2 text-sm disabled:opacity-40">Eingeben</button>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1 mt-3">
            {answered.results.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {r.ok ? <CheckCircle2 size={14} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={14} className="text-[#ffcc00] shrink-0 mt-0.5" />}
                <span className={r.ok ? 'text-[#00ff66]' : 'text-[#ffcc00]'}>
                  {r.userLine || <span className="italic text-[#8b949e]">(fehlt)</span>}
                  {!r.ok && <span className="text-[#8b949e]"> – erwartet: {r.expected}</span>}
                </span>
              </div>
            ))}
          </div>
          <p className={classNames('text-xs mt-3', answered.allCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
            {answered.allCorrect ? 'Richtig! ' : 'Nicht ganz. '} {task.explanation}
          </p>
          <button onClick={onNext} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
        </>
      )}
    </div>
  );
}

// ---------- Fachgespräch (simulated oral exam) ----------
// Same question pool as Praxis, but presented as a spoken Sam dialogue
// instead of a plain quiz card - Sam "asks" the question and reacts
// in-character, matching how the rest of the app's Sam dialogues read.
const FACHGESPRAECH_INTROS = [
  'Lass uns das Ganze mal im Gespräch durchgehen - erklär mir einfach, was du weißt.',
  'Stell dir vor, das hier ist ein kurzes Fachgespräch. Ich frage, du antwortest - ganz entspannt.',
  'Kleines Fachgespräch zwischendurch. Keine Sorge, das ist keine Prüfung mit Punktabzug.',
];
const FACHGESPRAECH_CORRECT_REACTIONS = [
  'Genau, so hätte ich das auch erklärt.',
  'Richtig. Man merkt, dass du dich damit beschäftigt hast.',
  'Gut erklärt.',
];
const FACHGESPRAECH_INCORRECT_REACTIONS = [
  'Fast - lass es mich kurz einordnen:',
  'Nicht ganz, aber das ist ein guter Ansatzpunkt:',
  'Da würde ich widersprechen. Schau mal:',
];

function FachgespraechRunner({ lesson, categoryId, topicId, onDone }) {
  const portrait = characterAsset('sam');
  // Same combined pool as PracticeQuiz (multiple-choice + Cisco CLI tasks) -
  // Sam should regularly ask for a full configuration during the oral exam,
  // not only knowledge questions (see collectCliTasksFromLesson).
  const pool = useMemo(() => [
    ...collectQuestionsFromLesson(lesson, topicId),
    ...collectCliTasksFromLesson(lesson, topicId),
  ], [lesson, topicId]);
  const questions = useMemo(() => pickRandomQuestions(pool, INTERVIEW_QUESTION_COUNT), [pool]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [results, setResults] = useState({});
  const [finished, setFinished] = useState(false);
  const resultRecordedRef = useRef(false);
  const question = questions[index];
  const isCliQuestion = question?.type === 'cli';
  const shuffled = useMemo(() => (question && !isCliQuestion ? shuffleOptions(question.options, question.correct) : null), [question, isCliQuestion]);
  const reaction = useMemo(() => {
    const pickFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return { intro: pickFrom(FACHGESPRAECH_INTROS), correct: pickFrom(FACHGESPRAECH_CORRECT_REACTIONS), incorrect: pickFrom(FACHGESPRAECH_INCORRECT_REACTIONS) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!finished || resultRecordedRef.current || questions.length === 0) return;
    const correct = Object.values(results).filter(Boolean).length;
    recordQuizResult(categoryId, topicId, { total: questions.length, correct });
    resultRecordedRef.current = true;
  }, [finished, results, categoryId, topicId, questions.length]);

  function respond(i) {
    if (answer !== null) return;
    setAnswer(i);
    const isCorrect = i === shuffled.correct;
    setResults((prev) => ({ ...prev, [index]: isCorrect }));
    recordQuestionAnswer(categoryId, topicId, `interview-${index}`, 'retention', isCorrect);
  }

  function respondCli(outcome) {
    if (answer !== null) return;
    setAnswer(outcome);
    setResults((prev) => ({ ...prev, [index]: outcome.allCorrect }));
    recordQuestionAnswer(categoryId, topicId, `interview-${index}`, 'retention', outcome.allCorrect);
  }

  function next() {
    setAnswer(null);
    if (index + 1 >= questions.length) setFinished(true);
    else setIndex((i) => i + 1);
  }

  if (questions.length === 0) {
    return (
      <div className="cyber-card p-4">
        <p className="text-sm text-[#c9d1d9]">Für dieses Thema gibt es noch keinen Fragenpool für ein Fachgespräch.</p>
        <button onClick={onDone} className="cyber-btn w-full mt-3 py-2 text-sm">Zurück</button>
      </div>
    );
  }

  if (finished) {
    const correct = Object.values(results).filter(Boolean).length;
    return (
      <div className="cyber-card p-4">
        <div className="flex items-center gap-3">
          {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00ff66] object-cover" /> : null}
          <div>
            <div className="text-xs text-[#00ff66]">Sam Richter</div>
            <p className="text-sm text-[#c9d1d9] mt-1">„Gutes Gespräch. {correct} von {questions.length} Antworten haben direkt gepasst.“</p>
          </div>
        </div>
        <button onClick={onDone} className="cyber-btn w-full mt-4 py-2 text-sm">Fertig</button>
      </div>
    );
  }

  if (isCliQuestion) {
    return (
      <div className="flex flex-col gap-4">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-3">
            {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
            <div>
              <div className="text-xs text-[#00f0ff]">Sam Richter · 🎤 Fachgespräch</div>
              <p className="text-[10px] text-[#8b949e]">Aufgabe {index + 1} von {questions.length}</p>
            </div>
          </div>
          <p className="text-sm text-[#c9d1d9] mt-3">„{index === 0 ? `${reaction.intro} ` : ''}{question.question}“</p>
        </div>
        <CliTaskCard task={question} answered={answer === null ? undefined : answer} onAnswer={respondCli} onNext={next} showQuestion={false} />
      </div>
    );
  }

  const isCorrect = answer === shuffled.correct;
  return (
    <div className="flex flex-col gap-4">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-3">
          {portrait ? <img src={portrait} alt="Sam" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
          <div>
            <div className="text-xs text-[#00f0ff]">Sam Richter · 🎤 Fachgespräch</div>
            <p className="text-[10px] text-[#8b949e]">Frage {index + 1} von {questions.length}</p>
          </div>
        </div>
        <p className="text-sm text-[#c9d1d9] mt-3">„{index === 0 ? `${reaction.intro} ` : ''}{question.question}“</p>
      </div>
      <div className="cyber-card p-4">
        {answer === null ? (
          <div className="flex flex-col gap-2">
            {shuffled.options.map((opt, i) => (
              <button key={i} onClick={() => respond(i)} className="cyber-btn-outline w-full py-2 text-sm text-left px-3">{opt}</button>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              {isCorrect ? <CheckCircle2 size={16} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#ffcc00] shrink-0 mt-0.5" />}
              <p className={classNames('text-sm', isCorrect ? 'text-[#00ff66]' : 'text-[#ffcc00]')}>
                „{isCorrect ? reaction.correct : reaction.incorrect}“ {!isCorrect && question.explanation}
              </p>
            </div>
            <button onClick={next} className="cyber-btn w-full mt-3 py-2 text-sm">Weiter</button>
          </>
        )}
      </div>
    </div>
  );
}
