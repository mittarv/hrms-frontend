import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllComponentTypes,
  getSalaryComponents,
  createSalaryConfig,
  updateSalaryConfig,
  deleteSalaryConfig
} from '../../../../../actions/hrRepositoryAction';
import { generateSalarySaveData } from '../utils/SaveDataGenerator';
import { findMatchingKey } from '../../../Common/utils/helper';

// Helper functions
const isFteOrOfteOrPte = (type) => type === 'FTE' || type === 'OFTE' || type === 'PTE';
const isInternType = (type) => type === 'Intern' || type === 'Extended Intern';

const getShouldShowReset = (opts) => {
  if (isInternType(opts.employeeType)) {
    // For Intern/Extended Intern: require all 5 fields
    return opts.employeeType && opts.employeeLocation && opts.employeeLevel && opts.department && opts.yearOfStudy;
  }
  return isFteOrOfteOrPte(opts.employeeType)
    ? opts.employeeType && opts.employeeLocation && opts.employeeLevel
    : opts.employeeType && opts.employeeLocation;
};

const validateRequiredFields = (opts) => {
  if (isInternType(opts.employeeType)) {
    // For Intern/Extended Intern: require all 5 fields
    return opts.employeeType && opts.employeeLocation && opts.employeeLevel && opts.department && opts.yearOfStudy;
  }
  return isFteOrOfteOrPte(opts.employeeType)
    ? opts.employeeType && opts.employeeLocation && opts.employeeLevel
    : opts.employeeType && opts.employeeLocation;
};

const getMatchedKeys = (opts, data) => ({
  employeeType: findMatchingKey(data.emp_type_dropdown, opts.employeeType),
  location: findMatchingKey(data.location_dropdown, opts.employeeLocation),
  level: findMatchingKey(data.level_dropdown, opts.employeeLevel),
  department: findMatchingKey(data.department_type_dropdown, opts.department),
  yearOfStudy: findMatchingKey(data.year_of_study, opts.yearOfStudy)
});

