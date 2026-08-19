import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, XCircle, MessageCircle, User, GraduationCap, RotateCcw,
} from 'lucide-react';
import { characterAsset } from '../lib/rpgAssets';
import { evaluateEmployeeAnswer, advanceConversation, getConversationSummary } from '../lib/employeeConversations';
import { speakAs } from '../lib/speechSynthesis';
import ConversationOrdering from './ConversationOrdering';
import ConversationMatching from './ConversationMatching';

function openAcademyTopic(categoryId, topicId) {
  const path = `/academy/${categoryId}/${topicId}`;
  window.location.href = path;
}

function ConversationMc({ question, disabled, onAnswer }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [question.instanceId]);

  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt) => (
        <button
          key={opt.id}
          disabled={disabled}
          onClick={() => !disabled && setSelected(opt.id)}
          className={`text-left p-2.5 rounded-lg border text-sm transition-all ${
            selected === opt.id
              ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#c9d1d9]'
              : 'border-[#30363d] bg-[#0d1117]/60 text-[#c9d1d9] hover:bg-[#21262d]'
          }`}>
          {opt.label}
        </button>
      ))}
      {!disabled && (
        <button
          disabled={selected === null}
          onClick={() => onAnswer(selected)}
          className="cyber-btn w-full mt-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          Antworten
        </button>
      )}
    </div>
  );
}

