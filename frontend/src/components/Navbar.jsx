import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, PlusCircle, LogIn, LogOut, UserCheck, Sparkles } from 'lucide-react';

const Navbar = ({ onOpenAuth, onOpenCreate, onOpenPasses }) => {
  const { user, logout, isOrganizer } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div
        className="navbar-container"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          }}>
            <Calendar size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CampusPulse
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              SST Campus Events Portal
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* My Passes Button for logged in user */}
              <button
                className="btn btn-secondary"
                onClick={onOpenPasses}
                style={{ fontSize: '0.88rem', padding: '8px 14px' }}
              >
                <Ticket size={16} color="#06b6d4" />
                <span>My Passes</span>
              </button>

              {/* Create Event Button for Organizer */}
              {isOrganizer && (
                <button
                  className="btn btn-primary"
                  onClick={onOpenCreate}
                  style={{ fontSize: '0.88rem', padding: '8px 14px' }}
                >
                  <PlusCircle size={16} />
                  <span>Post Event</span>
                </button>
              )}

              {/* User Info Capsule */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: '30px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isOrganizer ? '#8b5cf6' : '#0ea5e9',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    {user.name}
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: isOrganizer ? '#c084fc' : '#38bdf8',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                  }}>
                    {user.rollNumber ? `${user.rollNumber.toUpperCase()} • ` : ''}{user.role}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-secondary"
                onClick={logout}
                title="Logout"
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} color="#f43f5e" />
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onOpenAuth}
              style={{ padding: '9px 18px' }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
