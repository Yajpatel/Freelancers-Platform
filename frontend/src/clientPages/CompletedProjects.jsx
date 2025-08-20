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
    <div className="completed-projects-container">
      <h3>Recently Completed Projects</h3>
      <div className="projects-list">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <h4>{project.title}</h4>
            <p>Freelancer: {project.assignedFreelancer.name}</p>
            <p>Freelancer ID: {project.assignedFreelancer._id}</p>
            <p>Rating: {project.assignedFreelancer.rating}</p>
            <p>Budget: ₹{project.budget}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedProjects;