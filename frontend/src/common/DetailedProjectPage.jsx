import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './DetailedProjectPage.css'; // We will create this CSS file

function DetailedProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/project/details/${projectId}`);
                setProject(res.data);
            } catch (err) {
                console.error("Failed to fetch project details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    if (loading) {
        return <div className="loading-message">Loading project details...</div>;
    }

    if (!project) {
        return <div className="error-message">Could not load project details.</div>;
    }

    // Safely access nested properties
    const clientName = project.client?.name || 'N/A';
    const freelancerName = project.assignedFreelancer?.name || 'Not Assigned';

    return (
        <div className="project-details-container">
            <header className="details-header">
                <h1>{project.title}</h1>
                <span className={`status-tag-details status-${project.status}`}>{project.status.replace('-', ' ')}</span>
            </header>

            <div className="details-grid">
                <main className="details-main">
                    <section className="details-section">
                        <h2>Description</h2>
                        <p>{project.description}</p>
                    </section>

                    <section className="details-section">
                        <h2>Proposals ({project.proposals.length})</h2>
                        <div className="proposals-list-details">
                            {project.proposals.length > 0 ? (
                                project.proposals.map(p => (
                                    <div key={p._id} className="proposal-item">
                                        <div className="proposal-freelancer">
                                            <img src={p.freelancer.profileImage} alt={p.freelancer.name} />
                                            <span>{p.freelancer.name}</span>
                                        </div>
                                        <div className="proposal-bid">
                                            <span>Bid: ₹{p.totalBidAmount}</span>
                                            <span className={`proposal-status-details status-${p.status}`}>{p.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No proposals submitted for this project yet.</p>
                            )}
                        </div>
                    </section>
                </main>

                <aside className="details-sidebar">
                    <div className="sidebar-card">
                        <h3>Project Info</h3>
                        <p><strong>Category:</strong> {project.category}</p>
                        <p><strong>Budget:</strong> ₹{project.budget}</p>
                        <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                        <p><strong>Required Skills:</strong> {project.skills.join(', ')}</p>
                    </div>
                     <div className="sidebar-card">
                        <h3>Client</h3>
                        <p>{clientName}</p>
                    </div>
                    <div className="sidebar-card">
                        <h3>Assigned Freelancer</h3>
                        <p>{freelancerName}</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default DetailedProjectPage;