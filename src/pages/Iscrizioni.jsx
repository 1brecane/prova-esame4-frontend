import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle, Trash2, Calendar as CalendarIcon } from 'lucide-react';

const Iscrizioni = () => {
  const [iscrizioni, setIscrizioni] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIscrizioni = async () => {
    try {
      const res = await api.get('/iscrizioni/');
      setIscrizioni(res.data);
    } catch (err) {
      alert('Errore nel caricamento delle iscrizioni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIscrizioni();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler annullare questa iscrizione?')) {
      try {
        await api.delete(`/iscrizioni/${id}`);
        alert('Iscrizione annullata!');
        fetchIscrizioni();
      } catch (err) {
        alert('Errore durante l\'annullamento');
      }
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Caricamento iscrizioni...</div>;

  return (
    <div className="container py-8">
      <h1 className="page-title mb-8">Le mie Iscrizioni</h1>

      {iscrizioni.length === 0 ? (
        <div className="empty-state">
          <p className="text-gray-500" style={{ fontSize: '1.125rem' }}>Non sei iscritto a nessun evento.</p>
        </div>
      ) : (
        <div className="card-grid">
          {iscrizioni.map((iscrizione) => (
            <div key={iscrizione.IscrizioneID} className="card" style={iscrizione.CheckinEffettuato ? { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' } : {}}>
              <div className="card-body">
                <div className="flex justify-between items-center" style={{ marginBottom: '16px', alignItems: 'flex-start' }}>
                  <h3 className="card-title">
                    {iscrizione.Titolo || `Evento #${iscrizione.EventoID}`}
                  </h3>
                  {Boolean(iscrizione.CheckinEffettuato) && (
                    <span className="badge badge-success">
                      <CheckCircle className="h-3 w-3" style={{ width: '12px', height: '12px' }} />
                      Check-in effettuato
                    </span>
                  )}
                </div>
                
                {iscrizione.Data && (
                  <div className="card-subtitle">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {new Date(iscrizione.Data).toLocaleDateString()}
                  </div>
                )}
                
                <div className="card-footer">
                  {iscrizione.CheckinEffettuato ? (
                    <span className="text-success" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Presente</span>
                  ) : (
                    <span className="text-neutral" style={{ fontSize: '0.875rem', fontWeight: 500 }}>In attesa di check-in</span>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(iscrizione.IscrizioneID)} 
                    className="btn-icon delete"
                    title="Annulla Iscrizione"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Iscrizioni;