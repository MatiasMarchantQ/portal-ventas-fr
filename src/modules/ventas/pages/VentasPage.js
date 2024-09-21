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
  const limit = 18;

  useEffect(() => {
    // Verifica si el rol del usuario está en el conjunto de roles permitidos
    const allowedRoles = [1, 2, 3, 4, 5];
    if (!allowedRoles.includes(roleId)) {
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

        if (!response.ok) {
          throw new Error(`Error al obtener las ventas: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const cleanedSales = data.sales.map(cleanSaleData);
        setSales(cleanedSales);
        setFilteredSales(cleanedSales);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error en la solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [token, roleId, currentPage]);

  useEffect(() => {
  }, [searchTerm, token, limit]);

  const cleanSaleData = (sale) => {
    return {
      ...sale,
      service_id: sale.service_id && sale.service_id !== 'null' ? sale.service_id : null,
      client_first_name: sale.client_first_name && sale.client_first_name !== 'null' ? sale.client_first_name : null,
      client_last_name: sale.client_last_name && sale.client_last_name !== 'null' ? sale.client_last_name : null,
      client_rut: sale.client_rut && sale.client_rut !== 'null' ? sale.client_rut : null,
      client_phone: sale.client_phone && sale.client_phone !== 'null' ? sale.client_phone : null,
      client_email: sale.client_email && sale.client_email !== 'null' ? sale.client_email : null,
      region_id: sale.region_id && sale.region_id !== 'null' ? sale.region_id : null,
      commune_id: sale.commune_id && sale.commune_id !== 'null' ? sale.commune_id : null,
      street: sale.street && sale.street !== 'null' ? sale.street : null,
      number: sale.number && sale.number !== 'null' ? sale.number : null,
      department_office_floor: sale.department_office_floor && sale.department_office_floor !== 'null' && sale.department_office_floor.trim() !== '' ? sale.department_office_floor : null,
      additional_comments: sale.additional_comments && sale.additional_comments !== 'null' ? sale.additional_comments : null,
      geo_reference: sale.geo_reference && sale.geo_reference !== 'null' ? sale.geo_reference : null,
      promotion_id: sale.promotion_id && sale.promotion_id !== 'null' ? sale.promotion_id : null,
      installation_amount_id: sale.installation_amount_id && sale.installation_amount_id !== 'null' ? sale.installation_amount_id : null,
    };
  };

  if (loading) {
    return <div>Cargando ventas...</div>;
  }

  // Verifica nuevamente si el rol está en el conjunto permitido
  const allowedRoles = [1, 2, 3, 4, 5];
  if (!allowedRoles.includes(roleId)) {
    return <div>No tienes permiso para ver esta página.</div>;
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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

      if (!response.ok) {
        throw new Error(`Error al buscar ventas: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const cleanedSales = data.map(cleanSaleData);
      setFilteredSales(cleanedSales);
      setTotalPages(Math.ceil(cleanedSales.length / limit));
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredSales(sales);
    setCurrentPage(1);
    setTotalPages(Math.ceil(sales.length / limit));
  };
  

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSaleClick = (saleId) => {
    onSaleClick(saleId);  // Call the function passed from DashboardPage
  };

  const getStatusColor = (saleStatusId) => {
    return statusColors[saleStatusId] || '#ffffff'; // Blanco si no encuentra el estado
  };

  return (
    <div className="ventas-page">
      <h1>Ventas</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar ventas..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="search-button" onClick={handleSearchClick}>
          <FontAwesomeIcon icon={faSearch} />
          Buscar
        </button>
        {searchTerm && (
          <button className="clear-button" onClick={handleClearSearch}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
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
                      {sale.entry_date && <p className="info-item gray">{`Fecha de ingreso: ${new Date(sale.entry_date).toLocaleDateString()}`}</p>}
                      {sale.salesChannel && sale.salesChannel.channel_name && (
                        <p className="info-item gray">{`Canal de venta: ${sale.salesChannel.channel_name}`}</p>
                      )}
                      {sale.company?.company_name && <p className="info-item gray">{`${sale.company.company_name}`}</p>}
                      {sale.client_email && <p className="info-item gray">{`${sale.client_email}`}</p>}
                      {sale.region?.region_name && <p className="info-item gray">{`Región ${sale.region.region_name}`}</p>}
                      {sale.commune?.commune_name && <p className="info-item gray">{`Comuna ${sale.commune.commune_name}`}</p>}
                      {sale.street && sale.number && <p className="info-item gray">{`${sale.street} ${sale.number}${sale.department_office_floor && sale.department_office_floor.trim() ? ` ${sale.department_office_floor}` : ''}`}</p>}
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
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
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
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <div>No hay ventas disponibles.</div>
      )}
    </div>
  );
};

export default withAuthorization(VentasPage, [1, 2, 3, 4, 5]);

