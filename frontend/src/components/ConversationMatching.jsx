import { useState, useEffect } from 'react';
import LearningMatchingBoard from './LearningMatchingBoard.jsx';

export default function ConversationMatching({ question, disabled, onAnswer }) {
  const [answer, setAnswer] = useState({});

  useEffect(() => {
    setAnswer({});
  }, [question.instanceId]);

  const items = question.leftItems || [];
  const targets = question.rightItems || [];

  const correctMapping = {};
  for (const p of (question.correctPairs || [])) {
    correctMapping[p.leftId ?? p.left] = p.rightId ?? p.right;
  }

  function handleSubmit(mapping) {
    onAnswer?.(mapping);
  }

  return (
    <LearningMatchingBoard
      items={items}
      targets={targets}
      correctMapping={correctMapping}
      answer={answer}
      onChange={setAnswer}
      onSubmit={handleSubmit}
      submitted={disabled}
      disabled={disabled}
      maxPerTarget={1}
      submitLabel="Zuordnung prüfen"
    />
  );
}
