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
    const [regions, setRegions] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [salesChannels, setSalesChannels] = useState([]);

    const fieldLabels = {
        first_name: 'Nombre',
        second_name: 'Segundo Nombre',
        last_name: 'Apellido',
        second_last_name: 'Segundo Apellido',
        email: 'Correo Electrónico',
        phone_number: 'Número de Teléfono',
        street: 'Calle',
        number: 'Número',
        department_office_floor: 'Departamento / Piso',
        region_id: 'Región',
        commune_id: 'Comuna',
        sales_channel_id: 'Canal de Venta',
    };

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al obtener los datos del usuario');
            const data = await response.json();
            const { user_id, ...filteredData } = data;

            setUserData(filteredData);
            setFormValues(filteredData);
        } catch (error) {
            setError(error.message);
        }
    }, [token]);

    const fetchRegions = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/regions/');
            if (!response.ok) throw new Error('Error al obtener las regiones');
            const data = await response.json();
            setRegions(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchSalesChannels = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/channels');
            if (!response.ok) throw new Error('Error al obtener los canales de venta');
            const data = await response.json();
            setSalesChannels(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchCommunes = async (regionId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/communes/communes/${regionId}`);
            if (!response.ok) throw new Error('Error al obtener las comunas');
            const data = await response.json();
            setCommunes(data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchRegions();
        fetchSalesChannels();
    }, [fetchUserData]);

    useEffect(() => {
        if (formValues.region_id) {
            fetchCommunes(formValues.region_id);
        }
    }, [formValues.region_id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value || '' }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value || '' }));
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

        setPasswordError(''); // Clear error if validation passes
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

            if (!response.ok) throw new Error('Error al actualizar los datos del usuario');
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

                if (!response.ok) throw new Error('Error al actualizar la contraseña');
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

    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>Cargando datos del perfil...</div>;

    return (
        <div className="mi-perfil-container">
            <h1>Mi Perfil</h1>
            <form onSubmit={handleSubmit}>
                <div className="user-details">
                    {['first_name', 'second_name', 'last_name', 'second_last_name', 'email', 'phone_number'].map((field, index) => (
                        <div className="user-info" key={index}>
                            <strong>{fieldLabels[field]}: </strong>
                            {isEditing ? (
                                <input
                                    type={field === 'email' ? 'email' : 'text'}
                                    name={field}
                                    value={formValues[field]}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <span>{userData[field]}</span>
                            )}
                        </div>
                    ))}
                    <div className="user-info">
                        <strong>{fieldLabels.street}: </strong>
                        {isEditing ? (
                            <div className="input-group">
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
                            </div>
                        ) : (
                            <span>{userData.street} {userData.number}, {userData.department_office_floor}</span>
                        )}
                    </div>
                    <div className="user-info">
                        <strong>{fieldLabels.region_id}: </strong>
                        {isEditing ? (
                            <select
                                name="region_id"
                                value={formValues.region_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Seleccione una región</option>
                                {regions.map(region => (
                                    <option key={region.region_id} value={region.region_id}>{region.region_name}</option>
                                ))}
                            </select>
                        ) : (
                            <span>{regions.find(r => r.region_id === userData.region_id)?.region_name}</span>
                        )}
                    </div>
                    <div className="user-info">
                        <strong>{fieldLabels.commune_id}: </strong>
                        {isEditing ? (
                            <select
                                name="commune_id"
                                value={formValues.commune_id}
                                onChange={handleInputChange}
                                disabled={!formValues.region_id}
                            >
                                <option value="">Seleccione una comuna</option>
                                {communes.map(commune => (
                                    <option key={commune.commune_id} value={commune.commune_id}>{commune.commune_name}</option>
                                ))}
                            </select>
                        ) : (
                            <span>{communes.find(c => c.commune_id === userData.commune_id)?.commune_name}</span>
                        )}
                    </div>
                    <div className="user-info">
                        <strong>{fieldLabels.sales_channel_id}: </strong>
                        <span>{salesChannels.find(c => c.channel_id === userData.sales_channel_id)?.channel_name}</span>
                    </div>
                </div>
                <div className="user-actions">
                    {!isEditing ? (
                        <button type="button" onClick={() => setIsEditing(true)}>Editar</button>
                    ) : (
                        <div>
                            <button type="submit">Guardar</button>
                            <button type="button" onClick={handleCancel}>Cancelar</button>
                        </div>
                    )}
                </div>
            </form>
            <div className="change-password">
                <form onSubmit={handlePasswordSubmit}>
                    <div className="password-section">
                        <h2>Cambiar Contraseña</h2>
                        {['currentPassword', 'newPassword', 'repeatPassword'].map((field, index) => (
                            <div className="input-container" key={index}>
                                <label htmlFor={field}>{field === 'currentPassword' ? 'Contraseña Actual' : field === 'newPassword' ? 'Nueva Contraseña' : 'Repetir Nueva Contraseña'}</label>
                                <input
                                    type={field === 'currentPassword' ? (showPassword ? 'text' : 'password') : field === 'newPassword' ? (showNewPassword ? 'text' : 'password') : (showRepeatPassword ? 'text' : 'password')}
                                    id={field}
                                    name={field}
                                    value={passwordData[field]}
                                    onChange={handlePasswordChange}
                                />
                                <FontAwesomeIcon
                                    icon={field === 'currentPassword' ? (showPassword ? faEyeSlash : faEye) : field === 'newPassword' ? (showNewPassword ? faEyeSlash : faEye) : (showRepeatPassword ? faEyeSlash : faEye)}
                                    className="toggle-password"
                                    onClick={() => {
                                        if (field === 'currentPassword') setShowPassword(!showPassword);
                                        else if (field === 'newPassword') setShowNewPassword(!showNewPassword);
                                        else setShowRepeatPassword(!showRepeatPassword);
                                    }}
                                />
                            </div>
                        ))}
                        <button type="submit">Actualizar Contraseña</button>
                        {passwordError && <div className="error">{passwordError}</div>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default withAuthorization(MiPerfilPage, [1, 2, 3, 4, 5, 6]);
