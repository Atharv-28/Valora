import { Link } from 'react-router-dom'
import { useState } from 'react'
import Logo from '../assets/Valora-transparent-logo-horizontal.png'
import './navbar.css'

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
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
                    <Link to="/login" className="nav-link nav-link-primary" onClick={closeMenu}>
                        Log in
                    </Link>
                    <Link to="/signup" className="nav-link nav-link-secondary" onClick={closeMenu}>
                        Sign up
                    </Link>
                </div>
            </div>
        </nav>
    )
}
