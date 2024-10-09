import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import './TablaDatos.css';

const TablaDatos = () => {
  const { token } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [regionId, setRegionId] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [promotionId, setPromotionId] = useState('');
  const [installationAmountId, setInstallationAmountId] = useState('');
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [installationAmounts, setInstallationAmounts] = useState([]);
  const limit = 100;

  useEffect(() => {
    fetchData();
  }, [token, currentPage, regionId, communeId, promotionId, installationAmountId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        region_id: regionId,
        commune_id: communeId,
        promotion_id: promotionId,
        installation_amount_id: installationAmountId
      });
  
      const response = await fetch(`http://localhost:3003/api/promotions/all?${params.toString()}`, { headers });
      const jsonData = await response.json();
      
      setData(jsonData.data);
      setTotalPages(Math.ceil(jsonData.pagination.total / limit));
      setTotalItems(jsonData.pagination.total);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const response = await fetch(`${process.env.REACT_APP_API_URL}/regions`, { headers });
        const jsonData = await response.json();
        setRegions(jsonData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRegions();
  }, [token]);

  useEffect(() => {
    const fetchCommunes = async () => {
      if (regionId) {
        try {
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
          const response = await fetch(`${process.env.REACT_APP_API_URL}/communes/region/${regionId}`, { headers });
          const jsonData = await response.json();
          setCommunes(jsonData);
        } catch (error) {
          console.error(error);
        }
      } else {
        setCommunes([]);
      }
    };
    fetchCommunes();
  }, [regionId, token]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const response = await fetch(`${process.env.REACT_APP_API_URL}/promotions`, { headers });
        const jsonData = await response.json();
        setPromotions(jsonData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPromotions();
  }, [token]);

  useEffect(() => {
    const fetchInstallationAmounts = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const response = await fetch('http://localhost:3003/api/promotions/installation-amounts', { headers });
        const jsonData = await response.json();
        setInstallationAmounts(jsonData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInstallationAmounts();
  }, [token]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRegionChange = (event) => {
    setRegionId(event.target.value);
    setCommuneId('');
    setCurrentPage(1);
  };

  const handleCommuneChange = (event) => {
    setCommuneId(event.target.value);
    setCurrentPage(1);
  };

  const handlePromotionChange = (event) => {
    setPromotionId(event.target.value);
    setCurrentPage(1);
  };

  const handleInstallationAmountChange = (event) => {
    setInstallationAmountId(event.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setRegionId('');
    setCommuneId('');
    setPromotionId('');
    setInstallationAmountId('');
    setCurrentPage(1);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div className='tabla-datos-filter'>
        <h1 style={{ color: '#99235C', textAlign: 'center' }}>Promociones Internet por Zona</h1>
        <div className="filters">
          <label>Región:</label>
          <select value={regionId} onChange={handleRegionChange}>
            <option value="">Todas las regiones</option>
            {regions.map((region) => (
              <option key={region.region_id} value={region.region_id}>
                {region.region_name}
              </option>
            ))}
          </select>
    
          <label>Comuna:</label>
          <select value={communeId} onChange={handleCommuneChange}>
            <option value="">Todas las comunas</option>
            {communes.map((commune) => (
              <option key={commune.commune_id} value={commune.commune_id}>
                {commune.commune_name}
              </option>
            ))}
          </select>
    
          <label>Promoción:</label>
          <select value={promotionId} onChange={handlePromotionChange}>
            <option value="">Todas las promociones</option>
            {promotions.map((promotion) => (
              <option key={promotion.promotion_id} value={promotion.promotion_id}>
                {promotion.promotion}
              </option>
            ))}
          </select>
    
          <label>Monto Instalación:</label>
          <select value={installationAmountId} onChange={handleInstallationAmountChange}>
            <option value="">Todas las instalaciones</option>
            {installationAmounts.map((installationAmount) => (
              <option key={installationAmount.installation_amount_id} value={installationAmount.installation_amount_id}>
                {installationAmount.amount}
              </option>
            ))}
          </select>
    
          <button onClick={handleClearFilters}>Limpiar filtros</button>
        </div>
      </div>
  
      <div className="tabla-datos">
        <table>
          <thead>
            <tr>
              <th>Región</th>
              <th>Comuna</th>
              <th>Promoción</th>
              <th>Monto de instalación</th>
              <th>Estado promoción</th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              data.map((region) =>
                region.communes.map((commune) =>
                  commune.promotions.map((promotion) => (
                    <tr key={`${region.region_id}-${commune.commune_id}-${promotion.promotion_id}`}>
                      <td>{region.region_name}</td>
                      <td>{commune.commune_name}</td>
                      <td>{promotion.promotion}</td>
                      <td>{promotion.installation_amount}</td>
                      <td>{promotion.is_active === 1 ? 'Activo' : 'Inactivo'}</td>
                    </tr>
                  ))
                )
              )
            ) : (
              <tr>
                <td colSpan="4">Cargando...</td>
              </tr>
            )}
          </tbody>
        </table>
  
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
  
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
  
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
};  

export default TablaDatos;