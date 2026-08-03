import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Mail, Monitor, Phone, XCircle } from 'lucide-react';
import { inboxMission, resolveSideMission } from '../lib/sideMissionEngine';
import { recordAnswer } from '../lib/competency';
import { objectiveById } from '../lib/learningObjectives';
import { playQuizFeedback } from '../lib/sound';
import GlossaryText from '../components/GlossaryText';
import ContextHint from '../components/ContextHint';
import { characterAsset } from '../lib/rpgAssets';
import { getOrderedOptions } from '../lib/shuffleOptions';
import { updateMissionStatus, MissionStatus } from '../lib/missionLog';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

const channelIcon = { phone: Phone, mail: Mail, monitor: Monitor };

export default function SideMission() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  useAppBack();
  const mission = inboxMission(missionId);
  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const startedAt = useRef(Date.now());
  if (!mission) return <div className="py-10 text-center text-[#ff3355]">Diese Meldung ist nicht mehr verfügbar.</div>;
  const objective = objectiveById(mission.objectiveId);
  const variant = mission.variant;
  const Icon = channelIcon[mission.channel] || Mail;
  const variantOptions = variant.type === 'explain' ? [] : getOrderedOptions(variant.options.map((label) => ({ label, correct: label === variant.answer })), mission.id);

  function submit() {
    if (answer === null || answer === '') return;
    let correct;
    let feedback;
    if (variant.type === 'explain') {
      const normalized = String(answer).toLowerCase();
      const matched = variant.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
      correct = matched.length >= Math.min(2, variant.keywords.length);
      feedback = correct ? 'Fachlich gut erklärt. Du hast Ursache und Zusammenhang verständlich gemacht.' : `Gute Richtung. Eine vollständige Erklärung sollte diese Begriffe verbinden: ${variant.keywords.join(', ')}.`;
    } else {
      const selectedOption = variantOptions.find((option) => option.id === answer);
      correct = selectedOption?.correct || false;
      feedback = correct ? variant.explanation : `Richtige Einordnung: ${variant.answer}. ${variant.explanation}`;
    }
    playQuizFeedback(correct);
    recordAnswer({ question: { id: mission.id, question: variant.prompt, answer: variant.answer || variant.sample, difficulty: 2, type: variant.type === 'explain' ? 'free' : 'scenario', topic: mission.topic, misconception: objective?.id }, module: { title: objective?.title }, correct, elapsedMs: Date.now() - startedAt.current, confidence: 2, mode: 'side-mission' });
    resolveSideMission(mission.id, correct);
    updateMissionStatus(mission.id, MissionStatus.COMPLETED);
    setResult({ correct, feedback });
  }

  return <div className="flex flex-col gap-4 py-2">
    <BackBar label="Arbeitsplatz" />
    <ContextHint id="first-side-mission" title="Bekannter Fall, neuer Kontext">Diese Nebenmission führt kein neues Thema ein. Sie prüft, ob du bereits gelerntes Wissen auch später und in einer anderen Situation anwenden kannst.</ContextHint>
    <div className="cyber-card p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#00f0ff]"><Icon size={19} /><span className="text-xs uppercase tracking-widest">{mission.channel === 'phone' ? 'Eingehender Anruf' : mission.channel === 'mail' ? 'E-Mail' : 'Systemmeldung'}</span></div><span className={`text-xs font-bold ${mission.priority === 'P1' ? 'text-[#ff3355]' : mission.priority === 'P2' ? 'text-[#ffcc00]' : 'text-[#8b949e]'}`}>{mission.priority}</span></div><div className="mt-3 flex items-center gap-3">{mission.channel !== 'monitor' && <img src={characterAsset(mission.personId) || characterAsset('sam')} alt={mission.personName} className="h-14 w-14 rounded-full border border-[#00f0ff] object-cover" />}<div><h2 className="font-bold text-white">{mission.personName}</h2><p className="text-xs text-[#8b949e]">{mission.personRole}</p></div></div></div>
    <div className="cyber-card p-4"><div className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">Bekanntes Wissen praktisch anwenden</div>{mission.personIntro && <p className="text-xs text-[#00f0ff] italic mb-2">{mission.personIntro}</p>}<GlossaryText as="h3" className="font-bold text-white leading-relaxed">{variant.prompt}</GlossaryText>
      {variant.type === 'explain' ? <textarea value={answer || ''} disabled={Boolean(result)} onChange={(event) => setAnswer(event.target.value)} rows="5" className="cyber-input mt-4" placeholder="Erkläre es so, wie du es einem Kollegen sagen würdest…" /> : <div className="flex flex-col gap-2 mt-4">{variantOptions.map((option) => <button key={option.id} disabled={Boolean(result)} onClick={() => setAnswer(option.id)} className={`text-left p-3 rounded border text-sm ${answer === option.id ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#c9d1d9]'}`}><GlossaryText>{option.label}</GlossaryText></button>)}</div>}
      {result && <div className={`mt-4 p-3 rounded border ${result.correct ? 'border-[#00ff66]' : 'border-[#ffcc00]'}`}><div className={`flex items-center gap-2 font-bold ${result.correct ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>{result.correct ? <CheckCircle size={17} /> : <XCircle size={17} />}{result.correct ? 'Problem sauber gelöst' : 'Lernpunkt erkannt'}</div><GlossaryText as="p" className="text-sm text-[#c9d1d9] mt-2">{result.feedback}</GlossaryText>{variant.type === 'explain' && <div className="mt-3 text-xs text-[#8b949e]"><span className="text-[#00ff00]">Beispielantwort:</span> <GlossaryText>{variant.sample}</GlossaryText></div>}</div>}
      {!result ? <button onClick={submit} disabled={answer === null || answer === ''} className="cyber-btn w-full mt-4">Antwort senden</button> : <button onClick={() => navigate('/inbox')} className="cyber-btn w-full mt-4">Zurück zum Eingang</button>}
    </div>
  </div>;
}
