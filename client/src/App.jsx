// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Páginas e Componentes
import CalendarPage from './CalendarPage';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminFinancePage from './pages/AdminFinancePage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- ROTAS PÚBLICAS (CLIENTE) --- */}
        <Route path="/" element={<CalendarPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* --- ROTAS PRIVADAS (ADMIN) --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* As páginas do admin que realmente existem */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="finance" element={<AdminFinancePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;