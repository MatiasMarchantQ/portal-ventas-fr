import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './Ventas.css';

const VentasPage = () => {
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

    console.log("role:" , roleId);

    fetchSales();
  }, [token, roleId, currentPage]);

  

  useEffect(() => {
    const filtered = sales.filter(sale => {
      const searchLower = searchTerm.toLowerCase();
      const idServicioMatch = sale.service_id && sale.service_id.toString() === searchTerm;
      const rutMatch = sale.client_rut && sale.client_rut === searchTerm;
      const nombreClienteMatch = sale.client_first_name && sale.client_last_name &&
        `${sale.client_first_name} ${sale.client_last_name}`.toLowerCase().includes(searchLower);
      const celularMatch = sale.client_phone && sale.client_phone.includes(searchTerm);
      const emailMatch = sale.client_email && sale.client_email === searchTerm;
      const calleMatch = sale.street && sale.street.toLowerCase().includes(searchLower);

      return idServicioMatch || rutMatch || nombreClienteMatch || celularMatch || emailMatch || calleMatch;
    });

    setFilteredSales(filtered);
  }, [searchTerm, sales]);

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
      </div>
      {filteredSales.length > 0 ? (
        <>
          <div className="sales-list">
            {filteredSales.map((sale) => (
              <div className="sale-card" key={sale.sale_id}>
                <div className="sale-card-header">
                  <p className="sale-status">{sale.sale_status_id}</p>
                  <div className="sale-info">
                    <div className="info-top">
                      {sale.service_id && <p className="info-item purple">{`ID Servicio: ${sale.service_id}`}</p>}
                      {sale.client_first_name && sale.client_last_name && <p className="info-item purple">{`Cliente: ${sale.client_first_name} ${sale.client_last_name}`}</p>}
                      {sale.client_rut && <p className="info-item purple">{`Rut: ${sale.client_rut}`}</p>}
                      {sale.client_phone && <p className="info-item purple">{`Celular: ${sale.client_phone}`}</p>}
                    </div>
                    <div className="info-bottom">
                      {sale.entry_date && <p className="info-item gray">{`Fecha: ${new Date(sale.entry_date).toLocaleDateString()}`}</p>}
                      {sale.sales_channel_id && <p className="info-item gray">{`Canal de venta: ${sale.sales_channel_id}`}</p>}
                      {sale.client_email && <p className="info-item gray">{`${sale.client_email}`}</p>}
                      {sale.region_id && <p className="info-item gray">{`Región ${sale.region_id}`}</p>}
                      {sale.commune_id && <p className="info-item gray">{`Comuna: ${sale.commune_id}`}</p>}
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
                      {sale.promotion_id && <p className="info-item gray">{`Promoción: ${sale.promotion_id}`}</p>}
                      {sale.installation_amount_id && <p className="info-item gray">{`Monto de instalación: ${sale.installation_amount_id}`}</p>}
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