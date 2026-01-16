import React from 'react'
import { Link } from 'react-router-dom'
import './footer.css'
import flogo from '../assets/Valora-transparent-logo-horizontal.png'    
export const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img src={flogo} alt="Valora Logo" className="footer-logo" />
                    <p className="footer-tagline">
                        Multimodal AI interview coach powered by Google Gemini.
                    </p>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Links</h4>
                    <div className="footer-links">
                        <Link to="/about">About</Link>
                        <Link to="/contact">Contact</Link>
                        <Link to="/login">Log in</Link>
                        <Link to="/signup">Sign up</Link>
                    </div>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Developers</h4>
                    <div className="developer-names">
                        <a href="https://portfolio-git-main-atharv-28s-projects.vercel.app/" target="_blank" rel="noopener noreferrer">Atharv Tambekar</a>
                        <a href="https://siddharth-11-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer">Siddharth Vhatkar</a>
                        <a href="https://portfolio-harsh-24.netlify.app/" target="_blank" rel="noopener noreferrer">Harshvardhan Gadagade</a>
                    </div>
                </div>
            </div>

            <div className="lower-footer">
                &copy; Valora 2026 All Rights Reserved.
            </div>
        </footer>
    )
}
