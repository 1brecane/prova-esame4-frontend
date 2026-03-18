import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(Email, Password);
      alert('Login effettuato con successo!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Errore durante il login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="auth-title">Accedi al tuo account</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '10px 16px' }}
            >
              Accedi
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-gray-500" style={{ fontSize: '0.875rem' }}>
              Non hai un account?{' '}
              <Link to="/register" className="auth-link">
                Registrati qui
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;