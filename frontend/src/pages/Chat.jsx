import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Chat.css';
import { useAuth } from '../context/authcontext';

const socket = io('http://localhost:8000');  // Connects automatically when page loads

const Chat = () => {
  const { id } = useParams();
  const [userToChatWith, setUserToChatWith] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const { curruser } = useAuth();
  const currentUserId = curruser?.uid;

  const roomId = [currentUserId, id].sort().join('-');

  useEffect(() => {
    axios.get(`http://localhost:8000/freelancer/users/chatgetuser/${id}`)
      .then((res) => setUserToChatWith(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    socket.emit('joinRoom', { roomId });

    socket.on('receiveMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
        roomId,                          // Fix key: must be "roomid" (not roomId)
        content: newMessage,              // Fix key: must be "content" (not message)
        sender: currentUserId,
        receiver: id,
    };

    socket.emit('sendMessage', messageData);
    setMessages(prev => [...prev, { ...messageData, time: new Date() }]);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <h2>Chat with {userToChatWith.name || 'Loading...'}</h2>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === currentUserId ? 'sent' : 'received'}`}
          >
            <p>{msg.message}</p>
            <small>{new Date(msg.time).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;

// import React from 'react';
// import { useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios  from 'axios';
// import { useState } from 'react';
// import { io } from 'socket.io-client'
// import './Chat.css'
// const Chat = () => {
//   const { id } = useParams();  // id of the person with whom the current person will be chatting with
//   const [userToChatWith, setUserToChatWith] = useState({});
//   const [messages, setMessages] = useState([]);  // Chat messages
//   const [newMessage, setNewMessage] = useState('');  // Input message
//   const currentUserId = localStorage.getItem('firebaseUID');  // Assume current user’s UID stored in localStorage

//   const roomId = [currentUserId, id].sort().join('-');  // Unique room id (same for both users)

//   useEffect(() => {
//     // Fetch user you're chatting with
//     axios.get(`http://localhost:8000/freelancer/users/chatgetuser/${id}`)
//       .then((res) => {
//         console.log("chat user fetched",res.data);
//         setUserToChatWith(res.data);
//       })
//       .catch((err) => console.log(err));
//   }, [id]);

// //   useEffect(() => {
// //     // Join room
// //     socket.emit('joinRoom', { roomId });

// //     // Listen for incoming messages
// //     socket.on('receiveMessage', (data) => {
// //       setMessages(prev => [...prev, data]);
// //     });

// //     // Cleanup on unmount
// //     return () => {
// //       socket.off('receiveMessage');
// //     };
// //   }, [roomId]);

//   const handleSendMessage = () => {
//     if (newMessage.trim() === '') return;

//     const messageData = {
//       roomId,
//       message: newMessage,
//       sender: currentUserId,
//     };

//     socket.emit('sendMessage', messageData);
//     setMessages(prev => [...prev, { ...messageData, time: new Date() }]);
//     setNewMessage('');
//   };

//   return (
//     <div className="chat-container">
//       <h2 className="chat-header">Chat with {userToChatWith.name || 'Loading...'}</h2>

//       <div className="chat-window">
//         {/* {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`chat-message ${msg.sender === currentUserId ? 'sent' : 'received'}`}
//           >
//             <p className="chat-text">{msg.message}</p>
//             <small className="chat-time">{new Date(msg.time).toLocaleTimeString()}</small>
//           </div>
//         ))} */}
//       </div>

//       <div className="chat-input-area">
        
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Type a message..."
//           className="chat-input"
//         />

//         <button onClick={handleSendMessage} className="chat-send-button">Send</button>
//       </div>
//     </div>
//   );
// };

// export default Chat;

