import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './modules/login/pages/LoginPage';
import RegisterPage from './modules/login/pages/RegisterPage';
import ForgotPasswordPage from './modules/login/pages/ForgotPasswordPage';
import ChangePasswordPage from './modules/login/pages/ChangePasswordPage';
import ResetPasswordPage from './modules/login/pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
        <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;