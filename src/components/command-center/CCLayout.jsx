import React from 'react';
import Sidebar from './Sidebar';
import '../../styles/command-center.css';

export default function CCLayout({ section, onNavigate, role, user, onSignOut, title, children }) {
  return (
    <div className="cc-layout">
      <Sidebar
        section={section}
        onNavigate={onNavigate}
        role={role}
        user={user}
        onSignOut={onSignOut}
      />
      <main className="cc-main">
        <div className="cc-header">
          <h1>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
