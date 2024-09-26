import React, { useState, useEffect, useContext, useCallback, lazy, Suspense } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './Usuarios.css';

const UserRow = lazy(() => import('./UserRow'));
const Pagination = lazy(() => import('./Pagination'));

const UsuariosPage = ({ onUserClick }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 18;

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users?page=${currentPage}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="usuarios-page">
      <h1>Lista de Usuarios</h1>
      <div className="table-container">
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
            <Suspense fallback={<tr><td colSpan="9">Cargando usuarios...</td></tr>}>
              {users.map(user => (
                <UserRow key={user.user_id} user={user} onUserClick={onUserClick} />
              ))}
            </Suspense>
          </tbody>
        </table>
      </div>
      {loading && <p className="loading">Cargando...</p>}
      <Suspense fallback={<div>Cargando paginación...</div>}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Suspense>
    </div>
  );
};

export default withAuthorization(UsuariosPage, [1, 2]);