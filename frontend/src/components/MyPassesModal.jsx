import React, { useEffect, useState } from 'react';
import { X, Ticket, Calendar, Clock, MapPin, Trash2, Download, CheckCircle2, QrCode } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MyPassesModal = ({ onClose, onPassCancelled }) => {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/registrations/my-passes');
      setPasses(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load registered passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const handleCancelPass = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel your pass for this event?')) {
      return;
    }

    setCancellingId(regId);
    try {
      await api.delete(`/registrations/${regId}`);
      toast.success('Registration pass successfully cancelled');
      setPasses((prev) => prev.filter((p) => p._id !== regId));
      if (onPassCancelled) onPassCancelled();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel pass');
    } finally {
      setCancellingId(null);
    }
  };

  // 1-Click E-Ticket / VIP Pass Download via HTML5 Canvas
  const handleDownloadTicket = (pass) => {
    try {
      const event = pass.event;
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 380;
      const ctx = canvas.getContext('2d');

      // Card Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 380);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGrad;
      ctx.roundRect(0, 0, 800, 380, 20);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.roundRect(0, 0, 800, 380, 20);
      ctx.stroke();

      // Top Accent Header
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fillRect(0, 0, 800, 52);
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('🎓 SCALER SCHOOL OF TECHNOLOGY (SST) • OFFICIAL EVENT ENTRY PASS', 30, 32);

      // Event Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      const eventTitle = event?.title?.length > 40 ? event.title.substring(0, 40) + '...' : (event?.title || 'Campus Event');
      ctx.fillText(eventTitle, 30, 105);

      // Category Pill
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.roundRect(30, 122, 100, 26, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText((event?.category || 'EVENT').toUpperCase(), 45, 140);

      // Venue & Date Info
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px sans-serif';
      const dateStr = event?.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      ctx.fillText(`📅 ${dateStr}  •  ⏰ ${event?.time || '10:00 AM'}`, 30, 185);
      ctx.fillText(`📍 ${event?.venue || 'Campus Venue'}`, 30, 215);

      // Student Verified Details
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.roundRect(30, 245, 450, 95, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('PASS HOLDER DETAILS:', 45, 270);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(user?.name || 'SST Student', 45, 298);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`ROLL: ${user?.rollNumber ? user.rollNumber.toUpperCase() : '24BCS-VERIFIED'}`, 45, 323);

      // Perforated Divider Line
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(520, 60);
      ctx.lineTo(520, 360);
      ctx.stroke();
      ctx.setLineDash([]);

      // Right Section: Ticket Code & Barcode
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('✓ CONFIRMED ENTRY', 560, 110);

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(pass.ticketId, 560, 150);

      // Draw Simulated Real Barcode
      ctx.fillStyle = '#ffffff';
      const barcodeX = 550;
      const barcodeY = 180;
      const barcodeW = 200;
      const barcodeH = 65;
      ctx.fillRect(barcodeX, barcodeY, barcodeW, barcodeH);

      ctx.fillStyle = '#000000';
      let curX = barcodeX + 10;
      while (curX < barcodeX + barcodeW - 10) {
        const barWidth = (curX % 7 === 0 || curX % 5 === 0) ? 3 : 1;
        ctx.fillRect(curX, barcodeY + 6, barWidth, barcodeH - 12);
        curX += barWidth + ((curX % 3 === 0) ? 3 : 2);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText(pass.ticketId, 610, 265);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText('Present this pass at campus gate', 560, 320);

      // Trigger Instant Download
      const link = document.createElement('a');
      link.download = `SST_Pass_${pass.ticketId}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Pass downloaded! Save or print for gate entry 🎟️');
    } catch (err) {
      console.error('Pass download error:', err);
      toast.error('Failed to generate pass download');
    }
  };

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
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ticket size={20} color="#06b6d4" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>My Event Passes & Tickets</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Student Entry Passes for SST Events</p>
            </div>
          </div>

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

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '68vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              Loading your event passes...
            </div>
          ) : passes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ticket size={26} color="var(--text-dim)" />
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>No passes booked yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                Explore upcoming tournaments, hackathons, or fests and RSVP to get your verified digital entry ticket.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {passes.map((pass) => {
                const event = pass.event;
                if (!event) return null;

                const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                const isAttended = pass.status === 'Attended';

                return (
                  <div
                    key={pass._id}
                    className="glass-panel pass-card-container"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(15, 23, 42, 0.85)',
                    }}
                  >
                    {/* Left: Thumbnail & Details */}
                    <div style={{ display: 'flex', flex: '1 1 360px', padding: '16px', gap: '16px' }}>
                      <img
                        src={event.banner}
                        alt={event.title}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            textTransform: 'uppercase',
                          }}>
                            {event.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            by {event.organizerName}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
                          {event.title}
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} color="#818cf8" />
                            <span>{formattedDate} • {event.time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={13} color="#34d399" />
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Ticket Pass Stub */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderLeft: '1px dashed rgba(255, 255, 255, 0.15)',
                      minWidth: '200px',
                      flex: '0 0 auto',
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: isAttended ? '#34d399' : '#06b6d4',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          marginBottom: '6px',
                        }}>
                          <CheckCircle2 size={13} />
                          <span>{isAttended ? 'CHECKED IN' : 'CONFIRMED PASS'}</span>
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '1rem',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          color: '#67e8f9',
                          background: 'rgba(6, 182, 212, 0.15)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}>
                          {pass.ticketId}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '12px' }}>
                        {/* Download Official E-Ticket Button */}
                        <button
                          onClick={() => handleDownloadTicket(pass)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.78rem',
                            padding: '6px 12px',
                            width: '100%',
                            color: '#38bdf8',
                            borderColor: 'rgba(56, 189, 248, 0.3)',
                          }}
                        >
                          <Download size={13} />
                          <span>Download Pass</span>
                        </button>

                        {/* Cancel Pass */}
                        {!isAttended && (
                          <button
                            onClick={() => handleCancelPass(pass._id)}
                            disabled={cancellingId === pass._id}
                            className="btn btn-danger"
                            style={{
                              fontSize: '0.75rem',
                              padding: '5px 10px',
                              width: '100%',
                              opacity: 0.85,
                            }}
                          >
                            <Trash2 size={12} />
                            <span>{cancellingId === pass._id ? 'Cancelling...' : 'Cancel Pass'}</span>
                          </button>
                        )}
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

export default MyPassesModal;
