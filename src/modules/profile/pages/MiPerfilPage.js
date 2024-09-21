import React, { useEffect, useState, useContext, useCallback } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import withAuthorization from '../../../contexts/withAuthorization';
import './MiPerfil.css';

const MiPerfilPage = () => {
    const { token, userId } = useContext(UserContext);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [formValues, setFormValues] = useState({
        first_name: '',
        second_name: '',
        last_name: '',
        second_last_name: '',
        rut: '',
        email: '',
        phone_number: '',
        street: '',
        number: '',
        department_office_floor: '',
        sales_channel_id: '',
        company_id: '',
        region_id: '',
        commune_id: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        repeatPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);


    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener los datos del usuario');
            }

            const data = await response.json();
            const { user_id, status, must_change_password, created_at, updated_at, modified_by_user_id, ...filteredData } = data;

            setUserData(filteredData);
            setFormValues(filteredData);
        } catch (error) {
            setError(error.message);
        }
    }, [token]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const validatePassword = () => {
        const { newPassword, repeatPassword } = passwordData;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;

        if (!passwordRegex.test(newPassword)) {
            setPasswordError('La contraseña debe tener entre 8 y 20 caracteres, al menos una mayúscula, una minúscula y un número.');
            return false;
        }

        if (newPassword !== repeatPassword) {
            setPasswordError('Las contraseñas no coinciden.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:3001/api/users/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar los datos del usuario');
            }

            alert('Datos actualizados correctamente');
            await fetchUserData();
            setIsEditing(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (validatePassword()) {
            try {
                const response = await fetch(`http://localhost:3001/api/users/update/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password: passwordData.newPassword })
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar la contraseña');
                }

                alert('Contraseña actualizada correctamente');
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const handleCancel = () => {
        setFormValues(userData);
        setIsEditing(false);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userData) {
        return <div>Cargando datos del perfil...</div>;
    }
    
    return (
        <div className="mi-perfil-container">
            <h1>Mi Perfil</h1>
            <form onSubmit={handleSubmit}>
                <div className="user-details">
                    <p>
                        <strong>Nombre: </strong>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formValues.first_name}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="second_name"
                                    value={formValues.second_name}
                                    onChange={handleInputChange}
                                />
                            </>
                        ) : (
                            <span>{userData.first_name} {userData.second_name}</span>
                        )}
                    </p>
                    <p>
                        <strong>Apellidos: </strong>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formValues.last_name}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="second_last_name"
                                    value={formValues.second_last_name}
                                    onChange={handleInputChange}
                                />
                            </>
                        ) : (
                            <span>{userData.last_name} {userData.second_last_name}</span>
                        )}
                    </p>
                    <p><strong>RUT: </strong> {userData.rut}</p>
                    <p>
                        <strong>Email: </strong>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formValues.email}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <span>{userData.email}</span>
                        )}
                    </p>
                    <p>
                        <strong>Teléfono: </strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phone_number"
                                value={formValues.phone_number}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <span>{userData.phone_number}</span>
                        )}
                    </p>
                    <p>
                        <strong>Canal de Venta: </strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="sales_channel_id"
                                value={formValues.sales_channel_id}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <span>{userData.sales_channel_id}</span>
                        )}
                    </p>
                    <p>
                        <strong>Empresa: </strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="company_id"
                                value={formValues.company_id}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <span>{userData.company_id}</span>
                        )}
                    </p>
                    <p>
                        <strong>Región: </strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="region_id"
                                value={formValues.region_id}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <span>{userData.region_id}</span>
                        )}
                    </p>
                    <p>
                        <strong>Comuna: </strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="commune_id"
                                value={formValues.commune_id}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <span>{userData.commune_id}</span>
                        )}
                    </p>
                    <p>
                        <strong>Dirección: </strong>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    name="street"
                                    value={formValues.street}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="number"
                                    value={formValues.number}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="department_office_floor"
                                    value={formValues.department_office_floor}
                                    onChange={handleInputChange}
                                />
                            </>
                        ) : (
                            <span>{userData.street}, {userData.number}, {userData.department_office_floor}</span>
                        )}
                    </p>
                    <p><strong>Rol: </strong> {userData.role_id}</p>
                </div>

                {!isEditing ? (
                    <button type="button" onClick={() => setIsEditing(true)}>Editar Datos</button>
                ) : (
                    <>
                        <button type="submit">Guardar Cambios</button>
                        <button type="button" onClick={handleCancel}>Cancelar</button>
                    </>
                )}
            </form>

            <h2 className="mi-perfil-container__title">Cambiar Contraseña</h2>
            <form onSubmit={handlePasswordSubmit}>
                <p>
                    <label className="mi-perfil-container__label">Contraseña Actual: </label>
                    <div className="input-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                        <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            onClick={() => setShowPassword(!showPassword)}
                            className="toggle-password mi-perfil-container__icon"
                        />
                    </div>
                </p>
                <p>
                    <label className="mi-perfil-container__label">Nueva Contraseña: </label>
                    <div className="input-container">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                        <FontAwesomeIcon
                            icon={showNewPassword ? faEyeSlash : faEye}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="toggle-password mi-perfil-container__icon"
                        />
                    </div>
                </p>
                <p>
                    <label className="mi-perfil-container__label">Repetir Nueva Contraseña: </label>
                    <div className="input-container">
                        <input
                            type={showRepeatPassword ? 'text' : 'password'}
                            name="repeatPassword"
                            value={passwordData.repeatPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                        <FontAwesomeIcon
                            icon={showRepeatPassword ? faEyeSlash : faEye}
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                            className="toggle-password mi-perfil-container__icon"
                        />
                    </div>
                </p>
            </form>


        </div>
    );
};

export default withAuthorization(MiPerfilPage, [1, 2, 3, 4, 5, 6]);
