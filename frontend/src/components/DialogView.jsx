import { useEffect, useState, useCallback } from 'react';
import { Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { characterAsset } from '../lib/rpgAssets';
import { defaultTypewriterSpeed } from '../lib/dialogSystem';

export default function DialogView({ dialog, person, onComplete, onOption }) {
  const [nodeId, setNodeId] = useState(dialog.entryNode);
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [history, setHistory] = useState([]);
  const node = dialog.nodes.find((n) => n.id === nodeId) || dialog.nodes[0];
  const personName = person?.name || node?.personId || 'Unbekannt';
  const personRole = person?.role || '';
  const portrait = characterAsset(person?.id || node?.personId);
  const isPhone = dialog.mode === 'phone';

  const showFullText = useCallback(() => {
    setDisplayedText(node.text);
    setIsComplete(true);
  }, [node.text]);

  const advance = useCallback(() => {
    if (!isComplete) {
      showFullText();
      return;
    }
    if (node.options?.length) return;
    if (node.autoNext) {
      setHistory((h) => [...h, { speaker: personName, text: node.text }]);
      setNodeId(node.autoNext);
      setDisplayedText('');
      setIsComplete(false);
      return;
    }
    if (onComplete) onComplete(node);
  }, [isComplete, node, personName, showFullText, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setDisplayedText(node.text.slice(0, index));
      if (index >= node.text.length) {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, defaultTypewriterSpeed);
    return () => clearInterval(timer);
  }, [node]);

  function chooseOption(option) {
    if (!isComplete) {
      showFullText();
      return;
    }
    setHistory((h) => [...h, { speaker: 'Du', text: option.label }, { speaker: personName, text: node.text }]);
    if (onOption) onOption(option);
    if (option.nextId) {
      setNodeId(option.nextId);
      setDisplayedText('');
      setIsComplete(false);
    } else if (onComplete) {
      onComplete(node, option);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="cyber-card overflow-hidden">
        <div className="bg-[#0d1117] p-3 border-b border-[#1f2937] flex items-center gap-3">
          {portrait ? <img src={portrait} alt={personName} className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : <div className="h-12 w-12 rounded-full border border-[#00f0ff] flex items-center justify-center">{isPhone ? <Phone size={20} className="text-[#00f0ff]" /> : <MessageCircle size={20} className="text-[#00f0ff]" />}</div>}
          <div>
            <div className="font-bold text-white text-sm">{personName}</div>
            <div className="text-[10px] text-[#8b949e]">{personRole}{isPhone ? ' · Telefon' : ''}</div>
          </div>
        </div>
        <div className="p-4 min-h-[8rem]" onClick={advance}>
          {history.length > 0 && <div className="mb-3 text-[10px] text-[#8b949e] uppercase tracking-widest">Gesprächsverlauf</div>}
          {history.slice(-3).map((entry, index) => (
            <div key={index} className={`text-sm mb-2 ${entry.speaker === 'Du' ? 'text-[#00f0ff] text-right' : 'text-[#c9d1d9]'}`}>
              <span className="text-[10px] text-[#8b949e] block">{entry.speaker}</span>{entry.text}
            </div>
          ))}
          <div className="text-sm text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">{displayedText}{!isComplete && <span className="inline-block w-2 h-4 ml-1 bg-[#00f0ff] animate-pulse" />}</div>
        </div>
      </div>
      {node.options?.length > 0 && isComplete && (
        <div className="flex flex-col gap-2">
          {node.options.map((option) => (
            <button key={option.label} onClick={() => chooseOption(option)} className="cyber-card p-3 text-left text-sm text-[#c9d1d9] hover:border-[#00f0ff]">
              {option.label}<ChevronRight size={16} className="inline ml-2 text-[#00f0ff]" />
            </button>
          ))}
        </div>
      )}
      {!node.options?.length && (
        <button onClick={advance} className="cyber-btn w-full text-sm">
          {isComplete ? (node.autoNext ? 'Weiter' : 'Gespräch beenden') : 'Text anzeigen'}
        </button>
      )}
    </div>
  );
}
