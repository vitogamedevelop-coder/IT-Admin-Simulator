import LearningOptionList from './LearningOptionList.jsx';

export default function ThemencheckOptionList({
  options,
  selected,
  onSelect,
  correct,
  correctIndices,
  submitted,
  multi = false,
}) {
  const normalized = options.map((opt, i) => (typeof opt === 'string' ? { id: String(i), label: opt } : { ...opt, id: opt.id ?? String(i) }));

  const selectedId = multi
    ? (selected || []).map((i) => String(i))
    : (selected !== null && selected !== undefined ? String(selected) : null);

  let correctProp;
  if (multi) {
    correctProp = (correctIndices || []).map((i) => String(i));
  } else if (correct !== undefined && correct !== null) {
    correctProp = String(correct);
  }

  function handleSelect(value) {
    if (multi) {
      onSelect?.(value.map((id) => Number(id)).sort((a, b) => a - b));
    } else {
      onSelect?.(Number(value));
    }
  }

  return (
    <LearningOptionList
      options={normalized}
      selected={selectedId}
      onSelect={handleSelect}
      mode={multi ? 'multi' : 'single'}
      correct={correctProp}
      submitted={submitted}
    />
  );
}
