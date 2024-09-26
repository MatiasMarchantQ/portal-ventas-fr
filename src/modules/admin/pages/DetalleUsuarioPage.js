import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './DetalleUsuario.css';

// Custom hook for data fetching with caching
const useCachedFetch = (url, options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const cachedData = sessionStorage.getItem(url);
        if (cachedData) {
          if (isMounted) {
            setData(JSON.parse(cachedData));
            setLoading(false);
          }
          return;
        }

        const response = await fetch(url, { ...options, signal });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (isMounted) {
          setData(result);
          sessionStorage.setItem(url, JSON.stringify(result));
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error('Fetch error:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
};

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
    password: ''
  });
  
  const [isEnabled, setIsEnabled] = useState(false);

  // Fetch user data
  const { data: userData, loading: userLoading, error: userError } = useCachedFetch(
    idUser ? `${process.env.REACT_APP_API_URL}/users/${idUser}` : null,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  // Fetch auxiliary data
  const { data: regions } = useCachedFetch(`${process.env.REACT_APP_API_URL}/regions`);
  const { data: companies } = useCachedFetch(`${process.env.REACT_APP_API_URL}/companies`);
  const { data: roles } = useCachedFetch(`${process.env.REACT_APP_API_URL}/roles`);
  const { data: channels } = useCachedFetch(`${process.env.REACT_APP_API_URL}/channels`);

  // Fetch communes based on selected region
  const { data: communes } = useCachedFetch(
    editableFields.region_id ? `${process.env.REACT_APP_API_URL}/communes/${editableFields.region_id}` : null
  );

  useEffect(() => {
    if (userData && userData.user) {
      setEditableFields(prevFields => ({
        ...prevFields,
        ...userData.user,
        company_id: userData.user.company?.company_id || '',
        region_id: userData.user.region?.region_id || '',
        commune_id: userData.user.commune?.commune_id || '',
        sales_channel_id: userData.user.salesChannel?.sales_channel_id || '',
        role_id: userData.user.role?.role_id || '',
      }));
      setIsEnabled(userData.user.status === 1);
    }
  }, [userData]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditableFields(prev => ({
      ...prev,
      [name]: ['company_id', 'region_id', 'commune_id', 'sales_channel_id', 'role_id'].includes(name)
        ? (value === '' ? '' : Number(value))
        : value || ''  // Ensure the value is always a string
    }));
  }, []);
  

  const handleCheckboxChange = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const dataToSend = { ...editableFields };
    if (dataToSend.password === '') {
      delete dataToSend.password; // Elimina la contraseña si está vacía
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
        value={editableFields[name]}
        onChange={handleInputChange}
      >
        <option value="">Seleccione {labelText.toLowerCase()}</option>
        {options && options.map(option => (
          <option key={option.id} value={option.id}>
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
            {renderInput('email', 'text', 'Email')}
            {renderInput('number', 'text', 'Número')}
            {renderSelect('commune_id', formattedCommunes, 'Comuna')}
            {renderSelect('sales_channel_id', formattedChannels, 'Canal de Venta')}
            {renderInput('department_office_floor', 'text', 'Piso/Departamento')}
            {renderInput('password', 'password', 'Contraseña')}
            <p>
              <label className="detalle-usuario-label">Estado:</label>
              <input type="checkbox" checked={isEnabled} onChange={handleCheckboxChange} />
            </p>
          </div>
          <button type="submit" className="detalle-usuario-button" id='update-user'>Actualizar Usuario</button>
        </form>
      </div>
    </div>
  );
};

export default withAuthorization(DetalleUsuarioPage, [1, 2]);