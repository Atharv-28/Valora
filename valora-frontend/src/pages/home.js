import React from 'react'
import { PoweredBy } from '../components/poweredBy'
import { WhyValora } from '../components/whyValora'

export const Home = () => {
    return (
        <div className='container'>
            <div className='home-content'>
                <h1>Welcome to Valora</h1>
                <p>AI-Powered Interview Practice Platform</p>

                <PoweredBy />

                <WhyValora />

            </div>
        </div>
    )
}
