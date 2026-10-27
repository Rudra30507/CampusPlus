import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EventCard = ({
  event,
  onSelectEvent,
  onRegister,
  onOpenAttendees,
  onDeleteEvent,
  isRegistered,
  registering,
}) => {
  const { user, isOrganizer } = useAuth();

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isFull = seatsLeft === 0;

  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'technical':
        return 'badge-technical';
      case 'cultural':
        return 'badge-cultural';
      case 'sports':
        return 'badge-sports';
      case 'workshop':
        return 'badge-workshop';
      case 'seminar':
        return 'badge-seminar';
      default:
        return 'badge-technical';
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Banner Image Container */}
      <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden' }}>
        <img
          src={event.banner}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(9, 13, 22, 0.9) 0%, transparent 60%)',
        }} />

        {/* Category Pill */}
        <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
          <span className={`badge ${getCategoryClass(event.category)}`}>
            {event.category}
          </span>
        </div>

        {/* Seats Badge */}
        <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: isFull ? 'rgba(244, 63, 94, 0.85)' : 'rgba(15, 23, 42, 0.85)',
            color: isFull ? '#fff' : '#38bdf8',
            border: isFull ? '1px solid #f43f5e' : '1px solid rgba(56, 189, 248, 0.4)',
            backdropFilter: 'blur(4px)',
          }}>
            {isFull ? 'HOUSEFULL' : `${seatsLeft} Seats Left`}
          </span>
        </div>

        {/* Organizer Badge */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          fontSize: '0.78rem',
          color: '#cbd5e1',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>By {event.organizerName || 'Campus Host'}</span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Title */}
        <h3 style={{
          fontSize: '1.18rem',
          fontWeight: '700',
          marginBottom: '10px',
          color: 'var(--text-main)',
          lineHeight: '1.35',
        }}>
          {event.title}
        </h3>

        {/* Short Description */}
        <p style={{
          fontSize: '0.86rem',
          color: 'var(--text-muted)',
          lineHeight: '1.5',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {event.description}
        </p>

        {/* Meta Details: Date, Time, Venue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', fontSize: '0.84rem', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="#818cf8" />
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={15} color="#ec4899" />
            <span>{event.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={15} color="#34d399" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.venue}</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div style={{ marginBottom: '20px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
            <span>Booked: {event.registeredCount}/{event.capacity}</span>
            <span>{percentFilled}% Filled</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${percentFilled}%`,
              height: '100%',
              background: percentFilled > 85 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #6366f1, #06b6d4)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* RSVP / Pass Button (Only for students; Organizers manage events) */}
            {isOrganizer ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#a5b4fc',
                  background: 'rgba(99, 102, 241, 0.12)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                👑 Organizer / Host Mode
              </div>
            ) : isRegistered ? (
              <button
                className="btn btn-secondary"
                disabled
                style={{ flex: 1, opacity: 0.9, color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)', background: 'rgba(52, 211, 153, 0.1)' }}
              >
                <CheckCircle size={16} />
                <span>Registered</span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => onRegister(event._id)}
                disabled={isFull || registering}
                style={{ flex: 1, opacity: isFull ? 0.6 : 1 }}
              >
                {registering ? 'Booking...' : isFull ? 'Event Full' : 'RSVP / Book Pass'}
              </button>
            )}

            {/* View Details Button */}
            <button
              className="btn btn-secondary"
              onClick={() => onSelectEvent(event, 'overview')}
              title="View full event details"
              style={{ padding: '10px 12px' }}
            >
              <Eye size={16} />
            </button>

            {/* Find Squads / Teammates Button */}
            <button
              className="btn btn-secondary"
              onClick={() => onSelectEvent(event, 'teams')}
              title="Find My Squad / Teammates"
              style={{
                padding: '10px 12px',
                color: '#38bdf8',
                borderColor: 'rgba(56, 189, 248, 0.35)',
                background: 'rgba(56, 189, 248, 0.08)',
              }}
            >
              <Users size={15} />
            </button>
          </div>

          {/* Organizer-specific options */}
          {isOrganizer && (
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => onOpenAttendees(event)}
                style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px', color: '#a5b4fc' }}
              >
                <Users size={14} />
                <span>Attendees ({event.registeredCount})</span>
              </button>

              <button
                className="btn btn-danger"
                onClick={() => onDeleteEvent(event._id)}
                title="Delete Event"
                style={{ padding: '6px 10px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
