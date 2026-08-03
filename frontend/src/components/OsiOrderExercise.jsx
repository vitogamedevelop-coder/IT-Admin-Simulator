import { useState } from 'react';
import { CheckCircle, GripVertical } from 'lucide-react';

const ordered = ['Physikalisch', 'Sicherung', 'Vermittlung / Netzwerk', 'Transport', 'Sitzung', 'Darstellung', 'Anwendung'];

export default function OsiOrderExercise() {
  const [layers, setLayers] = useState(() => [...ordered].sort(() => Math.random() - 0.5));
  const [dragged, setDragged] = useState(null); const [checked, setChecked] = useState(false);
  function drop(target) { if (dragged === null || dragged === target) return; const next = [...layers]; const [item] = next.splice(dragged, 1); next.splice(target, 0, item); setLayers(next); setDragged(null); setChecked(false); }
  const correct = layers.every((layer, index) => layer === ordered[index]);
  return <div className="cyber-card p-4"><h3 className="font-bold text-[#ffcc00]">OSI-Reihenfolge</h3><p className="mt-1 text-xs text-[#8b949e]">Ziehe die Schichten von 1 (unten) bis 7 (oben) in die richtige Reihenfolge.</p><div className="mt-3 flex flex-col gap-2">{layers.map((layer, index) => <div key={layer} draggable onDragStart={() => setDragged(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => drop(index)} className="flex cursor-grab items-center gap-2 rounded border border-[#30363d] bg-[#050505] p-3 text-sm text-white active:cursor-grabbing"><GripVertical size={16} className="text-[#8b949e]" /><span className="w-5 text-[#00f0ff]">{index + 1}</span>{layer}</div>)}</div><button onClick={() => setChecked(true)} className="cyber-btn mt-3 w-full">reihenfolge prüfen</button>{checked && <p className={`mt-3 flex items-center gap-2 text-sm ${correct ? 'text-[#00ff66]' : 'text-[#ff3355]'}`}><CheckCircle size={17} />{correct ? 'Korrekt: Schicht 1 bis 7 sitzt.' : 'Noch nicht ganz. Tipp: Bits und Kabel beginnen bei Schicht 1.'}</p>}</div>;
}
