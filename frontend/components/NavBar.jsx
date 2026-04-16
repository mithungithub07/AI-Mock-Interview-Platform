import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../style/navbar.css"

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo/Brand */}
                <div className="navbar-brand" onClick={() => handleNavigation('/')}>
                    <span className="brand-icon">🎯</span>
                    <span className="brand-text">Mock Interview</span>
                </div>

                {/* Navigation Links */}
                <div className="navbar-links">
                    {/* Home Button - Always visible */}
                    {location.pathname !== '/' && (
                        <button
                            className="nav-button nav-home"
                            onClick={() => handleNavigation('/')}
                        >
                            🏠 Home
                        </button>
                    )}

                    {/* Admin Dashboard Button - Show if not on admin page */}
                    {isAdmin && location.pathname !== '/admin' && (
                        <button
                            className="nav-button nav-admin"
                            onClick={() => handleNavigation('/admin')}
                        >
                            ⚙️ Admin Dashboard
                        </button>
                    )}

                    {/* Logout Button - Only on Admin page */}
                    {isAdmin && location.pathname === '/admin' && (
                        <button
                            className="nav-button nav-logout"
                            onClick={handleLogout}
                        >
                            🚪 Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;