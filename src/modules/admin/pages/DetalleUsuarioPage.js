import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import withAuthorization from '../../../contexts/withAuthorization';
import './DetalleUsuario.css';

const DetalleUsuarioPage = ({ onBack, idUser }) => {
  const { token , roleId } = useContext(UserContext);
  const [editableFields, setEditableFields] = useState({
    first_name: '',
    last_name: '',
    rut: '',
    email: '',
    phone_number: '',
    company_id: '',
    region_id: '',
    commune_id: '',
    sales_channel_id: '',
    street: '',
    number: '',
    department_office_floor: '',
    role_id: '',
    password: '',
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para controlar la visibilidad de la contraseña

  // Fetch user data
  useEffect(() => {
    if (!idUser) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${idUser}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        setEditableFields(prevFields => ({
          ...prevFields,
          ...userData.user,
          company_id: userData.user.company_id,
          region_id: userData.user.region_id,
          commune_id: userData.user.commune_id,
          sales_channel_id: userData.user.sales_channel_id,
          role_id: userData.user.role_id,
        }));
        setIsEnabled(userData.user.status);
      } catch (error) {
        console.error('Fetch error:', error);
        setUserError(error.message);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [idUser, token]);

  // Fetch auxiliary data
  const [regions, setRegions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [communes, setCommunes] = useState([]);

  useEffect(() => {
    const fetchAuxiliaryData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [regionsResponse, companiesResponse, rolesResponse, channelsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/regions`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/companies`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/roles`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/channels`, { headers }),
        ]);

        if (!regionsResponse.ok || !companiesResponse.ok || !rolesResponse.ok || !channelsResponse.ok) {
          throw new Error('Error fetching auxiliary data');
        }

        const [regionsData, companiesData, rolesData, channelsData] = await Promise.all([
          regionsResponse.json(),
          companiesResponse.json(),
          rolesResponse.json(),
          channelsResponse.json(),
        ]);

        setRegions(regionsData);
        setCompanies(companiesData);
        setRoles(rolesData);
        setChannels(channelsData);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchAuxiliaryData();
  }, [token]);

  useEffect(() => {
    if (!editableFields.region_id) return;
  
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    const fetchCommunes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/communes/communes/${editableFields.region_id}`, {
          headers,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const communesData = await response.json();
        setCommunes(communesData);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
  
    fetchCommunes();
  }, [editableFields.region_id, token]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'sale_status_id' && value === '1') {
      setEditableFields(prev => ({ ...prev, sale_status_reason_id: '1' }));
    } else {
      setEditableFields(prev => ({
        ...prev,
        [name]: ['company_id', 'region_id', 'commune_id', 'sales_channel_id', 'role_id', 'status'].includes(name)
          ? (value === '' ? '' : Number(value))
          : value || ''
      }));
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const dataToSend = { ...editableFields };
  
    // Elimina la propiedad password si su valor es vacío
    if (dataToSend.password === '') {
      delete dataToSend.password;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update/${idUser}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        setIsUpdated(true);
      } else {
        alert('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar el usuario');
    }
  }, [editableFields, idUser, token]);

  const renderInput = useCallback((name, type, labelText) => (
    <p key={name}>
      <label className="detalle-usuario-label" htmlFor={name}>{labelText}:</label>
      <input
        className="detalle-usuario-value"
        id={name}
        type={type}
        name={name}
        value={editableFields[name] || ''}
        onChange={handleInputChange}
        autoComplete={name === 'password' ? "off" : "on"}
      />
    </p>
  ), [editableFields, handleInputChange]);

  const renderSelect = useCallback((name, options, labelText, disabled) => (
    <p key={name}>
      <label className="detalle-usuario-label" htmlFor={name}>{labelText}:</label>
      <select
        className="detalle-usuario-value"
        id={name}
        name={name}
        value={editableFields[name] || ''}
        onChange={handleInputChange}
        disabled={disabled}
      >
        <option value="">Seleccione {labelText.toLowerCase()}</option>
        {options && options.map(option => (
          <option key={option.id} value={option.id} selected={Number(editableFields[name]) === option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </p>
  ), [editableFields, handleInputChange]);

  const formattedCompanies = useMemo(() => {
    return companies ? companies.map(c => ({ id: c.company_id, name: c.company_name })) : [];
  }, [companies]);
  
  const formattedRegions = useMemo(() => {
    return regions ? regions.map(r => ({ id: r.region_id, name: r.region_name })) : [];
  }, [regions]);
  
  const formattedCommunes = useMemo(() => {
    return communes ? communes.map(c => ({ id: c.commune_id, name: c.commune_name })) : [];
  }, [communes]);
  
  const formattedChannels = useMemo(() => {
    return channels ? channels.map(c => ({ id: c.sales_channel_id, name: c.channel_name })) : [];
  }, [channels]);
  
  const formattedRoles = useMemo(() => {
    return roles ? roles.map(r => ({ id: r.role_id, name: r.role_name })) : [];
  }, [roles]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  if (userLoading) {
    return <div>Cargando...</div>;
  }

  if (userError) {
    return <div>Error: {userError}</div>;
  }

  return (
    <div className="detalle-usuario-page">
      <button className="detalle-usuario-button" onClick={onBack}>Volver a atrás</button>
      <div className="detalle-usuario-container">
        <h1 className="detalle-usuario-header">Detalle de Usuario</h1>
        <form onSubmit={handleSubmit} className="detalle-usuario-info" autoComplete="off">
          <div>
            {renderInput('first_name', 'text', 'Nombre')}
            {renderInput('rut', 'text', 'RUT')}
            {renderInput('phone_number', 'text', 'Teléfono')}
            {renderSelect('region_id', formattedRegions, 'Región')}
            {renderInput('street', 'text', 'Calle/Avenida')}
            {renderInput('department_office_floor', 'text', 'Departamento/Oficina/Piso')}
            {renderSelect('role_id', formattedRoles, 'Rol')}
            {renderSelect('status', [
              { id: 1, name: 'Activo' },
              { id: 0, name: 'Inactivo' },
            ], 'Estado')}
          </ div>
          <div>
            {renderInput('last_name', 'text', 'Apellido Paterno')}
            {renderInput('email', 'email', 'Correo Electrónico')}
            {renderSelect('company_id', formattedCompanies, 'Empresa', roleId === 2)}            {renderSelect('commune_id', formattedCommunes, 'Comuna')}
            {renderInput('number', 'text', 'Número')}
            {renderSelect('sales_channel_id', formattedChannels, 'Canal de Venta')}
            <div style={{ marginBottom: '6.3rem' }} />
            <div className='password-section'>
              <label className="detalle-usuario-label" htmlFor="password">Contraseña:</label>
              <div className="password-input-container">
                <input
                  className="detalle-usuario-value"
                  id="password"
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  value={editableFields.password || ''}
                  onChange={handleInputChange}
                  autoComplete="off"
                  autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
                <button type="button" onClick={togglePasswordVisibility} className="password-visibility-button">
                  <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>
          <button className="detalle-usuario-submit" type="submit" disabled={isUpdated}>
            {isUpdated ? 'Actualizado' : 'Actualizar Usuario'}
          </button>
        </form>
        {isUpdated && <div className="update-confirmation">Usuario actualizado con éxito!</div>}
      </div>
    </div>
  );
};

export default withAuthorization(DetalleUsuarioPage, [1, 2]);