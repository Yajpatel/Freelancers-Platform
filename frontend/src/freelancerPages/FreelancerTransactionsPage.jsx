import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './FreelancertransactionPage.css';
import FreelancerNavbar from './FreelancerNavbar'; // Import the navbar

// Helper function to get the tab from the URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function FreelancerTransactionsPage() {
    const { currentUser } = useAuth();
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const query = useQuery();

    // The active tab is now controlled by the URL, defaulting to 'released'
    const activeTab = query.get('tab') || 'released';

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
        return <><FreelancerNavbar /><p className="status-message">Loading your earnings...</p></>;
    }
    if (!currentUser) {
        return <><FreelancerNavbar /><p className="status-message">You are not authorized to view this page.</p></>;
    }

    return (
        <>
            <FreelancerNavbar />
            <div className="transactions-container">
                <header className="transactions-header">
                    <h1>My Earnings: <span className="header-tab-title">{activeTab.replace('_', ' ')}</span></h1>
                </header>

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
                                    <p><strong>Client:</strong> {txn.client?.name || 'N/A'}</p>
                                    <p><strong>Date:</strong> {new Date(txn.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Transaction ID:</strong> {txn.transactionId || 'N/A'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default FreelancerTransactionsPage;