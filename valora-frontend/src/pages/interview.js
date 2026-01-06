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
    
    const interviewData = location.state;

    useEffect(() => {
        if (!interviewData) {
            navigate('/start-interview');
            return;
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
        };
    }, []);

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
        setIsInterviewStarted(true);
        setIsProcessing(true);

        try {
            // Initialize interview session with backend
            const formData = new FormData();
            formData.append('resume', interviewData.resume);
            formData.append('jobDescription', interviewData.jobDescription);
            formData.append('jobPosition', interviewData.jobPosition);
            formData.append('interviewType', interviewData.interviewType);

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
            setBotMessage("Sorry, there was an error starting the interview. Please try again.");
            await textToSpeech.speak("Sorry, there was an error starting the interview. Please try again.");
        } finally {
            setIsProcessing(false);
        }
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
            console.log('⏳ Waiting for complete response from Gemini (no timeout)...');
            
            // Send message to backend - wait for complete response
            const response = await interviewApi.sendMessage(currentSessionId, userMessage, {
                jobPosition: interviewData.jobPosition,
                interviewType: interviewData.interviewType
            });
            console.log('✅ Response received:', response);
            console.log(`📊 Response length: ${response.message?.length} characters`);

            const botResponse = response.message;
            setBotMessage(botResponse);

            // Add bot response to transcript
            setTranscript(prev => [...prev, { speaker: 'bot', text: botResponse }]);

            console.log('🔊 AI is speaking...');
            // Speak the response
            await textToSpeech.speak(botResponse);
            console.log('✅ AI finished speaking');
            
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
                    <span className="interview-type">{interviewData?.interviewType} • {interviewData?.jobPosition}</span>
                </div>
                <div className="interview-status">
                    <span className="status-indicator"></span>
                    <span>Live</span>
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
            {transcript.length > 0 && (
                <div className="transcript-section">
                {userTranscript && (
                    <div className="user-speaking-indicator">
                        <span className="speaking-text">You're saying: {userTranscript}</span>
                    </div>
                )}
                    <h4>Conversation</h4>
                    <div className="transcript-list">
                        {transcript.map((item, index) => (
                            <div key={index} className={`transcript-item ${item.speaker}`}>
                                <strong>{item.speaker === 'bot' ? 'AI' : 'You'}:</strong> {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        🎙️ Start Speaking
                    </button>
                )}
            </div>
        </div>
    );
};

export default Interview;