export default function EmployeeConversation({ conversation: initialConversation, onComplete }) {
  const [conversation, setConversation] = useState(initialConversation);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    setConversation(initialConversation);
    setSubmitted(false);
    setResult(null);
    setSummary(null);
  }, [initialConversation]);

  const { employee, question, intro, transition } = conversation;
  const personPortrait = characterAsset(employee.id);

  useEffect(() => {
    const conversationText = question.conversationText || (transition ? `${transition} „${question.text}“` : `„${intro}“ Und zwar: „${question.text}“`);
    speakAs(`${employee.name}: ${conversationText}`, { speakerId: employee.id, speechText: conversationText });
  }, [employee, intro, transition, question.instanceId, question.text, question.conversationText]);

  useEffect(() => {
    if (submitted && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [submitted]);

  function handleAnswer(answer) {
    const evaluation = evaluateEmployeeAnswer(conversation, answer);
    setResult(evaluation);
    setSubmitted(true);

    speakAs(evaluation.employeeReaction, { speakerId: employee.id, speechText: evaluation.employeeReaction });
    if (!evaluation.correct) {
      const samText = `${evaluation.samStageDirection} ${evaluation.samExplanation}`;
      setTimeout(() => {
        speakAs(samText, { speakerId: 'sam', speechText: samText.replace(/^[^.]+\.\s*/, '') });
      }, 1200);
    }
  }

  function handleContinue() {
    const next = advanceConversation(conversation);
    if (next.state === 'summary') {
      setSummary(getConversationSummary(conversation));
      const bye = pickGoodbye();
      speakAs(bye, { speakerId: conversation.employee.id, speechText: bye });
    } else {
      setConversation({ ...next.conversation });
      setSubmitted(false);
      setResult(null);
    }
  }

  function renderQuestionInput() {
    if (question.type === 'ordering') {
      return <ConversationOrdering question={question} disabled={submitted} onAnswer={handleAnswer} />;
    }
    if (question.type === 'matching') {
      return <ConversationMatching question={question} disabled={submitted} onAnswer={handleAnswer} />;
    }
    return <ConversationMc question={question} disabled={submitted} onAnswer={handleAnswer} />;
  }

  function pickGoodbye() {
    const pool = [
      'Danke, jetzt hab ich\'s verstanden.',
      'Ich geh jetzt besser wieder an meinen Schreibtisch.',
      'Hast mir echt geholfen, danke!',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (summary) {
    return (
      <div className="flex flex-col gap-3">
        <div className="cyber-card p-3 border border-[#00f0ff]/30">
          <div className="text-sm font-bold text-[#00f0ff]">Gespräch beendet</div>
          <div className="text-xs text-[#8b949e] mt-1">
            Fragen: {summary.total} · Richtig: {summary.correctCount} · Unsicher: {summary.incorrectCount}
          </div>
        </div>

        {summary.touchedTopics.length > 0 && (
          <div className="cyber-card p-3">
            <div className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">Berührte Themen</div>
            <ul className="space-y-1">
              {summary.touchedTopics.map((t) => (
                <li key={t.topicKey} className="text-sm text-[#c9d1d9] flex items-center justify-between">
                  <span>{t.title}</span>
                  <span className="text-xs text-[#8b949e]">{t.correct}✓ {t.incorrect}✗</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.weakTopics.length > 0 && (
          <div className="cyber-card p-3 border border-[#ff3355]/20">
            <div className="text-[10px] uppercase tracking-widest text-[#ff3355] mb-2">Noch einmal ansehen</div>
            <div className="flex flex-col gap-2">
              {summary.weakTopics.map((t) => (
                <button
                  key={t.topicKey}
                  onClick={() => openAcademyTopic(t.categoryId, t.topicId)}
                  className="text-left text-sm p-2 rounded-lg border border-[#30363d] bg-[#0d1117]/60 text-[#c9d1d9] hover:bg-[#21262d] flex items-center gap-2">
                  <GraduationCap size={14} className="text-[#00f0ff]" />
                  {t.title} in der Academy öffnen
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={onComplete} className="cyber-btn w-full py-2 text-sm">
          Zurück in den Flur
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="cyber-card p-3">
        <div className="flex items-start gap-3">
          {personPortrait ? (
            <img src={personPortrait} alt={employee.name} className="h-10 w-10 rounded-full border border-[#00f0ff]/40 object-cover shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#00f0ff]/10 flex items-center justify-center shrink-0"><User size={18} className="text-[#00f0ff]" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00f0ff]">{employee.name}</span>
              <span className="text-[10px] text-[#8b949e]">{employee.role}</span>
            </div>
            {transition && !question.conversationText && (
              <p className="text-sm text-[#8b949e] mt-1 italic">{transition}</p>
            )}
            {question.conversationText ? (
              <p className="text-sm text-[#c9d1d9] mt-1 whitespace-pre-line">
                <span className="text-[#00f0ff]/80">„{question.conversationText}“</span>
              </p>
            ) : (
              <>
                <p className="text-sm text-[#c9d1d9] mt-1 whitespace-pre-line">{intro}</p>
                <p className="text-sm text-[#c9d1d9] mt-2">
                  <span className="text-[#00f0ff]/80">„{question.text}“</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="cyber-card p-3">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-3 flex items-center gap-1">
          <MessageCircle size={12} /> Deine Antwort
        </div>
        {renderQuestionInput()}
      </div>

      {submitted && result && (
        <div ref={resultRef} className={`cyber-card p-3 border ${result.correct ? 'border-[#00ff66]/30' : 'border-[#ff3355]/30'}`}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {result.correct ? <CheckCircle size={20} className="text-[#00ff66]" /> : <XCircle size={20} className="text-[#ff3355]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#c9d1d9]">
                {result.correct ? 'Richtig!' : 'Nicht ganz.'}
                {result.scoreAwarded && <span className="ml-2 text-[10px] font-normal text-[#00ff66]">+ Wiederholungspunkte</span>}
              </div>
              <p className="text-sm text-[#c9d1d9] mt-1">{result.employeeReaction}</p>

              {result.correct && (
                <div className="mt-3 p-2.5 rounded-lg bg-[#00ff66]/5 border border-[#00ff66]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap size={14} className="text-[#00ff66]" />
                    <span className="text-xs font-bold text-[#00ff66]">Warum das stimmt</span>
                  </div>
                  <p className="text-sm text-[#c9d1d9]">{result.explanation}</p>
                </div>
              )}

              {!result.correct && (
                <>
                  <p className="text-sm text-[#8b949e] mt-2 italic">{result.samStageDirection}</p>
                  <div className="mt-3 p-2.5 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap size={14} className="text-[#00f0ff]" />
                      <span className="text-xs font-bold text-[#00f0ff]">Sam erklärt</span>
                    </div>
                    <p className="text-sm text-[#c9d1d9]">{result.samExplanation}</p>
                  </div>
                </>
              )}

              <button onClick={handleContinue} className="cyber-btn w-full mt-3 py-2 text-sm flex items-center justify-center gap-2">
                {conversation.questionIndex + 1 >= conversation.plannedLength ? 'Gespräch beenden' : 'Weiter'}
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
