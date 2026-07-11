import './HowItWorksSection.css'

const STEPS = [
  {
    num: '01',
    title: 'Open in your browser',
    desc: 'No download, no app store, no account for your first session. Just click and begin.',
    time: '~30 seconds',
  },
  {
    num: '02',
    title: 'Allow camera and calibrate',
    desc: 'Camera access is processed entirely on your device. Your video feed is never transmitted.',
    time: '~2 minutes',
  },
  {
    num: '03',
    title: 'Begin your mirror therapy session',
    desc: 'Follow guided movements at your pace. The mirrored hand responds in real time to your movement.',
    time: '~12 minutes',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container container">
        {/* Header */}
        <div className="how-it-works__header">
          <div className="how-it-works__header-text">
            <p className="mono-label">Your first session</p>
            <h2 className="how-it-works__heading">
              From browser to therapy<br />in under 4 minutes.
            </h2>
          </div>
          <a href="#" className="how-it-works__cta btn-primary" id="how-it-works-start-now">
            Start now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Steps */}
        <div className="how-it-works__steps">
          {STEPS.map((step, i) => (
            <div key={i} className="step-row">
              <div className="step-row__divider"></div>
              <div className="step-row__inner">
                <span className="step-row__num">{step.num}</span>
                <div className="step-row__content">
                  <h3 className="step-row__title">{step.title}</h3>
                  <p className="step-row__desc">{step.desc}</p>
                </div>
                <div className="step-row__time">
                  <span className="step-row__time-label">{step.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
