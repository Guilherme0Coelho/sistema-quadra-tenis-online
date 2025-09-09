// src/components/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth'; // 1. Importa nosso ajudante
import './AdminLayout.css';

const AdminLayout = () => {
  const user = getUserFromToken(); // 2. Pega os dados do usuário logado

  const handleLogout = () => {
    if (window.confirm('Tem certeza de que deseja sair?')) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <span>Painel Administrativo</span>
          <nav className="admin-nav">
            <NavLink to="/admin/dashboard">Agenda</NavLink>
            
            {/* 3. CONDIÇÃO: Mostra o link apenas se o admin_level for 'super' */}
            {user && user.admin_level === 'super' && (
              <NavLink to="/admin/finance">Financeiro</NavLink>
            )}

          </nav>
          <button onClick={handleLogout} className="logout-button">Sair</button>
        </div>
      </header>
      <main className="admin-main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;