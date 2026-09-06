// Re-export the shared random service from the Knowledge Layer for backward
// compatibility.  New code should import from `../random.js` directly.
export {
  createRng,
  makeSeed,
  RNG_NAMESPACE_LEARNING,
  RNG_NAMESPACE_QUESTIONS,
  RNG_NAMESPACE_CONVERSATIONS,
  RNG_NAMESPACE_MISSIONS,
  RNG_NAMESPACE_UI,
} from '../random.js';
