import { TIMELINE, CANTEEN, EVENT } from '../../config/constants';

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

        <div className="canteen-info">
          <i className="fas fa-utensils"></i>
          <div>
            <p><strong>Canteen:</strong> Morning opens {CANTEEN.morningOpen} · Dinner till {CANTEEN.dinnerClose}</p>
            <p>Participants must assemble by <strong>{EVENT.assembleBy}</strong>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
