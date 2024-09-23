import React, { useState, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import Header from '../../../components/Header';
import Menu from '../../../components/Menu';
import Footer from '../../../components/Footer';
import ContentContainer from '../../../components/ContentContainer';
import VentasPage from '../../../modules/ventas/pages/VentasPage';
import RegistrarUsuarioPage from '../../../modules/admin/pages/RegistrarUsuarioPage';
import UsuariosPage from '../../../modules/admin/pages/UsuariosPage';
import ComunasTarifasPage from '../../../modules/admin/pages/ComunasTarifasPage';
import DetalleUsuarioPage from '../../../modules/admin/pages/DetalleUsuarioPage';
import MiPerfilPage from '../../../modules/profile/pages/MiPerfilPage';
import IngresarVentasPage from '../../../modules/ventas/pages/IngresarVentasPage';
import DetalleVentaPage from '../../../modules/ventas/pages/DetalleVentaPage';
import withAuthorization from '../../../contexts/withAuthorization';
import './Dashboard.css';

const accessControl = {
  'Ventas': [1, 2, 3, 4, 5],
  'Ingresar venta': [1, 2, 3],
  'Registrar usuario': [1, 2],
  'Usuarios': [1, 2],
  'Comunas y tarifas': [1],
  'Mi perfil': [1, 2, 3, 4, 5, 6],
};

const DashboardPage = () => {
  const { roleId } = useContext(UserContext);
  const [selectedOption, setSelectedOption] = useState('Ventas');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleMenuClick = (option) => {
    if (accessControl[option]?.includes(roleId)) {
      setSelectedOption(option);
      setErrorMessage('');
    } else {
      setErrorMessage('Acceso denegado: No tienes permisos para ver esta página.');
    }
  };

  const handleSaleClick = (saleId) => {
    setSelectedSaleId(saleId);
    setSelectedOption('Detalle Venta');
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setSelectedOption('Detalle Usuario');
  };

  const handleBackToSales = () => {
    setSelectedSaleId(null);
    setSelectedOption('Ventas');
  };

  const renderContent = () => {
    if (selectedOption === 'Detalle Venta' && selectedSaleId) {
      return <DetalleVentaPage saleId={selectedSaleId} onBack={handleBackToSales} />;
    } else if (selectedOption === 'Detalle Usuario' && selectedUserId) {
      return <DetalleUsuarioPage userId={selectedUserId} onBack={() => setSelectedOption('Usuarios')} />;
    }
    
    const components = {
      'Ventas': <VentasPage onSaleClick={handleSaleClick} />,
      'Ingresar venta': <IngresarVentasPage />,
      'Registrar usuario': <RegistrarUsuarioPage />,
      'Usuarios': <UsuariosPage onUserClick={handleUserClick} />,
      'Comunas y tarifas': <ComunasTarifasPage />,
      'Mi perfil': <MiPerfilPage />,
    };
  
    return components[selectedOption] || <VentasPage onSaleClick={handleSaleClick} />;
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="content-area">
        <Menu className="menu-sidebar" role_id={roleId} onMenuClick={handleMenuClick} />
        <div className="page-container">
          <ContentContainer>
            {errorMessage ? <p>{errorMessage}</p> : renderContent()}
          </ContentContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default withAuthorization(DashboardPage, [1, 2, 3, 4, 5, 6]);
