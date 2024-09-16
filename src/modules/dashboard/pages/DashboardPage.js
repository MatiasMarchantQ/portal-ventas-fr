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
import './Dashboard.css';

const DashboardPage = () => {
  const { roleId } = useContext(UserContext);
  const [selectedOption, setSelectedOption] = useState('Ventas'); // Valor inicial como 'Ventas'

  const handleMenuClick = (option) => {
    setSelectedOption(option); // Actualiza la opción seleccionada
  };

  const content = useMemo(() => {
    switch (selectedOption) {
      case 'Ventas':
        return <VentasPage />;
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

  if (!roleId) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <Header />
      <div className="content-area">
        <Menu className="menu-sidebar" role_id={roleId} onMenuClick={handleMenuClick} />
        <div className="page-container">
          <ContentContainer>
            {content}
          </ContentContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
