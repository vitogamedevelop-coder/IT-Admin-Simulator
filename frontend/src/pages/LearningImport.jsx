import { useState } from 'react';
import { Upload, CheckCircle, XCircle, FileText } from 'lucide-react';
import { previewFromContent, parseMarkdownLearningContent } from '../lib/learningImport';
import { readGameState } from '../lib/gameState';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

function parseInput(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      return { parseError: err.message };
    }
  }
  return parseMarkdownLearningContent(trimmed);
}

export default function LearningImport() {
  useAppBack();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [existingIds] = useState(() => [
    ...readGameState().completedQuests,
    ...readGameState().importedContentIds,
  ]);

  function analyze() {
    const content = parseInput(text);
    const result = previewFromContent(content);
    const idConflict = existingIds.includes(content.id);
    setPreview({ ...result, content, idConflict });
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Arbeitsplatz" />
      <div className="flex items-center gap-2 text-[#00f0ff]">
        <Upload size={20} />
        <h2 className="font-bold">Lehrgangsimport</h2>
      </div>
      <div className="cyber-card p-4">
        <p className="text-xs text-[#8b949e]">
          Füge hier einen neuen Lerninhalt im JSON- oder Markdown-Format aus <code>LearningContent/Templates</code> ein.
          Die Vorschau zeigt, welche Missionen, Fragen und Notizhefteinträge erzeugt werden.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="cyber-input w-full mt-3 font-mono text-xs"
          placeholder='{"id": "...", "title": "...", "learningGoal": "..."}'
        />
        <button onClick={analyze} className="cyber-btn w-full mt-3">Vorschau generieren</button>
      </div>

      {preview && (
        <div className={`cyber-card p-4 border-l-4 ${preview.valid ? 'border-[#00ff66]' : 'border-[#ffcc00]'}`}>
          <div className="flex items-center gap-2 text-sm font-bold">
            {preview.valid ? <CheckCircle size={18} className="text-[#00ff66]" /> : <XCircle size={18} className="text-[#ffcc00]" />}
            {preview.valid ? 'Struktur gültig' : 'Validierungsprobleme'}
          </div>
          {preview.errors.length > 0 && <ul className="mt-2 text-xs text-[#ffcc00]">{preview.errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>}
          {preview.idConflict && <div className="mt-2 text-xs text-[#ff3355]">ID existiert bereits im Spielstand. Bitte eine neue ID wählen.</div>}
          <div className="mt-3 text-xs text-[#8b949e]">
            <div className="font-bold text-white mb-1">Geplante Übernahme:</div>
            <div>Hauptmission: {preview.mainMission?.title || '-'}</div>
            <div>Nebenmissionen: {preview.sideMissions.length}</div>
            <div>Notizhefteinträge: {preview.notebookEntries.length}</div>
            <div>Fragen: {preview.questions.length}</div>
            <div>Befehle: {preview.commands.length}</div>
          </div>
          {preview.valid && !preview.idConflict && (
            <div className="mt-3 p-3 rounded border border-[#30363d] text-xs text-[#c9d1d9]">
              <FileText size={16} className="text-[#00f0ff] mb-1" />
              Die Übernahme in die Spieldaten ist hier vorbereitet. In einer späteren Version kannst du den Inhalt mit einem Klick bestätigen und aktivieren.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
