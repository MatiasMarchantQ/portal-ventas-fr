import React, { useState, useEffect } from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      const startPage = Math.max(1, currentPage - 5);
      const endPage = Math.min(totalPages, currentPage + 5);
      const newPages = Array.from({ length: endPage - startPage + 1 }, (_, index) => index + startPage);
      setPages(newPages);
      setLoading(false);
    };
    fetchPages();
  }, [currentPage, totalPages]);

  return (
    <div className="pagination">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <div className="pagination-numbers">
            {pages.map((page) => (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </>
      )}
    </div>
  );
};

export default Pagination;