export const useSalaryConfiguration = () => {
  const dispatch = useDispatch();
  const {
    getAllComponentType,
    isSalaryConfigEditing,
    showResetButton,
    myHrmsAccess
  } = useSelector(state => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLevelDisabled, setIsLevelDisabled] = useState(true);
  const tableDataRef = useRef({});
  const hasInitialLoadedRef = useRef(false);
  const lastApiCallRef = useRef(null);

  // Initial fetch for component types
  useEffect(() => {
    if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
      dispatch(getAllComponentTypes());
    }
  }, [dispatch, getAllComponentType]);

  // Level dropdown enable/disable logic and reset when employee type changes
  useEffect(() => {
    // For Intern/Extended Intern: Level is enabled (not disabled)
    // For FTE/OFTE/PTE: Level is enabled
    // For others (Consultant/Contractor): Level is disabled
    const disableLevel = !isFteOrOfteOrPte(selectedOptions.employeeType) && !isInternType(selectedOptions.employeeType);
    setIsLevelDisabled(disableLevel);
    
    // Clear level when switching employee types or when level should be disabled
    if (disableLevel && selectedOptions.employeeLevel) {
      setSelectedOptions(prev => ({ ...prev, employeeLevel: '' }));
    }
    
    // Clear department and year of study when switching away from Intern/Extended Intern
    if (!isInternType(selectedOptions.employeeType)) {
      setSelectedOptions(prev => {
        const newState = { ...prev };
        if (prev.department) delete newState.department;
        if (prev.yearOfStudy) delete newState.yearOfStudy;
        return newState;
      });
    }
  }, [selectedOptions.employeeType, selectedOptions.employeeLevel]);

  // Clear level when switching between FTE, OFTE, and PTE to ensure proper filtering
  useEffect(() => {
    if (selectedOptions.employeeType === 'FTE' || selectedOptions.employeeType === 'OFTE' || selectedOptions.employeeType === 'PTE') {
      setSelectedOptions(prev => ({ ...prev, employeeLevel: '' }));
    }
  }, [selectedOptions.employeeType]);

  // Reset button visibility
  useEffect(() => {
    const showReset = getShouldShowReset(selectedOptions);
    dispatch({ type: 'SET_SHOW_DEFAULT_TABLES', payload: showReset });
    dispatch({ type: 'SET_SHOW_RESET_BUTTON', payload: showReset });
  }, [dispatch, selectedOptions]);

  // Store selected options in Redux
  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_DROPDOWN_OPTIONS', payload: selectedOptions });
  }, [selectedOptions, dispatch]);

  // API call helper
  const makeApiCall = useCallback((keys) => {
    // For Intern/Extended Intern: use all 5 parameters
    const params = isInternType(selectedOptions.employeeType) 
      ? [keys.employeeType || '', keys.location || '', keys.level || '', keys.department || '', keys.yearOfStudy || '']
      : [keys.employeeType || '', keys.location || '', keys.level || ''];
    
    const callKey = params.join('_');
    if (lastApiCallRef.current !== callKey) {
      lastApiCallRef.current = callKey;
      dispatch(getSalaryComponents(...params));
    }
  }, [dispatch, selectedOptions.employeeType]);

  // API call for salary data
  useEffect(() => {
    if (!getAllComponentType?.emp_type_dropdown || !getAllComponentType?.location_dropdown) return;
    if (!hasInitialLoadedRef.current) {
      makeApiCall({});
      hasInitialLoadedRef.current = true;
      return;
    }
    if (validateRequiredFields(selectedOptions)) {
      const keys = getMatchedKeys(selectedOptions, getAllComponentType);
      if (keys.employeeType && keys.location) makeApiCall(keys);
    }
  }, [dispatch, getAllComponentType, selectedOptions, makeApiCall]);

  // Listen for table data changes
  useEffect(() => {
    const handleTableDataChange = (event) => {
      // Table data event received
      const { tableType, ...rest } = event.detail;
      tableDataRef.current[tableType] = { ...rest };
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('tableDataChanged', handleTableDataChange);
      return () => window.removeEventListener('tableDataChanged', handleTableDataChange);
    }
  }, []);

  // Dropdown change handler
  const handleDropdownChange = useCallback((field, value) => {
    clearValidationErrors();
    setSelectedOptions(prev => ({
      ...prev,
      ...{ [field]: value },
      ...(field === 'employeeType' ? { employeeLevel: '' } : {})
    }));
  }, []);

  // Reset handler - FIXED: Clear lastApiCallRef
  const handleReset = useCallback(() => {
    clearValidationErrors();
    setSelectedOptions({});
    dispatch({ type: 'SET_SHOW_RESET_BUTTON', payload: false });
    dispatch({ type: 'SET_SALARY_CONFIG_EDITING', payload: false });
    dispatch({ type: 'CLEAR_SALARY_SAVE_DATA' });
    tableDataRef.current = {};
    // Clear the API call reference so the same API call can be made again
    lastApiCallRef.current = null;
  }, [dispatch]);

  // Edit handler
  const handleEdit = useCallback(() => {
    clearValidationErrors();
    dispatch({ type: 'SET_SALARY_CONFIG_EDITING', payload: true });
  }, [dispatch]);

  // Cancel handler - FIXED: Clear lastApiCallRef
  const handleCancel = useCallback(() => {
    clearValidationErrors();
    dispatch({ type: 'SET_SALARY_CONFIG_EDITING', payload: false });
    dispatch({ type: 'CLEAR_SALARY_SAVE_DATA' });
    tableDataRef.current = {};
    // Clear the API call reference in case the same selections are made again
    lastApiCallRef.current = null;
  }, [dispatch]);

  // Save handler
  const handleSave = useCallback(() => {
    // Check permissions before saving
    const hasPermission = (permissionName) => {
      const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
      if (isAdmin) return true;
      return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
    };

    const canCreate = hasPermission("ConfigureSalary_create");
    const canUpdate = hasPermission("ConfigureSalary_update");
    const canDelete = hasPermission("ConfigureSalary_delete");
    
    if (!canCreate && !canUpdate && !canDelete) {
      alert("You don't have permission to save salary configuration changes");
      return;
    }
    
    // First clear only validation error display (not the rows themselves)
    clearValidationErrors();
    
    const validationResult = validateAllTables();
    if (!validationResult.isValid) {
      showValidationErrors();
      
      // Collect all validation errors for better user feedback
      let errorMessages = [];
      let hasThresholdError = false;
      
      Object.entries(validationResult.errors).forEach(([, tableErrors]) => {
        if (Array.isArray(tableErrors)) {
          tableErrors.forEach(rowError => {
            rowError.errors.forEach(fieldError => {
              if (fieldError.message.includes('threshold amount')) {
                hasThresholdError = true;
                errorMessages.push(fieldError.message);
              } else {
                errorMessages.push(fieldError.message);
              }
            });
          });
        }
      });
      
      // Show appropriate error message
      if (hasThresholdError) {
        alert(`${errorMessages.find(msg => msg.includes('threshold'))}`);
      } else if (errorMessages.length > 0) {
        // Show the first few specific errors
        const uniqueMessages = [...new Set(errorMessages)];
        if (uniqueMessages.length === 1) {
          alert(`${uniqueMessages[0]}`);
        } else {
          alert(`\n${uniqueMessages.slice(0, 3).map(msg => `• ${msg}`).join('\n')}${uniqueMessages.length > 3 ? '\n...and more' : ''}`);
        }
      } else {
        alert('Please fill all required fields before saving.');
      }
      return;
    }
    
    // Only clear empty rows after validation passes
    clearEmptyRowsOnly();
    
    const saveData = generateSalarySaveData(tableDataRef.current, selectedOptions, getAllComponentType);
    
    // Check if there are any actual changes to save
    const hasChanges = saveData.createData.length > 0 || 
                      saveData.editData.length > 0 || 
                      saveData.deletedData.length > 0;
    
    if (!hasChanges) {
      window.confirm('No changes detected. Do you want to exit edit mode?') && 
        dispatch({ type: 'SET_SALARY_CONFIG_EDITING', payload: false });
      return;
    }
    
    dispatch({ type: 'SET_SALARY_SAVE_DATA', payload: saveData });
    const keys = getMatchedKeys(selectedOptions, getAllComponentType);
    
    // Only make API calls if there are actual changes
    if (saveData.createData.length) dispatch(createSalaryConfig(saveData.createData, keys.employeeType, keys.location, keys.level, keys.department, keys.yearOfStudy, lastApiCallRef));
    if (saveData.editData.length) dispatch(updateSalaryConfig(saveData.editData, keys.employeeType, keys.location, keys.level, keys.department, keys.yearOfStudy, lastApiCallRef));
    if (saveData.deletedData.length) dispatch(deleteSalaryConfig(saveData.deletedData, keys.employeeType, keys.location, keys.level, keys.department, keys.yearOfStudy, lastApiCallRef));

    dispatch({ type: 'SET_SALARY_CONFIG_EDITING', payload: false });
  }, [dispatch, selectedOptions, getAllComponentType, allToolsAccessDetails, selectedToolName, myHrmsAccess]);

  // Validation helpers
  const clearValidationErrors = () => {
    Object.values(tableDataRef.current).forEach(table => {
      table?.setShowValidationErrors?.(false);
    });
  };
  
  const clearEmptyRowsOnly = () => {
    Object.values(tableDataRef.current).forEach(table => {
      table?.clearNewRows?.();
    });
  };
  const validateAllTables = () => {
    let hasErrors = false;
    const errors = {};
    Object.entries(tableDataRef.current).forEach(([type, table]) => {
      const err = table?.validateAllRows?.();
      if (Array.isArray(err) ? err.length : err && Object.keys(err).length) {
        errors[type] = err;
        hasErrors = true;
      }
    });
    return { isValid: !hasErrors, errors };
  };
  const showValidationErrors = () => {
    Object.values(tableDataRef.current).forEach(table => {
      table?.setShowValidationErrors?.(true);
    });
  };

  return {
    selectedOptions,
    isLevelDisabled,
    showResetButton,
    isSalaryConfigEditing,
    getAllComponentType,
    handleDropdownChange,
    handleReset,
    handleEdit,
    handleCancel,
    handleSave
  };
};