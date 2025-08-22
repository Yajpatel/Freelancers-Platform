import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Chat.css';
import { useAuth } from '../context/authcontext';
import ClientNavbar from '../clientPages/ClientNavbar'; // Import Client Navbar
import FreelancerNavbar from '../freelancerPages/FreelancerNavbar'; // Import Freelancer Navbar

const socket = io('http://localhost:8000');

const Chat = () => {
  const { id } = useParams(); // Mongodb id of the other user
  const { currentUser } = useAuth();

  const [userToChatWith, setUserToChatWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [currentUserDetails, setCurrentUserDetails] = useState(null);

  // Fetch details for BOTH users to determine roles and setup chat
  useEffect(() => {
    if (currentUser?.uid && id) {
      const fetchUsersAndMessages = async () => {
        try {
          // Fetch current user details (to get role and mongo _id)
          const currentUserRes = await axios.get(`http://localhost:8000/freelancer/users/getuser/${currentUser.uid}`);
          setCurrentUserDetails(currentUserRes.data);

          // Fetch the other user's details
          const otherUserRes = await axios.get(`http://localhost:8000/freelancer/users/chatgetuser/${id}`);
          setUserToChatWith(otherUserRes.data);

          // Generate a consistent room ID
          const generatedRoomId = [currentUser.uid, otherUserRes.data.firebaseUID].sort().join('-');
          setRoomId(generatedRoomId);
          socket.emit('joinRoom', { roomId: generatedRoomId });

          // Fetch chat history
          const messagesRes = await axios.get(`http://localhost:8000/messages/getConversation/${currentUser.uid}/${otherUserRes.data.firebaseUID}`);
          setMessages(messagesRes.data);
        } catch (err) {
          console.error("Failed to initialize chat:", err);
        }
      };
      fetchUsersAndMessages();
    }
  }, [currentUser, id]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      // Only add message if it belongs to the current room
      if (data.roomid === roomId) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUserDetails || !userToChatWith) return;

    const messageData = {
      roomid: roomId,
      content: newMessage,
      sender: currentUserDetails._id,
      receiver: userToChatWith._id
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  if (!currentUserDetails || !userToChatWith) {
    return <p>Loading chat...</p>;
  }

  return (
    <>
      {/* Conditionally render the correct navbar */}
      {currentUserDetails.currentRole === 'client' && <ClientNavbar />}
      {currentUserDetails.currentRole === 'freelancer' && <FreelancerNavbar />}

      <div className="chat-container">
        <h2 className="chat-header">Chat with {userToChatWith.name}</h2>
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender.toString() === currentUserDetails._id.toString() ? 'sent' : 'received'}`}
            >
              <p className="chat-text">{msg.content}</p>
              <small className="chat-time">{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage} className="chat-send-button">Send</button>
        </div>
      </div>
    </>
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

