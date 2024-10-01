import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './Menu.css';

const Menu = ({ role_id, onMenuClick }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const navigate = useNavigate(); // Inicializa useNavigate

  let menuOptions = [];

  if (role_id === 1) {
    menuOptions = [
      { label: 'Ventas', action: 'Ventas' },
      { label: 'Ingresar venta', action: 'Ingresar venta' },
      {
        label: 'Gestión de administración',
        submenu: [
          { label: 'Registrar usuario', action: 'Registrar usuario' },
          { label: 'Usuarios', action: 'Usuarios' },
          { label: 'Comunas y tarifas', action: 'Comunas y tarifas' },
        ],
      },
      { label: 'Mi perfil', action: 'Mi perfil' },
      { label: 'Cerrar sesión', action: 'Cerrar sesión' },
    ];
  } else if (role_id === 2) {
    menuOptions = [
      { label: 'Ventas', action: 'Ventas' },
      {
        label: 'Gestión de administración',
        submenu: [
          { label: 'Registrar usuario', action: 'Registrar usuario' },
          { label: 'Usuarios', action: 'Usuarios' },
        ],
      },
      { label: 'Mi perfil', action: 'Mi perfil' },
      { label: 'Cerrar sesión', action: 'Cerrar sesión' },
    ];
  } else if (role_id === 3) {
    menuOptions = [
      { label: 'Ventas', action: 'Ventas' },
      { label: 'Ingresar venta', action: 'Ingresar venta' },
      { label: 'Mi perfil', action: 'Mi perfil' },
      { label: 'Cerrar sesión', action: 'Cerrar sesión' },
    ];
  } else if (role_id === 4) {
    menuOptions = [
      { label: 'Ventas', action: 'Ventas' },
      { label: 'Mi perfil', action: 'Mi perfil' },
      { label: 'Cerrar sesión', action: 'Cerrar sesión' },
    ];
  } else if (role_id === 5) {
    menuOptions = [
      { label: 'Ventas', action: 'Ventas' },
      { label: 'Mi perfil', action: 'Mi perfil' },
      { label: 'Cerrar sesión', action: 'Cerrar sesión' },
    ];
  } else if (role_id === 5) {
    menuOptions = [
      { label: 'Ventas', action: 'Ventas' },
      { label: 'Mi perfil', action: 'Mi perfil' },
      { label: 'Reportes', action: 'Reportes' },
      { label: 'Cerrar sesión', action: 'Cerrar sesión' },
    ];
  }

  return (
    <ul className="menu-sidebar">
      <h1>Menú</h1>
      <hr />
      <br />
      {menuOptions.map((option, index) => (
        <li key={index}>
          <button
            onClick={() => {
              if (option.label === 'Cerrar sesión') {
                handleLogout(); // Llama a la función de logout si corresponde
              } else if (option.submenu) {
                setShowSubmenu(!showSubmenu);
              } else {
                onMenuClick(option.action); // Cambia el contenido según la acción
              }
            }}
          >
            {option.label}
            {option.submenu && <span className={`arrow ${showSubmenu ? 'up' : 'down'}`} />}
          </button>
          {option.submenu && showSubmenu && (
            <ul>
              {option.submenu.map((submenuOption, submenuIndex) => (
                <li key={submenuIndex}>
                  <button onClick={() => onMenuClick(submenuOption.action)}>
                    {submenuOption.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <hr />
        </li>
      ))}
    </ul>
  );

  async function handleLogout() {
    try {
      // Obtén el token desde el localStorage o sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // Realiza la solicitud al endpoint de logout
      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envía el token en el header
        }
      });

      if (response.ok) {
        // Si la solicitud fue exitosa, elimina el token y redirige
        console.clear();
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
        navigate('/'); // Redirige al usuario a la página de inicio
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al intentar cerrar sesión:', error);
    }
  }
};

export default Menu;
