import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faFileAlt, faSearch, faComments, faTasks, faCreditCard, faUserCircle, faRocket, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './ClientNavbar.css';
import NavDropdown from './NavDropdown';

function ClientNavbar() {
    const { currentUser, unreadCount } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navbarRef = useRef(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    // Reusable NavLinks component
    const NavLinks = () => (
        <>
            <NavLink to="/client/dashboard" className="nav-link">
                <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" /> Dashboard
            </NavLink>
            <NavLink to="/myproposals" className="nav-link">
                <FontAwesomeIcon icon={faFileAlt} className="nav-icon" /> Proposals
            </NavLink>
            <NavLink to="/findfreelancers" className="nav-link">
                <FontAwesomeIcon icon={faSearch} className="nav-icon" /> Find Freelancers
            </NavLink>
            <NavLink to="/chat" className="nav-link">
                <FontAwesomeIcon icon={faComments} className="nav-icon" /> Messages
                {unreadCount > 0 && <span className="unread-badge-nav">{unreadCount}</span>}
            </NavLink>
            <NavDropdown title={<><FontAwesomeIcon icon={faTasks} className="nav-icon" /> My Projects</>} items={projectItems} />
            <NavDropdown title={<><FontAwesomeIcon icon={faCreditCard} className="nav-icon" /> Transactions</>} items={transactionItems} />
        </>
    );

    return (
        <header className="client-main-navbar" ref={navbarRef}>
            <div className="navbar-content">
                <Link to="/client/dashboard" className="navbar-logo">
                    <FontAwesomeIcon icon={faRocket} />
                    <span>Freelancer</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="navbar-links desktop-nav">
                    <NavLinks />
                </nav>

                <div className="navbar-actions">
                    <button onClick={() => navigate('/postproject')} className="btn-post-project-nav desktop-only">Post a Project</button>
                    <Link to={`/profile/${currentUser?.uid}`} className="profile-link-nav">
                        <FontAwesomeIcon icon={faUserCircle} />
                        <span className="desktop-only">My Profile</span>
                    </Link>
                    {/* Hamburger Icon */}
                    <button className="hamburger-icon" onClick={toggleMobileMenu}>
                        <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-nav-menu">
                    <nav onClick={toggleMobileMenu}>
                        <NavLinks />
                    </nav>
                    <button onClick={() => { navigate('/postproject'); toggleMobileMenu(); }} className="btn-post-project-nav">
                        Post a Project
                    </button>
                </div>
            )}
        </header>
    );
}

export default ClientNavbar;