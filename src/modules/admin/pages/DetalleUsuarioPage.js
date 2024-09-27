import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './DetalleUsuario.css';

const DetalleUsuarioPage = ({ onBack, idUser }) => {
  const { token } = useContext(UserContext);
  const [editableFields, setEditableFields] = useState({
    first_name: '',
    second_name: '',
    last_name: '',
    second_last_name: '',
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
  const [isUpdated, setIsUpdated] = useState(false); // New state to track updates
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

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
        const [regionsResponse, companiesResponse, rolesResponse, channelsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/regions`),
          fetch(`${process.env.REACT_APP_API_URL}/companies`),
          fetch(`${process.env.REACT_APP_API_URL}/roles`),
          fetch(`${process.env.REACT_APP_API_URL}/channels`),
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
  }, []);

  // Fetch communes based on selected region
  useEffect(() => {
    if (!editableFields.region_id) return;

    const fetchCommunes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/communes/communes/${editableFields.region_id}`);
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
  }, [editableFields.region_id]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'sale_status_id' && value === '1') {
      setEditableFields(prev => ({ ...prev, sale_status_reason_id: '1' }));
    } else {
      setEditableFields(prev => ({
        ...prev,
        [name]: ['company_id', 'region_id', 'commune_id', 'sales_channel_id', 'role_id', 'status'].includes(name)
          ? (value === '' ? '' : Number(value))
          : value || ''  // Ensure the value is always a string
      }));
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const dataToSend = { ...editableFields };
      
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update/${idUser}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      console.log(dataToSend);
      if (response.ok) {
        setIsUpdated(true);
        alert('Usuario actualizado con éxito');
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
        value={editableFields[name] || ''} // Default to empty string
        onChange={handleInputChange}
        autoComplete={name === 'password' ? "off" : "on"} // Prevent autocomplete for password
      />
    </p>
  ), [editableFields, handleInputChange]);

  const renderSelect = useCallback((name, options, labelText) => (
    <p key={name}>
      <label className="detalle-usuario-label" htmlFor={name}>{labelText}:</label>
      <select
        className="detalle-usuario-value"
        id={name}
        name={name}
        value={editableFields[name] || ''} // Default to empty string
        onChange={handleInputChange}
      >
        <option value="">Seleccione {labelText.toLowerCase()}</option>
        {options && options.map(option => (
          <option key={option.id} value={option.id} selected={editableFields[name] === option.id.toString()}>
            {option.name}
          </option>
        ))}
      </select>
    </p>
  ), [editableFields, handleInputChange]);

  const formattedCompanies = useMemo(() => companies?.map(c => ({ id: c.company_id, name: c.company_name })), [companies]);
  const formattedRegions = useMemo(() => regions?.map(r => ({ id: r.region_id, name: r.region_name })), [regions]);
  const formattedCommunes = useMemo(() => communes?.map(c => ({ id: c.commune_id, name: c.commune_name })), [communes]);
  const formattedChannels = useMemo(() => channels?.map(c => ({ id: c.sales_channel_id, name: c.channel_name })), [channels]);
  const formattedRoles = useMemo(() => roles?.map(r => ({ id: r.role_id, name: r.role_name })), [roles]);

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
        <form onSubmit={handleSubmit} className="detalle-usuario-info">
          <div>
            {renderInput('first_name', 'text', 'Nombre')}
            {renderInput('second_name', 'text', 'Segundo nombre')}
            {renderInput('rut', 'text', 'RUT')}
            {renderInput('phone_number', 'text', 'Teléfono')}
            {renderSelect('company_id', formattedCompanies, 'Empresa')}
            {renderSelect('region_id', formattedRegions, 'Región')}
            {renderInput('street', 'text', 'Calle/Avenida')}
            {renderSelect('role_id', formattedRoles, 'Rol')}
          </div>
          <div>
            {renderInput('last_name', 'text', 'Apellido Paterno')}
            {renderInput('second_last_name', 'text', 'Apellido Materno')}
            {renderInput('email', 'email', 'Correo Electrónico')}
            {renderInput('number', 'text', 'Número')}
            {renderSelect('commune_id', formattedCommunes, 'Comuna')}
            {renderSelect('sales_channel_id', formattedChannels, 'Canal de Venta')}
            {renderInput('department_office_floor', 'text', 'Departamento/Oficina/Piso')}
            {renderInput('password', 'password', 'Contraseña')}
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