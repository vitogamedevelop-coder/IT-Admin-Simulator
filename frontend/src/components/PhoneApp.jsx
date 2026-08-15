import { useState } from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DialogView from './DialogView';
import { readNotifications, acknowledge, notificationTypes } from '../lib/notificationSystem';
import { colleagues } from '../lib/officeWorld';
import { createDialog } from '../lib/dialogSystem';
import { isProceduralMissionId, instanceIdFromMissionId } from '../lib/missionGenerator';

function pendingPhoneCalls() {
  return readNotifications().filter(
    (n) => n.type === notificationTypes.PHONE && !n.dismissed && !n.acknowledged,
  );
}

function buildCallDialog(notification) {
  const person = colleagues.find((c) => c.id === notification.source?.personId) || { name: 'Unbekannt', role: '' };
  return {
    dialog: createDialog({
      id: `phone-call-${notification.id}`,
      personId: notification.source?.personId,
      mode: 'phone',
      nodes: [
        { id: 'start', text: notification.body, options: [
          { label: 'Annehmen', nextId: 'accept' },
          { label: 'Ablehnen', nextId: 'decline' },
        ]},
        { id: 'accept', text: 'Ich kümmere mich sofort drum.', onComplete: { action: 'accept' } },
        { id: 'decline', text: 'Vielleicht später.', onComplete: { action: 'close' } },
      ],
      entryNode: 'start',
    }),
    person,
    notification,
  };
}

export default function PhoneApp({ onClose }) {
  const navigate = useNavigate();
  const [calls] = useState(() => pendingPhoneCalls());
  const [activeCall, setActiveCall] = useState(null);

  function acceptCall(notification) {
    acknowledge(notification.id);
    if (notification.linkedMissionId) {
      const path = isProceduralMissionId(notification.linkedMissionId)
        ? `/procedural-mission/${encodeURIComponent(instanceIdFromMissionId(notification.linkedMissionId))}`
        : `/side-mission/${encodeURIComponent(notification.linkedMissionId)}`;
      navigate(path);
      if (onClose) onClose();
    } else {
      setActiveCall(null);
    }
  }

  if (activeCall) {
    return (
      <div className="h-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveCall(null); }} className="p-2 rounded border border-[#30363d] text-[#8b949e]"><ArrowLeft size={18} /></button>
          <span className="text-xs text-[#8b949e]">Anrufliste</span>
        </div>
        <DialogView
          dialog={activeCall.dialog}
          person={activeCall.person}
          onComplete={(node) => {
            if (node?.onComplete?.action === 'accept') {
              acceptCall(activeCall.notification);
            } else {
              setActiveCall(null);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 text-[#00f0ff]"><Phone size={20} /><h2 className="font-bold">Telefon</h2></div>
      <p className="text-xs text-[#8b949e]">Eingehende und ausgehende Anrufe werden hier angezeigt.</p>
      {calls.length === 0 ? (
        <div className="cyber-card p-4 text-sm text-[#8b949e]">
          Aktuell liegen keine eingehenden Anrufe vor. Neue Fälle erscheinen, sobald Missionsszenarien verfügbar sind.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {calls.map((call) => (
            <button
              key={call.id}
              onClick={() => setActiveCall(buildCallDialog(call))}
              className="cyber-card p-4 text-left"
            >
              <div className="flex items-center gap-2 text-sm text-white">
                <Phone size={16} className="text-[#00f0ff]" />
                {call.title}
              </div>
              <div className="text-xs text-[#8b949e] mt-1 truncate">{call.body}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
