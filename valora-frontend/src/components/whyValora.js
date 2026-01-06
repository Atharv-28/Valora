import './whyValora.css'
import MicIcon from '@mui/icons-material/Mic';
import CodeIcon from '@mui/icons-material/Code';
import VideocamIcon from '@mui/icons-material/Videocam';

export const WhyValora = () => {
    return (
        <div className='wv-container'>
            <div className='wv-text'>
                <h2>Why Choose Valora?</h2>
                <p>
                    Comprehensive analysis powered by Google Gemini 1.5
                    Pro to simulate the pressure and complexity of real
                    top-tier tech interviews.
                </p>
            </div>
            <div className='wv-content'>
                <div className='wv-details'>
                    <div className='wv-logo'>
                        <MicIcon color='primary'/>
                    </div>

                    <h3>Voice Analysis</h3>
                    <p>
                        Prefect you tone, pacing, and deliver with real
                        -time feedback on your speech patterns, filler
                        words, and clarity.
                    </p>
                </div>

                <div className='wv-details'>
                    <div className='wv-logo'>
                        <CodeIcon color='primary'/>
                    </div>

                    <h3>Code Logic</h3>
                    <p>
                        Real-time syntax verification and logic assessment
                        to ensure your technical solution are optimal
                        and bug-free.
                    </p>
                </div>

                <div className='wv-details'>
                    <div className='wv-logo'>
                        <VideocamIcon color='primary'/>
                    </div>

                    <h3>Body Language</h3>
                    <p>
                        AI-driven posture, eye contact and confidence
                        tracking via webcam to help you present your best
                        professional self.
                    </p>
                </div>

            </div>
        </div>
    )
}
