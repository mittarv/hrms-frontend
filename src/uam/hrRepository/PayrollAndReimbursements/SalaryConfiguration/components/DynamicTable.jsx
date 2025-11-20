import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import "../styles/DynamicTable.scss";
import CustomDropdown from "../../../Common/components/CustomDropdown";
import Delete_button from "../../../../../assets/icons/delete_red_icon.svg";
import Undo_Icon from "../../../../../assets/icons/restore_icon.svg";
import Add_Icon from "../../../../../assets/icons/Add_Icon_blue.svg";
import { getFrequencyDisplayValue, getFrequencyKey } from "../utils/TableConfig";
import { isValidField, calculateLossOfPayAmount, mergeRowData } from "../utils/SalaryConfigurationHelper";

export default function DynamicTable({ 
  title, 
  columns, 
  defaultRows = [], 
  apiRows = [], 
  isDisabled = false, 
  tableType,
  categoryDetails = null 
}) {
  const { isSalaryConfigEditing } = useSelector(state => state.hrRepositoryReducer);
  const [tableRows, setTableRows] = useState(mergeRowData(defaultRows, apiRows));
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);

  // Update rows when props change
  useEffect(() => {
    const mergedRows = mergeRowData(defaultRows, apiRows);
    
    // Auto-calculate Loss of Pay amount after merging data from API
    const updatedRows = mergedRows.map(row => {
      if (title === "Default Deduction" && row.componentName === "Loss of Pay(per day)") {
        const calculatedAmount = calculateLossOfPayAmount(mergedRows);
        return {
          ...row,
          amount: calculatedAmount
        };
      }
      return row;
    });
    
    setTableRows(updatedRows);
    setShowValidationErrors(false);
  }, [defaultRows, apiRows, title]);

  // Function to update Loss of Pay amount across all tables
  const updateLossOfPayAmount = useCallback((updatedRows) => {
    if (title === "Default Deduction") {
      return updatedRows.map(row => {
        if (row.componentName === "Loss of Pay(per day)") {
          const calculatedAmount = calculateLossOfPayAmount(updatedRows);
          return {
            ...row,
            amount: calculatedAmount,
            _isModified: row._originalData ? true : row._isModified
          };
        }
        return row;
      });
    }
    return updatedRows;
  }, [title]);

  // Validation functions
  const isLastRowValid = useCallback(() => {
    const activeRows = tableRows.filter(row => !row._isDeleted);
    if (activeRows.length === 0) return true;
    
    const lastRow = activeRows[activeRows.length - 1];
    return columns.every(column => {
      if (!column.required || column.type === "actions") return true;
      return isValidField(lastRow[column.key], column.type, lastRow, column.key, title);
    });
  }, [tableRows, columns, title]);

  const validateAllRows = useCallback(() => {
    const activeRows = tableRows.filter(row => !row._isDeleted);
    const errors = [];
    
    activeRows.forEach((row, index) => {
      const rowErrors = [];
      columns.forEach(column => {
        if (!column.required || column.type === "actions") return;
        
        const fieldValue = row[column.key];
        const isValid = isValidField(fieldValue, column.type, row, column.key, title);
        
        if (!isValid) {
          let message = `${column.label} is required`;
          
          // Special message for Default Addition amount/percentage fields
          if (title === "Default Addition" && (column.key === "amount" || column.key === "percentageOfBasicSalary")) {
            message = "Either Amount or Percentage (Basic Salary) is required";
          }
          // Special message for threshold validation
          else if (column.key === "amount" && row.thresholdAmount && fieldValue && parseFloat(fieldValue) > parseFloat(row.thresholdAmount)) {
            message = `Amount (₹${fieldValue}) cannot exceed threshold amount (₹${row.thresholdAmount})`;
          }
          // More specific messages for different field types
          else if (column.key === "componentName") {
            message = `Component Name is required for ${title}`;
          }
          else if (column.key === "amount") {
            message = `Amount is required for this ${title} component`;
          }
          else if (column.key === "frequency") {
            message = `Frequency is required for this ${title} component`;
          }
          else if (column.key === "effectiveFrom") {
            message = `Effective From date is required for this ${title} component`;
          }
          
          rowErrors.push({
            field: column.key,
            label: column.label,
            message: message
          });
        }
      });
      
      if (rowErrors.length > 0) {
        errors.push({ rowIndex: index, errors: rowErrors });
      }
    });
    
    return errors;
  }, [tableRows, columns, title]);

  const clearNewRows = useCallback(() => {
    setTableRows(prevRows => prevRows.filter(row => {
      // Keep all non-new rows (rows from API/database)
      if (!row.isNewRow) return true;
      
      // For new rows, only remove them if they are completely empty
      // (user hasn't entered ANY data at all)
      const hasAnyData = Object.keys(row).some(key => {
        if (key.startsWith('_') || key === 'componentId' || key === 'componentType' || key === 'isNewRow') {
          return false; // Skip internal properties
        }
        
        const value = row[key];
        
        // Check if user has entered any meaningful data
        if (typeof value === 'string') {
          return value.trim() !== '';
        }
        if (typeof value === 'number') {
          return value !== null && value !== undefined && !isNaN(value);
        }
        if (typeof value === 'boolean') {
          return value === true; // Only consider true as meaningful input
        }
        
        return value !== null && value !== undefined;
      });
      
      // Keep the row if user has entered any data (even if incomplete)
      return hasAnyData;
    }));
    setShowValidationErrors(false);
  }, []);

  const canAddNewRow = isLastRowValid();

  // Dispatch table data changes and notify other tables about Loss of Pay updates
  useEffect(() => {
    if (tableType && typeof window !== 'undefined') {
      const deletedData = tableRows.filter(row => row._isDeleted && row._originalData?.componentId && !row.isDefault);
      const modifiedData = tableRows.filter(row => row._isModified && !row._isDeleted && row._originalData?.componentId);
      const newData = tableRows.filter(row => row.isNewRow && !row._isDeleted);
      const allActiveData = tableRows.filter(row => !row._isDeleted);
            
      const event = new CustomEvent('tableDataChanged', {
        detail: {
          tableType,
          data: tableRows,
          deletedData,
          modifiedData,
          newData,
          allActiveData,
          categoryDetails,
          validateAllRows,
          setShowValidationErrors,
          clearNewRows
        }
      });
      window.dispatchEvent(event);

      // Store Default Addition data globally and notify other tables
      if (title === "Default Addition") {
        window.defaultAdditionTableData = tableRows;
        
        const lopUpdateEvent = new CustomEvent('updateLossOfPay', {
          detail: {
            defaultAdditionRows: tableRows
          }
        });
        window.dispatchEvent(lopUpdateEvent);
      }
    }
  }, [tableRows, tableType, categoryDetails, validateAllRows, clearNewRows, title]);

  // Listen for Loss of Pay updates from Default Addition table
  useEffect(() => {
    if (title === "Default Deduction" && typeof window !== 'undefined') {
      const handleLossOfPayUpdate = (event) => {
        const { defaultAdditionRows } = event.detail;
        
        setTableRows(prevRows => {
          const updatedRows = prevRows.map(row => {
            if (row.componentName === "Loss of Pay(per day)" || row.componentName === "Loss of Payper day)" || row.componentName.includes("Loss of Pay")) {
              const calculatedAmount = calculateLossOfPayAmount(defaultAdditionRows);
              return {
                ...row,
                amount: calculatedAmount,
                _isModified: row._originalData ? true : row._isModified
              };
            }
            return row;
          });
          return updatedRows;
        });
      };

      window.addEventListener('updateLossOfPay', handleLossOfPayUpdate);
      return () => window.removeEventListener('updateLossOfPay', handleLossOfPayUpdate);
    }
  }, [title]);

  // Row actions
  const handleDeleteRow = (rowIndex) => {
    setTableRows(prevRows => {
      const updatedRows = [...prevRows];
      const rowToDelete = updatedRows[rowIndex];
      
      if (rowToDelete.isDefault) {
        return prevRows;
      }
      
      if (rowToDelete.isNewRow || !rowToDelete._originalData?.componentId) {
        const newRows = updatedRows.filter((_, index) => index !== rowIndex);
        return updateLossOfPayAmount(newRows);
      }
      
      updatedRows[rowIndex]._isDeleted = true;
      return updateLossOfPayAmount(updatedRows);
    });
  };

  const handleUndoDelete = (rowIndex) => {
    setTableRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[rowIndex]._isDeleted = false;
      return updateLossOfPayAmount(updatedRows);
    });
  };

  const handleFieldChange = (rowIndex, fieldKey, fieldValue) => {
    setTableRows(prevRows => {
      const updatedRows = [...prevRows];
      const currentRow = updatedRows[rowIndex];
      
      let valueToStore = fieldValue;
      
      // Handle specific field transformations
      if (fieldKey === "frequency") {
        valueToStore = getFrequencyKey(fieldValue);
      } else if (["amount", "percentageOfBasicSalary", "thresholdAmount"].includes(fieldKey)) {
        if (fieldValue === "" || fieldValue === null || fieldValue === undefined) {
          valueToStore = null; // Use null for empty number fields instead of empty string
        } else {
          const numValue = parseFloat(fieldValue);
          valueToStore = isNaN(numValue) ? null : numValue;
          
          
          // Only validate amount against threshold, allow threshold changes freely
          // The user should be able to fix the situation by increasing threshold
        }
      }
      
      // Handle mutual exclusivity for Default Addition tables
      const isDefaultAddition = title === "Default Addition";
      const isBasicSalaryRow = currentRow.componentName === "Basic Salary";
      
      if (isDefaultAddition && !isBasicSalaryRow) {
        // If amount is entered, clear percentage
        if (fieldKey === "amount" && valueToStore !== null && valueToStore > 0) {
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [fieldKey]: valueToStore,
            percentageOfBasicSalary: null
          };
        }
        // If percentage is entered, clear amount
        else if (fieldKey === "percentageOfBasicSalary" && valueToStore !== null && valueToStore > 0) {
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [fieldKey]: valueToStore,
            amount: null
          };
        }
        // For other fields, just update normally
        else {
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [fieldKey]: valueToStore
          };
        }
      } else {
        // Only update the specific field that changed for non-Default Addition tables or Basic Salary row
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          [fieldKey]: valueToStore
        };
      }
      
      // Mark as modified if it's not a new row and value differs from original
      if (!currentRow.isNewRow && currentRow._originalData && currentRow._originalData[fieldKey] !== valueToStore) {
        updatedRows[rowIndex]._isModified = true;
      }
      
      // Clear validation errors if field becomes valid
      if (showValidationErrors) {
        const column = columns.find(col => col.key === fieldKey);
        if (column?.required && isValidField(valueToStore, column.type, updatedRows[rowIndex], fieldKey, title)) {
          if (validateAllRows().length === 0) {
            setShowValidationErrors(false);
          }
        }
      }
      
      // Auto-update Loss of Pay amount when includeinLop or amount changes in Default Addition
      let finalRows = updatedRows;
      if (isDefaultAddition && (fieldKey === "includeinLop" || fieldKey === "amount")) {
        finalRows = updateLossOfPayAmount(updatedRows);
      }
      
      return finalRows;
    });
  };

  // Focus handlers for row highlighting
  const handleInputFocus = (rowIndex) => {
    setFocusedRowIndex(rowIndex);
  };

  const handleInputBlur = () => {
    setFocusedRowIndex(null);
  };

  const handleAddNewRow = () => {
    const newRowData = {
      componentId: Date.now().toString(),
      componentName: "",
      componentType: title === "Default Addition" ? "defaultAddition" : "defaultDeduction",
      amount: null,
      percentageOfBasicSalary: null,
      thresholdAmount: null,
      frequency: "",
      variable: false,
      includeinLop: false,
      effectiveFrom: "",
      isVariable: false,
      _isDeleted: false,
      _isModified: false,
      isNewRow: true
    };

    columns.forEach(col => {
      if (col.key === "includeinLop" || col.key === "variable") {
        newRowData[col.key] = false;
      } else if (["percentageOfBasicSalary", "thresholdAmount", "amount"].includes(col.key)) {
        newRowData[col.key] = null;
      } else if (["effectiveFrom", "frequency"].includes(col.key)) {
        newRowData[col.key] = "";
      }
    });

    setTableRows(prevRows => [...prevRows, newRowData]);
    setShowValidationErrors(false);
  };

  const renderTableCell = (rowData, columnConfig, rowIndex) => {
    const isFieldRequired = columnConfig.required;
    const fieldValue = rowData[columnConfig.key];
    const hasValidationError = showValidationErrors && isFieldRequired && !isValidField(fieldValue, columnConfig.type, rowData, columnConfig.key, title);
    
    const cellStyle = {
      borderColor: hasValidationError ? '#ff6b6b' : '',
      borderWidth: hasValidationError ? '2px' : '',
      backgroundColor: hasValidationError ? '#fff5f5' : ''
    };

    if (columnConfig.type === "text") {
      // Check if this is a component name field for a default component
      const isComponentNameField = columnConfig.key === "componentName";
      const isDefaultComponent = rowData.isDefault === true;
      const shouldDisableComponentName = isComponentNameField && isDefaultComponent;
      
      // Disable Loss of Pay component name field
      const isLossOfPayComponentName = isComponentNameField && (
        rowData.componentName === "Loss of Pay(per day)" || 
        rowData.componentName === "Loss of Payper day)" || 
        rowData.componentName.includes("Loss of Pay")
      );
      
      return isSalaryConfigEditing ? (
        <input
          type="text"
          value={fieldValue ?? ""}
          disabled={isDisabled || rowData._isDeleted || shouldDisableComponentName || isLossOfPayComponentName}
          onChange={e => handleFieldChange(rowIndex, columnConfig.key, e.target.value)}
          onFocus={() => handleInputFocus(rowIndex)}
          onBlur={handleInputBlur}
          style={cellStyle}
          placeholder={isFieldRequired ? `${columnConfig.label} (Required)` : columnConfig.label}
        />
      ) : (
        <span>{fieldValue || "N/A"}</span>
      );
    }

    if (columnConfig.type === "checkbox") {
      if (columnConfig.key === "isVariable") {
        return isSalaryConfigEditing ? (
          <input
            type="checkbox"
            checked={fieldValue ?? false}
            disabled={isDisabled || rowData._isDeleted}
            onChange={e => handleFieldChange(rowIndex, columnConfig.key, e.target.checked)}
            onFocus={() => handleInputFocus(rowIndex)}
            onBlur={handleInputBlur}
          />
        ) : (
          <span className="variable_checkbox">{fieldValue ? "Variable" : "Fixed"}</span>
        );
      } else {
        return (
          <input
            type="checkbox"
            checked={fieldValue ?? false}
            disabled={!isSalaryConfigEditing || isDisabled || rowData._isDeleted}
            onChange={e => handleFieldChange(rowIndex, columnConfig.key, e.target.checked)}
            onFocus={() => handleInputFocus(rowIndex)}
            onBlur={handleInputBlur}
          />
        );
      }
    }

    if (columnConfig.type === "number") {
      const isDefaultAddition = title === "Default Addition";
      const isDefaultDeduction = title === "Default Deduction";
      const isAmountField = columnConfig.key === "amount";
      const isPercentageField = columnConfig.key === "percentageOfBasicSalary";
      const isBasicSalaryRow = rowData.componentName === "Basic Salary";
      const isLossOfPayRow = isDefaultDeduction && (
        rowData.componentName === "Loss of Pay(per day)" || 
        rowData.componentName === "Loss of Payper day)" || 
        rowData.componentName.includes("Loss of Pay")
      ) && isAmountField;

      let displayValue = fieldValue === null || fieldValue === undefined ? "" : fieldValue;
      let isFieldDisabled = isDisabled || rowData._isDeleted;
      let showAsSpan = false;

      // For Default Deduction: Loss of pay (per Day) auto-calc logic
      if (isLossOfPayRow) {
        // Get all Default Addition rows from all tables (need to access global state or use event system)
        const calculatedAmount = calculateLossOfPayAmount(tableRows);
        displayValue = calculatedAmount;
        isFieldDisabled = true;
        
        // Also check if we can get Default Addition data from global state or events
        if (typeof window !== 'undefined' && window.defaultAdditionTableData) {
          const globalCalculatedAmount = calculateLossOfPayAmount(window.defaultAdditionTableData);
          displayValue = globalCalculatedAmount;
        }
      } else if (isDefaultAddition) {
        // Keep original logic for Default Addition
        const hasAmount = rowData.amount !== null && rowData.amount !== undefined && rowData.amount !== "" && !isNaN(rowData.amount) && parseFloat(rowData.amount) > 0;
        const hasPercentage = rowData.percentageOfBasicSalary !== null && rowData.percentageOfBasicSalary !== undefined && rowData.percentageOfBasicSalary !== "" && !isNaN(rowData.percentageOfBasicSalary) && parseFloat(rowData.percentageOfBasicSalary) > 0;
        
        // Get basic salary from the Basic Salary row
        const basicSalaryRow = tableRows.find(row => row.componentName === "Basic Salary");
        const basicSalary = basicSalaryRow?.amount || 0;
        
        // Special handling for Basic Salary row
        if (isBasicSalaryRow && isPercentageField) {
          displayValue = "N/A";
          showAsSpan = true;
        }
        // For other rows: disable amount field if percentage is entered
        else if (!isBasicSalaryRow && isAmountField && hasPercentage) {
          isFieldDisabled = true;
          // Calculate amount based on percentage (show up to 2 decimal places)
          const calculatedAmount = (basicSalary * parseFloat(rowData.percentageOfBasicSalary)) / 100;
          displayValue = parseFloat(calculatedAmount.toFixed(2));
        }
        // For other rows: disable percentage field if amount is entered
        else if (!isBasicSalaryRow && isPercentageField && hasAmount) {
          displayValue = "N/A";
          showAsSpan = true;
        }
      }

      // If we need to show N/A or it's not in editing mode, render as span
      if (!isSalaryConfigEditing || showAsSpan) {
        return <span className={`${isSalaryConfigEditing ? (rowData._isDeleted ? "deleted-text" : "variable_span") : ""}`}>{displayValue === "" || displayValue === "N/A" ? "N/A" : displayValue}</span>;
      }

      // Otherwise render as input
      const hasThresholdViolation = columnConfig.key === "amount" && 
                                   rowData.amount && 
                                   rowData.thresholdAmount && 
                                   parseFloat(rowData.amount) > parseFloat(rowData.thresholdAmount);
      
      // Only show visual errors for amount field, allow threshold changes freely
      const hasValidationError = hasThresholdViolation;
      
      return (
        <input
          type="number"
          value={displayValue === "N/A" ? "" : displayValue}
          disabled={isFieldDisabled}
          onChange={e => handleFieldChange(rowIndex, columnConfig.key, e.target.value)}
          style={{
            ...cellStyle,
            borderColor: hasValidationError ? '#ff4444' : cellStyle?.borderColor,
            backgroundColor: hasValidationError ? '#fff5f5' : cellStyle?.backgroundColor
          }}
          placeholder={isFieldRequired ? `${columnConfig.label} (Required)` : columnConfig.label}
          title={
            hasThresholdViolation ? `Amount cannot exceed threshold amount (${rowData.thresholdAmount})` : ""
          }
          onFocus={() => handleInputFocus(rowIndex)}
          onBlur={handleInputBlur}
        />
      );
    }

    if (columnConfig.type === "date") {
      return isSalaryConfigEditing ? (
        <input
          type="date"
          value={fieldValue ?? ""}
          disabled={isDisabled || rowData._isDeleted}
          onChange={e => handleFieldChange(rowIndex, columnConfig.key, e.target.value)}
          style={cellStyle}
          onFocus={() => handleInputFocus(rowIndex)}
          onBlur={handleInputBlur}
        />
      ) : (
        <span>{fieldValue || "N/A"}</span>
      );
    }

    if (columnConfig.type === "select") {
      const displayValue = columnConfig.key === "frequency" 
        ? getFrequencyDisplayValue(fieldValue) || "" 
        : (fieldValue ?? "");
      
      return isSalaryConfigEditing ? (
        <CustomDropdown
          options={columnConfig.options.map((opt, idx) => ({ 
            key: idx, 
            value: opt, 
            label: opt 
          }))}
          value={displayValue}
          disabled={isDisabled || rowData._isDeleted}
          onChange={e => handleFieldChange(rowIndex, columnConfig.key, e.target.value)}
          style={cellStyle}
          onFocus={() => handleInputFocus(rowIndex)}
          onBlur={handleInputBlur}
        />
      ) : (
        <span>{displayValue || "N/A"}</span>
      );
    }

    if (columnConfig.type === "actions" && isSalaryConfigEditing && !isDisabled) {
      if (!rowData._isDeleted) {
        // Don't show delete button for default items from backend and Loss of Pay component
        if ((rowData.isNewRow || rowData._originalData?.componentId) && !rowData.isDefault && 
            !rowData.componentName.includes("Loss of Pay")) {
          return (
            <button 
              className="salary_delete_btn" 
              onClick={() => handleDeleteRow(rowIndex)}
            >
              <img src={Delete_button} alt="Delete" /> 
              <span>Delete</span>
            </button>
          );
        } else {
          return <span>-</span>;
        }
      } else if (rowData._originalData?.componentId) {
        return (
          <button 
            className={`salary_undo_btn ${rowData._isDeleted ? "deleted-button" : ""}`}
            onClick={() => handleUndoDelete(rowIndex)}
          >
            <img src={Undo_Icon} alt="Undo" />
            <span className="salary_undo_btn_text">Undo</span>
          </button>
        );
      }
    }

    return null;
  };

  return (
    <div className="dynamic-table">
      <p>{title}</p>
      <div className="salary_table">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                col.type === "actions" && (!isSalaryConfigEditing || isDisabled) ? null : (
                  <th key={col.key}>
                    {col.label}
                    {col.required && isSalaryConfigEditing && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rowIndex) => (
              <tr 
                key={row.componentId} 
                className={`
                  ${row._isDeleted ? "deleted" : ""} 
                  ${focusedRowIndex === rowIndex ? "focused-row" : ""}
                `.trim()}
              >
                {columns.map(col => (
                  col.type === "actions" && (!isSalaryConfigEditing || isDisabled) ? null : (
                    <td key={col.key}>
                      {renderTableCell(row, col, rowIndex)}
                    </td>
                  )
                ))}
              </tr>
            ))}
            {tableRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  {!isSalaryConfigEditing 
                    ? `No ${title.toLowerCase()} components found. Click "Edit" to add your first component.` 
                    : "No data to display"
                  }
                </td>
              </tr>
            )}
            {isSalaryConfigEditing && !isDisabled && (
              <tr>
                <td 
                  className={`add_row_btn ${!canAddNewRow ? 'disabled' : ''}`}
                  colSpan={columns.length} 
                  onClick={!isDisabled && canAddNewRow ? handleAddNewRow : undefined}
                >
                  <button 
                    className="add-btn" 
                    disabled={!canAddNewRow}
                    title={!canAddNewRow ? "Please fill all required fields in the previous row before adding a new one" : ""}
                  >
                    <span>
                      <img src={Add_Icon} alt="Add" />
                      Click to Add New {title} Component
                    </span>
                  </button>            
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}