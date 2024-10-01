import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSyncAlt  } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../../contexts/UserContext'; // Asegúrate de que la ruta sea correcta

const SaleCard = ({ sale, onSaleClick, getStatusColor, onPriorityChange, refreshSales }) => {
  const { token, roleId } = useContext(UserContext);
  const [localPriority, setLocalPriority] = useState(sale.is_priority);

  const handlePriorityToggle = async (e) => {
    e.stopPropagation();
    if (roleId !== 1 && roleId !== 2) return;
  
    try {
      const newPriority = localPriority === 1 ? 0 : 1;
      setLocalPriority(newPriority); // Actualiza inmediatamente el estado local
  
      const response = await fetch(`http://localhost:3001/api/sales/update-priority/${sale.sale_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_priority: newPriority }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update priority');
      }
  
      const updatedSale = await response.json();
      onPriorityChange(updatedSale); // Actualiza el estado en el componente padre
      refreshSales(); // Llama a la función handleRefresh para refrescar la página
    } catch (error) {
      console.error('Error updating priority:', error);
      setLocalPriority(sale.is_priority); // Revierte el cambio local si hay un error
    }
  };

  return (
    <div className="sale-card" onClick={() => onSaleClick(sale.sale_id)} style={{ position: 'relative' }}>
      {(roleId === 1 || roleId === 2) && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            cursor: 'pointer',
            zIndex: 1
          }}
          onClick={handlePriorityToggle}
        >
          <FontAwesomeIcon 
            icon={faStar} 
            style={{ 
              color: localPriority === 1 ? 'gold' : 'gray',
              fontSize: '20px'
            }} 
          />
        </div>
      )}
      <div className="sale-card-header">
        <div>
          <p className="sale-status" style={{ 
            width: 100,
            padding: 5, 
            backgroundColor: getStatusColor(sale.sale_status_id), 
            borderRadius: 5, 
            textAlign: 'center' 
          }}>
            {sale.saleStatus ? sale.saleStatus.status_name : 'Estado no disponible'}
          </p>
          {sale.reason?.reason_name && (
            <p className='reason-status' style={{textAlign: 'center'}}>
              <span className="info-item gray" style={{ width: 100 ,fontSize: '12px'}}>
                {`Motivo: ${sale.reason.reason_name}`}
              </span>
            </p>
          )}
        </div>
        <div className="sale-info">
          <div className="info-top">
            {sale.service_id && <p className="info-item purple">{`ID Wisphub: ${sale.service_id}`}</p>}
            {sale.client_first_name && sale.client_last_name && (
              <p className="info-item purple">{`Cliente: ${sale.client_first_name} ${sale.client_last_name}`}</p>
            )}
            {sale.client_rut && <p className="info-item purple">{`${sale.client_rut}`}</p>}
            {sale.client_phone && <p className="info-item purple">{`${sale.client_phone}`}</p>}
          </div>
          <div className="info-bottom">
          {sale.company?.company_name && <p className="info-item gray">{`${sale.company?.company_name}`}</p>}
            {sale.created_at && (
              <p className="info-item gray">
                Ingresada:{" "}
                {new Date(sale.created_at).toLocaleString("es-CL", {
                  year: "numeric", month: "2-digit", day: "2-digit",
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                  hour12: false
                })}
              </p>
            )}
            {sale.client_email && <p className="info-item gray">{sale.client_email}</p>}
            {sale.region?.region_name && <p className="info-item gray">{`Región: ${sale.region.region_name}`}</p>}
            {sale.commune?.commune_name && <p className="info-item gray">{`Comuna: ${sale.commune.commune_name}`}</p>}
            {sale.street && sale.number && (
              <p className="info-item gray">
                {`${sale.street} ${sale.number}${sale.department_office_floor ? ` ${sale.department_office_floor}` : ''}`}
              </p>
            )}
            {sale.additional_comments && (
              <p className="info-item gray">{`Comentarios adicionales: ${sale.additional_comments}`}</p>
            )}
            {sale.Company?.company_name && <p className="info-item gray">{sale.Company?.company_name}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleCard;