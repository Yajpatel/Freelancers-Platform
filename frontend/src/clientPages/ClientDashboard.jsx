import React, { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import './ClientDashboard.css'
import CompletedProjects from './CompletedProjects';
const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const [unreadCount,setunreadCount] = useState(0);


  // to fetch => get the messages which clent have not seen yet 

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!currentUser?.uid) return;
      console.log("currUser:", currentUser.uid);
      try {
        const res = await axios.get(`http://localhost:8000/messages/getunreadcount/${currentUser.uid}`);
        console.log("Unread count:", res);
        console.log(res.data.unreadCount);
        setunreadCount(res.data.unreadCount);
      } catch (error) {
        console.error("Error fetching unread count", error);
      }
      //
    }
    fetchUnreadCount();
  }, [currentUser]);


    return (
        <div className="dashboard-container">

      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="logo">client</div>
        <div className="top-nav-links">
          <Link to={`/profile/${currentUser.uid}`} className="nav-link">
            My Profile
          </Link>
        </div>
      </nav>

      {/* Second Navbar */}
      <nav className="main-navbar">
        {/* <Link to="/dashboard" className="nav-link">Home</Link> */}
        {/* // logic if=f no message do not show if messages >0 than show how many messages pending to see */}
        <Link to="/messages" className="nav-link">Messages {unreadCount > 0 && (<span className="unreadCount">{unreadCount}</span>)} </Link>
        <Link to="/client/myprojects" className="nav-link">My Projects</Link>
          <Link to="/my-projects" className="nav-link">Find Freelancers</Link>
          {/* ///////////////////////////////// */}
        <Link to="/myproposals" className="nav-link">my proposals</Link>
        <Link to="/clienttransactions" className="nav-link">my transactions</Link>
      </nav>

      {/* Body */}
      <div className="dashboard-body">
        <h1>Welcome to Your Dashboard!</h1>
        <p>Explore projects or connect with freelancers to get started.</p>

        <div className="card-container">
          <CompletedProjects /> 
        </div>
      </div>

    </div>
    );
};

export default ClientDashboard;