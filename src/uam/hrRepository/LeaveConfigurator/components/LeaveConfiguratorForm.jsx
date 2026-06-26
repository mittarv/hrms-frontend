import "../styles/LeaveConfiguratorForm.scss";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import {
  getLeaveDetails,
  updateLeaveDetails,
  createLeave,
  getAllComponentTypes,
} from "../../../../actions/hrRepositoryAction";
import { useSelector, useDispatch } from "react-redux";
import { LeaveConfiguratorFormData } from "../utils/LeaveConfiguratorData";
import Pill from "./Pill";

import Edit_Button from "../../assets/icons/edit_button.svg";
import { MandatoryFieldPopup, LeaveDiscardPopup,  } from "./LeaveConfiguratorPopup";
import LeaveApplicable from "./LeaveApplicable";
import Info_icon from "../../assets/icons/info_icon.svg";
import Tooltip from "./Tooltip";
import Back_icon from "../../assets/icons/leftEmployeeArrow.svg";
import LoadingSpinner from "../../Common/components/LoadingSpinner";


const LeaveConfiguratorForm = () => {
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const {
    loading,
    getAllComponentType,
    currentLeaveDetails,
    allExisitingLeaves,
    unpaidLeaveDisabled,
    myHrmsAccess,
  } = useSelector((state) => state.hrRepositoryReducer);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const leaveConfigId = searchParams.get("leaveConfigId");
  const isEditMode = searchParams.get("edit") === "true";
  const isViewMode = searchParams.get("view") === "true";
  const isCreateMode = searchParams.get("create") === "true";
  const LeaveType = searchParams.getAll("leaveType");
  const [isLeaveApplicable, setIsLeaveApplicable] = useState(false);
  const [leaveApplicable, setLeaveApplicable] = useState({});
  const [formData, setFormData] = useState({});
  const [showMandatoryFieldPopup, setShowMandatoryFieldPopup] = useState(false);
  const isDiscardChanges = searchParams.get("discard_changes") === "true";
  const [isCompOff, setIsCompOff] = useState(false);
  
  const [compOffLeaveName, setCompOffLeaveName] = useState("");


 const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' or 'alert'
    heading: '',
    message: '',
    onConfirm: null,
    confirmText: 'Yes, Continue',
    cancelText: 'Cancel'
  });

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canCreate = hasPermission("LeaveConfigurator_Create");
  const canUpdate = hasPermission("LeaveConfigurator_update");
  const canRead = hasPermission("LeaveConfigurator_Read");

  useEffect(() => {
    if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
      dispatch(getAllComponentTypes());
    }

    // Check read permission before fetching leave details
    if (leaveConfigId && (isViewMode || isEditMode)) {
      if (isViewMode && !canRead) {
        alert("You don't have permission to view leave configuration");
        setSearchParams({});
        return;
      }
      if (isEditMode && !canUpdate) {
        alert("You don't have permission to edit leave configuration");
        setSearchParams({});
        return;
      }
      dispatch(getLeaveDetails(leaveConfigId));
    }
  }, [dispatch, leaveConfigId, isViewMode, isEditMode, getAllComponentType, canRead, canUpdate, setSearchParams]);

  // Pre-fill form data in view and edit mode
  useEffect(() => {
    if ((isViewMode || isEditMode) && currentLeaveDetails) {

      const employeeType = 
        currentLeaveDetails.employeeType ? 
        JSON.parse(currentLeaveDetails.employeeType) : [];
      
      const appliedGender = 
        currentLeaveDetails.appliedGender ? 
        JSON.parse(currentLeaveDetails.appliedGender) : [];
      
      // Map the keys to display values if needed
      const mappedEmployeeType = employeeType.map(key => {
        if (getAllComponentType?.emp_type_dropdown) {
          const found = Object.entries(getAllComponentType.emp_type_dropdown)
            .find(([k]) => k === key);
          return found ? found[1] : key;
        }
        return key;
      });

      const mappedGender = appliedGender.map(key => {
        if (getAllComponentType?.gender_type_dropdown) {
          const found = Object.entries(getAllComponentType.gender_type_dropdown)
            .find(([k]) => k === key);
          return found ? found[1] : key;
        }
        return key;
      });

      let mappedAccuralFrequency = currentLeaveDetails.accuralFrequency;

      let mappedStatus = currentLeaveDetails.isActive ? "Active" : "Inactive";

      const excludePaidWeekend = currentLeaveDetails.excludePaidWeekend === false ? false : true;
      setFormData({
        ...currentLeaveDetails,
        employeeType: mappedEmployeeType,
        appliedGender: mappedGender,
        accuralFrequency: mappedAccuralFrequency,
        isActive: mappedStatus,
        isProofRequired: currentLeaveDetails.isProofRequired || false,
        isReasonRequired: currentLeaveDetails.isReasonRequired || false,
        isHalfDayAllowed: currentLeaveDetails.isHalfDayAllowed || false,
        excludePaidWeekend: excludePaidWeekend, 

      });

      setLeaveApplicable(currentLeaveDetails.leaveApplicableTo || {});

      setIsCompOff(
      currentLeaveDetails.leaveExpiresAfter !== null &&
      currentLeaveDetails.leaveExpiresAfter !== undefined
      );
    }
  }, [currentLeaveDetails, isViewMode, isEditMode, getAllComponentType]);


  useEffect(() => {
    if (isCreateMode && !canCreate) {
      alert("You don't have permission to create leave configuration");
      setSearchParams({});
      return;
    }
    
    if (isCreateMode && LeaveType.length > 0 && formData.leaveType !== LeaveType[0]) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        leaveType: LeaveType[0],
        isProofRequired: false,
        isReasonRequired: false,
        isHalfDayAllowed: false,
        excludePaidWeekend: true, // Default: exclude weekends (not included)
      }));
    }
  }, [isCreateMode, LeaveType, formData.leaveType, canCreate, setSearchParams]);

  useEffect(() => {
    if (isEditMode && currentLeaveDetails && currentLeaveDetails.leaveApplicableTo) {
      setIsLeaveApplicable(true);
    }
  }, [isEditMode, currentLeaveDetails]);
  

