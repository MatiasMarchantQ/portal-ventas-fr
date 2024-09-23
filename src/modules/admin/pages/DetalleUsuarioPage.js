import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './DetalleUsuario.css';

const DetalleUsuarioPage = ({ userId, onBack }) => {
  const { token } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
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
    sale_channel_id: '',
    street: '',
    number: '',
    department_office_floor: '',
    role_id: '',
    password: ''
  });

  const [originalFields, setOriginalFields] = useState({});
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, regionsResponse, companiesResponse, rolesResponse, channelsResponse] = await Promise.all([
          fetch(`http://localhost:3001/api/users/${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch('http://localhost:3001/api/regions'),
          fetch('http://localhost:3001/api/companies'),
          fetch('http://localhost:3001/api/roles'),
          fetch('http://localhost:3001/api/channels')
        ]);

        const userData = await userResponse.json();
        const regionsData = await regionsResponse.json();
        const companiesData = await companiesResponse.json();
        const rolesData = await rolesResponse.json();
        const channelsData = await channelsResponse.json();

        // Establece los datos del usuario y el estado habilitado
        setUser(userData.user);
        setIsEnabled(userData.user.status === 1);

        // Establece los campos editables con los valores del usuario
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
          sale_channel_id: userData.user.salesChannel?.sales_channel_id || '',
          street: userData.user.street || '',
          number: userData.user.number || '',
          department_office_floor: userData.user.department_office_floor || '',
          role_id: userData.user.role?.role_id || '',
          password: ''
        });

        setOriginalFields({ ...editableFields }); // Almacena campos originales

        setRegions(regionsData);
        setCompanies(companiesData);
        setRoles(rolesData);
        setChannels(channelsData);

        // Fetch communes if region_id is available
        if (userData.user.region?.region_id) {
          const communesResponse = await fetch(`http://localhost:3001/api/communes/communes/${userData.user.region.region_id}`);
          const communesData = await communesResponse.json();
          setCommunes(communesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);

  useEffect(() => {
    const fetchCommunes = async () => {
      if (editableFields.region_id) {
        try {
          const response = await fetch(`http://localhost:3001/api/communes/communes/${editableFields.region_id}`);
          const data = await response.json();
          setCommunes(data);
        } catch (error) {
          console.error('Error fetching communes:', error);
        }
      }
    };

    fetchCommunes();
  }, [editableFields.region_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFields(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = () => {
    setIsEnabled(!isEnabled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {};
    Object.keys(editableFields).forEach((key) => {
      if (editableFields[key] !== originalFields[key]) {
        dataToSend[key] = editableFields[key];
      }
    });
    dataToSend.status = isEnabled ? 1 : 0;

    console.log('Data sent to PUT request:', dataToSend); // Console log del payload

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
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="detalle-usuario-page">
      <div className="detalle-usuario-container">
        <h1 className="detalle-usuario-header">Detalle de Usuario</h1>
        <button className="detalle-usuario-button" onClick={onBack}>Volver a Usuarios</button>
        <form onSubmit={handleSubmit} className="detalle-usuario-info">
          {/* Primera columna */}
          <div>
            <p>
              <label className="detalle-usuario-label">Nombre:</label>
              <input className="detalle-usuario-value" type="text" name="first_name" value={editableFields.first_name} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Segundo nombre:</label>
              <input className="detalle-usuario-value" type="text" name="second_name" value={editableFields.second_name} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">RUT:</label>
              <input className="detalle-usuario-value" type="text" name="rut" value={editableFields.rut} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Teléfono:</label>
              <input className="detalle-usuario-value" type="text" name="phone_number" value={editableFields.phone_number} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Empresa:</label>
              <select className="detalle-usuario-value" name="company_id" value={editableFields.company_id} onChange={handleInputChange}>
                <option value="">Seleccione una empresa</option>
                {companies && companies.map(company => (
                  <option key={company.company_id} value={company.company_id}>{company.company_name}</option>
                ))}
              </select>
            </p>
            <p>
              <label className="detalle-usuario-label">Región:</label>
              <select className="detalle-usuario-value" name="region_id" value={editableFields.region_id} onChange={handleInputChange}>
                <option value="">Seleccione una región</option>
                {regions && regions.map(region => (
                  <option key={region.region_id} value={region.region_id}>{region.region_name}</option>
                ))}
              </select>
            </p>
            <p>
              <label className="detalle-usuario-label">Calle/Avenida:</label>
              <input className="detalle-usuario-value" type="text" name="street" value={editableFields.street} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Rol:</label>
              <select className="detalle-usuario-value" name="role_id" value={editableFields.role_id} onChange={handleInputChange}>
                <option value="">Seleccione un rol</option>
                {roles && roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                ))}
              </select>
            </p>
          </div>
          {/* Segunda columna */}
          <div>
            <p>
              <label className="detalle-usuario-label">Apellido Paterno:</label>
              <input className="detalle-usuario-value" type="text" name="last_name" value={editableFields.last_name} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Apellido Materno:</label>
              <input className="detalle-usuario-value" type="text" name="second_last_name" value={editableFields.second_last_name} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Email:</label>
              <input className="detalle-usuario-value" type="text" name="email" value={editableFields.email} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Número:</label>
              <input className="detalle-usuario-value" type="text" name="number" value={editableFields.number} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Comuna:</label>
              <select className="detalle-usuario-value" name="commune_id" value={editableFields.commune_id} onChange={handleInputChange}>
                <option value="">Seleccione una comuna</option>
                {communes && communes.map(commune => (
                  <option key={commune.commune_id} value={commune.commune_id}>{commune.commune_name}</option>
                ))}
              </select>
            </p>
            <p>
              <label className="detalle-usuario-label">Canal de Venta:</label>
              <select className="detalle-usuario-value" name="sale_channel_id" value={editableFields.sale_channel_id} onChange={handleInputChange}>
                <option value="">Seleccione un canal</option>
                {channels && channels.map(channel => (
                  <option key={channel.sales_channel_id} value={channel.sales_channel_id}>{channel.channel_name}</option>
                ))}
              </select>
            </p>
            <p>
              <label className="detalle-usuario-label">Piso/Departamento:</label>
              <input className="detalle-usuario-value" type="text" name="department_office_floor" value={editableFields.department_office_floor} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Contraseña:</label>
              <input className="detalle-usuario-value" type="password" name="password" value={editableFields.password} onChange={handleInputChange} />
            </p>
            <p>
              <label className="detalle-usuario-label">Estado:</label>
              <input type="checkbox" checked={isEnabled} onChange={handleCheckboxChange} />
            </p>
          </div>
          <button type="submit" className="detalle-usuario-button">Actualizar Usuario</button>
        </form>
      </div>
    </div>
  );
};

export default withAuthorization(DetalleUsuarioPage, [1, 2]);