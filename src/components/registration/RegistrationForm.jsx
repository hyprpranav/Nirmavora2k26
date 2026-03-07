import { useState, useRef, useEffect } from 'react';
import {
  SDG_GOALS,
  DEPARTMENTS,
  YEARS,
  EVENT,
} from '../../config/constants';

const initialForm = {
  collegeName: '',
  teamName: '',
  sdgGoals: [],
  problemTitle: '',
  miniDescription: '',
  leaderName: '',
  leaderPhone: '',
  leaderEmail: '',
  member1Name: '',
  member1Phone: '',
  member1Email: '',
  member2Name: '',
  member2Phone: '',
  member2Email: '',
  member3Name: '',
  member3Phone: '',
  member3Email: '',
  department: '',
  year: '',
  guideName: '',
  guideEmail: '',
  abstractFile: null,
};

export default function RegistrationForm({ eventType, onNext }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.collegeName.trim()) e.collegeName = 'Required';
    if (!form.teamName.trim()) e.teamName = 'Required';
    if (!form.sdgGoals || form.sdgGoals.length === 0) e.sdgGoals = 'Select at least one SDG goal';
    if (!form.problemTitle.trim()) e.problemTitle = 'Required';
    if (!form.leaderName.trim()) e.leaderName = 'Required';
    if (!form.leaderPhone.match(/^\d{10}$/)) e.leaderPhone = 'Enter 10-digit phone';
    if (!form.leaderEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.leaderEmail = 'Invalid email';
    if (!form.member1Name.trim()) e.member1Name = 'Required';
    if (!form.member2Name.trim()) e.member2Name = 'Required';
    if (!form.department) e.department = 'Required';
    if (!form.year) e.year = 'Required';
    if (!form.abstractFile) e.abstractFile = 'Please upload your abstract file (PDF, PNG, JPG, or Word)';
    else {
      const ext = form.abstractFile.name.split('.').pop().toLowerCase();
      if (!['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'].includes(ext))
        e.abstractFile = 'Allowed formats: PDF, PNG, JPG, DOCX';
      else if (form.abstractFile.size > 10 * 1024 * 1024)
        e.abstractFile = 'File too large. Maximum 10 MB.';
    }
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    onNext(form);
  }

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      {/* College & Team */}
      <fieldset>
        <legend>Team Details</legend>
        <div className="form-row">
          <div className="form-group">
            <label>College Name *</label>
            <input name="collegeName" value={form.collegeName} onChange={onChange} />
            {errors.collegeName && <span className="form-error">{errors.collegeName}</span>}
          </div>
          <div className="form-group">
            <label>Team Name *</label>
            <input name="teamName" value={form.teamName} onChange={onChange} />
            {errors.teamName && <span className="form-error">{errors.teamName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>SDG Goals * <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>(select one or more)</span></label>
            <SDGMultiSelect
              selected={form.sdgGoals}
              onChange={(vals) => {
                setForm((f) => ({ ...f, sdgGoals: vals }));
                setErrors((prev) => ({ ...prev, sdgGoals: '' }));
              }}
            />
            {form.sdgGoals.length > 0 && (
              <p style={{ fontSize: '0.82rem', marginTop: 6, color: 'var(--accent)' }}>
                {form.sdgGoals.length} SDG{form.sdgGoals.length > 1 ? 's' : ''} selected
              </p>
            )}
            {errors.sdgGoals && <span className="form-error">{errors.sdgGoals}</span>}
          </div>
          <div className="form-group">
            <label>Event Type</label>
            <input value={eventType === 'designathon' ? 'Designathon' : 'Hackathon'} readOnly />
          </div>
        </div>

        <div className="form-group">
          <label>Problem Title *</label>
          <input name="problemTitle" value={form.problemTitle} onChange={onChange} />
          {errors.problemTitle && <span className="form-error">{errors.problemTitle}</span>}
        </div>
        <div className="form-group">
          <label>Mini Description (Optional)</label>
          <textarea name="miniDescription" value={form.miniDescription} onChange={onChange} rows={3} />
        </div>
      </fieldset>

      {/* Team Leader */}
      <fieldset>
        <legend>Team Leader</legend>
        <div className="form-row three">
          <div className="form-group">
            <label>Name *</label>
            <input name="leaderName" value={form.leaderName} onChange={onChange} />
            {errors.leaderName && <span className="form-error">{errors.leaderName}</span>}
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input name="leaderPhone" value={form.leaderPhone} onChange={onChange} maxLength={10} />
            {errors.leaderPhone && <span className="form-error">{errors.leaderPhone}</span>}
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="leaderEmail" type="email" value={form.leaderEmail} onChange={onChange} />
            {errors.leaderEmail && <span className="form-error">{errors.leaderEmail}</span>}
          </div>
        </div>
      </fieldset>

      {/* Members */}
      <fieldset>
        <legend>Team Members</legend>
        {[1, 2, 3].map((n) => (
          <div key={n} className="form-row three">
            <div className="form-group">
              <label>Member {n} Name {n <= 2 ? '*' : '(Optional)'}</label>
              <input name={`member${n}Name`} value={form[`member${n}Name`]} onChange={onChange} />
              {errors[`member${n}Name`] && <span className="form-error">{errors[`member${n}Name`]}</span>}
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name={`member${n}Phone`} value={form[`member${n}Phone`]} onChange={onChange} maxLength={10} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name={`member${n}Email`} type="email" value={form[`member${n}Email`]} onChange={onChange} />
            </div>
          </div>
        ))}
      </fieldset>

      {/* Dept & Year */}
      <fieldset>
        <legend>Academic Info</legend>
        <div className="form-row">
          <div className="form-group">
            <label>Department *</label>
            <select name="department" value={form.department} onChange={onChange}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && <span className="form-error">{errors.department}</span>}
          </div>
          <div className="form-group">
            <label>Year *</label>
            <select name="year" value={form.year} onChange={onChange}>
              <option value="">Select Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.year && <span className="form-error">{errors.year}</span>}
          </div>
        </div>
      </fieldset>

      {/* Guide Details (optional) */}
      <fieldset>
        <legend>Guide Details <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>(Optional)</span></legend>
        <div className="form-row">
          <div className="form-group">
            <label>Guide Name</label>
            <input name="guideName" value={form.guideName} onChange={onChange} placeholder="Faculty guide name (if any)" />
          </div>
          <div className="form-group">
            <label>Guide Email</label>
            <input name="guideEmail" type="email" value={form.guideEmail} onChange={onChange} placeholder="Guide email (if any)" />
          </div>
        </div>
      </fieldset>

      {/* Abstract */}
      <fieldset>
        <legend>Abstract</legend>
        <div className="form-group">
          <label>Upload Abstract File *</label>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
            Accepted formats: PDF, PNG, JPG, Word (.docx) — Max 10 MB
          </p>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files[0] || null;
              setForm((f) => ({ ...f, abstractFile: file }));
              setErrors((prev) => ({ ...prev, abstractFile: '' }));
            }}
            style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', width: '100%' }}
          />
          {form.abstractFile && (
            <p style={{ fontSize: '0.85rem', marginTop: 6, color: 'var(--accent)' }}>
              <i className="fas fa-file"></i> {form.abstractFile.name} ({(form.abstractFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
          {errors.abstractFile && <span className="form-error">{errors.abstractFile}</span>}
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-large">
          <i className="fas fa-arrow-right"></i> Review &amp; Submit
        </button>
      </div>
    </form>
  );
}

/* ─── SDG Multi-Select Dropdown with Checkboxes ─── */
function SDGMultiSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleSDG(value) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function selectAll() {
    onChange(SDG_GOALS.map((s) => s.value));
  }

  function clearAll() {
    onChange([]);
  }

  const displayText =
    selected.length === 0
      ? 'Select SDG Goals…'
      : selected.length === 17
        ? 'All 17 SDGs selected'
        : `${selected.length} SDG${selected.length > 1 ? 's' : ''} selected`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          color: selected.length > 0 ? '#fff' : 'rgba(255,255,255,0.4)',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '0.95rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{displayText}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', opacity: 0.5 }}></i>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 320,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Select All / Clear All */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              position: 'sticky',
              top: 0,
              background: '#1a1a2e',
              zIndex: 1,
            }}
          >
            <button
              type="button"
              onClick={selectAll}
              style={{ fontSize: '0.8rem', color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              ✓ Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              style={{ fontSize: '0.8rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              ✗ Clear All
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginLeft: 'auto' }}
            >
              Done ✓
            </button>
          </div>

          {/* SDG checkboxes */}
          {SDG_GOALS.map((s) => (
            <label
              key={s.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: selected.includes(s.value) ? 'rgba(245,179,1,0.08)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = selected.includes(s.value) ? 'rgba(245,179,1,0.08)' : 'transparent')}
            >
              <input
                type="checkbox"
                checked={selected.includes(s.value)}
                onChange={() => toggleSDG(s.value)}
                style={{ accentColor: 'var(--accent)', width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.88rem', color: selected.includes(s.value) ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                {s.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
