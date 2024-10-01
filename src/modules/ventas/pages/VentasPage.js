import React, { useEffect, useState, useContext, useCallback, lazy, Suspense } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import withAuthorization from '../../../contexts/withAuthorization';
import './Ventas.css';

const SaleCard = lazy(() => import('./SaleCard'));
const Pagination = lazy(() => import('./Pagination'));

const ITEMS_PER_PAGE = 30;
const STATUS_COLORS = { 1: '#ffa500', 2: '#87ceeb', 3: '#ffff00', 4: '#a3d300', 5: '#4169E1', 6: '#008000', 7: '#ff0000' };

const VentasPage = ({ onSaleClick }) => {
  const { token, roleId } = useContext(UserContext);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Listados de los select
  const [salesChannels, setSalesChannels] = useState([]);
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [installationAmounts, setInstallationAmounts] = useState([]);
  const [saleStatuses, setSaleStatuses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('');


  const [selectedSalesChannel, setSelectedSalesChannel] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedInstallationAmount, setSelectedInstallationAmount] = useState('');
  const [selectedSaleStatus, setSelectedSaleStatus] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const [filters, setFilters] = useState({
    sales_channel_id: '',
    region_id: '',
    commune_id: '',
    promotion_id: '',
    installation_amount_id: '',
    sale_status_id: '',
    company_id: '',
  });
  
  const [originalFilters, setOriginalFilters] = useState({
    sales_channel_id: '',
    region_id: '',
    commune_id: '',
    promotion_id: '',
    installation_amount_id: '',
    sale_status_id: '',
    company_id: '',
  });
  
  const cleanSaleData = useCallback(sale => Object.fromEntries(Object.entries(sale).map(([key, value]) => [key, value !== 'null' ? value : null])), []);

  const fetchSales = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const filtersWithDates = {
        ...filters,
        start_date: startDate,
        end_date: endDate,
      };
  
      const filteredParams = Object.entries(filtersWithDates)
        .filter(([key, value]) => value !== undefined && value !== '')
        .concat([
          ['page', page],
          ['limit', ITEMS_PER_PAGE],
        ]);
  
      const queryString = new URLSearchParams(filteredParams).toString();
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/all?${queryString}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) throw new Error(`Error fetching sales: ${response.status} ${response.statusText}`);
      console.log('Q', queryString);
      const { sales: fetchedSales, totalPages: fetchedTotalPages } = await response.json();
      setSales(fetchedSales.map(cleanSaleData));
      setFilteredSales(fetchedSales.map(cleanSaleData));
      setTotalPages(fetchedTotalPages || 1);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
      setFilteredSales([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [token, filters, filterPriority, cleanSaleData, endDate, startDate]);

  useEffect(() => {
    if ([1, 2, 3, 4, 5].includes(roleId)) fetchSales(currentPage);
    else console.error('Acceso denegado: You do not have permission to view sales.');
  }, [fetchSales, roleId, currentPage]);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    fetch(`${process.env.REACT_APP_API_URL}/channels`, {
      headers,
    })
      .then(response => response.json())
      .then(data => setSalesChannels(data));
  }, [token]);
  
  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    let url = `${process.env.REACT_APP_API_URL}/promotions/installation-amounts`;
    if (roleId === 3) {
      url = `${process.env.REACT_APP_API_URL}/promotions/installationAmountsByUser`;
    }
  
    fetch(url, {
      headers,
    })
      .then(response => response.json())
      .then(data => setInstallationAmounts(data));
  }, [token, roleId]);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    fetch(`${process.env.REACT_APP_API_URL}/companies`, {
      headers,
    })
      .then(response => response.json())
      .then(data => setCompanies(data));
  }, [token]);

useEffect(() => {
    const headers = {
    Authorization: `Bearer ${token}`,
  };

  fetch(`${process.env.REACT_APP_API_URL}/regions`, { headers })
    .then(response => response.json())
    .then(data => setRegions(data));
}, [token]);
  
useEffect(() => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (selectedRegion) {
    setSelectedCommune('');
    fetch(`${process.env.REACT_APP_API_URL}/communes/communes/${selectedRegion}`, { headers })
      .then(response => response.json())
      .then(data => setCommunes(data));
  } else {
    setCommunes([]);
  }
}, [selectedRegion, token]);

