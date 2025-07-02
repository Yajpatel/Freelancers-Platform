import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './ProfilePage.css';

function ProfilePage() {
  const { id } = useParams(); // Get user ID from URL
  const [freelancer, setFreelancer] = useState(null);

  useEffect(() => {

    axios.get(`http://localhost:8000/freelancer/users/getuser/${id}`) 
      .then(res => {setFreelancer(res.data)
        console.log("data coming " ,res.data);
      })
      .catch(err => {
        console.error("Error fetching freelancer:", err)
    console.log("data  not coming ");}
  );
  }, [id]);



  if (!freelancer) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img src="/profile.jpg" alt="Profile" className="profile-image" />
          <div className="profile-info">
            <h2>{freelancer.name}</h2>
            <h2>{freelancer.email}</h2>
            <p className="text-gray-600">{freelancer.title}</p>
            <p className="text-gray-400">{freelancer.location}</p>
            <div className="profile-rating">
              {"★".repeat(Math.floor(freelancer.rating || 0))}
              <span>({freelancer.reviews?.length || 0} reviews)</span>
            </div>
          </div>
          <button className="edit-btn">Edit Profile</button>
        </div>

        <div className="section">
          <h3 className="section-title">About</h3>
          <p className="section-text">{freelancer.bio}</p>
        </div>

        <div className="section">
          <h3 className="section-title">Skills</h3>
          <div className="skills-list">
            {freelancer.skills.map((skill, idx) => (
              <span key={idx} className="skill-badge">{skill}</span>
            ))}
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Portfolio</h3>
          <div className="portfolio-grid">
            {(freelancer.portfolio || []).map((project, idx) => (
              <a key={idx} href={project.link || "#"} className="portfolio-card">
                <img src={project.image || "/placeholder.png"} alt={project.title} className="portfolio-image" />
                <div className="portfolio-title">{project.title}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;