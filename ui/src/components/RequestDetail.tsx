import React, { useState, useEffect } from 'react';
import { HelpRequest } from '@shared/types';
import './RequestDetail.css';

interface RequestDetailProps {
  request: HelpRequest;
  onResolve: (requestId: string, answer: string) => void;
  loading: boolean;
  readOnly?: boolean;
}

export default function RequestDetail({
  request,
  onResolve,
  loading,
  readOnly = false,
}: RequestDetailProps) {
  const [answer, setAnswer] = useState(request.supervisorAnswer || '');

  useEffect(() => {
    setAnswer(request.supervisorAnswer || '');
  }, [request.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !readOnly) {
      onResolve(request.id, answer.trim());
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="request-detail">
      <div className="detail-header">
        <h2>Request Details</h2>
        <span className={`status-badge status-${request.status}`}>
          {request.status}
        </span>
      </div>

      <div className="detail-section">
        <h3>Customer Information</h3>
        <div className="detail-info">
          <div>
            <label>Name:</label>
            <span>{request.customerName}</span>
          </div>
          <div>
            <label>Phone:</label>
            <span>{request.customerPhone}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Question</h3>
        <div className="question-box">{request.question}</div>
      </div>

      {request.status === 'pending' && (
        <div className="detail-section">
          <h3>Your Answer</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer here. This will be sent to the customer and added to the knowledge base."
              rows={6}
              disabled={readOnly || loading}
              required
            />
            <button
              type="submit"
              disabled={!answer.trim() || readOnly || loading}
              className="submit-button"
            >
              {loading ? 'Processing...' : 'Submit Answer'}
            </button>
          </form>
        </div>
      )}

      {request.status !== 'pending' && request.supervisorAnswer && (
        <div className="detail-section">
          <h3>Supervisor Response</h3>
          <div className="answer-box">{request.supervisorAnswer}</div>
          {request.supervisorId && (
            <div className="detail-meta">
              Answered by: {request.supervisorId}
              {request.resolvedAt && (
                <span> • {formatDateTime(request.resolvedAt)}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="detail-meta-section">
        <div>
          <label>Request ID:</label>
          <code>{request.id}</code>
        </div>
        <div>
          <label>Created:</label>
          <span>{formatDateTime(request.createdAt)}</span>
        </div>
        {request.timeoutAt && request.status === 'pending' && (
          <div>
            <label>Timeout:</label>
            <span>{formatDateTime(request.timeoutAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

