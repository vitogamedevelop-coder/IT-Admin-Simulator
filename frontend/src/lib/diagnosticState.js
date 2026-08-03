// Diagnostic Quest State Machine
// Tracks the player's progress through a diagnostic investigation.
// Generic and reusable for any quest that follows the diagnostic format.

export function createDiagnosticState(quest) {
  return {
    questId: quest.id,
    phase: quest.phases[0].id,
    facts: { ...quest.initialFacts },
    completedActions: [],    // action IDs executed
    completedChecklist: [],  // checklist item IDs triggered
    selectedHypothesis: null,
    hypothesisHistory: [],   // { id, phaseWhenSet }
    samHintsUsed: {},        // { phaseId: count }
    totalSamHints: 0,
    actionLog: [],           // { actionId, phaseId, optimal, timestamp }
    startedAt: Date.now(),
    phaseStartedAt: Date.now(),
    finished: false,
  };
}

export function executeAction(state, quest, actionId) {
  const phase = quest.phases.find((p) => p.id === state.phase);
  if (!phase || !phase.actions) return state;
  const action = phase.actions.find((a) => a.id === actionId);
  if (!action || state.completedActions.includes(actionId)) return state;

  const next = { ...state };
  next.completedActions = [...state.completedActions, actionId];
  next.actionLog = [...state.actionLog, {
    actionId,
    phaseId: state.phase,
    optimal: action.optimal,
    correct: action.correct !== undefined ? action.correct : action.optimal,
    timestamp: Date.now(),
  }];

  // Update facts
  if (action.facts) {
    next.facts = { ...state.facts };
    Object.entries(action.facts).forEach(([key, value]) => {
      if (value !== undefined) next.facts[key] = value;
    });
  }

  // Check if any checklist items are triggered
  const newChecklist = [...state.completedChecklist];
  quest.checklist.forEach((item) => {
    if (item.trigger === actionId && !newChecklist.includes(item.id)) {
      newChecklist.push(item.id);
    }
  });
  next.completedChecklist = newChecklist;

  return next;
}

export function setHypothesis(state, quest, hypothesisId) {
  const next = { ...state };
  next.selectedHypothesis = hypothesisId;
  next.hypothesisHistory = [...state.hypothesisHistory, { id: hypothesisId, phaseWhenSet: state.phase }];

  // Trigger checklist
  const newChecklist = [...state.completedChecklist];
  quest.checklist.forEach((item) => {
    if (item.trigger === 'set-hypothesis' && !newChecklist.includes(item.id)) {
      newChecklist.push(item.id);
    }
  });
  next.completedChecklist = newChecklist;

  return next;
}

export function canAdvancePhase(state, quest) {
  const phase = quest.phases.find((p) => p.id === state.phase);
  if (!phase) return false;
  if (phase.isHypothesisPhase) return state.selectedHypothesis != null;
  if (!phase.requiredActions) return true;
  return phase.requiredActions.every((id) => state.completedActions.includes(id));
}

export function advancePhase(state, quest) {
  const phase = quest.phases.find((p) => p.id === state.phase);
  if (!phase || !phase.nextPhase) {
    return { ...state, finished: true };
  }
  return {
    ...state,
    phase: phase.nextPhase,
    phaseStartedAt: Date.now(),
  };
}

export function consumeSamHint(state) {
  const current = state.samHintsUsed[state.phase] || 0;
  if (current >= 3) return { state, level: 3 };
  const next = { ...state };
  next.samHintsUsed = { ...state.samHintsUsed, [state.phase]: current + 1 };
  next.totalSamHints = state.totalSamHints + 1;
  return { state: next, level: current + 1 };
}

export function getSamHint(quest, phaseId, level) {
  const hints = quest.samHints[phaseId];
  if (!hints) return null;
  const idx = Math.min(level - 1, hints.length - 1);
  return hints[idx];
}

export function buildReflection(state, quest) {
  const correctHyp = quest.hypotheses.find((h) => h.correct);
  const playerHyp = quest.hypotheses.find((h) => h.id === state.selectedHypothesis);
  const hypothesisCorrect = state.selectedHypothesis === correctHyp?.id;

  const suboptimalActions = state.actionLog.filter((a) => !a.optimal);
  const optimalActions = state.actionLog.filter((a) => a.optimal);

  // Find which action was decisive
  const decisiveAction = state.actionLog.find((a) => a.actionId === 'interpret-apipa');

  // Build dynamic reflection text
  let hypothesisText;
  if (hypothesisCorrect) {
    hypothesisText = `Du hast richtig erkannt: „${playerHyp.label}“. Das war die korrekte Hypothese.`;
  } else if (playerHyp) {
    hypothesisText = `Du hast zuerst „${playerHyp.label}“ vermutet. Die richtige Hypothese war: „${correctHyp.label}“.`;
    const phase = quest.phases.find((p) => p.id === 'hypothesis');
    if (phase?.hypothesisFeedback?.[state.selectedHypothesis]) {
      hypothesisText += ' ' + phase.hypothesisFeedback[state.selectedHypothesis];
    }
  } else {
    hypothesisText = `Die richtige Hypothese war: „${correctHyp.label}“.`;
  }

  let unnecessaryText;
  if (suboptimalActions.length === 0) {
    unnecessaryText = 'Du hast keine unnötigen Schritte durchgeführt – sehr effiziente Diagnose.';
  } else {
    const names = suboptimalActions.map((a) => {
      for (const phase of quest.phases) {
        const action = phase.actions?.find((act) => act.id === a.actionId);
        if (action) return action.label;
      }
      return a.actionId;
    });
    unnecessaryText = `Diese Schritte waren nicht zielführend: ${names.join(', ')}. Das ist kein Problem – auch erfahrene Admins probieren manchmal einen falschen Weg.`;
  }

  return {
    hypothesisCorrect,
    hypothesisText,
    decisiveInfo: decisiveAction
      ? 'Die ipconfig-Ausgabe mit der APIPA-Adresse 169.254.31.8 war der entscheidende Hinweis.'
      : 'Die IP-Konfiguration hätte den entscheidenden Hinweis geliefert.',
    unnecessaryText,
    takeaway: quest.phases.find((p) => p.id === 'hypothesis')
      ? 'APIPA (169.254.x.x) = DHCP-Lease fehlt. Erst physische Verbindung prüfen, dann Lease erneuern.'
      : '',
    samHintsUsed: state.totalSamHints,
    optimalCount: optimalActions.length,
    totalActions: state.actionLog.length,
    verified: state.completedActions.includes('verify-fix'),
    totalMinutes: Math.max(1, Math.round((Date.now() - state.startedAt) / 60000)),
  };
}
