import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generateTeamQR, generateTeamQRForPrint } from "../../../services/qrService";

/** White A4 card: Team Name → QR → Team ID + diagonal watermark */
function buildA4Canvas(team, qrDataUrl) {
  return new Promise((resolve) => {
    const W = 794, H = 1123;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    // ── Diagonal watermark (drawn first, behind everything) ──
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 5); // ~36° diagonal
    ctx.font = "bold 88px 'Times New Roman', Times, serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    // Repeat across the card
    for (let y = -H; y < H; y += 200) {
      ctx.fillText("NIRMAVORA 2K26", 0, y);
    }
    ctx.restore();

    // ── Team Name — top, large serif ──
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    let fontSize = 60;
    ctx.font = `bold ${fontSize}px 'Times New Roman', Times, serif`;
    while (ctx.measureText(team.teamName || "").width > W - 80 && fontSize > 26) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px 'Times New Roman', Times, serif`;
    }
    ctx.fillText(team.teamName || "", W / 2, 118);

    // ── QR Code — centre ──
    const img = new Image();
    img.onload = () => {
      const qrSize = 630;
      const qrX = (W - qrSize) / 2;
      const qrY = 152;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // ── Team ID — below QR, elegant serif ──
      ctx.fillStyle = "#222222";
      ctx.font = "bold italic 30px 'Times New Roman', Times, serif";
      ctx.textAlign = "center";
      ctx.fillText(team.teamId, W / 2, qrY + qrSize + 54);

      // ── Bottom event label ──
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.font = "italic 20px 'Times New Roman', Times, serif";
      ctx.fillText("NIRMAVORA FEST 2K26  ·  " + (team.eventType === "designathon" ? "Designathon" : "Hackathon"), W / 2, qrY + qrSize + 92);

      resolve(canvas.toDataURL("image/png"));
    };
    img.src = qrDataUrl;
  });
}

function downloadPNG(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/* ── QR Scanner Modal ── */
function QRScannerModal({ onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        beginDetection();
      }
    } catch (err) {
      setError("Camera access denied or not available. Allow camera permission and try again.");
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }

  function beginDetection() {
    if (!("BarcodeDetector" in window)) {
      setError("QR scanning needs Chrome or Edge browser. Your current browser does not support it.");
      return;
    }
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const canvas = document.createElement("canvas");
    const ctx2 = canvas.getContext("2d");

    async function tick() {
      const video = videoRef.current;
      if (!video || video.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx2.drawImage(video, 0, 0);
      try {
        const codes = await detector.detect(canvas);
        if (codes.length > 0) {
          const raw = codes[0].rawValue;
          stopCamera();
          const match = raw.match(/\/qr\/([^/?#]+)/);
          if (match) { navigate(`/qr/${match[1]}`); onClose(); return; }
          setError(`Scanned: ${raw} — not a NIRMAVORA team QR.`);
          return;
        }
      } catch (_) {}
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div className="cc-modal" style={{ maxWidth: 480, width: "95vw" }} onClick={(e) => e.stopPropagation()}>
        <div className="cc-modal-header">
          <h3><i className="fas fa-camera" style={{ marginRight: 8 }}></i>Scan Team QR Code</h3>
          <button className="cc-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="cc-modal-body" style={{ padding: 0 }}>
          {!error && (
            <div style={{ position: "relative", background: "#000", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
              <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", maxHeight: 320, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: 180, height: 180, border: "3px solid #F5B301", borderRadius: 12, boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }} />
              </div>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", padding: "10px 0 14px" }}>
                <i className="fas fa-circle" style={{ color: "#22c55e", marginRight: 6, fontSize: "0.6rem" }}></i>
                Point camera at a team QR code
              </p>
            </div>
          )}
          {error && (
            <div style={{ padding: 24, textAlign: "center" }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: "2rem", color: "#f87171", marginBottom: 12, display: "block" }}></i>
              <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Per-team preview card ── */
function TeamQRCard({ team, onDownload, isDownloading }) {
  const [qrUrl, setQrUrl] = useState(null);
  useEffect(() => { generateTeamQR(team).then(setQrUrl).catch(console.error); }, [team.id]);

  return (
    <div className="cc-qr-card">
      <div className="cc-qr-card-preview">
        {qrUrl
          ? <img src={qrUrl} alt={`QR ${team.teamName}`} style={{ width: 120, height: 120 }} />
          : <div style={{ width: 120, height: 120, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.2)" }}><i className="fas fa-spinner fa-spin fa-2x"></i></div>
        }
      </div>
      <div className="cc-qr-card-info">
        <div className="cc-qr-team-name">{team.teamName}</div>
        <div className="cc-qr-team-id">{team.teamId}</div>
        <div style={{ fontSize: "0.75rem", color: team.eventType === "designathon" ? "#fb923c" : "#f472b6" }}>
          {team.eventType === "designathon" ? "Designathon" : "Hackathon"}
        </div>
      </div>
      <button className="btn btn-sm btn-outline" onClick={() => onDownload(team)} disabled={isDownloading}
        style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        {isDownloading ? <><i className="fas fa-spinner fa-spin"></i> Generating…</> : <><i className="fas fa-download"></i> Download PNG</>}
      </button>
    </div>
  );
}

/* ── Main component ── */
export default function CCQR({ teams = [] }) {
  const approved = teams.filter((t) => t.teamId);
  const [downloading, setDownloading] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  async function handleDownload(team) {
    setDownloading(team.teamId);
    try {
      const qr = await generateTeamQRForPrint(team);
      const png = await buildA4Canvas(team, qr);
      downloadPNG(png, `QR_${team.teamId}_${team.teamName.replace(/\s+/g, "_")}.png`);
    } catch (err) { console.error(err); alert("Failed to generate QR card."); }
    setDownloading(null);
  }

  async function handlePrintAll() {
    if (!approved.length) return;
    setPrintLoading(true);
    try {
      const entries = await Promise.all(approved.map(async (team) => {
        const qr = await generateTeamQRForPrint(team);
        return buildA4Canvas(team, qr);
      }));
      const win = window.open("", "_blank", "width=900,height=700");
      const html = `<!DOCTYPE html><html><head><title>NIRMAVORA QR Cards</title>
<style>body{margin:0;padding:0;background:#fff}.page{width:210mm;height:297mm;page-break-after:always;display:flex;align-items:center;justify-content:center;overflow:hidden}.page:last-child{page-break-after:auto}img{width:210mm;height:297mm;display:block}@page{size:A4;margin:0}@media print{body{margin:0}}</style>
</head><body>${entries.map((png) => `<div class="page"><img src="${png}"/></div>`).join("")}
<script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`;
      win.document.write(html);
      win.document.close();
    } catch (err) { console.error(err); alert("Failed to generate PDF."); }
    setPrintLoading(false);
  }

  if (!approved.length) {
    return (
      <div className="cc-empty">
        <i className="fas fa-qrcode"></i>
        <h3>No Approved Teams</h3>
        <p>QR codes are generated once a team has been approved and assigned a Team ID.</p>
      </div>
    );
  }

  return (
    <div className="cc-qr-section">
      {scannerOpen && <QRScannerModal onClose={() => setScannerOpen(false)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, color: "#F5B301" }}><i className="fas fa-qrcode" style={{ marginRight: 8 }}></i>QR Code Cards</h3>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            {approved.length} approved team{approved.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => setScannerOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fas fa-camera"></i> Scan QR
          </button>
          <button className="btn btn-primary" onClick={handlePrintAll} disabled={printLoading} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {printLoading ? <><i className="fas fa-spinner fa-spin"></i> Preparing…</> : <><i className="fas fa-print"></i> Print All as PDF</>}
          </button>
        </div>
      </div>

      <div className="cc-qr-grid">
        {approved.map((team) => (
          <TeamQRCard key={team.id} team={team} onDownload={handleDownload} isDownloading={downloading === team.teamId} />
        ))}
      </div>
    </div>
  );
}
