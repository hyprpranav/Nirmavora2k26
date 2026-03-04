import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegistrationForm from '../components/registration/RegistrationForm';
import FormSummary from '../components/registration/FormSummary';
import { registerTeam } from '../services/registrationService';
import { uploadAbstract } from '../services/storageService';
import '../styles/forms.css';

export default function RegisterPage() {
  const { eventType } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [step, setStep] = useState('form'); // form | summary | submitting | done
  const [error, setError] = useState('');

  async function handleSubmit() {
    setStep('submitting');
    setError('');
    try {
      /* Upload abstract file to Firebase Storage */
      let abstractData = {};
      if (formData.abstractFile) {
        abstractData = await uploadAbstract(formData.abstractFile, formData.teamName);
      }
      /* Remove the File object before saving to Firestore (can't serialize) */
      const { abstractFile, ...rest } = formData;
      await registerTeam({
        ...rest,
        ...abstractData,
        eventType,
        userId: user.uid,
        userEmail: user.email,
      });
      setStep('done');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Please try again.');
      setStep('summary');
    }
  }

  if (step === 'done') {
    return (
      <section className="register-page">
        <div className="container">
          <div className="success-card">
            <i className="fas fa-check-circle"></i>
            <h2>Registration Submitted!</h2>
            <p>Your team has been registered. Redirecting to dashboard…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="register-page">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">{eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</span>
          <h2 className="section-title">
            Team <span className="highlight">Registration</span>
          </h2>
        </div>

        {step === 'form' && (
          <RegistrationForm
            eventType={eventType}
            onNext={(data) => {
              setFormData(data);
              setStep('summary');
            }}
          />
        )}

        {(step === 'summary' || step === 'submitting') && formData && (
          <FormSummary
            data={formData}
            eventType={eventType}
            onBack={() => setStep('form')}
            onConfirm={handleSubmit}
            submitting={step === 'submitting'}
            error={error}
          />
        )}
      </div>
    </section>
  );
}
