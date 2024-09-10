import React, { useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './Register.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        rut: ''
    });

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div className="register-container">
            <Header />
            <div className="register-background">
                <div className="register-form">
                    <h2>Regístrate</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="form-row">
                                <div className="form-column">
                                    <label htmlFor="nombres">Nombres</label>
                                    <input type="text" id="nombres" name="nombres" placeholder="Escriba sus nombres" required />
                                </div>
                                <div className="form-column">
                                    <label htmlFor="apellidos">Apellidos</label>
                                    <input type="text" id="apellidos" name="apellidos" placeholder="Escriba sus apellidos" required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-column">
                                    <label htmlFor="rut">RUT</label>
                                    <input type="text" id="rut" name="rut" placeholder="12345678-3" value={formData.rut} required />
                                </div>
                                <div className="form-column">
                                    <label htmlFor="correo">Correo Electrónico</label>
                                    <input type="email" id="correo" name="correo" placeholder="Escriba su correo electrónico" required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-column">
                                    <label htmlFor="celular">Celular</label>
                                    <input type="tel" id="celular" name="celular" placeholder="+569" required />
                                </div>
                                <div className="form-column">
                                    <label htmlFor="empresa">Empresa</label>
                                    <select id="empresa" name="empresa" required>
                                        <option value="">Seleccione su empresa</option>
                         
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-column">
                                    <label htmlFor="region">Región</label>
                                    <select id="region" name="region" required>
                                        <option value="">Seleccione su región</option>
                                       
                                    </select>
                                </div>
                                <div className="form-column">
                                    <label htmlFor="comuna">Comuna</label>
                                    <select id="comuna" name="comuna" required>
                                        <option value="">Seleccione su comuna</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-column">
                                    <label htmlFor="calle">Calle o Avenida</label>
                                    <input type="text" id="calle" name="calle" placeholder="Escriba la calle o avenida" required />
                                </div>
                                <div className="form-column">
                                    <label htmlFor="numeroCasa">Número</label>
                                    <input type="text" id="numeroCasa" name="numeroCasa" placeholder="Escriba el número" required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-column">
                                    <label htmlFor="departamento">Departamento</label>
                                    <input type="text" id="departamento" name="departamento" placeholder="Ej: Depto 56, Piso 3" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-column">
                                    <label htmlFor="password">Contraseña</label>
                                    <input type="password" id="password" name="password" placeholder="Ingrese su contraseña" required />
                                </div>
                                <div className="form-column">
                                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Ingrese nuevamente su contraseña" required />
                                </div>
                            </div>
                            <div className="password-instructions-container">
                                <p className="password-instructions">
                                    Tu contraseña debe tener al menos:<br />
                                    x 8 caracteres (20 máx.)<br />
                                    x Letra y 1 número<br />
                                    x Carácter especial (como # ? ! $ & @)
                                </p>
                                <p className="confirm-password-instructions">
                                    Debe coincidir con la contraseña ingresada anteriormente
                                </p>
                            </div>
                            <button type="submit">Registrarme</button>
                        </div>
                    </form>
                    <p className="login-link">¿Ya tienes una cuenta? <a href="/">Inicia sesión</a></p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RegisterPage;
