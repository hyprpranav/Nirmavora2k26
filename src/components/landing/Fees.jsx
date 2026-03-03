import { EVENT, FACILITIES } from '../../config/constants';

export default function Fees() {
  return (
    <section id="fees" className="section fees-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Registration Fee</span>
          <h2 className="section-title">
            Fees &amp; <span className="highlight">Facilities</span>
          </h2>
        </div>

        <div className="fees-content">
          <div className="fee-card main-fee">
            <h3>₹{EVENT.feePerHead}</h3>
            <p>per participant</p>
            <span className="team-size">Team Size: {EVENT.teamMin}–{EVENT.teamMax} members</span>
          </div>

          <div className="facilities-grid">
            {FACILITIES.map((f) => (
              <div key={f} className="facility-item">
                <i className="fas fa-check-circle"></i>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
