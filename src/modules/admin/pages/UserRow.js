import React from 'react';

const UserRow = ({ user, onUserClick }) => (
  <tr>
    <td>{`${user.first_name} ${user.last_name}`}</td>
    <td>{user.rut}</td>
    <td>{user.email}</td>
    <td>{user.phone_number}</td>
    <td>{user.company ? user.company.company_name : 'No Aplica'}</td>
    <td>{user.salesChannel ? user.salesChannel.channel_name : 'No Aplica'}</td>
    <td>{user.role ? user.role.role_name : 'No Aplica'}</td>
    <td>{user.status === 1 ? 'Activo' : 'Inactivo'}</td>
    <td>
      <button className='detalle-button' onClick={() => onUserClick(user.user_id)}>Ver Detalle</button>
    </td>
  </tr>
);

export default UserRow;