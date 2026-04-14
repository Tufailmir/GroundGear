import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', res.data.role || 'USER');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏏 GroundGear</h2>
        <p style={styles.subtitle}>Login to borrow equipment</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">Login</button>
        </form>
        <p style={styles.link}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', minHeight: '100vh',
    padding: '24px',
    boxSizing: 'border-box',
    background: 'transparent',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    padding: '40px',
    borderRadius: '16px', width: '350px', maxWidth: '100%',
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  title: { textAlign: 'center', fontSize: '28px', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: '20px' },
  input: {
    width: '100%', padding: '12px',
    marginBottom: '15px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%', padding: '12px',
    background: '#4CAF50', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '16px', cursor: 'pointer'
  },
  error: { color: 'red', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '15px' }
};

export default Login;