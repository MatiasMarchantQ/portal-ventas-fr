import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import withAuthorization from '../../../contexts/withAuthorization';
import './ComunasTarifas.css';

const ComunasTarifasPage = () => {
    const { token, roleId } = useContext(UserContext);

    // Estados para manejar la data de comunas, promociones y monto de instalación
    const [comunas, setComunas] = useState([]);
    const [promociones, setPromociones] = useState([]);
    const [selectedComuna, setSelectedComuna] = useState('');
    const [selectedPromocion, setSelectedPromocion] = useState('');
    const [montoInstalacion, setMontoInstalacion] = useState(0);

    // Simulando la obtención de datos desde un API
    useEffect(() => {
        const fetchSales = async () => {
            // Aquí iría la lógica para obtener comunas, promociones y montos
            setComunas([
                { id: 1, nombre: 'Isla de Maipo' },
                { id: 2, nombre: 'Providencia' }
            ]);

            setPromociones([
                { id: 1, comunaId: 1, descripcion: '400 MBPS $9.995 X 6 meses. Después 19.990 Mensual' },
                { id: 2, comunaId: 1, descripcion: '600 MBPS $9.995 X 6 meses. Después 24.990 Mensual' }
            ]);
        };

        fetchSales();
    }, [token, roleId]);

    const handleSelectComuna = (e) => {
        setSelectedComuna(e.target.value);
    };

    const handleSelectPromocion = (e) => {
        setSelectedPromocion(e.target.value);
        // Simular la obtención del monto de instalación para la promoción seleccionada
        setMontoInstalacion(e.target.value === '1' ? 0 : 15000);
    };

    return (
        <div className="comunas-tarifas-container">
            <h1>Comunas y Tarifas</h1>
            <div className="comunas-tarifas-section">
                {/* Sección de Comunas */}
                <div className="comunas-section">
                    <h2>Comunas</h2>
                    <button>Agregar nueva comuna</button>
                    <select>
                        <option value="Metropolitana">Metropolitana</option>
                    </select>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre Comuna</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comunas.map((comuna) => (
                                <tr key={comuna.id}>
                                    <td>{comuna.nombre}</td>
                                    <td>
                                        <button className="edit-button">✏️</button>
                                        <button className="delete-button">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sección de Promociones */}
                <div className="promociones-section">
                    <h2>Promociones</h2>
                    <button>Agregar nueva promoción</button>
                    <select onChange={handleSelectComuna} value={selectedComuna}>
                        <option value="">Seleccione una comuna</option>
                        {comunas.map((comuna) => (
                            <option key={comuna.id} value={comuna.id}>
                                {comuna.nombre}
                            </option>
                        ))}
                    </select>
                    <table>
                        <thead>
                            <tr>
                                <th>Promoción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promociones
                                .filter((promo) => promo.comunaId === parseInt(selectedComuna))
                                .map((promo) => (
                                    <tr key={promo.id}>
                                        <td>{promo.descripcion}</td>
                                        <td>
                                            <button className="edit-button">✏️</button>
                                            <button className="delete-button">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Sección de Monto de Instalación */}
                <div className="monto-instalacion-section">
                    <h2>Monto de instalación</h2>
                    <select onChange={handleSelectPromocion} value={selectedPromocion}>
                        <option value="">Seleccione una promoción</option>
                        {promociones.map((promo) => (
                            <option key={promo.id} value={promo.id}>
                                {promo.descripcion}
                            </option>
                        ))}
                    </select>
                    <div className="monto-instalacion-display">
                        <p>Monto de instalación</p>
                        <p>{montoInstalacion}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuthorization(ComunasTarifasPage, [1]);
