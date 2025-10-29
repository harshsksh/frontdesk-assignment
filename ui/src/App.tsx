import React, { useState, useEffect } from 'react';
import { HelpRequest, KnowledgeEntry } from '../../shared/types';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import KnowledgeBase from './components/KnowledgeBase';
import './App.css';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'knowledge'>('pending');
  const [pendingRequests, setPendingRequests] = useState<HelpRequest[]>([]);
  const [allRequests, setAllRequests] = useState<HelpRequest[]>([]);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/requests/pending`);
      const data = await res.json();
      setPendingRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/requests`);
      const data = await res.json();
      setAllRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const res = await fetch(`${API_BASE}/knowledge`);
      const data = await res.json();
      setKnowledgeEntries(data.entries || []);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchAllRequests();
    fetchKnowledgeBase();

    // Auto-refresh pending requests every 5 seconds
    const interval = setInterval(() => {
      if (activeTab === 'pending') {
        fetchPendingRequests();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleResolveRequest = async (requestId: string, answer: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, supervisorId: 'supervisor-1' }),
      });

      if (res.ok) {
        // Refresh all data
        await Promise.all([
          fetchPendingRequests(),
          fetchAllRequests(),
          fetchKnowledgeBase(),
        ]);
        setSelectedRequest(null);
        alert('Request resolved! Customer has been notified.');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resolving request:', error);
      alert('Failed to resolve request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Frontdesk Supervisor Panel</h1>
        <div className="header-tabs">
          <button
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => {
              setActiveTab('pending');
              setSelectedRequest(null);
            }}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => {
              setActiveTab('history');
              setSelectedRequest(null);
            }}
          >
            History
          </button>
          <button
            className={activeTab === 'knowledge' ? 'active' : ''}
            onClick={() => {
              setActiveTab('knowledge');
              setSelectedRequest(null);
            }}
          >
            Knowledge Base ({knowledgeEntries.length})
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'pending' && (
          <div className="content-container">
            <RequestList
              requests={pendingRequests}
              onSelectRequest={setSelectedRequest}
              selectedId={selectedRequest?.id}
            />
            {selectedRequest && (
              <RequestDetail
                request={selectedRequest}
                onResolve={handleResolveRequest}
                loading={loading}
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="content-container">
            <RequestList
              requests={allRequests}
              onSelectRequest={setSelectedRequest}
              selectedId={selectedRequest?.id}
              showStatus={true}
            />
            {selectedRequest && (
              <RequestDetail
                request={selectedRequest}
                onResolve={handleResolveRequest}
                loading={loading}
                readOnly={selectedRequest.status !== 'pending'}
              />
            )}
          </div>
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBase entries={knowledgeEntries} />
        )}
      </main>
    </div>
  );
}

export default App;

