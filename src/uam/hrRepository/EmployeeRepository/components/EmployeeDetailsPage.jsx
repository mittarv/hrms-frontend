import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { formSections, govIdTypes, sectionFieldMapping } from "../utils/EmployeeRepositoryData";
import Back_icon from "../../assets/icons/leftEmployeeArrow.svg";
import Dropdown_Arrow from "../../assets/icons/dropdow_arrow.svg";
import Edit_Button from "../../assets/icons/edit_button.svg";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDate } from "../utils/EmployeeRepositoryData";
import {
  sendChangesToApprover,
  getCurrentEmployeeDetails,
  getAllComponentTypes,
  getAllManagers,
  getAllLeaves,
  getEmployeeLeaveBalance,
  getSalaryComponents,
} from "../../../../actions/hrRepositoryAction";
import "../styles/EmployeeDetailsPage.scss";
import { useDispatch } from "react-redux";
import EmployeeRepositoryPopup from "./EmployeeRepositoryPopup";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import ConversionDatePopup from "../../Common/components/ConversionDatePopup";
import CustomDropdown from "../../Common/components/CustomDropdown";
import CurrencyInput from "../../Common/components/CurrencyInput";
import { findMatchingKey, getComponentTypeValue } from "../../Common/utils/helper";

const EmployeeDetailsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [employeeTypeDropdown, setEmployeeTypeDropdown] = useState([]);
  const [employeeDepartmentType, setEmployeeDepartmentType] = useState([]);
  const [allManagersDetails, setAllManagersDetails] = useState([]);
  const isEditing = searchParams?.get("isEditing") === "true";
  const fromAttendance = searchParams?.get("fromAttendance") === "true";
  const [formData, setFormData] = useState({});
  const [initialFormData, setInitialFormData] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [changedFields, setChangedFields] = useState({});
  const [errors, setErrors] = useState({});
  const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const loading = hrRepositoryReducer?.loading ?? false;
  const getAllComponentType = useMemo(
    () => hrRepositoryReducer?.getAllComponentType ?? {},
    [hrRepositoryReducer?.getAllComponentType]
  );
  const currentEmployeeDetails = useMemo(
    () => hrRepositoryReducer?.currentEmployeeDetails ?? {},
    [hrRepositoryReducer?.currentEmployeeDetails]
  );
  const getAllManagersDetails = useMemo(
    () => hrRepositoryReducer?.getAllManagersDetails ?? {},
    [hrRepositoryReducer?.getAllManagersDetails]
  );
  const getAllCountries = useMemo(
    () => hrRepositoryReducer?.getAllCountries ?? {},
    [hrRepositoryReducer?.getAllCountries]
  );
  const allExisitingLeaves = useMemo(
    () => hrRepositoryReducer?.allExisitingLeaves ?? {},
    [hrRepositoryReducer?.allExisitingLeaves]
  );
  const balanceDetails = useMemo(
    () => hrRepositoryReducer?.balanceDetails ?? {},
    [hrRepositoryReducer?.balanceDetails]
  );
  const defaultComponents = useMemo(
    () => hrRepositoryReducer?.defaultComponents ?? {},
    [hrRepositoryReducer?.defaultComponents]
  );

  // Latest job details of employee
  // latest job details of employee would include the latest employee job de
  const latestJobDetails = useMemo(
    () => hrRepositoryReducer?.currentEmployeeDetails?.employeeLatestJobDetails ?? {},
    [hrRepositoryReducer?.currentEmployeeDetails?.employeeLatestJobDetails]
  );

  
  const { user } = useSelector((state) => state.user);
  const isAdmin = allToolsAccessDetails?.[selectedToolName];
  const dispatch = useDispatch();
  const employeeUuid = searchParams?.get("employeeUuid");
  const [popupOpen, setPopupOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [multiFieldStates, setMultiFieldStates] = useState({});
  const [showJoiningPopup, setShowJoiningPopup] = useState(false);
  const lastApiCallRef = useRef(null);
  const hasAccessToEditEmployee = allToolsAccessDetails?.[selectedToolName] >= 900 || 
    myHrmsAccess?.permissions?.some(perm => perm.name === "ActiveEmployee_update");

  useEffect(() => {
    if (employeeUuid) {
      if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
            dispatch(getAllComponentTypes());
      }
      dispatch(getAllManagers());
      dispatch(getCurrentEmployeeDetails(employeeUuid));
      dispatch(getAllLeaves());
      dispatch(getEmployeeLeaveBalance(employeeUuid));
    }
  }, [employeeUuid, dispatch, getAllComponentType]);


  useEffect(() => {
    const allCountries = getAllCountries.map((country, index) => ({
      key: index + 1,
      code: country.countryIsoCode,
      name: country.countryName,
      currency: country.currencyCodeAlpha3,
      flag: country.countryFlagSvg,
      currencySymbol: country.currencySymbol
    }));
    setCountries(allCountries);
    
    // Set default to India or first country\
    const defaultCountry = formData?.empPaymentCountryCode 
      ? allCountries.find(c => c.code === formData?.empPaymentCountryCode) 
      : null;
    setSelectedCountry(defaultCountry);
  }, [getAllCountries, isEditing, formData?.empPaymentCountryCode]);

  useEffect(() => {
    if(isEditing && initialFormData?.empType && (initialFormData?.empType != formData?.empType)) {
      setShowJoiningPopup(true);
    }
  }, [formData?.empType, initialFormData?.empType, isEditing])

  // --- useEffect to clear and disable emp level when emp type is not "FTE", "OFTE", "PTE", "Intern", or "Extended Intern" ---
  useEffect(() => {
    if (isEditing && formData?.empType && formData?.empType !== "FTE" && formData?.empType !== "OFTE" && formData?.empType !== "PTE" && formData?.empType !== "Intern" && formData?.empType !== "Extended Intern") {
      setFormData(prev => ({
        ...prev,
        empLevel: ""
      }));

      setErrors(prev => ({
        ...prev,
        empLevel: ""
      }));

      setChangedFields(prev => ({
        ...prev,
        empLevel: true
      }));
    }

    // Clear year of study if employee type is not Intern or Extended Intern
    if (isEditing && formData?.empType && formData?.empType !== "Intern" && formData?.empType !== "Extended Intern" && formData?.empYearOfStudy) {
      setFormData(prev => ({
        ...prev,
        empYearOfStudy: ""
      }));

      setErrors(prev => ({
        ...prev,
        empYearOfStudy: ""
      }));

      setChangedFields(prev => ({
        ...prev,
        empYearOfStudy: true
      }));
    }
  }, [formData?.empType, isEditing, formData?.empYearOfStudy]);

  // Optimized API calls for salary components with better dependency management
  useEffect(() => {
    // Skip API call if not editing or required data is not loaded yet
    if (!getAllComponentType?.emp_type_dropdown || !getAllComponentType?.location_dropdown) {
      return;
    }

    // Helper function to find matching key
    const findMatchingKey = (dropdown, value) => 
      Object.keys(dropdown || {}).find(key => dropdown[key] === value);

    const matchedKeys = {
      employeeType: findMatchingKey(getAllComponentType.emp_type_dropdown, formData?.empType),
      location: findMatchingKey(getAllComponentType.location_dropdown, formData?.state),
      level: findMatchingKey(getAllComponentType.level_dropdown, formData?.empLevel),
      department: findMatchingKey(getAllComponentType.department_type_dropdown, formData?.empDepartment),
      yearOfStudy: findMatchingKey(getAllComponentType.year_of_study, formData?.empYearOfStudy)
    };

    const isInternType = formData?.empType === "Intern" || formData?.empType === "Extended Intern";
    const isFteOfteOrPte = formData?.empType === "FTE" || formData?.empType === "OFTE" || formData?.empType === "PTE";

    // Check if required fields are present based on employee type
    let hasRequiredFields = false;
    
    if (isInternType) {
      // For Intern/Extended Intern: require all 5 fields
      hasRequiredFields = formData?.empType && formData?.state && 
        formData?.empLevel && formData?.empDepartment && formData?.empYearOfStudy;
    } else if (isFteOfteOrPte) {
      // For FTE/OFTE/PTE: require type, location, and level
      hasRequiredFields = formData?.empType && formData?.state && formData?.empLevel;
    } else {
      // For others (Consultant/Contractor): require type and location only
      hasRequiredFields = formData?.empType && formData?.state;
    }

    // Only make API call if we have all required data
    if (hasRequiredFields && matchedKeys.employeeType && matchedKeys.location) {
      let params;
      
      if (isInternType && matchedKeys.level) {
        // For Intern/Extended Intern: send all 5 parameters
        params = [matchedKeys.employeeType, matchedKeys.location, matchedKeys.level, matchedKeys.department, matchedKeys.yearOfStudy];
      } else if (isFteOfteOrPte && matchedKeys.level) {
        // For FTE/OFTE/PTE: send 3 parameters
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
    isEditing,
    formData?.empType, 
    formData?.state, 
    formData?.empLevel,
    formData?.empDepartment,
    formData?.empYearOfStudy,
    dispatch, 
    getAllComponentType?.emp_type_dropdown,
    getAllComponentType?.location_dropdown,
    getAllComponentType?.level_dropdown,
    getAllComponentType?.department_type_dropdown,
    getAllComponentType?.year_of_study
  ]);

  const getEmployeeType = useCallback(
    (employeeJobType) => {
      return employeeJobType
        ? employeeTypeDropdown[employeeJobType] || employeeJobType
        : "Unknown";
    },
    [employeeTypeDropdown]
  );

  const getEmployeeDepartment = useCallback(
    (employeeDepartment) => {
      return employeeDepartment
        ? employeeDepartmentType[employeeDepartment] || employeeDepartment
        : "Unknown";
    },
    [employeeDepartmentType]
  );

  const getManagerName = useCallback((managerUuid) => {
    const manager = allManagersDetails.find((m) => m.empUuid === managerUuid);
    return manager
      ? `${manager.empFirstName} ${manager.empLastName}`
      : "Unknown";
  }, [allManagersDetails]);

  useEffect(() => {
    if (getAllComponentType) {
      setEmployeeTypeDropdown(getAllComponentType?.emp_type_dropdown || []);
      setEmployeeDepartmentType(
        getAllComponentType?.department_type_dropdown || []
      );
    }
    setAllManagersDetails(getAllManagersDetails || []);
  }, [getAllComponentType, getAllManagersDetails]);

  useEffect(() => {
    if (currentEmployeeDetails) {
      const {
        employeeBasicDetails,
        employeeContactDetails,
        employeeCurrentJobDetails,
        employeeSalaryDetails,
        employeeAddressDetails,
        employeeBankDetails,
        employeeAdvanceSalaryDetails,
      } = currentEmployeeDetails;

      const initialFormData = {
        ...employeeBasicDetails,
        ...employeeContactDetails,
        ...employeeCurrentJobDetails,
        ...employeeSalaryDetails,
        ...employeeAddressDetails,
        ...employeeBankDetails,
        ...employeeAdvanceSalaryDetails,
      };
      // Convert employeeJobType and employeeDepartment
      initialFormData.empType = getEmployeeType(initialFormData.empType);
      initialFormData.empDepartment = getEmployeeDepartment(initialFormData?.empDepartment);
      if (initialFormData?.empManager) {
        initialFormData.empManager = getManagerName(initialFormData?.empManager);
      }
      if (initialFormData.empHireDate) {
        initialFormData.empHireDate = new Date(initialFormData?.empHireDate)
          .toISOString()
          .split("T")[0];
      }
      if (initialFormData.empConversionDate) {
        initialFormData.empConversionDate = new Date(initialFormData?.empConversionDate)
          .toISOString()
          .split("T")[0];
      }
      if (initialFormData.empGender) {
        initialFormData.empGender = getAllComponentType?.gender_type_dropdown &&
          getAllComponentType?.gender_type_dropdown[initialFormData?.empGender] ||
          initialFormData?.empGender;
      }
      if (initialFormData?.empBloodGroup != null && initialFormData.empBloodGroup.toString()) {
        initialFormData.empBloodGroup =
        getAllComponentType?.blood_group_dropdown && getAllComponentType?.blood_group_dropdown[
            initialFormData?.empBloodGroup
          ] || initialFormData?.empBloodGroup;
      }
      if (initialFormData?.empMaritalStatus != null && initialFormData.empMaritalStatus.toString()) {
        initialFormData.empMaritalStatus =
          getAllComponentType?.marital_status_dropdown &&
          getAllComponentType?.marital_status_dropdown[initialFormData?.empMaritalStatus] ||
          initialFormData?.empMaritalStatus;
      }
      if (initialFormData?.empEmergencyContactRelation != null && initialFormData.empEmergencyContactRelation.toString()) {
        initialFormData.empEmergencyContactRelation =
          getAllComponentType?.emergency_contact_relation_dropdown &&
          getAllComponentType?.emergency_contact_relation_dropdown[initialFormData?.empEmergencyContactRelation] ||
          initialFormData?.empEmergencyContactRelation;
      }
      if(initialFormData?.empDob){
        initialFormData.empDob = new Date(initialFormData?.empDob)
         .toISOString()
         .split("T")[0];
      }
      if (initialFormData.state) {
        initialFormData.state = getAllComponentType?.location_dropdown &&
          getAllComponentType?.location_dropdown[initialFormData?.state] ||
          initialFormData?.state;
      }

      if (initialFormData?.empLevel != null && initialFormData.empLevel.toString()) {
        initialFormData.empLevel =
        getAllComponentType?.level_dropdown && getAllComponentType?.level_dropdown[
            initialFormData?.empLevel
          ] || initialFormData?.empLevel;
      }

      if (initialFormData?.empYearOfStudy != null && initialFormData.empYearOfStudy.toString()) {
        initialFormData.empYearOfStudy =
        getAllComponentType?.year_of_study && getAllComponentType?.year_of_study[
            initialFormData?.empYearOfStudy
          ] || initialFormData?.empYearOfStudy;
      }

      setFormData(initialFormData);
      setInitialFormData(initialFormData);
    }
  }, [currentEmployeeDetails, getAllComponentType, getEmployeeType, getEmployeeDepartment, getManagerName]);

  useEffect(() => {
    if (isEditing) {
      const allExpanded = formSections?.reduce((acc, section) => {
        acc[section.id] = true;
        return acc;
      }, {});
      setExpandedSections(allExpanded);
    }
  }, [isEditing]);

  // Separate effect for parsing empGovId data to avoid infinite loops
  useEffect(() => {
    if (isEditing && initialFormData?.empGovId) {
      let govIdType = "", govIdNumber = "";
      
      try {
        const parsed = JSON.parse(initialFormData.empGovId);
        govIdType = parsed.govIdType || "";
        govIdNumber = parsed.govIdNumber || "";
      } catch (e) {
        const parts = initialFormData.empGovId.split(': ');
        if (parts.length === 2) {
          govIdType = parts[0];
          govIdNumber = parts[1];
        }
      }
      
      if (govIdType && govIdNumber) {
        setMultiFieldStates(prev => ({
          ...prev,
          empGovId: { type: govIdType, value: govIdNumber }
        }));
        
        // Convert to new format for consistency
        const jsonData = JSON.stringify({govIdType: govIdType, govIdNumber: govIdNumber});
        setFormData(prev => ({...prev, empGovId: jsonData}));
      }
    }
  }, [isEditing, initialFormData?.empGovId]);
  const handleEdit = () => {
    // Allow users to edit their own profile without permission check
    const isEditingOwnProfile = user.employeeUuid === currentEmployeeDetails?.employeeBasicDetails?.empUuid;
    
    if (isEditingOwnProfile) {
      // User is editing their own profile - allow without permission check
      setSearchParams((prev) => {
        prev.set("isEditing", "true");
        return prev;
      });
    } else {
      // User is editing someone else's profile - require permission
      if(isAdmin < 900 && !hasAccessToEditEmployee){
        window.alert("You are not authorized to edit this employee");
        return;
      }
      setSearchParams((prev) => {
        prev.set("isEditing", "true");
        return prev;
      });
    }
  };

  //Validation to ensure that all required fields are filled in before sending changes to the approver.
  //This validation is applied only if the user is not an admin or if the user is
  const validateFormData = () => {
    const newErrors = {};
    formSections?.forEach((section) => {
      section?.fields?.forEach((field) => {
        let value = formData[field?.name];
        const rules = field?.validationRules;
        if (typeof value === "string") {
            value = value.trim();
        }
        if (rules) {
          // Multi-field validation
          if (field?.type === "multi-field" && rules?.required) {
            const multiState = multiFieldStates[field?.name];
            const isValid = (multiState?.type && multiState?.value) || (value && value.trim());
            if (!isValid) {
              newErrors[field?.name] = `${field.label} is required`;
            }
          } else if (rules?.required && !value) {
            newErrors[field?.name] = `${field.label} is required`;
          } else if (rules?.format === "alphabetic" && value && !/^[A-Za-z]+$/.test(value)) {
            newErrors[field?.name] = `${field.label} must be alphabetic`;
          } else if (rules?.format === "validEmail" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[field?.name] = `${field.label} must be a valid email`;
          } else if (rules?.format === "numeric" && value && isNaN(value)) {
            newErrors[field?.name] = `${field.label} must be numeric`;
          } else if (rules?.maxLength && value && String(value).length > rules.maxLength) {
            newErrors[field?.name] = `${field.label} must be less than ${rules.maxLength} characters`;
          } else if (rules?.length && value && String(value).length !== rules.length) {
            newErrors[field?.name] = `${field.label} must be ${rules.length} characters long`;
          }
        }
      });
    });
    setErrors(newErrors);
    return Object?.keys(newErrors).length === 0;
  };

  //Validation to ensure that official email and personal email are not the same. This applies to both users and admins.
const emailValidation = (updatedFormData) => {
  const newErrors = {};
  if (
    formData?.empOfficialEmail &&
    updatedFormData?.empPersonalEmail &&
    formData.empOfficialEmail.trim().toLowerCase() === updatedFormData.empPersonalEmail.trim().toLowerCase()
  ) {
    newErrors.empPersonalEmail = "Personal email must be different from official email";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSave = () => {
    const updatedFormData = Object.keys(changedFields).reduce((acc, key) => {
      acc[key] = formData[key];
      return acc;
    }, {});

    // Users with userType <= 100 must pass validation, Admins with userType > 100 can skip validation.
    if (isAdmin < 900 && !hasAccessToEditEmployee) {
      if (!validateFormData()) {
        window.alert("Please fill in all required fields.");
        return;
      }
    }

    //Validation to ensure that official email and personal email are not the same. This applies to both users and admins.
    if(updatedFormData?.empPersonalEmail) {
      if (!emailValidation(updatedFormData)) {
        window.alert("Personal email must be different from official email.");
        return;
      }
    }

    const transformedFormData = { ...updatedFormData };
  
    if (selectedCountry?.code !== initialFormData.empPaymentCountryCode) {
      transformedFormData.empPaymentCountryCode = selectedCountry?.code;
    }
  
    if (updatedFormData.empType) {
      const matched_employee_type_Keys = findMatchingKey(
        getAllComponentType?.emp_type_dropdown,
        updatedFormData?.empType
      );
      transformedFormData.empType =
        matched_employee_type_Keys || updatedFormData?.empType;
    }
  
    if (updatedFormData.empDepartment) {
      const matched_department_type_Keys = findMatchingKey(
        getAllComponentType?.department_type_dropdown,
        updatedFormData?.empDepartment
      );
      transformedFormData.empDepartment =
        matched_department_type_Keys || updatedFormData?.empDepartment;
    }
  
    if (updatedFormData.empGender) {
      const matched_gender_type_Keys = findMatchingKey(
        getAllComponentType?.gender_type_dropdown,
        updatedFormData?.empGender
      );
      transformedFormData.empGender =
        matched_gender_type_Keys || updatedFormData?.empGender;
    }
    if (updatedFormData.empBloodGroup) {
      const matched_blood_group_keys = findMatchingKey(
        getAllComponentType?.blood_group_dropdown,
        updatedFormData?.empBloodGroup
      );
      transformedFormData.empBloodGroup =
        matched_blood_group_keys || updatedFormData?.empBloodGroup;
    }
    if (updatedFormData.empMaritalStatus) {
      const matched_marital_status_keys = findMatchingKey(
        getAllComponentType?.marital_status_dropdown,
        updatedFormData?.empMaritalStatus
      );
      transformedFormData.empMaritalStatus =
        matched_marital_status_keys || updatedFormData?.empMaritalStatus;
    }
  
    if (updatedFormData.empEmergencyContactRelation) {
      const matched_emergency_contact_relation_keys = findMatchingKey(
        getAllComponentType?.emergency_contact_relation_dropdown,
        updatedFormData?.empEmergencyContactRelation
      );
      transformedFormData.empEmergencyContactRelation =
        matched_emergency_contact_relation_keys ||
        updatedFormData?.empEmergencyContactRelation;
    }
  
    if (updatedFormData?.empManager) {
      const managerUuid =
        getAllManagersDetails?.find((manager) => {
          const fullName = manager?.empLastName
            ? `${manager?.empFirstName} ${manager?.empLastName}`
            : manager?.empFirstName;
          return fullName === updatedFormData?.empManager;
        })?.empUuid || null;
      transformedFormData.empManager =
        managerUuid || updatedFormData?.empManager;
    }

    if(updatedFormData?.state){
      const matched_location_type_keys = findMatchingKey(
        getAllComponentType?.location_dropdown,
        updatedFormData?.state
      );
      transformedFormData.state =
      matched_location_type_keys || updatedFormData?.state;
    }

    if(updatedFormData?.empLevel){
      const matched_level_type_keys = findMatchingKey(
        getAllComponentType?.level_dropdown,
        updatedFormData?.empLevel
      );
      transformedFormData.empLevel =
      matched_level_type_keys || updatedFormData?.empLevel;
    }

    if(updatedFormData?.empYearOfStudy){
      const matched_year_of_study_keys = findMatchingKey(
        getAllComponentType?.year_of_study,
        updatedFormData?.empYearOfStudy
      );
      transformedFormData.empYearOfStudy =
      matched_year_of_study_keys || updatedFormData?.empYearOfStudy;
    }
  
    if (Object.keys(transformedFormData).length <= 0) {
      setChangedFields({});
      setExpandedSections({});
      setMultiFieldStates({});
      setSearchParams((prev) => {
        prev.delete("isEditing");
        return prev;
      });

      return;
    }
  
    const sectionChanged = Object.keys(sectionFieldMapping).reduce((acc, sectionId) => {
      const changedFieldsInSection = sectionFieldMapping[sectionId].reduce((fieldsAcc, field) => {
        if (transformedFormData[field.name] !== undefined) {
          fieldsAcc[field.name] = transformedFormData[field.name];
        }
        return fieldsAcc;
      }, {});
  
      if (Object.keys(changedFieldsInSection).length > 0) {
        acc.push({ [sectionId]: changedFieldsInSection });
      }
  
      return acc;
    }, []);
  
    const ApprovalFormData = {
      userType: isAdmin,
      requestedBy: user && user?.employeeUuid,
      requestedFor: formData?.empUuid,
      sectionChanged: sectionChanged,
    };

    dispatch(sendChangesToApprover(ApprovalFormData));
    setSearchParams((prev) => {
      prev.delete("isEditing");
      return prev;
    });
    setChangedFields({});
    setExpandedSections({});
    setMultiFieldStates({});
  };

  const handleCancel = () => {
    setPopupOpen(true);
    setPendingSubmission(true);
  };

  const toggleSection = (sectionId) => {
    if (!isEditing) {
      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: !prev[sectionId],
      }));
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setChangedFields((prev) => {
      const newChangedFields = {
        ...prev,
        [name]: true,
      };
      return newChangedFields;
    });
  };

  const handleMultiFieldChange = (fieldName, type, value) => {
    const hasData = type && value;
    const jsonData = hasData ? JSON.stringify({govIdType: type, govIdNumber: value}) : null;
    
    setFormData(prev => ({...prev, [fieldName]: jsonData}));
    setMultiFieldStates(prev => ({...prev, [fieldName]: {type, value}}));
    
    if (hasData) {
      setChangedFields(prev => ({...prev, [fieldName]: true}));
      setErrors(prev => {const newErrors = {...prev}; delete newErrors[fieldName]; return newErrors;});
    } else {
      setChangedFields(prev => {const newFields = {...prev}; delete newFields[fieldName]; return newFields;});
    }
  };

  const handleBackButton = () => {
  if(isEditing){
    setPopupOpen(true);
    setPendingSubmission(true);
  } else {
    setSearchParams((prev) => {
      prev.delete("showEmployeeDetails");
      prev.delete("employeeUuid");
      prev.delete("isEditing");
      if(fromAttendance) {
        prev.delete("fromAttendance");
      }
      return prev;
    });

    if(fromAttendance) {
      window.location.href = "/leave-attendance";
    }
  }
};

  const handleConfirm = () => { 
    if (pendingSubmission) {
      handleCancel();
      handleBackButton();
    }

    setPopupOpen(false);
    setPendingSubmission(false);
    setSearchParams((prev) => {
      prev.delete("isEditing");
      return prev;
    });
    setFormData(initialFormData);
    setExpandedSections({});
    setChangedFields({});
    setErrors({});
    setMultiFieldStates({});
  };


  const handleClose = () => {
    setPopupOpen(false);
  };

  // Handle country change for currency input
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    handleInputChange('empPaymentCountryCode', country.code);
  };

  // handle joining popup close
  const handleJoiningPopupClose = () => {
    setShowJoiningPopup(false);
    setFormData((prev) => ({
      ...prev,
      empType: initialFormData?.empType,
      empHireDate: initialFormData?.empHireDate
    }));
  }

  // handle joining popup save
  const handleJoiningPopupSave = (empConversionDate) => {
    setShowJoiningPopup(false);
    handleInputChange('empConversionDate', empConversionDate);
  }

  const renderField = (field, sectionId) => {
    const isLeaveField = field?.name?.toLowerCase().includes("leaves");
    
    // Check if level field should be disabled based on employee type
    const isLevelFieldDisabled = field?.name === "empLevel" && 
      formData?.empType && 
      formData?.empType !== "FTE" && 
      formData?.empType !== "OFTE" && 
      formData?.empType !== "PTE" && 
      formData?.empType !== "Intern" && 
      formData?.empType !== "Extended Intern";

    // Check if year of study field should be hidden based on employee type
    const isYearOfStudyFieldHidden = field?.name === "empYearOfStudy" && 
      formData?.empType && 
      formData?.empType !== "Intern" && 
      formData?.empType !== "Extended Intern";

    // If year of study field should be hidden, don't render it
    if (isYearOfStudyFieldHidden) {
      return null;
    }
    
    const isFieldDisabled =
      sectionId === "leaves-info" || field?.name === "empLastLogin"
        ? isLeaveField || field?.disabled
        : isLeaveField || ((isAdmin < 900 && !hasAccessToEditEmployee) && field?.disabled) || isLevelFieldDisabled;
    const error = errors[field.name];

    const countryCurrency = formData?.empPaymentCountryCode 
      ? countries.find(c => c.code === formData.empPaymentCountryCode)?.currencySymbol 
      : null;

    if (isEditing) {
      if (field.type === "num") {
        return (
          <>
            <CurrencyInput
              name={field.name}
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value === "" ? null : Number(e.target.value))}
              countries={countries}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
              disabled={isFieldDisabled}
              error={!!error}
            />
            {error && <span className="error-message">{error}</span>}
          </>
        );
      } else if (field?.type === "select") {
        let options;
        if (field?.name === "empDepartment") {
          options = Object.values(
            getAllComponentType?.department_type_dropdown || {}
          );
        } else if (field?.name === "empType") {
          options = Object.values(getAllComponentType?.emp_type_dropdown || {});
        } else if (field?.name === "empManager") {
          options = getAllManagersDetails?.map((manager) =>
            manager?.empLastName
              ? `${manager.empFirstName} ${manager.empLastName}`
              : manager?.empFirstName
          );
        } else if (field?.name === "empGender") {
          options = Object.values(
            getAllComponentType?.gender_type_dropdown || {}
          );
        } else if (field?.name === "empBloodGroup") {
          options = Object.values(
            getAllComponentType?.blood_group_dropdown || {}
          );
        } else if (field?.name === "empMaritalStatus") {
          options = Object.values(
            getAllComponentType?.marital_status_dropdown || {}
          );
        } else if (field?.name === "empEmergencyContactRelation") {
          options = Object.values(
            getAllComponentType?.emergency_contact_relation_dropdown || {}
          );
        } else if (field?.name === "state") {
          options = Object.values(
            getAllComponentType?.location_dropdown || {}
          );
        } else if (field?.name === "empLevel") {
          options = Object.values(
            getAllComponentType?.level_dropdown || {}
          );
          
          // Filter options for OFTE employee type - only allow levels 1, 2, 3
          if (formData?.empType === "OFTE" || formData?.empType === "PTE") {
            options = options.filter(option => {
              const levelValue = option.toString().toLowerCase();
              return levelValue.includes('1') || levelValue.includes('2') || levelValue.includes('3') || 
                     levelValue === 'level 1' || levelValue === 'level 2' || levelValue === 'level 3' ||
                     levelValue === '1' || levelValue === '2' || levelValue === '3';
            });
          }
          
          // Filter options for FTE employee type - exclude levels 1, 2, 3
          if (formData?.empType === "FTE") {
            options = options.filter(option => {
              const levelValue = option.toString().toLowerCase();
              return !(levelValue.includes('1') || levelValue.includes('2') || levelValue.includes('3') || 
                      levelValue === 'level 1' || levelValue === 'level 2' || levelValue === 'level 3' ||
                      levelValue === '1' || levelValue === '2' || levelValue === '3' || 
                      levelValue === 'intern' || levelValue === 'trainee');
            });
          }

          // Filter options for Intern and Extended Intern employee types - only allow intern and trainee levels
          if (formData?.empType === "Intern" || formData?.empType === "Extended Intern") {
            options = options.filter(option => {
              const levelValue = option.toString().toLowerCase();
              return levelValue === 'intern' || levelValue === 'trainee';
            });
          }
        } else if (field?.name === "empYearOfStudy") {
          options = Object.values(
            getAllComponentType?.year_of_study || {}
          );
        } else {
          options = field?.options;
        }
        
        // Convert options array to the format expected by CustomDropdown
        const dropdownOptions = options?.map((option, index) => ({
          key: index,
          value: option
        })) || [];
        
        return (
          <div>
            <CustomDropdown
              options={dropdownOptions}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, sectionId)}
              placeholder={`Select ${field.label}`}
              fieldName={field.name}
              error={!!error}
              disabled={isFieldDisabled}
              searchable={true}
            />
            {error && <span className="form_error_message">{error}</span>}
          </div>
        );
      } else if (field.type === "date") {
        return (
          <>
            <input
              type="date"
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, sectionId)}
              disabled={isFieldDisabled}
            />
            {error && <span className="form_error_message">{error}</span>}
          </>
        );
      } else if (field.type === "checkbox") {
        return (
          <>
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked, sectionId)}
              disabled={isFieldDisabled}
            />
            {error && <span className="form_error_message">{error}</span>}
          </div>
          </>
        );
      } else if (field.type === "number"){
        return (
          <>
            <input
              type="number"
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value === "" ? null : Number(e.target.value), sectionId)}
              disabled={isFieldDisabled}
            />
            {error && <span className="form_error_message">{error}</span>}
          </>
        );
      } else if (field.type === "multi-field") {
        const fieldOptions = field.options || govIdTypes;
        const currentState = multiFieldStates[field.name] || {type: "", value: ""};
        // Convert options array to the format expected by CustomDropdown
        const dropdownOptions = fieldOptions?.map((option, index) => ({
          key: index,
          value: option?.label || option.value || "",
        })) || [];
        
        return (
          <div className="multi-field-container">
            <div className="multi-field-wrapper">
              <CustomDropdown
                options={dropdownOptions}
                value={currentState.type}
                onChange={(e) => handleMultiFieldChange(field.name, e.target.value, currentState.value)}
                placeholder={`Select ${field.dropdownLabel || "Type"}`}
                fieldName={field.name}
                error={!!error}
                disabled={isFieldDisabled}
                searchable={true}
              />
              <input
                type="text"
                value={currentState.value}
                onChange={(e) => handleMultiFieldChange(field.name, currentState.type, e.target.value)}
                disabled={isFieldDisabled}
                placeholder={currentState.type ? `Enter ${fieldOptions.find(o => o.value === currentState.type)?.label || currentState.type} ${field.inputLabel || "Number"}` : field.placeholder || "Select type first"}
                className="multi-field-input"
              />
            </div>
            {error && <span className="form_error_message">{error}</span>}
          </div>
        );
      }else {
        return (
          <>
            <input
              type={field.type}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, sectionId)}
              disabled={isFieldDisabled}
            />
            {error && <span className="form_error_message">{error}</span>}
          </>
        );
      }
    } else {
      if (field.type === "date") {
        return (
          <span className="field-value">
            {formData[field.name] ? formatDate(formData[field.name]) : "N/A"}
          </span>
        );
      } else if(field.name === "empFullName") {
        const fullName = `${formData.empFirstName || ""} ${formData.empLastName || ""}`.trim();
        return fullName ? <div className="field-value">{fullName}</div> : null;
      } else if(field.name === "isManager") {
        return (
          <div className="field-value">
            {formData[field.name] ? "Yes" : "No"}
          </div>
        );
      } else if(field.name === "empAnnualSalary" || field.name === "empCurrentAdvanceSalaryAmount") {
        return (
          <div className="field-value">
            {formData[field.name] ? (
              <>
                {formData?.empPaymentCountryCode && (
                  <span>{countryCurrency} {formData[field.name]}</span>
                )}
   
              </>
            ) : (
              "-"
            )}
          </div>
        );
      } else if(field.type === "multi-field") {
        if (!formData[field.name]) return <div className="field-value">-</div>;
        
        let typeValue = "", inputValue = "";
        try {
          const parsed = JSON.parse(formData[field.name]);
          typeValue = parsed.govIdType;
          inputValue = parsed.govIdNumber;
        } catch (e) {
          const parts = formData[field.name].split(': ');
          if (parts.length === 2) [typeValue, inputValue] = parts;
        }
        
        if (typeValue && inputValue) {
          const fieldOptions = field.options || govIdTypes;
          const typeLabel = fieldOptions.find(opt => opt.value === typeValue)?.label || typeValue;
          return <div className="field-value">{typeLabel}: {inputValue}</div>;
        }
        
        return <div className="field-value">-</div>;
      } else {
        // Handle all other field types in display mode
        const displayValue = formData[field.name];
        if (field.type === "checkbox") {
          return <div className="field-value">{displayValue ? "Yes" : "No"}</div>;
        } else if (field.type === "email") {
          return <div className="field-value">{displayValue ? <a href={`mailto:${displayValue}`} style={{textDecoration: 'none', color: 'inherit'}}>{displayValue}</a> : "-"}</div>;
        } else if (field.type === "tel" || field.name?.toLowerCase().includes("phone")) {
          return <div className="field-value">{displayValue ? <a href={`tel:${displayValue}`} style={{textDecoration: 'none', color: 'inherit'}}>{displayValue}</a> : "-"}</div>;
        } else {
          return <div className="field-value">{displayValue || "-"}</div>;
        }
      }
    }
  };

