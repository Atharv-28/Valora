import { PoweredBy } from '../components/poweredBy'
import React from 'react';
import Herosection from '../components/herosection.js' ;

export const Home = () => {
    return (
        <div className='container'>
            <div className='home-content'>
                 <Herosection />

                <PoweredBy/>
                
            </div>
        </div>
    )
}


