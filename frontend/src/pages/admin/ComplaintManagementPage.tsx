import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Típusok definiálása
interface Complaint {
  id: number;
  order_id: number;
  user_id: number;
  description: string;
  file_name: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
}

const ComplaintManagementPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  
  // Lekérjük a reklamációkat
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/list');
      setComplaints(res.data);
    } catch (err: any) {
      console.error(err);
      toast.error('Hiba a reklamációk betöltése során');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Modal megnyitása elfogadás/elutasítás esetén
  const openModal = (complaint: Complaint, action: 'Approved' | 'Rejected') => {
    setSelectedComplaint(complaint);
    setActionType(action);
    setResolutionText('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedComplaint(null);
    setActionType(null);
    setResolutionText('');
  };

  // Mentés (Elfogadva / Elutasítva)
  const handleSave = async () => {
    if (!selectedComplaint || !actionType) return;

    if (!resolutionText.trim()) {
      toast.error('Kérjük, adjon meg indoklást!');
      return;
    }

    try {
      await api.put(`/complaints/${selectedComplaint.id}/update`, {
        status: actionType,
        resolution: resolutionText.trim(),
      });
      toast.success('Reklamáció sikeresen frissítve');
      fetchComplaints();
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error('Hiba a reklamáció mentése során');
    }
  };

  // Kép letöltése / megtekintése
  const downloadImage = async (fileName: string) => {
    try {
      const res = await api.get(`/complaints/image/${fileName}`, {
        responseType: 'blob', // fontos, hogy blob legyen
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error(err);
      toast.error('Kép letöltése nem sikerült');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Betöltés...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e293b' }}>
        Reklamációk Kezelése
      </h1>

      {complaints.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          Nincsenek reklamációk.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Rendelés ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Leírás</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Kép</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Státusz</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => (
                <tr key={complaint.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b' }}>#{complaint.id}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b' }}>#{complaint.order_id}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b', maxWidth: '300px', wordWrap: 'break-word' }}>
                    {complaint.description}
                    {complaint.resolution && (
                      <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                        <strong>Indok:</strong> {complaint.resolution}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b' }}>
                    {complaint.file_name ? (
                      <button 
                        onClick={() => downloadImage(complaint.file_name as string)}
                        style={{ padding: '0.25rem 0.5rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#1e293b' }}
                      >
                        Letöltés (Kép)
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: complaint.status === 'Pending' ? '#fef3c7' : complaint.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                      color: complaint.status === 'Pending' ? '#d97706' : complaint.status === 'Approved' ? '#15803d' : '#b91c1c'
                    }}>
                      {complaint.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {complaint.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => openModal(complaint, 'Approved')}
                          style={{ padding: '0.4rem 0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                        >
                          Elfogad
                        </button>
                        <button
                          onClick={() => openModal(complaint, 'Rejected')}
                          style={{ padding: '0.4rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                        >
                          Elutasít
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal / Felugró ablak */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              Reklamáció {actionType === 'Approved' ? 'elfogadása' : 'elutasítása'}
            </h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>
                Indoklás feltüntetése:
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder={`Adja meg az ${actionType === 'Approved' ? 'elfogadás' : 'elutasítás'} okát...`}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={closeModal}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                Mégse
              </button>
              <button
                onClick={handleSave}
                style={{ padding: '0.5rem 1rem', background: actionType === 'Approved' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagementPage;