import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Crear el contexto del usuario
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

// Función para verificar la expiración del token
const isTokenExpired = (token) => {
  const decryptedToken = decryptToken(token);
  if (decryptedToken && decryptedToken.exp) {
    return Date.now() >= decryptedToken.exp * 1000; // Exp en segundos, convertir a milisegundos
  }
  return true;
};

// Función para eliminar el token de localStorage, sessionStorage y cookies
const clearToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [roleId, setRoleId] = useState(null);
  const [userId, setUserId] = useState(null); // Nuevo estado para el user_id
  const navigate = useNavigate();

  // Efecto para actualizar el role_id, user_id y verificar la expiración del token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      const decryptedToken = decryptToken(storedToken);
      if (decryptedToken) {
        setRoleId(decryptedToken.role_id);
        setUserId(decryptedToken.user_id); // Extraer y establecer el user_id
      }
    } else {
      clearToken();
      setToken(null);
      setRoleId(null);
      setUserId(null);
      navigate('/');
    }
  }, [navigate]);

  return (
    <UserContext.Provider value={{ token, setToken, roleId, userId }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider, decryptToken };
