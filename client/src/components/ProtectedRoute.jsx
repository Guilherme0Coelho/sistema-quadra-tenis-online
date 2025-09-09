// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Se não houver token, redireciona para a página de login
    return <Navigate to="/admin/login" replace />;
  }
  
  // Se houver token, mostra a página solicitada (o 'children')
  return children;
};

export default ProtectedRoute;