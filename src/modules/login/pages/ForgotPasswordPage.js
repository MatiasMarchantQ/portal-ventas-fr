import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './ChangePassword.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(null);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setEmailSent(null);
    const apiUrl = 'http://localhost:3001/api/auth/forgot-password';
    const formData = { email };

    if (!email) {
      setError('Por favor, ingrese un correo electrónico');
      setEmailSent(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Ingrese un correo electrónico válido');
      setEmailSent(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el correo electrónico.');
      }

      const data = await response.json();
      setMessage(data.message);
      setEmailSent(true);
      setError(null); // Limpia los errores si el correo fue enviado correctamente
    } catch (error) {
      console.error('Error sending email:', error.message);
      setError(error.message || 'No se pudo enviar el correo electrónico. Inténtalo de nuevo más tarde.');
      setEmailSent(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="left-section">
          <img src="images/poste-camioneta-ingbell.webp" alt="Ingbell" />
        </div>
        <div className="right-section">
          <div className="login-box">
            <h2>¿Olvidaste tu contraseña?</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {emailSent === true && (
                <div className="success-notification">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>{message || 'Correo electrónico enviado exitosamente!'}</span>
                </div>
              )}
              {emailSent === false && (
                <div className="error-notification">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>{error}</span>
                </div>
              )}
              {emailSent === null && (
                <div></div>
              )}
              <button
                type="submit"
                className="submit-button"
                disabled={emailSent === true}
              >
                Restablecer contraseña
              </button>
            </form>
            <p className="signup">
              <Link to="/" className="link-button">
                Volver al Inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
