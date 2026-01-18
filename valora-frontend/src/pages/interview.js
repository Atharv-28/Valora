import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './interview.css';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import speechToText from '../services/speechToText';
import textToSpeech from '../services/textToSpeech';
import interviewApi from '../services/interviewApi';

export const Interview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const sessionIdRef = useRef(null); // Use ref to ensure latest value
    const [stream, setStream] = useState(null);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [botMessage, setBotMessage] = useState("Hello! I'm Valora your AI interviewer powered by Gemini. Let's begin your interview.");
    const [transcript, setTranscript] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const timerRef = useRef(null);
    const timeRemainingRef = useRef(0); // Track current time remaining to avoid stale closures
    const [showInterviewEndModal, setShowInterviewEndModal] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    
    const interviewData = location.state;

    useEffect(() => {
        if (!interviewData) {
            navigate('/start-interview');
            return;
        }

        // Initialize timer with the selected time limit
        if (interviewData.timeLimit) {
            const timeInSeconds = parseInt(interviewData.timeLimit) * 60;
            setTimeRemaining(timeInSeconds);
            setTotalTime(timeInSeconds);
            timeRemainingRef.current = timeInSeconds; // Initialize ref
        }

        // Initialize camera and microphone
        initializeMedia();

        // Request fullscreen
        enterFullscreen();

        return () => {
            // Cleanup: stop all media tracks
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            // Stop speech recognition
            speechToText.stop();
            // Cancel any ongoing speech
            textToSpeech.cancel();
            // Exit fullscreen
            exitFullscreen();
            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Show disclaimer when component mounts
        if (interviewData) {
            setShowDisclaimer(true);
            // Test backend connectivity
            interviewApi.testConnection().catch(err => {
                console.error('Backend connectivity test failed:', err);
            });
        }
    }, [interviewData]);

    const initializeMedia = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Unable to access camera or microphone. Please check your permissions.');
        }
    };

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    };

    const exitFullscreen = () => {
        // Check if document is actually in fullscreen mode before trying to exit
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => {
                    console.log('Error exiting fullscreen:', err);
                });
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setVideoEnabled(videoTrack.enabled);
        }
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setAudioEnabled(audioTrack.enabled);
        }
    };

    const handleEndInterview = async () => {
        if (window.confirm('Are you sure you want to end the interview?')) {
            try {
                // Clear timer
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }

                // Stop speech services
                speechToText.stop();
                textToSpeech.cancel();

                // End interview session with backend
                if (sessionIdRef.current) {
                    await interviewApi.endInterview(sessionIdRef.current);
                }

                // Stop media tracks
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                exitFullscreen();
                navigate('/');
            } catch (error) {
                console.error('Error ending interview:', error);
                // Navigate anyway
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                exitFullscreen();
                navigate('/');
            }
        }
    };

    const handleStartInterview = async () => {
        setShowDisclaimer(false);
        setIsInterviewStarted(true);
        setIsProcessing(true);

        // Start the countdown timer
        startTimer();

        try {
            // Initialize interview session with backend
            const formData = new FormData();
            formData.append('resume', interviewData.resume);
            formData.append('jobDescription', interviewData.jobDescription);
            formData.append('jobPosition', interviewData.jobPosition);
            formData.append('interviewType', interviewData.interviewType);
            formData.append('timeLimit', interviewData.timeLimit || '15');
            formData.append('difficulty', interviewData.difficulty || 'medium');

            const response = await interviewApi.initializeInterview(formData);
            console.log('✅ Initialization response:', response);
            
            // Store in both state and ref
            setSessionId(response.sessionId);
            sessionIdRef.current = response.sessionId;
            
            console.log('🔑 Session ID stored:', response.sessionId);

            // Get first question from API
            const firstMessage = response.message || "Can you tell me about yourself and your experience?";
            setBotMessage(firstMessage);
            
            // Add to transcript
            setTranscript(prev => [...prev, { speaker: 'bot', text: firstMessage }]);

            // Speak the first question
            await textToSpeech.speak(firstMessage);

            // Start listening for user response
            startListening();
        } catch (error) {
            console.error('Error starting interview:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response
            });
            
            let errorMessage = "Sorry, there was an error starting the interview. Please try again.";
            
            // Try to get more specific error message
            if (error.message) {
                errorMessage = `Error: ${error.message}. Please check console for details.`;
            }
            
            setBotMessage(errorMessage);
            await textToSpeech.speak("Sorry, there was an error starting the interview. Please try again.");
            setIsInterviewStarted(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev <= 1 ? 0 : prev - 1;
                timeRemainingRef.current = newTime; // Update ref with latest value
                
                if (prev <= 1) {
                    // Time's up!
                    clearInterval(timerRef.current);
                    handleTimeUp();
                    return 0;
                }
                return newTime;
            });
        }, 1000);
    };

    const handleTimeUp = async () => {
        // Stop speech services
        speechToText.stop();
        textToSpeech.cancel();

        // End interview session
        if (sessionIdRef.current) {
            try {
                await interviewApi.endInterview(sessionIdRef.current);
            } catch (error) {
                console.error('Error ending interview:', error);
            }
        }

        // Stop media tracks
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        exitFullscreen();
        setShowInterviewEndModal(true);
    };

    const handleViewReport = async () => {
        if (!sessionIdRef.current) {
            alert('Session ID not available. Cannot generate report.');
            return;
        }

        setIsLoadingReport(true);
        try {
            console.log('📊 Fetching report for session:', sessionIdRef.current);
            const response = await interviewApi.getReport(sessionIdRef.current);
            console.log('✅ Report received:', response);
            
            if (response.success && response.report) {
                setReportData(response.report);
                // Modal will update to show report
            } else {
                alert('Failed to generate report. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('Error generating report: ' + error.message);
        } finally {
            setIsLoadingReport(false);
        }
    };

    const handleEndModalClose = () => {
        setShowInterviewEndModal(false);
        navigate('/');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Snapshot mechanism removed to reduce API usage

    const getTimerColor = () => {
        const percentage = (timeRemaining / totalTime) * 100;
        if (percentage > 50) return '#4CAF50';
        if (percentage > 25) return '#FF9800';
        return '#f44336';
    };

    const startListening = () => {
        if (!speechToText.isSupported()) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        speechToText.start(
            (result) => {
                if (result.isFinal && result.final) {
                    handleUserSpeech(result.final);
                    setUserTranscript('');
                } else {
                    setUserTranscript(result.interim);
                }
            },
            (error) => {
                console.error('Speech recognition error:', error);
            }
        );
    };

    const handleUserSpeech = async (userMessage) => {
        if (!userMessage.trim() || isProcessing) {
            console.log('⏭️ Skipping - empty message or already processing');
            return;
        }

        const currentSessionId = sessionIdRef.current; // Use ref instead of state

        console.log('🎤 User spoke:', userMessage);
        console.log('📋 Session ID (from ref):', currentSessionId);
        console.log('📄 Interview data:', interviewData);

        if (!currentSessionId) {
            console.error('❌ No session ID available!');
            const errorMsg = "Please wait for the interview to fully initialize.";
            setBotMessage(errorMsg);
            await textToSpeech.speak(errorMsg);
            return;
        }

        // IMPORTANT: Stop listening immediately to prevent picking up AI's voice
        speechToText.stop();
        console.log('🛑 Speech recognition stopped to prevent echo');
        
        setIsProcessing(true);
        
        // Add user message to transcript
        setTranscript(prev => [...prev, { speaker: 'user', text: userMessage }]);

        try {
            console.log('📤 Sending to backend...');
            console.log(`⏱️ Remaining time: ${timeRemainingRef.current} seconds`);
            console.log('⏳ Waiting for complete response from Gemini (no timeout)...');
            
            // Send message to backend with additional data - wait for complete response
            const response = await interviewApi.sendMessage(currentSessionId, userMessage, {
                jobPosition: interviewData.jobPosition,
                interviewType: interviewData.interviewType,
                timeRemaining: timeRemainingRef.current // Use ref for latest value
            });
            console.log('✅ Response received:', response);
            console.log(`📊 Response length: ${response.message?.length} characters`);
            console.log(`⏰ Should end interview: ${response.shouldEndInterview || false}`);

            let botResponse = response.message;
            
            // If outro contains report, extract only the closing statement for speaking
            if (response.shouldEndInterview && botResponse.includes('---REPORT---')) {
                const reportIndex = botResponse.indexOf('---REPORT---');
                const closingStatement = botResponse.substring(0, reportIndex).trim();
                console.log('📊 Report detected in outro, will only speak closing statement');
                
                // Set the closing statement for display and speech
                setBotMessage(closingStatement);
                
                // Add only closing statement to transcript (report will be fetched separately)
                setTranscript(prev => [...prev, { speaker: 'bot', text: closingStatement }]);
                
                console.log('🔊 AI is speaking closing statement...');
                await textToSpeech.speak(closingStatement);
            } else {
                // Normal response - speak everything
                setBotMessage(botResponse);
                setTranscript(prev => [...prev, { speaker: 'bot', text: botResponse }]);
                
                console.log('🔊 AI is speaking...');
                await textToSpeech.speak(botResponse);
            }
            
            console.log('✅ AI finished speaking');
            
            // Check if interview should end
            if (response.shouldEndInterview) {
                console.log('⏰ Interview ending due to time constraint...');
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds after outro
                handleTimeUp();
                return;
            }
            
            // Wait an additional 1 second after speech ends before restarting recognition
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Restart listening after AI finishes speaking
            console.log('🎤 Restarting speech recognition...');
            startListening();
        } catch (error) {
            console.error('Error processing speech:', error);
            const errorMsg = "I apologize, I didn't catch that. Could you please repeat?";
            setBotMessage(errorMsg);
            await textToSpeech.speak(errorMsg);
            
            // Restart listening even on error
            startListening();
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="interview-container">
            <div className="interview-header">
                <div className="interview-info">
                    <h2>Valora Interview Session</h2>
                    <span className="interview-type">{interviewData?.interviewType} • {interviewData?.jobPosition} • {interviewData?.difficulty}</span>
                </div>
                <div className="interview-status-container">
                    {isInterviewStarted && (
                        <div className="timer-display" style={{ color: getTimerColor() }}>
                            <span className="timer-icon">⏱️</span>
                            <span className="timer-text">{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                    <div className="interview-status">
                        <span className="status-indicator"></span>
                        <span>Live</span>
                    </div>
                </div>
            </div>

            <div className="video-section">
                {/* AI Bot Section */}
                <div className="video-card bot-card">
                    <div className="bot-avatar">
                        <div className="bot-icon">🤖</div>
                        <div className="audio-wave">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div className="video-label">
                        <span>Valora Interviewer</span>
                    </div>
                </div>

                {/* User Video Section */}
                <div className="video-card user-card">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="user-video"
                    />
                    <div className="video-label">
                        <span>You</span>
                    </div>
                    {!videoEnabled && (
                        <div className="video-off-overlay">
                            <VideocamOffIcon style={{ fontSize: '3rem' }} />
                            <p>Camera Off</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bot Message Section */}
            <div className="bot-message-section">
                <div className="message-bubble">
                    <p>{botMessage}</p>
                </div>
            </div>

            {/* Transcript Section */}
            <div className="transcript-section">
                {userTranscript && (
                    <div className="user-speaking-indicator">
                        <span className="speaking-text">You're saying: {userTranscript}</span>
                    </div>
                )}
                <div className="transcript-list">
                    {transcript.length === 0 ? (
                        <div style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                            Conversation will appear here once the interview starts...
                        </div>
                    ) : (
                        transcript.map((item, index) => (
                            <div key={index} className={`transcript-item ${item.speaker}`}>
                                <strong>{item.speaker === 'bot' ? 'AI' : 'You'}:</strong> {item.text}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Control Panel */}
            <div className="control-panel">
                <div className="control-buttons">
                    <button 
                        className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
                        onClick={toggleAudio}
                        title={audioEnabled ? 'Mute' : 'Unmute'}
                    >
                        {audioEnabled ? <MicIcon /> : <MicOffIcon />}
                    </button>

                    <button 
                        className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
                        onClick={toggleVideo}
                        title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                    </button>

                    <button 
                        className="control-btn end-btn"
                        onClick={handleEndInterview}
                        title="End Interview"
                    >
                        <CallEndIcon />
                    </button>
                </div>

                {!isInterviewStarted && (
                    <button className="start-speaking-btn" onClick={handleStartInterview}>
                        🎙️ Start Interview
                    </button>
                )}
            </div>

            {/* Disclaimer Modal */}
            {showDisclaimer && (
                <div className="disclaimer-overlay">
                    <div className="disclaimer-modal">
                        <h2>⚠️ Important Notice</h2>
                        <div className="disclaimer-content">
                            <div className="disclaimer-item">
                                <span className="disclaimer-icon">⏰</span>
                                <p><strong>Time Limit:</strong> Your interview will automatically end after {interviewData?.timeLimit} minutes. A timer will be displayed during the interview to help you track the remaining time.</p>
                            </div>
                            <div className="disclaimer-item">
                                <span className="disclaimer-icon">📊</span>
                                <p><strong>No Post-Interview Report:</strong> Interview analysis and performance reports are not available yet. This feature is currently under development.</p>
                            </div>
                            <div className="disclaimer-item">
                                <span className="disclaimer-icon">🎤</span>
                                <p><strong>Microphone Required:</strong> Please ensure your microphone is enabled and working for the voice-based interview.</p>
                            </div>
                            <div className="disclaimer-item">
                                <span className="disclaimer-icon">🎯</span>
                                <p><strong>Difficulty Level:</strong> Your interview is set to {interviewData?.difficulty} difficulty. Questions will be tailored to this level.</p>
                            </div>
                        </div>
                        <div className="disclaimer-actions">
                            <button className="disclaimer-cancel" onClick={() => navigate(-1)}>
                                Go Back
                            </button>
                            <button className="disclaimer-accept" onClick={() => setShowDisclaimer(false)}>
                                I Understand, Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview End Modal */}
            {showInterviewEndModal && !reportData && (
                <div className="interview-end-overlay">
                    <div className="interview-end-modal">
                        <div className="end-modal-icon">🎉</div>
                        <h2>Interview Complete</h2>
                        <p>Thank you for participating in the Valora AI interview!</p>
                        <p className="end-modal-subtitle">Your responses have been recorded and analyzed.</p>
                        <div className="end-modal-actions">
                            <button 
                                className="view-report-btn" 
                                onClick={handleViewReport}
                                disabled={isLoadingReport}
                            >
                                {isLoadingReport ? '⏳ Generating Report...' : '📊 View Report'}
                            </button>
                            <button className="close-end-btn" onClick={handleEndModalClose}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Display Modal */}
            {reportData && (
                <div className="report-overlay">
                    <div className="report-modal">
                        <div className="report-header">
                            <h2>📊 Interview Performance Report</h2>
                            <button className="close-report-btn" onClick={handleEndModalClose}>✕</button>
                        </div>
                        
                        <div className="report-content">
                            {/* Overall Score */}
                            <div className="report-score-section">
                                <div className="overall-score">
                                    <span className="score-label">Overall Score</span>
                                    <span className="score-value">{reportData.overallScore}/10</span>
                                </div>
                                <div className="score-breakdown">
                                    <div className="score-item">
                                        <span>Technical Accuracy</span>
                                        <span className="score">{reportData.scoringBreakdown?.technicalAccuracy}/10</span>
                                    </div>
                                    <div className="score-item">
                                        <span>Communication Clarity</span>
                                        <span className="score">{reportData.scoringBreakdown?.communicationClarity}/10</span>
                                    </div>
                                    <div className="score-item">
                                        <span>Confidence Index</span>
                                        <span className="score">{reportData.scoringBreakdown?.confidenceIndex}/10</span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            {reportData.summary && (
                                <div className="report-section">
                                    <h3>📝 Summary</h3>
                                    <p>{reportData.summary}</p>
                                </div>
                            )}

                            {/* Strengths */}
                            {reportData.strengths && reportData.strengths.length > 0 && (
                                <div className="report-section">
                                    <h3>💪 Strengths</h3>
                                    <ul className="report-list strengths-list">
                                        {reportData.strengths.map((strength, index) => (
                                            <li key={index}>{strength}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Top Mistakes */}
                            {reportData.topMistakes && reportData.topMistakes.length > 0 && (
                                <div className="report-section">
                                    <h3>⚠️ Areas for Improvement</h3>
                                    <ul className="report-list mistakes-list">
                                        {reportData.topMistakes.map((mistake, index) => (
                                            <li key={index}>{mistake}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Question Analysis */}
                            {reportData.questionAnalysis && reportData.questionAnalysis.length > 0 && (
                                <div className="report-section">
                                    <h3>💬 Question-by-Question Analysis</h3>
                                    <div className="qa-analysis">
                                        {reportData.questionAnalysis.map((qa, index) => (
                                            <div key={index} className="qa-item">
                                                <div className="qa-question">
                                                    <strong>Q{index + 1}:</strong> {qa.question}
                                                </div>
                                                <div className="qa-answer">
                                                    <strong>Your Answer:</strong> {qa.answer}
                                                </div>
                                                <div className="qa-feedback">
                                                    <strong>Feedback:</strong> {qa.feedback}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="report-footer">
                            <button className="close-report-footer-btn" onClick={handleEndModalClose}>
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interview;
