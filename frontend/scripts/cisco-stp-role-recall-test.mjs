import { generateQuestion } from '../src/lib/knowledge/questionGenerator.js';

console.log('=== Cisco STP Role Recall Test ===\n');

const validRoleMeanings = [
  'Bester Pfad eines Nicht-Root-Switches zur Root Bridge. Pro Nicht-Root-Switch genau einer.',
  'Bester Weg pro Segment zur Root Bridge; weiterleitend. Root-Bridge-Ports sind typischerweise Designated Ports.',
  'Blockierter Ersatzweg, um Schleifen zu vermeiden.',
];
const notRoles = ['Listening', 'Learning'];
let foundNameToMeaning = false;
let foundMeaningToName = false;

for (let i = 0; i < 30; i++) {
  const q = generateQuestion('stp.portRoles', null, { seed: `stp-role-${i}`, contextType: 'direct_question' });
  const labels = q.options.map((o) => o.label);
  const prompt = q.prompt;

  if (/Portrolle/.test(prompt)) foundNameToMeaning = true;
  if (/passt zu/.test(prompt)) foundMeaningToName = true;

  for (const wrong of notRoles) {
    if (labels.some((l) => l.toLowerCase().includes(wrong.toLowerCase()))) {
      console.error(`FAILED: option contains "${wrong}" which is a state, not a role.`);
      process.exit(1);
    }
  }

  const correctLabel = labels[q.correct];
  const isKnown = validRoleMeanings.some((m) => correctLabel.includes(m)) ||
    ['Root Port', 'Designated Port', 'Alternate / Non-Designated'].some((r) => correctLabel.includes(r));

  if (!isKnown) {
    console.error(`FAILED: correct answer "${correctLabel}" does not match a known STP role.`);
    process.exit(1);
  }
}

if (!foundNameToMeaning) {
  console.error('FAILED: no name-to-meaning question was generated.');
  process.exit(1);
}

if (!foundMeaningToName) {
  console.error('FAILED: no meaning-to-name question was generated.');
  process.exit(1);
}

console.log('All generated options stayed within Root/Designated/Alternate roles.');
console.log('\n=== Cisco STP Role Recall Test passed ===');





