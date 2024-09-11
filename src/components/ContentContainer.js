import React from 'react';
import './ContentContainer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

const ContentContainer = ({ children }) => {
  return (
    <div className="content-container">
      <h1>Ventas</h1>
      <div className="toolbar">
        <div className="search-bar">
          <span className="rotation-icon">
            <FontAwesomeIcon icon={faSync} className="rotation-icon" />
          </span>
          <input type="search" placeholder="Search..." />
          <span className="filter-icon">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
          </span>
        </div>
        <button>Ordenar por</button>
      </div>
      <div className="cards-container">
        {children}
      </div>
    </div>
  );
};

export default ContentContainer;