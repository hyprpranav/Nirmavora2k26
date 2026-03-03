export default function HowToReach() {
  return (
    <section id="location" className="section location-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Venue</span>
          <h2 className="section-title">
            How to <span className="highlight">Reach Us</span>
          </h2>
        </div>

        <div className="location-content">
          <div className="location-info">
            <div className="venue-item">
              <i className="fas fa-university"></i>
              <div>
                <h4>M.Kumarasamy College of Engineering</h4>
                <p>Karur - Trichy Main Road, Thalavapalayam, Karur, Tamil Nadu – 639113</p>
              </div>
            </div>

            <div className="directions-group">
              <div className="direction-card">
                <h4><i className="fas fa-bus"></i> From Karur</h4>
                <p>
                  Board <strong>Bus No. 1</strong> from Karur Old Bus Stand.
                  Inform conductor: <em>Kumarasamy College</em> or <em>Thalavapalayam</em>.
                </p>
              </div>
              <div className="direction-card">
                <h4><i className="fas fa-bus"></i> From Namakkal</h4>
                <p>
                  Board buses toward Karur and alight near <em>Kumarasamy College</em>.
                </p>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/eEGAz1EjbAfpFHEr9"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <i className="fas fa-directions"></i> Get Directions on Google Maps
            </a>
          </div>

          <div className="location-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2697442467447!2d78.0462736!3d11.0542286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baa2c5940c36779%3A0x638aea1962e8ae96!2sM.Kumarasamy%20College%20of%20Engineering%2C%20Autonomous!5e1!3m2!1sen!2sin!4v1707126000000!5m2!1sen!2sin"
              width="100%"
              height="400"
              allowFullScreen
              loading="lazy"
              title="Venue Map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
