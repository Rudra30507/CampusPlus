import React, { useEffect, useState } from 'react';
import { X, Users, Mail, Download, ShieldCheck, CheckCircle2, AlertTriangle, Search, FileSpreadsheet } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AttendeesModal = ({ event, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketInput, setTicketInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const fetchAttendees = async () => {
    try {
      const res = await api.get(`/registrations/event/${event._id}/attendees`);
      setAttendees(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load attendees list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event?._id) {
      fetchAttendees();
    }
  }, [event]);

  // Export Roster to CSV
  const handleExportCSV = () => {
    if (attendees.length === 0) {
      toast.error('No attendees to export');
      return;
    }
    const headers = ['S.No', 'Student Name', 'Roll Number', 'SST College Email', 'Ticket Code', 'Check-in Status', 'Registration Time'];
    const rows = attendees.map((item, index) => [
      index + 1,
      `"${item.student?.name || 'Student'}"`,
      item.student?.rollNumber ? item.student.rollNumber.toUpperCase() : 'N/A',
      item.student?.email || 'N/A',
      item.ticketId,
      item.status || 'Registered',
      `"${new Date(item.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const cleanTitle = event.title.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `${cleanTitle}_SST_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Roster downloaded as Excel/CSV! 📊');
  };

  // Gate Ticket Verification
  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    const code = ticketInput.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a ticket code');
      return;
    }

    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.post('/registrations/verify-ticket', {
        ticketId: code,
        eventId: event._id,
      });

      setVerifyResult({
        success: true,
        valid: res.data.valid,
        alreadyAttended: res.data.alreadyAttended,
        message: res.data.message,
        data: res.data.data,
      });

      if (res.data.valid) {
        toast.success(res.data.message);
        // Refresh attendee list to show updated status
        fetchAttendees();
        setTicketInput('');
      } else {
        toast(res.data.message, { icon: '⚠️' });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Verification failed';
      setVerifyResult({
        success: false,
        valid: false,
        message: msg,
      });
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const attendedCount = attendees.filter((a) => a.status === 'Attended').length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#818cf8" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Attendee Roster & Gate Check-in</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {event.title} • <strong>{attendees.length}</strong> Registered • <span style={{ color: '#34d399' }}>{attendedCount} Checked-in</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {attendees.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '7px 12px', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                title="Download attendee roster as CSV/Excel"
              >
                <FileSpreadsheet size={15} />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Gate Entry Pass Verification Box */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(15, 23, 42, 0.75)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#a5b4fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            <span>ORGANIZER GATE ENTRY PASS VERIFIER:</span>
          </div>

          <form onSubmit={handleVerifyTicket} className="gate-verifier-form" style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="input-field"
                placeholder="Enter Ticket Code (e.g. TKT-TF24-001)..."
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                style={{ fontSize: '0.88rem', padding: '10px 14px', textTransform: 'uppercase' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={verifying}
              style={{ padding: '10px 18px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              {verifying ? 'Checking...' : 'Verify Entry Pass'}
            </button>
          </form>

          {/* Verification Alert Banner */}
          {verifyResult && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: verifyResult.valid
                ? 'rgba(16, 185, 129, 0.15)'
                : verifyResult.alreadyAttended
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${
                verifyResult.valid ? '#10b981' : verifyResult.alreadyAttended ? '#f59e0b' : '#ef4444'
              }`,
              color: verifyResult.valid ? '#34d399' : verifyResult.alreadyAttended ? '#fbbf24' : '#f87171',
            }}>
              {verifyResult.valid ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span>{verifyResult.message}</span>
            </div>
          )}
        </div>

        {/* Attendee List Content */}
        <div style={{ padding: '24px', maxHeight: '55vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              Loading attendees roster...
            </div>
          ) : attendees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>No registrations yet</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                When SST students RSVP for this event, their roll numbers and ticket codes will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attendees.map((item, idx) => {
                const isAttended = item.status === 'Attended';
                return (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isAttended ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                      border: isAttended ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isAttended ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: isAttended ? '#34d399' : '#a5b4fc',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        #{idx + 1}
                      </div>

                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{item.student?.name || 'SST Student'}</span>
                          {isAttended && (
                            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                              CHECKED IN
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <Mail size={12} />
                          <span>{item.student?.email || 'N/A'}</span>
                          <span>•</span>
                          <span style={{ color: '#38bdf8', fontWeight: '600' }}>
                            Roll: {item.student?.rollNumber ? item.student.rollNumber.toUpperCase() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: isAttended ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: isAttended ? '#34d399' : '#cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        fontFamily: 'monospace',
                      }}>
                        {item.ticketId}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeesModal;
