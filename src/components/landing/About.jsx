import { EVENT, ORGANISERS, SDG_GOALS } from '../../config/constants';

export default function About() {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About The Event</span>
          <h2 className="section-title">
            What is <span className="highlight">NIRMAVORA</span>?
          </h2>
        </div>

        <div className="about-content">
          <p className="about-intro">
            <strong>{EVENT.name}</strong> is a prestigious National-Level{' '}
            <span className="highlight">Designathon cum Hackathon</span> that brings together
            brilliant minds from across the nation to solve real-world challenges through
            innovative engineering solutions.
          </p>
          <p>Nirmāṇa + ora → Creation · Construction · Engineering Excellence</p>

          <div className="about-grid">
            <div className="about-card">
              <i className="fas fa-handshake"></i>
              <h4>Joint Initiative</h4>
              <p>{ORGANISERS.departments.join(' & ')}</p>
            </div>
            <div className="about-card">
              <i className="fas fa-globe-americas"></i>
              <h4>SDG-Focused</h4>
              <p>All projects aligned with UN Sustainable Development Goals</p>
            </div>
            <div className="about-card">
              <i className="fas fa-university"></i>
              <h4>All Departments Welcome</h4>
              <p>Open to all BE, B.Tech & UG/PG students across every discipline</p>
            </div>
            <div className="about-card">
              <i className="fas fa-trophy"></i>
              <h4>National Recognition</h4>
              <p>Platform for showcasing innovation at the national level</p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card"><h3>2</h3><p>Events</p></div>
            <div className="stat-card"><h3>6</h3><p>SDG Focus</p></div>
            <div className="stat-card"><h3>8</h3><p>Hour Hackathon</p></div>
            <div className="stat-card"><h3>∞</h3><p>Opportunities</p></div>
          </div>

          {/* SDG Focus badges */}
          <div className="sdg-focus-section">
            <h4 className="sdg-focus-title"><i className="fas fa-globe-americas"></i> Our 6 SDG Focus Areas</h4>
            <p className="sdg-focus-sub">Hover over each goal to see how NIRMAVORA addresses it</p>
            <div className="sdg-badges">
              {SDG_GOALS.map((sdg) => (
                <div key={sdg.value} className="sdg-badge" style={{ '--sdg-color': sdg.color }}>
                  <span className="sdg-number">{sdg.value}</span>
                  <span className="sdg-short">{sdg.label.split('–')[1]?.trim()}</span>
                  <div className="sdg-tooltip">
                    <strong>{sdg.label}</strong>
                    <p>{sdg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
