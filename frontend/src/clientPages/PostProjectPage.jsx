import React, { useState } from 'react';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PostProjectPage.css'; // Corrected CSS import name
import ClientNavbar from './ClientNavbar';

function PostProjectPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Updated state to handle skills array and other category
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budget: '',
        deadline: ''
    });
    const [skills, setSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [otherCategory, setOtherCategory] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const projectCategories = [
        'Web Development', 'Mobile App Development', 'UI/UX Design', 
        'Graphic Design', 'Content Writing', 'Digital Marketing', 
        'Data Science', 'Backend Development'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // --- New Skill Handling Functions ---
    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const skillToAdd = currentSkill.trim();
            if (skillToAdd && !skills.includes(skillToAdd)) {
                setSkills([...skills, skillToAdd]);
            }
            setCurrentSkill(''); // Clear the input
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };
    // --- End of New Skill Functions ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            const finalCategory = formData.category === 'Other' ? otherCategory : formData.category;

            const payload = {
                ...formData,
                skills, // Send the skills array
                category: finalCategory, // Send the correct category
                clientUID: currentUser.uid
            };

            await axios.post('http://localhost:8000/project/create', payload);
            
            alert('Project posted successfully!');
            navigate('/client/myprojects');

        } catch (err) {
            console.error('Failed to post project:', err);
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <>
             <ClientNavbar />
        <div className="post-project-container">
            <div className="post-project-form-card">
                <header className="form-header">
                    <h1>Tell us what you need done</h1>
                    <p>Contact skilled freelancers within minutes. View profiles, ratings, and portfolios and chat with them. Money will be paid to the freelancer only when you are 100% satisfied with their work.</p>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Title and Description remain the same */}
                    <div className="form-group">
                        <label htmlFor="title">Project Title</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Build a responsive e-commerce website" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Project Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="6" placeholder="Describe your project in detail..." required></textarea>
                    </div>

                    {/* --- Updated Category Section --- */}
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} required >
                            <option value="" disabled>Select a category</option>
                            {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    {formData.category === 'Other' && (
                        <div className="form-group">
                            <label htmlFor="otherCategory">Please specify your category</label>
                            <input type="text" id="otherCategory" name="otherCategory" value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} placeholder="e.g., AI Model Training" required />
                        </div>
                    )}
                    {/* --- End of Updated Category Section --- */}

                    {/* --- Updated Skills Section --- */}
                    <div className="form-group">
                        <label htmlFor="skills">Required Skills</label>
                        <input
                            type="text"
                            id="skills"
                            name="skills"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            placeholder="Type a skill and press Enter..."
                        />
                        <div className="skills-chips-container">
                            {skills.map(skill => (
                                <div key={skill} className="skill-chip">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)}>&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* --- End of Updated Skills Section --- */}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="budget">Budget (₹)</label>
                            <input type="number" id="budget" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g., 50000" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="deadline">Deadline</label>
                            <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} required />
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn-submit-project" disabled={isSubmitting}>
                        {isSubmitting ? 'Posting...' : 'Post Project'}
                    </button>
                </form>
            </div>
            </div>
            </>
    );
}

export default PostProjectPage;