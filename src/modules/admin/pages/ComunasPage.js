import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import './ComunasTarifas.css'

// Utility function for API calls
const apiCall = async (url, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };
  const response = await fetch(url, config);
  if (!response.ok) throw new Error('API call failed');
  return response.json();
};

// Custom hook for toggling card visibility
const useToggleCard = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const toggle = () => setIsOpen(prev => !prev);
  return [isOpen, toggle];
};

// Card component
const Card = ({ title, children, isOpen, toggle }) => (
  <div className="card" onClick={toggle}>
    <h2>{title}</h2>
    {isOpen && <div onClick={(e) => e.stopPropagation()}>{children}</div>}
  </div>
);

// Ver opciones
const ViewOptions = ({ token, regions }) => {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [communes, setCommunes] = useState([]);
  const [selectedCommuneId, setSelectedCommuneId] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState('');
  const [installationAmount, setInstallationAmount] = useState('');

  // Cargar comunas cuando se selecciona una región
  useEffect(() => {
    if (selectedRegionId) {
      apiCall(`http://localhost:3001/api/communes/communes/${selectedRegionId}`,'GET', null, token)
        .then(setCommunes)
        .catch(error => console.error('Error al cargar las comunas:', error));
    } else {
      setCommunes([]); // Limpiar comunas si no hay región seleccionada
    }
  }, [selectedRegionId, token]);

  // Cargar promociones cuando se selecciona una comuna
  useEffect(() => {
    if (selectedCommuneId) {
      // Cambiar el endpoint para obtener promociones por comuna
      apiCall(`http://localhost:3001/api/sales/promotions/commune/${selectedCommuneId}`,'GET', null, token)
        .then(setPromotions)
        .catch(error => console.error('Error al cargar las promociones:', error));
    } else {
      setPromotions([]); // Limpiar promociones si no hay comuna seleccionada
    }
  }, [selectedCommuneId, token]);

  // Cargar monto de instalación cuando se selecciona una promoción
  useEffect(() => {
    if (selectedPromotionId) {
      apiCall(`http://localhost:3001/api/sales/installation-amounts/promotion/${selectedPromotionId}`,'GET', null, token)
        .then(response => setInstallationAmount(response))
        .catch(error => console.error('Error al cargar el monto de instalación:', error));
    } else {
      setInstallationAmount(''); // Limpiar el monto si no hay promoción seleccionada
    }
  }, [selectedPromotionId, token]);

  // Manejar cambios de selección
  const handleRegionChange = (event) => {
    setSelectedRegionId(event.target.value);
    setSelectedCommuneId(''); // Limpiar comuna seleccionada
    setSelectedPromotionId(''); // Limpiar promoción seleccionada
    setInstallationAmount(''); // Limpiar monto de instalación
  };

  const handleCommuneChange = (event) => {
    setSelectedCommuneId(event.target.value);
    setSelectedPromotionId(''); // Limpiar promoción seleccionada
    setInstallationAmount(''); // Limpiar monto de instalación
  };

  const handlePromotionChange = (event) => {
    setSelectedPromotionId(event.target.value);
  };

  return (
    <div className="card">
      <h3>Seleccione una Región</h3>
      <select value={selectedRegionId} onChange={handleRegionChange}>
        <option value="">Seleccione una región</option>
        {regions.map(region => (
          <option key={region.region_id} value={region.region_id}>
            {region.region_name}
          </option>
        ))}
      </select>

      {selectedRegionId && (
        <>
          <h3>Seleccione una Comuna</h3>
          <select value={selectedCommuneId} onChange={handleCommuneChange}>
            <option value="">Seleccione una comuna</option>
            {communes.map(commune => (
              <option key={commune.commune_id} value={commune.commune_id}>
                {commune.commune_name}
              </option>
            ))}
          </select>
        </>
      )}

      {selectedCommuneId && (
        <>
          <h3>Seleccione una Promoción</h3>
          <select value={selectedPromotionId} onChange={handlePromotionChange}>
            <option value="">Seleccione una promoción</option>
            {promotions.length === 0 ? (
              <option value="">No hay promociones asociadas</option>
            ) : (
              promotions.map(promotion => (
                <option key={promotion.promotion_id} value={promotion.promotion_id}>
                  {promotion.promotion}
                </option>
              ))
            )}
          </select>
        </>
      )}

      {selectedPromotionId && (
        <div>
          <h3>Monto de Instalación</h3>
          <p>{installationAmount && installationAmount.amount ? installationAmount.amount : 'No disponible'}</p>
        </div>
      )}
    </div>
  );
};




