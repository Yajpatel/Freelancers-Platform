import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import FreelancerNavbar from './FreelancerNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faComments, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './FreelancerDashboard.css';

const FreelancerDashboard = () => {
    const { currentUser } = useAuth();
    const [topProjects, setTopProjects] = useState([]);

    useEffect(() => {
        const fetchTopProjects = async () => {
            try {
                const res = await axios.get('http://localhost:8000/project/top-paying');
                setTopProjects(res.data);
            } catch (error) {
                console.error("Error fetching top paying projects:", error);
            }
        };

        fetchTopProjects();
    }, []);

    return (
        <div className="freelancer-dashboard-page">
            <FreelancerNavbar />

            <main className="dashboard-main-content">
                <div className="dashboard-left">
                    <div className="projects-main-section">
                        <h2>Top 10 Highest Paying Projects</h2>
                        <div className="project-list">
                            {topProjects.map(project => (
                                <div key={project._id} className="project-card">
                                    <div className="project-info">
                                        <h4>{project.title}</h4>
                                        <p className="project-item-description">
                                            {project.description.substring(0, 280)}...
                                        </p>
                                        <p>Budget: ₹{project.budget}</p>
                                    </div>
                                    <Link to={`/project/projectdetails/${project._id}`} className="details-button">
                                        View Details <FontAwesomeIcon icon={faArrowRight} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="dashboard-right">
                    <div className="content-header card">
                        <h1>Welcome, {currentUser?.name || 'Freelancer'}!</h1>
                        <p>Here's a summary of your activity.</p>
                    </div>

                    <div className="stats-container">
                        <div className="stat-card-side">
                            <FontAwesomeIcon icon={faFolderOpen} className="stat-icon icon-projects" />
                            <div className="stat-info">
                                <h3>0</h3>
                                <p>Active Projects</p>
                            </div>
                        </div>
                        <div className="stat-card-side">
                            <FontAwesomeIcon icon={faComments} className="stat-icon icon-messages" />
                            <div className="stat-info">
                                <h3>0</h3>
                                <p>Unread Messages</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default FreelancerDashboard;