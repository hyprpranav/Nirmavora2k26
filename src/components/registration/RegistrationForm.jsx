import { useState } from 'react';
import {
  SDG_GOALS,
  DEPARTMENTS,
  YEARS,
  EVENT,
} from '../../config/constants';

const initialForm = {
  collegeName: '',
  teamName: '',
  sdgGoal: '',
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
    if (!form.sdgGoal) e.sdgGoal = 'Required';
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
            <label>SDG Goal *</label>
            <select name="sdgGoal" value={form.sdgGoal} onChange={onChange}>
              <option value="">Select SDG</option>
              {SDG_GOALS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.sdgGoal && <span className="form-error">{errors.sdgGoal}</span>}
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
