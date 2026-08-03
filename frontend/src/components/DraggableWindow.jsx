import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * DraggableWindow - reusable draggable floating window component.
 * Works with both mouse (desktop) and touch (mobile/Android).
 *
 * Usage:
 *   <DraggableWindow initialPosition="bottom-center" className="..." resetKey={step}>
 *     {children}
 *   </DraggableWindow>
 *
 * Props:
 *   - initialPosition: 'bottom-center' | 'top-center' | { x, y }
 *   - className: additional CSS classes for the window container
 *   - resetKey: when this value changes, position resets to initialPosition
 *   - style: additional inline styles
 *   - zIndex: z-index for the window (default 102)
 */
export default function DraggableWindow({ children, initialPosition = 'bottom-center', className = '', resetKey, style, zIndex = 102 }) {
  const windowRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [pos, setPos] = useState(null); // null = use CSS positioning until first drag or measure

  // Compute initial pixel position from named position
  const computeInitial = useCallback(() => {
    const el = windowRef.current;
    if (!el) return { x: 16, y: window.innerHeight - 200 };
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (typeof initialPosition === 'object') {
      return { x: initialPosition.x, y: initialPosition.y };
    }
    const cx = Math.max(8, (vw - rect.width) / 2);
    if (initialPosition === 'top-center') {
      const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top') || '0', 10);
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '48', 10);
      return { x: cx, y: safeTop + headerH + 8 };
    }
    // bottom-center (default)
    const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom') || '0', 10);
    return { x: cx, y: vh - rect.height - safeBottom - 16 };
  }, [initialPosition]);

  // Reset position when resetKey changes
  useEffect(() => {
    setPos(null);
  }, [resetKey]);

  // After first render or reset, measure and set position
  useEffect(() => {
    if (pos !== null) return;
    const frame = requestAnimationFrame(() => {
      setPos(computeInitial());
    });
    return () => cancelAnimationFrame(frame);
  }, [pos, computeInitial]);

  // Clamp position to viewport bounds
  const clampToViewport = useCallback((x, y) => {
    const el = windowRef.current;
    if (!el) return { x, y };
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.max(0, Math.min(vw - rect.width, x)),
      y: Math.max(0, Math.min(vh - rect.height, y)),
    };
  }, []);

  // --- Pointer handlers (unified mouse + touch) ---
  const onPointerDown = useCallback((e) => {
    // Only drag from the window header area or the window itself
    if (e.target.closest('button, a, input, select, textarea')) return;
    e.preventDefault();
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos?.x ?? 0,
      origY: pos?.y ?? 0,
    };
    windowRef.current?.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const newX = dragState.current.origX + dx;
    const newY = dragState.current.origY + dy;
    setPos(clampToViewport(newX, newY));
  }, [clampToViewport]);

  const onPointerUp = useCallback((e) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    windowRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  // Position style
  const posStyle = pos
    ? { position: 'fixed', left: pos.x, top: pos.y, zIndex }
    : { position: 'fixed', left: 16, bottom: 16, zIndex, opacity: 0 };

  return (
    <div
      ref={windowRef}
      className={`pointer-events-auto touch-none select-none ${className}`}
      style={{ ...posStyle, ...style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </div>
  );
}
