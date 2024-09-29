import React, { useState, useEffect, useContext, useCallback, lazy, Suspense } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
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

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [salesChannels, setSalesChannels] = useState([]);
  const [roles, setRoles] = useState([]);

  const [filters, setFilters] = useState({
    company_id: '',
    sales_channel_id: '',
    role_id: '',
    status: ''
  });

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      }).toString();

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users?${queryParams}`, {
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
  }, [token, currentPage, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    // Fetch companies, sales channels, and roles for filters
    const fetchFilterData = async () => {
      try {
        const [companiesRes, channelsRes, rolesRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/companies`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.REACT_APP_API_URL}/channels`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.REACT_APP_API_URL}/roles`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const [companiesData, channelsData, rolesData] = await Promise.all([
          companiesRes.json(),
          channelsRes.json(),
          rolesRes.json()
        ]);

        setCompanies(companiesData);
        setSalesChannels(channelsData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, [token]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const clearFilters = () => {
    setFilters({
      company_id: '',
      sales_channel_id: '',
      role_id: '',
      status: ''
    });
    setCurrentPage(1);
    fetchUsers();
  };

  return (
    <div className="usuarios-page">
      <h1>Lista de Usuarios</h1>
      
      <div className="filter-section">
        <button className="filter-button" onClick={() => setIsFilterVisible(!isFilterVisible)}>
          <FontAwesomeIcon icon={faFilter} /> Filtros
        </button>

        {isFilterVisible && (
          <div className="filters">
            <select name="company_id" value={filters.company_id} onChange={handleFilterChange}>
              <option value="">Todas las empresas</option>
              {companies.map(company => (
                <option key={company.company_id} value={company.company_id}>{company.company_name}</option>
              ))}
            </select>

            <select name="sales_channel_id" value={filters.sales_channel_id} onChange={handleFilterChange}>
              <option value="">Todos los canales de venta</option>
              {salesChannels.map(channel => (
                <option key={channel.sales_channel_id} value={channel.sales_channel_id}>{channel.channel_name}</option>
              ))}
            </select>

            <select name="role_id" value={filters.role_id} onChange={handleFilterChange}>
              <option value="">Todos los roles</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
              ))}
            </select>

            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Todos los estados</option>
              <option value='1'>Activo</option>
              <option value='0'>Inactivo</option>
            </select>

            <button onClick={applyFilters}>Aplicar filtros</button>
            <button onClick={clearFilters}>
              <FontAwesomeIcon icon={faTimes} /> Limpiar filtros
            </button>
          </div>
        )}
      </div>

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