import { useParams } from 'react-router'
import Breadcrumb from './Breadcrumb.jsx'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { findTopic } from '../topics/topics.js'

// Full-viewport layout for a learning page: everything fits on one screen, no scrolling.
//   head  : back link, title, optional steps
//   say   : one short line (the task)
//   bar   : optional toolbar above the main area
//   main  : grows to fill the remaining height (charts measure it)
//   foot  : feedback and actions
// `onGuide` adds a "? Guide" button in the head that replays the page's guided tour (Tour.jsx).
export function Stage({ title, steps, current, say, bar, foot, children, flowOnNarrow = false, className = '', onGuide }) {
  const tx = useText(COMMON)
  const { lang } = useLang()
  // A game goes back to its topic's page ("← Mean, median and mode").
  const topic = findTopic(useParams().slug)
  return (
    <article className={`stage${flowOnNarrow ? ' is-flow-narrow' : ''}${className ? ` ${className}` : ''}`}>
      <header className="stage-head">
        <div className="stage-title">
          <Breadcrumb
            items={[{ to: '/topics', label: tx.navTopics }, ...(topic ? [{ to: `/topics/${topic.slug}`, label: topic.text[lang].title }] : [])]}
          />
          <h1>{title}</h1>
        </div>
        {(steps || onGuide) && (
          <div className="stage-head-side">
            {steps && <Steps steps={steps} current={current} />}
            {onGuide && (
              <button type="button" className="btn btn-ghost btn-sm guide-btn" onClick={onGuide} title={tx.guideLabel}>
                <span className="guide-icon" aria-hidden="true">
                  ?
                </span>
                {tx.guide}
              </button>
            )}
          </div>
        )}
      </header>
      {say && <div className="stage-say">{say}</div>}
      {bar && <div className="stage-bar">{bar}</div>}
      <div className="stage-main">{children}</div>
      {foot && <footer className="stage-foot">{foot}</footer>}
    </article>
  )
}

// The steps of a game (Carbon progress indicator, src/styles/_carbon.scss): done ✓, current, to come.
// Class names written out in full: tools/frameworks-css.mjs keeps only the classes it finds in the sources.
const STEP_CLASS = {
  done: 'cds--progress-step cds--progress-step--complete is-done',
  current: 'cds--progress-step cds--progress-step--current is-current',
  next: 'cds--progress-step cds--progress-step--incomplete',
}
const RING = 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.6A5.6 5.6 0 1 1 8 2.4a5.6 5.6 0 0 1 0 11.2z'
function StepIcon({ state }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d={RING} />
      {state === 'done' && <path d="M6.9 10.6 4.6 8.3l-.9.9 3.2 3.2 5.4-5.4-.9-.9z" />}
      {state === 'current' && <circle className="step-core" cx="8" cy="8" r="3.6" />}
    </svg>
  )
}

export function Steps({ steps, current }) {
  const tx = useText(COMMON)
  return (
    <ol className="steps cds--progress" aria-label={tx.progress} data-tour="steps">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'next'
        return (
          <li key={s} className={STEP_CLASS[state]} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="cds--progress-step-button cds--progress-step-button--unclickable">
              <StepIcon state={state} />
              <span className="cds--progress-text">
                <span className="cds--progress-label step-label">{s}</span>
              </span>
              <span className="cds--progress-line" />
            </span>
          </li>
        )
      })}
    </ol>
  )
}
