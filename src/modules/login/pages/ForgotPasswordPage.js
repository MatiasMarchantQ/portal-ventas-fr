import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './ChangePassword.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const apiUrl = 'http://localhost:3001/api/auth/forgot-password';
    const formData = { email };

    if (!email) {
      setError('Por favor, ingrese un correo electrónico válido');
      return;
    }

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then((response) => response.json())
    .then((data) => {
      setMessage(data.message);
    })
    .catch((error) => {
      setError(error.message);
    });
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
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <button type="submit" className="submit-button">
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