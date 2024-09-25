import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './DetalleUsuario.css';

// Hook personalizado para fetch de datos
const useFetch = (url, options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

const DetalleUsuarioPage = ({ userId, onBack }) => {
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

  // Fetch de datos del usuario
  const { data: userData, loading: userLoading } = useFetch(
    `http://localhost:3001/api/users/${userId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  // Fetch de datos auxiliares
  const { data: regions } = useFetch('http://localhost:3001/api/regions');
  const { data: companies } = useFetch('http://localhost:3001/api/companies');
  const { data: roles } = useFetch('http://localhost:3001/api/roles');
  const { data: channels } = useFetch('http://localhost:3001/api/channels');

  // Fetch de comunas basado en la región seleccionada
  const { data: communes } = useFetch(
    editableFields.region_id ? `http://localhost:3001/api/communes/communes/${editableFields.region_id}` : null
  );

  // Efecto para actualizar los campos editables cuando se cargan los datos del usuario
  useEffect(() => {
    if (userData && userData.user) {
      setEditableFields({
        first_name: userData.user.first_name || '',
        second_name: userData.user.second_name || '',
        last_name: userData.user.last_name || '',
        second_last_name: userData.user.second_last_name || '',
        rut: userData.user.rut || '',
        email: userData.user.email || '',
        phone_number: userData.user.phone_number || '',
        company_id: userData.user.company?.company_id || '',
        region_id: userData.user.region?.region_id || '',
        commune_id: userData.user.commune?.commune_id || '',
        sales_channel_id: userData.user.salesChannel?.sales_channel_id || '',
        street: userData.user.street || '',
        number: userData.user.number || '',
        department_office_floor: userData.user.department_office_floor || '',
        role_id: userData.user.role?.role_id || '',
        password: ''
      });
      setIsEnabled(userData.user.status === 1);
    }
  }, [userData]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditableFields(prev => ({
      ...prev,
      [name]: ['company_id', 'region_id', 'commune_id', 'sales_channel_id', 'role_id'].includes(name)
        ? (value === '' ? '' : Number(value))
        : value
    }));
  }, []);

  const handleCheckboxChange = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const dataToSend = { ...editableFields, status: isEnabled ? 1 : 0 };
    try {
      const response = await fetch(`http://localhost:3001/api/users/update/${userId}`, {
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
  }, [editableFields, isEnabled, userId, token]);

  const renderSelect = useCallback((name, options, labelText) => (
    <p>
      <label className="detalle-usuario-label">{labelText}:</label>
      <select
        className="detalle-usuario-value"
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

  const renderInput = useCallback((name, type, labelText) => (
    <p>
      <label className="detalle-usuario-label">{labelText}:</label>
      <input
        className="detalle-usuario-value"
        type={type}
        name={name}
        value={editableFields[name]}
        onChange={handleInputChange}
      />
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