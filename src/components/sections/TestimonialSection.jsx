import '../../styles/sections/TestimonialSection.css'

const PAIN_DATA = [
  { week: 'Week 1', score: '8/10', pct: 80 },
  { week: 'Week 2', score: '7/10', pct: 70 },
  { week: 'Week 4', score: '5/10', pct: 50 },
  { week: 'Week 6', score: '3/10', pct: 30 },
  { week: 'Week 8', score: '2/10', pct: 20 },
]

export default function TestimonialSection() {
  return (
    <section className="testimonial" id="testimonial">
      <div className="testimonial__container container">
        {/* Quote */}
        <div className="testimonial__quote-side">
          <p className="mono-label">Patient story</p>
          <blockquote className="testimonial__quote">
            "After 12 years of phantom pain, I had my first pain-free morning 
            three weeks into my VISENSA programme."
          </blockquote>
          <div className="testimonial__author">
            <div className="testimonial__avatar">R</div>
            <div className="testimonial__author-info">
              <span className="testimonial__author-name">Robert M.</span>
              <span className="testimonial__author-desc">Above-elbow amputee · 8 weeks on programme</span>
            </div>
          </div>
        </div>

        {/* Pain Journey Chart */}
        <div className="testimonial__chart-side">
          <p className="mono-label">Robert's pain journey</p>
          <div className="pain-chart">
            {PAIN_DATA.map((row, i) => (
              <div key={i} className="pain-chart__row">
                <span className="pain-chart__week">{row.week}</span>
                <div className="pain-chart__bar-wrap">
                  <div
                    className="pain-chart__bar"
                    style={{ width: `${row.pct}%` }}
                  ></div>
                </div>
                <span className="pain-chart__score">{row.score}</span>
              </div>
            ))}
          </div>
          <div className="testimonial__result">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 12V6M12 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Pain reduced from <strong>8/10 &rarr; 2/10</strong> over 8 weeks</span>
          </div>
        </div>
      </div>
    </section>
  )
}
