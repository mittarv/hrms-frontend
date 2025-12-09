import { getFrequencyDisplayValue } from "./TableConfig";
import { formatDate } from "../../../Common/utils/helper";

export const isValidField = (value, type, rowData = null, columnKey = null, tableTitle = null) => {
  if (type === "text" || type === "select" || type === "date") {
    return value && value.toString().trim() !== "";
  }
  if (type === "number") {
    // Special validation for Default Addition tables - either amount or percentage is required
    if (rowData && tableTitle === "Default Addition" && (columnKey === "amount" || columnKey === "percentageOfBasicSalary")) {
      // For Basic Salary component, percentage is always N/A
      if (rowData.componentName === "Basic Salary" && columnKey === "percentageOfBasicSalary") {
        return true; // Always valid for Basic Salary percentage field
      }
      
      const hasAmount = rowData.amount !== null && rowData.amount !== undefined && rowData.amount !== "" && !isNaN(rowData.amount) && parseFloat(rowData.amount) > 0;
      const hasPercentage = rowData.percentageOfBasicSalary !== null && rowData.percentageOfBasicSalary !== undefined && rowData.percentageOfBasicSalary !== "" && !isNaN(rowData.percentageOfBasicSalary) && parseFloat(rowData.percentageOfBasicSalary) > 0;
      
      // Either amount or percentage should be present
      return hasAmount || hasPercentage;
    }
    
    const isValidNumber = value !== null && value !== undefined && value !== "" && !isNaN(value) && parseFloat(value) > 0;
    
    // Don't validate number fields that aren't required or don't have values
    if (!isValidNumber) {
      return false;
    }
    
    // Additional validation for amount field against threshold - this creates a blocking validation
    if (columnKey === "amount" && rowData?.thresholdAmount) {
      const thresholdAmount = parseFloat(rowData.thresholdAmount);
      const amountValue = parseFloat(value);
      if (thresholdAmount > 0 && amountValue > thresholdAmount) {
        return false; // Amount exceeds threshold - this will trigger specific error message
      }
    }
    
    // Allow threshold amount changes freely - users should be able to fix validation issues
    // by increasing the threshold amount
    
    return true; // Valid number that passes all checks
  }
  return true; // checkbox always valid
};

// Helper function to calculate Loss of Pay amount
export const calculateLossOfPayAmount = (allTableRows = []) => {
  // Get basic salary from the Basic Salary row
  const basicSalaryRow = allTableRows.find(row => row.componentName === "Basic Salary");
  const basicSalary = basicSalaryRow?.amount || 0;
  
  // Find all Default Addition rows with includeinLop true and not deleted
  const defaultAdditionRows = allTableRows.filter(row => {
    const isIncludedInLop = row?.includeinLop === true;
    const isNotDeleted = !row?._isDeleted;
    const isBasicSalary = row?.componentName === "Basic Salary";
    
    // Check if row has either direct amount or percentage
    const hasValidAmount = row?.amount !== null && row?.amount !== undefined && row?.amount !== "" && !isNaN(row?.amount) && parseFloat(row?.amount) > 0;
    const hasValidPercentage = row?.percentageOfBasicSalary !== null && row?.percentageOfBasicSalary !== undefined && row?.percentageOfBasicSalary !== "" && !isNaN(row?.percentageOfBasicSalary) && parseFloat(row?.percentageOfBasicSalary) > 0;
    
    const hasValidValue = hasValidAmount || (hasValidPercentage && !isBasicSalary);
    
    return hasValidValue && isIncludedInLop && isNotDeleted;
  });
  
  // Sum their amounts (calculate from percentage if needed)
  const totalAmount = defaultAdditionRows.reduce((sum, row) => {
    let effectiveAmount = 0;
    
    // If row has direct amount, use it
    if (row?.amount !== null && row?.amount !== undefined && row?.amount !== "" && !isNaN(row?.amount) && parseFloat(row?.amount) > 0) {
      effectiveAmount = parseFloat(row?.amount);
    }
    // If row has percentage and no direct amount (and not Basic Salary), calculate from percentage
    else if (row?.percentageOfBasicSalary !== null && row?.percentageOfBasicSalary !== undefined && 
             row?.percentageOfBasicSalary !== "" && !isNaN(row?.percentageOfBasicSalary) && 
             parseFloat(row?.percentageOfBasicSalary) > 0 && row?.componentName !== "Basic Salary") {
      effectiveAmount = (basicSalary * parseFloat(row?.percentageOfBasicSalary)) / 100;
    }
    
    return sum + (isNaN(effectiveAmount) ? 0 : effectiveAmount);
  }, 0);
  
  // Get days in current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Calculate per day amount
  const perDayAmount = daysInMonth > 0 ? (totalAmount / daysInMonth) : 0;
  
  return parseFloat(perDayAmount.toFixed(2));
};

export const mergeRowData = (defaultRows, apiRows) => {
  const rowMap = {};
  [...defaultRows, ...apiRows].forEach(row => {
    const isFromApi = apiRows.some(a => a.componentId === row.componentId);
    
    // Only keep essential fields, don't spread all original properties
    const sanitizedRow = {
      componentId: row.componentId || Date.now().toString(),
      componentName: row.componentName ?? "",
      componentType: row.componentType ?? "",
      amount: row.amount !== undefined && row.amount !== null ? row.amount : null,
      percentageOfBasicSalary: row.percentageOfBasicSalary !== undefined && row.percentageOfBasicSalary !== null ? row.percentageOfBasicSalary : null,
      thresholdAmount: row.thresholdAmount !== undefined && row.thresholdAmount !== null ? row.thresholdAmount : null,
      frequency: getFrequencyDisplayValue(row.frequency) || "",
      variable: Boolean(row.variable), // Normalize to boolean
      includeinLop: Boolean(row.includeinLop), // Normalize to boolean
      effectiveFrom: formatDate(row.effectiveFrom),
      isVariable: Boolean(row.isVariable), // Normalize to boolean
      isDefault: Boolean(row.isDefault), // Normalize to boolean
      _isDeleted: false,
      _isModified: false,
      _originalData: isFromApi ? { ...row } : null
    };
    
    rowMap[sanitizedRow.componentId] = sanitizedRow;
  });
  return Object.values(rowMap);
};