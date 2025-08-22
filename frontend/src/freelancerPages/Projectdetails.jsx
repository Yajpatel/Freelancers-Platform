import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faExternalLinkAlt, faComments, faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Component Imports
import FreelancerNavbar from './FreelancerNavbar'; // <-- IMPORT THE NAVBAR
import './Projectdetails.css';

function Projectdetails() {
    const { id } = useParams(); // This is the project ID from the URL
    const { currentUser } = useAuth();
    const [project, setProject] = useState(null);
    const [client, setClient] = useState(null);
    const [isPanel, setisPanel] = useState(false);

    const [proposaldata, setproposaldata] = useState({
        description: '',
        bidamount: '',
        time: '',
        projectId: id,
        freelancerid: currentUser.uid,
    });

    // Fetch project + client details
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/project/projectdetails/${id}`);
                setProject(res.data.project);
                setClient(res.data.client);
            } catch (error) {
                console.error('Failed to fetch project details:', error);
            }
        };

        fetchProjectDetails();
    }, [id]);

    // Open proposal panel
    const openpanel = () => {
        setisPanel(true);
    };

    // Close proposal panel
    const closepanel = (e) => {
        e.preventDefault();
        setisPanel(false);
    };

    // Submit proposal
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                freelancer: proposaldata.freelancerid,
                project: proposaldata.projectId,
                coverLetter: proposaldata.description,
                totalBidAmount: Number(proposaldata.bidamount),
                deliveryTime: Number(proposaldata.time),
            };

            const res = await axios.post('http://localhost:8000/project/saveproposal', payload);

            if (res.status === 201) {
                alert('Proposal submitted successfully!');
                setproposaldata({
                    freelancerid: currentUser.uid,
                    projectId: id,
                    description: '',
                    bidamount: '',
                    time: '',
                });
                setisPanel(false);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to submit proposal');
        }
    };

    if (!project || !client) return (
        <>
            <FreelancerNavbar />
            <div className="loading-container">Loading Project Details...</div>
        </>
    );


    return (
        <>
            <FreelancerNavbar /> {/* <-- NAVBAR ADDED HERE */}
            <div className="project-details-page">
                {/* Left Column: Project Details */}
                <main className="project-main-content">
                    <header className="project-header">
                        <span className="project-category-badge">{project.category}</span>
                        <h1 className="project-title-main">{project.title}</h1>
                        <div className="project-meta">
                            <span>Posted by {client.name}</span>
                            <span><FontAwesomeIcon icon={faCalendarAlt} /> Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                    </header>

                    <section className="project-description">
                        <h2>Project Description</h2>
                        <p>{project.description}</p>
                    </section>

                    <section className="project-skills">
                        <h2>Required Skills</h2>
                        <div className="skills-container">
                            {project.skills.map(skill => (
                                <span key={skill} className="skill-tag-detail">{skill}</span>
                            ))}
                        </div>
                    </section>

                    <div className="apply-section">
                        <button onClick={openpanel} className="apply-btn-main">
                            Apply Now <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </main>

                {/* Right Column: Client & Budget Info */}
                <aside className="project-sidebar">
                    <div className="sidebar-card budget-card">
                        <h3>Project Budget</h3>
                        <p className="budget-amount">₹{project.budget}</p>
                    </div>

                    <div className="sidebar-card client-card">
                        <h3>About the Client</h3>
                        <div className="client-info-detail">
                            <img src={client.profileImage} alt={client.name} className="client-avatar" />
                            <div>
                                <h4 className="client-name">{client.name}</h4>
                                <div className="client-rating-detail">
                                    <FontAwesomeIcon icon={faStar} />
                                    <span>{client.rating.toFixed(1)} ({client.reviews?.length || 0} reviews)</span>
                                </div>
                            </div>
                        </div>
                        <Link to={`/chat/${client._id}`} className="btn-chat">
                            <FontAwesomeIcon icon={faComments} /> Chat with Client
                        </Link>
                        <Link to={`/profile/${client.firebaseUID}`} className="btn-profile">
                            View Profile <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </Link>
                    </div>
                </aside>

                {/* Proposal Form Side Panel */}
                <div className={`proposal-overlay ${isPanel ? 'is-visible' : ''}`}>
                    <div className="proposal-panel-content">
                        <header className="panel-header">
                            <h3>Submit Your Proposal</h3>
                            <button className="close-panel" onClick={closepanel}>&times;</button>
                        </header>
                        <form onSubmit={handleSubmit} className="proposal-form-panel">
                            <div className="form-group-panel">
                                <label htmlFor="description">Cover Letter</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Briefly explain why you're the best fit for this project..."
                                    value={proposaldata.description}
                                    onChange={(e) => setproposaldata({ ...proposaldata, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group-panel">
                                <label htmlFor="bid">Your Bid (₹)</label>
                                <input
                                    type="number"
                                    id="bid"
                                    name="bid"
                                    placeholder="e.g., 4500"
                                    value={proposaldata.bidamount}
                                    onChange={(e) => setproposaldata({ ...proposaldata, bidamount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group-panel">
                                <label htmlFor="time">Delivery Time (in days)</label>
                                <input
                                    type="number"
                                    id="time"
                                    name="time"
                                    placeholder="e.g., 30"
                                    value={proposaldata.time}
                                    onChange={(e) => setproposaldata({ ...proposaldata, time: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-submit-proposal">
                                Submit Proposal
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Projectdetails;