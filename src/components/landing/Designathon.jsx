import { DESIGNATHON_THEMES } from '../../config/constants';

export default function Designathon() {
  return (
    <section id="designathon" className="section designathon-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Event 1</span>
          <h2 className="section-title">
            <span className="highlight">Designathon</span>
          </h2>
          <p className="section-description">Design solutions for real-world challenges</p>
        </div>

        <div className="themes-grid">
          <div className="theme-group">
            <h3><i className="fas fa-hard-hat"></i> Civil Engineering Themes</h3>
            <div className="theme-cards">
              {DESIGNATHON_THEMES.civil.map((theme, i) => (
                <div key={i} className="theme-card">
                  <span className="theme-number">{String(i + 1).padStart(2, '0')}</span>
                  <p>{theme}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-group">
            <h3><i className="fas fa-cog"></i> Mechanical Engineering Themes</h3>
            <div className="theme-cards">
              {DESIGNATHON_THEMES.mechanical.map((theme, i) => (
                <div key={i} className="theme-card">
                  <span className="theme-number">{String(i + 1).padStart(2, '0')}</span>
                  <p>{theme}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
