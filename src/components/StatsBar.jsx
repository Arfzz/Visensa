import './StatsBar.css'

const STATS = [
  { value: '94%', label: 'Session completion rate' },
  { value: '42%', label: 'Average pain reduction' },
  { value: '200+', label: 'Peer-reviewed studies' },
  { value: '0', label: 'Hardware required' },
]

export default function StatsBar() {
  return (
    <section className="stats-bar" id="stats">
      <div className="stats-bar__inner container">
        {STATS.map((stat, i) => (
          <div key={i} className="stats-bar__item">
            <span className="stats-bar__value">{stat.value}</span>
            <span className="stats-bar__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
