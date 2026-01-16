import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../assets/Valora-transparent-logo-horizontal.png'
import './navbar.css'

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { currentUser, logout } = useAuth()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const handleLogout = async () => {
        try {
            await logout()
            closeMenu()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <img src={Logo} alt="Valora Logo" className="logo" />
                </Link>

                <button 
                    className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link" onClick={closeMenu}>
                        Home
                    </Link>
                    <Link to="/about" className="nav-link" onClick={closeMenu}>
                        About
                    </Link>
                    <Link to="/contact" className="nav-link" onClick={closeMenu}>
                        Contact
                    </Link>
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                                Dashboard
                            </Link>
                            <button className="nav-link nav-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link nav-link-primary" onClick={closeMenu}>
                                Log in
                            </Link>
                            <Link to="/signup" className="nav-link nav-link-secondary" onClick={closeMenu}>
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
