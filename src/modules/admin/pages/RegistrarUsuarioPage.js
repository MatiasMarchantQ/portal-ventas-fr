import React, { useState } from 'react';
import './RegistrarUsuario.css'; // Asegúrate de tener el archivo CSS con los estilos

const RegistrarUsuarioPage = () => {
  const [formData, setFormData] = useState({
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
    street: '',
    number: '',
    department_office_floor: '',
    sales_channel_id: '',
    role_id: '',
    status: 1,
    password: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error en el registro del usuario');
      }

      const result = await response.json();
      console.log('Usuario registrado:', result);
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
    }
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
                  <option value="">Seleccionar empresa</option>
                  {/* Agrega aquí las opciones de empresa */}
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
                  <option value="">Seleccionar región</option>
                  {/* Agrega aquí las opciones de región */}
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
                  <option value="">Seleccionar comuna</option>
                  {/* Agrega aquí las opciones de comuna */}
                </select>
              </div>
            </div>
            <div className="registrar-usuario-form-row">
              <div className="registrar-usuario-form-group">
                <label htmlFor="street">Calle/Avenida:</label>
                <input
                  type="text"
                  name="street"
                  id="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Ingresa la calle o avenida"
                  required
                />
              </div>
              <div className="registrar-usuario-form-group">
                <label htmlFor="number">Número Casa:</label>
                <input
                  type="number"
                  name="number"
                  id="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Ingresa el número de casa"
                  required
                />
              </div>
            </div>
            <div className="registrar-usuario-form-row">
              <div className="registrar-usuario-form-group">
                <label htmlFor="department_office_floor">Departamento/Oficina/Piso (Opcional):</label>
                <input
                  type="text"
                  name="department_office_floor"
                  id="department_office_floor"
                  value={formData.department_office_floor}
                  onChange={handleChange}
                  placeholder="Ingresa el departamento/oficina/piso"
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
                  <option value="">Seleccionar canal de venta</option>
                  {/* Agrega aquí las opciones de canal de venta */}
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
                  <option value="">Seleccionar rol</option>
                  {/* Agrega aquí las opciones de rol */}
                </select>
              </div>
              <div className="registrar-usuario-form-group checkbox-group">
                <label htmlFor="status">Habilitado:</label>
                <input
                  type="checkbox"
                  name="status"
                  id="status"
                  checked={formData.status === 1}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="registrar-usuario-form-row">
              <div className="registrar-usuario-form-group full-width">
                <label htmlFor="password">Contraseña nueva:</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa la contraseña"
                  required
                />
              </div>
            </div>
            <button type="submit" className="registrar-usuario-submit-button">
              Registrar Nuevo Usuario
            </button>
          </form>
        </div>
      </div>
  );
};

export default RegistrarUsuarioPage;
