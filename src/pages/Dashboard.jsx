import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Calendar as CalendarIcon, MapPin } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ Titolo: '', Data: '', Descrizione: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchEventi = async () => {
    try {
      const res = await api.get('/eventi/');
      setEventi(res.data);
    } catch (err) {
      alert('Errore nel caricamento degli eventi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/eventi/${editingId}`, formData);
        alert('Evento aggiornato!');
      } else {
        await api.post('/eventi/', formData);
        alert('Evento creato!');
      }
      setIsModalOpen(false);
      setFormData({ Titolo: '', Data: '', Descrizione: '' });
      setEditingId(null);
      fetchEventi();
    } catch (err) {
      alert('Errore durante il salvataggio');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo evento?')) {
      try {
        await api.delete(`/eventi/${id}`);
        alert('Evento eliminato!');
        fetchEventi();
      } catch (err) {
        alert('Errore durante l\'eliminazione');
      }
    }
  };

  const handleIscriviti = async (id) => {
    try {
      await api.post('/iscrizioni/', { EventoID: id });
      alert('Iscrizione completata!');
      fetchEventi();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Errore durante l\'iscrizione');
    }
  };

  const openEditModal = (evento) => {
    setFormData({
      Titolo: evento.Titolo,
      Data: new Date(evento.Data).toISOString().split('T')[0],
      Descrizione: evento.Descrizione || ''
    });
    setEditingId(evento.EventoID);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Caricamento eventi...</div>;

  return (
    <div className="container py-8">
      <div className="header-actions">
        <h1 className="page-title">Eventi Aziendali</h1>
        {user?.Ruolo?.toLowerCase() !== 'dipendente' && (
          <button
            onClick={() => {
              setFormData({ Titolo: '', Data: '', Descrizione: '' });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5" />
            Nuovo Evento
          </button>
        )}
      </div>

      <div className="card-grid">
        {eventi.map((evento) => (
          <div key={evento.EventoID} className="card">
            <div className="card-body">
              <h3 className="card-title">{evento.Titolo}</h3>
              <div className="card-subtitle">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {new Date(evento.Data).toLocaleDateString()}
              </div>
              <p className="card-text">{evento.Descrizione}</p>
              
              <div className="card-footer">
                {user?.Ruolo?.toLowerCase() === 'dipendente' ? (
                  evento.Iscritto ? (
                    <span className="badge badge-neutral">
                      Già Iscritto
                    </span>
                  ) : (
                    <button
                      onClick={() => handleIscriviti(evento.EventoID)}
                      className="btn btn-success"
                    >
                      Iscriviti
                    </button>
                  )
                ) : (
                  <div className="text-gray-500" style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>Solo i dipendenti possono iscriversi</div>
                )}
                {user?.Ruolo?.toLowerCase() !== 'dipendente' && (
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(evento)} className="btn-icon edit">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(evento.EventoID)} className="btn-icon delete">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingId ? 'Modifica Evento' : 'Nuovo Evento'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Titolo</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.Titolo}
                  onChange={(e) => setFormData({ ...formData, Titolo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={formData.Data}
                  onChange={(e) => setFormData({ ...formData, Data: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descrizione</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.Descrizione}
                  onChange={(e) => setFormData({ ...formData, Descrizione: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;