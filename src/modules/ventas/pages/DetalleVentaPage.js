import React, { useContext, useEffect, useState, useCallback } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './DetalleVenta.css';

const DetalleVentaPage = ({ saleId, onBack }) => {
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
  const [reasons, setReasons] = useState([]);
  const [updateMessage, setUpdateMessage] = useState('');
  const id_card_image_url = sale?.id_card_image_url;
  const simple_power_image_url = sale?.simple_power_image_url;
  const house_image_url = sale?.house_image_url;

  const fetchSaleDetails = useCallback(async () => {
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
  }, [saleId, token]);

  useEffect(() => {
    fetchSaleDetails();
  }, [fetchSaleDetails]);

  useEffect(() => {
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
    fetchSaleStatuses();
  }, []);

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/sale-statuses/reasons/${updatedSale.sale_status_id}`);
        if (!response.ok) throw new Error('Error fetching reasons');
        const data = await response.json();
        setReasons(data);
      } catch (error) {
        console.error('Error fetching reasons:', error);
      }
    };
    fetchReasons();
  }, [updatedSale.sale_status_id]);

  useEffect(() => {
    fetchRegions();
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSale((prev) => ({ ...prev, [name]: value }));
  
    if (name === 'sale_status_reason_id') {
      const reasonId = value;
      const reason = reasons.find((reason) => reason.reason_name === reasonId);
      if (reason) {
        setUpdatedSale((prev) => ({ ...prev, sale_status_reason_id: reason.sale_status_reason_id }));
      }
    }
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
      setUpdatedSale(data);
      setIsEditing(false);
      setUpdateMessage('Venta actualizada con éxito!');
      
      // Refresh the sale details to ensure we have the most up-to-date information
      await fetchSaleDetails();
    } catch (error) {
      console.error('Error updating:', error);
      setIsEditing(true);
      setUpdateMessage(`Error al actualizar: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading sale details...</div>;
  }

  if (!sale) {
    return <div>No details found for this sale.</div>;
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedSale(sale);
  };

  const renderEditForm = () => (
    <div className="sale-detail-form">
      {/* Form Fields */}
      {renderFormFields()}
      {updateMessage && <div className="update-message">{updateMessage}</div>} {/* Mensaje de actualización */}
    </div>
  );
  
  const renderFormFields = () => (
    <div className="sale-detail-fields-group">
      {renderInputField("Nombres", "client_first_name", "text")}
      {renderInputField("Apellidos", "client_last_name", "text")}
      {renderInputField("RUT", "client_rut", "text")}
      {renderInputField("Correo Electrónico", "client_email", "email")}
      {renderInputField("Número de Teléfono", "client_phone", "text")}
      {renderInputField("Número Secundario (Opcional)", "client_secondary_phone", "text")}
  

      <div className="sale-detail-field-group">
          <strong>Región:</strong>
          <select 
            name="region_id" 
            value={updatedSale.region_id || ''} 
            onChange={handleChange} 
            disabled={roleId === 5}
          >
            <option value="">Selecciona una región</option>
            {regions.map((region) => (
              <option key={region.region_id} value={region.region_id}>
                {region.region_name}
              </option>
            ))}
          </select>
        </div>
    
        <div className="sale-detail-field-group">
        <strong>Comuna:</strong>
        <select 
          name="commune_id" 
          value={updatedSale.commune_id || ''} 
          onChange={handleChange} 
          disabled={roleId === 5}
        >
          <option value="">Selecciona una comuna</option>
          {communes.map((commune) => (
            <option key={commune.commune_id} value={commune.commune_id}>
              {commune.commune_name}
            </option>
          ))}
        </select>
      </div>
      <div></div>
  
      {renderInputField("Calle/Avenida", "street", "text")}
      {renderInputField("Número", "number", "text")}
      {renderInputField("Departamento/Oficina/Piso", "department_office_floor", "text")}
      {renderInputField("Georeferencia", "geo_reference", "text")}

      <div className="sale-detail-field-group">
        <div className="sale-detail-field-group">
          <strong>Promoción:</strong>
          <select 
            name="promotion_id" 
            value={updatedSale.promotion_id || ''} 
            onChange={handleChange} 
            disabled={roleId === 5}
          >
            <option value="">Selecciona una promoción</option>
            {promotions.map((promotion) => (
              <option key={promotion.promotion_id} value={promotion.promotion_id}>
                {promotion.promotion}
              </option>
            ))}
          </select>
        </div>
      </div>

  
      <div className="sale-detail-field-group">
        <label>Monto de Instalación:
          <input type="text" value={installationAmount ? installationAmount.amount : ''} readOnly />
        </label>
      </div>

      {renderInputField("Número Orden(Wisphub)", "service_id", "textarea", true, true)}
      {[1, 2, 3, 4, 5].includes(roleId) && renderEditableSaleStatus()}
      {[1, 2, 4, 5].includes(roleId) && renderEditableReason()}
      <p></p>
      <p></p>
      {renderTextarea("Comentarios adicionales", "additional_comments")}
    </div>
  );
  const renderEditableSaleStatus = () => (
    <div className="sale-detail-field-group">
      <strong>Estado de Venta:</strong>
      <select 
        name="sale_status_id" 
        value={updatedSale.sale_status_id || ''} 
        onChange={handleChange}
      >
        <option value="">Selecciona un estado</option>
        {saleStatuses.map((saleStatus) => (
          <option key={saleStatus.sale_status_id} value={saleStatus.sale_status_id}>
            {saleStatus.status_name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderEditableReason = () => (
    <div className="sale-detail-field-group">
      <strong>Motivo:</strong>
      <select 
        name="sale_status_reason_id" 
        value={updatedSale.sale_status_reason_id || ''} 
        onChange={handleChange}
      >
        <option value="">Selecciona un motivo</option>
        {reasons.map((reason) => (
          <option key={reason.sale_status_reason_id} value={reason.reason_id}>
            {reason.reason_name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderInputField = (label, name, type = "text", editable = true, required = false) => (
    <div className="sale-detail-field-group">
      <label>{label}:
        <input
          type={type}
          name={name}
          value={updatedSale[name] !== null ? updatedSale[name] : ""}
          onChange={handleChange}
          readOnly={roleId === 5}
          required={required}
        />
      </label>
    </div>
  );
  

  const renderTextarea = (label, name) => (
    <div className="sale-detail-field-group">
      <label>{label}</label>
      <textarea
        className="sale-detail-field-group-adittional-comments"
        name={name}
        value={updatedSale[name] !== null ? updatedSale[name] : ""}
        onChange={handleChange}
        readOnly={roleId === 5}
      ></textarea>
    </div>
  );

  const renderSaleDetails = () => (
    <>
      <div className="sale-detail-fields-group">
        {/* Fecha de Ingreso */}
        <div className="sale-detail-field-group">
          <strong>Fecha de Ingreso:</strong> 
          <p>{new Date(sale.created_at).toLocaleString('es-CL', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })}</p>
        </div>
        <p></p>
        <p></p>
        <div className="executive-info">
          <strong>{sale.executive?.role.role_name}</strong>
          <p>Nombre: {sale.executive?.first_name} {sale.executive?.second_name} {sale.executive?.last_name} {sale.executive?.second_last_name} - Rut: {sale.executive?.rut} - Email: {sale.executive?.email} - Celular: {sale.executive?.phone_number}</p>
        </div>
        <p></p>
        <p></p>
  
        {/* Nombres del Cliente */}
        <div className="sale-detail-field-group">
          <strong>Nombres:</strong> 
          <p>{sale.client_first_name}</p>
        </div>
    
        {/* Apellidos del Cliente */}
        <div className="sale-detail-field-group">
          <strong>Apellidos:</strong> 
          <p>{sale.client_last_name}</p>
        </div>
    
        {/* RUT del Cliente */}
        <div className="sale-detail-field-group">
          <strong>RUT:</strong> 
          <p>{sale.client_rut}</p>
        </div>
    
        {/* Correo Electrónico del Cliente */}
        <div className="sale-detail-field-group">
          <strong>Correo Electrónico:</strong> 
          <p>{sale.client_email}</p>
        </div>
    
        {/* Número de Teléfono del Cliente */}
        <div className="sale-detail-field-group">
          <strong>Número de Teléfono:</strong> 
          <p>{sale.client_phone}</p>
        </div>
    
        {/* Número Secundario del Cliente */}
        <div className="sale-detail-field-group">
          <strong>Número Secundario (Opcional):</strong> 
          <p>{sale.client_secondary_phone}</p>
        </div>
    
        {/* Región del Cliente */}
        <div className="sale-detail-field-group">
          <strong>Región:</strong> 
          <p>{sale.region?.region_name}</p>
        </div>
    
        {/* Comuna del Cliente */}
        <div className="sale-detail-field-group">
          <strong>Comuna:</strong> 
          <p>{sale.commune?.commune_name}</p>
        </div>
        <p></p>
    
        {/* Calle/Avenida */}
        <div className="sale-detail-field-group">
          <strong>Calle/Avenida:</strong> 
          <p>{sale.street}</p>
        </div>
    
        {/* Número de Calle */}
        <div className="sale-detail-field-group">
          <strong>Número casa:</strong> 
          <p>{sale.number}</p>
        </div>
    
        {/* Departamento/Oficina/Piso */}
        <div className="sale-detail-field-group">
          <strong>Departamento/Oficina/Piso:</strong> 
          <p>{sale.department_office_floor}</p>
        </div>
    
        {/* Geo Referencia */}
        <div className="sale-detail-field-group">
          <strong>Geo Referencia:</strong> 
          <p>{sale.geo_reference}</p>
        </div>
        <p></p>
        <p></p>
    
        {/* Promoción */}
        <div className="sale-detail-field-group">
          <strong>Promoción:</strong> 
          <p>{sale.promotion?.promotion}</p>
        </div>
    
        {/* Monto de Instalación */}
        <div className="sale-detail-field-group">
          <strong>Monto de Instalación:</strong> 
          <p>{sale.installationAmount?.amount}</p>
        </div>
  
        {/* Número de Orden */}
        <div className="sale-detail-field-group">
          <strong>Número de Orden:</strong> 
          <p>{sale.order_number}</p>
        </div>
  
        {/* Estado de la Venta */}
        <div className="sale-detail-field-group">
          <strong>Estado de la Venta:</strong> 
          <p>{sale.saleStatus?.status_name}</p>
        </div>
  
        {/* Motivo de la Venta */}
        <div className="sale-detail-field-group">
          <strong>Motivo:</strong> 
          <p>{sale.reason?.reason_name}</p>
        </div>
        <p></p>
    
        {/* Comentarios Adicionales */}
        <div className="sale-detail-field-group">
          <strong>Comentarios Adicionales:</strong> 
          <p>{sale.additional_comments}</p>
        </div>
      </div>
    
      {/* Imágenes Contenedor */}
      <div className="sale-detail-field-group">
        <div className="sale-detail-images" style={{display: 'flex', justifyContent:'flex-end', marginTop: '-3.5rem'}}>
          <strong>Imágenes:</strong>
          {id_card_image_url || simple_power_image_url || house_image_url ? (
            <ul style={{marginLeft: '-7rem'}}>
              {id_card_image_url && (
                <li>
                  <a href={id_card_image_url} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-image"></i> Ver imagen Cédula
                  </a>
                </li>
              )}
              {simple_power_image_url && (
                <li>
                  <a href={simple_power_image_url} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-image"></i> Ver imagen Poder Simple
                  </a>
                </li>
              )}
              {house_image_url && (
                <li>
                  <a href={house_image_url} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-image"></i> Ver Imagen Casa
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p>No disponible</p>
          )}
        </div>
      </div>
    </>
  );
  
  
  return (
    <div className="sale-detail-page">
      <button onClick={onBack}>Atrás</button>
      <h2>{roleId === 4 ? 'Validar venta' : 'Detalle venta'}</h2>
      {isEditing ? renderEditForm() : renderSaleDetails()}

      <div className='button-group'>
        {isEditing && (
          <button onClick={handleUpdate}>Guardar Cambios</button>
        )}
    
        {!(roleId === 3 && sale.sale_status_id === 1) && (
          <button onClick={() => {
            if (isEditing) {
              handleCancelEdit();
            } else {
              setIsEditing(true);
            }
          }}>
            {isEditing ? "Cancelar" : "Editar"}
          </button>
        )}
      </div>
    </div>
  );
}

export default withAuthorization(DetalleVentaPage, [1, 2, 3, 4, 5]);