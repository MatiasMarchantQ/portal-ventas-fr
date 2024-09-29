import React from 'react';

const SaleCard = ({ sale, onSaleClick, getStatusColor }) => (
  <div className="sale-card" onClick={() => onSaleClick(sale.sale_id)}>
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
          {sale.service_id && <p className="info-item purple">{`ID Servicio: ${sale.service_id}`}</p>}
          {sale.client_first_name && sale.client_last_name && (
            <p className="info-item purple">{`Cliente: ${sale.client_first_name} ${sale.client_last_name}`}</p>
          )}
          {sale.client_rut && <p className="info-item purple">{`Rut: ${sale.client_rut}`}</p>}
          {sale.client_phone && <p className="info-item purple">{`Celular: ${sale.client_phone}`}</p>}
        </div>
        <div className="info-bottom">
        {sale.company?.company_name && <p className="info-item gray">{`${sale.company?.company_name}`}</p>}
          {sale.created_at && (
            <p className="info-item gray">
              Fecha de ingreso:{" "}
              {new Date(sale.created_at).toLocaleString("es-CL", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
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

export default SaleCard;