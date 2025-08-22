import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faFileAlt, faSearch, faComments, faTasks, faCreditCard, faUserCircle, faRocket } from '@fortawesome/free-solid-svg-icons';
import './ClientNavbar.css';
import NavDropdown from './NavDropdown';

function ClientNavbar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const projectItems = [
        { label: 'Open', path: '/client/myprojects?tab=open' },
        { label: 'In Progress', path: '/client/myprojects?tab=in-progress' },
        { label: 'Pending Review', path: '/client/myprojects?tab=pending-review' },
        { label: 'Completed', path: '/client/myprojects?tab=completed' },
    ];

    const transactionItems = [
        { label: 'In Escrow', path: '/clienttransactions?tab=in_escrow' },
        { label: 'Released', path: '/clienttransactions?tab=released' },
        { label: 'Refunded', path: '/clienttransactions?tab=refunded' },
    ];

    return (
        <header className="client-main-navbar">
            <div className="navbar-content">
                <Link to="/client/dashboard" className="navbar-logo">
                    <FontAwesomeIcon icon={faRocket} />
                    <span>Freelancer</span>
                </Link>
                <nav className="navbar-links">
                    <NavLink to="/client/dashboard" className="nav-link">
                        <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" /> Dashboard
                    </NavLink>
                    <NavLink to="/myproposals" className="nav-link">
                        <FontAwesomeIcon icon={faFileAlt} className="nav-icon" /> Proposals
                    </NavLink>
                    <NavLink to="/findfreelancers" className="nav-link">
                        <FontAwesomeIcon icon={faSearch} className="nav-icon" /> Find Freelancers
                    </NavLink>
                    <NavLink to="/messages" className="nav-link">
                        <FontAwesomeIcon icon={faComments} className="nav-icon" /> Messages
                    </NavLink>
                    <NavDropdown title={<><FontAwesomeIcon icon={faTasks} className="nav-icon" /> My Projects</>} items={projectItems} />
                    <NavDropdown title={<><FontAwesomeIcon icon={faCreditCard} className="nav-icon" /> Transactions</>} items={transactionItems} />
                </nav>
                <div className="navbar-actions">
                    <button onClick={() => navigate('/postproject')} className="btn-post-project-nav">Post a Project</button>
                    <Link to={`/profile/${currentUser?.uid}`} className="profile-link-nav">
                        <FontAwesomeIcon icon={faUserCircle} />
                        <span>My Profile</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default ClientNavbar;