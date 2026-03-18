import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Calendar as CalendarIcon, MapPin, Users, CheckSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ Titolo: '', Data: '', Descrizione: '' });
  const [editingId, setEditingId] = useState(null);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [selectedEventForCheckin, setSelectedEventForCheckin] = useState(null);
  const [iscrizioniEvento, setIscrizioniEvento] = useState([]);
  const [statsEventi, setStatsEventi] = useState([]);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

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

  const handleApriCheckin = async (evento) => {
    setSelectedEventForCheckin(evento);
    try {
      const res = await api.get(`/eventi/${evento.EventoID}/iscrizioni`);
      setIscrizioniEvento(res.data);
      setIsCheckinModalOpen(true);
    } catch (err) {
      alert('Errore nel caricamento delle iscrizioni');
    }
  };

  const handleRegistraCheckin = async (iscrizioneId) => {
    try {
      const res = await api.post(`/iscrizioni/${iscrizioneId}/checkin`);
      setIscrizioniEvento(prev => prev.map(isc => 
        isc.IscrizioneID === iscrizioneId 
          ? { ...isc, CheckinEffettuato: true, OraCheckin: res.data.OraCheckin }
          : isc
      ));
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Errore durante il check-in');
    }
  };

  const handleApriStatistiche = async () => {
    try {
      // Per le statistiche, calcoliamo i dati per gli eventi passati
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      
      const eventiPassati = eventi.filter(e => new Date(e.Data) < oggi);
      
      const stats = await Promise.all(eventiPassati.map(async (evento) => {
        try {
          const res = await api.get(`/eventi/${evento.EventoID}/iscrizioni`);
          const iscrizioni = res.data;
          const totali = iscrizioni.length;
          const checkin = iscrizioni.filter(i => i.CheckinEffettuato).length;
          const percentuale = totali > 0 ? Math.round((checkin / totali) * 100) : 0;
          
          return {
            ...evento,
            totali,
            checkin,
            percentuale
          };
        } catch (e) {
          return { ...evento, totali: 0, checkin: 0, percentuale: 0 };
        }
      }));
      
      setStatsEventi(stats);
      setIsStatsModalOpen(true);
    } catch (err) {
      alert('Errore nel calcolo delle statistiche');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Caricamento eventi...</div>;

  return (
    <div className="container py-8">
      <div className="header-actions">
        <h1 className="page-title">Eventi Aziendali</h1>
        {user?.Ruolo?.toLowerCase() !== 'dipendente' && (
          <div className="flex gap-3">
            <button
              onClick={handleApriStatistiche}
              className="btn btn-secondary"
            >
              Statistiche
            </button>
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
          </div>
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
                  <button
                    onClick={() => handleApriCheckin(evento)}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Gestisci Check-in
                  </button>
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

      {isCheckinModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <h2 className="modal-title">Gestione Check-in: {selectedEventForCheckin?.Titolo}</h2>
            
            {iscrizioniEvento.length === 0 ? (
              <div className="empty-state">
                <p>Nessun dipendente iscritto a questo evento.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '12px 8px' }}>Dipendente</th>
                      <th style={{ padding: '12px 8px' }}>Email</th>
                      <th style={{ padding: '12px 8px' }}>Stato</th>
                      <th style={{ padding: '12px 8px' }}>Azione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iscrizioniEvento.map(isc => (
                      <tr key={isc.IscrizioneID} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 8px' }}>{isc.Nome} {isc.Cognome}</td>
                        <td style={{ padding: '12px 8px' }}>{isc.Email}</td>
                        <td style={{ padding: '12px 8px' }}>
                          {isc.CheckinEffettuato ? (
                            <span className="badge badge-success">
                              Effettuato {new Date(isc.OraCheckin).toLocaleTimeString()}
                            </span>
                          ) : (
                            <span className="badge badge-neutral">In attesa</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {!isc.CheckinEffettuato && (
                            <button
                              onClick={() => handleRegistraCheckin(isc.IscrizioneID)}
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              Registra Check-in
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="btn btn-secondary"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {isStatsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h2 className="modal-title">Statistiche Eventi Passati</h2>
            
            {statsEventi.length === 0 ? (
              <div className="empty-state">
                <p>Nessun evento passato trovato.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '12px 8px' }}>Evento</th>
                      <th style={{ padding: '12px 8px' }}>Data</th>
                      <th style={{ padding: '12px 8px' }}>Iscritti</th>
                      <th style={{ padding: '12px 8px' }}>Check-in</th>
                      <th style={{ padding: '12px 8px' }}>Partecipazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsEventi.map(evento => (
                      <tr key={evento.EventoID} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '500' }}>{evento.Titolo}</td>
                        <td style={{ padding: '12px 8px' }}>{new Date(evento.Data).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 8px' }}>{evento.totali}</td>
                        <td style={{ padding: '12px 8px' }}>{evento.checkin}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  backgroundColor: evento.percentuale >= 80 ? '#166534' : evento.percentuale >= 50 ? '#ca8a04' : '#dc2626', 
                                  height: '100%', 
                                  width: `${evento.percentuale}%` 
                                }} 
                              />
                            </div>
                            <span style={{ fontSize: '0.875rem', width: '40px', textAlign: 'right' }}>
                              {evento.percentuale}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="btn btn-secondary"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;