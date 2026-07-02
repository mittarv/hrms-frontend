import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import "../styles/LeaveApplication.scss";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import { createAttendanceLog, getLeaveBalanceWithAccrual, getCompOffLeaveEligibility, registerCompOffLeave } from "../../../../actions/hrRepositoryAction";
import Image_icon from "../../assets/icons/image_icon.svg";
import PDF_icon from "../../assets/icons/pdf_icon.svg";
import Delete_icon from "../../assets/icons/delete_icon.svg";
import { Link } from "react-router-dom";
import {
  convertFileToBase64,
  getFileDisplayName,
  getFileDisplaySize,
  getFileDisplayType,
  isFilePDF,
  processProofFiles
} from "../../Common/utils/helper";
import {
  validateBulkLeave,
  getApplicableLeaves,
  isHalfDayAllowed as checkHalfDayAllowed,
  isReasonRequired as checkReasonRequired
} from "../utils/LeaveManagementUtils";
import { checkCdlLimit } from "../../../../actions/hrRepositoryAction";
import { ATTENDANCE_STATUS, PROOF_UPLOAD } from "../../Common/utils/enums";
import FileViewer from "../../Common/components/FileViewerPop";
import LoadingSpinner from "../../Common/components/LoadingSpinner";


const LeaveApplication = ({ isOpen, onClose }) => {
  const { loading, allExisitingLeaves, currentEmployeeDetails, setAttendanceYear, setAttendanceMonth, cdlData, cdlLoading, accrualLeaveBalance, compOffleaveBalance, compOffLeaveEligibility, compOffLeaveEligibilityLoading, myHrmsAccess } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  // Access control checks (matching EditAttendanceModal RBAC model)
  const isSuperAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
  const hasAccessToLeaveApplication = myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveApplication_write");
  const hasAccessToEditAttendance = isSuperAdmin || myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveAttendance_write");
  const hasAdminAccess = hasAccessToLeaveApplication || hasAccessToEditAttendance;

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    isHalfDay: false,
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [validationMessages, setValidationMessages] = useState({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [filesToView, setFilesToView] = useState([]);

  // Call CDL check when form data changes and user selects dates
  useEffect(() => {
    if (formData.startDate && currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid) {
      const empUuid = currentEmployeeDetails?.employeeCurrentJobDetails.empUuid;
      dispatch(checkCdlLimit(empUuid, formData.startDate));
      dispatch(getLeaveBalanceWithAccrual(empUuid, formData.startDate));
    }
  }, [dispatch, formData.startDate, currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid]);

  // Helper function to check if a date is a weekend
  const isWeekend = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Check weekend validation when date or leave type changes
  useEffect(() => {
    if (formData.leaveType && formData.startDate) {
      const selectedLeave = allExisitingLeaves.find(leave => leave.leaveType === formData.leaveType);
      if (selectedLeave) {
        const excludePaidWeekend = selectedLeave.excludePaidWeekend;
        if (excludePaidWeekend === true) {
          // Check start date
          if (isWeekend(formData.startDate)) {
            setValidationMessages(prev => ({
              ...prev,
              weekendError: "You cannot apply this leave on weekends (Saturday or Sunday)"
            }));
          } else {
            // Check end date if different from start date
            if (formData.endDate && formData.endDate !== formData.startDate && isWeekend(formData.endDate)) {
              setValidationMessages(prev => ({
                ...prev,
                weekendError: "You cannot apply this leave on weekends (Saturday or Sunday)"
              }));
            } else {
              setValidationMessages(prev => {
                const { weekendError, ...rest } = prev;
                return rest;
              });
            }
          }
        } else {
          // Clear weekend error if excludePaidWeekend is false
          setValidationMessages(prev => {
            const { weekendError, ...rest } = prev;
            return rest;
          });
        }
      }
    }
  }, [formData.leaveType, formData.startDate, formData.endDate, allExisitingLeaves]);

  // Fetch comp off eligibility when comp off is selected and dates are available
  useEffect(() => {
    if (formData.leaveType && formData.startDate && currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid) {
      const selectedLeave = allExisitingLeaves.find(leave => leave.leaveType === formData.leaveType);

      const isCompOff = selectedLeave &&selectedLeave.leaveExpiresAfter !== null && selectedLeave.leaveExpiresAfter !== undefined;
      

      if (isCompOff) {
        const empUuid = currentEmployeeDetails?.employeeCurrentJobDetails.empUuid;
        const endDate = formData.endDate || formData.startDate;
        const isHalfDay = formData.isHalfDay || false;
        dispatch(getCompOffLeaveEligibility(empUuid, formData.startDate, endDate, isHalfDay));
      }
    }
  }, [dispatch, formData.leaveType, formData.startDate, formData.endDate, formData.isHalfDay, currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid, allExisitingLeaves]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        isHalfDay: false,
        reason: "",
      });
      setErrors({});
      setApplicationStatus(null);
      setUploadedFiles([]);
      setValidationMessages({});
    }
  }, [isOpen]);


  // Simplified validation function using utils
  const validateLeaveApplication = useCallback(() => {
    return validateBulkLeave(formData, allExisitingLeaves, cdlData, allToolsAccessDetails?.[selectedToolName], hasAdminAccess, accrualLeaveBalance);
  }, [allToolsAccessDetails, selectedToolName, formData, allExisitingLeaves, cdlData, hasAdminAccess, accrualLeaveBalance]);
  // Update validation messages when validation changes
  useEffect(() => {
    const { messages } = validateLeaveApplication();
    setValidationMessages(messages);
  }, [validateLeaveApplication]);

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    const hasRequiredFields = formData.leaveType && formData.startDate && formData.endDate;
    const { isValid } = validateLeaveApplication();
    const proofValidation = validationMessages.proofRequired ? uploadedFiles.length > 0 : true;

    return hasRequiredFields && isValid && proofValidation;
  }, [formData.leaveType, formData.startDate, formData.endDate, validateLeaveApplication, uploadedFiles, validationMessages]);

  // Update leave balance when leave type or dates change - FIXED: Use validation data
  useEffect(() => {
    if (formData.leaveType && formData.startDate && formData.endDate) {
      const selectedLeave = allExisitingLeaves.find(leave => leave.leaveType === formData.leaveType);

      const isCompOff = selectedLeave && selectedLeave.leaveExpiresAfter !== null && selectedLeave.leaveExpiresAfter !== undefined;
      

      // Use comp off eligibility if comp off is selected
      if (isCompOff && compOffLeaveEligibility) {
        const { paidDays, unpaidDays, availableCompOffCredit, validations, totalDays } = compOffLeaveEligibility;
        const requestedDays = formData.isHalfDay ? 0.5 : totalDays;

        if (unpaidDays > 0) {
          setApplicationStatus({
            type: "warning",
            message: `Application for ${formData.leaveType} Leave: ${requestedDays} ${requestedDays === 1 ? "day" : "days"}`,
            details: `Available Comp Off Credit: ${availableCompOffCredit} days`,
            warning: `${paidDays > 0 ? `${paidDays} ${paidDays === 1 ? "day" : "days"} as paid leave (comp off), ` : ""}${unpaidDays} ${unpaidDays === 1 ? "day" : "days"} will be converted to unpaid leave.`,
            validations: validations
          });
        } else {
          setApplicationStatus({
            type: "info",
            message: `Application for ${formData.leaveType} Leave: ${requestedDays} ${requestedDays === 1 ? "day" : "days"}`,
            details: `Available Comp Off Credit: ${availableCompOffCredit} days`,
            success: `${paidDays} ${paidDays === 1 ? "day" : "days"} will be as paid leave (comp off).`,
            validations: validations
          });
        }
        return;
      }

      // Regular leave balance calculation
      const { calculatedData } = validateLeaveApplication();

      if (calculatedData) {
        const { actualDays, availableBalance, usedDays, totalAllotted, unpaidDays, accruedLeaves } = calculatedData;

        // Check if the selected leave type is "Unpaid"
        const isUnpaidLeave = selectedLeave && selectedLeave.leaveType?.toLowerCase() === "unpaid";

        // Calculate paid days
        const paidDays = Math.min(actualDays, availableBalance);

        // If unpaid leave is selected, always show as warning (red)
        if (isUnpaidLeave) {
          setApplicationStatus({
            type: "warning",
            message: `Application for ${formData.leaveType} Leave: ${actualDays} ${actualDays === 1 ? "day" : "days"}`,
            details: `Total: ${totalAllotted} days | Accrued: ${accruedLeaves || totalAllotted} days | Used: ${usedDays} days | Available: ${availableBalance} days`,
            warning: `${actualDays} ${actualDays === 1 ? "day" : "days"} will be as unpaid leave.`,
          });
        } else {
          // Check if requested leave exceeds available balance
          if (unpaidDays > 0) {
            setApplicationStatus({
              type: "warning",
              message: `Application for ${formData.leaveType
                } Leave: ${actualDays} ${actualDays === 1 ? "day" : "days"}`,
              details: `Total: ${totalAllotted} days | Accrued: ${accruedLeaves || totalAllotted} days | Used: ${usedDays} days | Available: ${availableBalance} days`,
              warning: `${paidDays > 0 ? `${paidDays} ${paidDays === 1 ? "day" : "days"} as paid leave, ` : ""}${unpaidDays} ${unpaidDays === 1 ? "day" : "days"} will be converted to unpaid leave.`,
            });
          } else {
            setApplicationStatus({
              type: "info",
              message: `Application for ${formData.leaveType
                } Leave: ${actualDays} ${actualDays === 1 ? "day" : "days"}`,
              details: `Total: ${totalAllotted} days | Accrued: ${accruedLeaves || totalAllotted} days | Used: ${usedDays} days | Available: ${availableBalance} days`,
              success: `${paidDays} ${paidDays === 1 ? "day" : "days"} will be as paid leave.`,
            });
          }
        }
      }
    }
  }, [
    formData.leaveType,
    formData.startDate,
    formData.endDate,
    formData.isHalfDay,
    validateLeaveApplication,
    compOffLeaveEligibility,
    allExisitingLeaves,
  ]);

  const handleModalClick = (e) => {
    if (e.target.classList.contains("leave-application-backdrop")) {
      onClose();
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "isHalfDay" && checked) {
      // When half day is selected, set end date same as start date
      setFormData({
        ...formData,
        [name]: checked,
        endDate: formData.startDate,
      });
    } else if (name === "startDate" && formData.isHalfDay) {
      // When start date changes and half day is selected, update end date too
      setFormData({
        ...formData,
        [name]: value,
        endDate: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const { validFiles } = await processProofFiles(
      e.target.files, uploadedFiles, dispatch, PROOF_UPLOAD
    );
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setErrors(prev => ({ ...prev, file: '' }));
    }
    e.target.value = '';
  };

  // Handle form submission
  const employeeType = currentEmployeeDetails?.employeeCurrentJobDetails?.empType;
  const empGender = currentEmployeeDetails.employeeBasicDetails?.empGender || null;

  if (!isOpen) return null;

  const applicableLeavesRaw = getApplicableLeaves(allExisitingLeaves, employeeType, empGender, accrualLeaveBalance);
  // Don't show comp off if total allotted is 0 (same as LeaveAvailable)
  const applicableLeaves = applicableLeavesRaw.filter((leave) => {
    
  const isCompOff = leave.leaveExpiresAfter !== null && leave.leaveExpiresAfter !== undefined;

  if (!isCompOff) return true;
  const hasBalance = Array.isArray(compOffleaveBalance) 
    ? compOffleaveBalance.length > 0 
    : compOffleaveBalance?.totalAllotted > 0 || compOffleaveBalance?.compOffAccrualResults?.length > 0;

  return hasBalance;
  });

  // Compute proof upload visibility and mandatory status
  // Always show proof upload when a leave type is selected
  const showProofUpload = !!formData.leaveType;
  // Proof is mandatory only when isProofRequired=true AND CDL is crossed
  const isProofMandatory = !!validationMessages.proofRequired;

  const handleStartDateInputContainer = () => {
    startDateInputRef.current?.showPicker();
  }
  const handleEndDateInputContainer = () => {
    endDateInputRef.current?.showPicker();
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentEmployeeDetails.employeeBasicDetails?.empGender) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "Please fill all the mandatory profile details to apply for leaves",
          severity: "error",
        },
      });
      return;
    }
    const validationErrors = {};

    if (!formData.leaveType) {
      validationErrors.leaveType = "Please select a leave type";
    }
    if (!formData.startDate) {
      validationErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      validationErrors.endDate = "End date is required";
    }

    const selectedLeaveConfig = allExisitingLeaves?.find(
      (leave) => leave.leaveType === formData.leaveType
    );

    if (!selectedLeaveConfig) {
      validationErrors.leaveType = "Invalid leave type selected";
    }

    if (
      checkReasonRequired(formData.leaveType, allExisitingLeaves) &&
      (!formData.reason || !formData.reason.trim())
    ) {
      validationErrors.reason = "Reason is required";
    }

    if (validationMessages.proofRequired && uploadedFiles.length === 0) {
      validationErrors.file = validationMessages.proofRequired === 'cdl_blocked'
        ? `Proof is required for ${formData.leaveType} leave as continuous leave limit (CDL) is reached`
        : `Proof is required for ${formData.leaveType} leave as continuous leave days limit is exceeded`;
    }

    // Balance validation for comp off and regular leaves
    if (selectedLeaveConfig && formData.startDate && formData.endDate) {

      const isCompOff = selectedLeaveConfig.leaveExpiresAfter !== null && selectedLeaveConfig.leaveExpiresAfter !== undefined;

      // Calculate requested days - use totalDays from compOffLeaveEligibility if available, otherwise calculate
      let requestedDays;
      if (isCompOff && compOffLeaveEligibility) {
        requestedDays = formData.isHalfDay ? 0.5 : compOffLeaveEligibility.totalDays;
      } else {
        // For regular leaves, calculate from date range
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        requestedDays = formData.isHalfDay ? 0.5 : daysDiff;
      }

      if (isCompOff && compOffLeaveEligibility) {
        const { availableCompOffCredit } = compOffLeaveEligibility;

        // Only restrict if:
        // 1. Requesting full day(s) (not half day)
        // 2. Available balance is fractional (has 0.5)
        // 3. Requested days > available balance
        if (!formData.isHalfDay && requestedDays > availableCompOffCredit) {
          const fractionalPart = availableCompOffCredit - Math.floor(availableCompOffCredit);
          const hasFractionalBalance = fractionalPart === 0.5;

          // Only restrict if balance is fractional (0.5, 1.5, 2.5, etc.)
          if (hasFractionalBalance) {
            const fullDaysAvailable = Math.floor(availableCompOffCredit);
            let suggestion = '';

            if (fullDaysAvailable > 0) {
              suggestion = ` You can take ${fullDaysAvailable} full ${fullDaysAvailable === 1 ? 'day' : 'days'} and 1 half day.`;
            } else {
              suggestion = ` You can take 1 half day.`;
            }

            validationErrors.leaveType = `You have only ${availableCompOffCredit} ${availableCompOffCredit === 0.5 ? 'day' : 'days'} comp off balance. Please select "Half Day" for at least one day.${suggestion}`;
            dispatch({
              type: "SET_NEW_SNACKBAR_MESSAGE",
              payload: {
                message: validationErrors.leaveType,
                severity: "error",
              },
            });
          }
          // If balance is not fractional (0, 1, 2, etc.) or insufficient, allow it (will be unpaid)
        }
      } else if (!isCompOff && accrualLeaveBalance) {
        // Regular leave balance validation
        const accrualRecord = accrualLeaveBalance.find(
          (balance) => balance.leaveConfigId === selectedLeaveConfig.leaveConfigId
        );

        if (accrualRecord) {
          const availableDays = accrualRecord.availableLeaves || 0;

          // Only restrict if:
          // 1. Requesting full day(s) (not half day)
          // 2. Available balance is fractional (has 0.5)
          // 3. Requested days > available balance
          if (!formData.isHalfDay && requestedDays > availableDays) {
            const fractionalPart = availableDays - Math.floor(availableDays);
            const hasFractionalBalance = fractionalPart === 0.5;

            // Only restrict if balance is fractional (0.5, 1.5, 2.5, etc.)
            if (hasFractionalBalance) {
              const fullDaysAvailable = Math.floor(availableDays);
              let suggestion = '';

              if (fullDaysAvailable > 0) {
                suggestion = ` You can take ${fullDaysAvailable} full ${fullDaysAvailable === 1 ? 'day' : 'days'} and 1 half day.`;
              } else {
                suggestion = ` You can take 1 half day.`;
              }

              validationErrors.leaveType = `You have only ${availableDays} ${availableDays === 0.5 ? 'day' : 'days'} ${selectedLeaveConfig.leaveType} balance. Please select "Half Day" for at least one day.${suggestion}`;
              dispatch({
                type: "SET_NEW_SNACKBAR_MESSAGE",
                payload: {
                  message: validationErrors.leaveType,
                  severity: "error",
                },
              });
            }
            // If balance is not fractional (0, 1, 2, etc.) or insufficient, allow it (will be unpaid)
          }
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isFormValid) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "Please resolve all validation errors before submitting",
          severity: "error",
        },
      });
      return;
    }
    let filesBase64 = null;
    if (uploadedFiles.length > 0) {
      try {
        const processedFiles = [];
        for (const uf of uploadedFiles) {
          let fileBase64;
          if (uf?.base64Data) {
            fileBase64 = uf.base64Data;
          } else if (uf?.isExisting && uf?.base64) {
            fileBase64 = uf.base64;
          } else if (uf instanceof File) {
            const fileData = await convertFileToBase64(uf, PROOF_UPLOAD.MAX_FILE_SIZE);
            fileBase64 = fileData.base64;
          } else {
            continue;
          }
          processedFiles.push({
            base64: fileBase64,
            fileName: uf.name,
            fileType: uf.type,
            fileSize: uf.size,
            uploadTimestamp: new Date().toISOString()
          });
        }
        filesBase64 = JSON.stringify(processedFiles);
      } catch (error) {
        console.error('Error processing files:', error);
        dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: "Error processing files. Please try again.",
            severity: "error",
          },
        });
        return;
      }
    }

    const requestBody = {
      attendanceStatus: formData.isHalfDay
        ? ATTENDANCE_STATUS.HALF_DAY
        : ATTENDANCE_STATUS.ON_LEAVE,
      leaveConfigId: selectedLeaveConfig.leaveConfigId,
      remarks: formData.reason,
      startDate: formData.startDate,
      endDate: formData.endDate,
      empUuid: currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid,
      unpaidLeaveConfigId:
        allExisitingLeaves.find(
          (unpaid) => unpaid.leaveType.toLowerCase() === "unpaid"
        )?.leaveConfigId || "",
      attachmentPath: filesBase64 || null,
    };

    // Check if it's a comp off leave

    const isCompOff = selectedLeaveConfig && selectedLeaveConfig.leaveExpiresAfter !== null && selectedLeaveConfig.leaveExpiresAfter !== undefined;
    

    if (isCompOff) {
      dispatch(registerCompOffLeave(requestBody, setAttendanceMonth, setAttendanceYear));
    } else {
      dispatch(createAttendanceLog(requestBody, setAttendanceMonth, setAttendanceYear));
    }

    setErrors({});
    onClose();
  };

  return (
    <div className="leave-application-backdrop" onClick={handleModalClick}>
      <div className="leave-application-container">
        <div className="leave-modal">
          <div className="leave-modal-header">
            <p>Leave Application</p>
            <button className="application-close-button" onClick={onClose}>
              <img src={Cross_icon} alt="Close" />
            </button>
          </div>

          <div className="leave-modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Leave type (select one)*</label>
                <div className="leave-types">
                  {cdlLoading ? <LoadingSpinner message="Loading Leave Options..." height="10vh" /> : empGender ? (
                    applicableLeaves.length > 0 ? (
                      applicableLeaves.map((leave) => {
                        const cdlAllowed = cdlData[leave?.leaveConfigId];
                        // Disable CDL-blocked leaves for non-admin users (unless isProofRequired is true)
                        const isCdlDisabled = !formData.isHalfDay &&
                          cdlAllowed === false &&
                          !leave?.isProofRequired &&
                          !isSuperAdmin && !hasAdminAccess;

                        return (
                          <button
                            key={leave.leaveConfigId}
                            type="button"
                            className={`leave-type-button ${formData.leaveType === leave.leaveType
                              ? "selected"
                              : ""
                              } ${isCdlDisabled ? "disabled" : ""}`}
                            onClick={() =>
                              handleInputChange({
                                target: {
                                  name: "leaveType",
                                  value: leave.leaveType,
                                },
                              })
                            }
                            disabled={isCdlDisabled}
                            title={isCdlDisabled ? "CDL reached - Cannot apply for this leave type" : ""}
                          >
                            {leave.leaveType}
                          </button>
                        );
                      })
                    ) : (
                      <p className="no-leaves-message">
                        No leave types available for your employee type and
                        gender.
                      </p>
                    )
                  ) : (
                    <>
                      <p className="no-leaves-message">
                        Please fill all the mandatory profile details to apply for leaves.
                      </p>
                      <Link
                        to={`/dashboard?employeeUuid=${currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid}&showEmployeeDetails=true&isEditing=true&fromAttendace=true`}
                        className="profile-update-note">
                        <span className="update-link">click here</span> to update your profile.
                      </Link>
                    </>
                  )}
                </div>
                {errors.leaveType && (
                  <span className="error">{errors.leaveType}</span>
                )}
              </div>

              <div className="date-container">
                <div className="form-group">
                  <label htmlFor="startDate">Start date*</label>
                  <div className="date-input" onClick={handleStartDateInputContainer}>
                    <input
                      ref={startDateInputRef}
                      type="date"
                      id="startDate"
                      name="startDate"
                      max={formData.endDate || undefined}
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {errors.startDate && (
                    <span className="error">{errors.startDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End date*</label>
                  <div className="date-input" onClick={handleEndDateInputContainer}>
                    <input
                      ref={endDateInputRef}
                      type="date"
                      id="endDate"
                      name="endDate"
                      min={formData.startDate || undefined}
                      value={formData.endDate}
                      onChange={handleInputChange}
                      disabled={formData.isHalfDay}
                      required
                    />
                  </div>
                  {errors.endDate && (
                    <span className="error">{errors.endDate}</span>
                  )}
                </div>
              </div>

              {checkHalfDayAllowed(formData.leaveType, allExisitingLeaves) && (
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="isHalfDay"
                    name="isHalfDay"
                    checked={formData.isHalfDay}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isHalfDay">Half Day</label>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="reason">
                  Reason{checkReasonRequired(formData.leaveType, allExisitingLeaves) ? "*" : ""}
                </label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="A line or two detailing your reason"
                  required={checkReasonRequired(formData.leaveType, allExisitingLeaves)}
                />
                {errors.reason && (
                  <span className="error">{errors.reason}</span>
                )}
              </div>

              {/* File Upload for Leave Proof */}
              {showProofUpload && (
                <div className="file_upload_container">
                  <label>
                    Proof {isProofMandatory ? '*' : ''}
                    {isProofMandatory
                      ? validationMessages.proofRequired === 'cdl_blocked'
                        ? ' (Required - Continuous leave limit reached)'
                        : ' (Required - Continuous leave days exceeded)'
                      : ' (Optional)'}
                  </label>
                  {uploadedFiles.length > 0 && (
                    <small className="file-note">
                      {uploadedFiles.length} of {PROOF_UPLOAD.MAX_FILES} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
                    </small>
                  )}
                  <input
                    type="file"
                    id="proofFile"
                    name="proofFile"
                    accept={PROOF_UPLOAD.ACCEPT_STRING}
                    onChange={handleFileUpload}
                    multiple
                    style={{ display: "none" }}
                  />

                  {uploadedFiles.length > 0 && (
                    <div className="custom_file_Upload">
                      {uploadedFiles.map((file, index) => (
                        <div className="uploaded-file-row" key={index}>
                          <div className="file-icon-container">
                            {isFilePDF(file) ? (
                              <img src={PDF_icon} alt="PDF" className="file-type-icon" />
                            ) : (
                              <img src={Image_icon} alt="Image" className="file-type-icon" />
                            )}
                          </div>
                          <button
                            type="button"
                            className="file-name clickable"
                            disabled={!file.base64Data}
                            aria-label={`Preview ${getFileDisplayName(file)}`}
                            onClick={() => {
                              if (file.base64Data) {
                                setFilesToView([{
                                  url: file.base64Data,
                                  fileName: file.name || 'proof',
                                  fileType: file.type || 'application/octet-stream',
                                  isBase64: true
                                }]);
                                setViewerOpen(true);
                              }
                            }}
                          >
                            {getFileDisplayName(file)}
                          </button>
                          <div className="file-meta">
                            {getFileDisplaySize(file)} KB | {getFileDisplayType(file)}
                          </div>
                          <button
                            type="button"
                            className="delete-file-btn"
                            onClick={() => {
                              setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            title="Remove file"
                          >
                            <img
                              src={Delete_icon}
                              alt="Delete"
                              className="delete-icon"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length < PROOF_UPLOAD.MAX_FILES && (
                    <label htmlFor="proofFile" className="custom_file_Upload clickable">
                      <div className="file-upload-label">
                        <img src={Image_icon} alt="Upload" className="upload-icon" />
                        {uploadedFiles.length > 0 ? 'Add more files' : 'Choose file'}
                      </div>
                    </label>
                  )}

                  {errors.file && (
                    <span className="error">{errors.file}</span>
                  )}
                  <small className="file-note" style={{ textAlign: 'center', display: 'block' }}>
                    {PROOF_UPLOAD.FILE_HINT}
                  </small>
                </div>
              )}

              {/* Validation Messages */}
              {compOffLeaveEligibilityLoading && formData.leaveType && (
                <div className="application-status info">
                  <p className="status-title">Loading comp off eligibility...</p>
                </div>
              )}

              {applicationStatus && (
                <div className={`application-status ${applicationStatus.type}`}>
                  <p className="status-title">{applicationStatus.message}</p>
                  {applicationStatus.details && (
                    <p className="status-details">
                      {applicationStatus.details}
                    </p>
                  )}
                  {applicationStatus.warning && (
                    <p className="status-warning">
                      {applicationStatus.warning}
                    </p>
                  )}
                  {applicationStatus.success && (
                    <p className="status-info">
                      {applicationStatus.success}
                    </p>
                  )}
                  {/* Show comp off eligibility validations if available */}
                  {applicationStatus.validations && (
                    <div className="validation-messages">
                      {!applicationStatus.validations.noticePeriod?.valid && applicationStatus.validations.noticePeriod?.message && (
                        <div className="status-warning">
                          {applicationStatus.validations.noticePeriod.message}
                        </div>
                      )}
                      {!applicationStatus.validations.continuousLeaveLimit?.valid && applicationStatus.validations.continuousLeaveLimit?.message && (
                        <div className="status-warning">
                          {applicationStatus.validations.continuousLeaveLimit.message}
                        </div>
                      )}
                      {!applicationStatus.validations.overlappingLeaves?.valid && applicationStatus.validations.overlappingLeaves?.message && (
                        <div className="status-warning">
                          {applicationStatus.validations.overlappingLeaves.message}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Show regular validation messages for non-comp off leaves */}
                  {!applicationStatus.validations && Object.keys(validationMessages).length > 0 && (
                    <div className="validation-messages">
                      {validationMessages.weekendError && (
                        <div className="status-warning">
                          {validationMessages.weekendError}
                        </div>
                      )}
                      {validationMessages.minimumNotice && (
                        <div className="status-warning">
                          {validationMessages.minimumNotice}
                        </div>
                      )}
                      {validationMessages.maximumNotice && (
                        <div className="status-warning">
                          {validationMessages.maximumNotice}
                        </div>
                      )}
                      {validationMessages.continuousLimit && (
                        <div className="status-warning">
                          {validationMessages.continuousLimit}
                        </div>
                      )}
                      {validationMessages.cdlBlocked && (
                        <div className="status-warning">
                          Cannot apply for leave due to continuous leave limit restrictions.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apply-button"
                  disabled={loading || cdlLoading || !isFormValid}
                >
                  {loading ? "Processing..." : "Apply for Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <FileViewer
        fileUrls={filesToView}
        open={viewerOpen}
        onClose={() => { setViewerOpen(false); setFilesToView([]); }}
        initialIndex={0}
      />
    </div>
  );
};

export default LeaveApplication;