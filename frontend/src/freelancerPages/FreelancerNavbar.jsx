import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import '../clientPages/ClientNavbar.css'; 
import NavDropdown from '../clientPages/NavDropdown'; // <-- IMPORT THE DROPDOWN

function FreelancerNavbar() {
    const { currentUser } = useAuth();

    const projectItems = [
        { label: 'Active Projects', path: '/freelancer/myprojects?tab=active' },
        { label: 'Submitted Proposals', path: '/freelancer/myprojects?tab=proposals' },
        { label: 'Completed', path: '/freelancer/myprojects?tab=completed' },
    ];

    const earningItems = [
        { label: 'Released', path: '/freelancertransaction?tab=released' },
        { label: 'In Escrow', path: '/freelancertransaction?tab=in_escrow' },
    ];

    return (
        <header className="client-main-navbar">
            <div className="navbar-content">
                <Link to="/freelancer/dashboard" className="navbar-logo">Freelancer</Link>
                <nav className="navbar-links">
                    <NavLink to="/freelancer/dashboard" className="nav-link">Dashboard</NavLink>
                    <NavLink to="/project/SearchProjects" className="nav-link">Find Projects</NavLink>
                    <NavDropdown title="My Work" items={projectItems} />
                    <NavLink to="/messages" className="nav-link">Messages</NavLink>
                    <NavDropdown title="Earnings" items={earningItems} />
                </nav>
                <div className="navbar-actions">
                    <Link to={`/profile/${currentUser?.uid}`} className="profile-link-nav">
                        <FontAwesomeIcon icon={faUserCircle} />
                        <span>My Profile</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default FreelancerNavbar;