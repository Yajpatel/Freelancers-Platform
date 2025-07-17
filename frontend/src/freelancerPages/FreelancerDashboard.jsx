import React, { useEffect, useState } from 'react';
// import './Dashboard.css'; 
import { Link } from "react-router-dom";
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './FreelancerDashboard.css'
function FreelancerDashboard() {
  const [firebaseUID, setFirebaseUID] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUID(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-container">

      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="logo">Freelancer</div>
        <div className="top-nav-links">
          <Link to={`/profile/${firebaseUID}`} className="nav-link">
            My Profile
          </Link>
        </div>
      </nav>

      {/* Second Navbar */}
      <nav className="main-navbar">
        <Link to="/dashboard" className="nav-link">Home</Link>
        <Link to="/project/SearchProjects" className="nav-link">Find Projects</Link>
        <Link to="/messages" className="nav-link">Messages</Link>
        <Link to="/my-projects" className="nav-link">My Projects</Link>
      </nav>

      {/* Body */}
      <div className="dashboard-body">
        <h1>Welcome to Your Dashboard!</h1>
        <p>Explore projects or connect with freelancers to get started.</p>

        <div className="card-container">
          <div className="dashboard-card">Recent Projects</div>
          {/* <div className="dashboard-card">Top Freelancers</div> */}
          {/* <div className="dashboard-card">Your Activity</div> */}
        </div>
      </div>

    </div>
  );
}



export default FreelancerDashboard;