import LearningMatchingBoard from './LearningMatchingBoard.jsx';

export default function LearningCategorizationBoard({
  items = [],
  categories = [],
  correctMapping = {},
  answer = {},
  onChange,
  onSubmit,
  submitted = false,
  disabled = false,
  submitLabel = 'Zuordnung prüfen',
  children,
}) {
  const counts = new Map();
  for (const cat of Object.values(correctMapping)) {
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  const maxPerTarget = Math.max(1, ...Array.from(counts.values()));

  return (
    <LearningMatchingBoard
      items={items}
      targets={categories}
      correctMapping={correctMapping}
      answer={answer}
      onChange={onChange}
      onSubmit={onSubmit}
      submitted={submitted}
      disabled={disabled}
      submitLabel={submitLabel}
      maxPerTarget={maxPerTarget}
    >
      {children}
    </LearningMatchingBoard>
  );
}
