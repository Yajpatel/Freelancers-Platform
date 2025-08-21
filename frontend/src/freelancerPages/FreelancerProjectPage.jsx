import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FreelancerProjectPage.css'; // Reusing the same CSS for consistency

function FreelancerProjectPage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    proposals: [],
    activeProjects: [],
    completedProjects: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // Default to active work

  const handleStatusUpdate = (projectId, newStatus) => {
    axios
      .put(`http://localhost:8000/project/${projectId}/status`, { status: newStatus })
      .then(res => {
        setData(prevData => ({
          ...prevData,
          activeProjects: prevData.activeProjects.filter(p => p._id !== projectId),
        }));
        alert('Project has been submitted for client review! Be patient');
      })
      .catch(err => {
        console.error(`Failed to update project status to ${newStatus}:`, err);
        alert('Could not update the project status. Please try again.');
      });
  };

  useEffect(() => {
    if (currentUser) {
      axios
        .get(`http://localhost:8000/project/freelancer/${currentUser.uid}`)
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
    let content = [];
    let emptyMessage = '';

    switch (activeTab) {
      case 'proposals':
        content = data.proposals;
        emptyMessage = 'You have not submitted any proposals yet.';
        return content.length === 0 ? <p className="status-message">{emptyMessage}</p> : content.map(p => (
          <div key={p._id} className="project-card-my">
            <div className="card-header-my">
                <h3>{p.project?.title || 'Project Title Missing'}</h3>
                <span className={`status-tag status-${p.status}`}>{p.status}</span>
            </div>
            <div className="card-body-my">
                <p><strong>Your Bid:</strong> ₹{p.totalBidAmount}</p>
                <p><strong>Delivery Time:</strong> {p.deliveryTime} days</p>
            </div>
            {/* <div className="project-actions">
                <Link to={`/details/${p._id}`} className="btn-view">
                            View Projec
                          </Link>
            </div> */}
          </div>
        ));

      case 'active':
        content = data.activeProjects;
        emptyMessage = 'You have no active projects right now.';
        return content.length === 0 ? <p className="status-message">{emptyMessage}</p> : content.map(project => (
          <div key={project._id} className="project-card-my">
             <div className="card-header-my">
                <h3>{project.title}</h3>
              <span className={`status-tag status-in-progress`}>In Progress</span>
                <Link to={`/details/${project._id}`} className="btn-view-details">
        View Details
    </Link>
            </div>
             <div className="card-body-my">
                <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
                <p><strong>Budget:</strong> ₹{project.budget}</p>
            </div>
           <div className="project-actions">
    
    <button 
        onClick={() => handleStatusUpdate(project._id, 'pending-review')} 
        className="btn-complete-work"
    >
        Mark as Complete
    </button>
</div>
          </div>
        ));

      case 'completed':
        content = data.completedProjects;
        emptyMessage = 'You have not completed any projects yet.';
        return content.length === 0 ? <p className="status-message">{emptyMessage}</p> : content.map(project => (
           <div key={project._id} className="project-card-my">
             <div className="card-header-my">
                <h3>{project.title}</h3>
                <span className={`status-tag status-completed`}>Completed</span>
            </div>
             <div className="card-body-my">
                <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
                <p><strong>Budget:</strong> ₹{project.budget}</p>
            </div>
            <div className="project-actions">
                <Link to={`/project/projectdetails/${project._id}`} className="btn-view">
                  View Details
                </Link>
            </div>
          </div>
        ));
      default:
        return null;
    }
  };

  if (loading) {
    return <p className="status-message">Loading your work...</p>;
  }

  if (!currentUser) {
    return <p className="status-message">You are not authorized to view this page.</p>;
  }

  return (
    <div className="my-projects-container">
      <header className="projects-header">
        <h1>My Work</h1>
      </header>
      
      <nav className="tabs-nav">
        <button
          className={`tab-link ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Projects
        </button>
        <button
          className={`tab-link ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          Submitted Proposals
        </button>
        <button
          className={`tab-link ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </nav>

      <div className="projects-list">
        {renderContent()}
      </div>
    </div>
  );
}

export default FreelancerProjectPage;