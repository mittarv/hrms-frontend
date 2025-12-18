import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import "../styles/LeaveApplication.scss";
import Cross_icon from "../../../../assets/icons/cross_icon.svg";
import { createAttendanceLog, getLeaveBalanceWithAccrual } from "../../../../actions/hrRepositoryAction";
import Image_icon from "../../../../assets/icons/image_icon.svg";
import PDF_icon from "../../../../assets/icons/pdf_icon.svg";
import Delete_icon from "../../../../assets/icons/delete_icon.svg";
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

// Attendance Status Enum
export const ATTENDANCE_STATUS = {
  HALF_DAY: "half_day",
  ON_LEAVE: "on_leave",
};

const LeaveApplication = ({ isOpen, onClose }) => {
  const { loading, allExisitingLeaves, currentEmployeeDetails, setAttendanceYear, setAttendanceMonth, cdlData, accrualLeaveBalance } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

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
    return validateBulkLeave(formData, allExisitingLeaves, cdlData, allToolsAccessDetails?.[selectedToolName], user?.userType, accrualLeaveBalance);
  }, [allToolsAccessDetails, selectedToolName, formData, allExisitingLeaves, cdlData, user?.userType, accrualLeaveBalance]);
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
      const { calculatedData } = validateLeaveApplication();
      
      if (calculatedData) {
        const { actualDays, availableBalance, usedDays, totalAllotted, unpaidDays, accruedLeaves } = calculatedData;

        // Calculate paid days
        const paidDays = Math.min(actualDays, availableBalance);

        // Check if requested leave exceeds available balance
        if (unpaidDays > 0) {
          setApplicationStatus({
            type: "warning",
            message: `Application for ${
              formData.leaveType
            } Leave: ${actualDays} ${actualDays === 1 ? "day" : "days"}`,
            details: `Total: ${totalAllotted} days | Accrued: ${accruedLeaves || totalAllotted} days | Used: ${usedDays} days | Available: ${availableBalance} days`,
            warning: `${paidDays > 0 ? `${paidDays} ${paidDays === 1 ? "day" : "days"} as paid leave, ` : ""}${unpaidDays} ${unpaidDays === 1 ? "day" : "days"} will be converted to unpaid leave.`,
          });
        } else {
          setApplicationStatus({
            type: "info",
            message: `Application for ${
              formData.leaveType
            } Leave: ${actualDays} ${actualDays === 1 ? "day" : "days"}`,
            details: `Total: ${totalAllotted} days | Accrued: ${accruedLeaves || totalAllotted} days | Used: ${usedDays} days | Available: ${availableBalance} days`,
            success: `${paidDays} ${paidDays === 1 ? "day" : "days"} will be as paid leave.`,
          });
        }
      }
    }
  }, [
    formData.leaveType,
    formData.startDate,
    formData.endDate,
    formData.isHalfDay,
    validateLeaveApplication,
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

  const applicableLeaves = getApplicableLeaves(allExisitingLeaves, employeeType, empGender);

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
    dispatch(createAttendanceLog(requestBody, setAttendanceMonth, setAttendanceYear));
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
                          className={`leave-type-button ${
                            formData.leaveType === leave.leaveType
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
                        to = {`/dashboard?employeeUuid=${currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid}&showEmployeeDetails=true&isEditing=true&fromAttendace=true`}
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
                  {Object.keys(validationMessages).length > 0 && (
                    <div className="validation-messages">
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