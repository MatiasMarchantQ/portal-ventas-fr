import React, { useEffect, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './ComunasTarifas.css';

const ComunasTarifasPage = () => {
    const { token, roleId } = useContext(UserContext);

    useEffect(() => {

        const fetchSales = async () => {
          };
      
          fetchSales();
        }, [token, roleId]);

    return (
        <div>
            <h1>Comunas y tarifas</h1>

        </div>
    );
};

export default withAuthorization(ComunasTarifasPage, [1]);