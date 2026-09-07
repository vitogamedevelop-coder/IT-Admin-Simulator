import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Star, ArrowRight, BookOpen, RotateCcw, Clock, HelpCircle } from 'lucide-react';
import { ACADEMY_CATEGORIES, findTopic, topicsForCategory } from '../lib/academyTopics';
import {
  generateThemencheck, generateAbschlusscheck, getGrade, getSamComment,
  getSamRecommendation, getCategorySummary, saveThemencheckResult,
  getLastErrors, getThemencheckResults,
} from '../lib/academyThemencheck';
import { shuffleOptions } from '../lib/multiSelectQuestions';
import { shuffleDragDropItems } from '../lib/dragDropQuestions';
import { createRng, makeSeed, pickOne, RNG_NAMESPACE_QUESTIONS } from '../lib/random.js';
import ThemencheckDragDrop from '../components/ThemencheckDragDrop';
import { LESSONS } from '../lib/academyLessonData';
import { topicKey } from '../lib/academyTopics';
import { characterAsset } from '../lib/rpgAssets';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';
import ThemencheckOptionList from '../components/ThemencheckOptionList';
import LearningFeedback from '../components/LearningFeedback';

// ── Intro screen ────────────────────────────────────────────────────────────
function ThemencheckIntro({ categoryId, isGlobal, onStart }) {
  const portrait = characterAsset('sam');
  const summary = isGlobal ? null : getCategorySummary(categoryId);
  const title = isGlobal ? 'Abschlusscheck' : summary?.title || '';
  const prevResults = getThemencheckResults(isGlobal ? 'global' : categoryId);
  const lastErrors = getLastErrors(isGlobal ? 'global' : categoryId);
  const estimatedMin = isGlobal ? '15–25' : `${Math.max(5, Math.round((summary?.totalQuestions || 20) * 0.5))}–${Math.max(10, Math.round((summary?.totalQuestions || 20) * 0.8))}`;

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label={isGlobal ? 'NEXUS Academy' : 'Kategorie'} />

      <div className="cyber-card p-4 text-center">
        <h2 className="font-bold text-white text-lg">{isGlobal ? 'Abschlusscheck' : `Themencheck: ${title}`}</h2>
        {!isGlobal && summary && (
          <p className="text-xs text-[#8b949e] mt-2">{summary.description}</p>
        )}
      </div>

      {!isGlobal && summary && (
        <div className="cyber-card p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#00ff66]" />
              <span className="text-[#c9d1d9]">{summary.lessonCount} Lektionen</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-[#00f0ff]" />
              <span className="text-[#c9d1d9]">{summary.totalQuestions} Fragen</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-[#ffcc00]" />
              <span className="text-[#c9d1d9]">{summary.exerciseCount} Übungen</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#8b949e]" />
              <span className="text-[#c9d1d9]">ca. {summary.estimatedMinutes} Min.</span>
            </div>
          </div>
        </div>
      )}

      <div className="cyber-card p-4">
        <div className="flex items-start gap-3">
          {portrait && <img src={portrait} alt="Sam" className="h-10 w-10 rounded-full border border-[#00f0ff] object-cover shrink-0" />}
          <div>
            <div className="text-xs text-[#00f0ff]">Sam Richter</div>
            <p className="text-sm text-[#c9d1d9] mt-1">
              {isGlobal
                ? '„Jetzt kommt der große Abschlusscheck. Ich prüfe dein Wissen über alle Kategorien hinweg. Nimm dir Zeit."'
                : '„Jetzt folgt der Themencheck. Ich überprüfe dein Wissen aus sämtlichen Bereichen dieser Kategorie."'}
            </p>
          </div>
        </div>
      </div>

      <div className="cyber-card p-4 text-center">
        <p className="text-xs text-[#8b949e] uppercase tracking-widest">Geschätzte Dauer</p>
        <p className="text-sm text-white mt-1">ca. {estimatedMin} Minuten</p>
        {!isGlobal && summary && (
          <p className="text-xs text-[#00f0ff] mt-1">{Math.min(30, Math.max(15, summary.totalQuestions))} Fragen</p>
        )}
      </div>

      {prevResults.length > 0 && (
        <div className="cyber-card p-3">
          <p className="text-xs text-[#8b949e]">
            Bisherige Versuche: {prevResults.length} · Bestes Ergebnis: {Math.max(...prevResults.map(r => r.percent))}%
          </p>
        </div>
      )}

      <button onClick={() => onStart(false)} className="cyber-btn w-full py-3 text-sm">
        Themencheck starten
      </button>

      {lastErrors.length > 0 && (
        <button onClick={() => onStart(true)} className="cyber-btn-outline w-full py-3 text-sm flex items-center justify-center gap-2">
          <RotateCcw size={14} /> Wiederhole meine Fehler ({lastErrors.length} Fragen)
        </button>
      )}
    </div>
  );
}

// ── Quiz flow ───────────────────────────────────────────────────────────────
function ThemencheckQuiz({ questions, onFinish, title }) {
  const [step, setStep] = useState(0);
  const firstType = questions[0]?.type;
  const initDrag = firstType === 'drag-drop' ? (questions[0]?.mode === 'ordering' ? [] : {}) : null;
  const initSelected = firstType === 'multi-select' ? [] : firstType === 'drag-drop' ? null : null;
  const [selected, setSelected] = useState(initSelected);
  const [dragAnswer, setDragAnswer] = useState(initDrag);
  const [confirmed, setConfirmed] = useState(false);
  const [results, setResults] = useState([]);

  const current = questions[step];
  const isMulti = current.type === 'multi-select';
  const isDrag = current.type === 'drag-drop';

  function selectOption(idx) {
    if (confirmed) return;
    if (isMulti) {
      setSelected((prev) => {
        const set = new Set(prev || []);
        if (set.has(idx)) set.delete(idx);
        else set.add(idx);
        return Array.from(set).sort((a, b) => a - b);
      });
    } else {
      setSelected(idx);
    }
  }

  function confirm() {
    if (isDrag) {
      if (current.mode === 'ordering' ? dragAnswer.length !== current.items.length : Object.keys(dragAnswer).length !== current.items.length) {
        return;
      }
    } else if (isMulti) {
      if (!selected || selected.length === 0) return;
    } else if (selected === null) {
      return;
    }
    setConfirmed(true);
    let isCorrect;
    if (isDrag) {
      if (current.mode === 'ordering') {
        isCorrect = current.correctOrder.every((id, i) => dragAnswer[i] === id);
      } else {
        isCorrect = Object.entries(current.correctMapping).every(([k, v]) => dragAnswer[k] === v);
      }
    } else if (isMulti) {
      const correctSet = new Set(current.correctIndices || []);
      const selectedSet = new Set(selected || []);
      isCorrect = correctSet.size === selectedSet.size && [...correctSet].every((i) => selectedSet.has(i));
    } else {
      isCorrect = selected === current.correct;
    }
    const newResults = [...results, {
      correct: isCorrect,
      sourceTopicId: current.sourceTopicId,
      questionText: current.question,
      selected: isDrag ? dragAnswer : isMulti ? [...(selected || [])] : selected,
      selectedIndex: isDrag ? null : isMulti ? null : selected,
    }];
    setResults(newResults);
  }

  function next() {
    if (step + 1 >= questions.length) {
      // results state already has the last answer from confirm()
      onFinish(results);
    } else {
      const nextQ = questions[step + 1];
      const nextIsMulti = nextQ?.type === 'multi-select';
      const nextIsDrag = nextQ?.type === 'drag-drop';
      setStep(s => s + 1);
      setSelected(nextIsMulti ? [] : null);
      setDragAnswer(nextIsDrag ? (nextQ.mode === 'ordering' ? [] : {}) : null);
      setConfirmed(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label={title} />
      <div className="cyber-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[#8b949e]">Frage {step + 1} von {questions.length}</span>
          <span className="text-[10px] text-[#00f0ff]">{results.filter(r => r.correct).length} richtig</span>
        </div>
        <div className="h-1 bg-[#1f2937] rounded mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="cyber-card p-4">
        <p className="text-sm text-white font-bold">{current.question}</p>
        {isMulti && (
          <p className="text-xs text-[#ffcc00] mt-2 flex items-center gap-1">
            <HelpCircle size={12} /> Mehrere Antworten können richtig sein.
          </p>
        )}
        <div className="flex flex-col gap-2 mt-3">
          {isDrag ? (
            <ThemencheckDragDrop
              question={current}
              answer={dragAnswer}
              onAnswer={setDragAnswer}
              confirmed={confirmed}
            />
          ) : (
            <ThemencheckOptionList
              options={current.options}
              selected={selected}
              onSelect={selectOption}
              correct={current.correct}
              correctIndices={current.correctIndices}
              submitted={confirmed}
              multi={isMulti}
            />
          )}
        </div>

        {confirmed && current.explanation && (
          <div className="mt-3">
            <LearningFeedback
              status={results[step]?.correct ? 'correct' : 'incorrect'}
              explanation={current.explanation}
            />
          </div>
        )}

        <div className="mt-4">
          {!confirmed ? (
            <button
              onClick={confirm}
              disabled={isDrag
                ? (current.mode === 'ordering'
                  ? (dragAnswer || []).length !== current.items.length
                  : Object.keys(dragAnswer || {}).length !== current.items.length)
                : isMulti
                  ? (selected || []).length === 0
                  : selected === null}
              className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
            >
              Antwort bestätigen
            </button>
          ) : (
            <button onClick={next} className="cyber-btn w-full py-2 text-sm flex items-center justify-center gap-2">
              {step + 1 >= questions.length ? 'Auswertung' : 'Nächste Frage'} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Results screen ──────────────────────────────────────────────────────────
function ThemencheckResults({ results, isGlobal, savedResult, onBack, onRetry }) {
  const navigate = useNavigate();
  const portrait = characterAsset('sam');

  const correctCount = results.filter(r => r.correct).length;
  const percent = Math.round((correctCount / results.length) * 100);
  const grade = getGrade(percent);
  const comment = getSamComment(percent);

  // Group results by topic
  const topicStats = {};
  for (const r of results) {
    if (!topicStats[r.sourceTopicId]) topicStats[r.sourceTopicId] = { correct: 0, wrong: 0 };
    if (r.correct) topicStats[r.sourceTopicId].correct++;
    else topicStats[r.sourceTopicId].wrong++;
  }

  const strengths = Object.entries(topicStats)
    .filter(([, s]) => s.wrong === 0 && s.correct > 0)
    .map(([id]) => id);

  const weaknesses = Object.entries(topicStats)
    .filter(([, s]) => s.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong);

  function getTopicTitle(topicId) {
    // Try to find in any category
    for (const cat of ACADEMY_CATEGORIES) {
      const t = findTopic(cat.categoryId, topicId);
      if (t) return t.title;
    }
    return topicId;
  }

  const wrongQuestions = results.filter(r => !r.correct);

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label={isGlobal ? 'NEXUS Academy' : 'Kategorie'} />

      {/* Score */}
      <div className="cyber-card p-4 text-center">
        <p className="text-3xl font-bold text-white">{percent} %</p>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={20} className={i <= grade.stars ? 'text-[#ffcc00] fill-[#ffcc00]' : 'text-[#30363d]'} />
          ))}
        </div>
        <p className="text-sm text-[#00f0ff] mt-1">{grade.label}</p>
        <p className="text-xs text-[#8b949e] mt-1">{correctCount} von {results.length} richtig</p>
        {savedResult && savedResult.durationMs && (
          <p className="text-xs text-[#8b949e] mt-1">Dauer: {Math.round(savedResult.durationMs / 60000)} Min.</p>
        )}
      </div>

      {/* Sam comment */}
      <div className="cyber-card p-4">
        <div className="flex items-start gap-3">
          {portrait && <img src={portrait} alt="Sam" className="h-10 w-10 rounded-full border border-[#00f0ff] object-cover shrink-0" />}
          <div>
            <div className="text-xs text-[#00f0ff]">Sam Richter</div>
            <p className="text-sm text-[#c9d1d9] mt-1">„{comment}"</p>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="cyber-card p-4">
          <p className="text-xs text-[#00ff66] uppercase tracking-widest font-bold">Stärken</p>
          <div className="flex flex-col gap-1 mt-2">
            {strengths.map(id => (
              <div key={id} className="flex items-center gap-2 text-sm text-[#c9d1d9]">
                <CheckCircle2 size={14} className="text-[#00ff66] shrink-0" />
                {getTopicTitle(id)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses with recommendations */}
      {weaknesses.length > 0 && (
        <div className="cyber-card p-4">
          <p className="text-xs text-[#ffcc00] uppercase tracking-widest font-bold">Verbesserungsbedarf</p>
          <div className="flex flex-col gap-3 mt-2">
            {weaknesses.map(([topicId, stats]) => (
              <div key={topicId}>
                <div className="flex items-center gap-2 text-sm text-[#c9d1d9]">
                  <XCircle size={14} className="text-[#ff3355] shrink-0" />
                  <span className="font-bold">{getTopicTitle(topicId)}</span>
                  <span className="text-xs text-[#8b949e]">({stats.wrong} {stats.wrong === 1 ? 'Fehler' : 'Fehler'})</span>
                </div>
                {/* Sam recommendation */}
                <p className="text-xs text-[#8b949e] mt-1 ml-6 italic">
                  {getSamRecommendation(topicId, stats.wrong)}
                </p>
                {/* Action links */}
                <div className="flex gap-2 mt-1 ml-6">
                  {(() => {
                    // Find the category for this topic
                    for (const cat of ACADEMY_CATEGORIES) {
                      const t = findTopic(cat.categoryId, topicId);
                      if (t) {
                        return (
                          <button
                            onClick={() => navigate(`/academy/${cat.categoryId}/${topicId}`)}
                            className="text-xs text-[#00f0ff] underline"
                          >
                            Kapitel öffnen
                          </button>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retry errors */}
      {wrongQuestions.length > 0 && (
        <button onClick={onRetry} className="cyber-btn-outline w-full py-3 text-sm flex items-center justify-center gap-2">
          <RotateCcw size={14} /> Wiederhole meine Fehler ({wrongQuestions.length} Fragen)
        </button>
      )}

      <button onClick={onBack} className="cyber-btn w-full py-3 text-sm">
        Zurück
      </button>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function AcademyThemencheck() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  useAppBack();

  const isGlobal = categoryId === 'global';
  const effectiveCategoryId = isGlobal ? 'global' : categoryId;
  const category = isGlobal ? null : ACADEMY_CATEGORIES.find(c => c.categoryId === categoryId);
  const title = isGlobal ? 'Abschlusscheck' : `Themencheck: ${category?.title || ''}`;

  const [phase, setPhase] = useState('intro'); // intro | quiz | results
  const [questions, setQuestions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [savedResult, setSavedResult] = useState(null);
  const startTimeRef = useRef(null);

  function startQuiz(retryOnly) {
    const rng = createRng(makeSeed({
      subsystem: RNG_NAMESPACE_QUESTIONS,
      category: effectiveCategoryId,
      nonce: Date.now(),
    }));
    let raw;
    if (retryOnly) {
      // Load error questions from last attempt and find matching full questions
      const errorTexts = getLastErrors(effectiveCategoryId);
      const errorSet = new Set(errorTexts.map(e => e.question));
      // Collect full question objects from lessons
      const allQuestions = [];
      const topics = isGlobal
        ? ACADEMY_CATEGORIES.flatMap(c => topicsForCategory(c.categoryId))
        : topicsForCategory(categoryId);
      for (const topic of topics) {
        const key = topicKey(topic.categoryId, topic.topicId);
        const lesson = LESSONS[key];
        if (!lesson) continue;
        const pool = collectQuestionsFromLesson(lesson, topic.topicId);
        allQuestions.push(...pool);
      }
      // Match by question text (or grab similar ones from same topic if exact match not found)
      raw = allQuestions.filter(q => errorSet.has(q.question));
      // If some questions weren't found (e.g. text changed), add alternatives from same topics
      if (raw.length < errorTexts.length) {
        const missingTopics = errorTexts
          .filter(e => !raw.some(q => q.question === e.question))
          .map(e => e.sourceTopicId);
        for (const tid of [...new Set(missingTopics)]) {
          const alternatives = allQuestions
            .filter(q => q.sourceTopicId === tid && !raw.some(r => r.question === q.question));
          if (alternatives.length > 0) raw.push(pickOne(rng, alternatives));
        }
      }
    } else {
      raw = isGlobal ? generateAbschlusscheck() : generateThemencheck(categoryId);
    }

    if (raw.length === 0) return;
    setQuestions(raw.map((q) => (q.type === 'drag-drop' ? shuffleDragDropItems(q, rng) : shuffleOptions(q, rng))));
    startTimeRef.current = Date.now();
    setPhase('quiz');
  }

  function handleFinish(results) {
    const finishedAt = Date.now();
    // Save result
    const saved = saveThemencheckResult(effectiveCategoryId, {
      questions: questions.map(q => ({
        question: q.question,
        sourceTopicId: q.sourceTopicId,
        correct: q.correct,
      })),
      answers: results,
      startedAt: startTimeRef.current,
      finishedAt,
    });
    setSavedResult(saved);
    setQuizResults(results);
    setPhase('results');
  }

  function handleRetry() {
    startQuiz(true);
  }

  if (phase === 'intro') {
    return (
      <ThemencheckIntro
        categoryId={categoryId}
        isGlobal={isGlobal}
        onStart={startQuiz}
        onRetry={() => startQuiz(true)}
      />
    );
  }

  if (phase === 'quiz') {
    if (questions.length === 0) {
      return (
        <div className="flex flex-col gap-4 py-2">
          <BackBar label="Kategorie" />
          <div className="cyber-card p-4 text-sm text-[#8b949e]">Noch keine Fragen verfügbar.</div>
        </div>
      );
    }
    return (
      <ThemencheckQuiz
        questions={questions}
        onFinish={handleFinish}
        title={title}
      />
    );
  }

  // results phase
  return (
    <ThemencheckResults
      results={quizResults}
      isGlobal={isGlobal}
      savedResult={savedResult}
      onBack={() => navigate(-1)}
      onRetry={handleRetry}
    />
  );
}
