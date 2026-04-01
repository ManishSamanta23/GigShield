import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PolicyPage from './pages/PolicyPage';
import UpgradePage from './pages/UpgradePage';
import ClaimsPage from './pages/ClaimsPage';
import TriggersPage from './pages/TriggersPage';

const PrivateRoute = ({ children }) => {
  const { worker, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:40, height:40, border:'3px solid #FF6B35',
        borderTopColor:'transparent', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }} />
    </div>
  );
  return worker ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { worker } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={worker ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={worker ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={worker ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/policy" element={<PrivateRoute><PolicyPage /></PrivateRoute>} />
        <Route path="/upgrade" element={<PrivateRoute><UpgradePage /></PrivateRoute>} />
        <Route path="/claims" element={<PrivateRoute><ClaimsPage /></PrivateRoute>} />
        <Route path="/triggers" element={<PrivateRoute><TriggersPage /></PrivateRoute>} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#162347', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#00C49F', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#FF4444', secondary: '#fff' } }
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
