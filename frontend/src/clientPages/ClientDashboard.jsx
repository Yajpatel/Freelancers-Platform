import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import ClientNavbar from './ClientNavbar'; 

// Font Awesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faComments, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import './ClientDashboard.css';
import CompletedProjects from './CompletedProjects';

const ClientDashboard = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // State for dashboard data
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeProjectsCount, setActiveProjectsCount] = useState(0);
    const [isProfileComplete, setIsProfileComplete] = useState(true); // Assume complete initially

    useEffect(() => {
        if (!currentUser?.uid) return;

        const fetchDashboardData = async () => {
            try {
                const [messagesRes, projectsRes, userRes] = await Promise.all([
                    axios.get(`http://localhost:8000/messages/getunreadcount/${currentUser.uid}`),
                    axios.get(`http://localhost:8000/project/client/${currentUser.uid}/active-count`),
                    axios.get(`http://localhost:8000/freelancer/users/getuser/${currentUser.uid}`)
                ]);

                setUnreadCount(messagesRes.data.unreadCount);
                setActiveProjectsCount(projectsRes.data.activeCount);

                const user = userRes.data;
                if (!user.bio || user.skills.length === 0 || !user.location) {
                    setIsProfileComplete(false);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    const getLinkClass = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    return (
        <div className="client-dashboard-page">
            <ClientNavbar />

            {/* Main Content Area - Layout Updated */}
            <main className="dashboard-main-content">
                {/* --- Left Column (Main Content) --- */}
                <div className="dashboard-left">
                    {/* Projects are now the main content here */}
                    <div className="projects-main-section">
                        <h2>My Projects</h2>
                        <CompletedProjects />
                    </div>
                </div>

                {/* --- Right Column (Sidebar) --- */}
                <aside className="dashboard-right">
                    {/* Welcome message moved to the top of the sidebar */}
                    <div className="content-header card">
                        <h1>Welcome, {currentUser?.displayName || 'Client'}!</h1>
                        <p>Here's a summary of your activity.</p>
                    </div>

                    {/* --- Complete Profile Card (Conditional) --- */}
                    {!isProfileComplete && (
                        <div className="profile-cta-card" onClick={() => navigate(`/profile/${currentUser.uid}`)}>
                            <div className="cta-info">
                                <h3>Complete Your Profile</h3>
                                <p>Attract the best freelancers with a full profile.</p>
                            </div>
                            <FontAwesomeIcon icon={faArrowRight} className="cta-arrow" />
                        </div>
                    )}

                    {/* --- Stat Cards --- */}
                    <div className="stats-container">
                        <div className="stat-card-side">
                            <FontAwesomeIcon icon={faFolderOpen} className="stat-icon icon-projects" />
                            <div className="stat-info">
                                <h3>{activeProjectsCount}</h3>
                                <p>Active Projects</p>
                            </div>
                        </div>
                        <div className="stat-card-side">
                            <FontAwesomeIcon icon={faComments} className="stat-icon icon-messages" />
                            <div className="stat-info">
                                <h3>{unreadCount}</h3>
                                <p>Unread Messages</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default ClientDashboard;