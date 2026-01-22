import { useSearchParams } from "react-router-dom";
import Left_Arrow from "../../assets/icons/leftEmployeeArrow.svg";
import { EmployeeRepositoryFormData } from "../utils/EmployeeRepositoryData";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/EmployeeOnBoardingForm.scss";
import { employeeOnboardingDetails, getSalaryComponents } from "../../../../actions/hrRepositoryAction";
import EmployeeRepositoryPopup from "./EmployeeRepositoryPopup";
import { getAllManagers } from "../../../../actions/hrRepositoryAction";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import CustomDropdown from "../../Common/components/CustomDropdown";
import CurrencyInput from "../../Common/components/CurrencyInput";
import { findMatchingKey } from "../../Common/utils/helper";
const EmployeeOnBoardingForm = () => {
  // Redux state selectors for component types and manager details
  const {loading, getAllComponentType, getAllManagersDetails, getAllCountries, defaultComponents } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  // URL search params management
  const [searchParams, setSearchParams] = useSearchParams();
  const showEmployeeOnBOardingForm =
    searchParams.get("EmployeeOnBoardingForm") === "true";

  // --- state for all employee onbaording fields ---
  const [empRepoFormFields, setEmpRepoFormFields] = useState(EmployeeRepositoryFormData);

  // Memoize initial form state to prevent recreation on every render
  const initialFormState = useMemo(() => {
    return empRepoFormFields.reduce((acc, field) => {
      // Set default value based on input type
      acc[field.name] = field.inputType.toLowerCase() === "checkbox" ? false : "";
      return acc;
    }, {});
  }, [empRepoFormFields]);

  // State management
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const dispatch = useDispatch();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const lastApiCallRef = useRef(null);

  // Memoize countries array to prevent unnecessary recalculations
  const countries = useMemo(() => {
    if (!getAllCountries || getAllCountries.length === 0) return [];
    
    return getAllCountries && getAllCountries?.map((country, index) => ({
      key: index + 1,
      code: country.countryIsoCode,
      name: country.countryName,
      currency: country.currencyCodeAlpha3,
      flag: country.countryFlagSvg,
      currencySymbol: country.currencySymbol
    }));
  }, [getAllCountries]);

  // Memoize default country selection
  const defaultCountry = useMemo(() => {
    if (countries.length === 0) return null;
    return countries.find(c => c.code === 'IN') || countries[0];
  }, [countries]);

  // Optimized click outside handler with cleanup
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownContainers = document.querySelectorAll('.custom-dropdown-container');
      let isClickInside = false;
      
      dropdownContainers.forEach(container => {
        if (container.contains(event.target)) {
          isClickInside = true;
        }
      });
      
      if (!isClickInside) {
        // Only handle custom dropdown containers, not currency input
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array - only run once

  // Set default country when countries array changes
  useEffect(() => {
    if (defaultCountry && !selectedCountry) {
      setSelectedCountry(defaultCountry);
    }
  }, [defaultCountry, selectedCountry]);

  // Initial data fetching - only run once on mount
  useEffect(() => {
    dispatch(getAllManagers());
  }, [dispatch]);

  // Optimized form field state management
  useEffect(() => {
    const shouldDisableLevel = (formData?.emp_type !== "FTE" && formData?.emp_type !== "OFTE" && formData?.emp_type !== "PTE" && formData?.emp_type !== "Intern" && formData?.emp_type !== "Extended Intern") || 
      (formData?.emp_department?.toLowerCase() === "leadership" && formData?.emp_type === "FTE");

    // Determine if year of study field should be shown (only for Intern and Extended Intern)
    const shouldShowYearOfStudy = formData?.emp_type === "Intern" || formData?.emp_type === "Extended Intern";

    if (shouldDisableLevel) {
      setFormData(prev => ({
        ...prev,
        emp_level: ""
      }));

      setErrors(prev => ({
        ...prev,
        emp_level: ""
      }));
    }

    // Clear year of study if employee type is not Intern or Extended Intern
    if (!shouldShowYearOfStudy && formData?.emp_year_of_study) {
      setFormData(prev => ({
        ...prev,
        emp_year_of_study: ""
      }));

      setErrors(prev => ({
        ...prev,
        emp_year_of_study: ""
      }));
    }

    setEmpRepoFormFields(prev =>
      prev.map(field => {
        if (field.name === "emp_level") {
          return { ...field, isDisabled: shouldDisableLevel };
        } else if (field.name === "emp_year_of_study") {
          return { ...field, isVisible: shouldShowYearOfStudy };
        }
        return field;
      })
    );
  }, [formData?.emp_type, formData?.emp_department, formData?.emp_year_of_study]);

  // Optimized API calls with better dependency management
  useEffect(() => {
    // Skip API call if required data is not loaded yet
    if (!getAllComponentType?.emp_type_dropdown || !getAllComponentType?.location_dropdown) {
      return;
    }
    const matchedKeys = {
      employeeType: findMatchingKey(getAllComponentType.emp_type_dropdown, formData?.emp_type),
      location: findMatchingKey(getAllComponentType.location_dropdown, formData?.emp_latest_location_state),
      level: findMatchingKey(getAllComponentType.level_dropdown, formData?.emp_level),
      department: findMatchingKey(getAllComponentType.department_type_dropdown, formData?.emp_department),
      yearOfStudy: findMatchingKey(getAllComponentType.year_of_study, formData?.emp_year_of_study)
    };

    const isInternType = formData?.emp_type === "Intern" || formData?.emp_type === "Extended Intern";
    const isFteOrOfteOrPte = formData?.emp_type === "FTE" || formData?.emp_type === "OFTE" || formData?.emp_type === "PTE";

    // Check if required fields are present based on employee type
    let hasRequiredFields = false;
    
    if (isInternType) {
      // For Intern/Extended Intern: require all 5 fields
      hasRequiredFields = formData?.emp_type && formData?.emp_latest_location_state && 
        formData?.emp_level && formData?.emp_department && formData?.emp_year_of_study;
    } else if (isFteOrOfteOrPte) {
      // For FTE/OFTE/PTE: require type, location, and level
      hasRequiredFields = formData?.emp_type && formData?.emp_latest_location_state && formData?.emp_level;
    } else {
      // For others (Consultant/Contractor): require type and location only
      hasRequiredFields = formData?.emp_type && formData?.emp_latest_location_state;
    }

    // Only make API call if we have all required data
    if (hasRequiredFields && matchedKeys.employeeType && matchedKeys.location) {
      let params;
      
      if (isInternType && matchedKeys.level) {
        // For Intern/Extended Intern: send all 5 parameters
        params = [matchedKeys.employeeType, matchedKeys.location, matchedKeys.level, matchedKeys.department, matchedKeys.yearOfStudy];
      } else if (isFteOrOfteOrPte && matchedKeys.level) {
        // For FTE/OFTE/PTE: send 3 parameters (department and yearOfStudy will be empty strings)
        params = [matchedKeys.employeeType, matchedKeys.location, matchedKeys.level];
      } else {
        // For others: send only 2 parameters
        params = [matchedKeys.employeeType, matchedKeys.location];
      }
      
      // Create a unique key for this API call to prevent duplicates
      const apiCallKey = params.join('_');
      
      // Only call if it's not a duplicate call
      if (lastApiCallRef.current !== apiCallKey) {
        lastApiCallRef.current = apiCallKey;
        dispatch(getSalaryComponents(...params));
      }
    }
  }, [
    formData?.emp_type, 
    formData?.emp_latest_location_state, 
    formData?.emp_level, 
    formData?.emp_department,
    formData?.emp_year_of_study,
    dispatch, 
    getAllComponentType?.emp_type_dropdown,
    getAllComponentType?.location_dropdown,
    getAllComponentType?.level_dropdown,
    getAllComponentType?.department_type_dropdown,
    getAllComponentType?.year_of_study
  ]);

  useEffect(() => {
    if (showEmployeeOnBOardingForm) {
      lastApiCallRef.current = null;
      dispatch(getSalaryComponents());
    }
  }, [showEmployeeOnBOardingForm, dispatch]);

  /**
   * Handles back button click and shows confirmation popup
   */
  const handleBackButtonClick = useCallback(() => {
    setIsOpen(true);
    setPendingSubmission(true);
  }, []);

  /**
   * Handles cancel button click and removes form parameter from URL
   */
  const handleCancelButtonClick = useCallback(() => {
    setSearchParams((prev) => {
      if (showEmployeeOnBOardingForm) {
        prev.delete("EmployeeOnBoardingForm");
      }
      return prev;
    });
  }, [setSearchParams, showEmployeeOnBOardingForm]);

  /**
   * Validates form fields and returns true if valid
   * @returns {boolean} - Form validity status
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    empRepoFormFields.forEach((field) => {
      if(field?.isDisabled || field?.isVisible === false) return;

      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label.replace(" *", "")} is required`;
      }

      // Email validation
      if (field.inputType === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Please enter a valid email address";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [empRepoFormFields, formData]);
  
  const createNewLevel = useCallback(() => {
    // console.log("Create New Level function called");
  }, []);
  
  /**
   * Handles input change events and updates form data
   * @param {Event} e - Input change event
   */
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    if (value === "Create New Level") {
      createNewLevel();
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    setErrors((prev) => {
      if (prev[name]) {
        return {
          ...prev,
          [name]: "",
        };
      }
      return prev;
    });
  }, [createNewLevel]);

  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    // Find matching keys for employee type and department
    const matched_employee_type_Keys = findMatchingKey(getAllComponentType?.emp_type_dropdown, formData?.emp_type);

    const matched_department_type_Keys = findMatchingKey(getAllComponentType?.department_type_dropdown, formData?.emp_department);

    const matched_level_type_keys = findMatchingKey(getAllComponentType?.level_dropdown, formData?.emp_level);

    const matched_location_type_keys = findMatchingKey(getAllComponentType?.location_dropdown, formData?.emp_latest_location_state);

    const matched_year_of_study_keys = findMatchingKey(getAllComponentType?.year_of_study, formData?.emp_year_of_study);

    // Find matching manager UUID
    const managerUuid = getAllManagersDetails.find(manager => {
      const fullName = manager.empLastName 
        ? `${manager.empFirstName} ${manager.empLastName}` 
        : manager.empFirstName;
      return fullName === formData.emp_reporting_manager;
    })?.empUuid || null;

    // Update form data with matched keys
    const updatedFormData = {
      ...formData,
      emp_type: matched_employee_type_Keys || formData.emp_type,
      emp_department: matched_department_type_Keys || formData.emp_department,
      emp_reporting_manager: managerUuid || formData.emp_reporting_manager,
      emp_salary_iso_code: selectedCountry?.code,
      emp_level: matched_level_type_keys || formData.emp_level,
      emp_latest_location_state: matched_location_type_keys || formData.emp_latest_location_state,
      emp_year_of_study: matched_year_of_study_keys || formData.emp_year_of_study,
    };

    // Dispatch action with updated form data
    dispatch(employeeOnboardingDetails(updatedFormData));

    // Clear form from URL params
    setSearchParams((prev) => {
      if (showEmployeeOnBOardingForm) {
        prev.delete("EmployeeOnBoardingForm");
      }
      return prev;
    });
  }, [validateForm, getAllComponentType, formData, getAllManagersDetails, selectedCountry, dispatch, setSearchParams, showEmployeeOnBOardingForm]);

  /**
   * Handles confirmation popup actions
   */
  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (pendingSubmission) {
      handleCancelButtonClick();
    }
    setPendingSubmission(false);
  }, [pendingSubmission, handleCancelButtonClick]);

  /**
   * Handles popup close action
   */
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Handles country selection for currency input
   * @param {Object} country - Selected country object
   */
  const handleCountryChange = useCallback((country) => {
    setSelectedCountry(country);
  }, []);

  // Memoize dropdown options to prevent recalculation on every render
  const dropdownOptions = useMemo(() => {
    if (!getAllComponentType) return {};

    return {
      department: Object.entries(getAllComponentType.department_type_dropdown || {}).map(([key, value]) => ({ key, value })),
      empType: Object.entries(getAllComponentType.emp_type_dropdown || {}).map(([key, value]) => ({ key, value })),
      managers: getAllManagersDetails?.map((manager) => ({
        key: manager.empUuid,
        value: manager.empLastName
          ? `${manager.empFirstName} ${manager.empLastName}`
          : manager.empFirstName,
      })) || [],
      location: Object.entries(getAllComponentType?.location_dropdown || {}).map(([key, value]) => ({ key, value })),
      levelBase: Object.entries(getAllComponentType?.level_dropdown || {}).map(([key, value]) => ({ key, value })),
      yearOfStudy: Object.entries(getAllComponentType?.year_of_study || {}).map(([key, value]) => ({ key, value }))
    };
  }, [getAllComponentType, getAllManagersDetails]);

  // Memoize filtered level options based on employee type
  const levelOptions = useMemo(() => {
    let options = [...dropdownOptions.levelBase];
    
    // Filter options for OFTE and PTE employee types - only allow levels 1, 2, 3
    if (formData?.emp_type === "OFTE" || formData?.emp_type === "PTE") {
      options = options.filter(option => {
        const levelValue = option.value.toString().toLowerCase();
        return levelValue.includes('1') || levelValue.includes('2') || levelValue.includes('3') || 
               levelValue === 'level 1' || levelValue === 'level 2' || levelValue === 'level 3' ||
               levelValue === '1' || levelValue === '2' || levelValue === '3';
      });
    }
    
    // Filter options for FTE employee type - exclude levels 1, 2, 3
    if (formData?.emp_type === "FTE") {
      options = options.filter(option => {
        const levelValue = option.value.toString().toLowerCase();
        return !(levelValue.includes('1') || levelValue.includes('2') || levelValue.includes('3') || 
                levelValue === 'level 1' || levelValue === 'level 2' || levelValue === 'level 3' ||
                levelValue === '1' || levelValue === '2' || levelValue === '3' || 
                levelValue === 'intern' || levelValue === 'trainee');
      });
    }

    // Filter options for Intern and extended intern employee type - only allow level Intern
    if (formData?.emp_type === "Intern" || formData?.emp_type === "Extended Intern") {
      options = options.filter(option => {
        const levelValue = option.value.toString().toLowerCase();
        return levelValue === 'intern' || levelValue === 'trainee';
      });
    }

    // options.push({ key: "create_new", value: "Create New Level", disabled: true });
    return options;
  }, [dropdownOptions.levelBase, formData?.emp_type]);

  /**
   * Renders form field based on input type
   * @param {Object} field - Field configuration object
   * @returns {JSX.Element} - Rendered form field
   */
  const renderField = useCallback((field) => {
    switch (field.inputType.toLowerCase()) {
      case "dropdown": {
        let options;
        if (field.name === "emp_department") {
          options = dropdownOptions.department;
        } else if (field.name === "emp_type") {
          options = dropdownOptions.empType;
        } else if (field.name === "emp_reporting_manager") {
          options = dropdownOptions.managers;
        } else if (field.name === "emp_level") {
          options = levelOptions;
        } else if (field.name === "emp_latest_location_state") {
          options = dropdownOptions.location;
        } else if (field.name === "emp_year_of_study") {
          options = dropdownOptions.yearOfStudy;
        } else {
          options = field.options?.map((option, index) => ({ key: index, value: option })) || [];
        }
        return (
          <CustomDropdown
            options={options}
            value={formData[field.name]}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            fieldName={field.name}
            error={!!errors[field.name]}
            disabled={field?.isDisabled}
            onCreateNew={createNewLevel}
            searchable={true}
          />
        );
      }

      case "checkbox":
        return (
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name]}
              onChange={handleInputChange}
            />
          </div>
        );

      case "num":
        return (
          <CurrencyInput
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            countries={countries}
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            placeholder={field.placeholder}
            error={!!errors[field.name]}
          />
        );

      default:
        return (
          <input
            type={field.inputType}
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            className={errors[field.name] ? "error" : ""}
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
          />
        );
    }
  }, [dropdownOptions, levelOptions, formData, handleInputChange, errors, createNewLevel, countries, selectedCountry, handleCountryChange]);

  const renderSalaryComponentField = useCallback((field) => {
    return (
      <div className="salary_component_field_container">
        <label className="salary_component_label" htmlFor={`salary-${field.componentId}`}>
          {field.componentName}
        </label>
        <input
          type="text"
          id={`salary-${field.componentId}`}
          name={field.amount}
          value={field.amount ? `${selectedCountry?.currencySymbol || ''} ${field.amount}` : "-"}
          className="salary_component_input"
          disabled
        />
      </div>
    );
  }, [selectedCountry]);

  return (
    <div className="employee_onboarding_form_main_container">
      <img
        src={Left_Arrow}
        alt="left_arrow"
        className="left_arrow"
        onClick={handleBackButtonClick}
      />
      <div className="employee_onboarding_form_container">
        <div className="employee_onboarding_form_header">
          <p className="employee_onboarding_form_header_title">
            Employee Onboarding
          </p>
          <div className="action_buttons">
            <button
              className="employee_onboarding_form_save_button"
              type="submit"
              onClick={handleSubmit}
            >
              <span>Save</span>
            </button>
            <button 
              className="employee_onboarding_form_cancel_button" 
              onClick={handleBackButtonClick}
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
        <hr />

        {loading ? (
            <LoadingSpinner message="Loading Onboarding Form..." height="40vh" />
          ) : (
            <>
          <div className="form_container">
          <p className="form_title">Basic Information</p>
          <hr className="form_title_hr"/>
          <form onSubmit={handleSubmit} className="form-grid">
            {empRepoFormFields
              .filter((field) => field.isVisible !== false) // Only show fields that are visible (undefined or true)
              .map((field) => (
              <div 
                key={field.name} 
                className={`${field.inputType.toLowerCase() === "checkbox" ? "checkbox-container" : "form-field"}`}
              >
                <label className={`onboard_form_label ${field?.isDisabled && "disabled"}`}>{field.label}</label>
                {renderField(field)}
                {errors[field.name] && (
                  <span className="error-message">{errors[field.name]}</span>
                )}
              </div>
            ))}
          </form>
          </div>

          {/* Salary Components Section */}
          <div className="form_container salary_components_container">
            <p className="form_title">Salary Components</p>
            <hr className="form_title_hr"/>
              {!defaultComponents || defaultComponents.length === 0 ? (
                <div className="salary_component_field_container">
                  <div className="salary_component_label salary_error_component">No salary components available</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="form-grid">
                  {[...defaultComponents]
                    .sort((a, b) => {
                      // Define the priority order for component types
                      const typePriority = {
                        'defaultAddition': 1,
                        'defaultDeduction': 2,
                      };

                      // Get priority for each component type
                      const aPriority = typePriority[a.componentType];
                      const bPriority = typePriority[b.componentType];
                      
                      // First sort by componentType priority
                      if (aPriority !== bPriority) {
                        return aPriority - bPriority;
                      }
                      
                      // Then sort by createdAt within the same componentType
                      return new Date(a.createdAt) - new Date(b.createdAt);
                    })
                    .map((field) => (
                    <div
                      key={field.componentId}
                      className="salary_component_field_container"
                    >
                    {renderSalaryComponentField(field)}
                    {errors[field.name] && (
                      <span className="error-message">{errors[field.name]}</span>
                    )}
                  </div>
                ))}
                </form>
              )}
          </div>
        </>)}
      </div>
      {isOpen && (
        <EmployeeRepositoryPopup
          isOpen={isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default EmployeeOnBoardingForm;