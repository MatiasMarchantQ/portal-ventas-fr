import React, { useState, useEffect, useContext } from 'react';
import './RegistrarUsuario.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';

const RegistrarUsuarioPage = () => {
  const { token } = useContext(UserContext);
  
  const initialFormData = {
    first_name: '',
    second_name: '',
    last_name: '',
    second_last_name: '',
    rut: '',
    email: '',
    phone_number: '',
    company_id: null,
    region_id: null,
    commune_id: null,
    street: '',
    number: null,
    department_office_floor: '',
    sales_channel_id: null,
    role_id: null,
    status: 1,
    password: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [salesChannels, setSalesChannels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
    fetchRegions();
    fetchSalesChannels();
  }, []);

  useEffect(() => {
    fetchCommunes(formData.region_id);
  }, [formData.region_id]);

  const fetchData = async (url, setData, errorMessage) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(errorMessage);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(errorMessage, error);
    }
  };

  const fetchRoles = () => fetchData('http://localhost:3001/api/roles', setRoles, 'Error al obtener los roles');
  const fetchCompanies = () => fetchData('http://localhost:3001/api/companies', setCompanies, 'Error al obtener las empresas');
  const fetchRegions = () => fetchData('http://localhost:3001/api/regions', setRegions, 'Error al obtener las regiones');
  const fetchSalesChannels = () => fetchData('http://localhost:3001/api/channels', setSalesChannels, 'Error al obtener los canales de venta');

  const fetchCommunes = async (regionId) => {
    if (!regionId) {
      setCommunes([]);
      return;
    }
    await fetchData(`http://localhost:3001/api/communes/communes/${regionId}`, setCommunes, 'Error al obtener las comunas');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : (name === 'number' || name.endsWith('_id') ? parseInt(value) || null : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(''); // Reiniciar el mensaje antes de la nueva solicitud
  
    try {
      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en el registro del usuario: ${errorData.message || 'Error desconocido'}`);
      }
  
      const result = await response.json();
      console.log('Usuario registrado:', result);
      
      // Limpiar los inputs
      setFormData(initialFormData);
      setMessage('Usuario registrado exitosamente!');
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const length = Math.floor(Math.random() * (16 - 8 + 1)) + 8;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const all = upper + lower + numbers;

    let password = upper.charAt(Math.floor(Math.random() * upper.length)) +
                   lower.charAt(Math.floor(Math.random() * lower.length)) +
                   numbers.charAt(Math.floor(Math.random() * numbers.length));

    for (let i = 3; i < length; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handlePasswordGeneration = () => {
    const newPassword = generateRandomPassword();
    setFormData(prevState => ({
      ...prevState,
      password: newPassword,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <div className="registrar-usuario-page">
      <div className="registrar-usuario-form-box">
        <h2>Registrar Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="first_name">Primer Nombre:</label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ingresa el primer nombre"
                required
              />
            </div>
            <div className="registrar-usuario-form-group">
              <label htmlFor="second_name">Segundo Nombre:</label>
              <input
                type="text"
                name="second_name"
                id="second_name"
                value={formData.second_name}
                onChange={handleChange}
                placeholder="Ingresa el segundo nombre"
              />
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="last_name">Primer Apellido:</label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Ingresa el primer apellido"
                required
              />
            </div>
            <div className="registrar-usuario-form-group">
              <label htmlFor="second_last_name">Segundo Apellido:</label>
              <input
                type="text"
                name="second_last_name"
                id="second_last_name"
                value={formData.second_last_name}
                onChange={handleChange}
                placeholder="Ingresa el segundo apellido"
              />
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="rut">Rut:</label>
              <input
                type="text"
                name="rut"
                id="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="Ingresa el Rut"
                required
              />
            </div>
            <div className="registrar-usuario-form-group">
              <label htmlFor="email">Correo electrónico:</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa el correo electrónico"
                required
                className="auto-expand"
              />
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="phone_number">Número celular:</label>
              <input
                type="tel"
                name="phone_number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Ingresa el número celular"
                required
              />
            </div>
            <div className="registrar-usuario-form-group">
              <label htmlFor="company_id">Empresa:</label>
              <select
                name="company_id"
                id="company_id"
                value={formData.company_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una empresa</option>
                {companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="region_id">Región:</label>
              <select
                name="region_id"
                id="region_id"
                value={formData.region_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una región</option>
                {regions.map((region) => (
                  <option key={region.region_id} value={region.region_id}>
                    {region.region_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="registrar-usuario-form-group">
              <label htmlFor="commune_id">Comuna:</label>
              <select
                name="commune_id"
                id="commune_id"
                value={formData.commune_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una comuna</option>
                {communes.map((commune) => (
                  <option key={commune.commune_id} value={commune.commune_id}>
                    {commune.commune_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="street">Calle:</label>
              <input
                type="text"
                name="street"
                id="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Ingresa la calle"
                required
                className="auto-expand"
              />
            </div>
            <div className="registrar-usuario-form-group">
              <label htmlFor="number">Número:</label>
              <input
                type="text"
                name="number"
                id="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="Ingresa el número"
                required
              />
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="department_office_floor">Depto/Oficina/Piso:</label>
              <input
                type="text"
                name="department_office_floor"
                id="department_office_floor"
                value={formData.department_office_floor}
                onChange={handleChange}
                placeholder="Ingresa depto/oficina/piso"
                className="auto-expand"
              />
            </div>
            <div className="registrar-usuario-form-group">
              <label htmlFor="sales_channel_id">Canal de venta:</label>
              <select
                name="sales_channel_id"
                id="sales_channel_id"
                value={formData.sales_channel_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un canal de venta</option>
                {salesChannels.map((channel) => (
                  <option key={channel.sales_channel_id} value={channel.sales_channel_id}>
                    {channel.channel_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <label htmlFor="role_id">Rol:</label>
              <select
                name="role_id"
                id="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un rol</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="registrar-usuario-form-row">
                <div className="registrar-usuario-form-group full-width">
                  <label htmlFor="password">Contraseña nueva:</label>
                  <div className="password-container">
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ingresa la contraseña"
                      required
                    />
                    <FontAwesomeIcon
                      icon={faRandom}
                      className="password-random-icon"
                      onClick={handlePasswordGeneration}
                      title="Generar Contraseña Aleatoria"
                    />
                    <FontAwesomeIcon
                      icon={passwordVisible ? faEyeSlash : faEye}
                      className="password-visibility-icon"
                      onClick={togglePasswordVisibility}
                      title={passwordVisible ? "Ocultar Contraseña" : "Mostrar Contraseña"}
                    />
                  </div>
                </div>
              </div>
              {message && <div className="message">{message}</div>}
            <button type="submit" className="registrar-usuario-submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Nuevo Usuario'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default withAuthorization(RegistrarUsuarioPage, [1, 2]);