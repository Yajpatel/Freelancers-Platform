function ProjectCards({project}){
    return <>
    <div className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <p><strong>Budget:</strong> ₹{project.budget}</p>
      <p><strong>Skills:</strong> {project.skills?.join(', ')}</p>
      <button className="apply-btn">Apply Proposal</button>
    </div>
    </>
}
export default ProjectCards;