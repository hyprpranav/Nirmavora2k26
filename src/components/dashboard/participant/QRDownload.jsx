import { useEffect, useRef, useState } from 'react';
import { generateTeamQR } from '../../../services/qrService';

export default function QRDownload({ team }) {
  const canvasRef = useRef(null);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (!team.teamId) return;
    generateTeamQR(team).then((url) => setQrUrl(url));
  }, [team]);

  function handleDownload() {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `${team.teamId}_QR.png`;
    a.click();
  }

  if (!team.teamId) {
    return (
      <div className="qr-section-dash">
        <p>QR code will be available after your team is approved and a Team ID is generated.</p>
      </div>
    );
  }

  return (
    <div className="qr-section-dash">
      <h3>Team QR Code</h3>
      <p className="team-id">Team ID: <strong>{team.teamId}</strong></p>

      {qrUrl && (
        <div className="qr-display">
          <img src={qrUrl} alt={`QR for ${team.teamId}`} className="qr-image" />
          <button className="btn btn-primary" onClick={handleDownload}>
            <i className="fas fa-download"></i> Download QR (PNG)
          </button>
        </div>
      )}
    </div>
  );
}
