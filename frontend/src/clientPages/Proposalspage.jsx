import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import './Proposalspage.css';
import { useNavigate } from 'react-router-dom';
import ClientNavbar from './ClientNavbar';
function Proposalspage() {

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Add a new state to handle the loading for this specific action
  const [isFetchingUID, setIsFetchingUID] = useState(false);
  
  // fetching first firebase id form mongodid
  const handleredirectprofile = async (mongoId) => {
    if (isFetchingUID) return; // Prevent multiple clicks

    setIsFetchingUID(true); // Set loading state to true
    try {
      // Step 1: Call your new backend route
      const res = await axios.get(
        `http://localhost:8000/freelancer/users/get-firebase-uid/${mongoId}`
      );
      
      const { firebaseUID } = res.data; // Extract firebaseUID from response

      // Step 2: Navigate using the fetched firebaseUID
      if (firebaseUID) {
        navigate(`/profile/${firebaseUID}`);
      } else {
        throw new Error("Firebase UID not found for this user.");
      }

    } catch (error) {
      console.error('Failed to fetch Firebase UID:', error);
      alert('Could not retrieve user profile. Please try again later.');
    } finally {
      setIsFetchingUID(false); // Reset loading state
    }
  };
  
  // const { currentUser } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false); // ✅ State to track payment processing

  // ✅ 1. Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
      case 'accepted': // Changed to 'accepted' for consistency
      case 'completed': // Assuming 'completed' is the final paid status
        return 'proposal-status-accepted';
      case 'rejected':
        return 'proposal-status-rejected';
      default:
        return 'proposal-status-pending';
    }
  };

  // ✅ 2. New function to handle the entire payment flow
  const handleAcceptAndPay = async (proposal) => {
    setIsPaying(true); // ✅ Set loading state to true
    try {
      // Step 1: Get Razorpay Key from backend
      const { data: { key } } = await axios.get("http://localhost:8000/payment/getkey");

      // Step 2: Create a payment order on the backend
      const { data: { order } } = await axios.post(
        'http://localhost:8000/payment/create-order',
        {
          amount: proposal.totalBidAmount,
          proposalId: proposal._id, // Pass proposalId for context
        }
      );

      // Step 3: Configure Razorpay options
      const options = {
        key, // Your Razorpay Key ID
        amount: order.amount,
        currency: 'INR',
        name: 'Your Company Name', // Replace with your company name
        description: `Payment for project: ${proposal.project?.title}`,
        image: 'https://example.com/your_logo.png', // Replace with your logo URL
        order_id: order.id,
        handler: async function (response) {
          // Step 4: Verify the payment on the backend
          const verificationResponse = await axios.post(
            'http://localhost:8000/payment/verify-payment',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              proposalId: proposal._id, // Pass the proposal ID for the update
            }
          );
          
          if (verificationResponse.data.success) {
            // Step 5: Update the UI on successful payment
            setProposals((prev) =>
              prev.map((p) =>
                p._id === proposal._id ? { ...p, status: 'accepted' } : p
              )
            );
            alert('Payment successful! Proposal accepted.');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: currentUser.displayName || 'Client Name',
          email: currentUser.email,
          contact: '9999999999', // Optional
        },
        notes: {
          address: 'Your Company Address',
        },
        theme: {
          color: '#3399cc',
        },
      };

      // Step 6: Open the Razorpay payment modal
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error('Payment process failed:', error);
      alert('An error occurred during the payment process.');
    } finally {
      setIsPaying(false); // ✅ Set loading state to false when done
    }
  };

  // This function is still used for rejecting proposals
  const handleStatusUpdate = async (proposalId, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/project/proposals/${proposalId}/status`,
        { status: newStatus }
      );

      if (res.status === 200) {
        setProposals((prev) =>
          prev.map((p) =>
            p._id === proposalId ? { ...p, status: newStatus } : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to update proposal status:', error);
      alert('Could not update status');
    }
  };


  if (loading) {
    return <div className="loading">Loading proposals...</div>;
  }

  if (proposals.length === 0) {
    return <div className="no-proposals">No proposals yet. 😔</div>;
  }

  return (
    <>
       <ClientNavbar />
    <div className="proposals-container">
      <h1 className="proposals-title">Project Proposals</h1>
      <div className="proposals-list">
        {proposals.map((proposal) => (
          <div key={proposal._id} className="proposal-card">
            {/* ... (rest of your card JSX remains the same) ... */}
            <div className="card-header">
                <h2 className="project-title">{proposal.project?.title}</h2>
                <span className={`proposal-status ${getStatusClass(proposal.status)}`}>
                    {proposal.status}
                </span>
            </div>
            <p className="project-category">{proposal.project?.category}</p>
            <p className="cover-letter">{proposal.coverLetter}</p>
            
            <div className="proposal-details">
                <p>Bidding Amount: <strong>💸 &#8377;{proposal.totalBidAmount}</strong></p>
                <p>Delivery Time: <strong>{proposal.deliveryTime} days</strong></p>
            </div>

            {proposal.freelancer && (

                <div
                  className="freelancer-info"
                  onClick={() => handleredirectprofile(proposal.freelancer._id)}
                  style={{ cursor: 'pointer' }}
              >
                  <img
                      src={proposal.freelancer.profileImage || null}
                      alt={proposal.freelancer.name}
                      className="freelancer-image"
                  />
                  <div>
                      <p className="freelancer-name">{proposal.freelancer.name}</p>
                      <p className="freelancer-email">{proposal.freelancer.email}</p>
                  </div>
              </div>
            )}
            
            {proposal.status === 'pending' && (
              <div className="proposal-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleAcceptAndPay(proposal)}
                  disabled={isPaying} // ✅ Disable button when processing
                >
                  {isPaying ? 'Processing...' : 'Accept & Pay'} {/*✅ Change text */}
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                  disabled={isPaying} // ✅ Also disable reject button to avoid confusion
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
      </>
  );
}

export default Proposalspage;