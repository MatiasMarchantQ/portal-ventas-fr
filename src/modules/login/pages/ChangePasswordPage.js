import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom'; // Usamos useParams para capturar el token
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './ChangePassword.css';

const ChangePasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { token } = useParams(); // Captura el token de la URL

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validar la longitud y fortaleza de la contraseña
        if (password.length < 8 || password.length > 20) {
            setError('La contraseña debe tener entre 8 y 20 caracteres.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/changepassword/${token}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password, confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Contraseña actualizada con éxito');
                setError('');
                // Redirigir después de unos segundos al dashboard o página de login
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(data.message || 'Error al actualizar la contraseña');
                setSuccess('');
            }
        } catch (err) {
            console.error('Error en el servidor:', err);
            setError('Error del servidor');
            setSuccess('');
        }
    };

    return (
        <div className="change-password-page">
            <Header />
            <div className="login-container">
                <div className="left-section">
                    <img src="/images/poste-camioneta-ingbell.webp" alt="Ingbell" />
                </div>
                <div className="right-section">
                    <div className="login-box">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="new-password">Contraseña nueva</label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="password-instructions">
                                Tu contraseña debe tener al menos:<br />
                                8 caracteres (20 max.)<br />
                                1 Mayúscula, minúscula y un número
                            </p>
                            <div className="form-group">
                                <label htmlFor="confirm-password">Repetir contraseña</label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="password-instructions">
                                Debe coincidir con la contraseña ingresada anteriormente
                            </p>
                            <button className="submit-button" type="submit">
                                Cambiar contraseña
                            </button>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">{success}</p>}
                        </form>
                        <p className="go-back">
                            <Link to="/" className="link-button">Volver al Inicio</Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ChangePasswordPage;
