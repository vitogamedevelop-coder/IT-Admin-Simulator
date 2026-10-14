import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Paperclip, Clock, Inbox, ClipboardList, Play, Shield, Timer, Gauge, User, Circle } from 'lucide-react';
import {
  readEmails, markEmailRead, archiveOldCompletedEmails, sortEmailsByDelivery,
} from '../lib/emails';
import { questPath } from '../lib/questRouter';
import { registerMission, updateMissionStatus, getMissionEntry, MissionStatus } from '../lib/missionLog';
import { readGameState } from '../lib/gameState';
import { isCiscoSideMission } from '../lib/ciscoSideMissions';
import { isMainMission } from '../lib/missionV2';
import { questById } from '../lib/questData';
import { isProceduralMissionId, instanceIdFromMissionId, getInstance } from '../lib/missionGenerator';

const priorityBadge = {
  urgent: 'text-[#ff3355] border-[#ff3355]',
  high: 'text-[#ffcc00] border-[#ffcc00]',
  normal: 'text-[#8b949e] border-[#30363d]',
};

const priorityLabel = {
  urgent: 'DRINGEND',
  high: 'HOCH',
  normal: 'NORMAL',
};

function emailCompleted(email) {
  if (!email.linkedMissionId) return false;
  if (isProceduralMissionId(email.linkedMissionId)) {
    const instance = getInstance(instanceIdFromMissionId(email.linkedMissionId));
    return instance?.status === 'completed' || instance?.completedState?.completed;
  }
  const state = readGameState();
  if (state.completedQuests.includes(email.linkedMissionId)) return true;
  if (state.completedCiscoSideMissions?.includes(email.linkedMissionId)) return true;
  const entry = getMissionEntry(`email-${email.id}`);
  return entry?.status === MissionStatus.COMPLETED;
}

function missionEntryFor(email) {
  if (!email?.linkedMissionId) return null;
  if (isProceduralMissionId(email.linkedMissionId)) return getMissionEntry(instanceIdFromMissionId(email.linkedMissionId));
  return getMissionEntry(`email-${email.id}`);
}

function ticketContext(email) {
  if (!email?.linkedMissionId) return null;
  if (isProceduralMissionId(email.linkedMissionId)) {
    const instance = getInstance(instanceIdFromMissionId(email.linkedMissionId));
    return {
      kind: 'Dynamischer Einsatz',
      area: instance?.context || 'Netzwerkbetrieb',
      difficulty: instance?.difficulty || null,
      duration: null,
    };
  }
  const quest = questById(email.linkedMissionId);
  if (quest) {
    return {
      kind: isMainMission(email.linkedMissionId) ? 'Hauptmission' : 'Einsatz',
      area: quest.department || 'Netzwerk',
      difficulty: quest.difficulty || null,
      duration: quest.minutes || null,
    };
  }
  return {
    kind: isCiscoSideMission(email.linkedMissionId) ? 'Nebenmission' : 'Einsatz',
    area: 'Netzwerk',
    difficulty: null,
    duration: null,
  };
}

