import { useRef, useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

export default function ConversationOrdering({ question, disabled, onAnswer }) {
  const [items, setItems] = useState(question.items);
  const [dragging, setDragging] = useState(null); // { index, startY, height, listTop, pointerId }

  useEffect(() => {
    setItems(question.items);
    setDragging(null);
    setDragY(0);
    setPlaceholder(null);
  }, [question.instanceId, question.items]);
  const [dragY, setDragY] = useState(0);
  const [placeholder, setPlaceholder] = useState(null);
  const itemRefs = useRef({});
  const listRef = useRef(null);

  function startDrag(index, e) {
    if (disabled) return;
    const el = itemRefs.current[index];
    const handle = e.currentTarget;
    if (!el || !handle) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = el.getBoundingClientRect();
    const listRect = listRef.current?.getBoundingClientRect();
    try { handle.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    setDragging({ index, startY: e.clientY, height: rect.height, listTop: listRect?.top ?? rect.top, pointerId: e.pointerId });
    setPlaceholder(index);
    setDragY(0);
  }

  function moveDrag(e) {
    if (!dragging) return;
    if (e.pointerId !== dragging.pointerId) return;
    e.preventDefault();
    const dy = e.clientY - dragging.startY;
    setDragY(dy);
    const idx = Math.min(items.length - 1, Math.max(0, Math.round((e.clientY - dragging.listTop) / dragging.height)));
    setPlaceholder(idx);
  }

  function endDrag(e) {
    if (!dragging) return;
    if (e.pointerId !== dragging.pointerId) return;
    e.preventDefault();
    try { e.currentTarget?.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    const target = placeholder ?? dragging.index;
    setDragging(null);
    setPlaceholder(null);
    setDragY(0);
    if (target !== dragging.index) {
      const next = items.slice();
      const [moved] = next.splice(dragging.index, 1);
      next.splice(target, 0, moved);
      setItems(next);
    }
  }

  if (disabled) {
    return (
      <div className="flex flex-col gap-2 opacity-70">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-[#30363d] bg-[#0d1117]/60 text-sm text-[#c9d1d9]">
            <span className="w-5 text-[#00f0ff]">{i + 1}</span>
            {item.label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 select-none" ref={listRef}>
      {items.map((item, i) => {
        const isDragging = dragging?.index === i;
        const gap = placeholder != null && placeholder !== dragging?.index;
        let translate = 0;
        if (gap && placeholder != null) {
          if (i < placeholder && dragging?.index >= placeholder) translate = dragging.height;
          if (i > placeholder && dragging?.index <= placeholder) translate = -dragging.height;
        }
        return (
          <div
            key={item.id}
            ref={(el) => { itemRefs.current[i] = el; }}
            className={`flex items-center gap-2 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/60 text-sm text-[#c9d1d9] ${isDragging ? 'z-10 shadow-lg opacity-95' : ''}`}
            style={{
              transform: isDragging ? `translateY(${dragY}px)` : `translateY(${translate}px)`,
              transition: dragging ? 'none' : 'transform 150ms ease',
              minHeight: dragging?.height ? `${dragging.height}px` : undefined,
            }}
          >
            <button
              type="button"
              className="p-3 text-[#8b949e] touch-none active:text-[#00f0ff]"
              aria-label="Verschieben"
              onPointerDown={(e) => startDrag(i, e)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <GripVertical size={18} />
            </button>
            <span className="w-5 text-[#00f0ff] shrink-0">{i + 1}</span>
            <span className="flex-1 py-2.5 pr-2 min-w-0">{item.label}</span>
          </div>
        );
      })}
      <button onClick={() => onAnswer(items.map((i) => i.id))} className="cyber-btn w-full mt-3 py-2 text-sm">
        Reihenfolge prüfen
      </button>
    </div>
  );
}
