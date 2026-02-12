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
  convertFileToBase64
} from "../../Common/utils/helper";
import {
  validateBulkLeave,
  getApplicableLeaves,
  isHalfDayAllowed as checkHalfDayAllowed,
  isReasonRequired as checkReasonRequired
} from "../utils/LeaveManagementUtils";
import { checkCdlLimit } from "../../../../actions/hrRepositoryAction";
import { ATTENDANCE_STATUS } from "../../Common/utils/enums";


const LeaveApplication = ({ isOpen, onClose }) => {
  const { loading, allExisitingLeaves, currentEmployeeDetails, setAttendanceYear, setAttendanceMonth, cdlData, accrualLeaveBalance, compOffleaveBalance, compOffLeaveEligibility, compOffLeaveEligibilityLoading, myHrmsAccess } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const hasAccessToLeaveApplication = myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveApplication_write");

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    isHalfDay: false,
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationMessages, setValidationMessages] = useState({});

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
      const isCompOff = selectedLeave && (selectedLeave.leaveType?.toLowerCase().includes('comp') || selectedLeave.leaveType?.toLowerCase().includes('comp off'));

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
      setUploadedFile(null);
      setValidationMessages({});
    }
  }, [isOpen]);


  // Simplified validation function using utils
  const validateLeaveApplication = useCallback(() => {
    return validateBulkLeave(formData, allExisitingLeaves, cdlData, allToolsAccessDetails?.[selectedToolName], hasAccessToLeaveApplication, accrualLeaveBalance);
  }, [allToolsAccessDetails, selectedToolName, formData, allExisitingLeaves, cdlData, hasAccessToLeaveApplication, accrualLeaveBalance]);
  // Update validation messages when validation changes
  useEffect(() => {
    const { messages } = validateLeaveApplication();
    setValidationMessages(messages);
  }, [validateLeaveApplication]);

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    const hasRequiredFields = formData.leaveType && formData.startDate && formData.endDate;
    const { isValid } = validateLeaveApplication();
    const proofValidation = validationMessages.proofRequired ? !!uploadedFile : true;

    return hasRequiredFields && isValid && proofValidation;
  }, [formData.leaveType, formData.startDate, formData.endDate, validateLeaveApplication, uploadedFile, validationMessages]);

  // Update leave balance when leave type or dates change - FIXED: Use validation data
  useEffect(() => {
    if (formData.leaveType && formData.startDate && formData.endDate) {
      const selectedLeave = allExisitingLeaves.find(leave => leave.leaveType === formData.leaveType);
      const isCompOff = selectedLeave && (selectedLeave.leaveType?.toLowerCase().includes('comp') || selectedLeave.leaveType?.toLowerCase().includes('comp off'));

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
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Convert file to base64 using utility function with 10MB limit
      const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
      const fileData = await convertFileToBase64(file, maxSizeInBytes);

      // Create a file object with base64 data
      const processedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        base64Data: fileData.base64,
        pureBase64: fileData.pureBase64,
        fileMetadata: fileData
      };

      setUploadedFile(processedFile);
      setErrors({ ...errors, file: '' });
    } catch (error) {
      console.error('Error processing file:', error);
      setErrors({ ...errors, file: error.message });
      // Reset the file input on error
      const fileInput = document.getElementById('proofFile');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  // Handle form submission
  const employeeType = currentEmployeeDetails?.employeeCurrentJobDetails.empType;
  const empGender = currentEmployeeDetails.employeeBasicDetails?.empGender || null;

  if (!isOpen) return null;

  const applicableLeavesRaw = getApplicableLeaves(allExisitingLeaves, employeeType, empGender, accrualLeaveBalance);
  // Don't show comp off if total allotted is 0 (same as LeaveAvailable)
  const applicableLeaves = applicableLeavesRaw.filter((leave) => {
    const leaveTypeLower = leave?.leaveType?.toLowerCase() || "";
    const isCompOff = leaveTypeLower.includes("comp") || leaveTypeLower.includes("comp off");
    if (!isCompOff) return true;
    return compOffleaveBalance && !Array.isArray(compOffleaveBalance) && compOffleaveBalance.totalAllotted > 0;
  });

  const handleStartDateInputContainer = () => {
    startDateInputRef.current?.showPicker();
  }
  const handleEndDateInputContainer = () => {
    endDateInputRef.current?.showPicker();
  }
  const handleSubmit = async (e) => {
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

    e.preventDefault();
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

    if (
      checkReasonRequired(formData.leaveType, allExisitingLeaves) &&
      (!formData.reason || !formData.reason.trim())
    ) {
      validationErrors.reason = "Reason is required";
    }

    if (validationMessages.proofRequired && !uploadedFile) {
      validationErrors.file = "Medical certificate is required for sick leave exceeding continuous limit";
    }

    // Balance validation for comp off and regular leaves
    if (selectedLeaveConfig && formData.startDate && formData.endDate) {
      const isCompOff = selectedLeaveConfig.leaveType?.toLowerCase().includes('comp') ||
        selectedLeaveConfig.leaveType?.toLowerCase().includes('comp off');

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
    let fileBase64 = null;
    if (uploadedFile) {
      try {
        dispatch({ type: "UPLOAD_PROOF_DOCUMENTS" });

        // Use base64 data from the uploaded file
        if (uploadedFile?.base64Data) {
          fileBase64 = uploadedFile.base64Data;
        } else {
          // Fallback: convert file to base64 if not already processed
          const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
          const fileData = await convertFileToBase64(uploadedFile, maxSizeInBytes);
          fileBase64 = fileData.base64;
        }
      } catch (error) {
        console.error('Error processing file:', error);
        dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: "Error processing file. Please try again.",
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
      attachmentPath: fileBase64 ? JSON.stringify([{
        base64: fileBase64,
        fileName: uploadedFile.name,
        fileType: uploadedFile.type,
        fileSize: uploadedFile.size,
        uploadTimestamp: new Date().toISOString()
      }]) : null,
    };

    // Check if it's a comp off leave
    const isCompOff = selectedLeaveConfig && (selectedLeaveConfig.leaveType?.toLowerCase().includes('comp') || selectedLeaveConfig.leaveType?.toLowerCase().includes('comp off'));

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
                  {empGender ? (
                    applicableLeaves.length > 0 ? (
                      applicableLeaves.map((leave) => (
                        <button
                          key={leave.leaveConfigId}
                          type="button"
                          className={`leave-type-button ${formData.leaveType === leave.leaveType
                            ? "selected"
                            : ""
                            }`}
                          onClick={() =>
                            handleInputChange({
                              target: {
                                name: "leaveType",
                                value: leave.leaveType,
                              },
                            })
                          }
                        >
                          {leave.leaveType}
                        </button>
                      ))
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

              {/* File Upload for Sick Leave Proof */}
              {validationMessages.proofRequired && (
                <div className="file_upload_container">
                  <label >Medical Certificate*</label>
                  <label htmlFor={!uploadedFile ? 'proofFile' : ''} className={!uploadedFile ? 'custom_file_Upload clickable' : 'custom_file_Upload'}>
                    <input
                      type="file"
                      id="proofFile"
                      name="proofFile"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      required
                      style={{ display: "none" }}
                    />

                    {uploadedFile ? (
                      // Show uploaded file details
                      <div className="uploaded-file-row">
                        <div className="file-icon-container">
                          {uploadedFile.type === "application/pdf" ? (
                            <img src={PDF_icon} alt="PDF" className="file-type-icon" />
                          ) : (
                            <img src={Image_icon} alt="Image" className="file-type-icon" />
                          )}
                        </div>
                        <div className="file-name">{uploadedFile.name}</div>
                        <div className="file-meta">
                          {Math.round(uploadedFile.size / 1024)} KB | {uploadedFile.type.split("/")[1]?.toUpperCase()}
                        </div>
                        <button
                          type="button"
                          className="delete-file-btn"
                          onClick={() => setUploadedFile(null)}
                          title="Remove file"
                        >
                          <img
                            src={Delete_icon}
                            alt="Delete"
                            className="delete-icon"
                          />
                        </button>
                      </div>
                    ) : (
                      // Show choose file option
                      <label htmlFor="proofFile" className="file-upload-label">
                        <img src={Image_icon} alt="Upload" className="upload-icon" />
                        Choose file
                      </label>
                    )}
                  </label>

                  {errors.file && (
                    <span className="error">{errors.file}</span>
                  )}
                  {!uploadedFile && <small className="file-note">
                    Upload JPG, PNG, or PDF file
                  </small>}
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
                        <div className={validationMessages.proofRequired ? "status-warning" : validationMessages.cdlBlocked ? "status-warning" : "status-warning"}>
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
                  disabled={loading || !isFormValid}
                >
                  {loading ? "Processing..." : "Apply for Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;