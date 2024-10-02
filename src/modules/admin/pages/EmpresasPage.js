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
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Error de autenticación');
    } else {
      throw new Error('API call failed');
    }
  }
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

const SwapCompanyPriority = ({ token, companies }) => {
  const [companyId1, setCompanyId1] = useState('');
  const [companyId2, setCompanyId2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompanyId1Change = (e) => {
    setCompanyId1(e.target.value);
  };

  const handleCompanyId2Change = (e) => {
    setCompanyId2(e.target.value);
  };

  const handleSwapPriority = async (e) => {
    e.preventDefault();
    if (!companyId1 || !companyId2) {
      alert('Por favor complete todos los campos.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await apiCall(`http://localhost:3001/api/companies/swap-priority-levels`, 'POST', {
        companyId1,
        companyId2,
      }, token);
      alert(result.message);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error al intercambiar prioridad de empresas:', error);
      alert('Error al intercambiar prioridad de empresas');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSwapPriority}>
      <h3>Intercambiar prioridad de empresas</h3>
      <select value={companyId1} onChange={handleCompanyId1Change}>
        <option value="">Seleccione una empresa</option>
        {companies.map((company) => (
          <option key={company.company_id} value={company.company_id}>
            {company.company_name} (Prioridad: {company.priority_level})
          </option>
        ))}
      </select>
      <select value={companyId2} onChange={handleCompanyId2Change}>
        <option value="">Seleccione otra empresa</option>
        {companies.map((company) => (
          <option key={company.company_id} value={company.company_id}>
            {company.company_name} (Prioridad: {company.priority_level})
          </option>
        ))}
      </select>
      <button type="submit" disabled={isSubmitting}>Intercambiar prioridad</button>
    </form>
  );
};

// Main ComunasTarifas component
const Empresas = () => {
  const { token } = useContext(UserContext);
  const [isOpenSwapPriority, toggleSwapPriority] = useToggleCard();
  const [companies,setCompanies] = useState([]);




  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [companiesData] = await Promise.all([
          apiCall('http://localhost:3001/api/companies', 'GET', null, token)
        ]);
        setCompanies(companiesData);
        console.log(companiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className='card-grid'>
      <Card title="Intercambiar prioridad de empresas" isOpen={isOpenSwapPriority} toggle={toggleSwapPriority}>
        <SwapCompanyPriority token={token} companies={companies} />
      </Card>
    </div>
  );
};


export default Empresas;