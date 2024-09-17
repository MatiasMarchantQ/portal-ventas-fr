import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import Header from '../../../components/Header';
import Menu from '../../../components/Menu';
import Footer from '../../../components/Footer';
import ContentContainer from '../../../components/ContentContainer';
import VentasPage from '../../../modules/ventas/pages/VentasPage';
import RegistrarUsuarioPage from '../../../modules/admin/pages/RegistrarUsuarioPage';
import UsuariosPage from '../../../modules/admin/pages/UsuariosPage';
import ComunasTarifasPage from '../../../modules/admin/pages/ComunasTarifasPage';
import MiPerfilPage from '../../../modules/profile/pages/MiPerfilPage';
import IngresarVentasPage from '../../../modules/ventas/pages/IngresarVentasPage';
import withAuthorization from '../../../contexts/withAuthorization';
import './Dashboard.css';

// Definir el acceso permitido para cada página según role_id
const accessControl = {
  'Ventas': [1, 2, 3, 4, 5],
  'Ingresar venta': [1, 2, 3],
  'Registrar usuario': [1, 2],
  'Usuarios': [1, 2],
  'Comunas y tarifas': [1],
  'Mi perfil': [1, 2, 3, 4, 5],
};

const DashboardPage = () => {
  const { roleId } = useContext(UserContext);
  const [selectedOption, setSelectedOption] = useState('Ventas'); // Valor inicial como 'Ventas'
  const [errorMessage, setErrorMessage] = useState('');

  const handleMenuClick = (option) => {
    if (accessControl[option]?.includes(roleId)) {
      setSelectedOption(option);
      setErrorMessage('');
    } else {
      setErrorMessage('Acceso denegado: No tienes permisos para ver esta página.');
    }
  };

  const content = useMemo(() => {
    switch (selectedOption) {
      case 'Ventas':
        return <VentasPage />;
      case 'Ingresar venta':
        return <IngresarVentasPage />;
      case 'Registrar usuario':
        return <RegistrarUsuarioPage />;
      case 'Usuarios':
        return <UsuariosPage />;
      case 'Comunas y tarifas':
        return <ComunasTarifasPage />;
      case 'Mi perfil':
        return <MiPerfilPage />;
      default:
        return <VentasPage />;
    }
  }, [selectedOption]);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="content-area">
        <Menu className="menu-sidebar" role_id={roleId} onMenuClick={handleMenuClick} />
        <div className="page-container">
          <ContentContainer>
            {errorMessage ? <p>{errorMessage}</p> : content}
          </ContentContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default withAuthorization(DashboardPage, [1, 2, 3, 4, 5, 6]);
