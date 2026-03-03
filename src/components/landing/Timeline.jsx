import { TIMELINE, CANTEEN, EVENT } from '../../config/constants';

export default function Timeline() {
  return (
    <section id="timeline" className="section timeline-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Event Day</span>
          <h2 className="section-title">
            Event <span className="highlight">Timeline</span>
          </h2>
          <p className="section-description">{EVENT.dateDisplay}</p>
        </div>

        <div className="timeline">
          {TIMELINE.map((item, i) => (
            <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <span className="timeline-time">{item.time}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
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
