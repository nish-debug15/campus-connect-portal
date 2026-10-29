import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import {
  MetricIcon,
  UsersIcon,
  BroadcastIcon,
  SettingsIcon,
  RefreshIcon,
  TrashIcon
} from './Icons';

export default function AdminPortal({ user }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'broadcast', 'system'
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [systemAudit, setSystemAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState('Academic Circular');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, sRes] = await Promise.all([
        adminAPI.getMetrics().catch(() => ({ metrics: null })),
        adminAPI.getUsers().catch(() => ({ users: [] })),
        adminAPI.getSystemAudit().catch(() => ({ system: null }))
      ]);

      setMetrics(mRes.metrics);
      setUsersList(uRes.users || []);
      setSystemAudit(sRes.system);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate account for "${name}"?`)) return;

    try {
      await adminAPI.deleteUser(id);
      setUsersList(usersList.filter((u) => u.id !== id));
      showToast(`User account for ${name} removed.`);
      // Refresh metrics
      const mRes = await adminAPI.getMetrics().catch(() => null);
      if (mRes) setMetrics(mRes.metrics);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleBroadcastNotice = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) return;

    try {
      await adminAPI.broadcastNotice({
        title: broadcastTitle,
        description: broadcastDesc,
        priority: broadcastPriority
      });

      setBroadcastTitle('');
      setBroadcastDesc('');
      showToast('Official circular broadcasted across all student and faculty dashboards.');
      const mRes = await adminAPI.getMetrics().catch(() => null);
      if (mRes) setMetrics(mRes.metrics);
    } catch (err) {
      alert('Failed to broadcast notice');
    }
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.empId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* Toast Alert */}
      {actionMessage && (
        <div style={{ backgroundColor: '#991b1b', color: 'white', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1' }}>×</button>
        </div>
      )}

      {/* Admin Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
        color: 'white',
        padding: '32px 36px',
        borderRadius: '14px',
        marginBottom: '28px',
        boxShadow: '0 4px 20px rgba(127, 29, 29, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '10px' }}>
              INSTITUTIONAL ADMINISTRATION
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Central Governance & Audit Console</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              Administrator: <strong>{user?.name}</strong> • Department: <strong>Central IT & Academic Governance</strong>
            </p>
          </div>
          <button
            onClick={loadAdminData}
            className="btn-secondary"
            style={{ backgroundColor: 'white', color: '#991b1b', border: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshIcon size={16} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {/* Modern Sub-Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '28px', gap: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid #991b1b' : '3px solid transparent',
            color: activeTab === 'overview' ? '#991b1b' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MetricIcon size={17} color={activeTab === 'overview' ? '#991b1b' : '#64748b'} />
          <span>Executive Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #991b1b' : '3px solid transparent',
            color: activeTab === 'users' ? '#991b1b' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UsersIcon size={17} color={activeTab === 'users' ? '#991b1b' : '#64748b'} />
          <span>User Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'broadcast' ? '3px solid #991b1b' : '3px solid transparent',
            color: activeTab === 'broadcast' ? '#991b1b' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BroadcastIcon size={17} color={activeTab === 'broadcast' ? '#991b1b' : '#64748b'} />
          <span>Broadcast Circular</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'system' ? '3px solid #991b1b' : '3px solid transparent',
            color: activeTab === 'system' ? '#991b1b' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <SettingsIcon size={17} color={activeTab === 'system' ? '#991b1b' : '#64748b'} />
          <span>System Health & Audit</span>
        </button>
      </div>

      {/* 1. OVERVIEW & METRICS TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', borderLeft: '5px solid #16a34a' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Enrolled Students</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#166534', marginTop: '6px', letterSpacing: '-0.5px' }}>
                {metrics?.studentsCount || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Active student accounts</div>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', borderLeft: '5px solid #2563eb' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Faculty Instructors</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1d4ed8', marginTop: '6px', letterSpacing: '-0.5px' }}>
                {metrics?.facultyCount || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Verified teaching faculty</div>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', borderLeft: '5px solid #d97706' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Active Coursework</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#b45309', marginTop: '6px', letterSpacing: '-0.5px' }}>
                {metrics?.totalAssignments || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Assignments in circulation</div>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', borderLeft: '5px solid #991b1b' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Total System Users</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#991b1b', marginTop: '6px', letterSpacing: '-0.5px' }}>
                {metrics?.totalUsers || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>MongoDB accounts</div>
            </div>
          </div>

          {/* School / Department Breakdown */}
          <div className="auth-card" style={{ maxWidth: '100%', padding: '28px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>RV University Schools Enrollment Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #0e3823' }}>
                <div style={{ fontWeight: '800', color: '#0e3823', fontSize: '1rem' }}>SoCSE</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Computer Science</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{metrics?.schools?.SoCSE || 0} users</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #1d4ed8' }}>
                <div style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '1rem' }}>SoB</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>School of Business</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{metrics?.schools?.SoB || 0} users</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #7c3aed' }}>
                <div style={{ fontWeight: '800', color: '#7c3aed', fontSize: '1rem' }}>SoDI</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Design & Innovation</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{metrics?.schools?.SoDI || 0} users</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #d97706' }}>
                <div style={{ fontWeight: '800', color: '#d97706', fontSize: '1rem' }}>SoE / SoLAS</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Economics & Liberal Arts</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{((metrics?.schools?.SoE || 0) + (metrics?.schools?.SoLAS || 0))} users</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>University User Directory</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Search by name, email, or USN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', minWidth: '240px' }}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: '700', cursor: 'pointer' }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="auth-card" style={{ maxWidth: '100%', padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                  <th style={{ padding: '14px 20px', color: '#991b1b' }}>User Identity</th>
                  <th style={{ padding: '14px 20px', color: '#991b1b' }}>Role</th>
                  <th style={{ padding: '14px 20px', color: '#991b1b' }}>USN / Staff ID</th>
                  <th style={{ padding: '14px 20px', color: '#991b1b' }}>School / Dept</th>
                  <th style={{ padding: '14px 20px', color: '#991b1b', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id || u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          backgroundColor:
                            u.role === 'admin' ? '#fee2e2' : u.role === 'faculty' ? '#e0f2fe' : '#dcfce7',
                          color:
                            u.role === 'admin' ? '#b91c1c' : u.role === 'faculty' ? '#0369a1' : '#15803d'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#334155' }}>
                        {u.usn || u.empId || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>
                        {u.branch || u.department || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(u.id || u._id, u.name)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '0.8rem'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>Superuser</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      No users found matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BROADCAST CIRCULARS TAB */}
      {activeTab === 'broadcast' && (
        <div>
          <div className="auth-card" style={{ maxWidth: '680px', padding: '36px', margin: '0 auto', borderTop: '5px solid #991b1b' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '1.5rem', fontWeight: '800' }}>Publish Campus Circular</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '26px' }}>
              Broadcast official institutional notices, exam schedules, and circulars to student and faculty portals.
            </p>

            <form onSubmit={handleBroadcastNotice}>
              <div className="form-group">
                <label>Circular Subject / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Examination Schedule Notification"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category / Classification</label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value)}
                >
                  <option value="Academic Circular">Academic Circular</option>
                  <option value="Urgent Notice">Urgent Notice</option>
                  <option value="University Event">University Event</option>
                  <option value="Campus Facilities">Campus Facilities Notice</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notice Content & Instructions</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Enter detailed notification body, regulations, and relevant dates..."
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
                  borderColor: '#7f1d1d',
                  width: '100%',
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <BroadcastIcon size={16} />
                <span>Broadcast Circular to Campus</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. SYSTEM HEALTH & AUDIT TAB */}
      {activeTab === 'system' && (
        <div>
          <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>Server & System Health Monitor</h2>
          <div className="auth-card" style={{ maxWidth: '800px', padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>
              <div>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.85rem' }}>System Operational Status</p>
                <p style={{ margin: 0, fontWeight: '700', color: '#166534', fontSize: '1.05rem' }}>
                  {systemAudit?.status || 'Online'}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.85rem' }}>Database Connection</p>
                <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>{systemAudit?.database || 'MongoDB Local (Active)'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.85rem' }}>Runtime Version</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{systemAudit?.nodeVersion || 'Node.js v20.x'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.85rem' }}>Memory Allocated</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{systemAudit?.memoryUsage || '42 MB'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.85rem' }}>Server Uptime</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{systemAudit?.serverUptime || 'Active'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.85rem' }}>Environment</p>
                <p style={{ margin: 0, fontWeight: '700', textTransform: 'uppercase', color: '#0f172a' }}>{systemAudit?.environment || 'Development'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
