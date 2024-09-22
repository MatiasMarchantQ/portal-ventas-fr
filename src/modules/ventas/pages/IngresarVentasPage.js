import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './IngresarVenta.css';

const IngresarVentasPage = () => {
  const { token, userId, roleId } = useContext(UserContext);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formValues, setFormValues] = useState({
    client_first_name: '',
    client_last_name: '',
    client_rut: '',
    client_email: '',
    client_phone: '',
    client_secondary_phone: '',
    region_id: '',
    commune_id: '',
    street: '',
    number: '',
    department_office_floor: '',
    geo_reference: '',
    promotion_id: '',
    additional_comments: '',
  });
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [installationAmount, setInstallationAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const allowedRoles = [1, 2, 3];
    if (!allowedRoles.includes(roleId)) {
      console.error('Acceso denegado: No tienes permisos para ver las ventas.');
      return;
    }
    fetchRegions();
  }, [roleId]);

  useEffect(() => {
    if (formValues.region_id) {
      fetchCommunes(formValues.region_id);
    }
  }, [formValues.region_id]);

  useEffect(() => {
    if (formValues.commune_id) {
      fetchPromotions(formValues.commune_id);
    }
  }, [formValues.commune_id]);

  useEffect(() => {
    if (formValues.promotion_id) {
      setLoading(true);
      fetchInstallationAmount(formValues.promotion_id);
    }
  }, [formValues.promotion_id]);

  const fetchRegions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/regions');
      if (!response.ok) throw new Error('Error al obtener las regiones');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error al obtener las regiones:', error);
    }
  };

  const fetchCommunes = async (regionId) => {
    if (!regionId) {
      setCommunes([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/communes/communes/${regionId}`);
      if (!response.ok) throw new Error('Error al obtener las comunas');
      const data = await response.json();
      setCommunes(data);
    } catch (error) {
      console.error('Error al obtener las comunas:', error);
    }
  };

  const fetchPromotions = async (communeId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sales/promotions/commune/${communeId}`);
      if (!response.ok) throw new Error('Error al obtener las promociones');
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error al obtener las promociones:', error);
    }
  };

  const fetchInstallationAmount = async (promotionId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sales/installation-amounts/promotion/${promotionId}`);
      const data = await response.json();
      setInstallationAmount(data.amount);
    } catch (error) {
      console.error('Error al obtener el monto de instalación:', error);
      setInstallationAmount('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setErrorMessage('Solo se pueden subir un máximo de 3 archivos');
      return;
    }
    setErrorMessage('');
    setSelectedFiles(files);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = new Date().toISOString(); // Formato de fecha ISO
    const formData = new FormData();

    // Agregar entry_date al FormData
    formData.append('entry_date', currentDate);

    Object.keys(formValues).forEach((key) => {
      formData.append(key, formValues[key] || '');
    });

    selectedFiles.forEach((file) => {
      formData.append('id_card_image', file);
    });

    try {
      const response = await fetch('http://localhost:3001/api/sales/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al enviar la venta');
      }

      setSuccessMessage('Venta enviada con éxito');
      setErrorMessage('');
      setFormValues({
        client_first_name: '',
        client_last_name: '',
        client_rut: '',
        client_email: '',
        client_phone: '',
        client_secondary_phone: '',
        region_id: '',
        commune_id: '',
        street: '',
        number: '',
        department_office_floor: '',
        geo_reference: '',
        promotion_id: '',
        additional_comments: '',
      });
      setSelectedFiles([]);
      setInstallationAmount('');
    } catch (error) {
      setErrorMessage('Error al enviar la venta');
      setSuccessMessage('');
      console.error('Error al enviar la venta:', error);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ingresar-venta-wrapper">
      <h1 className="ingresar-venta-header">Ingresar venta</h1>
      <form className="ingresar-venta-form" onSubmit={handleSubmit}>
        <div className="ingresar-venta-fields-group">
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_first_name">Nombres</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="client_first_name"
              name="client_first_name"
              value={formValues.client_first_name}
              onChange={handleInputChange}
              autoComplete="given-name"
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_last_name">Apellidos</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="client_last_name"
              name="client_last_name"
              value={formValues.client_last_name}
              onChange={handleInputChange}
              autoComplete="family-name"
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_rut">RUT</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="client_rut"
              name="client_rut"
              value={formValues.client_rut}
              onChange={handleInputChange}
              autoComplete="off"
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_email">Email</label>
            <input
              type="email"
              className="ingresar-venta-field-control"
              id="client_email"
              name="client_email"
              value={formValues.client_email}
              onChange={handleInputChange}
              autoComplete="email"
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_phone">Número celular</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="client_phone"
              name="client_phone"
              value={formValues.client_phone}
              onChange={handleInputChange}
              autoComplete="tel"
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_secondary_phone">Segundo número celular (opcional)</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="client_secondary_phone"
              name="client_secondary_phone"
              value={formValues.client_secondary_phone}
              onChange={handleInputChange}
              autoComplete="tel"
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="region_id">Región</label>
            <select
              className="ingresar-venta-field-control"
              id="region_id"
              name="region_id"
              value={formValues.region_id}
              onChange={handleInputChange}
            >
              <option value="">Seleccione la región</option>
              {regions.map((region) => (
                <option key={region.region_id} value={region.region_id}>
                  {region.region_name}
                </option>
              ))}
            </select>
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="commune_id">Comuna</label>
            <select
              className="ingresar-venta-field-control"
              id="commune_id"
              name="commune_id"
              value={formValues.commune_id}
              onChange={handleInputChange}
            >
              <option value="">Seleccione la comuna</option>
              {communes.map((commune) => (
                <option key={commune.commune_id} value={commune.commune_id}>
                  {commune.commune_name}
                </option>
              ))}
            </select>
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="street">Calle/Avenida</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="street"
              name="street"
              value={formValues.street}
              onChange={handleInputChange}
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="number">Número Casa</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="number"
              name="number"
              value={formValues.number}
              onChange={handleInputChange}
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="department_office_floor">Departamento/Piso</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="department_office_floor"
              name="department_office_floor"
              value={formValues.department_office_floor}
              onChange={handleInputChange}
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="geo_reference">Referencia geográfica</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="geo_reference"
              name="geo_reference"
              value={formValues.geo_reference}
              onChange={handleInputChange}
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="promotion_id">Promoción</label>
            <select
              className="ingresar-venta-field-control"
              id="promotion_id"
              name="promotion_id"
              value={formValues.promotion_id}
              onChange={handleInputChange}
            >
              <option value="">Seleccione la promoción</option>
              {promotions.map((promotion) => (
                <option key={promotion.promotion_id} value={promotion.promotion_id}>
                  {promotion.Promotion.promotion}
                </option>
              ))}
            </select>
          </div>
  
          <div className="ingresar-venta-field-group">
            <label>Monto de instalación:</label>
            <input
              type="text"
              className="ingresar-venta-field-control no-border"
              value={loading ? 'Cargando...' : installationAmount}
              readOnly
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="additional_comments">Comentarios adicionales</label>
            <textarea
              className="ingresar-venta-field-control"
              id="additional_comments"
              name="additional_comments"
              value={formValues.additional_comments}
              onChange={handleInputChange}
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label>Imagen de la cédula de identidad</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>
        <button type="submit" className="ingresar-venta-submit-button">Enviar venta</button>
        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </form>
    </div>
  );  
};

export default withAuthorization(IngresarVentasPage, [1, 2, 3]);