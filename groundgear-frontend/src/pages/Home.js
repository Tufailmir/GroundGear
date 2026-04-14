import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import API_BASE_URL from '../config/api';

function Home() {
  const [equipment, setEquipment] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [aadhaar, setAadhaar] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const categories = ['All', 'Cricket', 'Football', 'Basketball',
    'Badminton', 'Volleyball', 'Tennis', 'Table Tennis', 'Boxing', 'Rugby', 'Hockey'];

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/equipment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openBorrowModal = (item) => {
    setSelectedEquipment(item);
    setShowModal(true);
    setAadhaar('');
    setFullName('');
    setPhone('');
  };

  const handleBorrow = async () => {
    if (!aadhaar || aadhaar.length !== 12) {
      showMessage('Please enter a valid 12-digit Aadhaar number', 'error');
      return;
    }
    if (!fullName) {
      showMessage('Please enter your full name', 'error');
      return;
    }
    if (!phone || phone.length !== 10) {
      showMessage('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    setBorrowing(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/borrow/request/${selectedEquipment.id}`,
        { aadhaarNumber: aadhaar, fullName, phoneNumber: phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      const qr = JSON.stringify({
        requestId: res.data.id,
        equipment: selectedEquipment.name,
        user: username,
        aadhaar: aadhaar.slice(-4).padStart(12, '*'),
        status: 'PENDING'
      });
      setQrData(qr);
      setShowQR(true);
      showMessage('Borrow request sent! Show QR to admin for pickup.', 'success');
      fetchEquipment();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to send request', 'error');
    }
    setBorrowing(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const filtered = equipment
    .filter(e => category === 'All' || e.category === category)
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header} className="fade-in">
        <div>
          <h1 style={styles.heading}>🏟️ Equipment Hub</h1>
          <p style={styles.subheading}>Borrow sports equipment for free, play more!</p>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statPill}>
            🎯 {equipment.length} Items
          </div>
          <div style={styles.statPill}>
            ✅ {equipment.filter(e => e.available).length} Available
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          ...styles.message,
          background: messageType === 'success' ? '#e8f5e9' : '#ffebee',
          color: messageType === 'success' ? '#2e7d32' : '#c62828',
          borderLeft: `4px solid ${messageType === 'success' ? '#4CAF50' : '#e53935'}`
        }} className="slide-in">
          {messageType === 'success' ? '✅' : '❌'} {message}
        </div>
      )}

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          style={styles.search}
          type="text"
          placeholder="🔍 Search equipment..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div style={styles.categories}>
        {categories.map(cat => (
          <button
            key={cat}
            style={{
              ...styles.catBtn,
              background: category === cat
                ? 'linear-gradient(135deg, #4CAF50, #2e7d32)'
                : '#fff',
              color: category === cat ? '#fff' : '#555',
              boxShadow: category === cat
                ? '0 4px 15px rgba(76,175,80,0.4)'
                : '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner"></div>
          <p style={{ color: '#888', marginTop: '10px' }}>Loading equipment...</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="card-hover fade-in"
              style={{
                ...styles.card,
                animationDelay: `${index * 0.05}s`,
                opacity: item.availableQuantity === 0 ? 0.7 : 1
              }}
            >
              {/* Emoji — CSS float animation (see index.css .equipment-emoji) */}
              <div style={styles.emojiContainer} className="equipment-emoji-ring">
                <span style={styles.emoji} className="equipment-emoji" aria-hidden>
                  {item.emoji}
                </span>
              </div>

              {/* Info */}
              <h3 style={styles.name}>{item.name}</h3>
              <span style={styles.categoryBadge}>{item.category}</span>
              <p style={styles.description}>{item.description}</p>

              {/* Quantity bar */}
              <div style={styles.quantitySection}>
                <div style={styles.quantityRow}>
                  <span style={styles.quantityLabel}>Available</span>
                  <span style={{
                    ...styles.quantityCount,
                    color: item.availableQuantity === 0 ? '#e53935' :
                           item.availableQuantity <= 2 ? '#ff9800' : '#4CAF50'
                  }}>
                    {item.availableQuantity}/{item.totalQuantity}
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${(item.availableQuantity / item.totalQuantity) * 100}%`,
                    background: item.availableQuantity === 0 ? '#e53935' :
                                item.availableQuantity <= 2 ? '#ff9800' : '#4CAF50'
                  }}></div>
                </div>
              </div>

              {/* Deposit */}
              <div style={styles.depositRow}>
                <span style={styles.depositLabel}>💰 Deposit</span>
                <span style={styles.depositAmount}>₹{item.depositAmount}</span>
              </div>

              {/* Status & Button */}
              <div style={{
                ...styles.statusBadge,
                background: item.availableQuantity === 0 ? '#ffebee' : '#e8f5e9',
                color: item.availableQuantity === 0 ? '#c62828' : '#2e7d32'
              }}>
                {item.availableQuantity === 0 ? '❌ Not Available' :
                 item.availableQuantity <= 2 ? '⚠️ Almost Gone!' : '✅ Available'}
              </div>

              {item.availableQuantity > 0 && (
                <button
                  style={styles.borrowBtn}
                  onClick={() => openBorrowModal(item)}
                >
                  🤝 Borrow Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Borrow Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal} className="fade-in">
            <h2 style={styles.modalTitle}>
              {selectedEquipment?.emoji} Borrow {selectedEquipment?.name}
            </h2>
            <p style={styles.modalSubtitle}>
              Please provide your details for verification
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>👤 Full Name</label>
              <input
                style={styles.modalInput}
                placeholder="Enter your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>🪪 Aadhaar Number</label>
              <input
                style={styles.modalInput}
                placeholder="12-digit Aadhaar number"
                value={aadhaar}
                maxLength={12}
                onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))}
              />
              <small style={styles.hint}>
                Your Aadhaar is encrypted and stored securely
              </small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>📱 Phone Number</label>
              <input
                style={styles.modalInput}
                placeholder="10-digit phone number"
                value={phone}
                maxLength={10}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div style={styles.modalInfo}>
              <p>💰 Deposit: <strong>₹{selectedEquipment?.depositAmount}</strong></p>
              <p>📦 Available: <strong>{selectedEquipment?.availableQuantity} left</strong></p>
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={handleBorrow}
                disabled={borrowing}
              >
                {borrowing ? '⏳ Sending...' : '✅ Confirm Borrow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div style={styles.overlay}>
          <div style={styles.modal} className="fade-in">
            <h2 style={styles.modalTitle}>🎉 Request Submitted!</h2>
            <p style={styles.modalSubtitle}>
              Show this QR code to the admin for equipment pickup
            </p>
            <div style={styles.qrContainer}>
              <QRCode value={qrData} size={200} level="H" />
            </div>
            <p style={styles.qrHint}>
              📋 Request is pending admin approval
            </p>
            <button
              style={styles.confirmBtn}
              onClick={() => setShowQR(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '25px', maxWidth: '1300px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  heading: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e' },
  subheading: { color: '#888', fontSize: '15px', marginTop: '5px' },
  statsRow: { display: 'flex', gap: '10px' },
  statPill: { background: '#1a1a2e', color: '#fff', padding: '8px 16px',
    borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  message: { padding: '12px 20px', borderRadius: '10px',
    marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
  searchContainer: { marginBottom: '20px' },
  search: { width: '100%', padding: '14px 20px', borderRadius: '12px',
    border: '2px solid #e0e0e0', fontSize: '15px', outline: 'none',
    background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'border 0.3s ease' },
  categories: { display: 'flex', gap: '10px', marginBottom: '25px',
    flexWrap: 'wrap' },
  catBtn: { padding: '8px 18px', borderRadius: '20px', border: 'none',
    cursor: 'pointer', fontWeight: '600', fontSize: '13px',
    transition: 'all 0.3s ease' },
  grid: { display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '22px' },
  card: { background: '#fff', borderRadius: '20px', padding: '22px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textAlign: 'center' },
  emojiContainer: { width: '80px', height: '80px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #f5f5f5, #e8f5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 15px' },
  emoji: { fontSize: '40px' },
  name: { fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '6px' },
  categoryBadge: { background: '#e3f2fd', color: '#1565c0', padding: '3px 10px',
    borderRadius: '10px', fontSize: '11px', fontWeight: '600' },
  description: { fontSize: '13px', color: '#777', margin: '10px 0',
    lineHeight: '1.5' },
  quantitySection: { margin: '12px 0' },
  quantityRow: { display: 'flex', justifyContent: 'space-between',
    marginBottom: '5px' },
  quantityLabel: { fontSize: '12px', color: '#888' },
  quantityCount: { fontSize: '13px', fontWeight: 'bold' },
  progressBar: { height: '6px', background: '#f0f0f0', borderRadius: '10px',
    overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '10px',
    transition: 'width 0.5s ease' },
  depositRow: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', margin: '10px 0' },
  depositLabel: { fontSize: '13px', color: '#888' },
  depositAmount: { fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' },
  statusBadge: { padding: '5px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600', marginBottom: '12px',
    display: 'inline-block' },
  borrowBtn: { width: '100%', padding: '12px', background:
    'linear-gradient(135deg, #4CAF50, #2e7d32)', color: '#fff',
    border: 'none', borderRadius: '10px', fontSize: '14px',
    cursor: 'pointer', fontWeight: 'bold' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', borderRadius: '20px', padding: '35px',
    width: '420px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e',
    marginBottom: '8px' },
  modalSubtitle: { color: '#888', fontSize: '14px', marginBottom: '20px' },
  inputGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#555', marginBottom: '6px' },
  modalInput: { width: '100%', padding: '12px', borderRadius: '10px',
    border: '2px solid #e0e0e0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' },
  hint: { color: '#aaa', fontSize: '11px', marginTop: '4px', display: 'block' },
  modalInfo: { background: '#f9f9f9', padding: '12px', borderRadius: '10px',
    marginBottom: '20px', fontSize: '14px', lineHeight: '1.8' },
  modalButtons: { display: 'flex', gap: '12px' },
  cancelBtn: { flex: 1, padding: '12px', background: '#f5f5f5',
    color: '#555', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 'bold' },
  confirmBtn: { flex: 1, padding: '12px',
    background: 'linear-gradient(135deg, #4CAF50, #2e7d32)',
    color: '#fff', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 'bold' },
  qrContainer: { display: 'flex', justifyContent: 'center',
    padding: '20px', background: '#f9f9f9', borderRadius: '15px',
    margin: '20px 0' },
  qrHint: { textAlign: 'center', color: '#888', fontSize: '13px',
    marginBottom: '20px' }
};

export default Home;