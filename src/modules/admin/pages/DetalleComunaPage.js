// DetalleComunaPage.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import './Detalles.css';

const DetalleComunaPage = ({ communeId, onBack }) => {
  const { token } = useContext(UserContext);    
  const [communeDetails, setCommuneDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);

  const fetchCommuneDetails = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/promotions/communes/${communeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      setCommuneDetails(data);
      setEditedDetails(data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los detalles de la comuna: ' + err.message);
      setLoading(false);
    }
  }, [communeId, token]);

  const fetchAvailablePromotions = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/promotions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener las promociones disponibles');
      }
      const data = await response.json();
      setAvailablePromotions(data);
    } catch (err) {
      setError('Error al cargar las promociones disponibles: ' + err.message);
    }
  }, [token]);

  
  useEffect(() => {
    fetchCommuneDetails();
    fetchAvailablePromotions();
  }, [fetchCommuneDetails, fetchAvailablePromotions]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedDetails(communeDetails);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/promotions/communes/${communeId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commune_name: editedDetails.commune_name,
          is_active: editedDetails.is_active,
          promotions: editedDetails.current_promotions.map(promo => ({
            promotion_id: promo.promotion_id,
            promotion: promo.promotion,
            installation_amount_id: promo.installation_amount_id,
            installation_amount: promo.installation_amount,
            is_active: promo.is_active
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los detalles de la comuna');
      }

      setEditing(false);
      fetchCommuneDetails();
    } catch (err) {
      setError('Error al actualizar los detalles de la comuna: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePromotionChange = (promotionId, isChecked) => {
    setEditedDetails(prev => {
      let updatedPromotions;
      if (isChecked) {
        // Agregar o habilitar la promoción
        const promotionToAdd = availablePromotions.find(p => p.promotion_id === promotionId);
        if (prev.current_promotions.some(p => p.promotion_id === promotionId)) {
          // La promoción ya existe, solo actualizamos su estado
          updatedPromotions = prev.current_promotions.map(p =>
            p.promotion_id === promotionId ? { ...p, is_active: true } : p
          );
        } else {
          // Agregar nueva promoción
          updatedPromotions = [...prev.current_promotions, {
            promotion_id: promotionToAdd.promotion_id,
            promotion: promotionToAdd.promotion,
            installation_amount_id: promotionToAdd.installation_amount_id,
            installation_amount: promotionToAdd.InstallationAmounts[0].amount,
            is_active: true
          }];
        }
      } else {
        // Deshabilitar la promoción
        updatedPromotions = prev.current_promotions.map(p =>
          p.promotion_id === promotionId ? { ...p, is_active: false } : p
        );
      }
      return { ...prev, current_promotions: updatedPromotions };
    });
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!communeDetails) return <div>No se encontraron detalles para esta comuna.</div>;

  return (
    <div className="detalle-comuna-container">
      <button className="detalle-comuna-button" onClick={onBack}>← Volver</button>
      <h1 className="detalle-comuna-header">Detalle Comuna</h1>
      
      <div className="detalle-comuna-section">
        <h3>Región</h3>
        <p>{communeDetails.region.region_name}</p>
      </div>
      
      <div className="detalle-comuna-section">
        <h3>Comuna</h3>
        <h4>
          {editing ? (
            <input
              type="text"
              name="commune_name"
              id='commune_name'
              value={editedDetails.commune_name}
              onChange={handleInputChange}
              className="detalle-comuna-input"
            />
          ) : (
            communeDetails.commune_name
          )}
        </h4>
      </div>
      
      <div className="detalle-comuna-section">
        {editing ? (
          <label className="detalle-comuna-label">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={editedDetails.is_active}
              onChange={handleInputChange}
              className="detalle-comuna-checkbox"
            />
            Habilitar comuna
          </label>
        ) : (
          <p>Estado: {communeDetails.is_active ? 'Habilitada' : 'Deshabilitada'}</p>
        )}
      </div>
      
      {editing ? (
        <div className="detalle-comuna-section">
          <h3>Promociones disponibles:</h3>
          {availablePromotions.map((promotion) => {
            const currentPromotion = editedDetails.current_promotions.find(
              p => p.promotion_id === promotion.promotion_id
            );
            const isChecked = currentPromotion ? currentPromotion.is_active : false;
  
            return (
              <div key={promotion.promotion_id}>
                <label className="detalle-comuna-label">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handlePromotionChange(promotion.promotion_id, e.target.checked)}
                    className="detalle-comuna-checkbox"
                  />
                  {promotion.promotion} - Monto de instalación: {promotion.InstallationAmounts[0].amount}
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="detalle-comuna-section">
          <h3>Promociones Actuales</h3>
          {communeDetails.current_promotions.length > 0 ? (
            <ul>
              {communeDetails.current_promotions.map((promotion) => (
                <li key={promotion.promotion_id}>
                  <span>{promotion.promotion}</span><br/ >
                  {''}
                  <span>Monto de instalación: {promotion.installation_amount}</span><br />
                  {''}
                  <span>Estado: {promotion.is_active ? 'Activo' : 'Inactivo'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay promociones activas para esta comuna.</p>
          )}
        </div>
      )}
      
      <div className="detalle-comuna-button-container">
        {editing ? (
          <div>
            <button onClick={handleSave}>Guardar cambios</button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        ) : (
          <button onClick={handleEdit}>Editar</button>
        )}
      </div>
    </div>
  );
};

export default DetalleComunaPage;