import { findMatchingKey } from "../../../Common/utils/helper";
import { getFrequencyKey } from "./TableConfig";

/**
 * Simplified Save Data Generator
 * Converts table data changes into API-ready format
 */

/**
 * Helper function to get basic salary from all table data
 */
const getBasicSalaryAmount = (tableData) => {
  // Check in defaultAddition table first
  if (tableData.defaultAddition?.allActiveData) {
    const basicSalaryRow = tableData.defaultAddition.allActiveData.find(
      row => row.componentName === "Basic Salary" && !row._isDeleted
    );
    if (basicSalaryRow?.amount) {
      return parseFloat(basicSalaryRow.amount);
    }
  }
  
  // Fallback: check all tables
  for (const tableInfo of Object.values(tableData)) {
    if (tableInfo.allActiveData) {
      const basicSalaryRow = tableInfo.allActiveData.find(
        row => row.componentName === "Basic Salary" && !row._isDeleted
      );
      if (basicSalaryRow?.amount) {
        return parseFloat(basicSalaryRow.amount);
      }
    }
  }
  
  return 0;
};

/**
 * Calculate amount from percentage if needed
 */
const calculateAmountFromPercentage = (componentData, basicSalary) => {
  // If amount is already provided and valid, use it
  if (componentData.amount !== null && componentData.amount !== undefined && 
      componentData.amount !== "" && !isNaN(componentData.amount) && 
      parseFloat(componentData.amount) > 0) {
    return componentData;
  }
  
  // If percentage is provided but amount is not, calculate amount
  if (componentData.percentageOfBasicSalary !== null && 
      componentData.percentageOfBasicSalary !== undefined && 
      componentData.percentageOfBasicSalary !== "" && 
      !isNaN(componentData.percentageOfBasicSalary) && 
      parseFloat(componentData.percentageOfBasicSalary) > 0 && 
      basicSalary > 0) {
    
    const calculatedAmount = (basicSalary * parseFloat(componentData.percentageOfBasicSalary)) / 100;
    return {
      ...componentData,
      amount: parseFloat(calculatedAmount.toFixed(2))
    };
  }
  
  return componentData;
};

/**
 * Main function to generate save data for salary configuration
 */
export const generateSalarySaveData = (tableData, selectedOptions, componentTypeData) => {
  const saveOperations = {
    createData: [],
    editData: [],
    deletedData: []
  };

  // Get basic salary for percentage calculations
  const basicSalary = getBasicSalaryAmount(tableData);

  // Process each table's data
  Object.entries(tableData).forEach(([tableType, tableInfo]) => {
    processTableData(tableType, tableInfo, selectedOptions, componentTypeData, saveOperations, basicSalary);
  });

  // Filter out empty operations to prevent unnecessary API calls
  saveOperations.createData = saveOperations.createData.filter(item => {
    if (item.componentDetails && Array.isArray(item.componentDetails)) {
      return item.componentDetails.length > 0;
    }
    return true;
  });

  // Filter out empty operations to prevent unnecessary API calls
  saveOperations.createData = saveOperations.createData.filter(item => {
    if (item.componentDetails && Array.isArray(item.componentDetails)) {
      return item.componentDetails.length > 0;
    }
    return true;
  });

  return saveOperations;
};

/**
 * Process individual table data and populate save operations
 */
const processTableData = (tableType, tableInfo, selectedOptions, componentTypeData, saveOperations, basicSalary) => {
  const { deletedData = [], modifiedData = [], newData = [] } = tableInfo;

  // Handle deleted items
  deletedData.forEach(rowData => {
    saveOperations.deletedData.push(createDeleteOperation(rowData));
  });

  // Handle new items  
  newData.forEach(rowData => {
    addCreateOperation(rowData, tableType, selectedOptions, componentTypeData, saveOperations, basicSalary);
  });

  // Handle modified items
  modifiedData.forEach(rowData => {
    const editOperation = createEditOperation(rowData, basicSalary);
    if (editOperation) {
      saveOperations.editData.push(editOperation);
    }
  });
};

/**
 * Create delete operation data
 */
const createDeleteOperation = (rowData) => ({
  action: "delete",
  componentId: rowData.componentId,
  isDefault: false
});

/**
 * Add create operation to save operations
 */
const addCreateOperation = (rowData, tableType, selectedOptions, componentTypeData, saveOperations, basicSalary) => {
  const componentDetails = createComponentDetails(rowData, tableType, basicSalary);
  
  if (isDefaultTable(tableType)) {
    addDefaultComponentCreate(componentDetails, selectedOptions, componentTypeData, saveOperations);
  } else {
    addGlobalComponentCreate(componentDetails, saveOperations);
  }
};

/**
 * Add default component creation with category details
 */
const addDefaultComponentCreate = (componentDetails, selectedOptions, componentTypeData, saveOperations) => {
  const categoryDetails = buildCategoryDetails(selectedOptions, componentTypeData);
  
  if (!categoryDetails) return;

  let existingCategory = findExistingCategory(saveOperations.createData, categoryDetails);
  
  if (!existingCategory) {
    existingCategory = {
      action: "create",
      categoryDetails,
      componentDetails: []
    };
    saveOperations.createData.push(existingCategory);
  }

  existingCategory.componentDetails.push(componentDetails);
};

/**
 * Add global component creation without category
 */
const addGlobalComponentCreate = (componentDetails, saveOperations) => {
  let globalCreateData = saveOperations.createData.find(item => 
    item.action === "create" && !item.categoryDetails
  );

  if (!globalCreateData) {
    globalCreateData = {
      action: "create",
      componentDetails: []
    };
    saveOperations.createData.push(globalCreateData);
  }

  globalCreateData.componentDetails.push(componentDetails);
};

/**
 * Create edit operation data
 */
const createEditOperation = (rowData, basicSalary) => {
  const changedFields = getChangedFields(rowData, basicSalary);
  
  if (Object.keys(changedFields).length === 0) {
    return null;
  }

  return {
    action: "update",
    componentId: rowData.componentId,
    componentDetails: changedFields
  };
};

/**
 * Normalize values for consistent comparison
 */
const normalizeValue = (value, fieldKey) => {
  // Handle boolean fields - convert null/undefined to false for boolean fields
  if (['variable', 'isVariable', 'includeinLop'].includes(fieldKey)) {
    if (value === null || value === undefined) {
      return false;
    }
    return Boolean(value);
  }
  
  // Handle numeric fields - convert empty strings to null
  if (['amount', 'percentageOfBasicSalary', 'thresholdAmount'].includes(fieldKey)) {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const numValue = parseFloat(value);
    return isNaN(numValue) ? null : numValue;
  }
  
  // Handle string fields - convert null/undefined to empty string
  if (['componentName', 'frequency', 'effectiveFrom'].includes(fieldKey)) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value).trim();
  }
  
  // Default: return as-is
  return value;
};

/**
 * Get fields that have changed from original data
 */
const getChangedFields = (rowData, basicSalary = 0) => {
  const changedFields = {};
  const originalData = rowData._originalData;
  
  if (!originalData) return {};

  // First, check if we need to calculate amount from percentage
  let rowDataWithCalculatedAmount = { ...rowData };
  if (rowData.percentageOfBasicSalary && basicSalary > 0) {
    rowDataWithCalculatedAmount = calculateAmountFromPercentage(rowData, basicSalary);
  }

  Object.entries(rowDataWithCalculatedAmount).forEach(([key, value]) => {
    if (shouldIgnoreField(key)) {
      return;
    }

    let originalValue = originalData[key];
    let currentValue = value;

    // Handle special field comparisons
    if (key === 'frequency') {
      // Convert both to keys for proper comparison
      originalValue = getFrequencyKey(originalData[key] || "");
      currentValue = getFrequencyKey(value || "");
    } else if (key === 'effectiveFrom') {
      // Handle date fields with proper validation
      if (value) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          currentValue = date.toISOString();
        } else {
          currentValue = null; // Invalid date becomes null
        }
      } else {
        currentValue = null; // Empty date becomes null
      }
      
      // Convert original value to same format for comparison
      if (originalValue) {
        const originalDate = new Date(originalValue);
        if (!isNaN(originalDate.getTime())) {
          originalValue = originalDate.toISOString();
        } else {
          originalValue = null;
        }
      } else {
        originalValue = null;
      }
    } else {
      // Normalize boolean and null/undefined values for proper comparison
      originalValue = normalizeValue(originalData[key], key);
      currentValue = normalizeValue(value, key);
    }

    // Skip if values are the same after normalization
    if (currentValue === originalValue) {
      return;
    }

    // Add to changed fields with proper formatting
    if (key === 'frequency') {
      changedFields[key] = currentValue;
    } else if (key === 'effectiveFrom') {
      changedFields[key] = currentValue; // Already processed above
    } else {
      changedFields[key] = value;
    }
  });

  return changedFields;
};

/**
 * Create component details from row data
 */
const createComponentDetails = (rowData, tableType, basicSalary = 0) => {
  // Calculate amount from percentage if needed
  const rowDataWithAmount = calculateAmountFromPercentage(rowData, basicSalary);
  
  const componentDetails = {
    componentName: rowDataWithAmount.componentName || "",
    componentType: getComponentTypeForTable(tableType),
  };

  // Add optional fields if they exist
  const optionalFields = [
    'amount', 'percentageOfBasicSalary', 'thresholdAmount', 
    'isVariable', 'includeinLop'
  ];

  optionalFields.forEach(field => {
    if (rowDataWithAmount[field] !== undefined) {
      componentDetails[field] = sanitizeValue(rowDataWithAmount[field]);
    }
  });

  // Handle special fields
  if (rowDataWithAmount.frequency) {
    componentDetails.frequency = getFrequencyKey(rowDataWithAmount.frequency);
  }

  if (rowDataWithAmount.effectiveFrom) {
    const date = new Date(rowDataWithAmount.effectiveFrom);
    // Validate that the date is valid before converting to ISO string
    if (!isNaN(date.getTime())) {
      componentDetails.effectiveFrom = date.toISOString();
    }
    // If the date is invalid, we send null to indicate no date
  } else {
    // Explicitly send null for empty dates to prevent 'Invalid date' issues
    componentDetails.effectiveFrom = null;
  }

  return componentDetails;
};

/**
 * Build category details for default components
 */
const buildCategoryDetails = (selectedOptions, componentTypeData) => {
  if (!selectedOptions.employeeType || !selectedOptions.employeeLocation) {
    return null;
  }

  const categoryDetails = {
    employeeType: findMatchingKey(componentTypeData.emp_type_dropdown, selectedOptions.employeeType),
    employeeLocation: findMatchingKey(componentTypeData.location_dropdown, selectedOptions.employeeLocation),
  };

  // Check if it's Intern or Extended Intern
  const isInternType = ['Intern', 'Extended Intern'].includes(selectedOptions.employeeType);
  
  if (isInternType) {
    // For Intern/Extended Intern: add level, department, and year of study
    if (!selectedOptions.employeeLevel || !selectedOptions.department || !selectedOptions.yearOfStudy) {
      return null; // All 5 fields are required
    }
    categoryDetails.employeeLevel = findMatchingKey(componentTypeData.level_dropdown, selectedOptions.employeeLevel);
    categoryDetails.department = findMatchingKey(componentTypeData.department_type_dropdown, selectedOptions.department);
    categoryDetails.yearOfStudy = findMatchingKey(componentTypeData.year_of_study, selectedOptions.yearOfStudy);
  } else {
    // Add employee level for FTE/OFTE
    const isFteOrOfte = ['FTE', 'OFTE'].includes(selectedOptions.employeeType);
    if (isFteOrOfte && selectedOptions.employeeLevel) {
      categoryDetails.employeeLevel = findMatchingKey(
        componentTypeData.level_dropdown, 
        selectedOptions.employeeLevel
      );
    }
  }

  return categoryDetails;
};

/**
 * Helper functions
 */
const isDefaultTable = (tableType) => tableType.includes('default');

const shouldIgnoreField = (fieldKey) => {
  return fieldKey.startsWith('_') || 
         fieldKey === 'componentId' || 
         fieldKey === 'isDefaultRow' ||
         fieldKey === 'isNewRow';
};

const sanitizeValue = (value) => {
  return (value === "" || value === undefined) ? null : value;
};

const getComponentTypeForTable = (tableType) => {
  const typeMapping = {
    'defaultAddition': 'defaultAddition',
    'defaultDeduction': 'defaultDeduction',
    'addition': 'Addition',
    'deduction': 'Deduction'
  };
  
  return typeMapping[tableType] || tableType;
};

const findExistingCategory = (createData, categoryDetails) => {
  return createData.find(item => 
    JSON.stringify(item.categoryDetails) === JSON.stringify(categoryDetails)
  );
};
