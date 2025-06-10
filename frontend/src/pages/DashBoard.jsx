import React from 'react';
import './Dashboard.css'; // External CSS file

function Dashboard() {
  return (
    <>

    <div className="container">
        
        <div className="header">
            <div className="logo">
                <h3>Freelancer</h3>
            </div>
            <div className="my-profile">
                <h3>profile</h3>
            </div>
        </div>
        
        <div className='my-projects'>
          <button>My Projects</button>
        </div>
        <div className='rating-button'>
          <button>My Ratings</button>
        </div>
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
