import React, { useState, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import Header from '../../../components/Header';
import Menu from '../../../components/Menu';
import Footer from '../../../components/Footer';
import ContentContainer from '../../../components/ContentContainer';
import Ventas from '../../../modules/ventas/pages/VentasPage';
import "./Dashboard.css";

const DashboardPage = () => {
  const { roleId } = useContext(UserContext);
  const [selectedOption, setSelectedOption] = useState(null);

  if (!roleId) return <div>Loading...</div>;

  const handleMenuClick = (option) => {
    setSelectedOption(option);
  };

  let content;
  switch (selectedOption) {
    case 'Ventas':
      content = <Ventas />;
      break;
    default:
      content = <div>Select an option from the menu</div>;
  }

  return (
    <div className="dashboard-container">
      <Header />
      <div className="content-area">
        <div>
          <Menu className="menu-sidebar" role_id={roleId} onMenuClick={handleMenuClick} />
        </div>
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
