const { getAllMultiSelectQuestions, shuffleOptions } = await import('../src/lib/multiSelectQuestions.js');

const questions = getAllMultiSelectQuestions();

let exit = 0;
let failures = 0;

function fail(msg) {
  console.log(`[FAIL] ${msg}`);
  failures++;
  exit = 1;
}

function pass(msg) {
  console.log(`[PASS] ${msg}`);
}

console.log('=== Themencheck Multi-Select Option Shuffle Test ===');

for (const q of questions) {
  const originalOptions = new Set(q.options);
  const originalCorrect = new Set(q.correctIndices.map((i) => q.options[i]));
  let positionsVaried = false;

  for (let run = 0; run < 30; run++) {
    const shuffled = shuffleOptions(q);

    if (shuffled.options.length !== q.options.length) {
      fail(`${q.semanticKey}: option count changed after shuffle`);
      break;
    }

    const shuffledSet = new Set(shuffled.options);
    if (![...originalOptions].every((o) => shuffledSet.has(o))) {
      fail(`${q.semanticKey}: options lost or duplicated after shuffle`);
      break;
    }

    if (new Set(shuffled.options).size !== shuffled.options.length) {
      fail(`${q.semanticKey}: duplicate options after shuffle`);
      break;
    }

    const mappedCorrect = new Set(shuffled.correctIndices.map((i) => shuffled.options[i]));
    if (![...originalCorrect].every((o) => mappedCorrect.has(o))) {
      fail(`${q.semanticKey}: correct options lost after shuffle`);
      break;
    }
    if (mappedCorrect.size !== originalCorrect.size) {
      fail(`${q.semanticKey}: correct option count changed after shuffle`);
      break;
    }

    if (shuffled.correctIndices.length !== q.correctIndices.length) {
      fail(`${q.semanticKey}: correctIndices length changed`);
      break;
    }

    const firstOriginal = q.options[0];
    if (shuffled.options[0] !== firstOriginal) {
      positionsVaried = true;
    }
  }

  if (!positionsVaried && q.options.length > 1) {
    fail(`${q.semanticKey}: option positions never varied over 30 shuffles (unlucky RNG?)`);
  }
}

if (failures === 0) {
  pass(`All ${questions.length} multi-select questions keep correct mapping over shuffles`);
}

if (exit) {
  console.log('\n=== Shuffle Test FAILED ===');
  process.exit(1);
}
console.log('\n=== Shuffle Test passed ===');
