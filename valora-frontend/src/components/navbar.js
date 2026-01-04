import Logo from '../assets/Valora-transparent-logo-horizontal.png'
import './navbar.css'

export const Navbar = () => {
    return (
        <div className="container">
            <div className="navbar">

                <img src={Logo} alt="Logo" className="logo" />

                <div className='nav-comps'>
                    <h3>Home</h3>
                    <h3>About</h3>
                    <h3>Contact</h3>
                    <h3>Log-in</h3>
                    <h3>Sign-up</h3>
                </div>

            </div>
        </div>
    )
}
