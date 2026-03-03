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

        <div className="tracks-grid">
          <div className="track-group">
            <h3><i className="fas fa-laptop-code"></i> Software Tracks</h3>
            <div className="track-cards">
              {HACKATHON_TRACKS.software.map((track, i) => (
                <div key={i} className="track-card">
                  <span className="track-number">S{i + 1}</span>
                  <p>{track}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="track-group">
            <h3><i className="fas fa-microchip"></i> Hardware Tracks</h3>
            <div className="track-cards">
              {HACKATHON_TRACKS.hardware.map((track, i) => (
                <div key={i} className="track-card">
                  <span className="track-number">H{i + 1}</span>
                  <p>{track}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
