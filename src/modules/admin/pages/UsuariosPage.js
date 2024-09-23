import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext'; // Asegúrate de importar el UserContext
import withAuthorization from '../../../contexts/withAuthorization';
import DetalleUsuarioPage from './DetalleUsuarioPage';
import './Usuarios.css';

const UsuariosPage = ({ onUserClick }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(UserContext);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 18;

  useEffect(() => {
    if (!token) return;

    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/users?page=${currentPage}&limit=${limit}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    }

    fetchUsers();
  }, [token, currentPage]); // El efecto se vuelve a ejecutar si el token o currentPage cambian

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setSelectedOption('Detalle Usuario');
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="usuarios-page">
      <h1>Lista de Usuarios</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>RUT</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Empresa</th>
            <th>Canal de Venta</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_id}>
              <td>{user.first_name} {user.second_name} {user.last_name} {user.second_last_name}</td>
              <td>{user.rut}</td>
              <td>{user.email}</td>
              <td>{user.phone_number}</td>
              <td>{user.company ? user.company.company_name : 'No Aplica'}</td>
              <td>{user.salesChannel ? user.salesChannel.channel_name : 'No Aplica'}</td>
              <td>{user.role ? user.role.role_name : 'No Aplica'}</td>
              <td>{user.status === 1 ? 'Activo' : 'Inactivo'}</td>
              <td>
              <button className='detalle-button' onClick={() => onUserClick(user.user_id)}>Ver Detalle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p>Cargando...</p>}
      <div className="pagination">
        <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default withAuthorization(UsuariosPage, [1, 2]);
