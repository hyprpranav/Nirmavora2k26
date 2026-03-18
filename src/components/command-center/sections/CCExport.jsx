import React from 'react';

export default function CCExport({ teams, users }) {
  /* Dynamic imports so the module is only loaded when export page is reached */
  async function doExport(fn, data) {
    const mod = await import('../../../services/exportService');
    mod[fn](data || teams);
  }

  return (
    <div className="cc-section">
      <h3>Export Data</h3>

      {/* Warning Note */}
      <div className="cc-note cc-note-warning">
        <i className="fas fa-exclamation-triangle"></i>
        <div>
          <strong>Important:</strong> If you plan to make edits to team data, download a backup first.
          Exports always reflect the latest data. Download the current copy before making changes so
          you have a backup for reference.
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 20 }}>
        Download CSV files from the current team data.
      </p>

      <div className="cc-export-grid">
        <button className="cc-export-btn" onClick={() => doExport('exportMasterLogCSV')}>
          <i className="fas fa-file-csv"></i> Master Log
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportHackathonMasterLogCSV')}>
          <i className="fas fa-file-csv"></i> Hackathon Master Log
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportDesignathonMasterLogCSV')}>
          <i className="fas fa-file-csv"></i> Designathon Master Log
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportTeamSummaryCSV')}>
          <i className="fas fa-file-csv"></i> Team Summary
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportCertificateCSV')}>
          <i className="fas fa-file-csv"></i> Certificate Data (Marked Teams)
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportCertificateAllTeamsCSV')}>
          <i className="fas fa-file-csv"></i> Certificate Data (All Teams)
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportSignatureSheetCSV')}>
          <i className="fas fa-signature"></i> Signature / Audition Sheet
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportTeamIdCSV')}>
          <i className="fas fa-file-csv"></i> Team ID + Names
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportTeamContactSheetCSV')}>
          <i className="fas fa-address-book"></i> Team Contact Sheet
        </button>
      </div>

      <h4 style={{ color: '#F5B301', marginTop: 28, marginBottom: 12 }}><i className="fas fa-users" style={{ marginRight: 8 }}></i>User Data Exports</h4>
      <div className="cc-export-grid">
        <button className="cc-export-btn" onClick={() => doExport('exportAllUsersCSV', users)}>
          <i className="fas fa-file-csv"></i> All Users Log
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportParticipantUsersCSV', users)}>
          <i className="fas fa-file-csv"></i> Participants Only
        </button>
      </div>
    </div>
  );
}
