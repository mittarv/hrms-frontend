import { useDispatch, useSelector } from "react-redux";
import { getSalaryComponents, updatePayrollItems} from "../../../../../actions/hrRepositoryAction";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getPayrollContext, clearPayrollContext } from "../../../Common/utils/encryptionUtils";
import { 
  COMPONENT_TYPES, 
  AMOUNT_TYPES,
  convertFrequencyOptionsFromAPI,
} from "../utils/PayrollUtils";
import Cross_icon from "../../../../../assets/icons/cross_icon.svg";
import Cancel_icon from "../../../../../assets/icons/cancel_icon_red.svg";
import Restore_icon from "../../../../../assets/icons/restore_icon.svg";
import "../styles/PayrollComponentModal.scss";

// Constants
const CURRENT_DATE = new Date().toISOString().split('T')[0];

/**
 * Modal for managing payroll component adjustments (additions/deductions)
 * Supports creating, editing, and deleting adjustments for employees
 */
const PayrollComponentModal = () => {
  const dispatch = useDispatch();
  const { 
    globalComponents, 
    loading,  
    payrollPagination,
    payrollFilters, 
    getAllComponentType,
    isAllPayrollGenerated,
  } = useSelector((state) => state.hrRepositoryReducer);
  const [searchParams, setSearchParams] = useSearchParams();
  const [componentRows, setComponentRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const { pageSize, currentPage  } = payrollPagination;

  const {selectedMonth, selectedYear, searchQuery} = payrollFilters;
  
  // Convert dynamic frequency options from API
  const frequencyOptions = useMemo(() => {
    return convertFrequencyOptionsFromAPI(getAllComponentType?.leave_accural_frequency);
  }, [getAllComponentType?.leave_accural_frequency]);

  // Extract modal parameters from URL
  const componentType = searchParams.get('componentModal');
  const sessionKey = searchParams.get('session');
  
  // Retrieve secure payroll context from session storage
  const [payrollContext, setPayrollContext] = useState(null);
  
  useEffect(() => {
    const loadContext = async () => {
      if (!sessionKey) {
        setPayrollContext(null);
        return;
      }
      const context = await getPayrollContext(sessionKey);
      setPayrollContext(context);
    };
    loadContext();
  }, [sessionKey]);

  // Extract context data
  const { 
    employeeName = '', 
    employeeId = '', 
    payslipId = '', 
    status: payrollStatus = '' 
  } = payrollContext || {};
  
  // Determine if modal is in read-only mode
  const isReadOnly = payrollStatus === "Payroll Finalized" || payrollStatus === "Payroll Generated";
  
  // Get filtered components based on type (addition/deduction)
  const filteredComponents = useMemo(() => {
    if (!globalComponents || !componentType) return [];
    return globalComponents.filter(comp => comp.componentType === componentType);
  }, [globalComponents, componentType]);

  /**
   * Creates a new empty row structure for adding components
   */
  const createEmptyRow = useCallback(() => ({
    id: `${Date.now()}-${Math.random()}`,
    adjustmentId: null,
    componentId: '',
    componentName: '',
    amountType: AMOUNT_TYPES.VARIABLE,
    amount: '',
    effectiveTill: '',
    effectiveFrom: '',
    frequency: 'monthly_key',
    isCompleted: false,
    isVariable: true,
    thresholdAmount: null,
    percentageOfBasicSalary: null,
    isNew: true,
    isEdited: false,
    toDelete: false,
  }), []);

  /**
   * Loads existing adjustments from payroll context
   */
  const loadExistingAdjustments = useCallback(() => {
    if (!componentType || !payrollContext) return [];

    const existingAdjustments = componentType === COMPONENT_TYPES.ADDITION 
      ? payrollContext.additionsData 
      : payrollContext.deductionsData;

    if (!existingAdjustments || existingAdjustments.length === 0) {
      return [createEmptyRow()];
    }

    return existingAdjustments.map(adj => {
      // Prioritize adjustedFrequency over frequency, fallback to 'monthly_key'
      const frequencyValue = adj.adjustedFrequency || adj.frequency || 'monthly_key';
      
      return {
        id: `existing-${Date.now()}-${Math.random()}`,
        adjustmentId: adj.adjustmentId || null,
        componentId: adj.componentId || '', // May be empty for generated payrolls
        componentName: adj.componentName || '', // Direct name from API
        amount: adj.amount || adj.adjustedAmount || '',
        effectiveTill: adj.effectiveTill || adj.endDate || '',
        effectiveFrom: adj.effectiveFrom || adj.startDate || '',
        frequency: frequencyValue,
        amountType: adj.isVariable ? AMOUNT_TYPES.VARIABLE : AMOUNT_TYPES.FIXED,
        isVariable: adj.isVariable ?? true,
        thresholdAmount: adj.thresholdAmount || null,
        percentageOfBasicSalary: adj.percentageOfBasicSalary || null,
        isCompleted: true,
        isNew: false,
        isEdited: false,
        toDelete: false,
        // Store original values for tracking changes
        originalAmount: adj.amount || adj.adjustedAmount || '',
        originalEffectiveTill: adj.effectiveTill || adj.endDate || '',
        originalEffectiveFrom: adj.effectiveFrom || adj.startDate || '',
        originalFrequency: frequencyValue,
      };
    });
  }, [componentType, payrollContext, createEmptyRow]);

  /**
   * Checks if a component is already selected in another row
   */
  const isComponentDuplicate = useCallback((componentId, currentRowId) => {
    return componentRows.some(row => 
      row.id !== currentRowId && 
      row.componentId === componentId &&
      !row.toDelete
    );
  }, [componentRows]);

  /**
   * Gets available components for a specific row (excluding already selected ones)
   */
  const getAvailableComponents = useCallback((currentRowId) => {
    const selectedIds = componentRows
      .filter(row => row.id !== currentRowId && row.componentId && !row.toDelete)
      .map(row => row.componentId);
    
    return filteredComponents.filter(comp => !selectedIds.includes(comp.componentId));
  }, [componentRows, filteredComponents]);

  /**
   * Validates if a row is complete (has all required fields)
   */
  const isRowComplete = useCallback((row) => {
    if (!row.componentId) return false;
    // Variable components require amount input
    if (row.isVariable && !row.amount) return false;
    // Effective till and frequency are mandatory
    if (!row.effectiveTill) return false;
    if (!row.frequency) return false;
    return true;
  }, []);

  /**
   * Handles component selection for a row
   */
  const handleComponentSelect = useCallback((rowId, componentId) => {
    if (componentId && isComponentDuplicate(componentId, rowId)) {
      alert('This component has already been added. Please select a different component.');
      return;
    }

    // Clear component error when user selects a component
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[rowId]) {
        delete newErrors[rowId].componentId;
        if (Object.keys(newErrors[rowId]).length === 0) {
          delete newErrors[rowId];
        }
      }
      return newErrors;
    });

    const selectedComponent = filteredComponents.find(comp => comp.componentId === componentId);
    
    setComponentRows(prevRows => 
      prevRows.map(row => {
        if (row.id !== rowId) return row;

        const updatedRow = {
          ...row,
          componentId,
          componentName: selectedComponent?.componentName || '', // Use componentName from selected component
          amount: selectedComponent?.amount || '',
          frequency: selectedComponent?.frequency || frequencyOptions[0]?.value || 'monthly_key',
          amountType: selectedComponent?.isVariable ? AMOUNT_TYPES.VARIABLE : AMOUNT_TYPES.FIXED,
          isVariable: selectedComponent?.isVariable ?? true,
          thresholdAmount: selectedComponent?.thresholdAmount || null,
          percentageOfBasicSalary: selectedComponent?.percentageOfBasicSalary || null,
          effectiveFrom: selectedComponent?.effectiveFrom || '',
          effectiveTill: selectedComponent?.effectiveTill || '',
        };
        
        updatedRow.isCompleted = isRowComplete(updatedRow);
        return updatedRow;
      })
    );
  }, [filteredComponents, isComponentDuplicate, isRowComplete, frequencyOptions]);

  /**
   * Handles input changes for a row field
   */
  const handleInputChange = useCallback((rowId, field, value) => {
    // Clear error for this field when user starts typing
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[rowId]) {
        delete newErrors[rowId][field];
        if (Object.keys(newErrors[rowId]).length === 0) {
          delete newErrors[rowId];
        }
      }
      return newErrors;
    });

    setComponentRows(prevRows => 
      prevRows.map(row => {
        if (row.id !== rowId) return row;

        const updatedRow = { ...row, [field]: value };
        
        // Track if an existing row has been edited
        if (!updatedRow.isNew) {
          const originalField = `original${field.charAt(0).toUpperCase()}${field.slice(1)}`;
          if (updatedRow[originalField] !== undefined && updatedRow[originalField] !== value) {
            updatedRow.isEdited = true;
          }
        }
        
        updatedRow.isCompleted = isRowComplete(updatedRow);
        return updatedRow;
      })
    );
  }, [isRowComplete]);

  /**
   * Validates a single row and sets error messages
   */
  const validateRow = useCallback((row) => {
    const errors = {};
    
    if (!row.componentId) {
      errors.componentId = 'Please select a component';
    }
    
    if (row.isVariable && !row.amount) {
      errors.amount = 'Amount is required';
    }
    
    if (!row.effectiveTill) {
      errors.effectiveTill = 'Effective till date is required';
    }
    
    if (!row.frequency) {
      errors.frequency = 'Frequency is required';
    }
    
    return errors;
  }, []);

  /**
   * Adds a new empty row for adding more components
   */
  const handleAddMore = useCallback(() => {
    const lastRow = componentRows[componentRows.length - 1];
    if (lastRow?.isCompleted) {
      setComponentRows(prev => [...prev, createEmptyRow()]);
    } else if (lastRow) {
      // Show validation errors for incomplete row
      const errors = validateRow(lastRow);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(prev => ({
          ...prev,
          [lastRow.id]: errors
        }));
      }
    }
  }, [componentRows, createEmptyRow, validateRow]);

  /**
   * Handles row deletion (removes new rows, marks existing for deletion)
   */
  const handleDeleteRow = useCallback((rowId) => {
    setComponentRows(prev => {
      const rowIndex = prev.findIndex(row => row.id === rowId);
      if (rowIndex === -1) return prev;

      const row = prev[rowIndex];
      const updated = [...prev];
      
      if (row.isNew) {
        // Remove new rows completely
        updated.splice(rowIndex, 1);
      } else {
        // Mark existing rows for deletion
        updated[rowIndex] = { ...row, toDelete: true };
      }
      
      return updated;
    });
  }, []);

  /**
   * Restores a row marked for deletion
   */
  const handleRestoreRow = useCallback((rowId) => {
    setComponentRows(prev => 
      prev.map(row => row.id === rowId ? { ...row, toDelete: false } : row)
    );
  }, []);

  /**
   * Closes the modal and clears session data
   */
  const handleClose = useCallback(() => {
    if (sessionKey) {
      clearPayrollContext(sessionKey);
    }
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('componentModal');
      newParams.delete('session');
      newParams.delete('employeeId');
      newParams.delete('payslipId');
      newParams.delete('employeeName');
      return newParams;
    });
    
    setComponentRows([]);
  }, [sessionKey, setSearchParams]);

  /**
   * Validates all rows before saving
   */
  const validateRows = useCallback((rows) => {
    const errors = [];
    const activeRows = rows.filter(row => !row.toDelete && row.isCompleted);

    activeRows.forEach((row) => {
      // Validate threshold amounts
      if (row.thresholdAmount !== null && row.thresholdAmount !== undefined) {
        const amount = parseFloat(row.amount) || 0;
        const threshold = parseFloat(row.thresholdAmount) || 0;
        
        if (amount > threshold) {
          errors.push(
            `${row.componentName}: Amount (₹${amount}) exceeds threshold (₹${threshold})`
          );
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }, []);

  /**
   * Prepares adjustment data for API request
   */
  const prepareAdjustmentsForSave = useCallback((rows) => {
    const activeRows = rows.filter(row => !row.toDelete && row.isCompleted);
    
    const adjustments = activeRows.map(row => ({
      adjustmentId: row.adjustmentId || null,
      componentId: row.componentId,
      componentName: row.componentName,
      adjustedAmount: parseFloat(row.amount) || 0,
      startDate: row.effectiveFrom || CURRENT_DATE,
      endDate: row.effectiveTill || null,
      adjustedFrequency: row.frequency,
      isVariable: row.isVariable,
      thresholdAmount: row.thresholdAmount,
      percentageOfBasicSalary: row.percentageOfBasicSalary,
    }));

    // Add deleted adjustments with deletion flag
    const deletedAdjustmentIds = rows
      .filter(row => row.toDelete && row.adjustmentId)
      .map(row => ({
        adjustmentId: row.adjustmentId,
        isDeleted: true
      }));

    return [...adjustments, ...deletedAdjustmentIds];
  }, []);

  /**
   * Handles save operation
   */
  const handleSave = useCallback(async () => {
    const activeRows = componentRows.filter(row => !row.toDelete);
    const incompleteRows = activeRows.filter(row => !row.isCompleted);
    
    // Validate all incomplete rows and show errors
    if (incompleteRows.length > 0) {
      const newErrors = {};
      incompleteRows.forEach(row => {
        const errors = validateRow(row);
        if (Object.keys(errors).length > 0) {
          newErrors[row.id] = errors;
        }
      });
      setFieldErrors(newErrors);
      alert('Please fill in all required fields for all components');
      return;
    }

    const completedRows = componentRows.filter(row => !row.toDelete && row.isCompleted);
    const hasDeletedRows = componentRows.some(row => row.toDelete && !row.isNew);
    
    // Validate that user has at least one active row or is deleting all
    if (completedRows.length === 0 && !hasDeletedRows) {
      alert('Please add at least one component before saving');
      return;
    }

    // Validate all rows
    const { valid, errors } = validateRows(componentRows);
    if (!valid) {
      alert('Validation Errors:\n\n' + errors.join('\n'));
      return;
    }

    // Prepare adjustments for API
    const adjustmentsRequest = prepareAdjustmentsForSave(componentRows);

    const getSalaryComponentsDataParams = {
      currentPage, 
      pageSize, 
      selectedMonth, 
      selectedYear, 
      searchQuery
    }
    // Call API to save adjustments
    const result = await dispatch(updatePayrollItems(
      employeeId,
      employeeName,
      payslipId,
      componentType,
      adjustmentsRequest,
      getSalaryComponentsDataParams
    ));

    // Close modal on success
    if (result?.success) {
      handleClose();
    }
  }, [componentRows, employeeId, employeeName, payslipId, componentType, dispatch, validateRows, prepareAdjustmentsForSave, handleClose, currentPage, pageSize, selectedMonth, selectedYear, searchQuery, validateRow]);

  /**
   * Determines if Add More button should be enabled
   */
  const isAddMoreEnabled = useMemo(() => {
    if (componentRows.length === 0) return false;
    const lastRow = componentRows[componentRows.length - 1];
    return lastRow?.isCompleted ?? false;
  }, [componentRows]);

  // Initialize component rows on mount
  useEffect(() => {
    const rows = loadExistingAdjustments();
    setComponentRows(rows);
  }, [loadExistingAdjustments]);

  // Load global components when modal opens
  useEffect(() => {
    if (componentType) {
      dispatch(getSalaryComponents());
    }
  }, [dispatch, componentType]);

  // Security check: Don't render if invalid context or wrong type
  if (!componentType || 
      !payrollContext || 
      componentType === COMPONENT_TYPES.TAXES_DEDUCTION || 
      componentType === COMPONENT_TYPES.MONTHLY_CTC) {
    return null;
  }

  const modalTitle = componentType === COMPONENT_TYPES.ADDITION ? 'Additions' : 'Deductions';

  return (
    <div className="payroll-component-modal-overlay">
      <div className="payroll-component-modal">
        {/* Modal Header */}
        <div className="modal-header">    
        {/* Employee Information */}
        {employeeName && (
          <div className="modal_info">
            <p className="modal_title">{modalTitle}</p>
            <p className="employee_name">{employeeName}</p>
          </div>
        )}
          <button className="close-btn" onClick={handleClose} aria-label="Close modal">
            <img src={Cross_icon} alt="Close" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Table Header */}
          <div className={`table-header ${isReadOnly ? 'read-only' : ''} ${isAllPayrollGenerated ? 'generated' : ''}`}>
            <div className="header-cell component-header">Select {modalTitle}*</div>
            <div className="header-cell amount-header">Amount*</div>
            {!isAllPayrollGenerated && <div className="header-cell date-header">Effective Till*</div>}
            {!isAllPayrollGenerated && <div className="header-cell frequency-header">Frequency*</div>}
            {!isReadOnly && <div className="header-cell action-header"></div>}
          </div>

          {/* Component Rows */}
          <div className="component-rows">
            {componentRows.map((row) => (
              <div key={row.id} className={`component-row ${row.toDelete ? 'to-delete' : ''}`}>
                <div className={`row-fields ${isReadOnly ? 'read-only' : ''} ${isAllPayrollGenerated ? 'generated' : ''}`}>
                  {/* Component Selection */}
                  <div className="field-cell component-field">
                    <div className="component-input-wrapper">
                      {/* If component has no ID (generated payroll), show name directly */}
                      {!row.componentId && row.componentName ? (
                        <div className="component-name-display">
                          {row.componentName}
                        </div>
                      ) : (
                        <select
                          value={row.componentId}
                          onChange={(e) => handleComponentSelect(row.id, e.target.value)}
                          className={`component-select ${fieldErrors[row.id]?.componentId ? 'error' : ''}`}
                          disabled={isReadOnly || loading || row.toDelete}
                          aria-label="Select component"
                        >
                          <option value="">
                            {loading ? 'Loading components...' : 'Select Component'}
                          </option>
                          {getAvailableComponents(row.id).map(component => (
                            <option key={component.componentId} value={component.componentId}>
                              {component.componentName}
                            </option>
                          ))}
                        </select>
                      )}
                      <span className={`amount-type-badge ${row.amountType.toLowerCase()}`}>
                        {row.amountType}
                      </span>
                    </div>
                    {fieldErrors[row.id]?.componentId && (
                      <span className="field-error">{fieldErrors[row.id].componentId}</span>
                    )}
                  </div>

                  {/* Amount Input */}
                  <div className="field-cell amount-field">
                    <input
                      type="number"
                      placeholder={row.isVariable ? "₹200" : "Fixed"}
                      value={row.amount}
                      onChange={(e) => handleInputChange(row.id, 'amount', e.target.value)}
                      className={`amount-input ${fieldErrors[row.id]?.amount ? 'error' : ''}`}
                      disabled={isReadOnly || !row.isVariable || row.toDelete}
                      title={!row.isVariable ? "Amount is fixed for this component" : ""}
                      aria-label="Amount"
                    />
                    {row.thresholdAmount && (
                      <span className="threshold-hint">Max: ₹{row.thresholdAmount}</span>
                    )}
                    {fieldErrors[row.id]?.amount && (
                      <span className="field-error">{fieldErrors[row.id].amount}</span>
                    )}
                  </div>

                  {/* Effective Till Date */}
                  {!isAllPayrollGenerated && <div className="field-cell date-field">
                    <input
                      type="date"
                      value={row.effectiveTill}
                      onChange={(e) => handleInputChange(row.id, 'effectiveTill', e.target.value)}
                      className={`date-input ${fieldErrors[row.id]?.effectiveTill ? 'error' : ''}`}
                      placeholder="dd-mm-yyyy"
                      disabled={isReadOnly || row.toDelete}
                      required
                      aria-label="Effective till date"
                    />
                    {fieldErrors[row.id]?.effectiveTill && (
                      <span className="field-error">{fieldErrors[row.id].effectiveTill}</span>
                    )}
                  </div>}

                  {/* Frequency Selection */}
                  {!isAllPayrollGenerated && <div className="field-cell frequency-field">
                    <select
                      value={row.frequency}
                      onChange={(e) => handleInputChange(row.id, 'frequency', e.target.value)}
                      className={`frequency-select ${fieldErrors[row.id]?.frequency ? 'error' : ''}`}
                      disabled={isReadOnly || row.toDelete}
                      required
                      aria-label="Frequency"
                    >
                      {frequencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors[row.id]?.frequency && (
                      <span className="field-error">{fieldErrors[row.id].frequency}</span>
                    )}
                  </div>}

                  {/* Action Buttons */}
                  {!isReadOnly && (
                    <div className="field-cell action-field">
                      {row.toDelete ? (
                        <button 
                          className="restore-row-btn"
                          onClick={() => handleRestoreRow(row.id)}
                          type="button"
                          title="Restore row"
                          aria-label="Restore row"
                        >
                          <img src={Restore_icon} alt="Restore" />
                        </button>
                      ) : (
                        <button 
                          className="delete-row-btn"
                          onClick={() => handleDeleteRow(row.id)}
                          type="button"
                          title="Delete row"
                          aria-label="Delete row"
                        >
                          <img src={Cancel_icon} alt="Delete" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          {!isReadOnly && (
            <button 
              className={`add-more-btn ${isAddMoreEnabled ? 'enabled' : 'disabled'}`}
              onClick={handleAddMore}
              disabled={!isAddMoreEnabled}
              type="button"
              aria-label="Add more components"
            >
              ⊕ Add More
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
          {!isReadOnly && (
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollComponentModal;
