import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './ClientProjectPage.css';
import ClientNavbar from './ClientNavbar';
import RatingForm from '../common/RatingForm';

// A helper function to get the tab from the URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ClientProjectPage() {
    const { currentUser } = useAuth();
    const [allProjects, setAllProjects] = useState([]);
    const [proposals, setProposals] = useState({});
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const navigate = useNavigate();
    const query = useQuery();
    const activeTab = query.get('tab') || 'open';

    // 🔹 Fetch projects
    useEffect(() => {
        if (currentUser) {
            axios
                .get(`http://localhost:8000/project/clientprojectpage/${currentUser.uid}`)
                .then(res => {
                    setAllProjects(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching projects:', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    // 🔹 Fetch proposals for projects with assigned freelancer
    useEffect(() => {
        if (allProjects.length > 0) {
            allProjects.forEach(project => {
                if (project.assignedFreelancer) {
                    axios.get(`http://localhost:8000/project/${project._id}/proposals`)
                        .then(res => {
                            setProposals(prev => ({ ...prev, [project._id]: res.data }));
                        })
                        .catch(err => console.error(`Error fetching proposals for project ${project._id}:`, err));
                }
            });
        }
    }, [allProjects]);

    // 🔹 Handle status update
    const handleStatusUpdate = (projectId, newStatus) => {
        if (newStatus === 'completed') {
            axios.post('http://localhost:8000/payment/release-payment', { projectId })
                .then(res => {
                    if (res.data.success) {
                        setAllProjects(prevProjects =>
                            prevProjects.map(p => p._id === projectId ? { ...p, status: newStatus } : p)
                        );
                        alert('Project approved and payment released to freelancer!');
                    }
                })
                .catch(err => {
                    console.error('Failed to release payment:', err);
                    alert('Could not release the payment. Please try again.');
                });
        } else {
            axios.put(`http://localhost:8000/project/${projectId}/status`, { status: newStatus })
                .then(() => {
                    setAllProjects(prevProjects =>
                        prevProjects.map(p => p._id === projectId ? { ...p, status: newStatus } : p)
                    );
                })
                .catch(err => {
                    console.error(`Failed to update project status to ${newStatus}:`, err);
                    alert('Could not update the project status. Please try again.');
                });
        }
    };

    // 🔹 Rating Modal Handlers
    const handleOpenRatingModal = (project) => {
        setSelectedProject(project);
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        setSelectedProject(null);
    };

    // 🔹 Action buttons
    const renderActionButtons = (project) => {
        switch (project.status) {
            case 'open':
                return (
                    <Link to={`/details/${project._id}`} className="btn-view">
                        View Proposals
                    </Link>
                );
            case 'in-progress':
                return (
                    <Link to={`/details/${project._id}`} className="btn-view">
                        View Details
                    </Link>
                );
            case 'pending-review':
                return (
                    <div className="project-actions-multi">
                        <button onClick={() => handleStatusUpdate(project._id, 'in-progress')} className="btn-action btn-revise">
                            Request Revisions
                        </button>
                        <button onClick={() => handleStatusUpdate(project._id, 'completed')} className="btn-action btn-approve">
                            Approve & Complete
                        </button>
                    </div>
                );
            case 'completed':
                return (
                    <button onClick={() => handleOpenRatingModal(project)} className="btn-action btn-review">
                        Leave a Review
                    </button>
                );
            case 'cancelled':
                return null;
            default:
                return (
                    <Link to={`/details/${project._id}`} className="btn-view">
                        View Details
                    </Link>
                );
        }
    };

    const filteredProjects = allProjects.filter(p => p.status === activeTab);

    // 🔹 Render UI
    if (loading) {
        return <><ClientNavbar /><p className="status-message">Loading projects...</p></>;
    }
    if (!currentUser) {
        return <><ClientNavbar /><p className="status-message">You are not authorized to view this page.</p></>;
    }

    return (
        <>
            <ClientNavbar />
            <div className="my-projects-container">
                <header className="projects-header">
                    <h1>My Projects: <span className="header-tab-title">{activeTab.replace('-', ' ')}</span></h1>
                </header>

                <div className="projects-list">
                    {filteredProjects.length === 0 ? (
                        <p className="status-message">No projects found in the "{activeTab}" category.</p>
                    ) : (
                        filteredProjects.map(project => (
                            <div key={project._id} className="project-card-my">
                                <div className="card-header-my">
                                    <h3>{project.title}</h3>
                                    <span className={`status-tag status-${project.status}`}>{project.status.replace('-', ' ')}</span>
                                </div>
                                <div className="card-body-my">
                                    <p><strong>Budget:</strong> ₹{project.budget}</p>
                                    {project.assignedFreelancer ? (
                                        <>
                                            <p><strong>Assigned to:</strong> {project.assignedFreelancer.name}</p>
                                            {proposals[project._id] && (() => {
                                                const winningProposal = proposals[project._id].find(p => p.freelancer.toString() === project.assignedFreelancer._id.toString());
                                                if (winningProposal) {
                                                    return <p><strong>Winning Bid:</strong> ₹{winningProposal.totalBidAmount}</p>;
                                                }
                                                return null;
                                            })()}
                                        </>
                                    ) : (
                                        <p>This project is open for proposals.</p>
                                    )}
                                </div>
                                <div className="project-actions">
                                    {renderActionButtons(project)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 🔹 Rating Modal */}
            {showRatingModal && selectedProject && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={handleCloseRatingModal} className="close-modal">X</button>
                        <RatingForm
                            projectId={selectedProject._id}
                            reviewerId={currentUser.uid}
                            revieweeId={selectedProject.assignedFreelancer._id}
                            onReviewSubmit={handleCloseRatingModal}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default ClientProjectPage;
