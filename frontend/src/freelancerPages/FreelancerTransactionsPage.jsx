import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
// Reusing the client's CSS for a consistent look and feel
import './FreelancertransactionPage.css';


function FreelancerTransactionsPage() {
  const { currentUser } = useAuth();
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('released');

  // --- TABS UPDATED: Simplified for the freelancer's perspective ---
  const TABS = ['released', 'in_escrow'];

  useEffect(() => {
    if (currentUser) {
      axios
        .get(`http://localhost:8000/payment/freelancer/${currentUser.uid}`)
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
    return <p className="status-message">Loading your earnings...</p>;
  }
  if (!currentUser) {
    return <p className="status-message">You are not authorized to view this page.</p>;
  }

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>My Earnings</h1>
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
                <p><strong>Payout Amount:</strong> ₹{txn.payoutAmount}</p>
                <p><strong>From Client:</strong> {txn.client?.name || 'N/A'}</p>
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


export default FreelancerTransactionsPage;