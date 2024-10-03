import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faArrowLeftLong, faDownload, faStar as faStarSolid, faStar} from '@fortawesome/free-solid-svg-icons';
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
  const fileInputRef = useRef(null);

  const currentSaleId = saleId;

  useEffect(() => {
    if (sale && sale.other_images) {
      setExistingImages(sale.other_images.split(','));
    }
  }, [sale]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages > 5) {
      alert('No puedes subir más de 5 imágenes en total. Se añadirán solo las primeras imágenes hasta alcanzar el límite.');
      const availableSlots = 5 - (existingImages.length + newImages.length);
      const filesToAdd = files.slice(0, availableSlots);
      setNewImages(prevImages => [...prevImages, ...filesToAdd]);
    } else {
      setNewImages(prevImages => [...prevImages, ...files]);
    }
    
    // Reseteamos el valor del input para permitir la selección del mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadAllImages = async () => {
    if (!sale.other_images_url || sale.other_images_url.length === 0) {
      alert('No hay imágenes para descargar.');
      return;
    }

    for (let i = 0; i < sale.other_images_url.length; i++) {
      const imageUrl = sale.other_images_url[i];
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `imagen_${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error al descargar la imagen:', error);
      }
    }
  };

  const handleDeleteExistingImage = (index) => {
    setExistingImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleDeleteNewImage = (index) => {
    setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handlePriorityToggle = async () => {
    try {
      const newPriorityValue = sale.is_priority === 1 ? 0 : 1;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/update-priority/${currentSaleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_priority: newPriorityValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update priority');
      }

      const updatedSaleData = await response.json();
      setSale(prevSale => ({ ...prevSale, is_priority: newPriorityValue }));
      setUpdatedSale(prevUpdatedSale => ({ ...prevUpdatedSale, is_priority: newPriorityValue }));
      setUpdateMessage('Prioridad actualizada con éxito!');
    } catch (error) {
      console.error('Error updating priority:', error);
      setUpdateMessage('Error al actualizar la prioridad');
    }
  };


  // Fetch functions
  const fetchSaleDetails = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/${currentSaleId}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sale-statuses`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sale-statuses/reasons/${updatedSale.sale_status_id}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/regions`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/communes/communes/${regionId}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/promotions/commune/${updatedSale.commune_id}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/installation-amounts/promotion/${promotionId}`, {
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
  
    // Verificar si los datos del formulario han cambiado
    if (JSON.stringify(updatedSale) === JSON.stringify(sale)) {
      alert('No se realizaron cambios');
      return;
    }
    if (updatedSale.sale_status_reason_id === "") {
      setUpdateMessage("Debe seleccionar un motivo");
      return;
    }

    const phoneNumber = updatedSale.client_phone.replace('+56', '') || '';
  
    const formData = new FormData();
  
    // Agregar todos los campos del formulario al FormData
    formData.append('sales_channel_id', updatedSale.sales_channel_id);
    formData.append('client_first_name', updatedSale.client_first_name);
    formData.append('client_last_name', updatedSale.client_last_name);
    formData.append('client_rut', updatedSale.client_rut);
    formData.append('client_email', updatedSale.client_email);
    formData.append('client_phone', phoneNumber);
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
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/update/${currentSaleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    
      const responseData = await response.json();
      setSale(responseData);
      setUpdatedSale(responseData);
      setIsEditing(false);
      setUpdateMessage('Venta actualizada con éxito!');
    
      await fetchSaleDetails();
    } catch (error) {
      setIsEditing(true);
      setUpdateMessage(`Error al actualizar: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedSale(sale);
  };

  // Render functions
  const renderPriorityToggle = () => {
    if (roleId !== 1 && roleId !== 2) return null;
  
    return (
      <div className="priority-toggle">
        <strong>Prioridad:</strong>
        <button onClick={handlePriorityToggle} className="priority-button" style={{ backgroundColor: 'transparent', border: 'none', width: '7%', marginBottom: 10 }}>
          <FontAwesomeIcon 
            icon={sale.is_priority === 1 ? faStarSolid : faStar} 
            style={{ color: sale.is_priority === 1 ? 'gold' : 'gray' }}
          />
        </button>
      </div>
    );
  };

  const renderEditForm = () => (
    <div className="sale-detail-form">
      {renderFormFields()}
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
      <div></div>
      {[1, 2, 3, 4, 5].includes(roleId) && renderEditableSaleStatus()}
      {[1, 2, 4, 5].includes(roleId) && renderEditableReason()}
      {renderInputField("Número Orden(Wisphub)", "service_id", "text")}
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
      <div>
        <input
          ref={fileInputRef}
          type="file"
          name="other_images"
          multiple
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: '10px 5px',
            width: '8rem',
            marginLeft: 5,
            backgroundColor: '#99235C',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Elegir archivos
        </button>
      </div>
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
      <p>Total de imágenes: {existingImages.length + newImages.length}/5</p>
    </div>
  );

  const renderSaleDetails = () => (
    <>
      {renderPriorityToggle()}
      <div className="sale-detail-fields-group">
        <div className="sale-detail-field-group">
          <strong>Fecha de Ingreso:</strong> 
          <p>{new Date(sale.created_at).toLocaleString('es-CL', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false
          })}</p>
        </div>
        <p></p>
        <p></p>
        <div className="executive-info">
        {sale.executive && (
          <div>
            <strong>{sale.executive.role?.role_name || 'Rol no especificado'}</strong>
            <ul>
              <li>Nombre: {sale.executive.first_name} {sale.executive.last_name}</li>
              <li>Rut: {sale.executive.rut}</li>
              <li>Email: {sale.executive.email}</li>
              <li>Celular: {sale.executive.phone_number}</li>
              {sale.executive.company && <li>Empresa: {sale.executive.company.company_name}</li>}
              {sale.executive.salesChannel && <li>Canal de ventas: {sale.executive.salesChannel.channel_name}</li>}
            </ul>
          </div>
        )}
        {!sale.executive && sale.admin && (
          <div>
            <strong>{sale.admin.role?.role_name || 'Rol no especificado'}</strong>
            <ul>
              <li>Nombre: {sale.admin.first_name} {sale.admin.last_name}</li>
              <li>Rut: {sale.admin.rut}</li>
              <li>Email: {sale.admin.email}</li>
              <li>Celular: {sale.admin.phone_number}</li>
              {sale.admin.company && <li>Empresa: {sale.admin.company.company_name}</li>}
              {sale.admin.salesChannel && <li>Canal de ventas: {sale.admin.salesChannel.channel_name}</li>}
            </ul>
          </div>
        )}
        {!sale.executive && !sale.admin && sale.superadmin && (
          <div>
            <strong>{sale.superadmin.role?.role_name || 'Rol no especificado'}</strong>
            <ul>
              <li>Nombre: {sale.superadmin.first_name} {sale.superadmin.last_name}</li>
              <li>Rut: {sale.superadmin.rut}</li>
              <li>Email: {sale.superadmin.email}</li>
              <li>Celular: {sale.superadmin.phone_number}</li>
              {sale.superadmin.company && <li>Empresa: {sale.superadmin.company.company_name}</li>}
              {sale.superadmin.salesChannel && <li>Canal de ventas: {sale.superadmin.salesChannel.channel_name}</li>}
            </ul>
          </div>
        )}
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
              <button onClick={handleDownloadAllImages} style={{marginTop: '10px'}}>
                <FontAwesomeIcon icon={faDownload} style={{marginRight: '5px'}} />
                Descargar imágen(es)
              </button>
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

      {(roleId === 3 && updatedSale.sale_status_id === 4) && (
        <div className="update-message" style={{marginTop: 20}}>
          Atención: Si deseas reingresar la venta, haz clic en el botón "Reingresar" para volver a enviar la venta. Recuerda verificar cuidadosamente los datos para evitar errores.
        </div>
      )}

      {(roleId === 3 && updatedSale.sale_status_id === 4) && (
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
      {updateMessage && <div className="update-message">{updateMessage}</div>}
    </div>
  );
};

export default withAuthorization(DetalleVentaPage, [1, 2, 3, 4, 5]);