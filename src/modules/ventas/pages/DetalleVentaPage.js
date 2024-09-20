import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import './DetalleVenta.css'; // Asegúrate de importar el CSS

const SaleDetailPage = ({ saleId, onBack }) => {
  const { token, roleId } = useContext(UserContext);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedSale, setUpdatedSale] = useState({});

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

        if (!response.ok) {
          throw new Error(`Error fetching sale details: ${response.status} ${response.statusText}`);
        }

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSale((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const endpoint = roleId === 3 
      ? `http://localhost:3001/api/sales/update/executive/${saleId}`
      : `http://localhost:3001/api/sales/update/${saleId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSale),
      });

      if (!response.ok) {
        throw new Error(`Error updating sale: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSale(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  if (loading) {
    return <div>Loading sale details...</div>;
  }

  if (!sale) {
    return <div>No details found for this sale.</div>;
  }

  return (
    <div className="sale-detail-page">
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <button onClick={onBack}>⬅️ Volver</button>
      </div>
      <h1 className="sale-detail-header">Detalles de la Venta</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>
      {isEditing ? (
        <div className="sale-detail-form">
          <div className="sale-detail-fields-group">
            {/* Fila 1 */}
            <div className="sale-detail-field-group">
              <label>Fecha de Ingreso:
                <input type="text" name="entry_date" value={updatedSale.entry_date} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Nombres:
                <input type="text" name="client_first_name" value={updatedSale.client_first_name} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Apellidos:
                <input type="text" name="client_last_name" value={updatedSale.client_last_name} onChange={handleChange} />
              </label>
            </div>
  
            {/* Fila 2 */}
            <div className="sale-detail-field-group">
              <label>RUT:
                <input type="text" name="client_rut" value={updatedSale.client_rut} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Correo Electrónico:
                <input type="email" name="client_email" value={updatedSale.client_email} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Número de Teléfono:
                <input type="text" name="client_phone" value={updatedSale.client_phone} onChange={handleChange} />
              </label>
            </div>
  
            {/* Fila 3 */}
            <div className="sale-detail-field-group">
              <label>Número Secundario (Opcional):
                <input type="text" name="client_secondary_phone" value={updatedSale.client_secondary_phone} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Región:
                <input type="text" name="region_id" value={updatedSale.region_id} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Comuna:
                <input type="text" name="commune_id" value={updatedSale.commune_id} onChange={handleChange} />
              </label>
            </div>
  
            {/* Fila 4 */}
            <div className="sale-detail-field-group">
              <label>Calle/Avenida:
                <input type="text" name="street" value={updatedSale.street} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Número:
                <input type="text" name="number" value={updatedSale.number} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Departamento/Oficina/Piso:
                <input type="text" name="department_office_floor" value={updatedSale.department_office_floor} onChange={handleChange} />
              </label>
            </div>
  
            {/* Fila 5 */}
            <div className="sale-detail-field-group">
              <label>Geo Referencia:
                <input type="text" name="geo_reference" value={updatedSale.geo_reference} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Promoción:
                <input type="text" name="promotion_id" value={updatedSale.promotion_id} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Monto de Instalación:
                <input type="text" name="installation_amount_id" value={updatedSale.installation_amount_id} onChange={handleChange} />
              </label>
            </div>
  
            {/* Fila 6 */}
            <div className="sale-detail-field-group">
              <label>Estado de la Venta:
                <input type="text" name="sale_status_id" value={updatedSale.sale_status_id} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Número de Orden:
                <input type="text" name="order_number" value={updatedSale.order_number} onChange={handleChange} />
              </label>
            </div>
            <div className="sale-detail-field-group">
              <label>Comentarios Adicionales:
                <input type="text" name="additional_comments" value={updatedSale.additional_comments} onChange={handleChange} />
              </label>
            </div>
  
            {/* Fila 7 */}
            <div className="sale-detail-field-group">
              <label>Imágenes:
                <input type="file" name="images" multiple />
              </label>
            </div>
            <div className="sale-detail-field-group" style={{ gridColumn: 'span 2' }}>
              <button onClick={handleUpdate}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="sale-detail-form">
          <div className="sale-detail-fields-group">
            {/* Fila 1 */}
            <div className="sale-detail-field-group">
              <p>Fecha de Ingreso: {sale.entry_date}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Nombres: {sale.client_first_name}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Apellidos: {sale.client_last_name}</p>
            </div>
  
            {/* Fila 2 */}
            <div className="sale-detail-field-group">
              <p>RUT: {sale.client_rut}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Correo Electrónico: {sale.client_email}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Número de Teléfono: {sale.client_phone}</p>
            </div>
  
            {/* Fila 3 */}
            <div className="sale-detail-field-group">
              <p>Número Secundario (Opcional): {sale.client_secondary_phone}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Región: {sale.region_id}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Comuna: {sale.commune_id}</p>
            </div>
  
            {/* Fila 4 */}
            <div className="sale-detail-field-group">
              <p>Calle/Avenida: {sale.street}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Número: {sale.number}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Departamento/Oficina/Piso: {sale.department_office_floor}</p>
            </div>
  
            {/* Fila 5 */}
            <div className="sale-detail-field-group">
              <p>Geo Referencia: {sale.geo_reference}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Promoción: {sale.promotion_id}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Monto de Instalación: {sale.installation_amount_id}</p>
            </div>
  
            {/* Fila 6 */}
            <div className="sale-detail-field-group">
              <p>Estado de la Venta: {sale.sale_status_id}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Número de Orden: {sale.order_number}</p>
            </div>
            <div className="sale-detail-field-group">
              <p>Comentarios Adicionales: {sale.additional_comments}</p>
            </div>
  
            {/* Fila 7 */}
            <div className="sale-detail-field-group">
              <p>Imágenes: {sale.images?.map(img => <img src={img} alt="Imagen" key={img} />)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );  
};

export default SaleDetailPage;
