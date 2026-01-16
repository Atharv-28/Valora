import './aboutHero.css'

export const AboutHero = () => {
  return (
    <div className="abh-container">
        <div className='abh-powered-by'>
          <p>Powered By Google Gemini</p>
        </div>

        <div className='abh-hero-text'>
          <h2 className='abh-hero'>
            From PDF to Offer Letter in Four Steps.
          </h2>

          <p className='abh-para'>
            Valora transforms your static resume to dynamic, live
            techical intervire simulation. Experience the future of prep
            with mulitimodal AI analysis. 
          </p>
        </div>

        <div className='abh-buttons'>
          <div className='btn'>
            <button className='simulation-btn'>
                Start Free Simulation
            </button>
          </div>

          <div className='btn'>
            <button className='report-btn'>
              View Sample Report
            </button>
          </div>
        </div>
    </div>
  )
}
