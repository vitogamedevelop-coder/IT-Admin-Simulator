import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ChevronRight, GraduationCap, CheckCircle2, ClipboardCheck, BookOpen, HelpCircle, Star } from 'lucide-react';
import { findTopic, topicsForCategory, ACADEMY_CATEGORIES, TOPIC_STATUS } from '../lib/academyTopics';
import { getAllFullTopics } from '../lib/academyProgress';
import { LEARNING_MODES, readAcademyMode } from '../lib/academyMode';
import { getTopicScoreDimensions, hasLessonContent } from '../lib/academyLessonData';
import { isThemencheckAvailable, getCategorySummary, isThemencheckPassed, getBestScore } from '../lib/academyThemencheck';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

const STATUS_LABEL = {
  [TOPIC_STATUS.LOCKED]: 'Gesperrt',
  [TOPIC_STATUS.AVAILABLE]: 'Verfügbar',
  [TOPIC_STATUS.STARTED]: 'Begonnen',
  [TOPIC_STATUS.LEARNED]: 'Gelernt',
  [TOPIC_STATUS.APPLIED]: 'Angewendet',
  [TOPIC_STATUS.CONSOLIDATED]: 'Gefestigt',
};

const STATUS_COLOR = {
  [TOPIC_STATUS.LOCKED]: 'text-[#8b949e] border-[#30363d]',
  [TOPIC_STATUS.AVAILABLE]: 'text-[#00f0ff] border-[#00f0ff]/40',
  [TOPIC_STATUS.STARTED]: 'text-[#ffcc00] border-[#ffcc00]/40',
  [TOPIC_STATUS.LEARNED]: 'text-[#00ff66] border-[#00ff66]/40',
  [TOPIC_STATUS.APPLIED]: 'text-[#00ff66] border-[#00ff66]/40',
  [TOPIC_STATUS.CONSOLIDATED]: 'text-[#00ff66] border-[#00ff66]/40',
};

