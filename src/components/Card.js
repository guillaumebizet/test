import React from 'react';

export default function Card({ title, description, tags = [], actions = [] }) {
  return (
    <div style={{
      borderRadius: 12, boxShadow: '0 2px 8px #0002', padding: 24, margin: 16, background: '#fff', width: 320,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tags.map(tag => (
          <span key={tag} style={{
            background: '#f3f4f6', color: '#333', padding: '2px 8px', borderRadius: 8, fontSize: 12
          }}>{tag}</span>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        {actions.map(({ label, onClick }) => (
          <button onClick={onClick} style={{
            background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', marginRight: 8, cursor: 'pointer'
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}
