import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Chat.css';
import { useAuth } from '../context/authcontext';

const socket = io('http://localhost:8000');  // Connects automatically when page loads

const Chat = () => {
  const { id } = useParams(); //mongodb id of the user (oppposite user)with whom we will be chatting with (not current user id) default generated user_id

  const [userToChatWith, setUserToChatWith] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const { currentUser } = useAuth();
  const currentUserFirebaseId = currentUser?.uid; // firebaseUID

  
  const [roomId, setRoomId] = useState('');


  const [currentuserdetails, setcurrentuserdetails] = useState(null);

  // Step 1: Fetch Mongo user of current Firebase user
  useEffect(() => {
    const fetchcurrentuserdetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/freelancer/users/getuser/${currentUser.uid}`);
        setcurrentuserdetails(res.data);
        console.log('current user all details fetched');
      } catch (err) {
        console.error('Failed to fetch current Mongo user:', err);
        console.log("user details not fetched here");
      }
    };
    if (currentUser?.uid) fetchcurrentuserdetails();
  }, [currentUser]);

  useEffect(() => {
  if (!roomId) return;

  // Step 1: join socket room
  socket.emit('joinRoom', { roomId });
  console.log(`Socket ${socket.id} joined room ${roomId}`);

  // Step 2: fetch previous conversation from DB
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
   `http://localhost:8000/messages/getConversation/${currentUserFirebaseId}/${userToChatWith.firebaseUID}` );
      setMessages(res.data);
      console.log("Fetched old messages:", res.data);
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  };

  if (currentuserdetails?._id && userToChatWith?._id) {
    fetchMessages();
  }

  // Step 3: listen for new socket messages
  socket.on('receiveMessage', (data) => {
    setMessages((prev) => [...prev, data]);
  });

  return () => {
    socket.off('receiveMessage');
  };
}, [roomId, currentuserdetails, userToChatWith]);


  useEffect(() => {
    if (!id || !currentUserFirebaseId) return;

    console.log("currUser:", currentUser);

    axios.get(`http://localhost:8000/freelancer/users/chatgetuser/${id}`)
      .then((res) => {
        setUserToChatWith(res.data)
        console.log("response from backend",res.data);
        const otherFirebaseUID = res.data.firebaseUID; // Ensure this field exists in backend
        console.log("otherFirebaseUID",otherFirebaseUID)
        console.log("currentUserFirebaseId",currentUserFirebaseId)
        const generatedRoomId = [currentUserFirebaseId, otherFirebaseUID].sort().join('-');
        console.log("generatedRoomId : ", generatedRoomId);
        
        setRoomId(generatedRoomId);
      })
      .catch((err) => console.log(err));
  }, [id,currentUserFirebaseId]);


  /// on send button 
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
        roomid: roomId,                        // Fix key: must be "roomid" (not roomId)
        content: newMessage,              // Fix key: must be "content" (not message)
        sender: currentuserdetails._id,
        receiver: userToChatWith._id
    };

    socket.emit('sendMessage', messageData);
    // setMessages(prev => [...prev, { ...messageData, time: new Date() }]);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <h2>Chat with {userToChatWith.name || 'Loading...'}</h2>
      <h2>Chat with {userToChatWith.firebaseUID || 'Loading...'}</h2>

      <p>roomID {roomId}</p>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            //for safety purpose already a string
            //currentuserdetails._id.toString() 
          ////////////////////////////////
            /// actually converting new ObjectId("64b4fe2d7b3cce06fcb7b892") form this to ===> .toString it will become "64b4fe2d7b3cce06fcb7b892"
            //msg.sender.toString()
            className={`chat-message ${msg.sender.toString() === currentuserdetails._id.toString() ? 'sent' : 'received'}`}
          >
            <p>{msg.content}</p>
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

