// frontend/src/freelancerPages/SearchProjects.jsx

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

// Component Imports
import FreelancerNavbar from './FreelancerNavbar';
import FilterSidebar from '../components/SearchProjectPageComponents/FilterSidebar';

// Asset Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faStar, faSearch } from '@fortawesome/free-solid-svg-icons'; // Added faSearch
import './SearchProjects.css';

// --- Helper Component for Project Cards (No changes here) ---
const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    const handleCardClick = () => navigate(`/project/projectdetails/${project._id}`);

    const formatBudget = (budget) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(budget);
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="project-list-item" onClick={handleCardClick}>
            <div className="project-item-main">
                <h3 className="project-item-title">{project.title}</h3>
                <p className="project-item-description">
                    {project.description.substring(0, 280)}...
                </p>
                <div className="project-item-skills">
                    {project.skills?.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                </div>
                <div className="project-item-footer">
                    <div className="client-rating">
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                        <span className="rating-text">0.0</span>
                        <span className="reviews-count">(0 reviews)</span>
                    </div>
                    <span className="posted-time">{timeAgo(project.createdAt)}</span>
                </div>
            </div>
            <div className="project-item-aside">
                <div className="proposal-count">{project.proposals?.length || 0} bids</div>
                <div className="project-budget">{formatBudget(project.budget)}</div>
            </div>
        </div>
    );
};

// --- Main Search Projects Component ---
function SearchProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchTerm: '',
        budget: { min: '', max: '' },
        skills: []
    });

    const fetchProjects = useCallback(
        debounce(async (currentFilters) => {
            setLoading(true);
            try {
                const res = await axios.post('http://localhost:8000/project/search', {
                    searchTerm: currentFilters.searchTerm,
                    budget: currentFilters.budget,
                    skills: currentFilters.skills
                });
                setProjects(res.data);
            } catch (err) {
                console.error("Error fetching projects:", err);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        fetchProjects(filters);
        return () => fetchProjects.cancel();
    }, [filters, fetchProjects]);

    return (
        <>
            <FreelancerNavbar />
            <div className="search-page-layout">
                <FilterSidebar filters={filters} setFilters={setFilters} />
                <main className="project-results-area">
                    <header className="results-header">
                        <h2 className="results-title">
                            {loading ? 'Searching...' : `${projects.length} projects found`}
                        </h2>
                        {/* --- ✅ NEW SEARCH BAR ADDED HERE --- */}
                        <div className="header-search-bar">
                             <FontAwesomeIcon icon={faSearch} className="search-icon" />
                             <input
                                type="text"
                                placeholder="Search projects..."
                                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                             />
                        </div>
                    </header>
                    <div className="project-list-container">
                        {loading ? (
                             <div className="loading-spinner">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                            </div>
                        ) : projects.length === 0 ? (
                            <p className="no-results-message">No projects match your current filters.</p>
                        ) : (
                            projects.map(project => (
                                <ProjectCard key={project._id} project={project} />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

export default SearchProjects;