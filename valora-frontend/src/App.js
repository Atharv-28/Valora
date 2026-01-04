import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import { Navbar } from './components/navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<div style={{padding: '2rem'}}>About Page - Coming Soon</div>} />
          <Route path="/contact" element={<div style={{padding: '2rem'}}>Contact Page - Coming Soon</div>} />
          <Route path="/login" element={<div style={{padding: '2rem'}}>Login Page - Coming Soon</div>} />
          <Route path="/signup" element={<div style={{padding: '2rem'}}>Sign Up Page - Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
