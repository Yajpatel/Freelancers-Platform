import Projectdetails from "../../freelancerPages/Projectdetails";
import { Link } from 'react-router-dom';
function ProjectCards({project}){
    return <>
    <div className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <p><strong>Budget:</strong> ₹{project.budget}</p>
      <p><strong>Skills:</strong> {project.skills?.join(', ')}</p>
        <Link to={`/projectdetails/${project._id}`}><button className="apply-btn">Apply Proposal</button></Link>
      
    </div>
    </>
}
export default ProjectCards;