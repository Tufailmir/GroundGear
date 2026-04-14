import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyBorrows from './pages/MyBorrows';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <div className="app-shell">
        <div className="app-shell__aurora" aria-hidden />
        <Navbar />
        <main className="app-shell__main">
          <Routes>
            <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/my-borrows"
              element={
                token
                  ? role === 'ADMIN'
                    ? <Navigate to="/admin" replace />
                    : <MyBorrows />
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="/admin"
              element={
                token
                  ? role === 'ADMIN'
                    ? <AdminDashboard />
                    : <Navigate to="/" replace />
                  : <Navigate to="/login" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;