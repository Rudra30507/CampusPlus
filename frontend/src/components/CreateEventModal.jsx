import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Calendar, MapPin, Users, Tag } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PRESET_BANNERS = [
  { label: '🎮 Esports / BGMI & Free Fire', url: '/bgmi_freefire_banner.jpg' },
  { label: '💻 Hackathon / Tech', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop&q=80' },
  { label: '🎉 Concert / Cultural', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&auto=format&fit=crop&q=80' },
  { label: '⚙️ Coding Lab / Workshop', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80' },
  { label: '⚽ Football / Sports', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&auto=format&fit=crop&q=80' },
  { label: '🎙️ Conference / Seminar', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&auto=format&fit=crop&q=80' },
];

const CreateEventModal = ({ onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '10:00 AM - 02:00 PM',
    venue: '',
    capacity: 100,
    organizerName: '',
    banner: PRESET_BANNERS[0].url,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.venue) {
      toast.error('Please fill in title, date, and venue');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/events', formData);
      toast.success('🎉 Event successfully created & published!');
      onEventCreated(res.data.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
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
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={20} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Publish New Campus Event</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organizer Dashboard</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                className="input-field"
                placeholder="Event Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category & Club Name */}
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Category *
                </label>
                <select
                  name="category"
                  className="input-field"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Sports">Sports</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Club / Organizer Name
                </label>
                <input
                  type="text"
                  name="organizerName"
                  className="input-field"
                  placeholder="Club / Society / Organizer Name"
                  value={formData.organizerName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Event Date *
                </label>
                <input
                  type="date"
                  name="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Event Time
                </label>
                <input
                  type="text"
                  name="time"
                  className="input-field"
                  placeholder="10:00 AM - 04:00 PM"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Venue & Capacity */}
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Campus Venue / Hall *
                </label>
                <input
                  type="text"
                  name="venue"
                  className="input-field"
                  placeholder="Campus Venue or Hall"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Total Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  className="input-field"
                  min="5"
                  max="1000"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                Event Description & Schedule *
              </label>
              <textarea
                name="description"
                className="input-field"
                rows="4"
                placeholder="Describe rules, prerequisites, prizes, perks, and schedule..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Preset Banner Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
                Select Banner Image Preset
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {PRESET_BANNERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, banner: preset.url })}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: formData.banner === preset.url ? '1px solid #6366f1' : '1px solid var(--border-color)',
                      background: formData.banner === preset.url ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: formData.banner === preset.url ? '#a5b4fc' : 'var(--text-muted)',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                name="banner"
                className="input-field"
                placeholder="Or paste any custom Image URL"
                value={formData.banner}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                {loading ? 'Creating Event...' : 'Publish Event Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
