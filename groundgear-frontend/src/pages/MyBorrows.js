import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBorrows();
  }, []);

  const fetchBorrows = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/borrow/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBorrows(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return { bg: '#fff8e1', color: '#f57f17' };
      case 'APPROVED': return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'RETURNED': return { bg: '#e3f2fd', color: '#1565c0' };
      case 'REJECTED': return { bg: '#ffebee', color: '#c62828' };
      default: return { bg: '#f5f5f5', color: '#333' };
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Borrows</h2>
      {borrows.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't borrowed anything yet!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {borrows.map(borrow => {
            const statusStyle = getStatusColor(borrow.status);
            return (
              <div key={borrow.id} style={styles.card}>
                <div style={styles.emojiWrap} className="equipment-emoji-ring">
                  <span className="equipment-emoji" style={styles.emoji} aria-hidden>
                    {borrow.equipment.emoji || '📦'}
                  </span>
                </div>
                <h3 style={styles.name}>{borrow.equipment.name}</h3>
                <p style={styles.category}>{borrow.equipment.category}</p>
                <p style={styles.time}>
                  Borrowed: {new Date(borrow.borrowTime).toLocaleString()}
                </p>
                {borrow.returnTime && (
                  <p style={styles.time}>
                    Returned: {new Date(borrow.returnTime).toLocaleString()}
                  </p>
                )}
                <div style={{
                  ...styles.badge,
                  background: statusStyle.bg,
                  color: statusStyle.color
                }}>
                  {borrow.status}
                </div>
                {borrow.status === 'APPROVED' && (
                  <p style={styles.hint}>Return the item at the desk — an admin will mark it returned.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  heading: { fontSize: '28px', marginBottom: '20px', color: '#1a1a2e' },
  empty: { textAlign: 'center', padding: '50px', color: '#888', fontSize: '18px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px' },
  card: { background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.7)' },
  emojiWrap: {
    width: 64,
    height: 64,
    margin: '0 auto 12px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #f8fafc, #e8f5e9)',
  },
  emoji: { fontSize: 32, lineHeight: 1 },
  name: { fontSize: '20px', fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' },
  category: { color: '#888', fontSize: '13px', marginBottom: '10px', textAlign: 'center' },
  time: { fontSize: '13px', color: '#555', marginBottom: '5px' },
  badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '13px',
    fontWeight: 'bold', display: 'inline-block', marginTop: '10px' },
  hint: { fontSize: '13px', color: '#666', marginTop: '12px', lineHeight: 1.4 }
};

export default MyBorrows;