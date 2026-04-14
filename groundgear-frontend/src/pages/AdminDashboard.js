import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import API_BASE_URL from '../config/api';

const API = API_BASE_URL;

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const token = localStorage.getItem('token');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/borrow/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data || []);
      setLastFetch(new Date());
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 403
        ? 'Access denied. Sign in as an administrator.'
        : 'Could not load requests. Check that the API is running.');
      setRequests([]);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${API}/api/borrow/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRequests();
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleReturn = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${API}/api/borrow/return/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRequests();
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const tabs = ['PENDING', 'APPROVED', 'RETURNED'];
  const tabConfig = {
    PENDING: { color: '#c2410c', accent: '#ea580c', bg: '#fff7ed', label: 'Awaiting pickup' },
    APPROVED: { color: '#15803d', accent: '#22c55e', bg: '#f0fdf4', label: 'Out with borrower' },
    RETURNED: { color: '#1d4ed8', accent: '#3b82f6', bg: '#eff6ff', label: 'Closed' },
  };

  const filteredByTab = useMemo(
    () => requests.filter((r) => r.status === activeTab),
    [requests, activeTab]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredByTab;
    return filteredByTab.filter((r) => {
      const eq = r.equipment?.name || '';
      const un = r.user?.username || '';
      const fn = r.fullName || '';
      const ph = r.phoneNumber || '';
      return [eq, un, fn, ph].some((s) => s.toLowerCase().includes(q));
    });
  }, [filteredByTab, search]);

  const counts = useMemo(() => ({
    total: requests.length,
    PENDING: requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    RETURNED: requests.filter((r) => r.status === 'RETURNED').length,
  }), [requests]);

  const pageEnter = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 }
    }
  };

  const rowIn = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 380, damping: 28 }
    }
  };

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.08 }
    }
  };

  const cardItem = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 320, damping: 26 }
    },
    exit: { opacity: 0, x: -24, transition: { duration: 0.22 } }
  };

  return (
    <motion.div
      style={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        style={styles.inner}
        variants={pageEnter}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.header style={styles.header} variants={rowIn}>
          <div>
            <p style={styles.kicker}>GroundGear · Operations</p>
            <h1 style={styles.title}>Equipment checkout</h1>
            <p style={styles.lead}>
              See who borrowed what, verify identity, and close the loop when gear is returned.
            </p>
            {lastFetch && (
              <p style={styles.meta}>
                Last updated {lastFetch.toLocaleTimeString()}
              </p>
            )}
          </div>
          <motion.button
            type="button"
            style={styles.refreshBtn}
            onClick={() => fetchRequests()}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            Refresh data
          </motion.button>
        </motion.header>

        {error && (
          <motion.div
            style={styles.alert}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* KPI strip */}
        <motion.div style={styles.kpiRow} variants={rowIn}>
          {[
            { key: 'total', label: 'All requests', value: counts.total },
            { key: 'PENDING', label: 'Pending approval', value: counts.PENDING, c: tabConfig.PENDING.accent },
            { key: 'APPROVED', label: 'Currently out', value: counts.APPROVED, c: tabConfig.APPROVED.accent },
            { key: 'RETURNED', label: 'Returned', value: counts.RETURNED, c: tabConfig.RETURNED.accent },
          ].map((k, i) => (
            <motion.div
              key={k.key}
              style={styles.kpiCard}
              variants={rowIn}
              custom={i}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            >
              <motion.div
                style={{ ...styles.kpiValue, color: k.c || '#0f172a' }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 + i * 0.05 }}
              >
                {k.value}
              </motion.div>
              <div style={styles.kpiLabel}>{k.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div style={styles.searchWrap} variants={rowIn}>
          <label htmlFor="admin-search" style={styles.srOnly}>Search borrowers or equipment</label>
          <input
            id="admin-search"
            type="search"
            placeholder="Search by borrower name, username, phone, or equipment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </motion.div>

        {/* Tabs */}
        <LayoutGroup>
          <motion.div style={styles.tabBar} variants={rowIn}>
            {tabs.map((tab) => {
              const active = activeTab === tab;
              const cfg = tabConfig[tab];
              return (
                <motion.button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.tabBtn,
                    color: active ? cfg.color : '#64748b',
                    background: active ? cfg.bg : 'transparent',
                  }}
                  whileHover={{ background: active ? cfg.bg : '#f1f5f9' }}
                  whileTap={{ scale: 0.99 }}
                >
                  {active && (
                    <motion.span
                      layoutId="adminTabGlow"
                      style={{ ...styles.tabGlow, background: cfg.accent }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span style={styles.tabTitle}>{tab}</span>
                  <span style={{
                    ...styles.tabBadge,
                    background: active ? cfg.accent : '#e2e8f0',
                    color: active ? '#fff' : '#64748b'
                  }}>
                    {counts[tab]}
                  </span>
                  <span style={styles.tabHint}>{cfg.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </LayoutGroup>

        {/* Content */}
        {loading ? (
          <motion.div
            style={styles.loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              style={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
            <p style={styles.loadingText}>Loading borrow records…</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            style={styles.empty}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={styles.emptyIcon}
            >
              {tabConfig[activeTab].label === 'Closed' ? '✓' : '—'}
            </motion.div>
            <h3 style={styles.emptyTitle}>
              {search.trim()
                ? 'No matches in this queue'
                : `No ${activeTab.toLowerCase()} records`}
            </h3>
            <p style={styles.emptySub}>
              {search.trim()
                ? 'Try a different search or clear the filter.'
                : 'When borrowers submit requests, they will appear here.'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeTab + search}
              style={styles.grid}
              variants={listContainer}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              {filtered.map((request) => {
                const cfg = tabConfig[request.status] || tabConfig.PENDING;
                const phone = request.phoneNumber || '';
                const maskedId = request.aadhaarNumber
                  ? `•••• ${String(request.aadhaarNumber).slice(-4)}`
                  : '—';

                return (
                  <motion.article
                    key={request.id}
                    layout
                    variants={cardItem}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    style={styles.card}
                    whileHover={{
                      y: -6,
                      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
                      transition: { type: 'spring', stiffness: 300, damping: 24 }
                    }}
                  >
                    <div style={styles.cardTop}>
                      <div>
                        <span style={styles.reqId}>Request #{request.id}</span>
                        <h2 style={styles.borrowerName}>{request.fullName || '—'}</h2>
                        <p style={styles.borrowerMeta}>
                          Account <strong>@{request.user?.username || '—'}</strong>
                          {' · '}
                          {phone ? (
                            <a href={`tel:${phone}`} style={styles.phoneLink}>{phone}</a>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>No phone on file</span>
                          )}
                        </p>
                      </div>
                      <motion.span
                        style={{
                          ...styles.statusPill,
                          background: cfg.bg,
                          color: cfg.color,
                          borderColor: cfg.accent
                        }}
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      >
                        {request.status}
                      </motion.span>
                    </div>

                    <div style={styles.cardSection}>
                      <p style={styles.sectionLabel}>Equipment</p>
                      <div style={styles.equipRow}>
                        <span style={styles.equipEmojiWrap} className="equipment-emoji-ring">
                          <span className="equipment-emoji" style={styles.equipEmojiInner} aria-hidden>
                            {request.equipment?.emoji || '📦'}
                          </span>
                        </span>
                        <div>
                          <p style={styles.equipName}>{request.equipment?.name}</p>
                          <p style={styles.equipSub}>
                            {request.equipment?.category} · Deposit ₹{request.equipment?.depositAmount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={styles.detailGrid}>
                      <div style={styles.detailCell}>
                        <span style={styles.detailLabel}>ID verification</span>
                        <span style={styles.detailValue}>{maskedId}</span>
                      </div>
                      <div style={styles.detailCell}>
                        <span style={styles.detailLabel}>Requested</span>
                        <span style={styles.detailValue}>
                          {request.borrowTime
                            ? new Date(request.borrowTime).toLocaleString()
                            : '—'}
                        </span>
                      </div>
                      {request.status === 'RETURNED' && request.returnTime && (
                        <div style={{ ...styles.detailCell, gridColumn: '1 / -1' }}>
                          <span style={styles.detailLabel}>Returned</span>
                          <span style={styles.detailValue}>
                            {new Date(request.returnTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={styles.actions}>
                      {request.status === 'PENDING' && (
                        <motion.button
                          type="button"
                          style={styles.btnPrimary}
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {actionLoading === request.id
                            ? 'Confirming…'
                            : 'Confirm handover · Approve'}
                        </motion.button>
                      )}
                      {request.status === 'APPROVED' && (
                        <motion.button
                          type="button"
                          style={styles.btnSecondary}
                          onClick={() => handleReturn(request.id)}
                          disabled={actionLoading === request.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {actionLoading === request.id
                            ? 'Updating…'
                            : 'Gear received · Mark returned'}
                        </motion.button>
                      )}
                      {request.status === 'RETURNED' && (
                        <p style={styles.closedNote}>Record closed. Deposit can be released per your policy.</p>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 56px)',
    background: 'transparent',
    padding: '28px 20px 48px',
    boxSizing: 'border-box',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap',
    marginBottom: '28px',
  },
  kicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#64748b',
    fontWeight: 600,
  },
  title: {
    margin: '6px 0 8px',
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  lead: {
    margin: 0,
    maxWidth: '520px',
    fontSize: '15px',
    lineHeight: 1.55,
    color: '#475569',
  },
  meta: {
    margin: '10px 0 0',
    fontSize: '12px',
    color: '#94a3b8',
  },
  refreshBtn: {
    padding: '11px 20px',
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '10px',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fecaca',
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '14px',
    marginBottom: '22px',
  },
  kpiCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '18px 16px',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
  },
  kpiValue: {
    fontSize: '32px',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    marginBottom: '6px',
  },
  kpiLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  },
  searchWrap: { marginBottom: '18px' },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
  searchInput: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
  },
  tabBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '26px',
  },
  tabBtn: {
    position: 'relative',
    padding: '14px 12px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    overflow: 'hidden',
    fontFamily: 'inherit',
  },
  tabGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '3px',
    borderRadius: '0 0 4px 4px',
  },
  tabTitle: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  tabBadge: {
    display: 'inline-block',
    minWidth: '22px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
  },
  tabHint: {
    display: 'block',
    marginTop: '6px',
    fontSize: '11px',
    color: '#94a3b8',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 16px',
    borderRadius: '50%',
    border: '3px solid #e2e8f0',
    borderTopColor: '#0f172a',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '64px 24px',
    background: '#fff',
    borderRadius: '16px',
    border: '1px dashed #cbd5e1',
  },
  emptyIcon: {
    fontSize: '42px',
    color: '#94a3b8',
    marginBottom: '12px',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    color: '#0f172a',
  },
  emptySub: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '22px',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    boxShadow: '0 4px 24px rgba(15, 23, 42, 0.07)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '18px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  reqId: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  borrowerName: {
    margin: '6px 0 6px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    lineHeight: 1.25,
  },
  borrowerMeta: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.5,
  },
  phoneLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
  statusPill: {
    flexShrink: 0,
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    border: '1px solid',
  },
  cardSection: {
    marginBottom: '16px',
  },
  sectionLabel: {
    margin: '0 0 8px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  equipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  equipEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
  },
  equipEmojiInner: {
    fontSize: '28px',
    lineHeight: 1,
  },
  equipName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
  },
  equipSub: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '18px',
  },
  detailCell: {
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  detailLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '13px',
    color: '#334155',
    fontWeight: 500,
  },
  actions: {
    paddingTop: '4px',
  },
  btnPrimary: {
    width: '100%',
    padding: '13px 16px',
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
  },
  btnSecondary: {
    width: '100%',
    padding: '13px 16px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
  },
  closedNote: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
  },
};

export default AdminDashboard;
