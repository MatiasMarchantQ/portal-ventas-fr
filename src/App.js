import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import LoginPage from './modules/login/pages/LoginPage';
import ForgotPasswordPage from './modules/login/pages/ForgotPasswordPage';
import ChangePasswordPage from './modules/login/pages/ChangePasswordPage';
import ResetPasswordPage from './modules/login/pages/ResetPasswordPage';
import DashboardPage from './modules/dashboard/pages/DashboardPage';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/changepassword" element={<ChangePasswordPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
