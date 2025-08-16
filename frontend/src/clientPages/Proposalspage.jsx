import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import './Proposalspage.css'; // Import the CSS file

function Proposalspage() {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProposals = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/project/proposals/${currentUser.uid}`
        );
        setProposals(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [currentUser]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'proposal-status-accepted';
      case 'rejected':
        return 'proposal-status-rejected';
      default:
        return 'proposal-status-pending';
    }
  };

  if (loading) {
    return <div className="loading">Loading proposals...</div>;
  }

  if (proposals.length === 0) {
    return <div className="no-proposals">No proposals yet. 😔</div>;
  }

  return (
    <div className="proposals-container">
      <h1 className="proposals-title">Project Proposals</h1>

      <div className="proposals-list">
        {proposals.map((proposal) => (
          <div key={proposal._id} className="proposal-card">
            <div className="card-header">
              <h2 className="project-title">{proposal.project?.title}</h2>
              <span className={`proposal-status ${getStatusClass(proposal.status)}`}>
                {proposal.status}
              </span>
            </div>
            <p className="project-category">{proposal.project?.category}</p>
            <p className="cover-letter">{proposal.coverLetter}</p>
            
            <div className="proposal-details">
              <p>Bidding Amount: <strong>${proposal.biddingAmount}</strong></p>
              <p>Delivery Time: <strong>{proposal.deliveryTime} days</strong></p>
            </div>

            {proposal.freelancer && (
              <div className="freelancer-info">
                <img
                  src={proposal.freelancer.profileImage || 'https://via.placeholder.com/60'}
                  alt={proposal.freelancer.name}
                  className="freelancer-image"
                />
                <div>
                  <p className="freelancer-name">{proposal.freelancer.name}</p>
                  <p className="freelancer-email">{proposal.freelancer.email}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Proposalspage;