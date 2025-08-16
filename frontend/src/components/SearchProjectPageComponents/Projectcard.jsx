// components/SearchProjectPageComponents/Projectcard.jsx
import { useNavigate } from 'react-router-dom';
import './Projectcard.css'
function ProjectCards({ project }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/project/projectdetails/${project._id}`);
  };

  return (
    <div className="project-card clickable-card" onClick={handleCardClick}>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <p><strong>Budget:</strong> ₹{project.budget}</p>
      <p><strong>Skills:</strong> {project.skills?.join(', ')}</p>
    </div>
  );
}

export default ProjectCards;