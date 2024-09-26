import React, { useEffect, useState, useContext, useCallback, lazy, Suspense } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import withAuthorization from '../../../contexts/withAuthorization';
import './Ventas.css';

const STATUS_COLORS = {
  1: '#ffa500', 2: '#87ceeb', 3: '#ffff00', 4: '#a3d300', 5: '#4169E1', 6: '#008000', 7: '#ff0000',
};

const ITEMS_PER_PAGE = 18;

// Lazy load components
const SaleCard = lazy(() => import('./SaleCard'));
const Pagination = lazy(() => import('./Pagination'));

const VentasPage = ({ onSaleClick }) => {
  const { token, roleId } = useContext(UserContext);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [originalTotalPages, setOriginalTotalPages] = useState(1);

  const cleanSaleData = useCallback((sale) => (
    Object.fromEntries(Object.entries(sale).map(([key, value]) => [key, value !== 'null' ? value : null]))
  ), []);

  const fetchSales = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/all?page=${page}&limit=${ITEMS_PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Error al obtener las ventas: ${response.status} ${response.statusText}`);

      const { sales: fetchedSales, totalPages: fetchedTotalPages } = await response.json();
      const cleanedSales = fetchedSales.map(cleanSaleData);
      setSales(cleanedSales);
      setFilteredSales(cleanedSales);
      setTotalPages(fetchedTotalPages);
      setOriginalTotalPages(fetchedTotalPages);
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      setLoading(false);
    }
  }, [token, cleanSaleData]);

  useEffect(() => {
    if (![1, 2, 3, 4, 5].includes(roleId)) {
      console.error('Acceso denegado: No tienes permisos para ver las ventas.');
      return;
    }
    fetchSales(currentPage);
  }, [fetchSales, roleId, currentPage]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchClick = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/all/search?search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token.substring(0, 100)}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Error al buscar ventas: ${response.status} ${response.statusText}`);

      const cleanedSales = await response.json();
      setFilteredSales(cleanedSales.map(cleanSaleData));
      setTotalPages(Math.ceil(cleanedSales.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, cleanSaleData]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setFilteredSales(sales);
    setTotalPages(originalTotalPages);
    setCurrentPage(1);
    fetchSales(1);
  }, [sales, originalTotalPages, fetchSales]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (searchTerm === '') {
        fetchSales(newPage);
      }
    }
  };

  if (loading) return <div>Cargando ventas...</div>;

  return (
    <div className="ventas-page">
      <h1>Ventas</h1>
      <div className="search-bar">
        <label htmlFor="search-input" className="visually-hidden"></label>
        <input
          type="text"
          id="search-input"
          name="search"
          placeholder="Buscar ventas..."
          value={searchTerm}
          onChange={handleSearchChange}
          autoComplete="off"
        />
        {searchTerm && (
          <button className="clear-button" onClick={handleClearSearch} aria-label="Limpiar búsqueda">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
        <button className="search-button" onClick={handleSearchClick}>
          <FontAwesomeIcon icon={faSearch} />
          Buscar
        </button>
      </div>
      {filteredSales.length > 0 ? (
        <>
          <div className="sales-list">
            <Suspense fallback={<div>Cargando tarjetas de venta...</div>}>
              {filteredSales.map((sale) => (
                <SaleCard
                  key={sale.sale_id}
                  sale={sale}
                  onSaleClick={onSaleClick}
                  getStatusColor={getStatusColor}
                />
              ))}
            </Suspense>
          </div>
          <Suspense fallback={<div>Cargando paginación...</div>}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </Suspense>
        </>
      ) : (
        <div>No se encontraron ventas.</div>
      )}
    </div>
  );
};

const getStatusColor = (saleStatusId) => STATUS_COLORS[saleStatusId] || '#ffffff';

export default withAuthorization(VentasPage, [1, 2, 3, 4, 5]);