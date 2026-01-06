import UploadFileIcon from '@mui/icons-material/UploadFile';
import VideoChatIcon from '@mui/icons-material/VideoChat';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import './howValora.css'

export const HowValora = () => {
    return (
        <div className='hv-container'>
            <div className='hv-text'>
                <h2>How Valora Works</h2>

                <p>
                    Go from preparation to performance in three simple steps.
                </p>

            </div>

            <div className='hv-content'>
                <div className='hv-details'>
                    <div className='hv-logo'>
                        <UploadFileIcon fontSize='large' color='primary'/>
                    </div>

                    <div className='hv-inside-details'>
                        <h3>Upload Resume & Job Description</h3>
                        <p>
                            Drag and drop your PDF resume and target the
                            job description. Valora extracts key skills
                            and requirements to tailor the interview
                            questions specifically for you.
                        </p>
                    </div>
                </div>

                <div className='hv-details'>
                    <div className='hv-logo'>
                        <VideoChatIcon fontSize='large' color='primary'/>
                    </div>

                    <div className='hv-inside-details'>
                        <h3>Live AI interview</h3>
                        <p>
                            Engage in a realistic voice conversation. The AI
                            asks technical and behavioral questions while
                            monitoring your code editor and webcam feed.
                        </p>
                    </div>
                </div>

                <div className='hv-details'>
                    <div className='hv-logo'>
                        <AnalyticsIcon fontSize='large' color='primary'/>
                    </div>

                    <div className='hv-inside-details'>
                        <h3>Get Performance Report</h3>
                        <p>
                            Receive a detailed breakdown of your performance,
                            including code efficiency, communication clarity,
                            and body language cues with actionable improvements.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
