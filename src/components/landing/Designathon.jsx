import { useState } from 'react';
import { DESIGNATHON_THEMES } from '../../config/constants';

function ThemeAccordion({ themes, groupLabel, groupIcon }) {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <div className="theme-group">
      <h3><i className={groupIcon}></i> {groupLabel}</h3>
      <div className="theme-accordion">
        {themes.map((theme, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`accordion-item${isOpen ? ' open' : ''}`}>
              <button className="accordion-header" onClick={() => toggle(i)}>
                <span className="theme-number">{String(i + 1).padStart(2, '0')}</span>
                <i className={theme.icon} style={{ color: 'var(--accent)', minWidth: 18 }}></i>
                <span className="accordion-title">{theme.title}</span>
                <i className={`fas fa-chevron-down accordion-chevron${isOpen ? ' rotated' : ''}`}></i>
              </button>
              {isOpen && (
                <ul className="accordion-body">
                  {theme.items.map((item, j) => (
                    <li key={j}>
                      <i className="fas fa-angle-right"></i> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Designathon() {
  return (
    <section id="designathon" className="section designathon-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Event 1</span>
          <h2 className="section-title">
            <span className="highlight">Designathon</span>
          </h2>
          <p className="section-description">Design solutions for real-world challenges — click a theme to explore</p>
        </div>

        <div className="themes-grid">
          <ThemeAccordion
            themes={DESIGNATHON_THEMES.civil}
            groupLabel="Civil Engineering Themes"
            groupIcon="fas fa-hard-hat"
          />
          <ThemeAccordion
            themes={DESIGNATHON_THEMES.mechanical}
            groupLabel="Mechanical Engineering Themes"
            groupIcon="fas fa-cog"
          />
        </div>
      </div>
    </section>
  );
}
