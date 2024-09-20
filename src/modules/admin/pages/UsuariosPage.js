import React, { useEffect, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './Usuarios.css';

const UsuariosPage = () => {
    const { token, roleId } = useContext(UserContext);

    useEffect(() => {

        const fetchSales = async () => {
          };
      
          fetchSales();
        }, [token, roleId]);

    return (
        <div>
            <h1>Usuarios</h1>

            <div className="users-list">
                {/* Lista de usuarios */}
            </div>

        </div>
    );
};

export default withAuthorization(UsuariosPage, [1, 2]);