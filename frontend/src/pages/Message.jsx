import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authcontext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Message.css';

const Message = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Fetch recent conversations/messages where currentUser is involved
    axios.get(`http://localhost:8000/freelancer/users/getMessages/${currentUser.uid}`)
      .then(res => {
        setConversations(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch messages:', err);
      });
  }, [currentUser]);

  return (
    <div className="messages-container">
      <h2>Your Messages</h2>

      {conversations.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="message-cards">
          {conversations.map((chatUser, index) => (
            <Link to={`/chat/${chatUser.otherUserId}`} key={index} className="message-card">
              <div>
                <h4>{chatUser.name}</h4>
                <p>{chatUser.email}</p>
                <small>Last message: {chatUser.lastMessage || 'No messages yet'}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Message;
