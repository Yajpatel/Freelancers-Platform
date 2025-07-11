  import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/authcontext'; 
import { useAuth } from '../context/authcontext'; // ✅ You already have this
import './RoleChoice.css';

const RoleChoice = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { currentUser } = useAuth();  // ✅ Get current user from Auth context
  const userEmail = currentUser?.email;  // ✅ Get email safely
  console.log("email",userEmail);

  const handleGoClick = async () => {
    if (!selectedRole) {
      alert('Please select a role first.');
      return;
    }

    if (!userEmail) {
      alert('User not logged in. Please log in again.');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/freelancer/users/updateRole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,           // ✅ Using email from Auth context
          currentRole: selectedRole
        })
      });

      if (response.ok) {
        if (selectedRole === 'Client') {
          navigate('/client/dashboard');
        } else if (selectedRole === 'Freelancer') {
          navigate('/freelancer/dashboard');
        }
      } else {
        console.error('❌ Failed to update role');
        alert('Failed to update role. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-choice-page">
      <h2>Select Your Role</h2>

      <div className="role-options">
        <div
          className={`role-card ${selectedRole === 'Client' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('Client')}
        >
          <h3>I am a Client</h3>
          <p>I want to post projects</p>
        </div>

        <div
          className={`role-card ${selectedRole === 'Freelancer' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('Freelancer')}
        >
          <h3>I am a Freelancer</h3>
          <p>I am looking for work</p>
        </div>
      </div>

      <button
        className="go-button"
        onClick={handleGoClick}
        disabled={!selectedRole || loading}
      >
        {loading ? 'Loading...' : 'Go'}
      </button>
    </div>
  );
};

export default RoleChoice;
