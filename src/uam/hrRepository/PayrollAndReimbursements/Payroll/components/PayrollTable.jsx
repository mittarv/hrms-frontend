import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { 
  payrollTableColumns, 
  applySortToData,
  applyStatusFilterToData,
  Payroll_Status,
  PAYROLL_STATUS_LABELS,
  COMPONENT_TYPES,
  CURRENCY_SYMBOL,
  EMPTY_VALUE,
  LOP_KEYWORDS
} from "../utils/PayrollUtils";
import { storePayrollContext } from "../../../Common/utils/encryptionUtils";
import Edit_Icon from "../.././../../../assets/icons/edit_blue_icon.svg";
import LoadingSpinner from "../../../Common/components/LoadingSpinner";
import "../styles/PayrollTable.scss";

const PayrollTable = ({ 
  onSelectionChange,
  resetCounter
}) => {
  const { 
    payrollData, 
    payrollLoading, 
    payrollFilters,
    payrollPagination
  } = useSelector((state) => state.hrRepositoryReducer);

  const { 
    searchQuery, 
    selectedSortOption, 
    selectedStatusFilter 
  } = payrollFilters;

  const { currentPage } = payrollPagination;

  const sortOption = selectedSortOption;
  const statusFilter = selectedStatusFilter;
  const loading = payrollLoading;
  const [processedData, setProcessedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Reset selections when page changes
  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [currentPage]);

  // Listen to external reset requests via resetCounter
  useEffect(() => {
    if (resetCounter > 0) {
      setSelectedRows(new Set());
      setSelectAll(false);
    }
  }, [resetCounter]);

  // Transform API data to match table format
  const transformPayrollData = useCallback((apiData) => {
    return apiData.map((employee, index) => {
      // Check if payroll is generated
      const isPayrollGenerated = employee.status === Payroll_Status.PAYROLL_GENERATED;
      
      // Find LOP component (but don't include it in default deductions calculation)
      const lopComponent = employee.defaultDeductions.find(
        ded => LOP_KEYWORDS.some(keyword => ded.componentName.toLowerCase().includes(keyword))
      );
      const lopPerDay = lopComponent ? lopComponent.amount : 0;
      
      // For generated payrolls, use LOP amount directly from API
      // For non-generated payrolls, calculate using unpaidLeave * lopPerDay
      const lopDeduction = isPayrollGenerated 
        ? (lopComponent?.amount || 0)
        : (employee.unpaidLeave > 0 ? (lopPerDay * employee.unpaidLeave) : 0);

      // Calculate total default deductions (exclude LOP component from base deductions)
      const totalDefaultDeductions = employee.defaultDeductions.reduce((sum, ded) => {
        // Don't include LOP component in default deductions sum
        const isLopComponent = LOP_KEYWORDS.some(keyword => ded.componentName.toLowerCase().includes(keyword));
        if (isLopComponent) {
          return sum;
        }
        return sum + (ded.amount || 0);
      }, 0);

      // Total taxes/deductions = default deductions (excluding LOP) + actual LOP deduction
      const totalTaxesDeductions = totalDefaultDeductions + lopDeduction;

      // Additional deductions (manual adjustments)
      const totalAdditionalDeductions = employee.deductions.reduce((sum, ded) => {
        return sum + (ded.amount || 0);
      }, 0);

      // Calculate additions
      const totalAdditions = employee.additions.reduce((sum, add) => {
        return sum + (add.amount || 0);
      }, 0);

      // For generated payrolls, use netPay directly from API
      // For non-generated payrolls, calculate: monthlyCTC + additions - taxes/deductions - additional deductions
      const netPay = isPayrollGenerated 
        ? employee.netPay
        : (employee.monthlyCTC + totalAdditions - totalTaxesDeductions - totalAdditionalDeductions);

      return {
        // Use payslipId if present, otherwise fall back to empUuid or a stable index-based id
        id: employee.payslipId ?? employee.empUuid ?? `row-${index}`,
        empUuid: employee.empUuid,
        name: employee.empName,
        monthlyCtc: `${CURRENCY_SYMBOL} ${employee.monthlyCTC.toLocaleString('en-IN')}`,
        additions: totalAdditions > 0 
          ? `${CURRENCY_SYMBOL} ${totalAdditions.toLocaleString('en-IN')}`
          : EMPTY_VALUE,
        taxesDeductions: totalTaxesDeductions > 0
          ? `${CURRENCY_SYMBOL} ${totalTaxesDeductions.toLocaleString('en-IN')}`
          : EMPTY_VALUE,
        deductions: totalAdditionalDeductions > 0
          ? `${CURRENCY_SYMBOL} ${totalAdditionalDeductions.toLocaleString('en-IN')}`
          : EMPTY_VALUE,
        unpaidLeave: employee.unpaidLeave,
        lopPerDay: lopPerDay,
        lopDeduction: lopDeduction,
        netPay: `${CURRENCY_SYMBOL} ${netPay.toLocaleString('en-IN')}`,
        status: employee.status === Payroll_Status.PENDING ? PAYROLL_STATUS_LABELS.PENDING : 
                employee.status === Payroll_Status.PAYROLL_FINALIZED ? PAYROLL_STATUS_LABELS.PAYROLL_FINALIZED : 
                employee.status === Payroll_Status.PAYROLL_GENERATED ? PAYROLL_STATUS_LABELS.PAYROLL_GENERATED : PAYROLL_STATUS_LABELS.PENDING,
        // Keep original data for editing
        defaultAdditions: employee.defaultAdditions,
        defaultDeductions: employee.defaultDeductions,
        additionsData: employee.additions,
        deductionsData: employee.deductions,
      };
    });
  }, []);

  // Handle opening modal for additions, deductions, or info modals
  const handleEditComponent = async (employee, componentType) => {
    
    // Allow viewing monthlyCTC and taxesDeduction even for finalized payrolls
    // const isViewOnly = componentType === COMPONENT_TYPES.MONTHLY_CTC || componentType === COMPONENT_TYPES.TAXES_DEDUCTION;
    
    // if (!isViewOnly && (employee.status === PAYROLL_STATUS_LABELS.PAYROLL_GENERATED)) {
    //   return; // Don't allow editing for finalized/generated payrolls
    // }

    // Store sensitive data in session storage instead of URL
    const sessionKey = await storePayrollContext({
      employeeId: employee.empUuid,
      employeeName: employee.name,
      payslipId: employee.id,
      componentType: componentType,
      status: employee.status, // Pass status to determine if view-only
      // Include additional data for modal
      defaultAdditions: employee.defaultAdditions,
      defaultDeductions: employee.defaultDeductions,
      additionsData: employee.additionsData,
      deductionsData: employee.deductionsData,
      unpaidLeave: employee.unpaidLeave,
      lopPerDay: employee.lopPerDay,
      lopDeduction: employee.lopDeduction,
    });

    const params = new URLSearchParams(searchParams);
    
    // Clear any legacy params first
    params.delete('employeeId');
    params.delete('payslipId');
    params.delete('employeeName');
    
    // Set only the secure params
    params.set('componentModal', componentType);
    params.set('session', sessionKey); // Only pass session key, not actual IDs
    setSearchParams(params);
  };

  // Process data based on search query, sort option, and status filter
  useEffect(() => {
    // Transform API data first
    let transformedData = transformPayrollData(payrollData);
    let filteredData = transformedData;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredData = filteredData.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.monthlyCtc.includes(searchQuery) ||
          employee.netPay.includes(searchQuery)
      );
    }

    // Apply status filter
    filteredData = applyStatusFilterToData(filteredData, statusFilter);

    // Apply sorting
    filteredData = applySortToData(filteredData, sortOption);

    setProcessedData(filteredData);
  }, [searchQuery, sortOption, statusFilter, payrollData, transformPayrollData]);

  // Update select all checkbox state based on selected rows
  useEffect(() => {
    if (processedData.length === 0) {
      setSelectAll(false);
      return;
    }

    // Filter out employees with PAYROLL_GENERATED status (they can't be selected)
    const selectableEmployees = processedData.filter(
      (emp) => emp.status !== PAYROLL_STATUS_LABELS.PAYROLL_GENERATED
    );

    // If there are no selectable employees, uncheck select all
    if (selectableEmployees.length === 0) {
      setSelectAll(false);
      return;
    }

    const selectableIds = new Set(selectableEmployees.map((emp) => emp.id));
    const selectedSelectableIds = new Set(
      [...selectedRows].filter((id) => selectableIds.has(id))
    );

    // Select all is checked only if all selectable employees are selected
    setSelectAll(selectedSelectableIds.size === selectableEmployees.length);
  }, [selectedRows, processedData]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [selectedRows, onSelectionChange]);

  const handleSelectAll = (checked) => {
    if (checked) {
      // Add all filtered row IDs to selection, but exclude PAYROLL_GENERATED status
      const newSelected = new Set(selectedRows);
      processedData.forEach((employee) => {
        // Only select if not generated
        if (employee.status !== PAYROLL_STATUS_LABELS.PAYROLL_GENERATED) {
          newSelected.add(employee.id);
        }
      });
      setSelectedRows(newSelected);
    } else {
      // Remove all filtered row IDs from selection
      const newSelected = new Set(selectedRows);
      processedData.forEach((employee) => {
        newSelected.delete(employee.id);
      });
      setSelectedRows(newSelected);
    }
  };

  const handleRowSelect = (employeeId, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedRows(newSelected);
  };

  const isRowSelected = (employeeId) => {
    return selectedRows.has(employeeId);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "payroll finalized":
        return "status-finalized";
      case "payroll generated":
        return "status-generated";
      default:
        return "status-pending";
    }
  };

  const renderEditableCell = (value, column, employee) => {

    if (column.editable) {
  
      // Determine component type based on column key
      let componentType = COMPONENT_TYPES.ADDITION;
      if (column.key === 'additions') {
        componentType = COMPONENT_TYPES.ADDITION;
      } else if (column.key === 'deductions') {
        componentType = COMPONENT_TYPES.DEDUCTION;
      } else if (column.key === 'taxesDeductions') {
        componentType = COMPONENT_TYPES.TAXES_DEDUCTION;
      }
      
      // Special rendering for taxes/deductions - clickable cell without edit icon
      if (column.key === 'taxesDeductions') {
        return (
          <div 
            className={`clickable-cell-container`}
            onClick={() => handleEditComponent(employee, componentType)}
          >
            <span className="cell-value">{value == null || value === "" ? EMPTY_VALUE : value}</span>
          </div>
        );
      }
      
      // Regular editable cells with edit icon (additions and deductions)
      return (
        <div className="editable-cell-container">
          <span className="cell-value">{value == null || value === "" ? EMPTY_VALUE : value}</span>
           <span 
             className={`edit-icon clickable`}
             onClick={() => {
               handleEditComponent(employee, componentType);
             }}
           >
              <img src={Edit_Icon} alt="edit icon" />
            
          </span>
        </div>
      );
    }
    return value == null || value === "" ? EMPTY_VALUE : value;
  };

  const renderCell = (employee, column) => {
    const value = employee[column.accessor];
    const isPayrollGenerated = employee.status === PAYROLL_STATUS_LABELS.PAYROLL_GENERATED;

    switch (column.key) {
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={isRowSelected(employee.id)}
            onChange={(e) => handleRowSelect(employee.id, e.target.checked)}
            disabled={isPayrollGenerated}
            style={{ cursor: isPayrollGenerated ? 'not-allowed' : 'pointer' }}
          />
        );
      case "monthlyCtc":
        // Clickable cell to show CTC breakdown
        return (
          <div 
            className="clickable-cell-container clickable"
            onClick={() => handleEditComponent(employee, COMPONENT_TYPES.MONTHLY_CTC)}
          >
            <span className="cell-value">{value}</span>
          </div>
        );
      case "status":
        return (
          <span className={`status-badge ${getStatusClass(value)}`}>
            
            {value}
          </span>
        );
      case "netPay":
        return <span className="net-pay-value">{value}</span>;
      default:
        return renderEditableCell(value, column, employee);
    }
  };

  return (
    <div className="payroll-container">
      <div className="payroll-summary-header">
        <h2>Payroll Summary</h2>
      </div>

      <div className="log-table">
        {loading ? (
          <div className="loading-message">
            <LoadingSpinner message="Loading payroll data..." height="40vh" />
          </div>
        ) : processedData.length > 0 ? (
          <table className="payroll_table">
            <thead>
              <tr>
                {payrollTableColumns.map((column) => (
                  <th key={column.key} className={column.className}>
                    {column.key === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    ) : (
                      <>
                        {column.header}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((employee) => (
                <tr
                  key={employee.id}
                  className={isRowSelected(employee.id) ? "selected-row" : ""}
                >
                  {payrollTableColumns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {renderCell(employee, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data-message">
            <p>No payroll data found</p>
            {searchQuery && (
              <p className="no-data-subtext">
                No employees match your search criteria &quot;{searchQuery}
                &quot;
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollTable;
