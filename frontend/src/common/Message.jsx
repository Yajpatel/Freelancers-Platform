import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Message.css';
import ClientNavbar from '../clientPages/ClientNavbar'; // Import Client Navbar
import FreelancerNavbar from '../freelancerPages/FreelancerNavbar'; // Import Freelancer Navbar

const Message = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [userRole, setUserRole] = useState(null); // State to hold the user's role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchData = async () => {
      try {
        // Fetch user data to determine role
        const userRes = await axios.get(`http://localhost:8000/freelancer/users/getuser/${currentUser.uid}`);
        setUserRole(userRes.data.currentRole);

        // Fetch conversations
        const messagesRes = await axios.get(`http://localhost:8000/messages/getMessages/${currentUser.uid}`);
        setConversations(messagesRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return <p>Loading messages...</p>;
  }

  return (
    <>
      {/* Conditionally render the correct navbar based on role */}
      {userRole === 'client' && <ClientNavbar />}
      {userRole === 'freelancer' && <FreelancerNavbar />}

      <div className="messages-container">
        <h2>Your Conversations</h2>

        {conversations.length === 0 ? (
          <p>You have no conversations yet.</p>
        ) : (
          <div className="message-cards">
            {conversations.map((chatUser) => (
              <Link to={`/chat/${chatUser._id}`} key={chatUser._id} className="message-card">
                <div className="card-content">
                  <h4 className="card-title">{chatUser.name}</h4>
                  <p className="card-last-message">
                    {chatUser.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Message;