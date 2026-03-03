import React, { useState } from 'react';
import { sendTestEmail, sendNotification, wakeUpEmailService } from '../../../config/emailjs';

export default function CCEmail() {
  /* Test email */
  const [testAddr, setTestAddr] = useState('');
  const [testStatus, setTestStatus] = useState('');

  /* Notification */
  const [notifAddr, setNotifAddr] = useState('');
  const [notifSubject, setNotifSubject] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifStatus, setNotifStatus] = useState('');

  async function handleTest() {
    if (!testAddr.includes('@')) return setTestStatus('Enter a valid email.');
    setTestStatus('Sending…');
    try {
      await wakeUpEmailService();
      await sendTestEmail(testAddr);
      setTestStatus('✅ Test email sent! Check inbox.');
    } catch (err) {
      setTestStatus(`❌ Failed: ${err.message}`);
    }
  }

  async function handleNotify() {
    if (!notifAddr.includes('@')) return setNotifStatus('Enter a valid email.');
    if (!notifMessage.trim()) return setNotifStatus('Enter a message.');
    setNotifStatus('Sending…');
    try {
      await sendNotification(notifAddr, '', notifSubject || 'NIRMAVORA Update', notifMessage);
      setNotifStatus('✅ Notification sent!');
      setNotifAddr('');
      setNotifSubject('');
      setNotifMessage('');
    } catch (err) {
      setNotifStatus(`❌ Failed: ${err.message}`);
    }
  }

  return (
    <>
      <div className="cc-section">
        <h3><i className="fas fa-flask" style={{ marginRight: 8, color: '#6366f1' }}></i>Test Email</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 14 }}>
          Verify your email service is working correctly.
        </p>
        <div className="cc-form-row">
          <input
            type="email"
            className="cc-input"
            placeholder="your-email@gmail.com"
            value={testAddr}
            onChange={e => setTestAddr(e.target.value)}
          />
          <button className="cc-btn primary" onClick={handleTest}>Send Test</button>
        </div>
        {testStatus && <p className={`cc-msg ${testStatus.startsWith('✅') ? 'success' : testStatus.startsWith('❌') ? 'error' : ''}`}>{testStatus}</p>}
      </div>

      <div className="cc-section">
        <h3><i className="fas fa-bell" style={{ marginRight: 8, color: '#FF9800' }}></i>Send Notification</h3>
        <div className="cc-form-group">
          <label>Recipient Email</label>
          <input
            type="email"
            className="cc-input"
            placeholder="participant@email.com"
            value={notifAddr}
            onChange={e => setNotifAddr(e.target.value)}
          />
        </div>
        <div className="cc-form-group">
          <label>Subject</label>
          <input
            className="cc-input"
            placeholder="NIRMAVORA Update (optional)"
            value={notifSubject}
            onChange={e => setNotifSubject(e.target.value)}
          />
        </div>
        <div className="cc-form-group">
          <label>Message</label>
          <textarea
            className="cc-textarea"
            rows={4}
            placeholder="Write your notification message..."
            value={notifMessage}
            onChange={e => setNotifMessage(e.target.value)}
          />
        </div>
        <button className="cc-btn primary" onClick={handleNotify}>Send Notification</button>
        {notifStatus && <p className={`cc-msg ${notifStatus.startsWith('✅') ? 'success' : notifStatus.startsWith('❌') ? 'error' : ''}`}>{notifStatus}</p>}
      </div>
    </>
  );
}
