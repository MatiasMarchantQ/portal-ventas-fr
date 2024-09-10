import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './Login.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleForgotPasswordClick = () => {
        // ...
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          console.log('Respuesta del servidor:', data); // Agregamos este console.log
          if (data.message === 'Login exitoso' && data.token) {
            // Autenticación exitosa, redirige al usuario a la página principal
            navigate('/dashboard');
          } else {
            setError(data.error);
          }
        } catch (error) {
          setError('Error de conexión');
        }
    };

    const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
        handleLogin(event);
    }
    };
    
    return (
    <div className="login-page">
        <Header />
        <div className="login-container">
        <div className="left-section">
            <img src="images\poste-camioneta-ingbell.webp" alt="Ingbell" />
        </div>
        <div className="right-section">
            <div className="login-box">
            <h2>Inicio de sesión</h2>
            <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)} onKeyPress={handleKeyPress} />
            </div>
            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input type="password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyPress={handleKeyPress} />
            </div>
            <div className="actions">
                <label className="remember-me">
                <input type="checkbox" /> Recuérdame
                </label>
                <Link to="/forgotpassword" className="link-button">
                ¿Olvidaste tu contraseña?
                </Link>
            </div>
            <button className="submit-button" onClick={handleLogin}>Iniciar sesión</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p className="signup">
                ¿Primera vez con nosotros? <Link to="/register" className="link-button">¡Únete como ejecutivo!</Link>
            </p>
            </div>
        </div>
        </div>
        <Footer />
    </div>
    );
};

export default LoginPage;