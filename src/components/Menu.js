import React, { useState } from 'react';
import './Menu.css';

const Menu = ({ role_id, onMenuClick }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  let menuOptions = [];
  if (role_id === 1) {
    menuOptions = [
      { label: 'Ventas', action: 'Ventas' },
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
  } else if (role_id === 3 || role_id === 4) {
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

  function handleLogout() {
    // Aquí pones el código para cerrar sesión, como limpiar el localStorage y redirigir
    console.log("Logout triggered"); // Ejemplo de mensaje en consola
  }
};

export default Menu;
