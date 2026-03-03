import QRCode from 'qrcode';

/**
 * Generate a QR code data-URL for a team.
 * Public scan → shows team name, ID, members, title.
 * The QR links to /qr/:teamId which renders the public view.
 */
export async function generateTeamQR(team) {
  const url = `${window.location.origin}/qr/${team.teamId}`;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#121212', light: '#FAFAFA' },
  });
  return dataUrl;
}

/**
 * Generate QR data-URL from arbitrary text.
 */
export async function generateQRFromText(text) {
  return QRCode.toDataURL(text, {
    width: 400,
    margin: 2,
    color: { dark: '#121212', light: '#FAFAFA' },
  });
}
