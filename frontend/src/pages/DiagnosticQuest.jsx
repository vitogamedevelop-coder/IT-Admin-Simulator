import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, CheckSquare, Clock, Eye, Lightbulb, MessageCircle, Shield, Target } from 'lucide-react';
import { diagnosticQuestById } from '../lib/diagnosticQuestData';
import { createDiagnosticState, executeAction, setHypothesis, canAdvancePhase, advancePhase, consumeSamHint, getSamHint, buildReflection } from '../lib/diagnosticState';
import { completeQuest, setActiveQuest } from '../lib/gameState';
import { questById } from '../lib/questData';
import { recordAnswer, saveSession } from '../lib/competency';
import { playQuizFeedback } from '../lib/sound';
import { storyAsset } from '../lib/rpgAssets';
import GlossaryText from '../components/GlossaryText';
import DifficultyFeedback from '../components/DifficultyFeedback';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

export default function DiagnosticQuest() {
  const { questId } = useParams();
  const navigate = useNavigate();
  useAppBack();
  const quest = diagnosticQuestById(questId);
  const legacyQuest = questById(questId);
  const [started, setStarted] = useState(false);
  const [state, setState] = useState(() => quest ? createDiagnosticState(quest) : null);
  const [lastAction, setLastAction] = useState(null);
  const [showTerminal, setShowTerminal] = useState(null);
  const [samHint, setSamHint] = useState(null);
  const [showFacts, setShowFacts] = useState(false);
  const [reflection, setReflection] = useState(null);
  const saved = useRef(false);

  if (!quest) return <div className="py-10 text-center text-[#ff3355]">Einsatz nicht gefunden.</div>;

  const currentPhase = quest.phases.find((p) => p.id === state.phase);
  const canAdvance = canAdvancePhase(state, quest);
  const samLevel = state.samHintsUsed[state.phase] || 0;
  const cover = storyAsset(quest.id);

  function begin() {
    setActiveQuest(quest.id);
    setState(createDiagnosticState(quest));
    setStarted(true);
  }

  function handleAction(action) {
    if (state.completedActions.includes(action.id)) return;
    const nextState = executeAction(state, quest, action.id);
    setState(nextState);
    setLastAction(action);
    setSamHint(null);
    if (action.terminalOutput) {
      setShowTerminal(action.terminalOutput);
    } else {
      setShowTerminal(null);
    }
    playQuizFeedback(action.optimal);
    recordAnswer({
      question: { id: `${quest.id}-${state.phase}-${action.id}`, question: currentPhase.prompt, answer: action.label, difficulty: quest.difficulty, type: 'scenario', topic: quest.department, misconception: state.phase },
      module: { title: quest.department }, correct: action.optimal, elapsedMs: Date.now() - state.phaseStartedAt, confidence: 2, mode: 'quest',
    });
  }

  function handleHypothesis(hypId) {
    const nextState = setHypothesis(state, quest, hypId);
    setState(nextState);
    setLastAction(null);
    setSamHint(null);
    const correct = currentPhase.correctHypothesis === hypId;
    playQuizFeedback(correct);
  }

  function handleAdvance() {
    const nextState = advancePhase(state, quest);
    setState(nextState);
    setLastAction(null);
    setShowTerminal(null);
    setSamHint(null);
    if (nextState.finished) {
      finishQuest(nextState);
    }
  }

  function handleSam() {
    const result = consumeSamHint(state);
    setState(result.state);
    const hint = getSamHint(quest, state.phase, result.level);
    setSamHint({ text: hint, level: result.level });
  }

  function finishQuest(finalState) {
    const ref = buildReflection(finalState, quest);
    setReflection(ref);
    if (!saved.current && legacyQuest) {
      const xp = 40 + ref.optimalCount * 15 + (quest.boss ? 80 : 0);
      completeQuest(legacyQuest, { xp, reputation: {} });
      saveSession({ type: 'quest', title: quest.title, questions: finalState.actionLog.length, correct: ref.optimalCount, minutes: ref.totalMinutes });
      // Save enriched knowledge entry
      const gameState = JSON.parse(localStorage.getItem('it-learn:rpg-state-v1') || '{}');
      if (quest.knowledgeEntry && gameState.runbooks) {
        const existing = gameState.runbooks.find((r) => r.id === quest.knowledgeEntry.id);
        if (!existing) {
          gameState.runbooks.push({
            id: quest.knowledgeEntry.id,
            title: quest.knowledgeEntry.title,
            category: quest.knowledgeEntry.category,
            symptom: quest.knowledgeEntry.symptoms.join(' | '),
            cause: quest.knowledgeEntry.takeaway,
            steps: quest.knowledgeEntry.process,
            mistakes: [],
            tools: quest.knowledgeEntry.tools,
            createdAt: Date.now(),
          });
          localStorage.setItem('it-learn:rpg-state-v1', JSON.stringify(gameState));
        }
      }
      saved.current = true;
    }
  }

  // === BRIEFING SCREEN ===
  if (!started) return (
    <div className="flex flex-col gap-4 py-2">
      {cover && <div className="cyber-card overflow-hidden"><img src={cover} alt={quest.title} className="h-40 w-full object-cover" /></div>}
      <div className={`cyber-card p-5 border-l-4 ${quest.boss ? 'border-[#ff3355]' : 'border-[#00f0ff]'}`}>
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#8b949e]">
          <span>Kapitel {quest.chapter} &middot; {quest.department}</span>
          {quest.boss && <span className="text-[#ff3355]">Kritischer Vorfall</span>}
        </div>
        <h2 className="text-xl text-white font-bold mt-2">{quest.title}</h2>
        <p className="text-sm text-[#00f0ff] mt-1">{quest.subtitle}</p>
        <p className="text-sm text-[#c9d1d9] leading-relaxed mt-4 whitespace-pre-line">{quest.briefing}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-[#8b949e]">
          <span>{quest.phases.length} Phasen</span>
          <span className="flex items-center gap-1"><Clock size={13} /> ca. {quest.minutes} Minuten</span>
        </div>
      </div>
      <div className="cyber-card p-4 text-xs text-[#8b949e]">
        Du untersuchst das Problem Schritt f&uuml;r Schritt. Es gibt keine verlorenen Leben. Jede Entscheidung liefert Feedback und hilft beim Lernen.
      </div>
      <button onClick={begin} className="cyber-btn w-full">Fall &uuml;bernehmen</button>
    </div>
  );

  // === REFLECTION / FINISHED SCREEN ===
  if (state.finished && reflection) return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Shield size={50} className="text-[#00ff66]" />
        <h2 className="text-lg font-bold text-white">St&ouml;rung behoben</h2>
        <p className="text-sm text-[#c9d1d9]">{quest.resolution}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="cyber-card p-3 text-center"><div className="text-lg text-[#00ff66] font-bold">{reflection.optimalCount}/{reflection.totalActions}</div><div className="text-[9px] text-[#8b949e]">optimale Schritte</div></div>
        <div className="cyber-card p-3 text-center"><div className="text-lg text-[#00f0ff] font-bold">{reflection.totalMinutes} min</div><div className="text-[9px] text-[#8b949e]">Diagnosezeit</div></div>
        <div className="cyber-card p-3 text-center"><div className="text-lg text-[#ffcc00] font-bold">{reflection.samHintsUsed}</div><div className="text-[9px] text-[#8b949e]">Sam-Hinweise</div></div>
      </div>

      {/* Dynamic reflection */}
      <div className="cyber-card p-4">
        <div className="text-xs font-bold text-[#00f0ff] mb-3">Reflexion</div>
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <span className="text-[#8b949e] text-xs block mb-1">Deine Hypothese</span>
            <span className="text-white">{reflection.hypothesisText}</span>
          </div>
          <div>
            <span className="text-[#8b949e] text-xs block mb-1">Entscheidende Information</span>
            <span className="text-white">{reflection.decisiveInfo}</span>
          </div>
          <div>
            <span className="text-[#8b949e] text-xs block mb-1">Unn&ouml;tige Schritte</span>
            <span className="text-white">{reflection.unnecessaryText}</span>
          </div>
          {!reflection.verified && (
            <div className="text-xs text-[#ffcc00] bg-[#ffcc00]/10 p-2 rounded">
              Du hast die L&ouml;sung nicht vollst&auml;ndig verifiziert. Denke daran: Eine &Auml;nderung ist noch kein Beweis.
            </div>
          )}
          <div className="border-t border-[#1f2937] pt-3">
            <span className="text-[#ffcc00] text-xs block mb-1">Merksatz</span>
            <span className="text-white font-medium">{reflection.takeaway}</span>
          </div>
        </div>
      </div>

      {/* Knowledge entry preview */}
      {quest.knowledgeEntry && (
        <div className="cyber-card p-4">
          <div className="text-xs font-bold text-[#00ff66] mb-2">Neuer Wissenseintrag freigeschaltet</div>
          <div className="text-sm text-white font-medium">{quest.knowledgeEntry.title}</div>
          <div className="text-xs text-[#8b949e] mt-1">Verf&uuml;gbar in deiner Wissensbibliothek unter {quest.knowledgeEntry.category}.</div>
        </div>
      )}

      <DifficultyFeedback onSubmit={(rating) => { localStorage.setItem(`it-learn:difficulty:${quest.id}`, rating); }} />
      <button onClick={() => navigate('/')} className="cyber-btn w-full">Zur&uuml;ck zum Arbeitsplatz</button>
    </div>
  );

  // === MAIN INVESTIGATION UI ===
  return (
    <div className="flex flex-col gap-3 py-2">
      <BackBar label="Arbeitsplatz" />
      {/* Progress header */}
      <div className="cyber-card p-3">
        <div className="flex justify-between text-xs text-[#8b949e]">
          <span>{quest.title}</span>
          <span>Phase {quest.phases.indexOf(currentPhase) + 1}/{quest.phases.length}</span>
        </div>
        <div className="h-1.5 bg-[#1f2937] rounded mt-2">
          <div className="h-full bg-[#00ff66] rounded transition-all" style={{ width: `${(quest.phases.indexOf(currentPhase) / quest.phases.length) * 100}%` }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="cyber-card p-3">
        <div className="text-[10px] uppercase tracking-widest text-[#00f0ff] mb-2">Diagnose-Fortschritt</div>
        <div className="flex flex-col gap-1.5">
          {quest.checklist.map((item) => {
            const done = state.completedChecklist.includes(item.id);
            return (
              <div key={item.id} className={`flex items-center gap-2 text-xs ${done ? 'text-[#00ff66]' : 'text-[#8b949e]'}`}>
                {done ? <CheckSquare size={13} className="text-[#00ff66] shrink-0" /> : <div className="h-3.5 w-3.5 rounded border border-[#30363d] shrink-0" />}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Known facts (collapsible) */}
      <button onClick={() => setShowFacts(!showFacts)} className="cyber-card p-3 text-left w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00f0ff]">
            <Eye size={13} /> Bekannte Informationen
          </div>
          <span className="text-xs text-[#8b949e]">{showFacts ? '▲' : '▼'}</span>
        </div>
        {showFacts && (
          <div className="flex flex-col gap-1.5 mt-3">
            {Object.entries(quest.factLabels).map(([key, label]) => {
              const value = state.facts[key];
              return (
                <div key={key} className="flex justify-between text-xs gap-2">
                  <span className="text-[#8b949e] shrink-0">{label}:</span>
                  <span className={`text-right ${value === null ? 'text-[#8b949e] italic' : 'text-white'}`}>
                    {value === null ? 'Noch unbekannt' : value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </button>

      {/* Hypothesis display (when set) */}
      {state.selectedHypothesis && !currentPhase?.isHypothesisPhase && (
        <div className="cyber-card p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#ffcc00] mb-1">
            <Target size={13} /> Aktuelle Hypothese
          </div>
          <div className="text-sm text-white">{quest.hypotheses.find((h) => h.id === state.selectedHypothesis)?.label}</div>
        </div>
      )}

      {/* Phase content */}
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00f0ff] mb-3">
          {currentPhase.title}
        </div>
        <p className="text-sm text-white leading-relaxed whitespace-pre-line mb-4">{currentPhase.prompt}</p>

        {/* Terminal output */}
        {showTerminal && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-[#30363d] bg-black p-3 text-xs text-[#00ff66] mb-4">{showTerminal}</pre>
        )}

        {/* Actions */}
        {currentPhase.actions && !currentPhase.isHypothesisPhase && (
          <div className="flex flex-col gap-2">
            {currentPhase.actions.map((action) => {
              const done = state.completedActions.includes(action.id);
              const isLast = lastAction?.id === action.id;
              return (
                <button
                  key={action.id}
                  disabled={done}
                  onClick={() => handleAction(action)}
                  className={`text-left p-3 rounded border text-sm transition-colors ${
                    isLast ? (action.optimal ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]' : 'border-[#ffcc00] bg-[#ffcc00]/10 text-[#ffcc00]')
                    : done ? 'border-[#1f2937] text-[#8b949e]'
                    : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00f0ff]'
                  }`}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Hypothesis selection */}
        {currentPhase.isHypothesisPhase && (
          <div className="flex flex-col gap-2">
            {quest.hypotheses.map((hyp) => {
              const selected = state.selectedHypothesis === hyp.id;
              const isCorrect = currentPhase.correctHypothesis === hyp.id;
              return (
                <button
                  key={hyp.id}
                  disabled={state.selectedHypothesis != null}
                  onClick={() => handleHypothesis(hyp.id)}
                  className={`text-left p-3 rounded border text-sm transition-colors ${
                    selected ? (isCorrect ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]' : 'border-[#ffcc00] bg-[#ffcc00]/10 text-[#ffcc00]')
                    : state.selectedHypothesis != null ? 'border-[#1f2937] text-[#8b949e]'
                    : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00f0ff]'
                  }`}
                >
                  <GlossaryText>{hyp.label}</GlossaryText>
                </button>
              );
            })}
          </div>
        )}

        {/* Action feedback */}
        {lastAction && lastAction.feedback && (
          <div className={`mt-3 p-3 rounded border text-sm ${lastAction.optimal ? 'border-[#00ff66]/50 bg-[#00ff66]/5 text-[#c9d1d9]' : 'border-[#ffcc00]/50 bg-[#ffcc00]/5 text-[#c9d1d9]'}`}>
            <div className={`flex items-center gap-2 font-bold text-xs mb-1 ${lastAction.optimal ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>
              {lastAction.optimal ? <><CheckCircle size={14} /> Guter Schritt</> : <><Lightbulb size={14} /> Denkanstoß</>}
            </div>
            {lastAction.feedback}
          </div>
        )}

        {/* Hypothesis feedback */}
        {currentPhase.isHypothesisPhase && state.selectedHypothesis && currentPhase.hypothesisFeedback && (
          <div className={`mt-3 p-3 rounded border text-sm ${currentPhase.correctHypothesis === state.selectedHypothesis ? 'border-[#00ff66]/50 bg-[#00ff66]/5' : 'border-[#ffcc00]/50 bg-[#ffcc00]/5'} text-[#c9d1d9]`}>
            {currentPhase.hypothesisFeedback[state.selectedHypothesis]}
          </div>
        )}

        {/* Sam mentor button */}
        {samLevel < 3 && !state.finished && (
          <button onClick={handleSam} className="mt-3 flex items-center gap-2 text-xs text-[#ffcc00] hover:text-[#ffe066] transition-colors">
            <MessageCircle size={14} /> {samLevel === 0 ? 'Mit Sam sprechen' : 'Sam erneut fragen'}
          </button>
        )}

        {/* Sam hint display */}
        {samHint && (
          <div className="mt-3 p-3 rounded border border-[#00f0ff] bg-[#00f0ff]/5">
            <div className="flex items-center gap-2 text-xs text-[#00f0ff] font-bold mb-1">
              <MessageCircle size={13} />
              Sam {samHint.level === 1 ? '(Denkfrage)' : samHint.level === 2 ? '(Hinweis)' : '(konkreter Tipp)'}
            </div>
            <p className="text-sm text-[#c9d1d9]">{samHint.text}</p>
          </div>
        )}

        {/* Advance button */}
        {canAdvance && !state.finished && (
          <button onClick={handleAdvance} className="cyber-btn w-full mt-4">
            {currentPhase.nextPhase ? `Weiter: ${quest.phases.find((p) => p.id === currentPhase.nextPhase)?.title || 'Nächste Phase'}` : 'Diagnose abschließen'}
          </button>
        )}
      </div>
    </div>
  );
}
