import React from 'react';

export default function CCExport({ teams }) {
  /* Dynamic imports so the module is only loaded when export page is reached */
  async function doExport(fn) {
    const mod = await import('../../../services/exportService');
    mod[fn](teams);
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
        <button className="cc-export-btn" onClick={() => doExport('exportTeamSummaryCSV')}>
          <i className="fas fa-file-csv"></i> Team Summary
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportCertificateCSV')}>
          <i className="fas fa-file-csv"></i> Certificate Data
        </button>
        <button className="cc-export-btn" onClick={() => doExport('exportTeamIdCSV')}>
          <i className="fas fa-file-csv"></i> Team ID + Names
        </button>
      </div>
    </div>
  );
}
