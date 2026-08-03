import { Component } from 'react';

function buildDiagnosticText(context, error, categoryId, topicId) {
  const lines = ['--- CyberLearn Diagnose ---'];
  if (context) lines.push(`Context: ${context}`);
  if (categoryId && topicId) lines.push(`Topic: ${categoryId}/${topicId}`);
  if (error) {
    lines.push(`Fehler: ${error.message}`);
    if (error.stack) lines.push(`Stack: ${error.stack}`);
  }
  // Grab lesson-specific progress for this topic (if available)
  try {
    const raw = localStorage.getItem('cyberlearn:academy-progress-v1');
    if (raw && categoryId && topicId) {
      const data = JSON.parse(raw);
      const topicData = data?.topics?.[`${categoryId}/${topicId}`];
      if (topicData) {
        lines.push(`Resume: lastSection=${topicData.lastCompletedSectionId}, style=${topicData.lastExplanationStyle}`);
        lines.push(`Sections: ${JSON.stringify(topicData.completedSectionIds || [])}`);
        lines.push(`Exercises: ${JSON.stringify(topicData.completedExerciseIds || [])}`);
        lines.push(`Completions: ${topicData.lessonCompletions || 0}`);
      }
    }
  } catch { /* ignore */ }
  return lines.join('\n');
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false, didReset: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    const context = this.props.context || 'unknown';
    const categoryId = this.props.categoryId || '';
    const topicId = this.props.topicId || '';
    console.error(
      `[ErrorBoundary] context=${context} topic=${categoryId}/${topicId}`,
      error,
      errorInfo?.componentStack,
    );
  }

  handleCopy() {
    const text = buildDiagnosticText(
      this.props.context, this.state.error,
      this.props.categoryId, this.props.topicId,
    );
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => this.setState({ copied: true }));
    } else {
      // Fallback for WebViews without clipboard API
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.setState({ copied: true });
      } catch { /* ignore */ }
    }
  }

  handleResetLesson() {
    const { categoryId, topicId } = this.props;
    if (!categoryId || !topicId) return;
    try {
      const raw = localStorage.getItem('cyberlearn:academy-progress-v1');
      if (raw) {
        const data = JSON.parse(raw);
        const key = `${categoryId}/${topicId}`;
        if (data.topics?.[key]) {
          Object.assign(data.topics[key], {
            startedAt: null,
            lastCompletedSectionId: null,
            lastCompletedSectionTitle: null,
            completedSectionIds: [],
            completedQuestionIds: [],
            completedExerciseIds: [],
            lastExplanationStyle: null,
          });
          localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(data));
        }
      }
    } catch { /* ignore */ }
    this.setState({ didReset: true });
  }

  render() {
    if (this.state.hasError) {
      const context = this.props.context || '';
      const categoryId = this.props.categoryId || '';
      const topicId = this.props.topicId || '';
      const hasTopicContext = !!(categoryId && topicId);
      const errorMsg = this.state.error?.message || '';

      return (
        <div className="p-4 text-center">
          <div className="cyber-card max-w-sm mx-auto p-5">
            <h1 className="text-base font-bold text-[#ff3355]">Lektion konnte nicht geladen werden</h1>
            {context && <p className="mt-1 text-xs text-[#8b949e] font-mono">{context}</p>}
            {errorMsg && <p className="mt-2 text-xs text-[#ffcc00] font-mono break-all">{errorMsg}</p>}
            <p className="mt-3 text-sm text-[#c9d1d9]">
              {this.state.didReset
                ? 'Fortschritt dieser Lektion wurde zurückgesetzt. Bitte versuche es erneut.'
                : 'Der Fehler wurde protokolliert. Du kannst die Diagnose kopieren oder den Lektionsfortschritt zurücksetzen.'}
            </p>

            <div className="flex flex-col gap-2 mt-4">
              <button onClick={() => this.handleCopy()} className="cyber-btn-outline w-full py-2 text-xs">
                {this.state.copied ? 'Kopiert!' : 'Diagnose kopieren'}
              </button>
              {hasTopicContext && !this.state.didReset && (
                <button onClick={() => this.handleResetLesson()} className="cyber-btn-outline w-full py-2 text-xs text-[#ffcc00]">
                  Fortschritt dieser Lektion zurücksetzen
                </button>
              )}
              {this.props.onBack ? (
                <button onClick={this.props.onBack} className="cyber-btn w-full py-2 text-sm">Zurück</button>
              ) : (
                <button onClick={() => window.location.reload()} className="cyber-btn w-full py-2 text-sm">Neu laden</button>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
