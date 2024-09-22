import React, { useState, useEffect, useContext } from 'react';
//import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './Usuarios.css';

const UsuariosPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.example.com/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div className="usuarios-page">
      <h1>Lista de Usuarios</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>RUT</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Compañía</th>
            <th>Región</th>
            <th>Comuna</th>
            <th>Dirección</th>
            <th>Canal de Venta</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.first_name} {user.second_name}</td>
              <td>{user.last_name} {user.second_last_name}</td>
              <td>{user.rut}</td>
              <td>{user.email}</td>
              <td>{user.phone_number}</td>
              <td>{user.company_id}</td>
              <td>{user.region_id}</td>
              <td>{user.commune_id}</td>
              <td>{user.street} {user.number} {user.department_office_floor}</td>
              <td>{user.sales_channel_id}</td>
              <td>{user.role_id}</td>
              <td>{user.status === 1 ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p>Cargando...</p>}
    </div>
  );
};

export default withAuthorization(UsuariosPage, [1, 2]);