// frontend/src/clientPages/CompletedProjects.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import './CompletedProjects.css';


const CompletedProjects = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // The backend route is /project/completed/all, not specific to a client
      axios.get(`http://localhost:8000/project/completed/all`)
        .then(res => {
          setProjects(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching completed projects:', err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  if (loading) {
    return <div>Loading completed projects...</div>;
  }

  if (projects.length === 0) {
    return <div>No completed projects yet.</div>;
  }

  return (
    <>
       
    <div className="completed-projects-container">
      <h3>Recently Completed Projects</h3>
      <div className="completed-projects-list">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="project-info">
              <h4>{project.title}</h4>
              <p>Budget: ₹{project.budget}</p>
            </div>
            <div className="freelancer-info">
              <img src={project.assignedFreelancer.profileImage} alt={project.assignedFreelancer.name} className="freelancer-avatar" />
              <div className="freelancer-details">
                <span className="freelancer-name">{project.assignedFreelancer.name}</span>
                <span className="freelancer-rating">⭐ {project.assignedFreelancer.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      </>
  );
};

export default CompletedProjects;