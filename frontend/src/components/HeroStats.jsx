import React from 'react';
import { Search, Flame, Users, CalendarCheck, Sparkles } from 'lucide-react';

const categories = ['All', 'Sports', 'Cultural', 'Technical'];

const HeroStats = ({ stats, searchTerm, setSearchTerm, activeCategory, setActiveCategory }) => {
  return (
    <section style={{ padding: '40px 24px 20px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Hero Headline */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '18px',
        }}>
          <Sparkles size={15} color="#818cf8" />
          <span>Live SST Campus Hub</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
          fontWeight: '800',
          lineHeight: '1.2',
          marginBottom: '14px',
          background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          Track Ongoing Campus Events, Competitions & More...
        </h1>
      </div>

      {/* Stats Counter Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '36px',
      }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Flame size={24} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
              {stats?.totalEvents ?? 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Active Campus Events</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CalendarCheck size={24} color="#f472b6" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
              {stats?.totalRegistrations ?? 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Passes Booked</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={24} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
              {stats?.bookedUsers ?? 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Booked Students</div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} color="var(--text-dim)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search events by title, keyword, or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '48px' }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600', marginRight: '4px', whiteSpace: 'nowrap' }}>
            Filter Category:
          </span>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  border: isActive ? '1px solid #6366f1' : '1px solid var(--border-color)',
                  background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroStats;
