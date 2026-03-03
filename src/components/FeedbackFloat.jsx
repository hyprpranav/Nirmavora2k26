import { useSettings } from '../contexts/SettingsContext';
import '../styles/feedback-float.css';

const FEEDBACK_URL = ''; // Placeholder — admin will provide Google Form link later

export default function FeedbackFloat() {
  const { settings } = useSettings();

  if (!settings.feedbackEnabled || !FEEDBACK_URL) return null;

  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="feedback-float"
      title="Share Feedback"
    >
      <i className="fas fa-comment-dots"></i>
      <span className="feedback-float-label">Feedback</span>
    </a>
  );
}
