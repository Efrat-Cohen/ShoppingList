import { strings } from '../i18n/strings';

type Props = {
  step: 1 | 2;
};

export function AppHeader({ step }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18l-1.7 11.3a2 2 0 0 1-2 1.7H6.7a2 2 0 0 1-2-1.7Z" />
            <path d="M8.5 6 12 2l3.5 4" />
          </svg>
        </span>
        {strings.brand}
      </div>

      <nav className="steps" aria-label={strings.steps.label}>
        <span className="step" aria-current={step === 1 ? 'step' : undefined}>
          <span className="step-dot">1</span>
          {strings.steps.list}
        </span>
        <span className="step-sep" aria-hidden="true" />
        <span className="step" aria-current={step === 2 ? 'step' : undefined}>
          <span className="step-dot">2</span>
          {strings.steps.summary}
        </span>
      </nav>
    </header>
  );
}
