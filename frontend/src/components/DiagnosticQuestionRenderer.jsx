export default function DiagnosticQuestionRenderer({ diagnostic, question, className = '' }) {
  if (!diagnostic) {
    return question ? <p className={`text-sm text-white font-bold whitespace-pre-line ${className}`}>{question}</p> : null;
  }

  const { problem, observations = [], knownGood = [], knownBad = [], configSnippet, showOutput } = diagnostic;

  return (
    <div className={`space-y-3 ${className}`}>
      {problem && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#ff7b72] mb-1">Problem</div>
          <p className="text-sm text-[#c9d1d9]">{problem}</p>
        </div>
      )}

      {observations.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#ffcc00] mb-1">Beobachtungen</div>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-[#c9d1d9]">
            {observations.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}

      {knownGood.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#00ff66] mb-1">Bekannt gut</div>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-[#c9d1d9]">
            {knownGood.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}

      {knownBad.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#ff7b72] mb-1">Bekannt schlecht</div>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-[#c9d1d9]">
            {knownBad.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}

      {configSnippet && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#00f0ff] mb-1">Konfiguration</div>
          <pre className="bg-[#0a1628] border border-[#00f0ff]/20 rounded p-2 text-xs text-[#c9d1d9] font-mono whitespace-pre-wrap">{configSnippet}</pre>
        </div>
      )}

      {showOutput && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#00f0ff] mb-1">Befehlsausgabe</div>
          <pre className="bg-[#0a1628] border border-[#00f0ff]/20 rounded p-2 text-xs text-[#c9d1d9] font-mono whitespace-pre-wrap">{showOutput}</pre>
        </div>
      )}

      {question && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#c9d1d9] mb-1">Frage</div>
          <p className="text-sm text-white font-bold">{question}</p>
        </div>
      )}
    </div>
  );
}
