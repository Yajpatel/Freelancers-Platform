import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './ProfilePage.css';
import { useNavigate } from "react-router-dom";
import { doSignOut } from "../firebase/auth";
import ReviewsList from "./ReviewsList";
import ClientNavbar from '../clientPages/ClientNavbar';
import FreelancerNavbar from '../freelancerPages/FreelancerNavbar';
import { useAuth } from "../context/authcontext";

// Helper component for cleaner code
const ProfileSection = ({ title, sectionKey, isEditing, onEdit, onSave, onCancel, children }) => {
    return (
        <div className="profile-section">
            <div className="section-header">
                <h3 className="section-title">{title}</h3>
                {!isEditing && (
                    <button onClick={() => onEdit(sectionKey)} className="btn btn-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>
                )}
            </div>
            <div className="section-content">
                {children}
                {isEditing && (
                    <div className="edit-actions">
                        <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
                        <button onClick={onSave} className="btn btn-primary">Save Changes</button>
                    </div>
                )}
            </div>
        </div>
    );
};

function ProfilePage() {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({});

    const navigate = useNavigate();
    useEffect(() => {
        axios.get(`http://localhost:8000/freelancer/users/getuser/${id}`)
            .then(res => setUser(res.data))
            .catch(err => console.error("Error fetching user:", err));
        
        axios.get(`http://localhost:8000/freelancer/users/reviews/${id}`)
            .then(res => setReviews(res.data))
            .catch(err => console.error("Error fetching reviews:", err));
    }, [id]);

    const handleEdit = (section) => {
        setEditingSection(section);

        if (section === 'experience') {
            setFormData({ experience: user.experience ? JSON.parse(JSON.stringify(user.experience)) : [] });
        } else if (section === 'skills') {
            setFormData(user.skills ? [...user.skills] : []);
        } else if (section === 'education') {
            setFormData({ education: user.education ? JSON.parse(JSON.stringify(user.education)) : [] });
        } else if (section === 'bio') {
            setFormData(user.bio || '');
        } else if (section === 'paymentInfo') {
            setFormData(user.paymentInfo ? { ...user.paymentInfo } : {});
        } else {
            console.error('Unknown section for edit:', section);
        }
    };

    const handleSaveEducation = async () => {
        if (!formData.education) return;

        try {
            for (let edu of formData.education) {
                if (edu._id) {
                    // Update existing
                    await axios.put(`http://localhost:8000/freelancer/users/education/${id}/${edu._id}`, edu);
                } else {
                    // Add new
                    await axios.post(`http://localhost:8000/freelancer/users/education/${id}`, edu);
                }
            }

            // Refetch updated user data
            const res = await axios.get(`http://localhost:8000/freelancer/users/getuser/${id}`);
            setUser(res.data);
            handleCancel();
        } catch (err) {
            console.error("Education update failed:", err);
        }
    };

    const handleCancel = () => {
        setEditingSection(null);
        setFormData({});
    };

    const handleSave = async () => {
        if (!editingSection) return;

        try {
            let url = '';
            let body = {};

            if (editingSection === 'bio') {
                url = `http://localhost:8000/freelancer/users/update/bio/${id}`;
                body = { bio: formData };
            } else if (editingSection === 'skills') {
                url = `http://localhost:8000/freelancer/users/update/skills/${id}`;
                body = { skills: Array.isArray(formData) ? formData : formData.split(',').map(s => s.trim()) };
            } else if (editingSection === 'paymentInfo') {
                url = `http://localhost:8000/freelancer/users/update/payment/${id}`;
                body = { paymentInfo: formData };
            } else {
                console.error('Unknown section:', editingSection);
                return;
            }

            const res = await axios.put(url, body);
            setUser(res.data);
            handleCancel(); // Reset editing state
        } catch (err) {
            console.error("Update failed:", err);
        }
    };
    const handleSaveExperience = async () => {
        if (!formData.experience) return;

        try {
            const userExp = user.experience || [];

            // Separate new experiences from existing ones (simple check by _id)
            const updates = formData.experience.map(exp => {
                if (exp._id) return { ...exp }; // existing experience
                return exp; // new experience
            });

            // Save each experience individually
            for (let exp of updates) {
                if (exp._id) {
                    // Update existing
                    await axios.put(`http://localhost:8000/freelancer/users/experience/${id}/${exp._id}`, exp);
                } else {
                    // Add new
                    await axios.post(`http://localhost:8000/freelancer/users/experience/${id}`, exp);
                }
            }

            // Refetch updated user data
            const res = await axios.get(`http://localhost:8000/freelancer/users/getuser/${id}`);
            setUser(res.data);
            handleCancel();
        } catch (err) {
            console.error("Experience update failed:", err);
        }
    };

    const handleFormChange = (e, section) => {
        // Handle nested objects like paymentInfo
        if (typeof formData === 'object' && !Array.isArray(formData)) {
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            // Handle simple values like bio and arrays like skills
            setFormData(e.target.value);
        }
    };

    const handleLogout = async () => {
        try {
            await doSignOut();
            // Optional: Clear any user-related data from local storage
            localStorage.removeItem('userToken'); // Example if you store a token
            console.log("User logged out successfully");
            navigate('/'); // Redirect to login page after logout
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }
    if (!user) return <div className="loading-container">Loading Profile...</div>;

    const renderNavbar = () => {
        if (user.currentRole === 'client') {
            return <ClientNavbar />;
        } else if (user.currentRole === 'freelancer') {
            return <FreelancerNavbar />;
        }
        return null;
    };


    return (
        <>
            {renderNavbar()}
            <div className="profile-page-container">
                {/* Main Content Column */}
                <main className="profile-main">
                    <div className="profile-card">
                        <div className="profile-header">
                            <img src={user.profileImage} alt="Profile" className="profile-image" />
                            <div className="profile-info">
                                <h2>{user.name}</h2>
                                <p className="email">{user.email}</p>
                                <p className="location">{user.location || "Location not set"}</p>
                            </div>
                        </div>
                    </div>

                    <ProfileSection title="About Me" sectionKey="bio" isEditing={editingSection === 'bio'} onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}>
                        {editingSection === 'bio' ? (
                            <textarea value={formData} onChange={(e) => setFormData(e.target.value)} placeholder="Tell us about yourself..." />
                        ) : (
                            <p>{user.bio || "No bio available. Click the edit icon to add one."}</p>
                        )}
                    </ProfileSection>

                    <ProfileSection title="Skills" sectionKey="skills" isEditing={editingSection === 'skills'} onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}>
                        {editingSection === 'skills' ? (
                            <input type="text" value={Array.isArray(formData) ? formData.join(', ') : ''} onChange={(e) => setFormData(e.target.value.split(',').map(s => s.trim()))} placeholder="React, Node.js, Figma..." />
                        ) : (
                            <div className="skills-list">
                                {user.skills?.length > 0
                                    ? user.skills.map((s, i) => <span key={i} className="skill-badge">{s}</span>)
                                    : <p>No skills added.</p>}
                            </div>
                        )}
                    </ProfileSection>

                    <ProfileSection
                        title="Work Experience"
                        sectionKey="experience"
                        isEditing={editingSection === 'experience'}
                        onEdit={handleEdit}
                        onSave={handleSaveExperience} // use dedicated save
                        onCancel={handleCancel}
                    >
                        {editingSection === 'experience' ? (
                            <div>
                                {formData.experience?.map((exp, index) => (
                                    <div key={index} className="experience-form-item">
                                        <input
                                            type="text"
                                            placeholder="Role"
                                            value={exp.role || ""}
                                            onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[index].role = e.target.value;
                                                setFormData(prev => ({ ...prev, experience: newExp }));
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Company"
                                            value={exp.company || ""}
                                            onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[index].company = e.target.value;
                                                setFormData(prev => ({ ...prev, experience: newExp }));
                                            }}
                                        />
                                        <input
                                            type="date"
                                            placeholder="Start Date"
                                            value={exp.startDate ? exp.startDate.split('T')[0] : ""}
                                            onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[index].startDate = e.target.value;
                                                setFormData(prev => ({ ...prev, experience: newExp }));
                                            }}
                                        />
                                        <input
                                            type="date"
                                            placeholder="End Date"
                                            value={exp.endDate ? exp.endDate.split('T')[0] : ""}
                                            onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[index].endDate = e.target.value;
                                                setFormData(prev => ({ ...prev, experience: newExp }));
                                            }}
                                        />
                                        <textarea
                                            placeholder="Description"
                                            value={exp.description || ""}
                                            onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[index].description = e.target.value;
                                                setFormData(prev => ({ ...prev, experience: newExp }));
                                            }}
                                        />
                                        <button
                                            onClick={async () => {
                                                const exp = formData.experience[index];

                                                if (exp._id) {
                                                    try {
                                                        // Call DELETE API for existing experience
                                                        await axios.delete(`http://localhost:8000/freelancer/users/experience/${id}/${exp._id}`);
                                                        // Remove from local formData after successful deletion
                                                        const newExp = formData.experience.filter((_, i) => i !== index);
                                                        setFormData(prev => ({ ...prev, experience: newExp }));

                                                        // Update user state to reflect deletion immediately
                                                        setUser(prevUser => ({
                                                            ...prevUser,
                                                            experience: prevUser.experience.filter(e => e._id !== exp._id)
                                                        }));
                                                    } catch (err) {
                                                        console.error('Failed to delete experience:', err);
                                                    }
                                                } else {
                                                    // If experience is not yet saved in DB, just remove locally
                                                    const newExp = formData.experience.filter((_, i) => i !== index);
                                                    setFormData(prev => ({ ...prev, experience: newExp }));
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>

                                    </div>
                                ))}
                                <button
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        experience: [...(prev.experience || []), { role: "", company: "", startDate: "", endDate: "", description: "" }]
                                    }))}
                                >
                                    Add Experience
                                </button>
                            </div>
                        ) : (
                            <div className="experience-list">
                                {user.experience?.length > 0
                                    ? user.experience.map((exp, i) => (
                                        <div key={i} className="list-item">
                                            <h4>{exp.role} at {exp.company}</h4>
                                            <p>{new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}</p>
                                            <p>{exp.description}</p>
                                        </div>
                                    ))
                                    : <p>No work experience added.</p>
                                }
                            </div>
                        )}
                    </ProfileSection>


                    <ProfileSection
                        title="Education"
                        sectionKey="education"
                        isEditing={editingSection === 'education'}
                        onEdit={handleEdit}
                        onSave={handleSaveEducation} // dedicated save
                        onCancel={handleCancel}
                    >
                        {editingSection === 'education' ? (
                            <div>
                                {formData.education?.map((edu, index) => (
                                    <div key={index} className="education-form-item">
                                        <input
                                            type="text"
                                            placeholder="Degree"
                                            value={edu.degree || ""}
                                            onChange={(e) => {
                                                const newEdu = [...formData.education];
                                                newEdu[index].degree = e.target.value;
                                                setFormData(prev => ({ ...prev, education: newEdu }));
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="School"
                                            value={edu.school || ""}
                                            onChange={(e) => {
                                                const newEdu = [...formData.education];
                                                newEdu[index].school = e.target.value;
                                                setFormData(prev => ({ ...prev, education: newEdu }));
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Start Year"
                                            value={edu.startYear || ""}
                                            onChange={(e) => {
                                                const newEdu = [...formData.education];
                                                newEdu[index].startYear = e.target.value;
                                                setFormData(prev => ({ ...prev, education: newEdu }));
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="End Year"
                                            value={edu.endYear || ""}
                                            onChange={(e) => {
                                                const newEdu = [...formData.education];
                                                newEdu[index].endYear = e.target.value;
                                                setFormData(prev => ({ ...prev, education: newEdu }));
                                            }}
                                        />
                                        <button
                                            onClick={async () => {
                                                const currentEdu = formData.education[index];

                                                if (currentEdu._id) {
                                                    try {
                                                        await axios.delete(`http://localhost:8000/freelancer/users/education/${id}/${currentEdu._id}`);
                                                        const newEduList = formData.education.filter((_, i) => i !== index);
                                                        setFormData(prev => ({ ...prev, education: newEduList }));

                                                        setUser(prevUser => ({
                                                            ...prevUser,
                                                            education: prevUser.education.filter(e => e._id !== currentEdu._id)
                                                        }));
                                                    } catch (err) {
                                                        console.error('Failed to delete education:', err);
                                                    }
                                                } else {
                                                    const newEduList = formData.education.filter((_, i) => i !== index);
                                                    setFormData(prev => ({ ...prev, education: newEduList }));
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        education: [...(prev.education || []), { degree: "", school: "", startYear: "", endYear: "" }]
                                    }))}
                                >
                                    Add Education
                                </button>
                            </div>
                        ) : (
                            <div className="education-list">
                                {user.education?.length > 0
                                    ? user.education.map((edu, i) => (
                                        <div key={i} className="list-item">
                                            <h4>{edu.degree} from {edu.school}</h4>
                                            <p>{edu.startYear} - {edu.endYear}</p>
                                        </div>
                                    ))
                                    : <p>No education details added.</p>
                                }
                            </div>
                        )}
                    </ProfileSection>
                    <ReviewsList reviews={reviews} />
                </main>

                {/* Sidebar Column */}
                <aside className="profile-sidebar">
                    <div className="sidebar-section">
                        <h3 className="section-title">Verification Status</h3>
                        <ul className="verification-list">
                            <li>{user.verification?.emailVerified ? "✅" : "❌"} Email Verified</li>
                            <li>{user.verification?.phoneVerified ? "✅" : "❌"} Phone Verified</li>
                            <li>{user.verification?.idVerified ? "✅" : "❌"} ID Verified</li>
                        </ul>
                    </div>

                    <button className="btn btn-primary chat-btn" onClick={() => navigate(`/chat/${user._id}`)}>Chat with {user.name.split(' ')[0]}</button>

                    <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </aside>
            </div>
        </>
    );
}

export default ProfilePage;