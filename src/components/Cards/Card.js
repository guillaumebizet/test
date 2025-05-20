
import React from 'react';

export default function Card({ title, description, tags, actions, link }) {
  return (
    <div className="card">
      <div className="actions">
        {actions && actions.map(a =>
          <a href={link || '#'} className="action" key={a}>{a}</a>
        )}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="tags">
        {tags && tags.map(t =>
          <span className={`tag${t==='INTERNAL SG'?' internal':''}`} key={t}>{t}</span>
        )}
      </div>
    </div>
  );
}