function InboxItem({ email, active, done, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${active ? 'border-[#00f0ff]/60 bg-[#00f0ff]/10' : done ? 'border-[#30363d] bg-[#0d1117]/50 opacity-65' : email.read ? 'border-[#30363d] bg-[#0d1117]/70 hover:border-[#8b949e]/60' : 'border-[#00f0ff]/35 bg-[#0a1628] hover:border-[#00f0ff]/70'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-white">
          {!email.read && !done && <Circle size={7} fill="currentColor" className="shrink-0 text-[#00f0ff]" />}
          <span className="truncate">{email.from.name}</span>
        </span>
        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] ${priorityBadge[email.priority] || priorityBadge.normal}`}>{priorityLabel[email.priority] || 'NORMAL'}</span>
      </div>
      <div className="mt-1.5 truncate text-xs font-medium text-[#c9d1d9]">{email.subject}</div>
      <div className="mt-1 truncate text-[10px] text-[#8b949e]">{email.body.slice(0, 72)}&hellip;</div>
      <div className="mt-2 flex items-center justify-between text-[9px] text-[#8b949e]">
        <span>{new Date(email.deliveredAt || email.date).toLocaleDateString('de-DE')}</span>
        {done && <span className="flex items-center gap-1 text-[#00ff66]"><CheckCircle size={11} /> Erledigt</span>}
      </div>
    </button>
  );
}

export default function EmailApp({ onClose }) {
  const navigate = useNavigate();
  const [emails, setEmails] = useState(readEmails);
  const [selected, setSelected] = useState(null);
  const active = selected ? emails.find((e) => e.id === selected) : null;

  // Keep the mail app sorted newest-first and hide very old completed mission
  // mails so the inbox does not grow indefinitely. Progress data is preserved
  // in the mission / game-state stores; archived mails are only UI state.
  useEffect(() => {
    archiveOldCompletedEmails(emailCompleted, 3);
    setEmails(sortEmailsByDelivery(readEmails()));
  }, []);

  const visibleEmails = useMemo(
    () => {
      const nonArchived = emails.filter((e) => !e.archived);
      const open = nonArchived
        .filter((e) => !emailCompleted(e))
        .sort((a, b) => (b.deliveredAt || b.date || 0) - (a.deliveredAt || a.date || 0));
      const completed = nonArchived
        .filter((e) => emailCompleted(e))
        .sort((a, b) => (b.deliveredAt || b.date || 0) - (a.deliveredAt || a.date || 0));
      return [...open, ...completed];
    },
    [emails],
  );

  const unreadCount = visibleEmails.filter((e) => !e.read).length;
  const openCount = visibleEmails.filter((e) => e.linkedMissionId && !emailCompleted(e)).length;
  const context = ticketContext(active);
  const missionEntry = missionEntryFor(active);
  const missionAccepted = missionEntry?.status === MissionStatus.ACCEPTED || missionEntry?.status === MissionStatus.IN_PROGRESS;

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

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <header className="flex shrink-0 items-center justify-between border-b border-[#30363d] pb-3">
        <div className="flex items-center gap-2 text-[#00f0ff]"><Mail size={20} /><div><h2 className="font-bold leading-tight">NEXUS Mail</h2><div className="text-[10px] uppercase tracking-wider text-[#8b949e]">Operations Inbox</div></div></div>
        <div className="flex items-center gap-3 text-xs text-[#8b949e]"><span>{unreadCount} ungelesen</span><span className="hidden sm:inline">{openCount} offene Einsätze</span></div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(250px,0.72fr)_minmax(420px,1.35fr)_minmax(250px,0.72fr)] lg:gap-3">
        <section className={`${active ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col rounded-xl border border-[#30363d] bg-[#080d14]/80`}>
          <div className="flex items-center justify-between border-b border-[#30363d] px-3 py-2.5">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9d1d9]"><Inbox size={14} /> Posteingang</span>
            <span className="text-[10px] text-[#8b949e]">Offen zuerst</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            {visibleEmails.length === 0 && <div className="p-4 text-center text-sm text-[#8b949e]">Keine Nachrichten. Dein Posteingang ist abgearbeitet.</div>}
            {visibleEmails.map((email) => <InboxItem key={email.id} email={email} active={selected === email.id} done={emailCompleted(email)} onOpen={() => openEmail(email.id)} />)}
          </div>
        </section>

        <section className={`${active ? 'flex' : 'hidden lg:flex'} min-h-0 flex-col rounded-xl border border-[#30363d] bg-[#0d1117]/85`}>
          {active ? (
            <>
              <div className="flex shrink-0 items-center gap-2 border-b border-[#30363d] px-3 py-2 lg:hidden">
                <button onClick={() => setSelected(null)} className="rounded border border-[#30363d] p-2 text-[#8b949e]" aria-label="Zurück zum Posteingang"><ArrowLeft size={18} /></button>
                <span className="text-xs text-[#8b949e]">Posteingang</span>
              </div>
              <article className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className={`rounded border px-2 py-0.5 ${priorityBadge[active.priority] || priorityBadge.normal}`}>{priorityLabel[active.priority] || 'NORMAL'}</span>
                  <span className="text-[#8b949e]"><Clock size={12} className="inline mr-1" />{new Date(active.deliveredAt || active.date).toLocaleString('de-DE')}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{active.subject}</h3>
                <div className="mt-3 rounded-lg border border-[#30363d] bg-[#080d14]/70 p-3 text-xs">
                  <div className="flex items-center gap-2 text-[#00f0ff]"><User size={13} /> {active.from.name} · {active.from.role}</div>
                  <div className="mt-1 text-[#8b949e]">An: {active.to.join(', ')}</div>
                </div>
                {(active.attachments || []).length > 0 && <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#ffcc00]">{active.attachments.map((a) => <span key={a.name} className="flex items-center gap-1 rounded border border-[#ffcc00]/30 px-2 py-1"><Paperclip size={12} />{a.name}</span>)}</div>}
                <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#c9d1d9]">{active.body}</div>
              </article>
              <div className="shrink-0 border-t border-[#30363d] p-3 lg:hidden">
                {active.linkedMissionId && !emailCompleted(active) && <button onClick={() => startMission(active)} className="cyber-btn flex w-full items-center justify-center gap-2"><Play size={15} /> {missionAccepted ? 'Einsatz fortsetzen' : 'Einsatz übernehmen'}</button>}
                {active.linkedMissionId && emailCompleted(active) && <div className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-[#00ff66]"><CheckCircle size={16} /> Einsatz erledigt</div>}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><Mail size={32} className="text-[#30363d]" /><div className="mt-3 font-medium text-[#c9d1d9]">Nachricht auswählen</div><p className="mt-1 max-w-xs text-xs text-[#8b949e]">Lies das Briefing, prüfe den Auftragskontext und entscheide dann, welchen Einsatz du übernimmst.</p></div>
          )}
        </section>

        <aside className="hidden min-h-0 flex-col rounded-xl border border-[#30363d] bg-[#080d14]/80 lg:flex">
          <div className="border-b border-[#30363d] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#c9d1d9]">Auftragskontext</div>
          {active ? (
            <div className="flex flex-1 flex-col overflow-y-auto p-4">
              {context ? (
                <>
                  <div className="rounded-lg border border-[#00f0ff]/25 bg-[#00f0ff]/5 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#00f0ff]"><ClipboardList size={14} /> {context.kind}</div>
                    <div className="mt-2 text-sm font-medium text-white">{active.subject}</div>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-[#8b949e]"><Shield size={14} /> Bereich</dt><dd className="text-right text-[#c9d1d9]">{context.area}</dd></div>
                    {context.duration && <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-[#8b949e]"><Timer size={14} /> Richtwert</dt><dd className="text-[#c9d1d9]">{context.duration} Min.</dd></div>}
                    {context.difficulty && <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-[#8b949e]"><Gauge size={14} /> Schwierigkeit</dt><dd className="text-[#c9d1d9]">Stufe {context.difficulty}</dd></div>}
                  </dl>
                  <div className="mt-5 rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#8b949e]">Nächster Schritt</div>
                    <p className="mt-1 text-xs leading-relaxed text-[#c9d1d9]">Briefing lesen, Auftrag übernehmen und den geforderten Systemzustand im Einsatz herstellen und verifizieren.</p>
                  </div>
                  <div className="mt-auto pt-4">
                    {!emailCompleted(active) ? <button onClick={() => startMission(active)} className="cyber-btn flex w-full items-center justify-center gap-2 py-3"><Play size={15} /> {missionAccepted ? 'Einsatz fortsetzen' : 'Einsatz übernehmen'}</button> : <div className="flex items-center justify-center gap-2 rounded-lg border border-[#00ff66]/30 bg-[#00ff66]/10 py-3 text-sm font-bold text-[#00ff66]"><CheckCircle size={16} /> Einsatz erledigt</div>}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center"><Mail size={28} className="text-[#30363d]" /><p className="mt-3 text-sm text-[#8b949e]">Diese Nachricht enthält Informationen, aber keinen direkten Einsatz.</p></div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-5 text-center"><ClipboardList size={28} className="text-[#30363d]" /><p className="mt-3 text-sm text-[#8b949e]">Wähle eine Nachricht, um Priorität, Bereich und nächsten Schritt zu sehen.</p></div>
          )}
        </aside>
      </div>
    </div>
  );
}
