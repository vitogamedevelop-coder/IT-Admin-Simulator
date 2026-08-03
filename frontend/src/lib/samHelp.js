const KEY = 'it-learn:sam-help-v1';
const WINDOW_MS = 30 * 60 * 1000;

function recentRequests() {
  try {
    const requests = JSON.parse(localStorage.getItem(KEY)) || [];
    return requests.filter((time) => Date.now() - time < WINDOW_MS);
  } catch {
    return [];
  }
}

export function requestSamHelp({ _prompt, correctAnswer, explanation }) {
  const recent = recentRequests();
  recent.push(Date.now());
  localStorage.setItem(KEY, JSON.stringify(recent));
  const count = recent.length;
  if (count === 1) return { tone: 'friendly', title: 'Sam hilft dir', text: `Klar, wir schauen gemeinsam drauf. Achte darauf, was das Symptom wirklich beweist. Mein konkreter Hinweis: ${explanation || `Prüfe, warum „${correctAnswer}“ zur Beobachtung passt.`}` };
  if (count === 2) return { tone: 'neutral', title: 'Sam gibt einen Denkanstoß', text: `Denk an unsere Reihenfolge: erst Fakten sammeln, dann Hypothese bilden, anschließend gezielt testen. Die passende Richtung ist „${correctAnswer}“ – begründe sie mit dem Symptom.` };
  if (count === 3) return { tone: 'firm', title: 'Sam wird deutlicher', text: `Du hast mich in kurzer Zeit jetzt dreimal gerufen. Lies die Ausgabe noch einmal und streiche Antworten, die dem Symptom widersprechen. Ich verrate diesmal nur: Suche nach dem kleinsten sicheren nächsten Diagnoseschritt.` };
  return { tone: 'annoyed', title: 'Sam bleibt knapp', text: `Schon wieder? Du kannst das selbst. Schreib zuerst auf: Was weißt du sicher, was vermutest du nur, und welcher Test trennt beides? Ich gebe dir in dieser Runde nicht direkt die Lösung.` };
}

export function requestSamMentor({ stepType, correctAnswer }) {
  recentRequests().push(Date.now());
  localStorage.setItem(KEY, JSON.stringify(recentRequests()));

  const commonIncorrect = { label: 'Ich rate einfach', correct: false };
  const templates = {
    decision: {
      question: 'Bevor wir entscheiden: Was brauchen wir zuerst?',
      options: [
        { label: 'Mehr Fakten zum Symptom', correct: true, feedback: 'Genau. Erst sammeln wir Fakten, dann bilden wir eine Hypothese.' },
        { label: 'Sofort die beste Lösung', correct: false, feedback: 'Noch zu früh. Ohne Fakten riskieren wir, das falsche Problem zu lösen.' },
        { label: 'Einen Kollegen fragen', correct: false, feedback: 'Kollegen können helfen, aber wir sollten zuerst selbst die Fakten sammeln.' },
      ],
    },
    evidence: {
      question: 'Welche Information ist für die Hypothese entscheidend?',
      options: [
        { label: 'Der Fakt, der das Symptom erklärt', correct: true, feedback: 'Richtig. Wir suchen den Fakt, der das Problem sichtbar macht.' },
        { label: 'Ein unwichtiges Detail', correct: false, feedback: 'Nicht jedes Detail ist relevant. Wir brauchen den Fakt, der zur Lösung führt.' },
        { label: 'Eine Vermutung', correct: false, feedback: 'Vermutungen sind okay, aber wir brauchen zuerst harte Fakten.' },
      ],
    },
    tool: {
      question: 'Welches Werkzeug liefert die fehlende Information?',
      options: [
        { label: correctAnswer || 'Das passende Diagnose-Tool', correct: true, feedback: 'Genau. Dieses Werkzeug macht den fehlenden Fakt sichtbar.' },
        { label: 'Ein beliebiges anderes Tool', correct: false, feedback: 'Nicht jedes Tool liefert die Information, die wir gerade brauchen.' },
        commonIncorrect,
      ],
    },
    result: {
      question: 'Was folgt aus dem Test?',
      options: [
        { label: 'Eine Hypothese bestätigen oder verwerfen', correct: true, feedback: 'Richtig. Der Test entscheidet, ob unsere Hypothese stimmt.' },
        { label: 'Sofort alles neu installieren', correct: false, feedback: 'Zu drastisch. Wir lassen den Test erst unsere Hypothese prüfen.' },
        { label: 'Aufgeben', correct: false, feedback: 'Noch nicht. Der Test bringt uns auf die richtige Spur.' },
      ],
    },
  };

  return templates[stepType] || templates.decision;
}

export function samHelpStatus() {
  const count = recentRequests().length;
  return { count, directHelpAvailable: count < 2, cooldownMinutes: count >= 4 ? Math.ceil((WINDOW_MS - (Date.now() - recentRequests()[0])) / 60000) : 0 };
}
