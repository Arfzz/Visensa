import './FeaturesSection.css'

export default function FeaturesSection() {
  return (
    <section className="features" id="technology">
      <div className="features__container container">
        {/* Header */}
        <div className="features__header">
          <p className="mono-label">What makes VISENSA different</p>
          <h2 className="features__heading">
            Proven therapy.<br />Made for home.
          </h2>
        </div>

        {/* Grid */}
        <div className="features__grid">
          {/* Card 1 — AI Hand Tracking (large, dark) */}
          <div className="feature-card feature-card--dark feature-card--large">
            <div className="feature-card__mono-label mono-label" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Real-time hand tracking
            </div>
            <h3 className="feature-card__heading">
              AI sees 21 hand joints.<br />You focus on healing.
            </h3>
            <p className="feature-card__desc">
              MediaPipe hand tracking runs entirely in your browser. No data leaves your device. 
              Just raise your hand and begin.
            </p>
            <div className="feature-card__hand-viz">
              <FeatureHandViz />
            </div>
          </div>

          {/* Card 2 — Zero Hardware */}
          <div className="feature-card feature-card--light feature-card--top-right">
            <div className="feature-card__emoji">💻</div>
            <h3 className="feature-card__heading-sm">Zero hardware required</h3>
            <p className="feature-card__desc">
              Any webcam works. No VR headset. No sensors. Just your browser and a camera.
            </p>
          </div>

          {/* Card 3 — Progress you can see */}
          <div className="feature-card feature-card--light feature-card--bottom-left">
            <div className="feature-card__mono-label mono-label">Progress you can see</div>
            <div className="feature-card__chart">
              <ProgressChart />
            </div>
            <div className="feature-card__chart-labels">
              <span>Week 1</span>
              <span>Week 8</span>
            </div>
          </div>

          {/* Card 4 — Clinical Foundation */}
          <div className="feature-card feature-card--light feature-card--bottom-right">
            <div className="feature-card__mono-label mono-label">Clinical foundation</div>
            <div className="feature-card__clinical-header">
              <h3 className="feature-card__heading-sm">
                Built on 30 years of peer-reviewed mirror therapy research.
              </h3>
              <div className="feature-card__big-stat">
                <span className="feature-card__big-num">200+</span>
                <span className="feature-card__big-label">peer-reviewed studies</span>
              </div>
            </div>
            <div className="feature-card__badges">
              <span className="feature-card__badge">✓ NICE Aligned</span>
              <span className="feature-card__badge">✓ CE Mark pending</span>
              <span className="feature-card__badge">✓ GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureHandViz() {
  const joints = [
    [150, 170], [120, 150], [145, 145], [170, 148], [196, 155],
    [108, 140], [135, 115], [158, 115], [182, 120], [202, 130],
    [100, 122], [120, 95], [143, 90], [168, 94], [194, 106],
    [95, 105], [122, 70], [146, 68], [170, 72], [195, 90],
    [108, 100]
  ]
  const connections = [
    [0,1],[0,2],[0,3],[0,4],
    [1,5],[5,10],[10,15],[15,20],
    [2,6],[6,11],[11,16],
    [3,7],[7,12],[12,17],
    [4,8],[8,13],[13,18],
    [4,9],[9,14],[14,19]
  ]
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="feature-hand-svg">
      <g opacity="0.2" stroke="#00C875" strokeWidth="1">
        {connections.map(([a, b], i) => (
          <line
            key={i}
            x1={joints[a][0]} y1={joints[a][1]}
            x2={joints[b][0]} y2={joints[b][1]}
          />
        ))}
      </g>
      {joints.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i === 0 ? 6 : 4} fill="#00C875" opacity={i === 0 ? 1 : 0.7}>
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur={`${2 + i * 0.08}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  )
}

function ProgressChart() {
  const bars = [73, 55, 63, 46, 53, 37, 43, 29, 34, 24]
  const max = 80
  return (
    <div className="progress-chart">
      {bars.map((h, i) => (
        <div
          key={i}
          className="progress-chart__bar"
          style={{ height: `${(h / max) * 100}%` }}
        >
          <div className="progress-chart__bar-fill" style={{ animationDelay: `${i * 0.08}s` }}></div>
        </div>
      ))}
    </div>
  )
}