useEffect(() => {
  if (isCompOff) {
    setFormData((prev) => {
      const freq = parseInt(prev.accuralFrequency, 10);

      let accuralRate = null;
      if (freq > 0) {
        const totalPeriodsInYear = 12 / freq;
        accuralRate = 0 / totalPeriodsInYear; // will be 0
      }

      return {
        ...prev,
        totalAllotedLeaves: 0,
        accuralRate: accuralRate,
      };
    });
  }
}, [isCompOff]);



  // Validate mandatory fields
  const validateMandatoryFields = () => {
    const mandatoryFields = [
      "totalAllotedLeaves", 
      "employeeType", 
      "isActive", 
      "leaveType", 
      "accuralFrequency",
      "appliedGender",
      "maximumNoticePeriod",
      "minimumNoticePeriod",
      "continuousLeavesLimit",
    ];
  if (isCompOff) {
    mandatoryFields.push("leaveExpiresAfter");
  }
    for (const field of mandatoryFields) {
      if (
        formData[field] === undefined || 
        formData[field] === null || 
        formData[field] === "" || 
        (Array.isArray(formData[field]) && formData[field].length === 0)
      ) {
        return false;
      }
    }
    return true;
  };

  const validateLeaveApplicable = () => {
    const keys = Object.keys(leaveApplicable);

    for (const key of keys) {
        const { value, unit } = leaveApplicable[key];
        if (value === undefined || value === null || value === '' || unit === undefined || unit === null || unit === '') {
            return false;
        }
    }

    return true;
};
  
 
// const existingCompOffLeave = allExisitingLeaves?.find(
//   (leave) =>
//     leave.leaveExpiresAfter !== null &&
//     leave.leaveExpiresAfter !== undefined &&
//     leave.leaveConfigId !== leaveConfigId // avoid self-match in edit
// );
const currentLeaveConfigId =
  leaveConfigId !== null && leaveConfigId !== undefined
    ? Number(leaveConfigId)
    : null;

const existingCompOffLeave = allExisitingLeaves?.find((leave) => {
  const isCompOff =
    leave.leaveExpiresAfter !== null && leave.leaveExpiresAfter !== undefined;
  if (!isCompOff) return false;
  if (currentLeaveConfigId === null) return true;
  return Number(leave.leaveConfigId) !== currentLeaveConfigId;
});

