import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getAllEmployeePayrollDetails,
  setPayrollMonth,
  setPayrollYear,
  setPayrollSortOption,
  setPayrollStatusFilter,
  setPayrollSearchQuery,
  resetPayrollFilters,
  setPayrollCurrentPage
} from "../../../../../actions/hrRepositoryAction.js";
import PayrollSearch from "./PayrollSearch.jsx";
import PayrollFilter from "./PayrollFilter.jsx";
import PayrollTable from "./PayrollTable.jsx";
import PayrollComponentModal from "./PayrollComponentModal.jsx";
import TaxesDeductionsModal from "./TaxesDeductionsModal.jsx";
import MonthlyCTCModal from "./MonthlyCTCModal.jsx";
import PayrollPagination from "../../../Common/components/Pagination.jsx";
import "../styles/PayrollContent.scss";

const PayrollContent = ({ onSelectionChange, resetCounter }) => {
  const dispatch = useDispatch();
  const { 
    payrollLoading, 
    payrollPagination,
    payrollFilters,
  } = useSelector((state) => state.hrRepositoryReducer);

  const { pageSize, currentPage  } = payrollPagination;

  const {selectedMonth, selectedYear, searchQuery} = payrollFilters;

  // Fetch payroll data on component mount and filter/search changes
  useEffect(() => {
    dispatch(getAllEmployeePayrollDetails(currentPage, pageSize, selectedMonth, selectedYear, searchQuery));
  }, [dispatch, currentPage, pageSize, selectedMonth, selectedYear, searchQuery]);

  const handleMonthChange = useCallback((month) => {
    dispatch(setPayrollMonth(month));
  }, [dispatch]);

  const handleYearChange = useCallback((year) => {
    dispatch(setPayrollYear(year));
  }, [dispatch]);

  const handleSortChange = useCallback((sortOption) => {
    dispatch(setPayrollSortOption(sortOption));
  }, [dispatch]);

  const handleStatusFilterChange = useCallback((statusFilter) => {
    dispatch(setPayrollStatusFilter(statusFilter));
  }, [dispatch]);

  const handleFilterReset = useCallback(() => {
    dispatch(resetPayrollFilters());
  }, [dispatch]);

  const handleSearchChange = useCallback((query) => {
    dispatch(setPayrollSearchQuery(query));
  }, [dispatch]);

  const handlePageChange = useCallback((newPage) => {
    // Only update the current page in state
    // The useEffect will handle the API call
    dispatch(setPayrollCurrentPage(newPage));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  return (
    <>
      <div className="payroll_content_main_container">
        <PayrollSearch
          onSearchChange={handleSearchChange}
        />
        <PayrollFilter
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          onSortChange={handleSortChange}
          onStatusFilterChange={handleStatusFilterChange}
          onFilterReset={handleFilterReset}
        />
      </div>
      <div className={`payroll_table_wrapper ${payrollLoading ? 'loading' : ''}`}>
        <PayrollTable 
          onSelectionChange={onSelectionChange}
          resetCounter={resetCounter}
        />
        <PayrollPagination
          pagination={payrollPagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
      <PayrollComponentModal />
      <TaxesDeductionsModal />
      <MonthlyCTCModal />
    </>
  );
};

export default PayrollContent;
