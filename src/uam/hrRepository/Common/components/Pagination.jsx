import PropTypes from "prop-types";
import "../styles/Pagination.scss";

const Pagination = ({ pagination, currentPage, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { totalPages, totalRecords, pageSize } = pagination;

  // Calculate page range to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate showing range
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="payroll_pagination_container">
      <div className="pagination_info">
        <span className="pagination_text">
          Showing {startRecord} to {endRecord} of {totalRecords} employees
        </span>
      </div>

      <div className="pagination_controls">
        {/* First Page Button */}
        <button
          className={`pagination_button ${currentPage === 1 ? "disabled" : ""}`}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          «
        </button>

        {/* Previous Button */}
        <button
          className={`pagination_button ${currentPage === 1 ? "disabled" : ""}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Show first page if not in range */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              className="pagination_button page_number"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="pagination_ellipsis">...</span>}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`pagination_button page_number ${
              pageNum === currentPage ? "active" : ""
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}

        {/* Show last page if not in range */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="pagination_ellipsis">...</span>
            )}
            <button
              className="pagination_button page_number"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          className={`pagination_button ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ›
        </button>

        {/* Last Page Button */}
        <button
          className={`pagination_button ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          »
        </button>
      </div>

      {/* Page Size Selector (optional) */}
      <div className="pagination_page_size">
        <span className="page_size_label">Rows per page:</span>
        <span className="page_size_value">{pageSize}</span>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalRecords: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }),
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
