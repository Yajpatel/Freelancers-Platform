import React from 'react';
import './Dashboard.css'; // External CSS file
import { Link } from "react-router-dom";
function Dashboard() {
  return (
    <>

    <div className="container">
        
        <div className="header">
            <div className="logo">
                <h3>Freelancer</h3>
            </div>
            <div>
              <Link
                to="/profile"
              >
                <button>my profile</button>
              </Link>
          </div>
        </div>
        
        <div className='my-projects'>
          <button>My Projects</button>
        </div>
        {/* <div className='rating-button'>
          <button>My Ratings</button>
        </div> */}
        <div className="post-project-button">
          <button>Post a Project</button>
        </div>  

        <div className="dashboard-content">
            <h1>Welcome to Your Dashboard!</h1>
        </div>
 
 
    </div>
    </>
  );
}

export default Dashboard;