import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faRocket, faTachometerAlt, faSearch, faTasks, faComments, faCreditCard, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../clientPages/ClientNavbar.css';
import NavDropdown from '../clientPages/NavDropdown';

function FreelancerNavbar() {
    const { currentUser, unreadCount } = useAuth();
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
        { label: 'Active Projects', path: '/freelancer/myprojects?tab=active' },
        { label: 'Submitted Proposals', path: '/freelancer/myprojects?tab=proposals' },
        { label: 'Completed', path: '/freelancer/myprojects?tab=completed' },
    ];

    const earningItems = [
        { label: 'Released', path: '/freelancertransaction?tab=released' },
        { label: 'In Escrow', path: '/freelancertransaction?tab=in_escrow' },
    ];

    // Reusable NavLinks component
    const NavLinks = () => (
        <>
            <NavLink to="/freelancer/dashboard" className="nav-link">
                <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" /> Dashboard
            </NavLink>
            <NavLink to="/project/SearchProjects" className="nav-link">
                <FontAwesomeIcon icon={faSearch} className="nav-icon" /> Find Projects
            </NavLink>
            <NavDropdown title={<><FontAwesomeIcon icon={faTasks} className="nav-icon" /> My Work</>} items={projectItems} />
            <NavLink to="/chat" className="nav-link">
                <FontAwesomeIcon icon={faComments} className="nav-icon" /> Messages
                {unreadCount > 0 && <span className="unread-badge-nav">{unreadCount}</span>}
            </NavLink>
            <NavDropdown title={<><FontAwesomeIcon icon={faCreditCard} className="nav-icon" /> Earnings</>} items={earningItems} />
        </>
    );

    return (
        <header className="client-main-navbar" ref={navbarRef}>
            <div className="navbar-content">
                <Link to="/freelancer/dashboard" className="navbar-logo">
                    <FontAwesomeIcon icon={faRocket} />
                    <span>Freelancer</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="navbar-links desktop-nav">
                    <NavLinks />
                </nav>

                <div className="navbar-actions">
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
                </div>
            )}
        </header>
    );
}

export default FreelancerNavbar;