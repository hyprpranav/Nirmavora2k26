import React from 'react';

const ADMIN_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie' },
  { key: 'teams', label: 'Teams', icon: 'fas fa-users' },
  { key: 'users', label: 'Users', icon: 'fas fa-user-friends' },
  { key: 'attendance', label: 'Attendance', icon: 'fas fa-clipboard-check' },
  { key: 'export', label: 'Export', icon: 'fas fa-file-export' },
  { key: 'email', label: 'Email & Notify', icon: 'fas fa-envelope' },
  { key: 'qr', label: 'QR Codes', icon: 'fas fa-qrcode' },
  { key: 'settings', label: 'Settings', icon: 'fas fa-cog' },
];

const COORD_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie' },
  { key: 'teams', label: 'Teams', icon: 'fas fa-users' },
  { key: 'attendance', label: 'Attendance', icon: 'fas fa-clipboard-check' },
  { key: 'export', label: 'Export', icon: 'fas fa-file-export' },
  { key: 'qr', label: 'QR Codes', icon: 'fas fa-qrcode' },
];

export default function Sidebar({ section, onNavigate, role, user, onSignOut }) {
  const navItems = role === 'admin' ? ADMIN_NAV : COORD_NAV;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  return (
    <aside className="cc-sidebar">
      <div className="cc-sidebar-brand">
        <h2>NIRMAVORA CC</h2>
        <p>Command Center</p>
      </div>

      <div className="cc-sidebar-user">
        <div className="cc-user-name">{displayName}</div>
        <div className="cc-user-email">{email}</div>
        <span className={`cc-role-badge ${role}`}>
          {role === 'admin' ? 'Master Admin' : 'Coordinator'}
        </span>
      </div>

      <nav className="cc-sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`cc-nav-item${section === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="cc-sidebar-signout">
        <button className="cc-signout-btn" onClick={onSignOut}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
