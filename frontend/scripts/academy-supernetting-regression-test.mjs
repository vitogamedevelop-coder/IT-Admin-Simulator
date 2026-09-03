import assert from 'node:assert/strict';
import { calculateSupernet } from '../src/lib/networking/ipv4Math.js';

const p = calculateSupernet(['10.0.8.0/24', '10.0.9.0/24']);
assert.strictEqual(p.superPrefix, 23, '10.0.8.0/24 + 10.0.9.0/24 must supernet to /23');
assert.strictEqual(p.superNetwork, '10.0.8.0', 'supernetwork id should be 10.0.8.0');
assert.strictEqual(p.commonBits, 23, 'common bits should be 23');

// Simulate InputExercise answer normalization
function accepted(value, expected) {
  const normalized = String(value).trim().toLowerCase();
  const stripSlash = (s) => s.replace(/^\//, '');
  const e = String(expected).trim().toLowerCase();
  if (e === normalized) return true;
  if (/^\/?(\d+)$/.test(normalized) && /^\/?(\d+)$/.test(e)) {
    return stripSlash(normalized) === stripSlash(e);
  }
  return false;
}

assert(accepted('23', 23), 'answer 23 should be accepted');
assert(accepted('/23', 23), 'answer /23 should be accepted');
assert(accepted('  /23  ', 23), 'answer with whitespace /23 should be accepted');

console.log('=== Supernetting regression test passed ===');