function ScoreBar({ label, value }) {
  const percent = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div>
      <div className="flex justify-between text-[9px] text-[#8b949e]"><span>{label}</span><span>{percent}%</span></div>
      <div className="h-1.5 bg-[#1f2937] rounded mt-0.5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AcademyCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  useAppBack();
  const [devInfoTopic, setDevInfoTopic] = useState(null);
  const category = ACADEMY_CATEGORIES.find((c) => c.categoryId === categoryId);
  const catalogTopics = topicsForCategory(categoryId);
  const fullTopics = getAllFullTopics().filter((t) => t.categoryId === categoryId);
  const mode = readAcademyMode().mode;
  const courseMode = mode === LEARNING_MODES.COURSE;
  const summary = getCategorySummary(categoryId);
  const themencheckPassed = isThemencheckPassed(categoryId);
  const bestScore = getBestScore(categoryId);

  if (!category) return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="NEXUS Academy" />
      <div className="cyber-card p-4 text-sm text-[#ff3355]">Diese Kategorie existiert nicht.</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="NEXUS Academy" />

      {/* Category header with progress */}
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] font-bold"><GraduationCap size={18} />{category.title}</div>
        <p className="text-xs text-[#8b949e] mt-2">{category.description}</p>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-[#8b949e]">
            <span>{summary.completedLessons} / {summary.lessonCount} Inhalte abgeschlossen</span>
            <span>{summary.progressPercent} %</span>
          </div>
          <div className="h-2 bg-[#1f2937] rounded mt-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded transition-all" style={{ width: `${summary.progressPercent}%` }} />
          </div>
        </div>
        {/* Compact stats row */}
        <div className="flex gap-4 mt-3 text-[10px] text-[#8b949e]">
          <span className="flex items-center gap-1"><BookOpen size={11} />{summary.lessonCount} Lektionen</span>
          <span className="flex items-center gap-1"><HelpCircle size={11} />{summary.totalQuestions} Fragen</span>
          <span className="flex items-center gap-1"><ClipboardCheck size={11} />{summary.exerciseCount} Übungen</span>
          {themencheckPassed && <span className="flex items-center gap-1 text-[#00ff66]"><Star size={11} />Check bestanden</span>}
        </div>
      </div>

      {/* Category summary: learning objectives */}
      <div className="cyber-card p-4">
        <p className="text-xs text-[#8b949e] uppercase tracking-widest font-bold">Lernziele</p>
        <p className="text-xs text-[#c9d1d9] mt-2">Nach Abschluss dieser Kategorie kannst du:</p>
        <ul className="mt-1 flex flex-col gap-0.5">
          {summary.topicNames.slice(0, 8).map(name => (
            <li key={name} className="text-xs text-[#c9d1d9] flex items-start gap-1.5">
              <CheckCircle2 size={10} className="text-[#00f0ff] mt-0.5 shrink-0" />
              {name}
            </li>
          ))}
          {summary.topicNames.length > 8 && (
            <li className="text-xs text-[#8b949e]">... und {summary.topicNames.length - 8} weitere Themen</li>
          )}
        </ul>
        <p className="text-xs text-[#8b949e] mt-2">Geschätzte Lernzeit: ca. {summary.estimatedMinutes} Minuten</p>
      </div>

      {devInfoTopic && (
        <div className="cyber-card p-4">
          <p className="text-xs text-[#8b949e]">Diese Lektion zu „{devInfoTopic}" befindet sich aktuell noch in Entwicklung.</p>
          <button onClick={() => setDevInfoTopic(null)} className="cyber-btn-outline w-full mt-2 py-1.5 text-xs">OK</button>
        </div>
      )}

      {/* Themencheck: always the first quiz-style entry in a category, right
          after the overview/learning goals and before the individual lessons
          (Milestone C5.3). Locking logic is unchanged: locked in Anfänger-Modus
          until all lessons are completed, always available in Lehrgangsmodus. */}
      {(() => {
        const available = isThemencheckAvailable(categoryId);
        return (
          <button
            disabled={!available}
            onClick={() => navigate(`/academy/themencheck/${categoryId}`)}
            className={`cyber-card p-3 text-left flex items-center gap-3 ${available ? 'border-[#00f0ff]/40 active:border-[#00f0ff]' : 'opacity-50'}`}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00f0ff]/10 border border-[#00f0ff]/20 shrink-0">
              <ClipboardCheck size={20} className="text-[#00f0ff]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">Themencheck</div>
              <div className="text-xs text-[#8b949e]">
                {available
                  ? bestScore !== null
                    ? `Bisheriges bestes Ergebnis: ${bestScore}% – erneut testen?`
                    : 'Teste dein Wissen über alle Lektionen dieser Kategorie.'
                  : 'Schließe zuerst alle Lektionen ab, um den Themencheck freizuschalten.'}
              </div>
            </div>
            {available && <ChevronRight size={18} className="text-[#8b949e] shrink-0" />}
            {!available && <Lock size={16} className="text-[#8b949e] shrink-0" />}
          </button>
        );
      })()}

      {/* Topic list */}
      <div className="flex flex-col gap-2">
        {catalogTopics.length === 0 && (
          <div className="cyber-card p-4 text-xs text-[#8b949e]">Für diese Kategorie sind noch keine Themen hinterlegt.</div>
        )}
        {fullTopics.map((topic) => {
          const locked = topic.status === TOPIC_STATUS.LOCKED;
          const effectiveLocked = locked && !courseMode;
          const isPlaceholder = !hasLessonContent(topic.categoryId, topic.topicId);
          const prereqTitles = topic.prerequisites.map((id) => findTopic(topic.categoryId, id)?.title || id);
          const dims = getTopicScoreDimensions(topic.categoryId, topic.topicId);
          const dimCount = [dims.theory, dims.practice, dims.retention].filter(Boolean).length;

          if (isPlaceholder) {
            return (
              <button key={topic.topicId}
                onClick={() => setDevInfoTopic(topic.title)}
                className="cyber-card p-3 text-left flex flex-col gap-2 opacity-50">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#8b949e] text-sm">{topic.title}</span>
                  <span className="text-[9px] uppercase tracking-widest border border-[#8b949e]/40 text-[#8b949e] rounded px-1.5 py-0.5 shrink-0">
                    Noch nicht verfügbar
                  </span>
                </div>
                {topic.description && <p className="text-xs text-[#8b949e]">{topic.description}</p>}
              </button>
            );
          }

          return (
            <button key={topic.topicId} disabled={effectiveLocked}
              onClick={() => navigate(`/academy/${categoryId}/${topic.topicId}`)}
              className={`cyber-card p-3 text-left flex flex-col gap-2 ${effectiveLocked ? 'opacity-60' : 'active:border-[#00f0ff]/40'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {effectiveLocked && <Lock size={13} className="text-[#8b949e] shrink-0" />}
                  <span className="font-bold text-white text-sm">{topic.title}</span>
                </div>
                <span className={`flex items-center gap-1 text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 shrink-0 ${STATUS_COLOR[topic.status]}`}>
                  {[TOPIC_STATUS.LEARNED, TOPIC_STATUS.APPLIED, TOPIC_STATUS.CONSOLIDATED].includes(topic.status) && <CheckCircle2 size={11} />}
                  {STATUS_LABEL[topic.status]}
                </span>
              </div>
              {topic.description && <p className="text-xs text-[#8b949e]">{topic.description}</p>}
              {effectiveLocked ? (
                <p className="text-[10px] text-[#8b949e]">Voraussetzungen: {prereqTitles.length ? prereqTitles.join(', ') : 'keine'}</p>
              ) : dimCount > 0 ? (
                <div className={`grid gap-3 mt-1 ${dimCount === 1 ? 'grid-cols-1' : dimCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {dims.theory && <ScoreBar label="Theorie" value={topic.theoryScore} />}
                  {dims.practice && <ScoreBar label="Praxis" value={topic.practiceScore} />}
                  {dims.retention && <ScoreBar label="Festigung" value={topic.retentionScore} />}
                </div>
              ) : null}
              {!effectiveLocked && <div className="flex justify-end"><ChevronRight size={16} className="text-[#8b949e]" /></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
