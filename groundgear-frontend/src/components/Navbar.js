import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
    window.location.reload();
  };

  if (!token) return null;

  return (
    <nav style={styles.nav} className="app-nav">
      <div style={styles.logo}>
        🏏 GroundGear
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        {role !== 'ADMIN' && (
          <Link to="/my-borrows" style={styles.link}>My Borrows</Link>
        )}
        {role === 'ADMIN' && (
          <Link to="/admin" style={styles.link}>Admin</Link>
        )}
      </div>
      <div style={styles.user}>
        <span style={styles.username}>👤 {username}</span>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '15px 30px',
    background: '#1a1a2e', color: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  logo: { fontSize: '22px', fontWeight: 'bold', color: '#4CAF50' },
  links: { display: 'flex', gap: '25px' },
  link: { color: '#fff', textDecoration: 'none', fontSize: '15px',
    fontWeight: '500' },
  user: { display: 'flex', alignItems: 'center', gap: '15px' },
  username: { fontSize: '14px', color: '#ccc' },
  logout: {
    padding: '8px 16px', background: '#e53935',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '14px'
  }
};

export default Navbar;