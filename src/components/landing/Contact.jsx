import { EVENT } from '../../config/constants';

export default function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Get in Touch</span>
          <h2 className="section-title">
            Contact <span className="highlight">Us</span>
          </h2>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <i className="fas fa-envelope"></i>
            <h4>Email</h4>
            <a href={`mailto:${EVENT.contactEmail}`}>{EVENT.contactEmail}</a>
          </div>
          <div className="contact-card">
            <i className="fas fa-phone"></i>
            <h4>Call</h4>
            <a href="tel:+919962531002">+91 99625 31002</a>
            <a href="tel:+917200776251">+91 72007 76251</a>
          </div>
          <div className="contact-card">
            <i className="fas fa-users"></i>
            <h4>Organised By</h4>
            <p>Civil Engineering Club</p>
            <p>Mechanical Engineering Club</p>
          </div>
          <div className="contact-card">
            <i className="fas fa-share-alt"></i>
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://www.instagram.com/mkcekarur" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/mkce" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://x.com/KarurMkce" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.facebook.com/share/1Bs9MmpMVv/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
