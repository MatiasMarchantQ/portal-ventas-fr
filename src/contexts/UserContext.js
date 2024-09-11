import React, { createContext, useState, useEffect } from 'react';

// Aquí se crea el contexto del usuario
const UserContext = createContext();

// Función para descifrar el token
const decryptToken = (token) => {
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Descifrar la parte del token que contiene el payload
    return decodedToken;
  } catch (error) {
    console.error('Error al descifrar el token:', error);
    return null;
  }
};

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [roleId, setRoleId] = useState(null);

  // Efecto para actualizar el role_id cuando se establece un nuevo token
  useEffect(() => {
    if (token) {
      const decryptedToken = decryptToken(token);
      if (decryptedToken) {
        const role_id = decryptedToken.role_id;
        setRoleId(role_id);
      }
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ token, setToken, roleId }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider, decryptToken };
