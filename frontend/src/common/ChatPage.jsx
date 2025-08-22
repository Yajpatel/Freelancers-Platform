import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import ClientNavbar from '../clientPages/ClientNavbar';
import FreelancerNavbar from '../freelancerPages/FreelancerNavbar';
import './ChatPage.css'; // New CSS file for styling

const socket = io('http://localhost:8000');

function ChatPage() {
    const { id: activeChatId } = useParams(); // The MongoDB ID of the user to chat with
    const navigate = useNavigate();
    const { currentUser,refreshUnreadCount  } = useAuth();
    const [currentUserDetails, setCurrentUserDetails] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userToChatWith, setUserToChatWith] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Effect to fetch messages for the active chat
    useEffect(() => {
        if (activeChatId && currentUserDetails) {
            const fetchChatDetails = async () => {
                try {
                    const otherUserRes = await axios.get(`http://localhost:8000/freelancer/users/chatgetuser/${activeChatId}`);
                    setUserToChatWith(otherUserRes.data);
                    
                    const roomId = [currentUserDetails.firebaseUID, otherUserRes.data.firebaseUID].sort().join('-');
                    socket.emit('joinRoom', { roomId });

                    const messagesRes = await axios.get(`http://localhost:8000/messages/getConversation/${currentUserDetails.firebaseUID}/${otherUserRes.data.firebaseUID}`);
                    setMessages(messagesRes.data);

                    // --- MARK MESSAGES AS READ AND REFRESH COUNT ---
                    if (messagesRes.data.length > 0) {
                        await axios.post('http://localhost:8000/messages/markAsRead', {
                            roomId: roomId,
                            userId: currentUserDetails._id // Send current user's MongoDB ID
                        });
                        refreshUnreadCount(); // Refresh the global count
                    }
                    // --- END OF NEW LOGIC ---

                } catch (err) {
                    console.error("Failed to fetch chat details:", err);
                }
            };
            fetchChatDetails();
        }
    }, [activeChatId, currentUserDetails, refreshUnreadCount]); // Add refreshUnreadCount to dependency array

    // Effect to scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // Effect to fetch current user details and conversation list
    useEffect(() => {
        if (!currentUser?.uid) return;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const userRes = await axios.get(`http://localhost:8000/freelancer/users/getuser/${currentUser.uid}`);
                setCurrentUserDetails(userRes.data);

                const convRes = await axios.get(`http://localhost:8000/messages/getMessages/${currentUser.uid}`);
                setConversations(convRes.data);
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [currentUser]);

    // Effect to fetch messages for the active chat
    useEffect(() => {
        if (activeChatId && currentUserDetails) {
            const fetchChatDetails = async () => {
                try {
                    // Fetch the other user's details
                    const otherUserRes = await axios.get(`http://localhost:8000/freelancer/users/chatgetuser/${activeChatId}`);
                    setUserToChatWith(otherUserRes.data);

                    // Generate room ID and join
                    const roomId = [currentUserDetails.firebaseUID, otherUserRes.data.firebaseUID].sort().join('-');
                    socket.emit('joinRoom', { roomId });

                    // Fetch chat history
                    const messagesRes = await axios.get(`http://localhost:8000/messages/getConversation/${currentUserDetails.firebaseUID}/${otherUserRes.data.firebaseUID}`);
                    setMessages(messagesRes.data);
                } catch (err) {
                    console.error("Failed to fetch chat details:", err);
                }
            };
            fetchChatDetails();
        }
    }, [activeChatId, currentUserDetails]);

    // Effect for handling incoming messages
    useEffect(() => {
        const handleReceiveMessage = (data) => {
            const currentRoomId = [currentUserDetails?.firebaseUID, userToChatWith?.firebaseUID].sort().join('-');
            if (data.roomid === currentRoomId) {
                setMessages((prevMessages) => [...prevMessages, data]);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        return () => socket.off('receiveMessage', handleReceiveMessage);
    }, [currentUserDetails, userToChatWith]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUserDetails || !userToChatWith) return;

        const roomId = [currentUserDetails.firebaseUID, userToChatWith.firebaseUID].sort().join('-');
        const messageData = {
            roomid: roomId,
            content: newMessage,
            sender: currentUserDetails._id,
            receiver: userToChatWith._id,
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
    };

    const renderNavbar = () => {
        if (!currentUserDetails) return null;
        return currentUserDetails.currentRole === 'client' ? <ClientNavbar /> : <FreelancerNavbar />;
    };

    if (loading) return <div>Loading chats...</div>;

    return (
        <>
            {renderNavbar()}
            <div className="chat-page-container">
                {/* Left Column: Conversations List */}
                <aside className={`conversations-sidebar ${activeChatId ? 'mobile-hidden' : ''}`}>
                    <header className="sidebar-header">
                        <h3>Conversations</h3>
                    </header>
                    <div className="conversations-list">
                        {conversations.length > 0 ? (
                            conversations.map(conv => (
                                <Link to={`/chat/${conv._id}`} key={conv._id} className={`conversation-item ${conv._id === activeChatId ? 'active' : ''}`}>
                                    <img src={conv.profileImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} alt={conv.name} className="avatar" />
                                    <div className="conversation-details">
                                        <p className="conversation-name">{conv.name}</p>
                                        <p className="last-message">{conv.lastMessage}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-conversations">No conversations yet.</p>
                        )}
                    </div>
                </aside>

                {/* Right Column: Active Chat Window */}
                <main className="chat-window">
                    {activeChatId && userToChatWith ? (
                        <>
                            <header className="chat-header-main">
                                <Link to="/chat" className="back-button-mobile">
                                    &larr;
                                </Link>
                                <img src={userToChatWith.profileImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} alt={userToChatWith.name} className="avatar" />
                                <h4>{userToChatWith.name}</h4>
                            </header>
                            <div className="messages-area">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`message-bubble ${msg.sender.toString() === currentUserDetails._id.toString() ? 'sent' : 'received'}`}>
                                        <p>{msg.content}</p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="message-input-area">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                />
                                <button onClick={handleSendMessage}>Send</button>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

export default ChatPage;