import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [Nome, setNome] = useState('');
  const [Cognome, setCognome] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(Nome, Cognome, Email, Password);
      alert('Registrazione completata! Ora puoi accedere.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Errore durante la registrazione');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="auth-title">Crea un account</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Nome"
              value={Nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cognome</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Cognome"
              value={Cognome}
              onChange={(e) => setCognome(e.target.value)}
            />
          </div>
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
              Registrati
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-gray-500" style={{ fontSize: '0.875rem' }}>
              Hai già un account?{' '}
              <Link to="/login" className="auth-link">
                Accedi qui
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;