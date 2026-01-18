import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import { Navbar } from './components/navbar';
import { StartInterview } from './pages/startInterview';
import { Interview } from './pages/interview';
import { Footer } from './components/footer';
import { ContactUs } from './pages/ContactUs';
import { Login } from './pages/login';
import { Signup } from './pages/signup';
import { AboutUs } from './pages/AboutUs';
import Dashboard from './pages/dashboard';
import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/interview';

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start-interview" element={<StartInterview />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      {!hideNavbar && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
