// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro de conexão. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <h2>Login do Administrador</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="error-message-login">{error}</p>}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminLoginPage;