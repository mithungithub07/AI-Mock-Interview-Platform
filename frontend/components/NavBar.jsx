import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('isAdmin');
        setIsAdmin(adminToken && adminUser === 'true');
    }, [location]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo/Brand */}
                <div className="navbar-brand" onClick={() => navigate('/')}>
                    <span className="brand-icon">🎯</span>
                    <span className="brand-text">Mock Interview</span>
                </div>

                {/* Navigation Links */}
                <div className="navbar-links">
                    {/* Home Button - Show on non-home pages */}
                    {location.pathname !== '/' && (
                        <button
                            className="nav-button nav-home"
                            onClick={() => navigate('/')}
                        >
                            🏠 Home
                        </button>
                    )}

                    {/* Admin Dashboard Button - Only show if admin logged in and not on admin page */}
                    {isAdmin && location.pathname !== '/admin' && (
                        <button
                            className="nav-button nav-admin"
                            onClick={() => navigate('/admin')}
                        >
                            ⚙️ Admin Dashboard
                        </button>
                    )}

                    {/* Logout Button - Show if user is logged in */}
                    {user && (
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