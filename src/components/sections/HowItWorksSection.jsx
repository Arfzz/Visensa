import '../../styles/sections/HowItWorksSection.css'

const STEPS = [
  {
    num: '01',
    title: 'Open in your browser',
    desc: 'No download, no app store, no account for your first session. Works in Chrome or Edge on any laptop.',
    time: '~30 seconds',
    variant: 'blue'
  },
  {
    num: '02',
    title: 'Allow camera and calibrate',
    desc: 'Camera access is processed entirely on your device. Position your hand — AI finds your 21 joints in seconds.',
    time: '~2 minutes',
    variant: 'teal'
  },
  {
    num: '03',
    title: 'Begin your mirror therapy session',
    desc: 'Follow guided movements at your pace. The mirrored hand provides the visual feedback your brain needs to rewire.',
    time: '~12 minutes',
    variant: 'green'
  },
]

export default function HowItWorksSection() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container container">
        {/* Header */}
        <div className="how-it-works__header">
          <div className="how-it-works__header-text">
            <p className="mono-label how-it-works__mono-label">YOUR FIRST SESSION</p>
            <h2 className="how-it-works__heading">
              From browser to therapy<br />in under 4 minutes.
            </h2>
          </div>
          <a href="#" className="how-it-works__cta" id="how-it-works-start-now">
            Start now
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Steps */}
        <div className="how-it-works__steps">
          {STEPS.map((step, i) => (
            <div key={i} className={`step-card step-card--${step.variant}`}>
              <div className="step-card__num">{step.num}</div>
              <div className="step-card__content">
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
              </div>
              <div className="step-card__time">
                <span className="step-card__time-label">{step.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
