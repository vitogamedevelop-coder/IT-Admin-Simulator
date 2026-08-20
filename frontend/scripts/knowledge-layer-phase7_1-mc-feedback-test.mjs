import { getMcOptionState } from '../src/lib/conversationMcState.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

const options = [
  { id: 'a', label: 'Filter' },
  { id: 'b', label: 'Forward' },
  { id: 'c', label: 'Flood' },
];
const correctOptionId = 'a';

// ---------------------------------------------------------------------------
// Fall A: Nutzer wählt richtige Antwort
// ---------------------------------------------------------------------------
{
  const selected = 'a';
  for (const opt of options) {
    const state = getMcOptionState({
      optionId: opt.id,
      selectedId: selected,
      correctOptionId,
      submitted: true,
      isCorrect: true,
    });
    if (opt.id === 'a') {
      assertEqual(state, 'correct', 'gewählte richtige Option wird als correct markiert');
    } else {
      assertEqual(state, 'neutral', 'Nicht-gewählte Optionen bleiben neutral');
    }
  }
  console.log('✅ Fall A: richtige Antwort → gewählte Option correct, Rest neutral');
}

// ---------------------------------------------------------------------------
// Fall B: Nutzer wählt falsche Antwort
// ---------------------------------------------------------------------------
{
  const selected = 'b';
  for (const opt of options) {
    const state = getMcOptionState({
      optionId: opt.id,
      selectedId: selected,
      correctOptionId,
      submitted: true,
      isCorrect: false,
    });
    if (opt.id === 'b') {
      assertEqual(state, 'incorrect-selected', 'vom Nutzer gewählte falsche Option wird rot markiert');
    } else if (opt.id === 'a') {
      assertEqual(state, 'correct', 'tatsächlich richtige Option wird grün markiert');
    } else {
      assertEqual(state, 'neutral', 'übrige Option bleibt neutral');
    }
  }
  console.log('✅ Fall B: falsche Antwort → gewählte rot, richtige grün, Rest neutral');
}

// ---------------------------------------------------------------------------
// Fall C: Auswahl vor Absenden (selected-State)
// ---------------------------------------------------------------------------
{
  const selected = 'b';
  for (const opt of options) {
    const state = getMcOptionState({
      optionId: opt.id,
      selectedId: selected,
      correctOptionId,
      submitted: false,
      isCorrect: false,
    });
    if (opt.id === 'b') {
      assertEqual(state, 'selected', 'vor Absenden ist die gewählte Option im selected-State');
    } else {
      assertEqual(state, 'neutral', 'nicht gewählte Optionen sind vor Absenden neutral');
    }
  }
  console.log('✅ Fall C: vor Absenden → selected/Neutral');
}

// ---------------------------------------------------------------------------
// Fall D: Wechsel zur nächsten Frage
// Die Komponente setzt selected beim Wechsel des instanceId zurück; der Helper
// selbst muss für eine neue, unbeantwortete Frage alles als neutral liefern.
// ---------------------------------------------------------------------------
{
  for (const opt of options) {
    const state = getMcOptionState({
      optionId: opt.id,
      selectedId: null,
      correctOptionId,
      submitted: false,
      isCorrect: false,
    });
    assertEqual(state, 'neutral', 'nach Reset sind alle Optionen neutral');
  }
  console.log('✅ Fall D: Reset zur nächsten Frage → alle Optionen neutral');
}

// ---------------------------------------------------------------------------
// Fall F: Richtige Option kommt aus dem Question/Result-Objekt
// ---------------------------------------------------------------------------
{
  const selected = 'c';
  const stateA = getMcOptionState({ optionId: 'a', selectedId: selected, correctOptionId, submitted: true, isCorrect: false });
  const stateC = getMcOptionState({ optionId: 'c', selectedId: selected, correctOptionId, submitted: true, isCorrect: false });
  assertEqual(stateA, 'correct', 'correctOptionId wird vom Question-Objekt verwendet');
  assertEqual(stateC, 'incorrect-selected', 'selectedId wird vom Result verwendet');
  console.log('✅ Fall F: correct/selected kommen aus Question/Result, nicht aus dem Renderer');
}

console.log('\n✅ Phase 7.1 MC post-answer visual feedback tests passed');
