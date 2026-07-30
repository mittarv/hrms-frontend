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
  LOP_KEYWORDS,
  getAllMonthsLocale
} from "../utils/PayrollUtils";
import { storePayrollContext } from "../../../Common/utils/encryptionUtils";
import Edit_Icon from "../../../assets/icons/edit_blue_icon.svg";
import downloadIconBlue from "../../../assets/icons/download_icon_blue.svg";
import LoadingSpinner from "../../../Common/components/LoadingSpinner";
import NoResultsContainer from "../../../Common/components/NoResultsContainer";
import PayslipPreview from "../../Payslip/components/PayslipPreview";
import { downloadPayslipPdf } from "../../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import "../styles/PayrollTable.scss";
import Delete_icon from "../../../assets/icons/delete_red_icon.svg";
import Skip_Icon from "../../../assets/icons/suspend_icon.svg";
import Restore_Icon from "../../../assets/icons/restore_icon.svg";
import ConfirmationPopup from "../../../Common/components/ConfirmationPopup.jsx";

const PayrollTable = ({ 
  onSelectionChange,
  resetCounter,
  onDeleteRow,
  onSkipRow,
  onRestoreRow
}) => {
  const { 
    payrollData, 
    payrollLoading, 
    payrollFilters,
    payrollPagination,
    hasGeneratedRecords,
    myHrmsAccess
  } = useSelector((state) => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const hasPayrollAccess = hasPermission("Payroll_read");

  const { 
    searchQuery, 
    selectedSortOption, 
    selectedStatusFilter,
    selectedMonth,
    selectedYear
  } = payrollFilters;

  const { currentPage } = payrollPagination;
  // const currentDate = new Date();
  // const currentMonthName = getAllMonthsLocale()[currentDate.getMonth()];
  // const normalizeMonthName = (monthValue) => {
  //   if (monthValue === null || monthValue === undefined || monthValue === "") {
  //     return "";
  //   }

  //   if (typeof monthValue === "number") {
  //     return getAllMonthsLocale()[monthValue - 1] || "";
  //   }

  //   const numericMonth = Number(monthValue);
  //   if (!Number.isNaN(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
  //     return getAllMonthsLocale()[numericMonth - 1] || "";
  //   }

  //   return String(monthValue).trim();
  // };

  // const firstLoadedPayrollDate = payrollData?.[0]?.payrollStartDate;
  // const loadedPayrollDate = firstLoadedPayrollDate ? new Date(firstLoadedPayrollDate) : currentDate;
  // const loadedPayrollMonthName = loadedPayrollDate.toLocaleDateString("en-US", { month: "long" });
  // const loadedPayrollYear = loadedPayrollDate.getFullYear();

  // const resolvedViewMonthName = selectedMonth != null
  //   ? normalizeMonthName(selectedMonth)
  //   : loadedPayrollMonthName;
  // const resolvedViewYear = selectedYear != null
  //   ? Number(selectedYear)
  //   : loadedPayrollYear;

  // const isCurrentMonthView =
  //   String(resolvedViewMonthName).toLowerCase() === currentMonthName.toLowerCase() &&
  //   Number(resolvedViewYear) === currentDate.getFullYear();

  const sortOption = selectedSortOption;
  const statusFilter = selectedStatusFilter;
  const loading = payrollLoading;
  const [processedData, setProcessedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const canDelete = hasPermission("Payroll_Edit");

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'confirm',
    heading: '',
    message: '',
    onConfirm: null,
    confirmText: 'Yes, Continue',
    cancelText: 'Cancel'
  });

  const handleConfirmDelete = async (employee) => {
    // Close modal first
    setModalState(prev => ({ ...prev, isOpen: false }));
    // If parent provided a delete handler, call it
    if (typeof onSelectionChange === 'function' && typeof onSelectionChange !== 'undefined') {
      // Note: `onSelectionChange` is used for selections; prefer an explicit prop `onDeleteRow` if provided.
    }
    if (typeof onDeleteRow === 'function') {
      try {
        await onDeleteRow(employee);
      } catch (err) {
        // swallow - parent should handle errors
        console.error('Error deleting payroll row:', err);
      }
    } else {
      // No delete handler provided — just log for now
    }
  };

  const handleSkipPayroll = async (employee) => {
    // Close modal first
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (typeof onSkipRow === 'function') {
      try {
        await onSkipRow(employee);
      } catch (err) {
        console.error('Error skipping payroll row:', err);
      }
    } else {
    }
  };

  const handleRestorePayroll = async (employee) => {
    // Close modal first
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (typeof onRestoreRow === 'function') {
      try {
        await onRestoreRow(employee);
      } catch (err) {
        console.error('Error restoring payroll row:', err);
      }
    } else {
    }
  };

  // Payslip preview state
  const [showPayslipPreview, setShowPayslipPreview] = useState(false);
  const [selectedPayslipForPreview, setSelectedPayslipForPreview] = useState(null);
  const [previewEmployeeId, setPreviewEmployeeId] = useState(null);

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
      
      const lopComponent = employee.defaultDeductions.find(
        ded => LOP_KEYWORDS.some(keyword => ded.componentName.toLowerCase().includes(keyword))
      );
      
      const lopTotalDeduction = lopComponent ? (lopComponent.amount || 0) : 0;
      
      // The backend returns the TOTAL LOP deduction in lopComponent.amount for non-generated payrolls.
      // To get the per-day rate, we need to divide it by unpaidLeave (if unpaidLeave > 0)
      const lopPerDay = (employee.unpaidLeave > 0) 
        ? lopTotalDeduction / employee.unpaidLeave 
        : lopTotalDeduction;
      
      // Both generated and non-generated payrolls already have the total deduction calculated from the backend
      const lopDeduction = lopTotalDeduction;

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
        payrollStartDate: employee.payrollStartDate,
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
                employee.status === Payroll_Status.PAYROLL_GENERATED ? PAYROLL_STATUS_LABELS.PAYROLL_GENERATED : 
                employee.status === Payroll_Status.SKIPPED ? PAYROLL_STATUS_LABELS.SKIPPED : PAYROLL_STATUS_LABELS.PENDING,
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

  const handleShowPayslip = (employee) => {
    // Construct payslipItems from the available data
    // We need to map component objects to match what PayslipPreview expects
    const mapComponent = (comp, type) => ({
      ...comp,
      componentType: type,
      payrollItemId: comp.payrollItemId || comp.componentId || Math.random().toString(36).substr(2, 9),
      componentName: comp.componentName || comp.name,
      amount: comp.amount || 0
    });

    const payslipItems = [
      ...(employee.defaultAdditions || []).map(c => mapComponent(c, 'defaultAddition')),
      ...(employee.additionsData || []).map(c => mapComponent(c, 'addition')),
      ...(employee.defaultDeductions || []).map(c => mapComponent(c, 'defaultDeduction')),
      ...(employee.deductionsData || []).map(c => mapComponent(c, 'deduction')),
    ];

    // Map month name to index (0-11)
    const monthIndex = getAllMonthsLocale().indexOf(selectedMonth);
    const validMonth = monthIndex !== -1 ? monthIndex : new Date().getMonth();
    const validYear = selectedYear || new Date().getFullYear();

    const selectedPayslip = {
      payslipItems,
      payslipId: (employee.status === PAYROLL_STATUS_LABELS.PAYROLL_GENERATED || employee.status === PAYROLL_STATUS_LABELS.PAYROLL_FINALIZED) ? employee.id : null,
      status: employee.status,
      payrollStatus: employee.status,
      netPay: employee.netPay.replace(/[^\d.]/g, ''), // Remove currency symbol and formatting
      payrollStartDate: new Date(validYear, validMonth, 1).toISOString(),
    };

    setSelectedPayslipForPreview(selectedPayslip);
    setPreviewEmployeeId(employee.empUuid);
    setShowPayslipPreview(true);
  };

  const handleDownloadDirect = (employeeId) => {
    dispatch(downloadPayslipPdf(employeeId));
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
      case "skipped":
        return "status-skipped";
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
      case "netPay": {
        const canDownload = employee.status === PAYROLL_STATUS_LABELS.PAYROLL_GENERATED && hasPayrollAccess;
        return (
          <div className="net-pay-cell-container">
            <span 
              className={`net-pay-value ${hasPayrollAccess ? "clickable" : ""}`} 
              onClick={() => hasPayrollAccess && handleShowPayslip(employee)}
            >
              {value}
            </span>
            {canDownload && (
              <button 
                className="direct-download-btn" 
                onClick={() => handleDownloadDirect(employee.id)}
                title="Download Payslip"
              >
                <img src={downloadIconBlue} alt="Download" />
              </button>
            )}
          </div>
        );
      }
      case "manage": {
        const showDelete = canDelete && !hasGeneratedRecords;
        const showSkip = employee.status === PAYROLL_STATUS_LABELS.PAYROLL_FINALIZED && !hasGeneratedRecords;
        const showRestore = employee.status === PAYROLL_STATUS_LABELS.SKIPPED && !hasGeneratedRecords;

        return showDelete || showSkip || showRestore ? (
          <div className="roles_actions_container">
           
            {showSkip && (
              <button
                type="button"
                className="role_action_button delete_button"
                style={{ color: '#8F92A3', borderBottomColor: '#8F92A3' }}
                onClick={() => {
                  setModalState({
                    ...modalState,
                    isOpen: true,
                    type: 'confirm',
                    heading: 'Skip Payroll',
                    message: `Are you sure you want to skip payroll for ${employee.name}?`,
                    onConfirm: () => handleSkipPayroll(employee)
                  });
                }}
              >
                <img src={Skip_Icon} alt="skip" style={{ filter: 'grayscale(100%)' }} />
                <span style={{ marginLeft: 0 }}>Skip</span>
              </button>
            )}
            {showRestore && (
              <button
                type="button"
                className="role_action_button"
                style={{ color: '#2C8E7B', borderBottom: '1px solid #2C8E7B' }}
                onClick={() => {
                  setModalState({
                    ...modalState,
                    isOpen: true,
                    type: 'confirm',
                    heading: 'Restore Payroll',
                    message: `Are you sure you want to restore payroll for ${employee.name}?`,
                    onConfirm: () => handleRestorePayroll(employee)
                  });
                }}
              >
                <img src={Restore_Icon} alt="restore" style={{ width: 14 }} />
                <span style={{ marginLeft: 0 }}>Add</span>
              </button>
            )}
             {showDelete && (
              <button
                type="button"
                className="role_action_button delete_button"
                onClick={() => {
                  // Open confirmation popup for this employee
                  setModalState({
                    ...modalState,
                    isOpen: true,
                    type: 'confirm',
                    heading: 'Delete Payroll',
                    message: `Are you sure you want to delete payroll for ${employee.name}?`,
                    onConfirm: () => handleConfirmDelete(employee)
                  });
                }}
              >
                <img src={Delete_icon} alt="Delete" />
                <span style={{ marginLeft: 0 }}>Delete</span>
              </button>
            )}
          </div>
        ) : (
          EMPTY_VALUE
        );
      }
 
      default:
        return renderEditableCell(value, column, employee);
    }
  };

  return (
    <div className="payroll-container">
      <div className="payroll-summary-header">
        <h2>Payroll Summary</h2>
      </div>

      {loading ? (
        <div className="log-table">
          <div className="loading-message">
            <LoadingSpinner message="Loading payroll data..." height="40vh" />
          </div>
        </div>
      ) : processedData.length > 0 ? (
        <div className="log-table">
          <table className="payroll_table">
            <thead>
              <tr>
                {payrollTableColumns.filter((column) => column.key !== "manage" || !hasGeneratedRecords).map((column) => (
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
                  {payrollTableColumns.filter((column) => column.key !== "manage" || !hasGeneratedRecords).map((column) => (
                    <td key={column.key} className={column.className}>
                      {renderCell(employee, column)}
                    </td>
                  ))}
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
      ) : (
        <NoResultsContainer
          showImage={true}
          message="We couldn't find anyone matching your search."
          subMessage="Try searching with different details."
        />
      )}

      {showPayslipPreview && (
        <PayslipPreview 
          isOpen={showPayslipPreview}
          onClose={() => setShowPayslipPreview(false)}
          selectedPayslip={selectedPayslipForPreview}
          employeeId={previewEmployeeId}
        />
      )}
      <ConfirmationPopup
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        heading={modalState.heading}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
};

export default PayrollTable;