// AddCommuneToRegion component
const AddCommuneToRegion = ({ token, regions }) => {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [communeName, setCommuneName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegionChange = (regionId) => {
    setSelectedRegionId(regionId);
  };

  const handleCommuneNameChange = (e) => {
    setCommuneName(e.target.value);
  };

  const handleAddCommuneToRegion = async (e) => {
    e.preventDefault();
    if (!communeName || !selectedRegionId) {
      alert('Por favor complete todos los campos.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await apiCall(`http://localhost:3001/api/communes/regions/${selectedRegionId}/communes`, 'POST', {
        commune_name: communeName,
      }, `Bearer ${token}`);
      alert(result.message);
      setCommuneName('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error al agregar la comuna a la región:', error);
      alert('Error al agregar comuna a la región');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comunas-tarifas-form" onSubmit={handleAddCommuneToRegion}>
      <h3>Seleccionar Región:</h3>
      <select value={selectedRegionId} onChange={(e) => handleRegionChange(e.target.value)} className="comunas-tarifas-select">
        <option value="">Seleccione una región</option>
        {regions.map((region) => (
          <option key={region.region_id} value={region.region_id}>{region.region_name}</option>
        ))}
      </select>

      <div className="comunas-tarifas-field-group">
        <label htmlFor='communeName'>Nombre de la Comuna:
          <input
            id="communeName"
            name="communeName"
            type="text"
            value={communeName}
            onChange={handleCommuneNameChange}
            required
          />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="comunas-tarifas-submit-button">Agregar Comuna</button>
    </form>
  );
};

const UpdateCommune = ({ token, regions }) => {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [communes, setCommunes] = useState([]);
  const [selectedCommuneId, setSelectedCommuneId] = useState('');
  const [communeName, setCommuneName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedRegionId) {
      apiCall(`http://localhost:3001/api/communes/communes/${selectedRegionId}`,'GET', null, token)
        .then(setCommunes)
        .catch(error => console.error('Error loading communes:', error));
    }
  }, [selectedRegionId, token]);

  const handleRegionChange = (regionId) => {
    setSelectedRegionId(regionId);
    setSelectedCommuneId('');
  };

  const handleCommuneChange = (communeId) => {
    setSelectedCommuneId(communeId);
  };

  const handleCommuneNameChange = (e) => {
    setCommuneName(e.target.value);
  };

  const handleUpdateCommune = async (e) => {
    e.preventDefault();
    if (!communeName || !selectedCommuneId) {
      alert('Por favor complete todos los campos.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await apiCall(`http://localhost:3001/api/communes/${selectedCommuneId}`, 'PUT', {
        commune_name: communeName,
      }, `Bearer ${token}`);
      alert(result.message);
      setCommuneName('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error updating commune:', error);
      alert('Error al actualizar la comuna');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comunas-tarifas-form" onSubmit={handleUpdateCommune}>
      <h3>Seleccionar Región:</h3>
      <select value={selectedRegionId} onChange={(e) => handleRegionChange(e.target.value)} className="comunas-tarifas-select">
        <option value="">Seleccione una región</option>
        {regions.map((region) => (
          <option key={region.region_id} value={region.region_id}>{region.region_name}</option>
        ))}
      </select>

      <h3>Seleccionar Comuna:</h3>
      <select value={selectedCommuneId} onChange={(e) => handleCommuneChange(e.target.value)} className="comunas-tarifas-select">
        <option value="">Seleccione una comuna</option>
        {communes.map((commune) => (
          <option key={commune.commune_id} value={commune.commune_id}>{commune.commune_name}</option>
        ))}
      </select>

      <div className="comunas-tarifas-field-group">
        <label htmlFor='communeName'>Nombre de la Comuna:
          <input
            id="communeName"
            name="communeName"
            type="text"
            value={communeName}
            onChange={handleCommuneNameChange}
            required
          />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="comunas-tarifas-submit-button">Actualizar Comuna</button>
    </form>
  );
};