useEffect(() => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  fetch(`${process.env.REACT_APP_API_URL}/sale-statuses`, {
    headers,
  })
    .then(response => response.json())
    .then(data => setSaleStatuses(data));
}, [token]);

  useEffect(() => {
    fetch('http://localhost:3001/api/roles', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          const rolesData = data.map(role => ({
            role_id: role.role_id,
            role_name: role.role_name,
          }));
          setRoles(rolesData);
        } else {
          console.error('La respuesta no es un arreglo');
        }
      });
  }, [token]);

  useEffect(() => {
    let url = 'http://localhost:3001/api/promotions';
    if (roleId === 3) {
      url = `${process.env.REACT_APP_API_URL}/promotions/by-user`;
    }
  
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          const promotions = data.map(promotion => ({
            promotion_id: promotion.promotion_id,
            promotion: promotion.promotion,
          }));
          setPromotions(promotions);
        } else {
          console.error('La respuesta no es un arreglo');
        }
      });
  }, [token, roleId]);
  
  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    if (selectedPromotion) {
      fetch(`http://localhost:3001/api/sale-statuses/reasons/${selectedPromotion}`, { headers })
        .then(response => response.json())
    }
  }, [selectedPromotion, token]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/all/search?search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error searching sales');
      
      const results = await response.json();
      setFilteredSales(results.map(cleanSaleData));
      setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchSales(newPage);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredSales(sales);
    setCurrentPage(1);
    fetchSales(1);
  };

  const handleExport = async (format) => {
    const filters = {
      sale_status_id: selectedSaleStatus,
      region_id: selectedRegion,
      commune_id: selectedCommune,
      promotion_id: selectedPromotion,
      installation_amount_id: selectedInstallationAmount,
      company_id: selectedCompany,
      start_date: startDate,
      end_date: endDate,
    };
  
    const queryString = Object.keys(filters)
      .filter(key => filters[key] !== '')
      .map(key => `${key}=${filters[key]}`)
      .join('&');
  
    let url = '';
    let responseType = '';
    let filename = '';
  
    switch (format) {
      case 'excel':
        url = `http://localhost:3001/api/sales/all/export/excel?${queryString}`;
        responseType = 'blob';
        filename = 'ventas.xlsx';
        break;
      case 'word':
        url = `http://localhost:3001/api/sales/all/export/word?${queryString}`;
        responseType = 'blob';
        filename = 'ventas.docx';
        break;
      case 'csv':
        url = `http://localhost:3001/api/sales/all/export/csv?${queryString}`;
        responseType = 'text/csv';
        filename = 'ventas.csv';
        break;
      default:
        console.error('Formato de exportación no válido');
        return;
    }
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType,
      });
      const data = await response.blob();
      const urlBlob = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading sales...</div>;

  return (
    <div className="ventas-page">
      <h1>Ventas</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar ventas..."
          value={searchTerm}
          onChange={handleSearchChange}
          autoComplete="off"
        />
        {searchTerm && <button className="clear-button" onClick={handleClearSearch}><FontAwesomeIcon icon={faTimes} /></button>}
        <button className="search-button" onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /> Buscar</button>
        <button className="filter-button" onClick={() => setIsFilterVisible(!isFilterVisible)}>
          <FontAwesomeIcon icon={faFilter} /> Filtros
        </button>
      </div>

      <div className={`filter-section ${isFilterVisible ? 'active' : ''}`}>
        <div className='column-1'>
          <div className="filters">
            <h4>Fecha</h4>
            <div>
              <label>Fecha de inicio:</label>
              <input type="date" key="input-start-date"  value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label>Fecha de fin:</label>
              <input type="date" key="input-end-date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
      
          {roleId !== 3 && (
            <div className="filters">
              <h4>Canales de Venta</h4>
              <select value={selectedSalesChannel} onChange={e => setSelectedSalesChannel(e.target.value)}>
                <option key="default-channel" value="" disabled>Selecciona un canal de venta</option>
                {salesChannels.map(channel => (
                  <option key={channel.sales_channel_id} value={channel.sales_channel_id}>{channel.channel_name}</option>
                ))}
              </select>
              {selectedSalesChannel && (
                <button onClick={() => setSelectedSalesChannel('')}>Borrar</button>
              )}
            </div>
          )}

          {![2, 3].includes(roleId) && (
            <div className="filters">
              <h4>Empresas</h4>
              <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
                <option key="default-company" value="" disabled>Selecciona una empresa</option>
                {companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>{company.company_name}</option>
                ))}
              </select>
              {selectedCompany && (
                <button onClick={() => setSelectedCompany('')}>Borrar</button>
              )}
            </div>
          )}
        </div>
        <div className='='filter-section>
          <div className="filters">
            <h4>Regiones</h4>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
              <option key="default-region" value="" disabled>Selecciona una región</option>
              {regions.map(region => (
                <option key={region.region_id} value={region.region_id}>{region.region_name}</option>
              ))}
            </select>
            {selectedRegion && (
              <button onClick={() => setSelectedRegion('')}>Borrar</button>
            )}
          </div>
        </div>


        <div className="filters">
          <h4>Comunas</h4>
          <select value={selectedCommune} onChange={e => setSelectedCommune(e.target.value)}>
            <option key="default-commune" value="" disabled>Selecciona una comuna</option>
            {communes.map((commune) => (
              <option key={commune.commune_id} value={commune.commune_id}>{commune.commune_name}</option>
            ))}
          </select>
          {selectedCommune && (
            <button onClick={() => setSelectedCommune('')}>Borrar</button>
          )}
        </div>


        <div className="filters">
          <h4>Promociones</h4>
          <select value={selectedPromotion} onChange={e => setSelectedPromotion(e.target.value)}>
            <option key="default-promotion" value="" disabled>Selecciona una promoción</option>
            {promotions.map(promotion => (
              <option key={promotion.promotion_id} value={promotion.promotion_id}>{promotion.promotion}</option>
            ))}
          </select>
          {selectedPromotion && (
            <button onClick={() => setSelectedPromotion('')}>Borrar</button>
          )}
        </div>

    
        <div className="filters">
          <h4>Monto de instalación</h4>
          <select value={selectedInstallationAmount} onChange={e => setSelectedInstallationAmount(e.target.value)}>
            <option key="default-amount" value="" disabled>Selecciona un monto de instalación</option>
            {installationAmounts.map((amount) => (
              <option key={amount.installations_amount_id} value={amount.installation_amount_id}>{amount.amount}</option>
            ))}
          </select>
          {selectedInstallationAmount && (
            <button onClick={() => setSelectedInstallationAmount('')}>Borrar</button>
          )}
        </div>
   
    
        <div className="filters">
          <h4>Estado de venta</h4>
          <select value={selectedSaleStatus} onChange={e => setSelectedSaleStatus(e.target.value)}>
            <option key="default-status" value="" disabled>Selecciona un estado de venta</option>
            {saleStatuses.map(status => (
              <option key={status.sale_status_id} value={status.sale_status_id}>{status.status_name}</option>
            ))}
          </select>
          {selectedSaleStatus && (
            <button onClick={() => setSelectedSaleStatus('')}>Borrar</button>
          )}
        </div>

        <div className="filters">
          <h4>Rol</h4>
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
            <option key="default-role" value="" disabled>Selecciona un rol</option>
            {roles.map(role => (
              <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
            ))}
          </select>
          {selectedRole && (
            <button onClick={() => setSelectedRole('')}>Borrar</button>
          )}
        </div>
 

        <div className="filters">
          <h4>Prioridad</h4>
          <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option key="default-priority" value="" disabled>Selecciona una opción</option>
            <option key="prioridad" value="1">Prioridad</option>
            <option key="no-prioridad" value="0">No prioridad</option>
          </select>
          {selectedPriority && (
            <button onClick={() => setSelectedPriority('')}>Borrar</button>
          )}
        </div>


        <button onClick={() => {

          setFilters({
            sales_channel_id: selectedSalesChannel,
            region_id: selectedRegion,
            commune_id: selectedCommune,
            promotion_id: selectedPromotion,
            installation_amount_id: selectedInstallationAmount,
            sale_status_id: selectedSaleStatus,
            company_id: selectedCompany,
            role_id: selectedRole,
            is_priority: selectedPriority,
            start_date: startDate,
            end_date: endDate,
          });
          fetchSales(currentPage);
        }}>Aplicar filtros</button>

        <button onClick={() => {
          // Limpiar todos los valores de los filtros
          setFilters(originalFilters); 

          // Limpiar las fechas del estado
          setStartDate(''); 
          setEndDate(''); 

          // Limpiar los selectores y demás valores de los filtros
          setSelectedSalesChannel('');
          setSelectedRegion('');
          setSelectedCommune('');
          setSelectedPromotion('');
          setSelectedInstallationAmount('');
          setSelectedSaleStatus('');
          setSelectedCompany('');
          setSelectedRole('');
          setSelectedPriority('');

          // Volver a cargar todas las ventas (sin filtro)
          fetchSales(1);
        }}>Limpiar filtros</button>
      </div>

      <div className="export-buttons" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 5 }}>
        <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
          <option value="excel">Exportar Excel</option>
          <option value="csv">Exportar CSV</option>
          <option value="word">Exportar Word</option>
        </select>
        <button onClick={() => handleExport(exportFormat)}>Exportar</button>
      </div>



      <div className="sales-container">
        {loading ? (
          <div>Loading sales...</div>
        ) : filteredSales.length > 0 ? (
          <div className="sales-list">
            <Suspense fallback={<div>Loading sales...</div>}>
              {filteredSales.map(sale => (
                <SaleCard key={`${sale.sale_id}-${sale.created_at}`} sale={sale} onSaleClick={onSaleClick} getStatusColor={getStatusColor} />
              ))}
            </Suspense>
          </div>
        ) : (
          <div>No se encontraron ventas.</div>
        )}
      </div>
      
      <Suspense fallback={<div>Loading pagination...</div>}>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </Suspense>
    </div>
  );
} 

const getStatusColor = (saleStatusId) => STATUS_COLORS[saleStatusId] || '#ffffff';

export default withAuthorization(VentasPage, [1, 2, 3, 4, 5]);
