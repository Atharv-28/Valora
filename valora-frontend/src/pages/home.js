import { PoweredBy } from '../components/poweredBy'
import { WhyValora } from '../components/whyValora'
import React from 'react';
import Herosection from '../components/herosection.js' ;

export const Home = () => {
    return (
        <div className='container'>
            <div className='home-content'>
                 <Herosection />

                <PoweredBy />

                <WhyValora />

            </div>
        </div>
    )
}


