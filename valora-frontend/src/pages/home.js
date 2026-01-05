import React from 'react'
import { PoweredBy } from '../components/poweredBy'

export const Home = () => {
    return (
        <div className='container'>
            <div className='home-content'>
                <h1>Welcome to Valora</h1>
                <p>AI-Powered Interview Practice Platform</p>

                <PoweredBy/>
                
            </div>
        </div>
    )
}
