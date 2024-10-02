import React, { useState, useEffect, useContext } from 'react';
import './RegistrarUsuario.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';

const RegistrarUsuarioPage = () => {
  const { token, roleId } = useContext(UserContext);
  
  const initialFormData = {
    first_name: '',
    last_name: '',
    rut: '',
    email: '',
    phone_number: '+56',
    company_id: '',
    region_id: '',
    commune_id: '',
    street: '',
    number: '',
    department_office_floor: '',
    sales_channel_id: '',
    role_id: '',
    status: 1,
    password: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [salesChannels, setSalesChannels] = useState([]);
  const [companyId, setCompanyId] = useState();
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await response.json();
        setCompanyId(userData.company_id);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, [token]);

  const fetchData = async (url, setData, errorMessage) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    await fetchData(`http://localhost:3001/api/communes/communes/${regionId}`, setCommunes, 'Error al obtener las comunas', headers);
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
    setMessage('');
  
    try {
      setFormData(prevState => ({
        ...prevState,
        phone_number: prevState.phone_number.replace('+56', ''),
        rut: prevState.rut.replace(/\./g, ''),
      }));
  
      const url = roleId === 2 ? 'http://localhost:3001/api/users/admin/register-user' : 'http://localhost:3001/api/users/register';
  
      const response = await fetch(url, {
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
  
      // Obtener el email y la contraseña del usuario registrado
      const userEmail = formData.email;
      const userPassword = formData.password;
  
      // Crear el mensaje de éxito con el email y la contraseña
      const successMessage = `Usuario registrado exitosamente! Email: ${userEmail} - Contraseña: ${userPassword}`;
  
      // Limpiar los inputs
      setFormData(initialFormData);
      setMessage(successMessage);
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

  const handleRutChange = (e) => {
    const rut = e.target.value.replace(/[^0-9]/g, '');
    if (rut.length === 9) {
      const formattedRut = `${rut.substring(0, 2)}.${rut.substring(2, 5)}.${rut.substring(5, 8)}-${rut.substring(8, 9)}`;
      setFormData(prevState => ({ ...prevState, rut: formattedRut }));
    } else {
      setFormData(prevState => ({ ...prevState, rut: rut }));
    }
  };

  return (
    <div className="registrar-usuario-page">
      <div className="registrar-usuario-form-box">
        <h2>Registrar Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <strong htmlFor="first_name">Nombres*</strong>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ingresa el primer, segundo y/o tercer nombre"
                required
              />
            </div>
            <div className="registrar-usuario-form-group">
              <strong htmlFor="second_last_name">Apellidos*</strong>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Ingresa el primer y segundo apellido"
                required
              />
            </div>
          </div>
          <div className="registrar-usuario-form-row">
            <div className="registrar-usuario-form-group">
              <strong htmlFor="rut">Rut*</strong>
              <input
                type="text"
                name="rut"
                id="rut"
                value={formData.rut}
                onChange={handleRutChange}
                placeholder="Ingresa el Rut"
                required
              />
            </div>
            <div className="registrar-usuario-form-group">
              <strong htmlFor="email">Correo electrónico*</strong>
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
              <strong htmlFor="phone_number">Número celular</strong>
              <input
                type="tel"
                name="phone_number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Ingresa el número celular"
              />
            </div>
            <div className="registrar-usuario-form-group">
            <strong htmlFor="company_id">Empresa</strong>
            <select
              name="company_id"
              id="company_id"
              value={roleId === 2 ? companyId : formData.company_id}
              onChange={handleChange}
              required
              disabled={roleId === 2} // Deshabilitar la selección solo si el rol es 2
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
              <strong htmlFor="region_id">Región:</strong>
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
              <strong htmlFor="commune_id">Comuna:</strong>
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
              <strong htmlFor="street">Calle/Avenida:</strong>
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
              <strong htmlFor="number">Número casa:</strong>
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
              <strong htmlFor="department_office_floor">Departamento/Oficina/Piso:</strong>
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
              <strong htmlFor="sales_channel_id">Canal de venta:</strong>
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
              <strong htmlFor="role_id">Rol:</strong>
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
                  <strong htmlFor="password">Contraseña nueva:</strong>
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
            <button type="submit" className="registrar-usuario-submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Nuevo Usuario'}
            </button>
            {message && <div style={{'margin-top': '2rem'}} className="message">{message}</div>}
          
        </form>
      </div>
    </div>
  );
};

export default withAuthorization(RegistrarUsuarioPage, [1, 2]);