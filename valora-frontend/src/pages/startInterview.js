import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './startInterview.css';

export const StartInterview = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [formData, setFormData] = useState({
        jobDescription: '',
        resume: null,
        jobPosition: 'junior',
        interviewType: 'technical',
        timeLimit: '15',
        difficulty: 'medium'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setFormData(prev => ({
                ...prev,
                resume: file
            }));
        } else {
            alert('Please upload a PDF file');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.jobDescription) {
            alert('Please enter a job description');
            return;
        }
        
        if (!formData.resume) {
            alert('Please upload your resume');
            return;
        }

        // Show permission modal
        setShowModal(true);
    };

    const handleAcceptAndStart = async () => {
        if (!acceptedTerms) {
            alert('Please accept the terms and conditions');
            return;
        }

        try {
            // Request camera and microphone permissions
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            
            // Navigate to interview page with form data
            navigate('/interview', { state: formData });
        } catch (error) {
            alert('Camera and microphone access is required to start the interview. Please grant permissions and try again.');
            console.error('Permission error:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setAcceptedTerms(false);
    };

    return (
        <div className="start-interview-container">
            <div className="start-interview-content">
                <div className="header-section">
                    <h1 className="start-interview-title">Start Your Mock Interview</h1>
                    <p className="start-interview-subtitle">
                        Fill in the details below to begin your personalized interview experience
                    </p>
                </div>

                <form className="interview-form" onSubmit={handleSubmit}>
                    {/* Top Row: Dropdowns */}
                    <div className="form-row">
                        <div className="form-group-inline">
                            <label htmlFor="jobPosition">Position Level</label>
                            <select
                                id="jobPosition"
                                name="jobPosition"
                                value={formData.jobPosition}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="intern">Intern</option>
                                <option value="junior">Junior</option>
                                <option value="senior">Senior</option>
                            </select>
                        </div>

                        <div className="form-group-inline">
                            <label htmlFor="interviewType">Interview Type</label>
                            <select
                                id="interviewType"
                                name="interviewType"
                                value={formData.interviewType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="technical">Technical</option>
                                <option value="hr">HR</option>
                                <option value="hybrid">Hybrid (Tech + HR)</option>
                            </select>
                        </div>
                    </div>

                    {/* Second Row: Time Limit & Difficulty */}
                    <div className="form-row">
                        <div className="form-group-inline">
                            <label htmlFor="timeLimit">⏱️ Time Limit</label>
                            <select
                                id="timeLimit"
                                name="timeLimit"
                                value={formData.timeLimit}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="5">5 Minutes</option>
                                <option value="10">10 Minutes</option>
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                            </select>
                        </div>

                        <div className="form-group-inline">
                            <label htmlFor="difficulty">📊 Difficulty Level</label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="form-group-full">
                        <label htmlFor="resume">📄 Upload Resume (PDF)</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="resume"
                                name="resume"
                                accept=".pdf"
                                onChange={handleFileChange}
                                required
                            />
                            {formData.resume && (
                                <span className="file-name">✓ {formData.resume.name}</span>
                            )}

            {/* Permission Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🎥 Permissions Required</h2>
                            <button className="close-btn" onClick={handleCloseModal}>✕</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="permission-info">
                                <div className="permission-item">
                                    <span className="permission-icon">📹</span>
                                    <div>
                                        <h4>Camera Access</h4>
                                        <p>We need access to your camera to analyze your body language and presentation during the interview.</p>
                                    </div>
                                </div>
                                
                                <div className="permission-item">
                                    <span className="permission-icon">🎤</span>
                                    <div>
                                        <h4>Microphone Access</h4>
                                        <p>We need access to your microphone to conduct the voice-based interview and analyze your communication skills.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="terms-section">
                                <h4>Terms and Conditions</h4>
                                <div className="terms-box">
                                    <p><strong>Privacy Policy:</strong></p>
                                    <ul>
                                        <li>Your video and audio data will be processed in real-time for interview analysis</li>
                                        <li>All session data is encrypted and stored securely</li>
                                        <li>You can stop the interview at any time</li>
                                        <li>Your data will not be shared with third parties without consent</li>
                                        <li>Interview recordings may be kept for your review and improvement tracking</li>
                                    </ul>
                                    <p><strong>By proceeding, you agree to:</strong></p>
                                    <ul>
                                        <li>Grant temporary access to your camera and microphone</li>
                                        <li>Allow AI-powered analysis of your interview performance</li>
                                        <li>Our data collection and privacy practices</li>
                                    </ul>
                                </div>
                                
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    />
                                    I accept the terms and conditions and grant necessary permissions
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <button 
                                className="accept-btn" 
                                onClick={handleAcceptAndStart}
                                disabled={!acceptedTerms}
                            >
                                Accept & Start Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}
                        </div>
                    </div>

                    {/* Job Description - Large */}
                    <div className="form-group-full">
                        <label htmlFor="jobDescription">💼 Job Description</label>
                        <textarea
                            id="jobDescription"
                            name="jobDescription"
                            value={formData.jobDescription}
                            onChange={handleInputChange}
                            placeholder="Paste the job description here..."
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="start-btn">
                        🚀 Start Interview
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StartInterview;
