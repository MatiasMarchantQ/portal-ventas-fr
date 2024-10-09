import React, { useEffect, useState, useContext, useCallback, lazy, Suspense } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle, faQuestionCircle ,  faTimes, faFilter, faSyncAlt, faTv, faSortUp, faSortDown, faShoppingCart, faDollarSign, faChartLine, faUsers, faBriefcase, faMapMarkerAlt, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import withAuthorization from '../../../contexts/withAuthorization';
import './Ventas.css';

const SaleCard = lazy(() => import('./SaleCard'));
const Pagination = lazy(() => import('./Pagination'));

const ITEMS_PER_PAGE = 30;
const STATUS_COLORS = { 1: '#ffa500', 2: '#87ceeb', 3: '#ffff00', 4: '#a3d300', 5: '#4169E1', 6: '#008000', 7: '#ff0000' };

const getStatusColor = (saleStatusId) => STATUS_COLORS[saleStatusId];


const VentasPage = ({ onSaleClick }) => {
  const { token, roleId } = useContext(UserContext);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllCards, setShowAllCards] = useState(false);

  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('page')) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [pendingSortField, setPendingSortField] = useState('');
  const [pendingSortOrder, setPendingSortOrder] = useState('');

  const sortOptions = [
    { value: 'created_at', label: 'Fecha de creación' },
    { value: 'sale_id', label: 'ID de venta' },
    { value: 'service_id', label: 'ID de servicio' },
    { value: 'client_first_name', label: 'Nombre del cliente' },
    { value: 'client_last_name', label: 'Apellido del cliente' },
    { value: 'client_rut', label: 'RUT del cliente' },
    { value: 'region_id', label: 'Región' },
    { value: 'commune_id', label: 'Comuna' },
    { value: 'promotion_id', label: 'Promoción' },
    { value: 'sale_status_reason_id', label: 'Razón de estado' },
    { value: 'company_id', label: 'Empresa' }
  ];
  
  
  // Listados de los select
  const [salesChannels, setSalesChannels] = useState([]);
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [installationAmounts, setInstallationAmounts] = useState([]);
  const [saleStatuses, setSaleStatuses] = useState([]);
  const [saleStatusReasons, setSaleStatusReasons] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');
  const [showMore, setShowMore] = useState(false);

  const [selectedSalesChannel, setSelectedSalesChannel] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedInstallationAmount, setSelectedInstallationAmount] = useState('');
  const [selectedSaleStatus, setSelectedSaleStatus] = useState('');
  const [selectedSaleStatusReason, setSelectedSaleStatusReason] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);


  const [filters, setFilters] = useState({
    sales_channel_id: '',
    region_id: '',
    commune_id: '',
    promotion_id: '',
    installation_amount_id: '',
    sale_status_id: '',
    sale_status_reason_id: '',
    company_id: '',
  });

  const jornadas = [
    { nombre: "Madrugada", horas: [0, 1, 2, 3, 4, 5] },
    { nombre: "Mañana", horas: [6, 7, 8, 9, 10, 11] },
    { nombre: "Tarde", horas: [12, 13, 14, 15, 16, 17] },
    { nombre: "Noche", horas: [18, 19, 20, 21, 22, 23] }
  ];
  
  const [pendingFilters, setPendingFilters] = useState(filters);
  
  const [originalFilters] = useState({
    sales_channel_id: '',
    region_id: '',
    commune_id: '',
    promotion_id: '',
    installation_amount_id: '',
    sale_status_id: '',
    sale_status_reason_id: '',
    company_id: '',
  });
  
  const cleanSaleData = useCallback(sale => Object.fromEntries(Object.entries(sale).map(([key, value]) => [key, value !== 'null' ? value : null])), []);

  const fetchSales = useCallback(async (page = 1) => {
    setLoading(true);
    setIsRefreshing(false);
    try {
      const filtersWithDates = {
        ...filters,
        start_date: startDate,
        end_date: endDate,
        sortField,
        sortOrder,
      };
  
      const filteredParams = Object.entries(filtersWithDates)
        .filter(([key, value]) => value !== undefined && value !== '')
        .concat([
          ['page', page],
          ['limit', ITEMS_PER_PAGE],
        ]);
  
      const queryString = new URLSearchParams(filteredParams).toString();
      console.log(queryString);
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/all?${queryString}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Error fetching sales: ${response.status} ${response.statusText}`);
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
  }, [token, filters, cleanSaleData, endDate, startDate, sortField, sortOrder]);

  const handleRefresh = () => {
    setIsUpdating(true);
    fetchSales().finally(() => {
      setIsUpdating(false);
    });
  };
  
  useEffect(() => {
    if (isUpdating) {
      setIsRefreshing(true);
      fetchSales().finally(() => {
        setIsRefreshing(false);
        setIsUpdating(false);
      });
    }
  }, [isUpdating, fetchSales]);
  
  useEffect(() => {
    if ([1, 2, 3, 4, 5].includes(roleId)) fetchSales(currentPage);
    else console.error('Acceso denegado: You do not have permission to view sales.');
  }, [fetchSales, filters, roleId, currentPage]);
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
    fetch(`${process.env.REACT_APP_API_URL}/roles`, {
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
    let url = `${process.env.REACT_APP_API_URL}/promotions`;
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
  
    if (selectedSaleStatus) {
      fetch(`${process.env.REACT_APP_API_URL}/sale-statuses/reasons/${selectedSaleStatus}`, { headers })
        .then(response => response.json())
        .then(data => {
          setSaleStatusReasons(data);
        })
        .catch(error => {
          console.error('Error fetching sale statuses reasons:', error);
        });
    }
  }, [selectedSaleStatus, token]);

  const applyFilters = () => {
    setFilters({
      sales_channel_id: selectedSalesChannel,
      region_id: selectedRegion,
      commune_id: selectedCommune,
      promotion_id: selectedPromotion,
      installation_amount_id: selectedInstallationAmount,
      sale_status_id: selectedSaleStatus,
      sale_status_reason_id: selectedSaleStatusReason,
      company_id: selectedCompany,
      role_id: selectedRole,
      is_priority: selectedPriority,
      start_date: startDate,
      end_date: endDate,
    });
    setSortField(pendingSortField);
    setSortOrder(pendingSortOrder);
    setCurrentPage(1);
    setIsSearchActive(true);
    fetchSales(1);
  };
  
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
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage);
    window.history.replaceState(
      {}, 
      '', 
      `${window.location.pathname}?${params.toString()}`
    );
    fetchSales(newPage);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredSales(sales);
    setCurrentPage(1);
    fetchSales(1);
  };

  const handlePriorityChange = (updatedSale) => {
    setSales(prevSales => 
      prevSales.map(sale => 
        sale.sale_id === updatedSale.sale_id ? updatedSale : sale
      )
    );
  };

  const handleExport = async (format) => {
    const filters = {
      sale_status_id: selectedSaleStatus,
      sale_status_reason_id: selectedSaleStatusReason,
      region_id: selectedRegion,
      commune_id: selectedCommune,
      promotion_id: selectedPromotion,
      installation_amount_id: selectedInstallationAmount,
      company_id: selectedCompany,
      start_date: startDate,
      end_date: endDate,
      sortField: sortField,
      sortOrder: sortOrder,
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
        url = `${process.env.REACT_APP_API_URL}/sales/all/export/excel?${queryString}`;
        responseType = 'blob';
        filename = 'ventas.xlsx';
        break;
      case 'word':
        url = `${process.env.REACT_APP_API_URL}/sales/all/export/word?${queryString}`;
        responseType = 'blob';
        filename = 'ventas.docx';
        break;
      case 'csv':
        url = `${process.env.REACT_APP_API_URL}/sales/all/export/csv?${queryString}`;
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [token]);

  if (!stats) return <div>Loading dashboard...</div>;

  return (
    <div className="ventas-page">
      {roleId === 1 && (
        <>
          <h2 style={{color: '#99235C', textAlign: 'center'}}>Dashboard de Ventas</h2>
          <div className='stats-grid'>  
              <div className='card'>
                <FontAwesomeIcon icon={faShoppingCart} size="2x" className='icon'/>
                <div>
                  <h3>Total Ventas</h3>
                  <h4 className="total-sales">{stats.totalSales}</h4>
                  <p className="ventas-mes-mensaje">{stats.mensajeVentasMes}</p>
                </div>
              </div>
    
              <div className='card'>
                <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" className='icon'/>
                <div>
                  <h3>Ventas por Región</h3>
                  <div className={`region-grid ${showMore ? 'show-more' : ''}`}>
                {Object.entries(stats.ventasPorRegion)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .slice(0, showMore ? undefined : 1) // mostrar solo una región inicialmente
                  .map(([region, data], index) => (
                  <div key={region} className={`region-item ${index < 3 ? `top-${index + 1}` : ''}`}>
                    <h4>{region}</h4>
                    <div className="region-info">
                      <span className="total">Total: {data.total}</span>
                    </div>
                    <div className="region-details">
                      <span className="ingresadas">Ingresadas: {data.ingresadas}</span><br/>
                      <span className="activas">Activas: {data.activas}</span>
                    </div>
                  </div>
                ))}
              </div>
                  {Object.entries(stats.ventasPorRegion).length > 1 && (
                    <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                      {showMore ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              </div>

              {/*
              <div className='card'>
                <FontAwesomeIcon icon={faTv} size="2x" className='icon'/>
                <div>
                  <h3>Ventas por Estado por Mes</h3>
                  <div className={`mes-grid ${showMore ? 'show-more' : ''}`}>
                    {Object.entries(stats.ventasPorEstadoPorMes)
                      .filter(([mes, estados]) => Object.keys(estados).length > 0 && estados.Ingresada > 0)
                      .slice(0, showMore ? undefined : 1) // mostrar solo un mes inicialmente
                      .map(([mes, estados]) => (
                        <div key={mes} className="mes-item">
                          <h4>{mes}</h4>
                          <div className="estado-grid">
                            {Object.keys(estados).map((estado) => (
                              <div key={estado} className="estado-item">
                                <span>{estado}: </span>
                                <span className="ingresadas">{estados[estado]} ventas</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                  {Object.keys(stats.ventasPorEstadoPorMes).length > 1 && (
                    <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                      {showMore ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              </div>
              */}


              <div className='card'>
                <FontAwesomeIcon icon={faCheckCircle} size="2x" className='icon'/>
                <div>
                  <h3>Ventas por Estado</h3>
                  {Object.entries(stats.ventasPorEstado).filter(([estado, cantidad]) => cantidad > 0).map(([estado, cantidad]) => (
                    <p key={estado}>
                      <span className={estado.toLowerCase().replace(/\s+/g, '-')}>{estado}</span>: {cantidad}
                    </p>
                  ))}
                  {showMore && (
                    <div className={`estado-grid ${showMore ? 'show-more' : ''}`}>
                      <h4>Ventas por Estado por Mes</h4>
                      {Object.entries(stats.ventasPorEstadoPorMes).filter(([mes, estados]) => Object.values(estados).some(cantidad => cantidad > 0)).map(([mes, estados]) => (
                        <div key={mes}>
                          <h5>{mes}</h5>
                          {Object.entries(estados).filter(([estado, cantidad]) => cantidad > 0).map(([estado, cantidad]) => (
                            <p key={estado}>
                              <span className={estado.toLowerCase().replace(/\s+/g, '-')}>{estado}</span>: {cantidad}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {stats.ventasPorEstadoPorMes && Object.keys(stats.ventasPorEstadoPorMes).length > 0 && (
                    <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                      {showMore ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              </div>

              <div className={`card ${showMore ? 'show-more' : ''}`}>
                <FontAwesomeIcon icon={faBriefcase} size="2x" className='icon'/>
                <div>
                  <h3>Ventas por Empresa</h3>
                  <div className="empresa-grid" style={{ maxHeight: '200px', overflowY: showMore ? 'auto' : 'hidden' }}>
                    {Object.entries(stats.ventasPorEmpresaMes).map(([empresa, datos]) => (
                      <div key={empresa} className="empresa-item">
                        <h4>{empresa}</h4>
                        {Object.entries(datos)
                          .filter(([mes, valores]) => valores.Ingresada > 0)
                          .map(([mes, valores]) => (
                            <div key={mes} className="mes-data">
                              <div className="mes-info">
                                <span className="mes-titulo">{mes.slice(0, 3)} '{mes.slice(-2)}: </span>
                              </div>
                              <div className="detalles-info">
                                <span className="ingresadas">Ingresadas: {valores.Ingresada}</span><br/>
                                <span className="nuevas">Nuevas: {valores.Nueva}</span><br/>
                                <span className="enRevision">En revisión: {valores.EnRevisión}</span><br/>
                                <span className="correccionRequerida">Corrección requerida: {valores.CorrecciónRequerida}</span><br/>
                                <span className="pendiente">Pendiente: {valores.Pendiente}</span><br/>
                                <span className="activas">Activos: {valores.Activo}</span><br/>
                                <span className="anuladas">Anuladas: {valores.Anulado}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                  {Object.keys(stats.ventasPorEmpresaMes).length > 1 && (
                    <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                      {showMore ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              </div>

              {/*
              <div className='card'>
                <FontAwesomeIcon icon={faUsers} size="2x" />
                <div>
                  <h3>Top Ejecutivos</h3>
                  {stats.topEjecutivos.map(([ejecutivo, datos], index) => (
                    <p key={ejecutivo}>{index + 1}. {ejecutivo}: {datos.ventas} ventas</p >
                  ))}
                </div>
              </div>
              */}
      
              {showAllCards && (
                  <>
                    <div className='card'>
                      <FontAwesomeIcon icon={faCalendarAlt} size="2x" className='icon'/>
                      <div>
                        <h3>Ventas ingresadas por Mes</h3>
                        <div className={`meses-container ${showMore ? 'show-more' : ''}`}>
                          {Object.entries(stats.ventasPorMes)
                            .filter(([_, cantidad]) => cantidad.total > 0)
                            .map(([mesAno, cantidad]) => {
                              const [mes, ano] = mesAno.split(' ');
                              const mesAbreviado = mes.slice(0, 3);
                              const anoAbreviado = ano.slice(2);
                              return (
                                <div key={mesAno} className="mes-item">
                                  <h4>{`${mesAbreviado} '${anoAbreviado}`}</h4>
                                  <div className="mes-info">
                                    <span className="total">Total: {cantidad.total}</span>
                                  </div>
                                  <div className="mes-details">
                                    <span className="ingresadas">Ingresadas: {cantidad.Ingresada}</span><br/>
                                    <span className="nuevas">Nuevas: {cantidad.Nueva}</span><br/>
                                    <span className="enRevision">En revisión: {cantidad['En revisión']}</span><br/>
                                    <span className="correccionRequerida">Corrección requerida: {cantidad['Corrección requerida']}</span><br/>
                                    <span className="pendiente">Pendiente: {cantidad.Pendiente}</span><br/>
                                    <span className="activas">Activos: {cantidad.Activo}</span><br/>
                                    <span className="anuladas">Anuladas: {cantidad.Anulado}</span>
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                        {Object.keys(stats.ventasPorMes).length > 1 && (
                          <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                            {showMore ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='card'>
                      <FontAwesomeIcon icon={faClock} size="2x" className='icon'/>
                      <div>
                        <h3>Tiempo Promedio de Cierre</h3>
                        <div className={`tiempo-container ${showMore ? 'show-more' : ''}`}>
                          {stats.tiemposDeCierrePorMes.slice(0, showMore ? stats.tiemposDeCierrePorMes.length : 1).map((dato) => (
                            <div key={dato.mes} className="dato">
                              <h4>{dato.mes}</h4>
                              <h2 className="promedio">{dato.promedio !== null ? `${dato.promedio} ${dato.unidad}` : 'N/A'}</h2>
                              <div className="detalles">
                                <span>Ingresadas: {dato.ventasIngresadas} ventas</span><br/>
                                <span>Cerradas: {dato.ventasCerradas} ventas</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {stats.tiemposDeCierrePorMes.length > 1 && (
                          <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                            {showMore ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='card'>
                      <FontAwesomeIcon icon={faDollarSign} size="2x" className='icon'/>
                      <div>
                        <h3>Ventas por Promoción</h3>
                        <div className={`promociones-container ${showMore ? 'show-more' : ''}`}>
                          {Object.entries(stats.ventasPorPromocion)
                            .filter(([_, datos]) => Object.values(datos).some(estadisticas => estadisticas.total > 0))
                            .slice(0, showMore ? Object.entries(stats.ventasPorPromocion).length : 1)
                            .map(([promocion, datos]) => (
                            <div key={promocion} className="promocion-item">
                              <h4>{promocion}</h4>
                              <div className="detalles">
                                {Object.entries(datos)
                                  .filter(([_, estadisticas]) => estadisticas.total > 0)
                                  .slice(0, showMore ? Object.entries(datos).length : 1)
                                  .map(([mes, estadisticas]) => (
                                    <div key={mes} className="mes-estadisticas">
                                      <span>{mes}</span><br/>
                                      <span>Total: {estadisticas.total}</span><br/>
                                      <span>Activos: {estadisticas.activos}</span><br/>
                                      <span>Ingresados: {estadisticas.ingresados}</span><br/>
                                      <span>Anulados: {estadisticas.anulados}</span><br/>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {(Object.entries(stats.ventasPorPromocion)
                          .filter(([_, datos]) => Object.values(datos).some(estadisticas => estadisticas.total > 0))
                          .length > 1 ||
                        Object.values(stats.ventasPorPromocion).some(datos => 
                          Object.values(datos).filter(estadisticas => estadisticas.total > 0).length > 1
                        )) && (
                          <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                            {showMore ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                      </div>
                    </div>
                  
                    <div className='card ventas-por-jornada'>
                      <FontAwesomeIcon icon={faClock} size="2x" className='icon'/>
                      <h3>Ventas ingresadas por Hora</h3>
                      <div className={`jornadas-container ${showMore ? 'show-more' : ''}`}>
                        <div className="mes-jornada">
                          <h4>Total</h4>
                          {jornadas.map((jornada) => (
                            <div key={jornada.nombre} className="jornada">
                              <div className="horas-container">
                                {jornada.horas.map((hora) => {
                                  const horaData = stats.ventasPorHoraTotal.find(h => h.hora.startsWith(hora.toString().padStart(2, '0')));
                                  return (
                                    <span key={hora} className="hora-item">
                                      <span className="hora">{hora.toString().padStart(2, '0')}:00</span>
                                      <span className="ventas">{horaData ? horaData.cantidad : 0}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        {showMore && (
                          <div className="meses-scroll">
                            {Object.entries(stats.ventasPorHoraMes).map(([mes, horas]) => (
                              <div key={mes} className="mes-jornada">
                                <h4>{mes}</h4>
                                {jornadas.map((jornada) => (
                                  <div key={`${mes}-${jornada.nombre}`} className="jornada">
                                    <div className="horas-container">
                                      {jornada.horas.map((hora) => {
                                        const horaData = horas.find(h => h.hora.startsWith(hora.toString().padStart(2, '0')));
                                        return (
                                          <span key={`${mes}-${hora}`} className="hora-item">
                                            <span className="hora">{hora.toString().padStart(2, '0')}:00: </span>
                                            <span className="ventas">{horaData ? horaData.cantidad : 0}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setShowMore(!showMore)} className="ver-mas-btn">
                        {showMore ? 'Ver menos' : 'Ver más'}
                      </button>
                    </div>
                  </>
                )}
                </div>
          {/* Botón para mostrar/ocultar tarjetas adicionales */}
          <button onClick={() => setShowAllCards(!showAllCards)} className="ver-mas-btn">
            {showAllCards ? 'Ver menos' : 'Más estadísticas'}
          </button>
        </>
      )}

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

      <div className={`filter-section ${isFilterVisible ? 'active' : 'inactive'}`}>
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
        </div>

        <div className='column-2'>
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
            <h4>Motivo de estado de venta</h4>
            <select value={selectedSaleStatusReason} onChange={e => setSelectedSaleStatusReason(e.target.value)}>
              <option key="default-reason" value="" disabled>Selecciona un motivo de estado de venta</option>
              {saleStatusReasons.map(reason => (
                <option key={reason.sale_status_reason_id} value={reason.sale_status_reason_id}>{reason.reason_name}</option>
              ))}
            </select>
            {selectedSaleStatusReason && (
              <button onClick={() => setSelectedSaleStatusReason('')}>Borrar</button>
            )}
          </div>
        </div>
        <div className='column-3'></div>
          {roleId !== 3 && (
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
          )}
  

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

          <div className="filters">
            <h4>Ordenamiento</h4>
            <select value={pendingSortField} onChange={e => setPendingSortField(e.target.value)}>
              <option value="">Seleccionar campo</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select value={pendingSortOrder} onChange={e => setPendingSortOrder(e.target.value)}>
              <option value="ASC">Ascendente</option>
              <option value="DESC">Descendente</option>
            </select>
          </div>

          {/* Botón de aplicar filtros */}
          <button onClick={applyFilters}>Aplicar filtros</button>

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
            setSelectedSaleStatusReason('');
            setSelectedCompany('');
            setSelectedRole('');
            setSelectedPriority('');
            setSortField('');
            setSortOrder('');

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
          <div>Cargando ventas...</div>
        ) : filteredSales.length > 0 ? (
          <div className="sales-list">
            <Suspense>
              <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '10px' }}>
                <button onClick={() => {
                  setIsUpdating(true);
                }} disabled={isRefreshing} style={{ background: 'transparent', border: 'none', padding: 0 }}>
                  <FontAwesomeIcon icon={faSyncAlt} spin={isRefreshing} style={{color: '#99235C', marginBottom: 10}}/>
                  {isUpdating && <span style={{ marginLeft: 10 }}>Actualizando...</span>}
                </button>
              </div>
              {filteredSales.filter(sale => {
                if (filters.sale_status_id === '7') {
                  return true;
                } else {
                  return sale.sale_status_id !== 7;
                }
              }).map(sale => (
                <SaleCard key={`${sale.sale_id}-${sale.created_at}`} sale={sale} onSaleClick={onSaleClick} getStatusColor={getStatusColor} onPriorityChange={handlePriorityChange} refreshSales={handleRefresh} />
              ))}
            </Suspense>
          </div>
        ) : (
          <div>No se encontraron ventas.</div>
        )}
      </div>

      <Suspense fallback={<div>Cargando página...</div>}>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </Suspense>
    </div>
  );
} 

export default withAuthorization(VentasPage, [1, 2, 3, 4, 5]);
