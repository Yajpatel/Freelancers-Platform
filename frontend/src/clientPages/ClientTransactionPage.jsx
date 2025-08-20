import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import './ClientTransactionPage.css'; // We will create this CSS file

function ClientTransactionPage() {
  const { currentUser } = useAuth();
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in_escrow');

  // --- TABS UPDATED: 'initiated' is removed ---
  const TABS = ['in_escrow', 'released', 'refunded', 'failed'];

  useEffect(() => {
    if (currentUser) {
      axios
        .get(`http://localhost:8000/payment/client/${currentUser.uid}`)
        .then(res => {
          setAllTransactions(res.data);
        })
        .catch(err => {
          console.error('Error fetching transactions:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const filteredTransactions = allTransactions.filter(t => t.status === activeTab);

  if (loading) {
    return <p className="status-message">Loading transactions...</p>;
  }
  if (!currentUser) {
    return <p className="status-message">You are not authorized to view this page.</p>;
  }

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>My Transactions</h1>
      </header>
      <nav className="tabs-nav">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-link ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </nav>
      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <p className="status-message">No transactions found in the "{activeTab.replace('_', ' ')}" category.</p>
        ) : (
          filteredTransactions.map(txn => (
            <div key={txn._id} className="transaction-card">
              <div className="card-header-txn">
                <h3 className="project-title-txn">{txn.project?.title || 'Project Deleted'}</h3>
                <span className={`status-tag-txn status-${txn.status}`}>{txn.status.replace('_', ' ')}</span>
              </div>
              <div className="card-body-txn">
                <p><strong>Amount:</strong> ₹{txn.amount}</p>
                <p><strong>Freelancer:</strong> {txn.freelancer?.name || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(txn.createdAt).toLocaleDateString()}</p>
                <p><strong>Transaction ID:</strong> {txn.transactionId || 'N/A'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClientTransactionPage;