import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../contexts/UserContext'; // Asegúrate de que la ruta sea correcta

const RegistrarUsuarioPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token, roleId } = useContext(UserContext); // Obtener token y roleId del contexto

  // Add a conditional statement to check the roleId
  if (roleId !== 1) {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  // Rest of your code remains the same...

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    // ...
  };

  return (
    <div className="container">
      <h2>Registrar Nuevo Usuario</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
      </form>
    </div>
  );
};

export default RegistrarUsuarioPage;