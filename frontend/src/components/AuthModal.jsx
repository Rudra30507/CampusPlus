import React, { useState } from 'react';
import { X, LogIn, UserPlus, User, Lock, Mail, IdCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthModal = ({ onClose }) => {
  const { login, register, loading } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [rollNumber, setRollNumber] = useState('');
  const [councilPasskey, setCouncilPasskey] = useState('');

  // Auto-suggest SST email when name and roll are entered
  const handleRollChange = (val) => {
    setRollNumber(val);
    if (tab === 'register' && role === 'student' && name.trim()) {
      const cleanFirstName = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanRoll = val.trim().toLowerCase();
      if (cleanRoll && cleanFirstName) {
        setEmail(`${cleanFirstName}.${cleanRoll}@sst.scaler.com`);
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) onClose();
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (role === 'student') {
      const cleanRoll = rollNumber.trim().toLowerCase();
      const rollRegex = /^(24|25|26)bcs[a-z0-9]{3,7}$/i;
      if (!rollRegex.test(cleanRoll)) {
        toast.error('Roll Number must start with 24bcs, 25bcs, or 26bcs (e.g. 24bcs10042)');
        return;
      }
    }

    if (role === 'organizer' && !councilPasskey.trim()) {
      toast.error('Council Authorization Passkey is required for Club Leads');
      return;
    }

    if (!email.toLowerCase().endsWith('@sst.scaler.com') && !email.toLowerCase().endsWith('@scaler.com')) {
      toast.error('Must use an official SST Scaler email address (@sst.scaler.com)');
      return;
    }

    const res = await register({
      name,
      email,
      password,
      role,
      rollNumber,
      councilPasskey,
    });
    if (res.success) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {tab === 'login' ? 'Sign In • SST Portal' : 'Register for SST Events'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {tab === 'login' ? 'Access your event passes & verified RSVPs' : 'Join using your 24/25/26BCS Roll Number'}
            </p>
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <button
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'login' ? '2px solid #6366f1' : '2px solid transparent',
              color: tab === 'login' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: '600',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'register' ? '2px solid #6366f1' : '2px solid transparent',
              color: tab === 'register' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: '600',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Register Student / Club
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  SST College Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="name.24bcsxxxxx@sst.scaler.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.95rem' }}
              >
                {loading ? 'Authenticating...' : 'Sign In with SST Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Role Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: role === 'student' ? '1px solid #6366f1' : '1px solid var(--border-color)',
                      background: role === 'student' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: role === 'student' ? '#a5b4fc' : 'var(--text-muted)',
                    }}
                  >
                    SST Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: role === 'organizer' ? '1px solid #6366f1' : '1px solid var(--border-color)',
                      background: role === 'organizer' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: role === 'organizer' ? '#a5b4fc' : 'var(--text-muted)',
                    }}
                  >
                    Club / Event Lead
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {role === 'organizer' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                    Council Authorization Passkey * <span style={{ color: '#fbbf24', fontSize: '0.74rem' }}>(Required for Club Leads)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={16} color="#fbbf24" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Council Authorization Passkey"
                      value={councilPasskey}
                      onChange={(e) => setCouncilPasskey(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    Only verified club heads appointed by SST administration hold this authorization key.
                  </div>
                </div>
              )}

              {role === 'student' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                    Roll Number <span style={{ color: '#38bdf8', fontSize: '0.78rem' }}>(24bcs / 25bcs / 26bcs)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <IdCard size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Roll Number (24bcs / 25bcs / 26bcs)"
                      value={rollNumber}
                      onChange={(e) => handleRollChange(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  SST College Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="name.rollnumber@sst.scaler.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Must end with <strong>@sst.scaler.com</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.95rem' }}
              >
                {loading ? 'Registering...' : 'Register for SST Events'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
