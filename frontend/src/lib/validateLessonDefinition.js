/**
 * Validates a lesson definition object for structural correctness.
 * Returns an array of error strings (empty = valid).
 *
 * Used by automated tests and (optionally) dev-mode runtime checks
 * to catch structural issues before they reach the LessonRunner.
 */
export function validateLessonDefinition(lesson, key) {
  const errors = [];
  const prefix = key ? `[${key}] ` : '';

  if (!lesson || typeof lesson !== 'object') {
    errors.push(`${prefix}lesson is null or not an object`);
    return errors;
  }

  // --- explanations ---
  if (!Array.isArray(lesson.explanations)) {
    errors.push(`${prefix}explanations is not an array`);
  } else {
    const ids = new Set();
    for (let i = 0; i < lesson.explanations.length; i++) {
      const exp = lesson.explanations[i];
      if (!exp || typeof exp !== 'object') {
        errors.push(`${prefix}explanations[${i}] is not an object`);
        continue;
      }
      if (!exp.id) {
        errors.push(`${prefix}explanations[${i}] missing id`);
      } else if (ids.has(exp.id)) {
        errors.push(`${prefix}duplicate explanation id: ${exp.id}`);
      } else {
        ids.add(exp.id);
      }
      if (!Array.isArray(exp.blocks)) {
        errors.push(`${prefix}explanation '${exp.id || i}' blocks is not an array`);
      } else {
        for (let b = 0; b < exp.blocks.length; b++) {
          const block = exp.blocks[b];
          if (!block || typeof block !== 'object') {
            errors.push(`${prefix}explanation '${exp.id}' blocks[${b}] is not an object`);
            continue;
          }
          if (!block.type) {
            errors.push(`${prefix}explanation '${exp.id}' blocks[${b}] missing type`);
          }
          if (block.type === 'question') {
            if (!block.question && !block.prompt) {
              errors.push(`${prefix}explanation '${exp.id}' question block[${b}] missing question/prompt text`);
            }
            if (!Array.isArray(block.options) || block.options.length < 2) {
              errors.push(`${prefix}explanation '${exp.id}' question block[${b}] needs at least 2 options`);
            }
            if (typeof block.correct !== 'number' && !block.options?.some(o => o.correct || o.isCorrect)) {
              errors.push(`${prefix}explanation '${exp.id}' question block[${b}] missing correct answer indicator`);
            }
          }
        }
      }
    }
  }

  // --- exercises ---
  if (!Array.isArray(lesson.exercises)) {
    errors.push(`${prefix}exercises is not an array`);
  } else {
    const VALID_TYPES = ['ordering', 'matching', 'input', 'select-best', 'guided-subnetting', 'adaptive-subnetting', 'difficulty-drill', 'fill-blank', 'multi-choice', 'subnet-calc', 'binary-conversion', 'cidr-calc', 'supernet-calc', 'drag-drop', 'scenario'];
    const exIds = new Set();
    for (let i = 0; i < lesson.exercises.length; i++) {
      const ex = lesson.exercises[i];
      if (!ex || typeof ex !== 'object') {
        errors.push(`${prefix}exercises[${i}] is not an object`);
        continue;
      }
      if (!ex.id) {
        errors.push(`${prefix}exercises[${i}] missing id`);
      } else if (exIds.has(ex.id)) {
        errors.push(`${prefix}duplicate exercise id: ${ex.id}`);
      } else {
        exIds.add(ex.id);
      }
      if (!ex.type) {
        errors.push(`${prefix}exercise '${ex.id || i}' missing type`);
      } else if (!VALID_TYPES.includes(ex.type)) {
        errors.push(`${prefix}exercise '${ex.id || i}' has unknown type: ${ex.type}`);
      }
    }
  }

  // --- quiz (optional) ---
  if (lesson.quiz !== undefined) {
    if (!Array.isArray(lesson.quiz)) {
      errors.push(`${prefix}quiz is defined but not an array`);
    } else {
      for (let i = 0; i < lesson.quiz.length; i++) {
        const q = lesson.quiz[i];
        if (!q || typeof q !== 'object') {
          errors.push(`${prefix}quiz[${i}] is not an object`);
          continue;
        }
        if (!q.question && !q.prompt) {
          errors.push(`${prefix}quiz[${i}] missing question/prompt`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`${prefix}quiz[${i}] needs at least 2 options`);
        }
        if (typeof q.correct !== 'number' && !q.options?.some(o => o.correct || o.isCorrect)) {
          errors.push(`${prefix}quiz[${i}] missing correct answer indicator`);
        }
      }
    }
  }

  return errors;
}