const handleSaveSuccess = () => {
  setSearchParams({});
  setFormData({});
  setModalState(prev => ({ ...prev, isOpen: false }));
};
const executeSave = async (data) => {
  try {
    if (isCreateMode) {
      await dispatch(createLeave(data));
    } else if (isEditMode) {
      await dispatch(updateLeaveDetails(data));
    }
    handleSaveSuccess();
  } catch (error) {
    console.error("Save failed, keeping form data:", error);
  }
};
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Check permissions before submitting
    if (isCreateMode && !canCreate) {
      alert("You don't have permission to create leave configuration");
      return;
    }
    if (isEditMode && !canUpdate) {
      alert("You don't have permission to update leave configuration");
      return;
    }
    
    if (!validateMandatoryFields()) {
      setShowMandatoryFieldPopup(true);
      return;
    }

    if (isLeaveApplicable && !validateLeaveApplicable()) {
      setShowMandatoryFieldPopup(true);
      return;
    }
    

    const parsedLeaveExpiresAfter = Number(formData.leaveExpiresAfter);
     if (
      isCompOff &&
      (!Number.isInteger(parsedLeaveExpiresAfter) || parsedLeaveExpiresAfter <= 0)
    ) {
      setShowMandatoryFieldPopup(true);
      return;
    }
    const transformedData = {
      ...formData,
      leaveExpiresAfter:
    // isCompOff && formData.leaveExpiresAfter !== undefined && formData.leaveExpiresAfter !== ""
    //   ? parseInt(formData.leaveExpiresAfter, 10)
    //   : null,
    isCompOff ? parsedLeaveExpiresAfter : null,
    };
    
    if (leaveConfigId) {
      transformedData.leaveConfigId = leaveConfigId;
    }
    
    if (Array.isArray(formData.employeeType)) {
      const employeeTypeKeys = formData.employeeType.map(type => {
        if (getAllComponentType?.emp_type_dropdown) {
          const found = Object.entries(getAllComponentType.emp_type_dropdown)
            .find(([, v]) => v === type);
          return found ? found[0] : type;
        }
        return type;
      });
      transformedData.employeeType = JSON.stringify(employeeTypeKeys);
    }

    if (Array.isArray(formData.appliedGender)) {
      const genderKeys = formData.appliedGender.map(gender => {
        if (getAllComponentType?.gender_type_dropdown) {
          const found = Object.entries(getAllComponentType.gender_type_dropdown)
            .find(([, v]) => v === gender);
          return found ? found[0] : gender;
        }
        return gender;
      });
      transformedData.appliedGender = JSON.stringify(genderKeys);
    }
    
    
    transformedData.isActive = formData.isActive === "Active";
    
    // Ensure excludePaidWeekend is explicitly set in transformed data
    transformedData.excludePaidWeekend = formData.excludePaidWeekend === false ? false : true;
    
    delete transformedData.additionalInformation;

   

    const numericFields = [
      "totalAllotedLeaves", 
      "accuralRate", 
      "minimumNoticePeriod", 
      "maximumNoticePeriod", 
      "continuousLeavesLimit",
      
    ];
    
    numericFields.forEach(field => {
      const value = transformedData[field];

  // Only convert if the value is a non-empty string or a number
  // This avoids converting null, undefined, or "" into NaN
  if (value !== undefined && value !== null && value !== "") {
    transformedData[field] = parseFloat(value);
  } else {
    // Explicitly set to null if it's empty, so the backend/DB is happy
    transformedData[field] = null;
  }
    });

    transformedData.leaveApplicableTo = isLeaveApplicable ? leaveApplicable : null;    

    if (isCompOff && existingCompOffLeave) {
      setCompOffLeaveName(existingCompOffLeave.leaveType);
      setModalState({
      isOpen: true,
      type: 'confirm',
      heading: 'Confirm Comp-Off Change',
      message: `This will replace ${existingCompOffLeave.leaveType} Comp-Off. Do you want to continue?`,
      confirmText: 'Yes, Continue',
      cancelText: 'Cancel',
      onConfirm: () => executeSave(transformedData) // Call the save here!
    });
  }
    else{
    
      await executeSave(transformedData);
    }
    
  };
    
  
  

  const handleCancel = () => {
    const currentParams = Object.fromEntries(searchParams.entries()); 
    setSearchParams({
      ...currentParams, 
      discard_changes: "true", 
    });
  };

  const handleEdit = () => {
    if (!canUpdate) {
      alert("You don't have permission to edit leave configuration");
      return;
    }
    setSearchParams({
      showLeaveConfiguratorForm: "true",
      edit: "true",
      leaveConfigId: currentLeaveDetails.leaveConfigId,
    });
  };

  const handleInputChange = (name, value) => {
    if (name === "leaveType" && isEditMode) {
      const selectedLeave = allExisitingLeaves.find(leave => leave.leaveType === value);    
      if (selectedLeave) {
        setSearchParams({
          showLeaveConfiguratorForm: "true",
          edit: "true",
          leaveConfigId: selectedLeave.leaveConfigId,
        });
        dispatch(getLeaveDetails(selectedLeave.leaveConfigId));
        return; 
      }
    }
    
    const newFormData = {
      ...formData,
      [name]: value,
    };
  
    if (name === "totalAllotedLeaves" || name === "accuralFrequency") {
      const totalLeaves =
        name === "totalAllotedLeaves" ? value : formData.totalAllotedLeaves;
      const accrualFrequency =
        name === "accuralFrequency" ? value : formData.accuralFrequency;

      const freq = parseInt(accrualFrequency, 10);
      const leaves = parseFloat(totalLeaves);
      

     if (freq > 0 && leaves >= 0) {
      const rate = leaves / (12 / freq);
      newFormData.accuralRate = parseFloat(rate.toFixed(2));
    } else {
      newFormData.accuralRate = null;
    }

    }
    
    if (name === "additionalInformation") {
      newFormData.isProofRequired = value.includes("Proof");
      newFormData.isReasonRequired = value.includes("Reason");
      newFormData.isHalfDayAllowed = value.includes("Half Day");
      // Explicitly set excludePaidWeekend based on "Include Weekends" presence
      newFormData.excludePaidWeekend = !value.includes("Include Weekends");
    }
  
    setFormData(newFormData);
  };

  const getAdditionalInformationSelected = () => {
    const selected = [];
    if (formData.isProofRequired) selected.push("Proof");
    if (formData.isReasonRequired) selected.push("Reason");
    if (formData.isHalfDayAllowed) selected.push("Half Day");
    // Only add "Include Weekends" if excludePaidWeekend is explicitly false
    if (formData.excludePaidWeekend === false) selected.push("Include Weekends");
    return selected;
  };

  const handleBackButton = () => {
    setSearchParams(""); 
  };
  const isMandatoryField = (fieldName) => {
     const baseMandatoryFields = [ 
      "totalAllotedLeaves", 
      "employeeType", 
      "isActive", 
      "leaveType", 
      "accuralFrequency",
      "appliedGender",
      "maximumNoticePeriod",
      "minimumNoticePeriod",
      "continuousLeavesLimit",
     
    ]
     if (isCompOff && fieldName === "leaveExpiresAfter") {
    return true;
  }
  return baseMandatoryFields.includes(fieldName);
  };

  const renderField = (field) => {
    const disabled = isViewMode || (isCreateMode && field.name === "leaveType" && LeaveType.length > 0);
    const isLeaveTypeField = field.name === "leaveType";
    const existingLeaves = allExisitingLeaves.map((leave) => leave.leaveType);
    const isMandatory = isMandatoryField(field.name);
    const requiresSelection = isLeaveTypeField || field.name === "isActive" || field.name === "accuralFrequency";

    switch (field.inputType?.toLowerCase()) {
      case "select_option": {
        let options = [];
        let displayOptions = [];
  
        if (getAllComponentType) {
          if (
            field.name === "employeeType" &&
            getAllComponentType.emp_type_dropdown
          ) {
            options = Object.values(getAllComponentType.emp_type_dropdown);
          } else if (
            field.name === "appliedGender" &&
            getAllComponentType.gender_type_dropdown
          ) {
            options = Object.values(getAllComponentType.gender_type_dropdown);
          } else if (field.name === "leaveType") {
            options = allExisitingLeaves?.map((leave) => leave.leaveType) || [];
          } else if (field.name === "isActive" && getAllComponentType.status) {
            options = Object.values(getAllComponentType.status);
          } else if (field.name === "additionalInformation") {
            options = field.options.map((option) => option.label);
          } else {
            options = field.options || [];
          }
        }
        
        if (field.name === "leaveType" && isEditMode) {
          return (
            <div className={`leave_configurator_form_field_container`}>
              <p className="leave_configurator_form_field_label text-time-label">
                {field.label} {isMandatory && <span className="mandatory-marker">*</span>}
              </p>
              <Pill
                data={existingLeaves}
                multiSelect={false}
                onChange={(selected) => handleInputChange(field.name, selected)}
                selected={formData.leaveType}
                disabled={false}
                requireSelection={true} 
              />
            </div>
          );
        }
        if (isViewMode) {
          if (field.multiSelect) {
            if (field.name === "additionalInformation") {
              displayOptions = getAdditionalInformationSelected();
            } else if (Array.isArray(formData[field.name])) {
              displayOptions = formData[field.name];
            } else {
              displayOptions = [];
            }
          } else {
            displayOptions = formData[field.name] ? [formData[field.name]] : [];
          }
        } else {
          displayOptions = options;
        }
  
        return (
          <div className={`leave_configurator_form_field_container`}>
            <div className="leave_configurator_form_field_label text-time-label">
              {field.label} {isMandatory && <span className="mandatory-marker">*</span>} {field.subLabel && <span className="sub_label">{field.subLabel}</span>} 
              {field.Description && (      
                  <span className="description_marker">
                    <Tooltip content={field.Description}>
                      <img src={Info_icon} alt="Info" className="info_icon" />
                    </Tooltip>
                  </span>           
              )}
            </div>
            {isCreateMode && isLeaveTypeField ? (
              <div className="leave_configurator_pill_container">
                <Pill
                  data={existingLeaves}
                  multiSelect={field.multiSelect}
                  onChange={(selected) => handleInputChange(field.name, selected)}
                  selected={formData.leaveType || LeaveType[0]}
                  disabled={true}
                  requireSelection={true}
                />
                <Pill
                  data={LeaveType}
                  multiSelect={field.multiSelect}
                  onChange={(selected) => handleInputChange(field.name, selected)}
                  selected={formData.leaveType || LeaveType[0]}
                  disabled={false}
                  requireSelection={true}
                />
              </div>
            ) : field.name === "additionalInformation" ? (
              <Pill
                data={isViewMode ? getAdditionalInformationSelected() : options}
                multiSelect={field.multiSelect}
                onChange={(selected) => handleInputChange(field.name, selected)}
                selected={getAdditionalInformationSelected()}
                disabled={disabled}
                requireSelection={false}
              />
            ) : (
              <Pill
                data={displayOptions}
                multiSelect={field.multiSelect}
                onChange={(selected) => handleInputChange(field.name, selected)}
                selected={formData[field.name]}
                disabled={disabled}
                requireSelection={requiresSelection || isMandatory}   
              />
            )}
          </div>
        );
      }
      case "textfield": 
        return (
          <div className={`leave_configurator_form_field_container`}>
            <div className="leave_configurator_form_field_label text-time-label">
              {field.label} {isMandatory && <span className="mandatory-marker">*</span>} {field.subLabel && <span className="sub_label">{field.subLabel}</span>} 
              {field.Description && (      
                  <span className="description_marker">
                    <Tooltip content={field.Description}>
                      <img src={Info_icon} alt="Info" className="info_icon" />
                    </Tooltip>
                  </span>           
              )}
            </div>
            {field.name === "accuralRate" ? (
              <input
                type="text"
                className="leave_configurator_form_field_input text-input-field disabled"
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] ?? ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                disabled = {false}
              />
            ) : field.name === "totalAllotedLeaves" && (unpaidLeaveDisabled || isCompOff) ? ( <input
                type="text"
                className={`leave_configurator_form_field_input text-input-field ${(unpaidLeaveDisabled || isCompOff) ? "disabled" : ""}`}
                name={field.name}
                placeholder={field.placeholder}
                value={ formData[field.name] ?? "" }
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                disabled={ unpaidLeaveDisabled || isCompOff}
              />):(
             
             
              <input
                type="text"
                className={`leave_configurator_form_field_input text-input-field ${disabled ? "disabled" : ""}`}
                name={field.name}
                placeholder={field.placeholder}
                value={ formData[field.name] ?? "" }
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                disabled={disabled || field.isDisabled}
              />

            )}
          </div>
        );
      case "checkbox":
        return (
          <div className={`leave_configurator_form_field_container`}>
            <div className="leave_configurator_form_field_label text-time-label">
              {field.label} {isMandatory && <span className="mandatory-marker">*</span>} 
              {field.Description && (      
                  <span className="description_marker">
                    <Tooltip content={field.Description}>
                      <img src={Info_icon} alt="Info" className="info_icon" />
                    </Tooltip>
                  </span>           
              )}
            </div>
            <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              disabled={disabled}
              className={`${isViewMode ? "disabled" : ""}`}
            />
          </div>
        );
      case "dropdown":
        return (
          <div className={`leave_configurator_form_field_container`}>
            <div className="leave_configurator_form_field_label text-time-label">
              {field.label} {isMandatory && <span className="mandatory-marker">*</span>} {field.subLabel && <span className="sub_label">{field.subLabel}</span>} 
              {field.Description && (
                  <span className="description_marker">
                    <Tooltip content={field.Description}>
                      <img src={Info_icon} alt="Info" className="info_icon" />
                    </Tooltip>
                  </span>
              )}
            </div>
            <select 
              name={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              disabled={disabled}
              className={`text-input-field ${isViewMode ? "disabled" : ""}`}
            >
              {field.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
    {loading ?(
       <LoadingSpinner message="Loading Leave Configurator Form..." height="40vh" />
      ) : 
      <div className="leave_configurator_main_container">    
      {!isViewMode ? (
        <div className="leave_configurator_action_buttons create_edit_mode">
          {((isCreateMode && canCreate) || (isEditMode && canUpdate)) && (
            <button
              className="leave_configurator_save_button text-btn-primary"
              onClick={handleSubmit}
            >
              {isCreateMode ? "Create" : "Save"}
            </button>
          )}
          <button
            className="leave_configurator_cancel_button text-btn-primary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="leave_configurator_action_buttons view_mode" >
          <button className="leave_configurator_back_button" onClick={handleBackButton}>
            <img src={Back_icon} alt="Back_Button" />
          </button>
          {canUpdate && <button className="edit-button " onClick={handleEdit}>
            <img src={Edit_Button} alt="Edit_Button" />
            <span className="text-btn-primary">Edit</span>
          </button>}
        </div>
      )}
      <hr className="leave_configurator_hr" />
      <div className="leave_configurator_form_container">
        <form onSubmit={handleSubmit} className="leave_configurator_form">
          <div className="leave_configurator_form_inner_container">
            {LeaveConfiguratorFormData.slice(0, 1).map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
                      <div className="leave_configurator_form_field_container">
            <label className="leave_configurator_form_comp_off_field_label text-time-label">
              <input
                type="checkbox"
                checked={isCompOff}
                onChange={(e) => setIsCompOff(e.target.checked)}
                disabled={isViewMode}
                
              />
               <span className={isCompOff ? "comp-off" : ""}>Is Compensatory Off</span>
               <Tooltip content={"When enabled, this leave is treated as a compensatory off. You can set when it expires. The initial balance is 0, and only one such leave can exist."}>
                  <img src={Info_icon} alt="Info"/>
                </Tooltip>
            </label>

            {isCompOff && (<>
               {LeaveConfiguratorFormData.slice(1, 2).map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
            </>)
            }
            {LeaveConfiguratorFormData.slice(2, 4).map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
          </div>

          
          <div className="leave_configurator_form_inner_container">
            {LeaveConfiguratorFormData.slice(4, 8).map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
          <div className="leave_configurator_form_inner_container">
            {LeaveConfiguratorFormData.slice(8).map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
        </form>
      </div>

      <div className="Leave_applicable_main_container"> 
          <div className="leave_applicable_title_container">
            {isViewMode ? null : (
              <input
              type="checkbox"
              className="leave_applicable_checkbox"
              onChange={(e) => setIsLeaveApplicable(e.target.checked)}
              checked={isLeaveApplicable}
              />
            )}
            <label className="text-time-label">{`Leave Applicable${isLeaveApplicable ? "*" : ""} (In Days/ Weeks/ Months)`}</label>
            <Tooltip content={"Leave Applicable is the number of days, weeks, or months that the leave type is applicable to the selected employee types."}>
                <img src={Info_icon} alt="Info" className="info_icon" />
            </Tooltip>
          </div>
          {(isLeaveApplicable || (isViewMode && Object.keys(leaveApplicable).length > 0)) && (
            <LeaveApplicable
              data={FormData && formData?.employeeType}
              formData={leaveApplicable}
              setFormData={setLeaveApplicable}
              viewMode={isViewMode}
              isLeaveApplicable={isLeaveApplicable}
            />
          )}
      </div>    
      {showMandatoryFieldPopup && (
        <MandatoryFieldPopup closePopup={setShowMandatoryFieldPopup} />
      )}
      {isDiscardChanges && (
        <LeaveDiscardPopup searchParams={searchParams}setSearchParams={setSearchParams} setFormData={setFormData} />
      )}
      
     {modalState.isOpen && (
        <ConfirmationPopup
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
        heading={modalState.heading}
        message={(<span>
            This will replace <b style={{ color: '#045071' }}>{compOffLeaveName}</b> Comp-Off. Do you want to continue?
          </span>
        )}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
      )}
      </div>
    }
    </>   
  );
};

export default LeaveConfiguratorForm;