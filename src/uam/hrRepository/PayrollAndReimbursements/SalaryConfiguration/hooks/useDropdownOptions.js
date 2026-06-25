import { useMemo } from 'react';
import { getFilteredLevelValues } from '../../../Common/utils/payrollLevelUtils';

/**
 * Helper function to build dropdown options from store data
 */
export const buildDropdownOptions = (dropdownData) => {
  if (!dropdownData || typeof dropdownData !== 'object') {
    return [];
  }
  
  return Object.entries(dropdownData).map(([, value]) => ({
    value: Array.isArray(value) ? value[0] : value,
    label: Array.isArray(value) ? value[0] : value
  }));
};

/**
 * Custom hook for managing dropdown options
 */
export const useDropdownOptions = (getAllComponentType, selectedEmployeeType) => {
  const employeeTypeOptions = useMemo(() => 
    buildDropdownOptions(getAllComponentType?.emp_type_dropdown || {}),
    [getAllComponentType?.emp_type_dropdown]
  );

  const employeeLocationOptions = useMemo(() => 
    buildDropdownOptions(getAllComponentType?.location_dropdown || {}),
    [getAllComponentType?.location_dropdown]
  );

  const filteredLevelValues = useMemo(
    () => getFilteredLevelValues(getAllComponentType?.level_dropdown || {}, selectedEmployeeType),
    [getAllComponentType?.level_dropdown, selectedEmployeeType]
  );

  // Memoize department options from API
  const departmentOptions = useMemo(() => 
    buildDropdownOptions(getAllComponentType?.department_type_dropdown || {}),
    [getAllComponentType?.department_type_dropdown]
  );

  // Memoize year of study options from API
  const yearOfStudyOptions = useMemo(() => 
    buildDropdownOptions(getAllComponentType?.year_of_study || {}),
    [getAllComponentType?.year_of_study]
  );

  const employeeLevelOptions = useMemo(
    () =>
      filteredLevelValues.map((value) => ({
        value: Array.isArray(value) ? value[0] : value,
        label: Array.isArray(value) ? value[0] : value,
      })),
    [filteredLevelValues]
  );

  return {
    employeeTypeOptions,
    employeeLocationOptions,
    employeeLevelOptions,
    departmentOptions,
    yearOfStudyOptions
  };
};