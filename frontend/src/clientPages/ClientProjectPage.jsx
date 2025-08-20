import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './ClientProjectPage.css';

function ClientProjectPage() {
  const { currentUser } = useAuth();
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open'); // Default tab is now 'open'
  const navigate = useNavigate();

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

  const handleStatusUpdate = (projectId, newStatus) => {
    axios.put(`http://localhost:8000/project/${projectId}/status`, { status: newStatus })
      .then(res => {
        setAllProjects(prevProjects => 
          prevProjects.map(p => p._id === projectId ? { ...p, status: newStatus } : p)
        );
      })
      .catch(err => {
        console.error(`Failed to update project status to ${newStatus}:`, err);
        alert('Could not update the project status. Please try again.');
      });
  };
  
  const renderActionButtons = (project) => {
    switch (project.status) {
      case 'open': // Action for open projects
        return (
          <Link to={`/myproposals`} className="btn-view"> 
            View Proposals
          </Link>
        );
      case 'in-progress':
        return (
          <Link to={`/project/projectdetails/${project._id}`} className="btn-view">
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
          <button onClick={() => alert('Navigate to review page for ' + project._id)} className="btn-action btn-review">
            Leave a Review
          </button>
        );
      case 'cancelled':
        return null;
      default:
        return (
           <Link to={`/project/projectdetails/${project._id}`} className="btn-view">
            View Details
          </Link>
        );
    }
  };

  const filteredProjects = allProjects.filter(p => p.status === activeTab);

  if (loading) {
    return <p className="status-message">Loading projects...</p>;
  }
  if (!currentUser) {
    return <p className="status-message">You are not authorized to view this page.</p>;
  }

  return (
    <div className="my-projects-container">
      <header className="projects-header">
        <h1>My Projects</h1>
        <button className="btn-post-project" onClick={() => navigate('/post-project')}>
          + Post New Project
        </button>
      </header>

      <nav className="tabs-nav">
        {/* --- "Open" Tab Added --- */}
        <button className={`tab-link ${activeTab === 'open' ? 'active' : ''}`} onClick={() => setActiveTab('open')}>
          Open
        </button>
        <button className={`tab-link ${activeTab === 'in-progress' ? 'active' : ''}`} onClick={() => setActiveTab('in-progress')}>
          In Progress
        </button>
        <button className={`tab-link ${activeTab === 'pending-review' ? 'active' : ''}`} onClick={() => setActiveTab('pending-review')}>
          Pending Review
        </button>
        <button className={`tab-link ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed
        </button>
        <button className={`tab-link ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>
          Cancelled
        </button>
      </nav>

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
                  <p><strong>Assigned to:</strong> {project.assignedFreelancer.name}</p>
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
  );
}

export default ClientProjectPage;