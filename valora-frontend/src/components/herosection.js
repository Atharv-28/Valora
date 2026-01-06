import React from 'react'
import { Link } from 'react-router-dom';
import './herosection.css';
import Logo1 from '../assets/Valora-transparent-logo.png'

const Herosection = () => {
    return (
        <div className="hero-container">
            <div className="hero-left">
                <div className="hero-titles">
                    <h1 className="welcome-txt">Welcome to</h1>
                    <h2 className="hero-title">Valora</h2>

                </div>
                <p className="hero-subtitle">Valora is a multimodal AI platform that revolutionizes interview prep by transforming your PDF Resume and Job Description into a live, vocal technical interview.</p>
                <Link to="/start-interview" className="hero-link">Start mock interview</Link>

            </div>
            <div className="hero-right">
                <img src={Logo1} alt="Valora Logo" className="hero-image" />
            </div>
        </div>
    )
}
export default Herosection;
