import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const ruolo = localStorage.getItem('ruolo');
    if (token) {
      setUser({ token, Ruolo: ruolo });
    }
    setLoading(false);
  }, []);

  const login = async (Email, Password) => {
    const res = await api.post('/utenti/login', { Email, Password });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      if (res.data.utente && res.data.utente.Ruolo) {
        localStorage.setItem('ruolo', res.data.utente.Ruolo);
      }
      setUser({ 
        token: res.data.token, 
        Ruolo: res.data.utente?.Ruolo 
      });
      return true;
    }
    return false;
  };

  const register = async (Nome, Cognome, Email, Password) => {
    const res = await api.post('/utenti/register', { Nome, Cognome, Email, Password });
    if (res.data) {
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('ruolo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};