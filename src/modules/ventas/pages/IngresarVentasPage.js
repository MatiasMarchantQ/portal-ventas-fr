import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './IngresarVenta.css';

const IngresarVentasPage = () => {
  const { token, userId, roleId } = useContext(UserContext);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForeignRut, setIsForeignRut] = useState(false);
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
  const [isForeignPhone, setIsForeignPhone] = useState(false);
  const [isForeignSecondaryPhone, setIsForeignSecondaryPhone] = useState(false);


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
    if (name === 'client_phone' && !isForeignPhone && !value.startsWith('+569')) {
      setFormValues({ ...formValues, client_phone: '+569' });
    } else if (name === 'client_phone' && !isForeignPhone && value.startsWith('+569')) {
      setFormValues({ ...formValues, client_phone: '+569' + value.replace('+569', '') });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = {
      client_first_name: formValues.client_first_name,
      client_last_name: formValues.client_last_name,
      client_rut: formValues.client_rut,
      client_email: formValues.client_email,
      client_phone: formValues.client_phone,
      client_secondary_phone: formValues.client_secondary_phone,
      region_id: formValues.region_id,
      commune_id: formValues.commune_id,
      street: formValues.street,
      number: formValues.number,
      department_office_floor: formValues.department_office_floor,
      geo_reference: formValues.geo_reference,
      promotion_id: formValues.promotion_id,
      additional_comments: formValues.additional_comments,
    };
  
    const files = selectedFiles;
  
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    files.forEach((file) => {
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

      console.log(formData);
      if (!response.ok) {
        throw new Error('Error al enviar la venta');
      }
  
      const data = await response.json();
      console.log(data);
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
      console.error('Error al enviar la venta:', error);
      setErrorMessage('Error al enviar la venta');
      setSuccessMessage('');
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  const handleRutChange = (e) => {
    const rut = e.target.value;
    if (isForeignRut) {
      // Formato de RUT extranjero (sin puntos ni guión)
      setFormValues({ ...formValues, client_rut: rut.replace(/\D+/g, '') });
    } else {
      // Formato de RUT chileno (con puntos y guión)
      const formattedRut = rut.replace(/\D+/g, '').replace(/^(\d{1,2})(\d{3})(\d{3})(\w{1})$/, '$1.$2.$3-$4');
      setFormValues({ ...formValues, client_rut: formattedRut });
    }
  };

  const handleForeignRutChange = (e) => {
    setIsForeignRut(e.target.checked);
    if (e.target.checked) {
      setFormValues({ ...formValues, client_rut: formValues.client_rut.replace(/\D+/g, '') });
    } else {
      const formattedRut = formValues.client_rut.replace(/\D+/g, '').replace(/^(\d{1,2})(\d{3})(\d{3})(\w{1})$/, '$1.$2.$3-$4');
      setFormValues({ ...formValues, client_rut: formattedRut });
    }
  };

  const handleForeignPhoneChange = (e) => {
    setIsForeignPhone(e.target.checked);
    if (e.target.checked) {
      setFormValues({ ...formValues, client_phone: formValues.client_phone.replace('+569', '') });
    } else {
      setFormValues({ ...formValues, client_phone: '+569' + formValues.client_phone.replace('+569', '') });
    }
  };

  const handleForeignSecondaryPhoneChange = (e) => {
    setIsForeignSecondaryPhone(e.target.checked);
    if (e.target.checked) {
      setFormValues({ ...formValues, client_secondary_phone: formValues.client_secondary_phone.replace('+569', '') });
    } else {
      setFormValues({ ...formValues, client_secondary_phone: '+569' + formValues.client_secondary_phone.replace('+569', '') });
    }
  };

  return (
    <div className="ingresar-venta-wrapper">
      <h1 className="ingresar-venta-header">Ingresar venta</h1>
      <form className="ingresar-venta-form" onSubmit={handleSubmit}>
        <div className="ingresar-venta-fields-group">
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_first_name">Nombres (Primer y Segundo Nombre):</label>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="client_first_name"
              name="client_first_name"
              value={formValues.client_first_name}
              onChange={handleInputChange}
              autoComplete="given-name"
              required
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_last_name">Apellidos (Primer y Segundo Apellido):</label>
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="client_rut">RUT:</label>
              <label>
                <input
                  id="client_rut"
                  name="client_rut"
                  type="checkbox"
                  checked={isForeignRut}
                  onChange={handleForeignRutChange}
                />
                RUT extranjero
              </label>
            </div>
            <input
              type="text"
              className="ingresar-venta-field-control"
              id="client_rut"
              name="client_rut"
              placeholder="123456789"
              value={formValues.client_rut}
              onChange={handleRutChange}
              autoComplete="off"
              required
            />
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="client_email">Email:</label>
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="client_phone">Número celular:</label>
              <label>
                <input
                  type="checkbox"
                  checked={isForeignPhone}
                  onChange={handleForeignPhoneChange}
                />
                Otros
              </label>
            </div>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                className="ingresar-venta-field-control"
                id="client_phone"
                name="client_phone"
                value={formValues.client_phone}
                onChange={handleInputChange}
                autoComplete="tel"
                placeholder={isForeignPhone ? '' : '+569'}
                style={{width: '100%'}}
              />
            </div>
          </div>

          <div className="ingresar-venta-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="client_secondary_phone">2do Número celular(Opcional):</label>
              <label>
                <input
                  type="checkbox"
                  checked={isForeignSecondaryPhone}
                  onChange={handleForeignSecondaryPhoneChange}
                />
                Otros
              </label>
            </div>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                className="ingresar-venta-field-control"
                id="client_secondary_phone"
                name="client_secondary_phone"
                value={formValues.client_secondary_phone}
                onChange={handleInputChange}
                autoComplete="tel"
                placeholder={isForeignPhone ? '' : '+569'}
                style={{width: '100%'}}
              />
            </div>
          </div>
  
          <div className="ingresar-venta-field-group">
            <label htmlFor="region_id">Región:</label>
            <select
              className="ingresar-venta-field-control"
              id="region_id"
              name="region_id"
              value={formValues.region_id}
              onChange={handleInputChange}
              required
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
            <label htmlFor="commune_id">Comuna:</label>
            <select
              className="ingresar-venta-field-control"
              id="commune_id"
              name="commune_id"
              value={formValues.commune_id}
              onChange={handleInputChange}
              required
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
            <label htmlFor="street">Calle/Avenida:</label>
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
            <label htmlFor="number">Número Casa:</label>
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
            <label htmlFor="department_office_floor">Departamento/Oficina/Piso:</label>
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
            <label htmlFor="geo_reference">Referencia geográfica:</label>
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
            <label htmlFor="promotion_id">Promoción:</label>
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
                  {promotion.promotion}
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
              placeholder='Seleccione la promoción'
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