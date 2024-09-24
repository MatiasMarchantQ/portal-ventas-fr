import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import withAuthorization from '../../../contexts/withAuthorization';
import './Ventas.css';

const statusColors = {
  1: '#ffa500', // Ingresada - Naranja
  2: '#87ceeb', // Nueva - Azul cielo
  3: '#ffff00', // En revisión - Amarillo
  4: '#a3d300', // Corrección requerida - Citrón
  5: '#00008b', // Pendiente - Azul oscuro
  6: '#008000', // Activo - Verde
  7: '#ff0000', // Anulado - Rojo
};

const VentasPage = ({ onSaleClick }) => {
  const { token, roleId } = useContext(UserContext);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [originalTotalPages] = useState(1);

  const limit = 18;

  useEffect(() => {
    if (![1, 2, 3, 4, 5].includes(roleId)) {
      console.error('Acceso denegado: No tienes permisos para ver las ventas.');
      return;
    }

    const fetchSales = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/sales/all?page=${currentPage}&limit=${limit}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`Error al obtener las ventas: ${response.status} ${response.statusText}`);

        const { sales: fetchedSales, totalPages: fetchedTotalPages } = await response.json();
        const cleanedSales = fetchedSales.map(cleanSaleData);
        setSales(cleanedSales);
        setFilteredSales(cleanedSales);
        setTotalPages(fetchedTotalPages);
      } catch (error) {
        console.error('Error en la solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [token, roleId, currentPage]);

  const cleanSaleData = (sale) => {
    return Object.fromEntries(
      Object.entries(sale).map(([key, value]) => [key, value !== 'null' ? value : null])
    );
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchClick = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/sales/all/search?search=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Error al buscar ventas: ${response.status} ${response.statusText}`);

      const cleanedSales = await response.json();
      setFilteredSales(cleanedSales.map(cleanSaleData));
      setTotalPages(Math.ceil(cleanedSales.length / limit));
      setCurrentPage(1); // Reiniciar a la primera página en la búsqueda
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredSales(sales); // Vuelve a cargar la lista completa de ventas
    setTotalPages(originalTotalPages); // Resetear la paginación
    setCurrentPage(1); // Resetear la página actual
    window.location.href = '/dashboard';
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSaleClick = (saleId) => {
    onSaleClick(saleId);
  };

  const getStatusColor = (saleStatusId) => statusColors[saleStatusId] || '#ffffff';

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
          autoComplete="off" // O utiliza un valor específico
        />
        {searchTerm && (
          <button className="clear-button" onClick={handleClearSearch}>
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
            {filteredSales.map((sale) => (
              <div className="sale-card" key={sale.sale_id} onClick={() => handleSaleClick(sale.sale_id)}>
                <div className="sale-card-header">
                  <p className="sale-status" style={{ padding: 5, backgroundColor: getStatusColor(sale.sale_status_id), borderRadius: 5, textAlign: 'center' }}>
                    {sale.saleStatus ? sale.saleStatus.status_name : 'Estado no disponible'}
                  </p>
                  <div className="sale-info">
                    <div className="info-top">
                      {sale.service_id && <p className="info-item purple">{`ID Servicio: ${sale.service_id}`}</p>}
                      {sale.client_first_name && sale.client_last_name && <p className="info-item purple">{`Cliente: ${sale.client_first_name} ${sale.client_last_name}`}</p>}
                      {sale.client_rut && <p className="info-item purple">{`Rut: ${sale.client_rut}`}</p>}
                      {sale.client_phone && <p className="info-item purple">{`Celular: ${sale.client_phone}`}</p>}
                    </div>
                    <div className="info-bottom">
                      {sale.created_at && ( <p className="info-item gray"> Fecha de ingreso:{" "}{new Date(sale.created_at).toLocaleString("es-CL", {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", })}</p>)}
                      {sale.salesChannel?.channel_name && <p className="info-item gray">{`Canal de venta: ${sale.salesChannel.channel_name}`}</p>}
                      {sale.company?.company_name && <p className="info-item gray">{`${sale.company.company_name}`}</p>}
                      {sale.client_email && <p className="info-item gray">{`${sale.client_email}`}</p>}
                      {sale.region?.region_name && <p className="info-item gray">{`Región: ${sale.region.region_name}`}</p>}
                      {sale.commune?.commune_name && <p className="info-item gray">{`Comuna: ${sale.commune.commune_name}`}</p>}
                      {sale.street && sale.number && <p className="info-item gray">{`${sale.street} ${sale.number}${sale.department_office_floor ? ` ${sale.department_office_floor}` : ''}`}</p>}
                      {sale.additional_comments && <p className="info-item gray">{`Comentarios adicionales: ${sale.additional_comments}`}</p>}
                      {sale.geo_reference && (
                        <p className="info-item gray">
                          Geo referencia:
                          <a href={sale.geo_reference} target="_blank" rel="noopener noreferrer" className="info-item-link">
                            {` ${sale.geo_reference}`}
                          </a>
                        </p>
                      )}
                      {sale.promotion?.promotion && <p className="info-item gray">{`Promoción: ${sale.promotion.promotion}`}</p>}
                      {sale.installationAmount?.amount && <p className="info-item gray">{`Monto de instalación: ${sale.installationAmount.amount}`}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        </>
      ) : (
        <div>No se encontraron ventas.</div>
      )}
    </div>
  );
};

export default withAuthorization(VentasPage, [1, 2, 3, 4, 5]);
