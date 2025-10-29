import React from 'react';
import { HelpRequest } from '../../../shared/types';
import './RequestList.css';

interface RequestListProps {
  requests: HelpRequest[];
  onSelectRequest: (request: HelpRequest) => void;
  selectedId: string | undefined;
  showStatus?: boolean;
}

export default function RequestList({
  requests,
  onSelectRequest,
  selectedId,
  showStatus = false,
}: RequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="request-list empty">
        <p>No requests found</p>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="request-list">
      {requests.map((request) => (
        <div
          key={request.id}
          className={`request-item ${selectedId === request.id ? 'selected' : ''}`}
          onClick={() => onSelectRequest(request)}
        >
          <div className="request-header">
            <div className="request-customer">
              <strong>{request.customerName}</strong>
              <span className="phone">{request.customerPhone}</span>
            </div>
            {showStatus && (
              <span className={`status-badge status-${request.status}`}>
                {request.status}
              </span>
            )}
          </div>
          <div className="request-question">{request.question}</div>
          <div className="request-meta">
            <span>{formatDate(request.createdAt)}</span>
            <span>{formatTime(request.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

