import React from 'react'
import './footer.css'
import flogo from '../assets/Valora-transparent-logo-horizontal.png'    
export const Footer = () => {
    return (
        <div className="footer">
            <div className="uper-footer">
                <div className="up-footer-1">
                   <img src={flogo} alt="Valora Logo" className="footer-logo" />
                    <p>The world's first multimodal AI interview
                        coach powered by Google Gemini.</p>
                </div>
                <div className="up-footer-2">
                    <h4 className='dev-title'>Developers</h4>
                    <div className="developer-names">
                        <a href="https://portfolio-git-main-atharv-28s-projects.vercel.app/" target="_blank" >Atharv Tambekar</a>
                        <a href="https://siddharth-11-portfolio.netlify.app/" target="_blank" >Siddharth Vhatkar</a>
                        <a href="https://portfolio-harsh-24.netlify.app/" target="_blank" >Harshvardhan Gadagade</a>
                        
                    </div>
                </div>
                <div className="up-footer-3">
                    <h4>About Us</h4> 
                    {/* update these to link later */}
                    <h4>Contact Us</h4>
                </div>

            </div>
            <div className="lower-footer">
                &copy; Valora 2026 All Rights Reserved.
            </div>
        </div>
    )
}
