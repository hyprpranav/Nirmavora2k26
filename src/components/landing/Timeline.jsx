import { TIMELINE, EVENT } from '../../config/constants';

const TAG_LABELS = {
  both:        { label: 'Both Events',   color: 'var(--accent)' },
  hackathon:   { label: 'Hackathon',     color: 'var(--secondary)' },
  designathon: { label: 'Designathon',   color: '#7C6FF7' },
};

export default function Timeline() {
  return (
    <section id="timeline" className="section timeline-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Event Day</span>
          <h2 className="section-title">
            Event <span className="highlight">Timeline</span>
          </h2>
          <p className="section-description">{EVENT.dateDisplay} &nbsp;·&nbsp; 8:30 AM – 6:00 PM</p>
        </div>

        {/* Legend */}
        <div className="timeline-legend">
          {Object.entries(TAG_LABELS).map(([key, t]) => (
            <span key={key} className="tl-legend-item">
              <span className="tl-legend-dot" style={{ background: t.color }}></span>
              {t.label}
            </span>
          ))}
        </div>

        <div className="timeline">
          {TIMELINE.map((item, i) => {
            const tag = TAG_LABELS[item.tag] || TAG_LABELS.both;
            return (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{ borderColor: tag.color }}>
                  <i className={item.icon} style={{ color: tag.color, fontSize: '0.75rem' }}></i>
                </div>
                <div className="timeline-content">
                  <div className="tl-header">
                    <span className="timeline-time">{item.time}</span>
                    <span className="tl-tag" style={{ background: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}55` }}>
                      {tag.label}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="event-info-panel">
          <h4 className="eip-title"><i className="fas fa-info-circle"></i> On-Day Information</h4>
          <div className="eip-grid">

            <div className="eip-item">
              <i className="fas fa-utensils"></i>
              <div>
                <strong>Refreshments Provided</strong>
                <p>Morning refreshment &amp; evening refreshment are provided by the organisers. <strong>Breakfast, lunch, and dinner are NOT included</strong> in the registration.</p>
              </div>
            </div>

            <div className="eip-item">
              <i className="fas fa-store"></i>
              <div>
                <strong>College Canteen</strong>
                <p>The college mess will be <strong>closed</strong> on event day. The college canteen will be open till <strong>8:30 PM</strong>. Participants who wish to have dinner before leaving campus can grab it from the canteen.</p>
              </div>
            </div>

            <div className="eip-item">
              <i className="fas fa-bus"></i>
              <div>
                <strong>Bus Facility (College → Karur Bus Stand)</strong>
                <p>If you need bus transport from college to Karur Bus Stand after the event, please <strong>intimate the organisers in advance</strong>. Contact them via the <a href="#contact">Contact section</a> below.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
