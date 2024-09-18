import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../contexts/UserContext';

const DetalleVentaPage = ({ saleId, onBack }) => {
  const { token } = useContext(UserContext);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

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
          throw new Error(`Error al obtener los detalles de la venta: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setSale(data);
      } catch (error) {
        console.error('Error en la solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [saleId]);

  if (loading) {
    return <div>Cargando detalles de la venta...</div>;
  }

  if (!sale) {
    return <div>No se encontraron detalles para esta venta.</div>;
  }

  return (
    <div className="detalle-venta-page">
      <button onClick={onBack}>Volver a la lista de ventas</button>
      <h1>Detalles de la Venta</h1>
      <p>Fecha de ingreso: {sale.entry_date}</p>
      <p>Nombre(s): {sale.client_first_name}</p>
      <p>Apellido(s): {sale.client_last_name}</p>
      <p>Rut: {sale.client_rut}</p>
      <p>Email: {sale.client_email}</p>
      <p>Número Celular: {sale.client_phone}</p>
      <p>Segundo número(Opcional): {sale.client_secondary_phone}</p>
      <p>Region: {sale.region_id}</p>
      <p>Comuna: {sale.commune_id}</p>
      <p>Calle: {sale.street}</p>
      <p>Número: {sale.number}</p>
      <p>Piso: {sale.department_office_floor}</p>
      <p>Referencia: {sale.geo_reference}</p>
      <p>Promocion: {sale.promotion_id}</p>
      <p>Monto de instalación: {sale.installation_amount_id}</p>
      <p>Estado de la venta: {sale.sale_status_id}</p>
      <p>ID Servicio: {sale.service_id}</p>
      <p>Comentarios adicionales: {sale.additional_comments}</p>
      <p>Imágenes: {sale.id_card_image}</p>
    </div>
  );
};

export default DetalleVentaPage;
