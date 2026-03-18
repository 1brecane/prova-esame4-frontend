import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Iscrizioni from './pages/Iscrizioni';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Caricamento...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.Ruolo)) {
    return <Navigate to="/" />;
  }
  return children;
};

const AppContent = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/iscrizioni" 
            element={
              <PrivateRoute allowedRoles={['Dipendente']}>
                <Iscrizioni />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;