const renderLeaveField = () => {
  const employeeType = currentEmployeeDetails?.employeeCurrentJobDetails?.empType;
  const employeeUuid = currentEmployeeDetails?.employeeBasicDetails?.empUuid;
  const empGender = currentEmployeeDetails?.employeeBasicDetails?.empGender;
  
  if (!empGender) {
    if (!isEditing) {
      return (
        <div className="leave-fields-container">
          <Link 
            to={`?showEmployeeDetails=true&employeeUuid=${employeeUuid}&isEditing=true`}
            className="gender-missing-message">
            Please fill all the mandatory profile details to apply for leaves
          </Link>
        </div>
      );
    } else {
      return (
        <div className="leave-fields-container">
          <div className="gender-missing-message">
            Please fill all the mandatory profile details to apply for leaves
          </div>
        </div>
      );
    }
  }

  // Filter leave configurations applicable to the current employee type and gender
  const applicableLeaves = allExisitingLeaves?.filter(config => {
    try {
      const empTypes = JSON.parse(config.employeeType);
      const isEmpTypeApplicable = empTypes.includes(employeeType);
      
      // Check gender applicability
      const appliedGenders = JSON.parse(config.appliedGender);
      const isGenderApplicable = appliedGenders.includes(empGender);
      
      return isEmpTypeApplicable && isGenderApplicable;
    } catch (error) {
      console.error("Error parsing employeeType or appliedGender:", error);
      return false;
    }
  });

  // Function to get used leaves for a specific leave config for the current employee
  const getUsedLeaves = (leaveConfigId) => {
    const balance = balanceDetails?.find(detail => 
      detail.leaveConfigId === leaveConfigId && detail.empUuid === employeeUuid
    );
    return balance ? parseFloat(balance.totalLeaveUsed) : 0;
  };

  // Function to format leave balance display
  const formatLeaveBalance = (usedLeaves, totalLeaves) => {
    return `${usedLeaves}/${totalLeaves}`;
  };

  // Check if no applicable leaves found after filtering
  if (!applicableLeaves || applicableLeaves.length === 0) {
    const noDataMessage = "No leave data available for this employee.";
    
    if (!isEditing) {
      return (
        <div className="leave-fields-container">
          <div className="no-leave-data-message">
            {noDataMessage}
          </div>
        </div>
      );
    } else {
      return (
        <div className="leave-fields-container">
          <div className="no-leave-data-message">
            {noDataMessage}
          </div>
        </div>
      );
    }
  }

  if (!isEditing) {
    return (
      <div className="leave-fields-container">
        {applicableLeaves.map((leave, index) => {
          const usedLeaves = getUsedLeaves(leave.leaveConfigId);
          const balanceText = formatLeaveBalance(usedLeaves, leave.totalAllotedLeaves);
          
          return (
            <div key={leave.leaveConfigId || `leave-${index}`} className="leave-field-item">
              <div className="leave-label">{leave.leaveType}</div>
              <div className="leave-balance">{balanceText}</div>
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <div className="leave-fields-container">
        {applicableLeaves.map((leave, index) => {
          const usedLeaves = getUsedLeaves(leave.leaveConfigId);
          const balanceText = formatLeaveBalance(usedLeaves, leave.totalAllotedLeaves);
          
          return (
            <div key={leave.leaveConfigId || `leave-edit-${index}`} className="leave-field-item">
              <label htmlFor={`leave-${leave.leaveConfigId}`} className="leave-label">
                {leave.leaveType}
              </label>
              <input
                id={`leave-${leave.leaveConfigId}`}
                type="text"
                value={balanceText}
                disabled
                className="leave-balance-input"
                readOnly
              />
            </div>
          );
        })}
      </div>
    );
  }
};

const renderSalaryConfigField = () => {
  if (!defaultComponents || defaultComponents.length === 0) {
    return (
      <div className="salary-config-container">
        <div className="no-salary-data">No salary components available</div>
      </div>
    );
  }

  if(isEditing) {
      return (
        <div className="salary-config-container">
          {defaultComponents.map((component, index) => {
            return (
              <div key={component.componentId || index} className="salary-component-field">
                <label htmlFor={`salary-${component.componentId || index}`} className="salary-component-label">
                  {component.componentName}
                </label>
                <input 
                  id={`salary-${component.componentId || index}`}
                  type="text" 
                  value={component.amount ? `${selectedCountry?.currencySymbol || ''} ${component.amount}` : "-"} 
                  disabled
                  className="salary-component-input"
                  readOnly
                />
              </div>
            )
          })}
        </div>
    );
  } else {
    return (
      <div className="salary-config-container">
        {defaultComponents.map((component, index) => {
          return (
            <div key={component.componentId || index} className="salary-component-field">
              <div className="salary-component-label">{component.componentName}</div>
              <div className="salary-component-value">
                {component.amount ? `${selectedCountry?.currencySymbol || ''} ${component.amount}` : "-"}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

};

  return (
    <>
      {loading ? (
        <LoadingSpinner message="Loading Your Profile Data..." height="40vh" />
      ) : (
        <div className="employee-form">
          <div className="form-header">
            <button className="back-button" onClick={handleBackButton}>
              <img src={Back_icon} alt="Back Icon" />
            </button>
            {isEditing ? (
              <div className="action-buttons">
                <button className="save-button" onClick={handleSave}>
                  <span>Save Changes</span>
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <>
              {/* Show Edit button if user is editing their own profile OR has admin access OR has permission */}
              {(user.employeeUuid === currentEmployeeDetails?.employeeBasicDetails?.empUuid || isAdmin >= 900 || hasAccessToEditEmployee) && (
                <button className="edit-button" onClick={handleEdit}>
                  <img src={Edit_Button} alt="Edit Button" />
                  <span>Edit</span>
                </button>
              )}
              </>
            )}
          </div>

          <div className="form-sections">
            {formSections.map((section) => (
              <div key={section.id} className="form-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <p>{section.title}</p>
                  <span
                    className={`arrow ${
                      expandedSections[section.id] ? "expanded" : ""
                    }`}
                  >
                    <img src={Dropdown_Arrow} alt="Dropdown Arrow" />
                  </span>
                </div>

                {expandedSections[section.id] && (
                  <>
                    <div className="hr_line">
                      <hr />
                    </div>
                    <div className="section-content">
                      <div
                        className={
                          section.id === "leaves-info"
                            ? "leaves-info-grid"
                            : section.id === "salary-config"
                            ? "salary-config-grid"
                            : [
                                "fields-grid",
                                isEditing ? "editing" : "",
                                section.id === "leaves" ? "leaves-grid" : ""
                              ].filter(Boolean).join(" ")
                        }
                      >
                        {(() => {
                          // Handle special sections that don't use regular field mapping
                          if (section.id === "salary-config") {
                            return renderSalaryConfigField();
                          }
                          if (section.id === "leaves-info") {
                            return renderLeaveField();
                          }
                          
                          // Handle regular sections with field mapping
                          return section.fields
                            .filter((field) => {
                              if (!isEditing && (field.name === "empFirstName" || field.name === "empLastName")) {
                                return false;
                              }
                              if (isEditing && field.name === "empFullName") {
                                return false;
                              }
                              // Hide year of study field if employee type is not Intern or Extended Intern
                              if (field.name === "empYearOfStudy" && 
                                  formData?.empType && 
                                  formData?.empType !== "Intern" && 
                                  formData?.empType !== "Extended Intern") {
                                return false;
                              }
                              return true;
                            })
                            .map((field, fieldIndex) => (
                              <div
                                key={field.name || `field-${fieldIndex}`}
                                className="field"
                              >
                                <label>{field?.validationRules?.required ? `${field.label} *` : field.label}</label>
                                {renderField(field, section.id)}
                              </div>
                            ));
                        })()}
                      </div>

                      {/* Future Conversion Date */}
                      {/* Visible only when empConversionDate is in the future and section is basic info */}
                      {
                        (new Date(latestJobDetails.empConversionDate) > new Date()) && section.id === "basic-info" &&
                        <div className="upcoming_conversion_date">
                          <span>
                            {`${getComponentTypeValue(latestJobDetails.empType, getAllComponentType)} on `}
                          </span>
                          <span>
                            {latestJobDetails.empConversionDate ? formatDate(latestJobDetails.empConversionDate) : "N/A"}
                          </span>
                        </div>
                      }
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {popupOpen && (
            <EmployeeRepositoryPopup
              isOpen={popupOpen}
              onClose={handleClose}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      )}
      {showJoiningPopup && <ConversionDatePopup onCancel={handleJoiningPopupClose} onSave={handleJoiningPopupSave}/>}
    </>
  );
};

export default EmployeeDetailsPage;