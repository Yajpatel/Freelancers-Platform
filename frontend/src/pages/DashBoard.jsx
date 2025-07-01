import React, { useEffect, useState } from 'react';
import './Dashboard.css'; // External CSS file
import { Link } from "react-router-dom";
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
function Dashboard() {
    const [firebaseUID, setFirebaseUID] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setFirebaseUID(user.uid); // Set the Firebase UID for the current user
            }
        });
        return () => unsubscribe(); // Cleanup
    }, []);
    return (
        <>
            <div className="container">
                <div className="header">
                    <div className="logo">
                        <h3>Freelancer</h3>
                    </div>
                    <div>
                        <Link to={`/profile/${firebaseUID}`}>
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
                <div className="Search-project-button">
                    <Link to={`/project/SearchProjects`}><button>Search Projects</button></Link>
                </div>

                <div className="dashboard-content">
                    <h1>Welcome to Your Dashboard!</h1>
                </div>
            </div>
        </>
    );
}

export default Dashboard;