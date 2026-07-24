import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { formSections, govIdTypes, sectionFieldMapping } from "../utils/EmployeeRepositoryData";
import { hasLevel, hasYearOfStudy, getSalaryParamTier, getGovIdOptions, isLevelDisabled } from "../../Common/utils/orgSettingsConfig";
import Back_icon from "../../assets/icons/leftEmployeeArrow.svg";
import Dropdown_Arrow from "../../assets/icons/dropdow_arrow.svg";
import Edit_Button from "../../assets/icons/edit_button.svg";
import Checkbox_Checked from "../../assets/icons/checkbox_checked.svg";
import Checkbox_Unchecked from "../../assets/icons/checkbox_unchecked.svg";
import EmployeeChoiceIcon from "../../assets/icons/award_blue_icon.svg";
import LeadershipChoiceIcon from "../../assets/icons/achivement_green_icon.svg";
import Cross_icon from "../../assets/icons/cross_icon.svg";
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
  getAllCountriesDetails,
} from "../../../../actions/hrRepositoryAction";
import "../styles/EmployeeDetailsPage.scss";
import "../../RewardsRecognition/styles/RewardsTabs.scss";
import { useDispatch } from "react-redux";
import EmployeeRepositoryPopup from "./EmployeeRepositoryPopup";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import ConversionDatePopup from "../../Common/components/ConversionDatePopup";
import CustomDropdown from "../../Common/components/CustomDropdown";
import CurrencyInput from "../../Common/components/CurrencyInput";
import { findMatchingKey, getComponentTypeValue } from "../../Common/utils/helper";
import { getFilteredLevelValues } from "../../Common/utils/payrollLevelUtils";
import { OFFBOARDING_STATUS } from "../../Common/utils/enums";
import Snackbar from "../../Common/components/Snackbar";
import { State } from "country-state-city";

const INDIA_COUNTRY_CODE = "IN";

