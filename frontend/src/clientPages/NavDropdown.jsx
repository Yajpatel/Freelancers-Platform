import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import './ClientNavbar.css'; // Navbar styles

const NavDropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // This function now stops the click from propagating to parent elements
    const handleToggle = (e) => {
        e.stopPropagation(); 
        setIsOpen(!isOpen);
    };

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="nav-dropdown" ref={dropdownRef}>
            <button
                className={`dropdown-toggle ${isOpen ? 'open' : ''}`}
                onClick={handleToggle}
            >
                {title}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`chevron-icon ${isOpen ? 'open' : ''}`}
                />
            </button>

            {/* The "open" class now controls visibility on mobile */}
            <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
                {items.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)} // Close dropdown when an item is clicked
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default NavDropdown;