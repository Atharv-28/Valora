import './poweredBy.css';
import Gemini from '../assets/Gemini-logo.png';
import Firebase from '../assets/Firebase-logo.png';

export const PoweredBy = () => {
    return (
        <div className='pb-container'>
            <div className='pb-text'>
                <h3>Powered by</h3>
                <div className='pb-logos'>
                    <img src={Gemini} alt="Gemini" className='pb-logo' />
                    <img src={Firebase} alt="Firebase" className='pb-logo' />
                </div>
            </div>
        </div>
    )
}