import React from 'react';
import { KnowledgeEntry } from '../../../shared/types';
import './KnowledgeBase.css';

interface KnowledgeBaseProps {
  entries: KnowledgeEntry[];
}

export default function KnowledgeBase({ entries }: KnowledgeBaseProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (entries.length === 0) {
    return (
      <div className="knowledge-base empty">
        <p>No knowledge base entries yet. Entries will appear here as supervisors answer questions.</p>
      </div>
    );
  }

  return (
    <div className="knowledge-base">
      <div className="knowledge-header">
        <h2>Knowledge Base ({entries.length} entries)</h2>
        <p className="knowledge-subtitle">
          These are answers learned from previous supervisor responses
        </p>
      </div>
      <div className="knowledge-list">
        {entries.map((entry) => (
          <div key={entry.id} className="knowledge-entry">
            <div className="entry-question">
              <strong>Q:</strong> {entry.question}
            </div>
            <div className="entry-answer">
              <strong>A:</strong> {entry.answer}
            </div>
            <div className="entry-meta">
              <span>Used {entry.usageCount} times</span>
              {entry.lastUsedAt && (
                <span>Last used: {formatDate(entry.lastUsedAt)}</span>
              )}
              <span>Created: {formatDate(entry.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

