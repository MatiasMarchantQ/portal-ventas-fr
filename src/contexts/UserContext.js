import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserContext = createContext();

const publicRoutes = ['/', '/forgotpassword', '/changepassword', '/resetpassword'];

const decryptToken = (token) => {
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken;
  } catch (error) {
    console.error('Error al descifrar el token:', error);
    return null;
  }
};

const isTokenExpired = (token) => {
  const decryptedToken = decryptToken(token);
  if (decryptedToken && decryptedToken.exp) {
    return Date.now() >= decryptedToken.exp * 1000;
  }
  return true;
};

const clearToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [roleId, setRoleId] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      const decryptedToken = decryptToken(storedToken);
      if (decryptedToken) {
        setRoleId(decryptedToken.role_id);
        setUserId(decryptedToken.user_id);
      }
      
      // Monitorear la expiración del token
      const expirationTime = decryptedToken.exp * 1000 - Date.now();
      const warningTime = 5 * 60 * 1000; // 5 minutos antes de expirar
      console.log('Tiempo hasta la expiración:', expirationTime);

      if (expirationTime > 0) {
        const timer = setTimeout(() => {
          alert('Tu sesión ha expirado. Haz clic en "Aceptar" para ser redirigido.');
          clearToken();
          setToken(null);
          setRoleId(null);
          setUserId(null);
          navigate('/');
        }, expirationTime);

        return () => clearTimeout(timer);
      }

      // Si el tiempo de advertencia se ha pasado
      if (expirationTime < warningTime && expirationTime > 0) {
        alert('Tu sesión expira pronto. Por favor guarda tu trabajo.');
      }
    } else {
      clearToken();
      setToken(null);
      setRoleId(null);
      setUserId(null);
      if (!isPublicRoute) {
        navigate('/');
      }
    }
  }, [navigate, location]);

  return (
    <UserContext.Provider value={{ token, setToken, roleId, userId }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider, decryptToken };
