import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import './ClientNavbar.css'; // Navbar styles

const NavDropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
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
                className="dropdown-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`chevron-icon ${isOpen ? 'open' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {items.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className="dropdown-item"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NavDropdown;
