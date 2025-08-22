import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import './FreelancerProjectPage.css'; // <-- 1. IMPORT THE NEW UNIFIED CSS
import FreelancerNavbar from './FreelancerNavbar';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function FreelancerProjectPage() {
    const { currentUser } = useAuth();
    const [data, setData] = useState({ proposals: [], activeProjects: [], completedProjects: [] });
    const [loading, setLoading] = useState(true);
    const query = useQuery();
    const activeTab = query.get('tab') || 'active';

    const handleStatusUpdate = (projectId, newStatus) => {
        axios.put(`http://localhost:8000/project/${projectId}/statuspendingreview`, { status: newStatus })
            .then(res => {
                setData(prevData => ({
                    ...prevData,
                    activeProjects: prevData.activeProjects.filter(p => p._id !== projectId),
                }));
                alert('Project has been submitted for client review!');
            })
            .catch(err => {
                console.error(`Failed to update project status:`, err);
                alert('Could not update the project status.');
            });
    };

    useEffect(() => {
        if (currentUser) {
            axios.get(`http://localhost:8000/project/freelancer/${currentUser.uid}`)
                .then(res => {
                    setData({
                        proposals: res.data.proposals || [],
                        activeProjects: res.data.activeProjects || [],
                        completedProjects: res.data.completedProjects || [],
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching freelancer work:', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const renderContent = () => {
        let content, emptyMessage;
        switch (activeTab) {
            case 'proposals':
                content = data.proposals;
                emptyMessage = 'You have not submitted any proposals yet.';
                return content.length === 0 ? <p className="status-message">{emptyMessage}</p> : content.map(p => (
                    <div key={p._id} className="project-card">
                        <div className="card-header">
                            <h3>{p.project?.title || 'Project Title Missing'}</h3>
                            <span className={`status-tag status-${p.status}`}>{p.status}</span>
                        </div>
                        <div className="card-body">
                            <p><strong>Your Bid:</strong> ₹{p.totalBidAmount}</p>
                            <p><strong>Delivery Time:</strong> {p.deliveryTime} days</p>
                        </div>
                    </div>
                ));
            case 'active':
                content = data.activeProjects;
                emptyMessage = 'You have no active projects right now.';
                return content.length === 0 ? <p className="status-message">{emptyMessage}</p> : content.map(project => {
                    const proposal = data.proposals.find(p => p.project._id === project._id);
                    return (
                        <div key={project._id} className="project-card">
                            <div className="card-header">
                                <h3>{project.title}</h3>
                                <span className="status-tag status-in-progress">In Progress</span>
                            </div>
                            <div className="card-body">
                                <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
                                {proposal && <p><strong>Your Bid:</strong> ₹{proposal.totalBidAmount}</p>}
                            </div>
                            <div className="card-footer">
                                <button onClick={() => handleStatusUpdate(project._id, 'pending-review')} className="btn btn-complete-work">Mark as Complete</button>
                            </div>
                        </div>
                    );
                });
            case 'completed':
                content = data.completedProjects;
                emptyMessage = 'You have not completed any projects yet.';
                return content.length === 0 ? <p className="status-message">{emptyMessage}</p> : content.map(project => {
                    const proposal = data.proposals.find(p => p.project._id === project._id);
                    return (
                        <div key={project._id} className="project-card">
                            <div className="card-header">
                                <h3>{project.title}</h3>
                                <span className="status-tag status-completed">Completed</span>
                            </div>
                            <div className="card-body">
                          <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
                           <p><strong>Budget:</strong> ₹{project.budget}</p>
                                {proposal && <p><strong>Your Bid:</strong> ₹{proposal.totalBidAmount}</p>}
                            </div>
                            <div className="card-footer">
                                <Link to={`/details/${project._id}`} className="btn btn-view">View Details</Link>
                            </div>
                        </div>
                    );
                });
            default: return null;
        }
    };

    if (loading) return <><FreelancerNavbar /><p className="status-message">Loading your work...</p></>;
    if (!currentUser) return <><FreelancerNavbar /><p className="status-message">You are not authorized.</p></>;

    return (
        <>
            <FreelancerNavbar />
            <div className="project-list-container">
                <header className="projects-header">
                    <h1>My Work: <span className="header-tab-title">{activeTab.replace('-', ' ')}</span></h1>
                </header>
                <div className="project-list">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default FreelancerProjectPage;