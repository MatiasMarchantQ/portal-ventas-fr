import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';

// Componente de alto orden para verificar permisos
const withAuthorization = (WrappedComponent, allowedRoles) => {
  return (props) => {
    const { roleId } = useContext(UserContext);
    const navigate = useNavigate();

    if (!allowedRoles.includes(roleId)) {
      // Redirigir a la página de error o inicio si no tiene permisos
      navigate('/unauthorized');
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuthorization;
