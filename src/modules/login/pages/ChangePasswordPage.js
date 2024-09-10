import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './ChangePassword.css';

const ChangePasswordPage = () => {
    const handleSubmit = (event) => {
    }

    return (
        <div className="change-password-page">
            <Header />
            <div className="login-container">
                <div className="left-section">
                    <img src="images/poste-camioneta-ingbell.webp" alt="Ingbell" />
                </div>
                <div className="right-section">
                    <div className="login-box">
                        <h2>Cambiar contraseña</h2>
                        <div className="form-group">
                            <label htmlFor="new-password">Contraseña nueva</label>
                            <input type="password" id="new-password" />
                        </div>
                        <p className="password-instructions">
                            Tu contraseña debe tener al menos:<br />
                            x 8 caracteres (20 max.)<br />
                            x Mayúscula, minúscula y un número
                        </p>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Repetir contraseña</label>
                            <input type="password" id="confirm-password" />
                        </div>
                        <p className="password-instructions">
                            Debe coincidir con la contraseña ingresada anteriormente
                        </p>
                        <button className="submit-button">Cambiar contraseña</button>
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
