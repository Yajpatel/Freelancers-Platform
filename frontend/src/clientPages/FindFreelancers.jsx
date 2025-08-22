import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FindFreelancers.css';
import ClientNavbar from './ClientNavbar';

function FindFreelancers() {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const res = await axios.get('http://localhost:8000/freelancer/users/freelancers');
                console.log("hii",res.data);
                setFreelancers(res.data);
            } catch (err) {
                console.error("Failed to fetch freelancers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFreelancers();
    }, []);

    // Create a memoized and SAFE list of filtered freelancers
    const filteredFreelancers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        if (!query) {
            return freelancers;
        }

        return freelancers.filter(freelancer => {
            // THE FIX: Use optional chaining (?.) to prevent crashes on undefined data
            const nameMatch = freelancer.name?.toLowerCase().includes(query);
            const emailMatch = freelancer.email?.toLowerCase().includes(query);
            const bioMatch = freelancer.bio?.toLowerCase().includes(query);

            const skillsMatch = freelancer.skills?.some(skill => 
                skill.toLowerCase().includes(query)
            );

            return nameMatch || emailMatch || bioMatch || skillsMatch;
        });
    }, [freelancers, searchQuery]); // Dependencies for useMemo


    if (loading) {
        return <><ClientNavbar /><div className="loading-message">Loading freelancers...</div></>;
    }

    return (
        <>
            <ClientNavbar />
            <div className="find-freelancers-container">
                <header className="freelancers-header">
                    <h1>Find Top Talent</h1>
                    <p>Browse our community of skilled freelancers ready to work on your projects.</p>
                    
                    <div className="search-bar-container">
                        <input
                            type="text"
                            placeholder="Search by name, email, bio, or skill..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <div className="freelancers-grid">
                    {filteredFreelancers.length > 0 ? (
                        filteredFreelancers.map(freelancer => (
                            <div key={freelancer._id} className="freelancer-card">
                                <img src={freelancer.profileImage} alt={freelancer.name} className="freelancer-avatar" />
                                <h3 className="freelancer-name">{freelancer.name}</h3>
                                {/* Use a fallback for bio in case it's missing */}
                                <p className="freelancer-bio">{freelancer.bio || 'No bio available.'}</p>
                                <div className="freelancer-skills">
                                    {freelancer.skills?.slice(0, 4).map(skill => (
                                        <span key={skill} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                                { console.log(freelancer.bio)}
                                { console.log(freelancer._id)}
                                <Link to={`/profile/${freelancer.firebaseUID}`} className="btn-view-profile">View Profile</Link>
                                
                            </div>
                        ))
                    ) : (
                        <p className="no-results-message">No freelancers found matching your search.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default FindFreelancers;