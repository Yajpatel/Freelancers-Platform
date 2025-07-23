import { useParams,Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Projectdetails() {
  const { id } = useParams();  // This is the project ID from the URL
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/project/projectdetails/${id}`);
        setProject(res.data.project);
        setClient(res.data.client);  // This assumes you send both project & client in response
      } catch (error) {
        console.error('Failed to fetch project details:', error);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (!project) return <p>Loading...</p>;

  return (
    <div className="project-details-page" style={{ display: 'flex', gap: '20px' }}>
      
      {/* Left: Project Info */}
      <div className="project-info" style={{ flex: 2, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <p><strong>Category:</strong> {project.category}</p>
        <p><strong>Budget:</strong> ₹{project.budget}</p>
        <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {project.status}</p>
        <Link to={`/project/proposal/${project._id}`}><button className="apply-btn">Apply Proposal</button></Link>
        
      </div>

      {/* Right: Client Info */}
      <div className="client-info" style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Client Details</h3>
        {client ? (
          <>
            <p><strong>Name:</strong> {client._id}</p>
            <p><strong>Name:</strong> {client.name}</p>
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Verified:</strong> {client.firebaseUID ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Rating:</strong> ⭐ {client.rating}</p>
            <Link to={`/chat/${client._id}`}><button style={{ marginTop: '10px' }}>💬 Chat with Client</button></Link>
            
          </>
        ) : (
          <p>Loading client details...</p>
        )}
      </div>

    </div>
  );
}

export default Projectdetails;
