import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Paperclip, Clock } from 'lucide-react';
import { readEmails, markEmailRead } from '../lib/emails';
import { questPath } from '../lib/questRouter';
import { registerMission, updateMissionStatus, getMissionEntry, MissionStatus } from '../lib/missionLog';
import { readGameState } from '../lib/gameState';
import { isCiscoSideMission } from '../lib/ciscoSideMissions';
import { isMainMission } from '../lib/missionV2';
import { isProceduralMissionId, instanceIdFromMissionId, getInstance } from '../lib/missionGenerator';

const priorityBadge = {
  urgent: 'text-[#ff3355] border-[#ff3355]',
  high: 'text-[#ffcc00] border-[#ffcc00]',
  normal: 'text-[#8b949e] border-[#30363d]',
};

export default function EmailApp({ onClose }) {
  const navigate = useNavigate();
  const [emails, setEmails] = useState(readEmails);
  const [selected, setSelected] = useState(null);
  const active = selected ? emails.find((e) => e.id === selected) : null;

  function openEmail(id) {
    setSelected(id);
    setEmails(markEmailRead(id));
  }

  function missionPath(email) {
    if (isProceduralMissionId(email.linkedMissionId)) return `/procedural-mission/${encodeURIComponent(instanceIdFromMissionId(email.linkedMissionId))}`;
    if (isMainMission(email.linkedMissionId)) return `/mission/${encodeURIComponent(email.linkedMissionId)}`;
    if (isCiscoSideMission(email.linkedMissionId)) return `/side-mission/${encodeURIComponent(email.linkedMissionId)}`;
    return questPath(email.linkedMissionId);
  }

  function startMission(email) {
    if (email.linkedMissionId) {
      if (!isProceduralMissionId(email.linkedMissionId)) {
        registerMission({ instanceId: `email-${email.id}`, questId: email.linkedMissionId, source: 'email', title: email.subject });
        updateMissionStatus(`email-${email.id}`, MissionStatus.ACCEPTED);
      }
      navigate(missionPath(email));
      if (onClose) onClose();
    }
  }

  function emailCompleted(email) {
    if (!email.linkedMissionId) return false;
    if (isProceduralMissionId(email.linkedMissionId)) {
      const instance = getInstance(instanceIdFromMissionId(email.linkedMissionId));
      return instance?.status === 'completed';
    }
    const state = readGameState();
    if (state.completedQuests.includes(email.linkedMissionId)) return true;
    if (state.completedCiscoSideMissions?.includes(email.linkedMissionId)) return true;
    const entry = getMissionEntry(`email-${email.id}`);
    return entry?.status === MissionStatus.COMPLETED;
  }

  if (active) {
    return (
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelected(null)} className="p-2 rounded border border-[#30363d] text-[#8b949e]"><ArrowLeft size={18} /></button>
          <span className="text-xs text-[#8b949e]">Zurück zur Post</span>
        </div>
        <div className="cyber-card p-4 flex-1 min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between text-xs">
            <span className={`border rounded px-2 py-0.5 ${priorityBadge[active.priority]}`}>{active.priority.toUpperCase()}</span>
            <span className="text-[#8b949e]"><Clock size={12} className="inline mr-1" />{new Date(active.date).toLocaleString('de-DE')}</span>
          </div>
          <h3 className="font-bold text-white mt-3">{active.subject}</h3>
          <div className="text-xs text-[#00f0ff] mt-1">Von: {active.from.name} · {active.from.role}</div>
          <div className="text-xs text-[#8b949e] mt-1">An: {active.to.join(', ')}</div>
          {active.attachments.length > 0 && <div className="mt-2 flex gap-2 text-xs text-[#ffcc00]">{active.attachments.map((a) => <span key={a.name} className="flex items-center gap-1"><Paperclip size={12} />{a.name}</span>)}</div>}
          <div className="mt-4 text-sm text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">{active.body}</div>
          {active.linkedMissionId && !emailCompleted(active) && <button onClick={() => startMission(active)} className="cyber-btn w-full mt-4">Einsatz &uuml;bernehmen</button>}
          {active.linkedMissionId && emailCompleted(active) && <div className="mt-4 flex items-center gap-2 text-[#00ff66] text-sm font-bold"><CheckCircle size={16} /> Erledigt</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#00f0ff]"><Mail size={20} /><h2 className="font-bold">NEXUS Mail</h2></div>
        <span className="text-xs text-[#8b949e]">{emails.filter((e) => !e.read).length} ungelesen</span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto">
        {emails.map((email) => {
          const done = emailCompleted(email);
          return (
            <button key={email.id} onClick={() => openEmail(email.id)} className={`cyber-card p-3 text-left ${done ? 'opacity-60' : email.read ? 'opacity-80' : 'border-l-4 border-[#00f0ff]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{email.from.name}</span>
                <div className="flex items-center gap-2">
                  {done && <CheckCircle size={13} className="text-[#00ff66]" />}
                  <span className={`text-[10px] border rounded px-1.5 py-0.5 ${priorityBadge[email.priority]}`}>{email.priority.toUpperCase()}</span>
                </div>
              </div>
              <div className="text-xs text-[#c9d1d9] mt-1 truncate">{email.subject}</div>
              <div className="text-[10px] text-[#8b949e] mt-1 truncate">{email.body.slice(0, 60)}&hellip;</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
