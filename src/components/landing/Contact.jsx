import { useState, useEffect } from 'react';
import { EVENT, DEVELOPER } from '../../config/constants';

const STAFF = [
  {
    name: 'Dr. Saravanan M',
    dept: 'Civil Engineering',
    qual: 'M.E., Ph.D., Professor',
    img: '/coordinators/Saravan%20Sir.jpeg',
  },
  {
    name: 'Dr. G.R. Gopinath',
    dept: 'Mechanical Engineering',
    qual: 'M.E., Ph.D., Assistant Professor',
    img: '/coordinators/image.png',
  },
];

const CIVIL_STUDENTS = [
  { name: 'S.J. Jeevanantham', role: 'President',          phone: '+91 9982531002', email: 'jeevaselvaraj1981@gmail.com',  img: '/coordinators/Jeeva.jpg' },
  { name: 'Ruthuvarshan',       role: 'Vice President',    phone: '+91 9982531002', email: 'entrepix.ici@gmail.com',        img: '/coordinators/Ruthu.jpg' },
  { name: 'Jai Narendiran',     role: 'Secretary',         phone: '+91 9982531002', email: 'entrepix.ici@gmail.com',        img: '/coordinators/jai_page-0001.jpg' },
  { name: 'Harish Pranav S',    role: 'Treasurer',         phone: '+91 7845693765', email: 'harishpranavs259@gmail.com',    img: '/coordinators/Harish%20Pranav.jpg' },
  { name: 'M. Nagaraj',         role: 'Event Coordinator', phone: '+91 9982531002', email: 'entrepix.ici@gmail.com',        img: '/coordinators/Event%20Coordinator.jpg' },
  { name: 'A. Heman',           role: 'Event Coordinator', phone: '+91 9982531002', email: 'entrepix.ici@gmail.com',        img: '/coordinators/Heman.jpg' },
];

const MECH_STUDENTS = [
  { name: 'Harishwaran B',       role: 'President',          phone: '+91 7200776251', email: 'harishwarankarate@gmail.com',  img: '/coordinators/image%20copy.png' },
  { name: 'Sharoopa Sri S B',    role: 'Vice President',     phone: '+91 6374192701', email: 'sharoopasri36@gmail.com',      img: '/coordinators/image%20copy%202.png' },
  { name: 'Karthic S',           role: 'Secretary',          phone: '+91 6374995123', email: 'karthicselvan55@gmail.com',    img: '/coordinators/image%20copy%203.png' },
  { name: 'Sivakavin S',         role: 'Treasurer',          phone: '+91 9626967696', email: 'sivakavin22@gmail.com',        img: '/coordinators/image%20copy%204.png' },
  { name: 'Kumaravel Kumar',     role: 'Event Coordinator',  phone: '—',              email: 'contact@nirmavora.com',        img: '/coordinators/image%20copy%205.png' },
  { name: 'Nishanth Amuthan V',  role: 'Event Coordinator',  phone: '+91 9342623353', email: 'nishanthveluchamy@gmail.com',  img: '/coordinators/image%20copy%206.png' },
];

function CoordModal({ type, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="coord-overlay" onClick={onClose}>
      <div className="coord-modal" onClick={(e) => e.stopPropagation()}>
        <button className="coord-modal-close" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>

        {type === 'staff' ? (
          <>
            <div className="coord-modal-header">
              <span className="section-tag">Leadership</span>
              <h3>Staff <span className="highlight">Coordinators</span></h3>
              <p>Guiding NIRMAVORA 2K26 to Excellence</p>
            </div>
            <div className="staff-cards">
              {STAFF.map((s) => (
                <div key={s.name} className="staff-card">
                  <div className="staff-photo">
                    <img src={s.img} alt={s.name} onError={(e) => { e.target.style.display='none'; }} />
                  </div>
                  <p className="staff-dept">{s.dept.toUpperCase()}</p>
                  <h4>{s.name}</h4>
                  <p className="staff-qual">{s.qual}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="coord-modal-header">
              <span className="section-tag">Event Team</span>
              <h3>Student <span className="highlight">Coordinators</span></h3>
              <p>Your Point of Contact</p>
            </div>
            <div className="student-dept-grid">
              {[{ label: 'Civil Engineering', icon: 'fas fa-hard-hat', list: CIVIL_STUDENTS }, { label: 'Mechanical Engineering', icon: 'fas fa-cog', list: MECH_STUDENTS }].map((dept) => (
                <div key={dept.label} className="student-dept-col">
                  <h4 className="student-dept-title">
                    <i className={dept.icon}></i> {dept.label}
                  </h4>
                  {dept.list.map((c) => (
                    <div key={c.name} className="student-coord-item">
                      <div className="student-coord-photo">
                        <img src={c.img} alt={c.name} onError={(e) => { e.target.style.display='none'; }} />
                      </div>
                      <div className="student-coord-info">
                        <h5>{c.name}</h5>
                        <p className="sc-role">{c.role}</p>
                        <p><i className="fas fa-phone"></i> {c.phone}</p>
                        <p><i className="fas fa-envelope"></i> {c.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Contact() {
  const [modal, setModal] = useState(null); // 'staff' | 'student' | null

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
            <i className="fas fa-building"></i>
            <h4>Organised By</h4>
            <p>Civil Engineering Club</p>
            <p>Mechanical Engineering Club</p>
          </div>
          <div className="contact-card">
            <i className="fas fa-share-alt"></i>
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://www.instagram.com/mkcekarur" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/mkce" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
              <a href="https://x.com/KarurMkce" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="https://www.facebook.com/share/1Bs9MmpMVv/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
            </div>
          </div>

          {/* Coordinator cards — open modals */}
          <div className="contact-card contact-card-clickable" role="button" tabIndex={0} onClick={() => setModal('staff')} onKeyDown={(e) => e.key === 'Enter' && setModal('staff')}>
            <i className="fas fa-chalkboard-teacher"></i>
            <h4>Staff Coordinators</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Guiding NIRMAVORA 2K26</p>
            <span className="cc-cta-btn"><i className="fas fa-eye"></i> View Coordinators</span>
          </div>
          <div className="contact-card contact-card-clickable" role="button" tabIndex={0} onClick={() => setModal('student')} onKeyDown={(e) => e.key === 'Enter' && setModal('student')}>
            <i className="fas fa-users"></i>
            <h4>Student Coordinators</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Civil & Mechanical Clubs</p>
            <span className="cc-cta-btn"><i className="fas fa-eye"></i> View Coordinators</span>
          </div>

          <div className="contact-card contact-card-dev">
            <i className="fas fa-code"></i>
            <h4>Developer / Technical Support</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Facing errors, system issues, or need help?</p>
            <a href={`mailto:${DEVELOPER.email}`}><i className="fas fa-envelope" style={{ marginRight: 6 }}></i>{DEVELOPER.email}</a>
            <a href={`tel:+91${DEVELOPER.phoneRaw}`}><i className="fas fa-phone" style={{ marginRight: 6 }}></i>{DEVELOPER.phone}</a>
          </div>
        </div>
      </div>

      {modal && <CoordModal type={modal} onClose={() => setModal(null)} />}
    </section>
  );
}

