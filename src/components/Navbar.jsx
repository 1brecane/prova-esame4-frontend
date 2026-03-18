import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Calendar, User, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="flex items-center">
            <Link to="/" className="navbar-brand">
              <Calendar className="h-6 w-6" />
              <span>EventiAziendali</span>
            </Link>
            <div className="navbar-links">
              <Link to="/" className="navbar-link">
                Eventi
              </Link>
              {user.Ruolo === 'Dipendente' && (
                <Link to="/iscrizioni" className="navbar-link">
                  Le mie Iscrizioni
                </Link>
              )}
            </div>
          </div>
          <div className="navbar-right">
            <button
              onClick={handleLogout}
              className="btn btn-primary"
              style={{ backgroundColor: '#6d28d9' }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;