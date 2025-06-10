import React from "react";
import './ProfilePage.css'

export default function FreelancerProfile() {
  const freelancer = {
    name: "Yaj Patel",
    title: "Full Stack Developer",
    location: "Ahmedabad, India",
    rating: 4.8,
    reviews: 120,
    skills: ["React", "Node.js", "MongoDB", "Tailwind CSS", "Express.js"],
    bio: "Passionate full stack developer with 3+ years of experience building scalable web applications. Specializes in MERN stack.",
    portfolio: [
      { title: "E-commerce Website", link: "#", image: "/project1.png" },
      { title: "Portfolio Site", link: "#", image: "/project2.png" },
    ],
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="profile-image"
          />
          <div className="profile-info">
            <h2>{freelancer.name}</h2>
            <p className="text-gray-600">{freelancer.title}</p>
            <p className="text-gray-400">{freelancer.location}</p>
            <div className="profile-rating">
              {"★".repeat(Math.floor(freelancer.rating))}
              <span>({freelancer.reviews} reviews)</span>
            </div>
          </div>
          <button className="edit-btn">Edit Profile</button>
        </div>

        {/* Bio Section */}
        <div className="section">
          <h3 className="section-title">About</h3>
          <p className="section-text">{freelancer.bio}</p>
        </div>

        {/* Skills */}
        <div className="section">
          <h3 className="section-title">Skills</h3>
          <div className="skills-list">
            {freelancer.skills.map((skill, idx) => (
              <span key={idx} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="section">
          <h3 className="section-title">Portfolio</h3>
          <div className="portfolio-grid">
            {freelancer.portfolio.map((project, idx) => (
              <a
                key={idx}
                href={project.link}
                className="portfolio-card"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="portfolio-image"
                />
                <div className="portfolio-title">{project.title}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
