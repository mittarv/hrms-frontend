import { useMemo } from 'react';

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

  // Memoize base level options
  const baseLevelOptions = useMemo(() => 
    buildDropdownOptions(getAllComponentType?.level_dropdown || {}),
    [getAllComponentType?.level_dropdown]
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

  // Memoize filtered level options based on employee type (same logic as EmployeeOnBoardingForm)
  const employeeLevelOptions = useMemo(() => {
    let options = [...baseLevelOptions];
    
    // Filter options for OFTE and PTE employee types - only allow levels 1, 2, 3
    if (selectedEmployeeType === "OFTE" || selectedEmployeeType === "PTE") {
      options = options.filter(option => {
        const levelValue = option.value.toString().toLowerCase();
        return levelValue.includes('1') || levelValue.includes('2') || levelValue.includes('3') || 
               levelValue === 'level 1' || levelValue === 'level 2' || levelValue === 'level 3' ||
               levelValue === '1' || levelValue === '2' || levelValue === '3';
      });
    }
    
    // Filter options for FTE employee type - exclude levels 1, 2, 3
    if (selectedEmployeeType === "FTE") {
      options = options.filter(option => {
        const levelValue = option.value.toString().toLowerCase();
        return !(levelValue.includes('1') || levelValue.includes('2') || levelValue.includes('3') || 
                levelValue === 'level 1' || levelValue === 'level 2' || levelValue === 'level 3' ||
                levelValue === '1' || levelValue === '2' || levelValue === '3' ||
                levelValue === 'intern' || levelValue === 'trainee');
      });
    }

    if (selectedEmployeeType === "Intern" || selectedEmployeeType === "Extended Intern") {
      options = options.filter(option => {
        const levelValue = option.value.toString().toLowerCase();
        return levelValue === 'intern' || levelValue === 'trainee';
      });
    }
    
    return options;
  }, [baseLevelOptions, selectedEmployeeType]);

  return {
    employeeTypeOptions,
    employeeLocationOptions,
    employeeLevelOptions,
    departmentOptions,
    yearOfStudyOptions
  };
};