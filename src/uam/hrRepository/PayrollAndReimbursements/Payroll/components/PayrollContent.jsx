import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getAllEmployeePayrollDetails,
  deletePayrollRecords,
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
    payrollNotFetchedEmployees,
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

  const handleDeleteRow = useCallback(async (employee) => {
    const payslipId = employee?.id;
    if (!payslipId) return;

    await dispatch(deletePayrollRecords(
      [payslipId],
      { currentPage, pageSize, selectedMonth, selectedYear, searchQuery }
    ));
  }, [dispatch, currentPage, pageSize, selectedMonth, selectedYear, searchQuery]);

  const notFetchedPreview = (payrollNotFetchedEmployees || []).slice(0, 5);

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

      {payrollNotFetchedEmployees?.length > 0 && (
        <div className="payroll_not_fetched_notice">
          <div className="payroll_not_fetched_title">
            Payroll is not available for {payrollNotFetchedEmployees.length} employee{payrollNotFetchedEmployees.length > 1 ? 's' : ''}
          </div>
          <div className="payroll_not_fetched_subtitle">
            Please update employee job details or salary configuration for the entries below.
          </div>
          <div className="payroll_not_fetched_list">
            {notFetchedPreview.map((employee) => (
              <div className="payroll_not_fetched_item" key={`${employee.empUuid}-${employee.reason}`}>
                <span className="employee_name">{employee.empName || employee.empUuid}</span>
                <span className="reason_text">{employee.reason}</span>
              </div>
            ))}
          </div>
          {payrollNotFetchedEmployees.length > notFetchedPreview.length && (
            <div className="payroll_not_fetched_more">
              +{payrollNotFetchedEmployees.length - notFetchedPreview.length} more employee{payrollNotFetchedEmployees.length - notFetchedPreview.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div className={`payroll_table_wrapper ${payrollLoading ? 'loading' : ''}`}>
        <PayrollTable 
          onSelectionChange={onSelectionChange}
          resetCounter={resetCounter}
          onDeleteRow={handleDeleteRow}
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
