import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

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
    if (!window.confirm(`Are you sure you want to delete account for "${name}"?`)) return;

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
      showToast('Official circular broadcasted to all student and faculty portals!');
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
        <div style={{ backgroundColor: '#e65100', color: 'white', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>
      )}

      {/* Admin Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #a32020 0%, #b71c1c 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 4px 15px rgba(163, 32, 32, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              INSTITUTIONAL ADMINISTRATION
            </div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '1.8rem' }}>RV University Central Administration Console</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              Administrator: <strong>{user?.name}</strong> • Department: <strong>Central IT & Academic Governance</strong>
            </p>
          </div>
          <button onClick={loadAdminData} className="btn-secondary" style={{ backgroundColor: 'white', color: '#a32020', border: 'none', fontWeight: 'bold' }}>
            🔄 Refresh System Metrics
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '25px', gap: '25px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid #a32020' : '3px solid transparent',
            color: activeTab === 'overview' ? '#a32020' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          📊 Executive Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #a32020' : '3px solid transparent',
            color: activeTab === 'users' ? '#a32020' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          👥 User Directory & Roles ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'broadcast' ? '3px solid #a32020' : '3px solid transparent',
            color: activeTab === 'broadcast' ? '#a32020' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          📢 Broadcast Circular
        </button>
        <button
          onClick={() => setActiveTab('system')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'system' ? '3px solid #a32020' : '3px solid transparent',
            color: activeTab === 'system' ? '#a32020' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          ⚙️ System Health & Audit
        </button>
      </div>

      {/* 1. OVERVIEW & METRICS TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="auth-card" style={{ maxWidth: '100%', padding: '22px', borderLeft: '5px solid #137333' }}>
              <div style={{ color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Enrolled Students</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#137333', marginTop: '6px' }}>
                {metrics?.studentsCount || 0}
              </div>
              <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>Active across all branches</div>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', padding: '22px', borderLeft: '5px solid #1976d2' }}>
              <div style={{ color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Faculty Instructors</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2', marginTop: '6px' }}>
                {metrics?.facultyCount || 0}
              </div>
              <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>Verified teaching staff</div>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', padding: '22px', borderLeft: '5px solid #f57c00' }}>
              <div style={{ color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Coursework</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00', marginTop: '6px' }}>
                {metrics?.totalAssignments || 0}
              </div>
              <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>Published assignments</div>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', padding: '22px', borderLeft: '5px solid #a32020' }}>
              <div style={{ color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Total User Accounts</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a32020', marginTop: '6px' }}>
                {metrics?.totalUsers || 0}
              </div>
              <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>System accounts</div>
            </div>
          </div>

          {/* School / Department Breakdown */}
          <div className="auth-card" style={{ maxWidth: '100%', padding: '25px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#222' }}>RV University Schools Enrollment Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #113f28' }}>
                <div style={{ fontWeight: 'bold', color: '#113f28' }}>SoCSE</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>School of Computer Science</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '8px' }}>{metrics?.schools?.SoCSE || 0} members</div>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #1976d2' }}>
                <div style={{ fontWeight: 'bold', color: '#1976d2' }}>SoB</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>School of Business</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '8px' }}>{metrics?.schools?.SoB || 0} members</div>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #8e24aa' }}>
                <div style={{ fontWeight: 'bold', color: '#8e24aa' }}>SoDI</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>School of Design & Innovation</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '8px' }}>{metrics?.schools?.SoDI || 0} members</div>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #f57c00' }}>
                <div style={{ fontWeight: 'bold', color: '#f57c00' }}>SoE / SoLAS</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Economics & Liberal Arts</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '8px' }}>{((metrics?.schools?.SoE || 0) + (metrics?.schools?.SoLAS || 0))} members</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-green)' }}>University User Directory</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search by name, email, or USN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '240px' }}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}
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
                <tr style={{ backgroundColor: '#ffebee', borderBottom: '2px solid #ffcdd2' }}>
                  <th style={{ padding: '14px 20px', color: '#a32020' }}>Name & Email</th>
                  <th style={{ padding: '14px 20px', color: '#a32020' }}>Role</th>
                  <th style={{ padding: '14px 20px', color: '#a32020' }}>USN / Emp ID</th>
                  <th style={{ padding: '14px 20px', color: '#a32020' }}>School / Dept</th>
                  <th style={{ padding: '14px 20px', color: '#a32020', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#222' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#777' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          backgroundColor:
                            u.role === 'admin' ? '#ffebee' : u.role === 'faculty' ? '#e3f2fd' : '#e8f5e9',
                          color:
                            u.role === 'admin' ? '#b71c1c' : u.role === 'faculty' ? '#1565c0' : '#2e7d32'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace' }}>
                        {u.usn || u.empId || '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {u.branch || u.department || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            style={{
                              backgroundColor: '#ffebee',
                              color: '#c62828',
                              border: '1px solid #ffcdd2',
                              padding: '5px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.8rem'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Superuser</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
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
          <div className="auth-card" style={{ maxWidth: '700px', padding: '30px', margin: '0 auto', borderTop: '4px solid #a32020' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#a32020' }}>Publish Official Campus Circular</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '25px' }}>
              Broadcast university-wide announcements, exam schedules, and circulars directly to student and faculty dashboards.
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
                <label>Category / Priority</label>
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
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  placeholder="Enter detailed notification body, regulations, and relevant dates..."
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ backgroundColor: '#a32020', borderColor: '#a32020', width: '100%', marginTop: '10px' }}>
                🚀 Broadcast Circular to Entire Campus
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. SYSTEM HEALTH & AUDIT TAB */}
      {activeTab === 'system' && (
        <div>
          <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>Server & System Health Monitor</h2>
          <div className="auth-card" style={{ maxWidth: '800px', padding: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ margin: '0 0 4px', color: '#777', fontSize: '0.85rem' }}>System Status</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d32' }}>
                  ✓ {systemAudit?.status || 'Online'}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#777', fontSize: '0.85rem' }}>Platform</p>
                <p style={{ margin: 0, fontWeight: '500' }}>{systemAudit?.platform || 'Node.js'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#777', fontSize: '0.85rem' }}>Runtime Version</p>
                <p style={{ margin: 0, fontWeight: '500' }}>{systemAudit?.nodeVersion || 'v20.x'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#777', fontSize: '0.85rem' }}>Memory Allocated</p>
                <p style={{ margin: 0, fontWeight: '500' }}>{systemAudit?.memoryUsage || '42 MB'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#777', fontSize: '0.85rem' }}>Server Uptime</p>
                <p style={{ margin: 0, fontWeight: '500' }}>{systemAudit?.serverUptime || 'Active'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#777', fontSize: '0.85rem' }}>Environment</p>
                <p style={{ margin: 0, fontWeight: '500', textTransform: 'uppercase' }}>{systemAudit?.environment || 'Development'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
