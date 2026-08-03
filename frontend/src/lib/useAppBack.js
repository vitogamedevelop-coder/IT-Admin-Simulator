import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';

// Central back-navigation hook for Android hardware back button + visible back buttons.
// Priority:
// 1. Close open overlay/modal/dialog (via custom handler stack)
// 2. Navigate to previous route (router history)
// 3. On root page: double-press to exit

const handlerStack = [];
let exitToastTimeout = null;

// Register a back handler (returns cleanup fn). Handlers are LIFO.
export function pushBackHandler(handler) {
  handlerStack.push(handler);
  return () => {
    const idx = handlerStack.indexOf(handler);
    if (idx !== -1) handlerStack.splice(idx, 1);
  };
}

function showExitToast() {
  // Create a simple toast element
  const existing = document.getElementById('exit-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'exit-toast';
  toast.textContent = 'Noch einmal drücken, um die App zu verlassen';
  Object.assign(toast.style, {
    position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
    background: '#1f2937', color: '#c9d1d9', padding: '8px 16px', borderRadius: '8px',
    fontSize: '12px', zIndex: '9999', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    border: '1px solid #30363d', fontFamily: 'ui-monospace, monospace',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Core back logic - shared between hardware button and UI buttons
export function handleAppBack(navigate, location) {
  // 1. Check handler stack (modals, dialogs, overlays)
  if (handlerStack.length > 0) {
    const top = handlerStack[handlerStack.length - 1];
    top();
    return true;
  }
  // 2. Router history - go back if not on root
  const isRoot = location.pathname === '/' || location.pathname === '/workspace';
  if (!isRoot) {
    navigate(-1);
    return true;
  }
  // 3. Root page - double press to exit
  if (exitToastTimeout) {
    clearTimeout(exitToastTimeout);
    exitToastTimeout = null;
    CapApp.exitApp();
    return true;
  }
  showExitToast();
  exitToastTimeout = setTimeout(() => { exitToastTimeout = null; }, 2500);
  return true;
}

// Hook: registers Capacitor backButton listener + provides goBack fn
export function useAppBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(navigate);
  const locRef = useRef(location);
  navRef.current = navigate;
  locRef.current = location;

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      handleAppBack(navRef.current, locRef.current);
    });
    return () => { listener.then((h) => h.remove()); };
  }, []);

  const goBack = useCallback(() => {
    handleAppBack(navRef.current, locRef.current);
  }, []);

  return { goBack };
}

// Hook: register a closeable overlay (modal, dialog, app-window)
export function useBackHandler(handler, deps) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const wrapped = () => handlerRef.current();
    return pushBackHandler(wrapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || []);
}
