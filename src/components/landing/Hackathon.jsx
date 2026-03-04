import { HACKATHON_TRACKS, EVENT } from '../../config/constants';

export default function Hackathon() {
  return (
    <section id="hackathon" className="section hackathon-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Event 2</span>
          <h2 className="section-title">
            8-Hour <span className="highlight">Hackathon</span>
          </h2>
          <p className="section-description">
            {EVENT.hackathonStart} – {EVENT.hackathonEnd}
          </p>
        </div>

        <div className="tracks-unified">
          <div className="tracks-note">
            <i className="fas fa-laptop-code"></i> Software &nbsp;&amp;&nbsp;
            <i className="fas fa-microchip"></i> Hardware solutions are <strong>applicable for all tracks</strong>
          </div>

          <div className="track-cards track-cards-centered">
            {HACKATHON_TRACKS.map((track) => (
              <div key={track.id} className="track-card">
                <span className="track-number">{track.id}</span>
                <i className={track.icon} style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: 6 }}></i>
                <p>{track.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
