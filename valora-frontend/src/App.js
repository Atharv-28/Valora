import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import { Navbar } from './components/navbar';
import { StartInterview } from './pages/startInterview';
import { Interview } from './pages/interview';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/interview';

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start-interview" element={<StartInterview />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/about" element={<div style={{padding: '2rem'}}>About Page - Coming Soon</div>} />
        <Route path="/contact" element={<div style={{padding: '2rem'}}>Contact Page - Coming Soon</div>} />
        <Route path="/login" element={<div style={{padding: '2rem'}}>Login Page - Coming Soon</div>} />
        <Route path="/signup" element={<div style={{padding: '2rem'}}>Sign Up Page - Coming Soon</div>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
