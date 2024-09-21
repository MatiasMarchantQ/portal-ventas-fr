import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './DetalleVenta.css';
const SaleDetailPage = ({ saleId, onBack }) => {
  const { token, roleId } = useContext(UserContext);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedSale, setUpdatedSale] = useState({});
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [installationAmount, setInstallationAmount] = useState(null);
  const [saleStatuses, setSaleStatuses] = useState([]);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/sales/${saleId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`Error fetching sale details: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        setSale(data);
        setUpdatedSale(data);
      } catch (error) {
        console.error('Error in request:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [saleId, token]);

  useEffect(() => {
    fetchRegions();
    fetchSaleStatuses();
  }, []);

  useEffect(() => {
    if (updatedSale.region_id) fetchCommunes(updatedSale.region_id);
  }, [updatedSale.region_id]);

  useEffect(() => {
    if (updatedSale.commune_id) fetchPromotions();
  }, [updatedSale.commune_id]);

  useEffect(() => {
    if (updatedSale.promotion_id) fetchInstallationAmount();
  }, [updatedSale.promotion_id]);

  const fetchRegions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/regions');
      if (!response.ok) throw new Error('Error fetching regions');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchCommunes = async (regionId) => {
    if (!regionId) {
      setCommunes([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/communes/communes/${regionId}`);
      if (!response.ok) throw new Error('Error fetching communes');
      const data = await response.json();
      setCommunes(data);
    } catch (error) {
      console.error('Error fetching communes:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/sales/promotions/commune/${updatedSale.commune_id}`);
      if (!response.ok) throw new Error('Error fetching promotions');
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const fetchInstallationAmount = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/sales/installation-amounts/promotion/${updatedSale.promotion_id}`);
      if (!response.ok) throw new Error('Error fetching installation amount');
      const data = await response.json();
      setInstallationAmount(data);
    } catch (error) {
      console.error('Error fetching installation amount:', error);
    }
  };

  const fetchSaleStatuses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sale-statuses', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Error fetching sale statuses');
      const data = await response.json();
      setSaleStatuses(data);
    } catch (error) {
      console.error('Error fetching sale statuses:', error);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSale((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    let endpoint;
  
    if (roleId === 3) {
      endpoint = `http://localhost:3001/api/sales/update/executive/${saleId}`;
    } else if ([1, 2, 4, 5].includes(roleId)) {
      endpoint = `http://localhost:3001/api/sales/update/${saleId}`;
    } else {
      setUpdateMessage('No tienes permisos para actualizar esta venta');
      return;
    }
    console.log(` Rol ID: ${roleId}, Estado actual: ${sale.sale_status_id}, Intento de actualización a: ${updatedSale.sale_status_id}`);



  
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSale),
      });
  
      if (!response.ok) throw new Error(`Error updating sale: ${response.status} ${response.statusText}`);
  
      const data = await response.json();
      setSale(data);
      setIsEditing(false);
      setUpdateMessage('Venta actualizada con éxito!'); // Mensaje de éxito
    } catch (error) {
      console.error('Error updating:', error);
      setUpdateMessage(`Error al actualizar: ${error.message}`); // Mensaje de error
    }
  };
  

  if (loading) {
    return <div>Loading sale details...</div>;
  }

  if (!sale) {
    return <div>No details found for this sale.</div>;
  }

  const renderEditForm = () => (
    <div className="sale-detail-form">
      {/* Form Fields */}
      {renderFormFields()}
      {roleId === 5 && renderEditableSaleStatus()}
      <button onClick={handleUpdate}>Guardar Cambios</button>
      {updateMessage && <div className="update-message">{updateMessage}</div>} {/* Mensaje de actualización */}
    </div>
  );
  
  const renderFormFields = () => (
    <div className="sale-detail-fields-group">
      {renderInputField("Nombres", "client_first_name", "text", true)}
      {renderInputField("Apellidos", "client_last_name", "text", true)}
      {renderInputField("RUT", "client_rut", "text", true)}
      {renderInputField("Correo Electrónico", "client_email", "email", true)}
      {renderInputField("Número de Teléfono", "client_phone", "text", true)}
      {renderInputField("Número Secundario (Opcional)", "client_secondary_phone", "text", true)}
      
      <select name="region_id" value={updatedSale.region_id || ''} onChange={handleChange} disabled={roleId === 5}>
        <option value="">Selecciona una región</option>
        {regions.map((region) => (
          <option key={region.region_id} value={region.region_id}>
            {region.region_name}
          </option>
        ))}
      </select>
  
      <select name="commune_id" value={updatedSale.commune_id || ''} onChange={handleChange} disabled={roleId === 5}>
        <option value="">Selecciona una comuna</option>
        {communes.map((commune) => (
          <option key={commune.commune_id} value={commune.commune_id}>
            {commune.commune_name}
          </option>
        ))}
      </select>
      <p></p>
  
      {renderInputField("Calle/Avenida", "street", "text", true)}
      {renderInputField("Número", "number", "text", true)}
      {renderInputField("Departamento/Oficina/Piso", "department_office_floor", "text", true)}
      {renderInputField("Georeferencia", "geo_reference", "text", true)}
      <p></p>
      <p></p>
  
      <select name="promotion_id" value={updatedSale.promotion_id || ''} onChange={handleChange} disabled={roleId === 5}>
        <option value="">Selecciona una promoción</option>
        {promotions.map((promotion) => (
          <option key={promotion.promotion_id} value={promotion.promotion_id}>
            {promotion.Promotion.promotion}
          </option>
        ))}
      </select>
  
      <div className="sale-detail-field-group">
        <label>Monto de Instalación:
          <input type="text" value={installationAmount ? installationAmount.amount : ''} readOnly />
        </label>
      </div>
  
      {renderInputField("Número Orden(Wisphub)", "service_id", "text", true)}
      {renderTextarea("Comentarios adicionales", "additional_comments", true)}
    </div>
  );
  
  const renderEditableSaleStatus = () => (
    <div>
      <label>Estado de Venta:
        <select name="sale_status_id" value={updatedSale.sale_status_id || ''} onChange={handleChange}>
          <option value="">Selecciona un estado</option>
          {saleStatuses.map((saleStatus) => (
            <option key={saleStatus.sale_status_id} value={saleStatus.sale_status_id}>
              {saleStatus.status_name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
  
  const renderInputField = (label, name, type = "text", readOnly = false) => (
    <div className="sale-detail-field-group">
      <label>{label}:
        <input type={type} name={name} value={updatedSale[name]} onChange={handleChange} readOnly={readOnly} />
      </label>
    </div>
  );
  

  const renderTextarea = (label, name) => (
    <div className="sale-detail-field-group">
      <label>{label}</label>
      <textarea
        className="sale-detail-field-group-adittional-comments"
        name={name}
        value={updatedSale[name]}
        onChange={handleChange}
      ></textarea>
    </div>
  );

  const renderSaleDetails = () => (
    <div className="sale-detail-fields-group">
      <strong>{sale.executive?.role.role_name}</strong>
        <p></p>
        <p></p>
        <p>{sale.executive?.first_name} {sale.executive?.last_name} {sale.executive?.second_last_name} | {sale.executive?.rut}</p>
        <p>{sale.executive?.email} | {sale.executive?.phone_number}</p>
        <p></p>
        <div className="sale-detail-field-group">
          <p>Fecha de Ingreso: {sale.created_at}</p>
        </div>
        <p></p>
        <p></p>
        <div className="sale-detail-field-group">
          <p>Nombres: {sale.client_first_name}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Apellidos: {sale.client_last_name}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>RUT: {sale.client_rut}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Correo Electrónico: {sale.client_email}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Número de Teléfono: {sale.client_phone}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Número Secundario (Opcional): {sale.client_secondary_phone}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Región: {sale.region?.region_name}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Comuna: {sale.commune?.commune_name}</p>
        </div>
        <p></p>
        <div className="sale-detail-field-group">
          <p>Calle/Avenida: {sale.street}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Número: {sale.number}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Departamento/Oficina/Piso: {sale.department_office_floor}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Geo Referencia: {sale.geo_reference}</p>
        </div>
        <p></p>
        <p></p>
        <div className="sale-detail-field-group">
          <p>Promoción: {sale.promotion?.promotion}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Monto de Instalación: {sale.installationAmount?.amount}</p>
        </div>
        <p></p>
        <div className="sale-detail-field-group">
          <p>Número de Orden: {sale.order_number}</p>
        </div>
        <div className="sale-detail-field-group">
          <p>Comentarios Adicionales: {sale.additional_comments}</p>
        </div>
        <p></p>
        <div className="sale-detail-field-group">
          <p>Estado de la Venta: {sale.saleStatus?.status_name}</p>
        </div>
    </div>
  );

  return (
    <div className="sale-detail-page">
      <button onClick={onBack}>Volver</button>
      <h2>Detalles de Venta</h2>
      {isEditing ? renderEditForm() : renderSaleDetails()}
      
      {!(roleId === 3 && sale.sale_status_id === 1) && (
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancelar" : "Editar"}
        </button>
      )}
    </div>
  );
};


export default withAuthorization(SaleDetailPage, [1, 2, 3, 4, 5]);