const AssignPromotion = ({ token, regions, promotions }) => {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [communes, setCommunes] = useState([]);
  const [selectedCommuneId, setSelectedCommuneId] = useState('');
  const [selectedPromotionIds, setSelectedPromotionIds] = useState([]);

  useEffect(() => {
    if (selectedRegionId) {
      // Cargar las comunas para la región seleccionada
      apiCall(`http://localhost:3001/api/communes/communes/${selectedRegionId}`,'GET', null, token)
        .then(setCommunes)
        .catch(error => console.error('Error al cargar las comunas:', error));
    } else {
      setCommunes([]); // Limpiar las comunas si no hay región seleccionada
    }
  }, [selectedRegionId, token]);

  const handleRegionChange = (event) => {
    setSelectedRegionId(event.target.value); // Guardar el ID de la región seleccionada
    setSelectedCommuneId(''); // Limpiar la comuna seleccionada
  };

  const handleCommuneChange = (event) => {
    setSelectedCommuneId(event.target.value); // Guardar el ID de la comuna seleccionada
  };

  const handlePromotionChange = (promotionId, isChecked) => {
    setSelectedPromotionIds((prev) =>
      isChecked ? [...prev, promotionId] : prev.filter((id) => id !== promotionId)
    );
  };

  const handleAssignPromotionToCommune = async (e) => {
    e.preventDefault();
    if (selectedPromotionIds.length === 0 || !selectedCommuneId) {
      alert('Debe seleccionar al menos una comuna y una promoción.');
      return;
    }
    try {
      const result = await apiCall(`http://localhost:3001/api/promotions/communes/${selectedCommuneId}/promotions`, 'POST', {
        promotionIds: selectedPromotionIds,
      }, `Bearer ${token}`);
      alert(result.message);
    } catch (error) {
      console.error('Error al asignar la promoción a la comuna:', error);
      alert('Error al asignar la promoción a la comuna');
    }
  };

  return (
    <form onSubmit={handleAssignPromotionToCommune}>
      <h3 className="comunas-tarifas-header">Seleccionar Región:</h3>
      <select
        className="comunas-tarifas-field"
        value={selectedRegionId}
        onChange={handleRegionChange}
      >
        <option value="">Seleccione una región</option>
        {regions.map(region => (
          <option key={region.region_id} value={region.region_id}>
            {region.region_name}
          </option>
        ))}
      </select>

      <h3 className="comunas-tarifas-header">Seleccionar Comuna:</h3>
      <select
        className="comunas-tarifas-field"
        value={selectedCommuneId}
        onChange={handleCommuneChange}
        disabled={!selectedRegionId}
      >
        <option value="">Seleccione una comuna</option>
        {communes.map(commune => (
          <option key={commune.commune_id} value={commune.commune_id}>
            {commune.commune_name}
          </option>
        ))}
      </select>

      <h3 className="comunas-tarifas-header">Seleccionar Promociones:</h3>
      {promotions.map((promotion) => (
        <div key={promotion.promotion_id} className="comunas-tarifas-field-group">
          <input
            className="comunas-tarifas-field"
            type="checkbox"
            id={`promotion-${promotion.promotion_id}`}
            value={promotion.promotion_id}
            onChange={(e) => handlePromotionChange(promotion.promotion_id, e.target.checked)}
          />
          <label htmlFor={`promotion-${promotion.promotion_id}`} className="comunas-tarifas-field-group">
            {promotion.promotion}
          </label>
        </div>
      ))}

      <button className="comunas-tarifas-submit-button" type="submit">
        Asignar Promoción
      </button>
    </form>
  );
};


// Main ComunasTarifas component
const Comunas = () => {
  const { token } = useContext(UserContext);
  const [regions, setRegions] = useState([]);
  const [setInstallationAmounts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  
  const [isOpenAssignPromotionToCommune, toggleAssignPromotionToCommune] = useToggleCard();
  const [isOpenAddCommuneToRegion, toggleAddCommuneToRegion] = useToggleCard();
  const [isOpenUpdateCommune, toggleUpdateCommune] = useToggleCard();
  const [isOpenViewOptions, toggleViewOptions] = useToggleCard();

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [regionsData, installationAmountsData, promotionsData] = await Promise.all([
          apiCall('http://localhost:3001/api/regions','GET', null, token),
          apiCall('http://localhost:3001/api/promotions/installation-amounts','GET', null, token),
          apiCall('http://localhost:3001/api/promotions', 'GET', null, token)
        ]);
        setRegions(regionsData);
        setInstallationAmounts(installationAmountsData);
        setPromotions(promotionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token, setInstallationAmounts]);

  return (
    <div className='card-grid'>
      <Card title="Ver Opciones de Promoción e Instalación" isOpen={isOpenViewOptions} toggle={toggleViewOptions}>
        <ViewOptions token={token} regions={regions} />
      </Card>

      <Card title="Agregar Comuna a Región" isOpen={isOpenAddCommuneToRegion} toggle={toggleAddCommuneToRegion}>
        <AddCommuneToRegion token={token} regions={regions} />
      </Card>

      <Card title="Actualizar Comuna" isOpen={isOpenUpdateCommune} toggle={toggleUpdateCommune}>
        <UpdateCommune token={token} regions={regions} />
      </Card>

      <Card title="Asignar Promoción a Comuna" isOpen={isOpenAssignPromotionToCommune} toggle={toggleAssignPromotionToCommune}>
        <AssignPromotion
          token={token}
          regions={regions}
          promotions={promotions}
        />
      </Card>
    </div>
  );
};


export default Comunas;