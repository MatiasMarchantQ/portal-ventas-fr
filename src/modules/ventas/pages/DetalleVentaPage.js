import React, { useContext, useEffect, useState, useCallback } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
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
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const currentSaleId = saleId;

  useEffect(() => {
    if (sale && sale.other_images) {
      setExistingImages(sale.other_images.split(','));
    }
  }, [sale]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newImages.length + files.length > 5) {
      alert('No puedes subir más de 5 imágenes en total');
      return;
    }
    setNewImages([...newImages, ...files]);
  };

  const handleDeleteExistingImage = (index) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  const handleDeleteNewImage = (index) => {
    const newNewImages = [...newImages];
    newNewImages.splice(index, 1);
    setNewImages(newNewImages);
  };

  // Fetch functions
  const fetchSaleDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/sales/${currentSaleId}`, {
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
      if (data.other_images_url) {
        setImages(data.other_images_url);
      }
    } catch (error) {
      console.error('Error in request:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSaleId, token]);

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

  const fetchReasons = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch(`http://localhost:3001/api/sale-statuses/reasons/${updatedSale.sale_status_id}`, {
        method: 'GET',
        headers: headers,
      });
      if (!response.ok) throw new Error('Error fetching reasons');
      const data = await response.json();
      setReasons(data);
    } catch (error) {
      console.error('Error fetching reasons:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch('http://localhost:3001/api/regions', {
        method: 'GET',
        headers: headers,
      });
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
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch(`http://localhost:3001/api/communes/communes/${regionId}`, {
        method: 'GET',
        headers: headers,
      });
      if (!response.ok) throw new Error('Error fetching communes');
      const data = await response.json();
      setCommunes(data);
    } catch (error) {
      console.error('Error fetching communes:', error);
    }
  };
  
  const fetchPromotions = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch(`http://localhost:3001/api/sales/promotions/commune/${updatedSale.commune_id}`, {
        method: 'GET',
        headers: headers,
      });
      if (!response.ok) throw new Error('Error fetching promotions');
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };
  
  const fetchInstallationAmount = async (promotionId) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch(`http://localhost:3001/api/sales/installation-amounts/promotion/${promotionId}`, {
        method: 'GET',
        headers: headers,
      });
      const data = await response.json();
      setInstallationAmount(data.amount);
    } catch (error) {
      console.error('Error al obtener el monto de instalación:', error);
      setInstallationAmount('Error al cargar');
    }
  };

  // Effect hooks
  useEffect(() => {
    fetchSaleDetails();
    fetchSaleStatuses();
    fetchRegions();
  }, [fetchSaleDetails]);

  useEffect(() => {
    if (updatedSale.region_id) fetchCommunes(updatedSale.region_id);
  }, [updatedSale.region_id]);

  useEffect(() => {
    if (updatedSale.commune_id) fetchPromotions();
  }, [updatedSale.commune_id]);

  useEffect(() => {
    if (updatedSale.promotion_id) {
      fetchInstallationAmount(updatedSale.promotion_id);
    }
  }, [updatedSale.promotion_id]);

  useEffect(() => {
    fetchReasons();
  }, [updatedSale.sale_status_id]);

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSale((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSale = async () => {
    if (roleId === 3) {
      updatedSale.sale_status_id = 1;
      updatedSale.sale_status_reason_id = 22;
    }
    const formData = new FormData();

    // Agregar todos los campos del formulario al FormData
    formData.append('sales_channel_id', updatedSale.sales_channel_id);
    formData.append('client_first_name', updatedSale.client_first_name);
    formData.append('client_last_name', updatedSale.client_last_name);
    formData.append('client_rut', updatedSale.client_rut);
    formData.append('client_email', updatedSale.client_email);
    formData.append('client_phone', updatedSale.client_phone);
    formData.append('region_id', updatedSale.region_id);
    formData.append('commune_id', updatedSale.commune_id);
    formData.append('street', updatedSale.street);
    formData.append('number', updatedSale.number);
    formData.append('geo_reference', updatedSale.geo_reference);
    formData.append('promotion_id', updatedSale.promotion_id);
    formData.append('is_priority', updatedSale.is_priority);
    formData.append('sale_status_id', updatedSale.sale_status_id);
    formData.append('company_id', updatedSale.company_id);
    formData.append('company_priority_id', updatedSale.company_priority_id);
    formData.append('sale_status_reason_id', updatedSale.sale_status_reason_id);
    formData.append('installation_amount_id', updatedSale.promotion_id);

    // Agregar imágenes existentes
    formData.append("existing_images", Array.isArray(existingImages) ? existingImages.join(',') : existingImages);
    newImages.forEach((image, index) => {
      formData.append(`other_images`, image);
    });

    if (updatedSale.service_id !== null) {
      formData.append('service_id', updatedSale.service_id);
    }

    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/sales/update/${currentSaleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      console.log(formData);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error actualizando la venta: ${response.status} ${response.statusText}. ${errorData.message}`);
      }
  
      const responseData = await response.json();
      console.log(responseData);
      setSale(responseData);
      setUpdatedSale(responseData);
      setIsEditing(false);
      setUpdateMessage('Venta actualizada con éxito!');
  
      await fetchSaleDetails();
    } catch (error) {
      console.error('Error updating:', error);
      setIsEditing(true);
      setUpdateMessage(`Error al actualizar: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedSale(sale);
  };

  // Render functions
  const renderEditForm = () => (
    <div className="sale-detail-form">
      {renderFormFields()}
      {updateMessage && <div className="update-message">{updateMessage}</div>}
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
      {renderSelectField("Región", "region_id", regions, "region_id", "region_name")}
      {renderSelectField("Comuna", "commune_id", communes, "commune_id", "commune_name")}
      {renderInputField("Calle/Avenida", "street", "text")}
      {renderInputField("Número", "number", "text")}
      {renderInputField("Departamento/Oficina/Piso", "department_office_floor", "text")}
      {renderTextarea("Georeferencia", "geo_reference", 2)}
      {renderSelectField("Promoción", "promotion_id", promotions, "promotion_id", "promotion")}
      {renderReadOnlyField("Monto de Instalación", installationAmount)}
      {renderInputField("Número Orden(Wisphub)", "service_id", "text", true, true)}
      {[1, 2, 3, 4, 5].includes(roleId) && renderEditableSaleStatus()}
      {[1, 2, 4, 5].includes(roleId) && renderEditableReason()}
      {roleId === 3 
        ? renderImageInputs ("Archivos adjuntos", "other_images")
        : renderTextarea("Comentarios adicionales", "additional_comments")
      }
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
          readOnly={roleId === 5 || !editable}
          required={required}
        />
      </label>
    </div>
  );

  const renderSelectField = (label, name, options, valueKey, labelKey) => (
    <div className="sale-detail-field-group">
      <strong>{label}:</strong>
      <select 
        name={name} 
        value={updatedSale[name] || ''} 
        onChange={handleChange} 
        disabled={roleId === 5}
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );

  const renderTextarea = (label, name, rows = 2) => (
    <div className="sale-detail-field-group">
      <label>{label}:</label>
      <textarea
        name={name}
        value={updatedSale[name] !== null ? updatedSale[name] : ""}
        onChange={handleChange}
        rows={rows}
        readOnly={roleId === 5}
        style={{ resize: 'none' }}
        onInput={(e) => {
          e.target.rows = Math.min(10, Math.max(2, e.target.scrollHeight / 20));
        }}
      />
    </div>
  );

  const renderReadOnlyField = (label, value) => (
    <div className="sale-detail-field-group">
      <label>{label}:</label>
      <input
        type="text"
        value={loading ? 'Cargando...' : value}
        readOnly
      />
    </div>
  );

  const renderEditableSaleStatus = () => (
    <div className="sale-detail-field-group">
      {roleId !== 3 && (
        <>
          {[1, 2, 4, 5].includes(roleId) && (
            <strong>Estado de Venta:</strong>
          )}
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
        </>
      )}
      {roleId === 3 && (
        renderTextarea("Comentarios adicionales:", "additional_comments")
      )}
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
          <option key={reason.sale_status_reason_id} value={reason.sale_status_reason_id}>
            {reason.reason_name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderImageInputs = () => (
    <div className="sale-detail-field-group">
      <label>Imágenes:</label>
      <input
        type="file"
        name="other_images"
        multiple
        onChange={handleImageUpload}
        accept="image/*"
      />
      <div className="file-list-container">
        {existingImages.map((image, index) => (
          <div key={`existing-${index}`} className="file-item">
            <a href={image} target="_blank" rel="noopener noreferrer">
              {image.split('/').pop()}
            </a>
            <button
              type="button"
              onClick={() => handleDeleteExistingImage(index)}
              className="delete-button-files"
            >
              X
            </button>
          </div>
        ))}
        {newImages.map((image, index) => (
          <div key={`new-${index}`} className="file-item">
            <span>{image.name}</span>
            <button
              type="button"
              onClick={() => handleDeleteNewImage(index)}
              className="delete-button-files"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSaleDetails = () => (
    <>
      <div className="sale-detail-fields-group">
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
          <ul>
            <li>Nombre: {sale.executive?.first_name} {sale.executive?.last_name}</li>
            <li>Rut: {sale.executive?.rut}</li>
            <li>Email: {sale.executive?.email}</li>
            <li>Celular: {sale.executive?.phone_number}</li>
            {sale.executive?.company && <li>Empresa: {sale.executive.company.company_name}</li>}
            {sale.executive?.salesChannel && <li>Canal de ventas: {sale.executive.salesChannel.channel_name}</li>}
          </ul>
        </div>
        <p></p>
        <p></p>
  
        {renderDetailField("Nombres", sale.client_first_name)}
        {renderDetailField("Apellidos", sale.client_last_name)}
        {renderDetailField("RUT", sale.client_rut)}
        {renderDetailField("Correo Electrónico", sale.client_email)}
        {renderDetailField("Número de Teléfono", sale.client_phone)}
        {renderDetailField("Número Secundario (Opcional)", sale.client_secondary_phone)}
        {renderDetailField("Región", sale.region?.region_name)}
        {renderDetailField("Comuna", sale.commune?.commune_name)}
        <p></p>
        {renderDetailField("Calle/Avenida", sale.street)}
        {renderDetailField("Número casa", sale.number)}
        {renderDetailField("Departamento/Oficina/Piso", sale.department_office_floor)}
        {renderDetailField("Geo Referencia", sale.geo_reference, true)}
        <p></p>
        <p></p>
        {renderDetailField("Promoción", sale.promotion?.promotion)}
        {renderDetailField("Monto de Instalación", sale.installationAmount?.amount)}
        {renderDetailField("Número de Orden", sale.order_number)}
        {renderDetailField("Estado de la Venta", sale.saleStatus?.status_name)}
        {renderDetailField("Motivo", sale.reason?.reason_name)}
        <p></p>
        {renderDetailField("Comentarios Adicionales", sale.additional_comments)}
      </div>
    
      <div className="sale-detail-field-group">
        <div className="sale-detail-images" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '-4rem', marginRight: '9rem'}}>
          <strong>Imágenes:</strong>
          {sale.other_images_url && sale.other_images_url.length > 0 ? (
            <>
              <p>{sale.other_images_url.length === 1 ? "Imagen adjunta:" : "Imágenes adjuntas:"}</p>
              {sale.other_images_url.map((image, index) => (
                <div key={index} style={{marginTop: '10px'}}>
                  <FontAwesomeIcon icon={faImage} style={{fontSize: '24px', color: '#99235C'}} />
                  <a href={image} target="_blank" rel="noopener noreferrer" style={{marginLeft: '5px'}}>
                    Ver imagen {index + 1}
                  </a>
                </div>
              ))}
            </>
          ) : (
            <p>No hay imágenes adjuntadas</p>
          )}
        </div>
      </div>
    </>
  );

  const renderDetailField = (label, value, isGeoReference = false) => (
    <div className="sale-detail-field-group">
      <strong>{label}:</strong> 
      {isGeoReference ? (
        <a href={`https://www.google.com/maps/place/${value}`} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : (
        <p>{value}</p>
      )}
    </div>
  );
  
  if (loading) {
    return <div>Loading sale details...</div>;
  }

  if (!sale) {
    return <div>No details found for this sale.</div>;
  }
  
  return (
    <div className="sale-detail-page">
      <button onClick={onBack}>
        <FontAwesomeIcon icon={faArrowLeftLong} style={{ marginRight: '5px' }} />
        Atrás
      </button>
      <h2>{roleId === 4 ? 'Validar venta' : 'Detalle venta'}</h2>
      {isEditing ? renderEditForm() : renderSaleDetails()}

      {roleId === 3 && (
        <div className="update-message" style={{marginTop: 20}}>
          Atención: Si deseas reingresar la venta, haz clic en el botón "Reingresar" para volver a enviar la venta. Recuerda verificar cuidadosamente los datos para evitar errores.
        </div>
      )}

      <div className='button-group'>
        {isEditing && (
          <button onClick={handleUpdateSale}>
            {roleId === 3 ? "Reingresar" : "Actualizar"}
          </button>
        )}
        {(roleId !== 3 || (roleId === 3 && sale.sale_status_id === 4)) && (
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
};

export default withAuthorization(DetalleVentaPage, [1, 2, 3, 4, 5]);