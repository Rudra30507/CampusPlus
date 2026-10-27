import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import api from './api/axios';

import Navbar from './components/Navbar';
import HeroStats from './components/HeroStats';
import EventCard from './components/EventCard';
import EventDetailModal from './components/EventDetailModal';
import CreateEventModal from './components/CreateEventModal';
import AttendeesModal from './components/AttendeesModal';
import MyPassesModal from './components/MyPassesModal';
import AuthModal from './components/AuthModal';

import { Calendar, Frown, Sparkles, Database, Layers, CheckCircle } from 'lucide-react';

function App() {
  const { user } = useAuth();

  // Data states
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [myRegisteredEventIds, setMyRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal visibility states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPassesOpen, setIsPassesOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventTab, setSelectedEventTab] = useState('overview');
  const [attendeesEvent, setAttendeesEvent] = useState(null);

  // Fetch all events
  const fetchEvents = async () => {
    try {
      let url = '/events';
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await api.get(url);
      setEvents(res.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Could not load events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard summary stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/events/stats/summary');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch user's booked registrations
  const fetchMyPasses = async () => {
    if (!user) {
      setMyRegisteredEventIds(new Set());
      return;
    }
    try {
      const res = await api.get('/registrations/my-passes');
      const ids = new Set((res.data.data || []).map((reg) => reg.event?._id));
      setMyRegisteredEventIds(ids);
    } catch (error) {
      console.error('Error fetching my passes:', error);
    }
  };

  // Reload data on filter change
  useEffect(() => {
    fetchEvents();
  }, [activeCategory, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Sync user passes and stats when user state changes
  useEffect(() => {
    fetchMyPasses();
    fetchStats();
  }, [user]);

  // RSVP / Register handler
  const handleRegister = async (eventId) => {
    if (!user) {
      toast('Please sign in with your SST account to RSVP!', { icon: '🔑' });
      setIsAuthOpen(true);
      return;
    }

    setRegisteringId(eventId);
    try {
      const res = await api.post(`/registrations/${eventId}`);
      toast.success(res.data.message || 'Pass booked successfully! 🎉');
      
      // Update local state
      setMyRegisteredEventIds((prev) => new Set([...prev, eventId]));
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId ? { ...ev, registeredCount: ev.registeredCount + 1 } : ev
        )
      );
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setRegisteringId(null);
    }
  };

  // Delete event handler (Organizer only)
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? All student passes for this event will also be removed.')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event removed');
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            fontSize: '0.9rem',
          },
        }}
      />

      {/* Navigation Bar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenPasses={() => {
          if (!user) {
            toast('Please sign in to view your passes', { icon: '🔑' });
            setIsAuthOpen(true);
          } else {
            setIsPassesOpen(true);
          }
        }}
      />

      {/* Hero Section & Metrics */}
      <HeroStats
        stats={stats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Main Events Grid Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 60px', width: '100%', flexGrow: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="#6366f1" />
            <span>
              {activeCategory === 'All' ? 'All Upcoming Events' : `${activeCategory} Events`}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>
              ({events.length} listed)
            </span>
          </h2>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Loading campus events from MongoDB Atlas...</div>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 24px', margin: '20px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Frown size={32} color="var(--text-dim)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No events found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              No campus events matched "{searchTerm || activeCategory}". Try selecting another category or clear your search!
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Event Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}>
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onSelectEvent={(ev, tab = 'overview') => {
                  setSelectedEvent(ev);
                  setSelectedEventTab(tab);
                }}
                onRegister={handleRegister}
                onOpenAttendees={(ev) => setAttendeesEvent(ev)}
                onDeleteEvent={handleDeleteEvent}
                isRegistered={myRegisteredEventIds.has(event._id)}
                registering={registeringId === event._id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      
      {isCreateOpen && (
        <CreateEventModal
          onClose={() => setIsCreateOpen(false)}
          onEventCreated={(newEvent) => {
            setEvents((prev) => [newEvent, ...prev]);
            fetchStats();
          }}
        />
      )}

      {isPassesOpen && (
        <MyPassesModal
          onClose={() => setIsPassesOpen(false)}
          onPassCancelled={() => {
            fetchMyPasses();
            fetchEvents();
            fetchStats();
          }}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          isRegistered={myRegisteredEventIds.has(selectedEvent._id)}
          registering={registeringId === selectedEvent._id}
          initialTab={selectedEventTab}
        />
      )}

      {attendeesEvent && (
        <AttendeesModal
          event={attendeesEvent}
          onClose={() => setAttendeesEvent(null)}
        />
      )}
    </div>
  );
}

export default App;
