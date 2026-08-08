import React from 'react';
import { APP_CONFIG } from '@gbud/config';
import { PILLARS } from '@gbud/constants';

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{APP_CONFIG.name} — Web Application</h1>
      <p>{APP_CONFIG.description}</p>
      <div style={{ background: '#f4f4f5', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Phase 0 — Project Foundation</h3>
        <p>Core Web foundation active.</p>
        <p>Target Pillars:</p>
        <ul>
          <li><strong>TRAIN</strong> — {PILLARS.TRAIN}</li>
          <li><strong>FUEL</strong> — {PILLARS.FUEL}</li>
          <li><strong>PROGRESS</strong> — {PILLARS.PROGRESS}</li>
        </ul>
      </div>
    </div>
  );
}