const BASIC_INFO_ADDITIONAL_FIELDS = [
  {
    name: "secondaryLocation",
    label: "Secondary Working Location",
    type: "india-state-select",
    validationRules: { required: false },
    placeholder: "Select secondary working state",
  },
  {
    name: "isSecondarySameAsPrimary",
    label: "Same as Primary Location",
    type: "manager-toggle",
    validationRules: { required: false },
  },
];

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
  const [errors, setErrors] = useState({});
  const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const currentEmployeeDetailsLoading = hrRepositoryReducer?.currentEmployeeDetailsLoading ?? false;
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
  const indiaStateDropdownOptions = useMemo(() => {
    const states = State.getStatesOfCountry(INDIA_COUNTRY_CODE) || [];

    return states
      .map((state) => ({
        key: state?.isoCode || state?.name,
        value: state?.name,
      }))
      .filter((option) => option.value)
      .sort((a, b) => a.value.localeCompare(b.value));
  }, []);
  const mergedFormSections = useMemo(
    () =>
      formSections.map((section) => {
        if (section.id !== "basic-info") {
          return section;
        }

        const hasSecondaryLocation = section.fields.some(
          (field) => field.name === "secondaryLocation"
        );
        const hasSameAsPrimary = section.fields.some(
          (field) => field.name === "isSecondarySameAsPrimary"
        );

        if (hasSecondaryLocation && hasSameAsPrimary) {
          return section;
        }

        const nextFields = [];
        section.fields.forEach((field) => {
          nextFields.push(field);

          if (field.name === "state") {
            if (!hasSecondaryLocation) {
              nextFields.push(BASIC_INFO_ADDITIONAL_FIELDS[0]);
            }
            if (!hasSameAsPrimary) {
              nextFields.push(BASIC_INFO_ADDITIONAL_FIELDS[1]);
            }
          }
        });

        return {
          ...section,
          fields: nextFields,
        };
      }),
    []
  );
  const effectiveSectionFieldMapping = useMemo(() => {
    const existingBasicInfo = sectionFieldMapping["basic-info"] || [];
    const existingOtherInfo = sectionFieldMapping["other-info"] || [];
    const hasSecondaryLocation = existingBasicInfo.some(
      (field) => field.name === "secondaryLocation"
    );
    const hasSameAsPrimary = existingBasicInfo.some(
      (field) => field.name === "isSecondarySameAsPrimary"
    );

    return {
      ...sectionFieldMapping,
      "basic-info": [
        ...existingBasicInfo,
        ...(hasSecondaryLocation
          ? []
          : [{ name: "secondaryLocation", label: "Secondary Working Location" }]),
        ...(hasSameAsPrimary
          ? []
          : [{ name: "isSecondarySameAsPrimary", label: "Same as Primary Location" }]),
      ],
      "other-info": existingOtherInfo.filter(
        (field) => field.name !== "secondaryLocation" && field.name !== "isSecondarySameAsPrimary"
      ),
    };
  }, []);

  // Latest job details of employee
  // latest job details of employee would include the latest employee job de
  const latestJobDetails = useMemo(
    () => hrRepositoryReducer?.currentEmployeeDetails?.employeeLatestJobDetails ?? {},
    [hrRepositoryReducer?.currentEmployeeDetails?.employeeLatestJobDetails]
  );
  const resolveLocationLabel = useCallback(
    (locationValue) => {
      const normalized = String(locationValue || "").trim();
      if (!normalized) return "";

      const locationMap = getAllComponentType?.location_dropdown || {};
      if (locationMap[normalized]) {
        return locationMap[normalized];
      }

      const matchedEntry = Object.entries(locationMap).find(([, label]) => label === normalized);
      if (matchedEntry) {
        return matchedEntry[1];
      }

      return normalized;
    },
    [getAllComponentType?.location_dropdown]
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
  const [offboardingDetails, setOffboardingDetails] = useState({});
  const [selectedAwardModal, setSelectedAwardModal] = useState(null);
  const lastApiCallRef = useRef(null);
  const hasAccessToEditEmployee = allToolsAccessDetails?.[selectedToolName] >= 900 || 
    myHrmsAccess?.permissions?.some(perm => perm.name === "ActiveEmployee_update");

  // Fetch component types once if not already loaded
  useEffect(() => {
    if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
      dispatch(getAllComponentTypes());
    }
  }, [dispatch, getAllComponentType]);

  // Fetch employee-specific data when employeeUuid changes
  useEffect(() => {
    if (employeeUuid) {
      // Reset stale state from previous employee
      setFormData({});
      setInitialFormData({});
      setOffboardingDetails({});
      setErrors({});

      dispatch(getAllManagers());
      dispatch(getAllCountriesDetails());
      dispatch(getCurrentEmployeeDetails(employeeUuid));
      dispatch(getAllLeaves());
      dispatch(getEmployeeLeaveBalance(employeeUuid));
    }
  }, [employeeUuid, dispatch]);


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

  // --- useEffect to clear and disable emp level when emp type doesn't support it ---
  useEffect(() => {
    if (isEditing && formData?.empType && isLevelDisabled(formData.empType, formData.empDepartment, getAllComponentType)) {
      setFormData(prev => ({
        ...prev,
        empLevel: ""
      }));

      setErrors(prev => ({
        ...prev,
        empLevel: ""
      }));
    }

    // Clear year of study if employee type doesn't support it
    if (isEditing && formData?.empType && !hasYearOfStudy(formData.empType, getAllComponentType) && formData?.empYearOfStudy) {
      setFormData(prev => ({
        ...prev,
        empYearOfStudy: ""
      }));

      setErrors(prev => ({
        ...prev,
        empYearOfStudy: ""
      }));
    }
  }, [formData?.empType, isEditing, formData?.empYearOfStudy, formData?.empDepartment, getAllComponentType]);

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

    const salaryTier = getSalaryParamTier(formData?.empType, getAllComponentType);

    // Check if required fields are present based on salary param tier
    let hasRequiredFields = false;
    
    if (salaryTier === "full") {
      hasRequiredFields = formData?.empType && formData?.state && 
        formData?.empLevel && formData?.empDepartment && formData?.empYearOfStudy;
    } else if (salaryTier === "withLevel") {
      hasRequiredFields = formData?.empType && formData?.state && formData?.empLevel;
    } else {
      hasRequiredFields = formData?.empType && formData?.state;
    }

    // Only make API call if we have all required data
    if (hasRequiredFields && matchedKeys.employeeType && matchedKeys.location) {
      let params;
      
      if (salaryTier === "full" && matchedKeys.level) {
        params = [matchedKeys.employeeType, matchedKeys.location, matchedKeys.level, matchedKeys.department, matchedKeys.yearOfStudy];
      } else if (salaryTier === "withLevel" && matchedKeys.level) {
        params = [matchedKeys.employeeType, matchedKeys.location, matchedKeys.level];
      } else {
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
    getAllComponentType
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
        employeeOffboardingDetails,
      } = currentEmployeeDetails;

      // Store offboarding details separately (read-only, not part of formData)
      setOffboardingDetails(employeeOffboardingDetails || {});

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
      if (initialFormData?.empBloodGroup !== null && initialFormData?.empBloodGroup !== undefined && initialFormData.empBloodGroup.toString() !== "") {
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

      if (initialFormData?.isSecondarySameAsPrimary) {
        initialFormData.secondaryLocation = resolveLocationLabel(
          employeeAddressDetails?.state || initialFormData?.state || ""
        );
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
  }, [
    currentEmployeeDetails,
    getAllComponentType,
    getEmployeeType,
    getEmployeeDepartment,
    getManagerName,
    resolveLocationLabel,
  ]);

  useEffect(() => {
    if (isEditing) {
      const allExpanded = mergedFormSections?.reduce((acc, section) => {
        acc[section.id] = true;
        return acc;
      }, {});
      setExpandedSections(allExpanded);
    }
  }, [isEditing, mergedFormSections]);

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
      if(isAdmin < 900 && !hasAccessToEditEmployee && user?.userType !== 900){
        window.alert("You are not authorized to edit this employee");
        return;
      }
      setSearchParams((prev) => {
        prev.set("isEditing", "true");
        return prev;
      });
    }
  };

  // Compare two values (current vs initial); handles strings, empGovId JSON, and empty equivalence.
  const isValueEqual = useCallback((key, current, initial) => {
    const empty = (v) => v === undefined || v === null || v === "";
    if (empty(current) && empty(initial)) return true;
    if (typeof current === "string" && typeof initial === "string") {
      if (current.trim() === initial.trim()) return true;
      if (key === "empGovId") {
        try {
          const pa = JSON.parse(current);
          const pb = JSON.parse(initial);
          return pa?.govIdType === pb?.govIdType && pa?.govIdNumber === pb?.govIdNumber;
        } catch {
          return current === initial;
        }
      }
    }
    return current === initial;
  }, []);

  // Build payload with only fields whose value actually changed from initial (so we never send unchanged data).
  const getActuallyChangedFormData = useCallback(() => {
    const allKeys = new Set([
      ...Object.keys(formData || {}),
      ...Object.keys(initialFormData || {}),
    ]);
    const changed = {};
    allKeys.forEach((key) => {
      const current = formData?.[key];
      const initial = initialFormData?.[key];
      if (!isValueEqual(key, current, initial)) {
        changed[key] = formData[key];
      }
    });
    return changed;
  }, [formData, initialFormData, isValueEqual]);

  //Validation to ensure that all required fields are filled in before sending changes to the approver.
  //This validation is applied only if the user is not an admin or if the user is
  const validateFormData = () => {
    const newErrors = {};
    mergedFormSections?.forEach((section) => {
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
    // Send only fields that actually changed (value diff), not just "touched" fields.
    const updatedFormData = getActuallyChangedFormData();

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

    // Include payment country code only when user actually edited this field.
    if (Object.prototype.hasOwnProperty.call(updatedFormData, "empPaymentCountryCode")) {
      const normalizedPaymentCountryCode =
        typeof updatedFormData.empPaymentCountryCode === "string"
          ? updatedFormData.empPaymentCountryCode.trim()
          : updatedFormData.empPaymentCountryCode;

      if (
        normalizedPaymentCountryCode &&
        normalizedPaymentCountryCode !== initialFormData?.empPaymentCountryCode
      ) {
        transformedFormData.empPaymentCountryCode = normalizedPaymentCountryCode;
      } else {
        delete transformedFormData.empPaymentCountryCode;
      }
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

    if (Object.prototype.hasOwnProperty.call(updatedFormData, "secondaryLocation")) {
      transformedFormData.secondaryLocation = updatedFormData?.secondaryLocation;
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

    if (
      Object.prototype.hasOwnProperty.call(transformedFormData, "isSecondarySameAsPrimary") &&
      transformedFormData.isSecondarySameAsPrimary
    ) {
      delete transformedFormData.secondaryLocation;
    }

    if (
      typeof transformedFormData.secondaryLocation === "string" &&
      !transformedFormData.isSecondarySameAsPrimary
    ) {
      transformedFormData.secondaryLocation = transformedFormData.secondaryLocation.trim();
    }
  
    if (Object.keys(transformedFormData).length <= 0) {
      setExpandedSections({});
      setMultiFieldStates({});
      setSearchParams((prev) => {
        prev.delete("isEditing");
        return prev;
      });

      return;
    }
  
    const sectionChanged = Object.keys(effectiveSectionFieldMapping).reduce((acc, sectionId) => {
      const changedFieldsInSection = effectiveSectionFieldMapping[sectionId].reduce((fieldsAcc, field) => {
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
      requestedFor: formData?.empUuid || employeeUuid,
      sectionChanged: sectionChanged,
    };

    dispatch(sendChangesToApprover(ApprovalFormData));
    setSearchParams((prev) => {
      prev.delete("isEditing");
      return prev;
    });
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
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "isSecondarySameAsPrimary") {
        updated.secondaryLocation = value ? resolveLocationLabel(prev?.state || "") : "";
      }

      if (name === "state" && prev?.isSecondarySameAsPrimary) {
        updated.secondaryLocation = resolveLocationLabel(value || "");
      }

      if (name === "secondaryLocation" && prev?.isSecondarySameAsPrimary) {
        updated.isSecondarySameAsPrimary = false;
      }

      return updated;
    });

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleMultiFieldChange = (fieldName, type, value) => {
    const hasData = type && value;
    const jsonData = hasData ? JSON.stringify({govIdType: type, govIdNumber: value}) : null;
    
    setFormData(prev => ({...prev, [fieldName]: jsonData}));
    setMultiFieldStates(prev => ({...prev, [fieldName]: {type, value}}));
    
    if (hasData) {
      setErrors(prev => {const newErrors = {...prev}; delete newErrors[fieldName]; return newErrors;});
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
    
    // Check if level field should be disabled based on employee type (dynamic via orgSettingsConfig)
    const isLevelFieldDisabled = field?.name === "empLevel" && 
      formData?.empType && isLevelDisabled(formData.empType, formData.empDepartment, getAllComponentType);

    // Check if year of study field should be hidden based on employee type (dynamic via orgSettingsConfig)
    const isYearOfStudyFieldHidden = field?.name === "empYearOfStudy" && 
      formData?.empType && !hasYearOfStudy(formData.empType, getAllComponentType);

    // Check if level field should be completely hidden
    const isLevelFieldHidden = field?.name === "empLevel" &&
      formData?.empType && !hasLevel(formData.empType, getAllComponentType);

    // If year of study or level field should be hidden, don't render it
    if (isYearOfStudyFieldHidden || isLevelFieldHidden) {
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
          options = getFilteredLevelValues(
            getAllComponentType?.level_dropdown || {},
            formData?.empType
          );
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
              showEmptyStateButton={true}
            />
            {error && <span className="form_error_message">{error}</span>}
          </div>
        );
      } else if (field.type === "india-state-select" || field.type === "india-city-select") {
        return (
          <div>
            <CustomDropdown
              options={indiaStateDropdownOptions}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, sectionId)}
              placeholder={field.placeholder || "Select secondary location state"}
              fieldName={field.name}
              error={!!error}
              disabled={isFieldDisabled || Boolean(formData?.isSecondarySameAsPrimary)}
              searchable={true}
              showEmptyStateButton={true}
            />
            {formData?.isSecondarySameAsPrimary && (
              <span className="field_helper_message">Secondary location will match primary location.</span>
            )}
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
      } else if (field.type === "checkbox" || field.type === "manager-toggle") {
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
        const fieldOptions = field.name === "empGovId" ? getGovIdOptions(getAllComponentType) : (field.options || govIdTypes);
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
                showEmptyStateButton={true}
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
      } else if (field.name === "isSecondarySameAsPrimary") {
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
          const fieldOptions = field.name === "empGovId" ? getGovIdOptions(getAllComponentType) : (field.options || govIdTypes);
          const typeLabel = fieldOptions.find(opt => opt.value === typeValue)?.label || typeValue;
          return <div className="field-value">{typeLabel}: {inputValue}</div>;
        }
        
        return <div className="field-value">-</div>;
      } else if (field.name === "secondaryLocation") {
        const displaySecondaryLocation =
          formData?.isSecondarySameAsPrimary && formData?.state
            ? `${resolveLocationLabel(formData.state)} (Same as Primary)`
            : formData[field.name] || "-";

        return <div className="field-value">{displaySecondaryLocation}</div>;
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

const renderOffboardingField = () => {
  const hasOffboardingData = offboardingDetails && Object.keys(offboardingDetails).length > 0;

  if (!hasOffboardingData) {
    return (
      <div className="offboarding-container">
        <div className="no-offboarding-data">No offboarding details available for this employee.</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="offboarding-container">
        <div className="offboarding-field-item">
          <label className="offboarding-label">HR Clearance</label>
          <div className="offboarding-checkbox-disabled">
            <img
              src={offboardingDetails.hrClearanceStatus ? Checkbox_Checked : Checkbox_Unchecked}
              alt={offboardingDetails.hrClearanceStatus ? "Cleared" : "Pending"}
              className="offboarding-checkbox-icon"
            />
          </div>
        </div>
        <div className="offboarding-field-item">
          <label className="offboarding-label">Finance Clearance</label>
          <div className="offboarding-checkbox-disabled">
            <img
              src={offboardingDetails.financeClearanceStatus ? Checkbox_Checked : Checkbox_Unchecked}
              alt={offboardingDetails.financeClearanceStatus ? "Cleared" : "Pending"}
              className="offboarding-checkbox-icon"
            />
          </div>
        </div>
        <div className="offboarding-field-item">
          <label className="offboarding-label">Last Working Day</label>
          <input
            type="text"
            value={offboardingDetails.lastWorkingDay ? formatDate(offboardingDetails.lastWorkingDay) : "N/A"}
            disabled
            readOnly
            className="offboarding-input"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="offboarding-container">
      <div className="offboarding-field-item">
        <div className="offboarding-label">HR Clearance</div>
        <div className="offboarding-value">
          <img
            src={offboardingDetails.hrClearanceStatus ? Checkbox_Checked : Checkbox_Unchecked}
            alt={offboardingDetails.hrClearanceStatus ? "Cleared" : "Pending"}
            className="offboarding-checkbox-icon"
          />
        </div>
      </div>
      <div className="offboarding-field-item">
        <div className="offboarding-label">Finance Clearance</div>
        <div className="offboarding-value">
          <img
            src={offboardingDetails.financeClearanceStatus ? Checkbox_Checked : Checkbox_Unchecked}
            alt={offboardingDetails.financeClearanceStatus ? "Cleared" : "Pending"}
            className="offboarding-checkbox-icon"
          />
        </div>
      </div>
      <div className="offboarding-field-item">
        <div className="offboarding-label">Last Working Day</div>
        <div className="offboarding-date-value">
          {offboardingDetails.lastWorkingDay ? formatDate(offboardingDetails.lastWorkingDay) : "N/A"}
        </div>
      </div>
    </div>
  );
};

  return (
    <>
      {currentEmployeeDetailsLoading ? (
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
                  <span className="text-btn-primary">Save Changes</span>
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  <span className="text-btn-primary">Cancel</span>
                </button>
              </div>
            ) : (
            <div className="employee-details-action-buttons">
              {currentEmployeeDetails?.employeeOffboardingDetails?.offboardingStatus === OFFBOARDING_STATUS.INITIATED && (
                <button className="offboarding-in-progress-status-button">
                  <span className="text-btn-primary">Offboarding In Progress</span>
                </button>
              )}
              {currentEmployeeDetails?.employeeOffboardingDetails?.offboardingStatus === OFFBOARDING_STATUS.APPROVED && (
                <button className="offboarded-employee-status-button">
                  <span className="text-btn-primary">Offboarded Employee</span>
                </button>
              )}
              {/* Show Edit button if user is editing their own profile OR has admin access OR has permission */}
              {(user?.userType === 900 || (currentEmployeeDetails?.employeeBasicDetails?.isActive &&(user.employeeUuid === currentEmployeeDetails?.employeeBasicDetails?.empUuid || isAdmin >= 900 || hasAccessToEditEmployee))) && (
                <button className="edit-button" onClick={handleEdit}>
                  <img src={Edit_Button} alt="Edit Button" />
                  <span className="text-btn-primary">Edit</span>
                </button>
              )}
            </div>
            )}
          </div>

          <div className="form-sections">
            {mergedFormSections
              .filter((section) => {
                // Hide offboarding section when no offboarding data
                if (section.id === "offboarding-details") {
                  if (!offboardingDetails || Object.keys(offboardingDetails).length === 0) return false;
                }
                return true;
              })
              .map((section) => (
              <div key={section.id} className="form-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <p className="text-tab-common">{section.title}</p>
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
                            : section.id === "offboarding-details"
                            ? "offboarding-details-grid"
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
                          if (section.id === "offboarding-details") {
                            return renderOffboardingField();
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
                              if (isEditing && (field.name === "isManager" || field.name === "isSecondarySameAsPrimary")) {
                                return false;
                              }
                              // Hide year of study field if employee type doesn't support it (dynamic via orgSettingsConfig)
                              if (field.name === "empYearOfStudy" && 
                                  formData?.empType && 
                                  !hasYearOfStudy(formData.empType, getAllComponentType)) {
                                return false;
                              }
                              // Hide level field completely if the employee type doesn't support it
                              const isHideLevel = formData?.empType && !hasLevel(formData.empType, getAllComponentType);
                              console.log("Checking empLevel hide:", formData?.empType, isHideLevel, getAllComponentType?.employee_type_mapping);
                              if (field.name === "empLevel" && isHideLevel) {
                                return false;
                              }
                              return true;
                            })
                            .map((field, fieldIndex) => {
                              const isReportingManagerField = isEditing && field.name === "empManager";
                              const isSecondaryLocationField = isEditing && field.name === "secondaryLocation";
                              const inlineToggleFieldName = isReportingManagerField
                                ? "isManager"
                                : isSecondaryLocationField
                                ? "isSecondarySameAsPrimary"
                                : null;
                              const inlineToggleLabel = isReportingManagerField
                                ? "Is Manager"
                                : isSecondaryLocationField
                                ? "Same as Primary"
                                : "";

                              const inlineToggleFieldConfig = inlineToggleFieldName
                                ? section.fields.find((sectionField) => sectionField.name === inlineToggleFieldName)
                                : null;
                              const isInlineToggleDisabled =
                                (section.id === "leaves-info" || inlineToggleFieldName === "empLastLogin")
                                  ? Boolean(inlineToggleFieldConfig?.disabled)
                                  : Boolean(
                                      (isAdmin < 900 && !hasAccessToEditEmployee) &&
                                        inlineToggleFieldConfig?.disabled
                                    );

                              return (
                                <div
                                  key={field.name || `field-${fieldIndex}`}
                                  className="field"
                                >
                                  <label className={inlineToggleFieldName ? "field_label_with_toggle" : ""}>
                                    <span>{field?.validationRules?.required ? `${field.label} *` : field.label}</span>
                                    {inlineToggleFieldName && (
                                      <span className="inline_checkbox_control">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(formData?.[inlineToggleFieldName])}
                                          onChange={(event) =>
                                            handleInputChange(
                                              inlineToggleFieldName,
                                              event.target.checked,
                                              section.id
                                            )
                                          }
                                          disabled={isInlineToggleDisabled}
                                        />
                                        <span>{inlineToggleLabel}</span>
                                      </span>
                                    )}
                                  </label>
                                  {renderField(field, section.id)}
                                </div>
                              );
                            });
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

            {/* Rewards & Recognition Section */}
            {currentEmployeeDetails?.employeeAwards?.length > 0 && (
              <div className="form-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection("rewards-recognition")}
                >
                  <p className="text-tab-common">Rewards & Recognition</p>
                  <span
                    className={`arrow ${
                      expandedSections["rewards-recognition"] ? "expanded" : ""
                    }`}
                  >
                    <img src={Dropdown_Arrow} alt="Dropdown Arrow" />
                  </span>
                </div>

                {expandedSections["rewards-recognition"] && (
                  <>
                    <div className="hr_line">
                      <hr />
                    </div>
                    <div className="section-content">
                      <div className="rt_cards_grid">
                        {currentEmployeeDetails.employeeAwards.map((award) => {
                          const isEmp = award.awardType === "employee_choice";
                          const month = award.cycle?.month;
                          const year = award.cycle?.year;
                          const monthYear = month && year
                            ? new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                            : "";
                          return (
                            <div
                              key={award.id}
                              className={`rt_award_card rt_award_card--${isEmp ? "employee" : "leadership"}`}
                              onClick={() => setSelectedAwardModal({ ...award, monthYear })}
                            >
                              <div className={`rt_award_icon_wrap rt_award_icon_wrap--${isEmp ? "employee" : "leadership"}`}>
                                <img src={isEmp ? EmployeeChoiceIcon : LeadershipChoiceIcon} alt="" />
                              </div>
                              <div className="rt_award_info">
                                <span className="rt_award_title">
                                  {isEmp ? "Employee's Choice Winner" : "Leadership Choice Winner"}
                                </span>
                                <span className="rt_award_month">{monthYear}</span>
                              </div>
                              <button
                                type="button"
                                className="rt_view_link"
                                onClick={(e) => { e.stopPropagation(); setSelectedAwardModal({ ...award, monthYear }); }}
                              >
                                View
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
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
      
      {/* Award Detail Modal - matches RewardsTabs SingleWinnerModal design (icon + title + date + quote) */}
      {selectedAwardModal && (() => {
        const isEmp = selectedAwardModal.awardType === "employee_choice";
        const monthYear = selectedAwardModal.monthYear || "";
        const citationText = (selectedAwardModal.finalCitation || "").trim();

        return (
          <div className="rt_citation_overlay" onClick={() => setSelectedAwardModal(null)}>
            <div className={`rt_single_winner_card rt_single_winner_card--award rt_single_winner_card--${isEmp ? "employee" : "leadership"}`} onClick={(e) => e.stopPropagation()}>
              <button type="button" className="rt_single_winner_close_btn" onClick={() => setSelectedAwardModal(null)}>
                <img src={Cross_icon} alt="close" />
              </button>
              <div className="rt_single_winner_card_header">
                <span className="rt_single_winner_card_header_icon">
                  <img src={isEmp ? EmployeeChoiceIcon : LeadershipChoiceIcon} alt="" />
                </span>
                <div className="rt_single_winner_card_header_text_block">
                  <span className="rt_single_winner_card_header_text">
                    {isEmp ? "Employee's Choice Winner" : "Leadership Choice Winner"}
                  </span>
                  {monthYear && <span className="rt_single_winner_card_header_date">{monthYear}</span>}
                </div>
              </div>
              <div className="rt_single_winner_card_body">
                {citationText ? (
                  <div className="rt_single_winner_card_citation_box">
                    <p className="rt_single_winner_card_citation_text">&ldquo;{citationText}&rdquo;</p>
                  </div>
                ) : (
                  <div className="rt_single_winner_card_citation_box">
                    <p className="rt_single_winner_card_citation_empty">No citation available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      
      <Snackbar/>
    </>
  );
};

export default EmployeeDetailsPage;
