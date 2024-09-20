import React, { useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './ResetPassword.css'

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState({ password: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    let errorMessage = '';
    if (password.length < 8 || password.length > 20) {
      errorMessage = 'La contraseña debe tener entre 8 y 20 caracteres';
    } else if (!/[A-Z]/.test(password)) {
      errorMessage = 'La contraseña debe contener al menos una letra mayúscula';
    } else if (!/[a-z]/.test(password)) {
      errorMessage = 'La contraseña debe contener al menos una letra minúscula';
    } else if (!/\d/.test(password)) {
      errorMessage = 'La contraseña debe contener al menos un número';
    }
    return errorMessage;
  };

  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
  
    const hasMinLength = passwordValue.length >= 8 && passwordValue.length <= 20;
    const hasUppercase = /[A-Z]/.test(passwordValue);
    const hasLowercase = /[a-z]/.test(passwordValue);
    const hasNumber = /\d/.test(passwordValue);
  
    setPasswordRequirements({
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
    });
  
    if (hasMinLength && hasUppercase && hasLowercase && hasNumber) {
      setError({ ...error, password: '' });
    }
  };
  

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const tokenExpirationDate = tokenPayload.exp * 1000;
    const currentTime = new Date().getTime();
  
    if (currentTime > tokenExpirationDate) {
      setError({ ...error, global: 'El tiempo de reseteo de contraseña ha expirado' });
      return;
    }
  
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError({ ...error, password: passwordError });
      return;
    }

    if (password !== confirmPassword) {
      setError({ ...error, confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    const apiUrl = `http://localhost:3001/api/auth/reset-password/${token}`;
    const formData = { password, confirmPassword };
  
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        setError({ ...error, global: error.message });
      });
  };

  const handleGoToHome = () => {
    const newPath = location.pathname.replace(`/${token}`, '');
    navigate(newPath, { replace: true });
  };

  return (
    <div className="reset-password-page">
      <Header />
      <div className="login-container">
        <div className="left-section">
          <img src="https://ibinternet.cl/wp-content/uploads/2023/05/WhatsApp-Image-2023-04-17-at-11.35.50-AM-1536x864.jpeg" alt="Ingbell" />
        </div>
        <div className="right-section">
          <div className="login-box">
            <h2>Cambiar contraseña</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Contraseña nueva</label>
                <div className="input-container">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className={error.password ? 'error-input' : ''}
                  />
                  <span className="password-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                  </span>
                </div>
                {error.password && (
                  <p className="error-message">
                    <FontAwesomeIcon icon={faExclamationCircle} /> {error.password}
                  </p>
                )}
                <p>Tu contraseña debe tener al menos:</p>
                <ul style={{ listStyle: 'none' }}>
                  <li>
                    <FontAwesomeIcon icon={passwordRequirements.hasMinLength ? faCheckCircle : faExclamationCircle} />
                    <span style={{ marginLeft: '10px' }}>8 caracteres (20 max.)</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={passwordRequirements.hasUppercase && passwordRequirements.hasLowercase && passwordRequirements.hasNumber ? faCheckCircle : faExclamationCircle} />
                    <span style={{ marginLeft: '10px' }}>Mayúscula, minúscula y un número</span>
                  </li>
                </ul>
              </div>
  
              <div className="form-group">
                <label>Repetir contraseña</label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className={error.confirmPassword ? 'error-input' : ''}
                  />
                  <span className="password-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                  </span>
                </div>
                {error.confirmPassword && (
                  <p className="error-message">
                    <FontAwesomeIcon icon={faExclamationCircle} /> {error.confirmPassword}
                  </p>
                )}
              </div>
  
              {message && (
                <p className="success-message">
                  <FontAwesomeIcon icon={faCheckCircle} /> {message}
                </p>
              )}
  
              <button type="submit" className="submit-button">
                Cambiar contraseña
              </button>
            </form>
            <p className="signup">
              <Link to="/" onClick={handleGoToHome} className="link-button">
                Ir al Inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;