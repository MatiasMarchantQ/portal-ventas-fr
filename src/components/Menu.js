import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.css';

const Menu = ({ role_id }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const navigate = useNavigate();

  let menuOptions = [];
  if (role_id === 1) {
    menuOptions = [
      { label: 'Ventas', href: '/ventas' },
      {
        label: 'Gestión de administración',
        href: '#',
        submenu: [
          { label: 'Registrar usuario', href: '/registrar-usuario' },
          { label: 'Usuarios', href: '/usuarios' },
          { label: 'Comunas y tarifas', href: '/comunas-tarifas' },
        ],
      },
      { label: 'Mi perfil', href: '/mi-perfil' },
      { label: 'Cerrar sesión', href: '#' },
    ];
  } else if (role_id === 2) {
    menuOptions = [
      { label: 'Ventas', href: '/ventas' },
      { label: 'Ingresar Venta', href: '/ingresar-venta' },
      { label: 'Mi perfil', href: '/mi-perfil' },
      { label: 'Cerrar sesión', href: '#' },
    ];
  } else if (role_id === 3 || role_id === 4) {
    menuOptions = [
      { label: 'Ventas', href: '/ventas' },
      { label: 'Mi perfil', href: '/mi-perfil' },
      { label: 'Cerrar sesión', href: '#' },
    ];
  } else if (role_id === 5) {
    menuOptions = [
      { label: 'Ventas', href: '/ventas' },
      { label: 'Mi perfil', href: '/mi-perfil' },
      { label: 'Reportes', href: '/reportes' },
      { label: 'Cerrar sesión', href: '#' },
    ];
  }

  const handleLogout = async () => {
    try {
      // Lógica para cerrar sesión
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ul className="menu-sidebar">
      <h1>Menú</h1>
      <hr />
      <br />
      {menuOptions.map((option, index) => (
        <li key={index}>
          <a
            href={option.href}
            className={option.active ? 'active' : ''}
            onClick={() => {
              if (option.label === 'Cerrar sesión') {
                handleLogout();
              } else if (option.label === 'Gestión de administración') {
                setShowSubmenu(!showSubmenu);
              }
            }}
          >
            {option.label}
            <br />
            {option.submenu && (
              <span className={`arrow ${showSubmenu ? 'up' : 'down'}`} />
            )}
          </a>
          {option.submenu && showSubmenu && (
            <ul>
              {option.submenu.map((submenuOption, submenuIndex) => (
                <li key={submenuIndex}>
                  <a href={submenuOption.href}>{submenuOption.label}</a>
                </li>
              ))}
            </ul>
          )}
          <br />
          <hr />
        </li>
      ))}
    </ul>
  );
};

export default Menu;
