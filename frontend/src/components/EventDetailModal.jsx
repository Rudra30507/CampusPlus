import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  ShieldCheck,
  UserPlus,
  Sparkles,
  MessageSquare,
  Check,
  Trash2,
  AlertCircle,
  Hourglass,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EventDetailModal = ({ event, onClose, onRegister, isRegistered, registering, initialTab = 'overview' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'teams'
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // New team form state - starts completely empty without pre-filled suggestions
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    description: '',
    rolesNeeded: '',
    batchPreference: 'Any Batch',
    slotsTotal: 4,
  });

  if (!event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isFull = seatsLeft === 0;

  // Fetch squad requests for this event
  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const res = await api.get(`/teams/event/${event._id}`);
      setTeams(res.data.data || []);
    } catch (err) {
      console.error('Failed to load squad requests:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'teams') {
      fetchTeams();
    }
  }, [activeTab, event]);

  // Handle Create Squad Listing
  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to post a squad listing');
      return;
    }
    if (!teamForm.teamName.trim() || !teamForm.description.trim()) {
      toast.error('Please fill in team name and requirements');
      return;
    }

    try {
      const res = await api.post(`/teams/event/${event._id}`, teamForm);
      toast.success(res.data.message || 'Squad listing created! 🚀');
      setShowCreateTeam(false);
      setTeamForm({ teamName: '', description: '', rolesNeeded: '', batchPreference: 'Any Batch', slotsTotal: 4 });
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post squad listing');
    }
  };

  // Handle Request to Join Squad
  const handleRequestJoin = async (teamId) => {
    if (!user) {
      toast.error('Please sign in to join a squad');
      return;
    }

    setActionLoadingId(teamId);
    try {
      const res = await api.post(`/teams/${teamId}/join`);
      toast.success(res.data.message || 'Join request sent to squad leader! ⏳');
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send join request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Cancel Join Request
  const handleCancelRequest = async (teamId) => {
    setActionLoadingId(teamId);
    try {
      const res = await api.post(`/teams/${teamId}/cancel-request`);
      toast.success(res.data.message || 'Join request cancelled');
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Approve Request (Leader only)
  const handleApproveRequest = async (teamId, studentId) => {
    setActionLoadingId(`${teamId}-${studentId}`);
    try {
      const res = await api.post(`/teams/${teamId}/requests/${studentId}/approve`);
      toast.success(res.data.message || 'Student approved and added to your squad! 🎉');
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve student');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Request (Leader only)
  const handleRejectRequest = async (teamId, studentId) => {
    setActionLoadingId(`${teamId}-${studentId}`);
    try {
      const res = await api.post(`/teams/${teamId}/requests/${studentId}/reject`);
      toast.success(res.data.message || 'Join request declined');
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Leave Squad
  const handleLeaveSquad = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this squad?')) return;
    setActionLoadingId(teamId);
    try {
      const res = await api.post(`/teams/${teamId}/leave`);
      toast.success(res.data.message || 'You left the squad');
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave squad');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Squad (Leader only)
  const handleDeleteSquad = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this squad listing?')) return;
    setActionLoadingId(teamId);
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success('Squad listing deleted');
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete squad');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        {/* Banner with Close Icon */}
        <div style={{ position: 'relative', width: '100%', height: '220px' }}>
          <img
            src={event.banner}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, #0f172a 0%, transparent 70%)',
          }} />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              background: '#6366f1',
              color: '#fff',
              textTransform: 'uppercase',
            }}>
              {event.category}
            </span>
          </div>
        </div>

        {/* Tab Navigation: Overview vs Find My Squad */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: '700',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              fontSize: '0.92rem',
              transition: 'all 0.2s',
            }}
          >
            📋 Event Overview
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'teams' ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === 'teams' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: '700',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Users size={16} color="#38bdf8" />
            <span>Find My Squad (Teammates)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'overview' ? (
            <>
              {/* Event Title */}
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', lineHeight: '1.3' }}>
                {event.title}
              </h2>

              {/* Event Metadata Grid */}
              <div
                className="meta-grid"
                style={{
                  marginBottom: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{formattedDate}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} color="#ec4899" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{event.time}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={18} color="#34d399" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Venue</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{event.venue}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={18} color="#06b6d4" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Availability</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                      {seatsLeft} of {event.capacity} seats left
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>About Event</h4>
                <p style={{
                  fontSize: '0.92rem',
                  lineHeight: '1.7',
                  color: 'var(--text-muted)',
                  whiteSpace: 'pre-line',
                }}>
                  {event.description}
                </p>
              </div>

              {/* Organizer details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                marginBottom: '24px',
              }}>
                <ShieldCheck size={18} color="#818cf8" />
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Hosted & Verified by </span>
                  <strong style={{ color: '#fff' }}>{event.organizerName || 'Campus Administration'}</strong>
                </div>
              </div>

              {/* Action Button */}
              {user?.role === 'organizer' || user?.role === 'admin' ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: '#a5b4fc',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                }}>
                  <ShieldCheck size={20} />
                  <span>Organizer Mode: Organizers manage event operations and cannot register as participants.</span>
                </div>
              ) : isRegistered ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontWeight: '700',
                }}>
                  <CheckCircle size={20} />
                  <span>You have already booked your pass for this event!</span>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onRegister(event._id);
                    onClose();
                  }}
                  disabled={isFull || registering}
                  style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                  {registering ? 'Booking Pass...' : isFull ? 'Event is Full' : 'Confirm RSVP & Generate Pass'}
                </button>
              )}
            </>
          ) : (
            /* Squad / Teammate Finder View */
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Teammate & Squad Hub</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Looking for team members for this competition? Post or join an existing squad!
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateTeam(!showCreateTeam)}
                  style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                >
                  <UserPlus size={15} />
                  <span>{showCreateTeam ? 'Cancel' : 'Post Squad Listing'}</span>
                </button>
              </div>

              {/* Create Squad Form - Completely empty fields without pre-filled suggestions */}
              {showCreateTeam && (
                <form onSubmit={handleCreateTeamSubmit} style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid #6366f1',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#a5b4fc' }}>
                    Post New Squad Requirement:
                  </div>

                  <div className="form-grid-3">
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Squad Name</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Squad Name"
                        value={teamForm.teamName}
                        onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Team Capacity</label>
                      <select
                        className="input-field"
                        value={teamForm.slotsTotal}
                        onChange={(e) => setTeamForm({ ...teamForm, slotsTotal: Number(e.target.value) })}
                      >
                        <option value={2}>2 Members (Duo)</option>
                        <option value={3}>3 Members (Trio)</option>
                        <option value={4}>4 Members (Squad)</option>
                        <option value={5}>5 Members (Esports)</option>
                        <option value={6}>6 Members</option>
                        <option value={7}>7 Members (Kabaddi)</option>
                        <option value={11}>11 Members (Cricket XI)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Target Batch</label>
                      <select
                        className="input-field"
                        value={teamForm.batchPreference}
                        onChange={(e) => setTeamForm({ ...teamForm, batchPreference: e.target.value })}
                      >
                        <option value="Any Batch">Any Batch</option>
                        <option value="24BCS">24BCS Only</option>
                        <option value="25BCS">25BCS Only</option>
                        <option value="26BCS">26BCS Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Roles or Skills Needed (comma-separated)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Roles or skills needed (comma-separated)"
                      value={teamForm.rolesNeeded}
                      onChange={(e) => setTeamForm({ ...teamForm, rolesNeeded: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description & Strategy</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      placeholder="Briefly describe what you plan to build or your team strategy..."
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px' }}>
                    Publish Squad Listing
                  </button>
                </form>
              )}

              {/* Squads List */}
              {loadingTeams ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Loading squads...
                </div>
              ) : teams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                  <Users size={32} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>No squads posted yet</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Be the first student to post a squad listing and find teammates from your batch!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {teams.map((team) => {
                    const isCreator = user && (team.creator?._id === user._id || team.creator === user._id);
                    const isMember = user && team.members.some((m) => (m._id || m) === user._id);
                    const myRequest = user && (team.joinRequests || []).find((r) => (r.user?._id || r.user) === user._id);
                    const isPending = myRequest && myRequest.status === 'Pending';
                    const isRejected = myRequest && myRequest.status === 'Rejected';
                    const isFullTeam = team.members.length >= team.slotsTotal;

                    // Pending requests visible only to the squad leader
                    const pendingRequests = isCreator
                      ? (team.joinRequests || []).filter((r) => r.status === 'Pending')
                      : [];

                    return (
                      <div
                        key={team._id}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: isCreator ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{team.teamName}</h4>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: isFullTeam ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: isFullTeam ? '#f87171' : '#34d399',
                                fontWeight: '700',
                              }}>
                                {isFullTeam ? 'FULL' : `${team.slotsTotal - team.members.length} SLOTS OPEN`}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                                {team.batchPreference}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                              Leader: <strong>{team.creator?.name}</strong> ({team.creator?.rollNumber ? team.creator.rollNumber.toUpperCase() : 'SST'})
                            </div>
                          </div>

                          {/* Action Buttons based on User Role & Status */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCreator ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#fbbf24',
                                  background: 'rgba(251, 191, 36, 0.15)',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}>
                                  <Crown size={14} /> Squad Leader
                                </span>
                                <button
                                  onClick={() => handleDeleteSquad(team._id)}
                                  disabled={actionLoadingId === team._id}
                                  className="btn btn-danger"
                                  title="Delete Squad Listing"
                                  style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ) : isMember ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle size={15} /> Member
                                </span>
                                <button
                                  onClick={() => handleLeaveSquad(team._id)}
                                  disabled={actionLoadingId === team._id}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#f87171' }}
                                >
                                  Leave
                                </button>
                              </div>
                            ) : isPending ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  fontSize: '0.78rem',
                                  color: '#fbbf24',
                                  background: 'rgba(251, 191, 36, 0.15)',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}>
                                  <Hourglass size={13} /> Request Pending
                                </span>
                                <button
                                  onClick={() => handleCancelRequest(team._id)}
                                  disabled={actionLoadingId === team._id}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                                  title="Cancel join request"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : isRejected ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#f87171',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontWeight: '600',
                                }}>
                                  Declined
                                </span>
                                <button
                                  onClick={() => handleRequestJoin(team._id)}
                                  disabled={isFullTeam || actionLoadingId === team._id}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.78rem', padding: '5px 10px', color: '#38bdf8' }}
                                >
                                  Re-request
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRequestJoin(team._id)}
                                disabled={isFullTeam || actionLoadingId === team._id}
                                className="btn btn-secondary"
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '6px 14px',
                                  color: '#38bdf8',
                                  borderColor: 'rgba(56, 189, 248, 0.4)',
                                }}
                              >
                                {actionLoadingId === team._id ? 'Sending...' : isFullTeam ? 'Squad Full' : 'Request to Join'}
                              </button>
                            )}
                          </div>
                        </div>

                        <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                          {team.description}
                        </p>

                        {/* Roles Needed Tags */}
                        {team.rolesNeeded && team.rolesNeeded.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Looking for:</span>
                            {team.rolesNeeded.map((role, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  color: '#cbd5e1',
                                }}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Current Members list */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                          Current Members ({team.members.length}/{team.slotsTotal}):{' '}
                          {team.members.map((m) => `${m.name} (${m.rollNumber ? m.rollNumber.toUpperCase() : 'SST'})`).join(', ')}
                        </div>

                        {/* Pending Requests Section (Shown exclusively to Squad Leader) */}
                        {isCreator && (
                          <div style={{
                            marginTop: '8px',
                            padding: '12px',
                            borderRadius: '10px',
                            background: pendingRequests.length > 0 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                            border: pendingRequests.length > 0 ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                          }}>
                            <div style={{
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              color: pendingRequests.length > 0 ? '#a5b4fc' : 'var(--text-muted)',
                              marginBottom: pendingRequests.length > 0 ? '10px' : '0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <UserPlus size={14} />
                                <span>Pending Join Requests ({pendingRequests.length})</span>
                              </div>
                              {pendingRequests.length === 0 && (
                                <span style={{ fontSize: '0.72rem', fontWeight: '400', color: 'var(--text-dim)' }}>
                                  No pending requests
                                </span>
                              )}
                            </div>

                            {pendingRequests.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {pendingRequests.map((req) => {
                                  const reqUser = req.user;
                                  if (!reqUser) return null;
                                  const btnKey = `${team._id}-${reqUser._id}`;
                                  const isProcessing = actionLoadingId === btnKey;

                                  return (
                                    <div
                                      key={req._id || reqUser._id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        background: 'rgba(15, 23, 42, 0.85)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                      }}
                                    >
                                      <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                                          {reqUser.name}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                                          {reqUser.rollNumber ? reqUser.rollNumber.toUpperCase() : 'SST'} • {reqUser.email}
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <button
                                          onClick={() => handleApproveRequest(team._id, reqUser._id)}
                                          disabled={isProcessing || isFullTeam}
                                          className="btn btn-primary"
                                          style={{
                                            padding: '4px 10px',
                                            fontSize: '0.75rem',
                                            background: '#10b981',
                                            borderColor: '#10b981',
                                          }}
                                          title="Approve and add to squad"
                                        >
                                          <Check size={13} />
                                          <span>Approve</span>
                                        </button>

                                        <button
                                          onClick={() => handleRejectRequest(team._id, reqUser._id)}
                                          disabled={isProcessing}
                                          className="btn btn-danger"
                                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                          title="Decline request"
                                        >
                                          <X size={13} />
                                          <span>Decline</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
