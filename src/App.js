import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import LoginPage from './modules/login/pages/LoginPage';
import RegisterPage from './modules/login/pages/RegisterPage';
import ForgotPasswordPage from './modules/login/pages/ForgotPasswordPage';
import ChangePasswordPage from './modules/login/pages/ChangePasswordPage';
import ResetPasswordPage from './modules/login/pages/ResetPasswordPage';
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import VentasPage from './modules/ventas/pages/VentasPage';
import ProtectedRoute from './contexts/ProtectedRoute';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/changepassword" element={<ChangePasswordPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute element={DashboardPage} />} />
          <Route path="/ventas" element={<ProtectedRoute element={VentasPage} />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
