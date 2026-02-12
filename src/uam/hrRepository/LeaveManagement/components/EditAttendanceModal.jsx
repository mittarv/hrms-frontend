import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import "../styles/EditAttendanceModal.scss";
import { toHHMMSS, normalizeTime } from "../../Common/utils/helper";
import { useDispatch } from "react-redux";
import { validateSingleLeaveApplication } from "../utils/LeaveManagementUtils";
import { checkCdlLimit, getLeaveBalanceWithAccrual, getCompOffLeaveEligibility } from "../../../../actions/hrRepositoryAction";
import Image_icon from "../../assets/icons/image_icon.svg";
import PDF_icon from "../../assets/icons/pdf_icon.svg";
import Delete_icon from "../../assets/icons/delete_icon.svg";
import { Link } from "react-router-dom";
import {
  convertFileToBase64,
  getFileDisplayName,
  getFileDisplaySize,
  getFileDisplayType,
  isFilePDF
} from "../../Common/utils/helper";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const ATTENDANCE_STATUS = {
  WORKING: "working",
  HALF_DAY: "half_day",
  ON_LEAVE: "on_leave",
};

export default function EditAttendanceModal({
  selectedDate,
  existingAttendance,
  onSave,
  onDelete,
  onClose,
}) {
  const { loading, allExisitingLeaves, currentEmployeeDetails, setAttendanceYear, setAttendanceMonth, cdlData, cdlLoading, accrualLeaveBalance, compOffleaveBalance, compOffLeaveEligibility, compOffLeaveEligibilityLoading, myHrmsAccess } =
    useSelector((state) => state.hrRepositoryReducer);
  const dispatch = useDispatch();
  const { allToolsAccessDetails, user } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  // Access control checks
  const isSuperAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
  const isViewingOwnAttendance = user?.employeeUuid === currentEmployeeDetails?.employeeBasicDetails?.empUuid;
  const hasAccessToEditAttendance = isSuperAdmin || myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveAttendance_write");
  const hasAccessToViewAttendance = isSuperAdmin || myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveAttendanceAdmin_read");
  // View-only mode: viewing other employee's attendance AND only has view permission (not edit)
  const isViewOnly = !isViewingOwnAttendance && hasAccessToViewAttendance && !hasAccessToEditAttendance;

  const [formData, setFormData] = useState({
    attendanceStatus: "",
    checkIn: "",
    checkOut: "",
    leaveConfigId: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cdlError, setCdlError] = useState("");
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [proofFile, setProofFile] = useState(null);

  const checkInInputRef = useRef(null);
  const checkOutInputRef = useRef(null);
  const [leaveValidationError, setLeaveValidationError] = useState("");

  // Initialize form data
  useEffect(() => {
    if (existingAttendance) {
      setFormData({
        attendanceStatus: existingAttendance.attendanceStatus || "",
        checkIn: normalizeTime(existingAttendance.checkIn),
        checkOut: normalizeTime(existingAttendance.checkOut),
        leaveConfigId: existingAttendance.leaveConfigId || "",
        remarks: existingAttendance.remarks || "",
      });
    }
  }, [existingAttendance]);

  // Helper function to check if a date is a weekend
  const isWeekend = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Check weekend validation when date or leave type changes
  useEffect(() => {
    if (formData.leaveConfigId && selectedDate?.dateString) {
      const selectedLeave = allExisitingLeaves.find(leave => leave.leaveConfigId === formData.leaveConfigId);
      if (selectedLeave) {
        const excludePaidWeekend = selectedLeave.excludePaidWeekend;
        if (excludePaidWeekend === true && isWeekend(selectedDate.dateString)) {
          setLeaveValidationError("You cannot apply this leave on weekends (Saturday or Sunday)");
        } else {
          // Clear weekend error if not applicable
          setLeaveValidationError(prev => {
            if (prev === "You cannot apply this leave on weekends (Saturday or Sunday)") {
              return "";
            }
            return prev;
          });
        }
      }
    } else if (!formData.leaveConfigId || !selectedDate?.dateString) {
      // Clear weekend error if leave type or date is cleared
      setLeaveValidationError(prev => {
        if (prev === "You cannot apply this leave on weekends (Saturday or Sunday)") {
          return "";
        }
        return prev;
      });
    }
  }, [selectedDate, formData.leaveConfigId, allExisitingLeaves]);

  // Refetch comp off eligibility when attendance status changes (for half-day toggle)
  useEffect(() => {
    const selectedLeave = allExisitingLeaves.find(leave => leave.leaveConfigId === formData.leaveConfigId);
    const isCompOff = selectedLeave && (selectedLeave.leaveType?.toLowerCase().includes('comp') || selectedLeave.leaveType?.toLowerCase().includes('comp off'));

    if (isCompOff && selectedDate?.dateString && formData.leaveConfigId) {
      const empUuid = currentEmployeeDetails.employeeBasicDetails?.empUuid;
      if (empUuid) {
        const isHalfDay = formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY;
        dispatch(getCompOffLeaveEligibility(empUuid, selectedDate.dateString, selectedDate.dateString, isHalfDay));
      }
    }
  }, [formData.attendanceStatus, formData.leaveConfigId, selectedDate, allExisitingLeaves, currentEmployeeDetails, dispatch]);

  // Fetch CDL data when component mounts
  useEffect(() => {
    const empUuid = currentEmployeeDetails.employeeBasicDetails?.empUuid;
    if (!empUuid || !selectedDate?.dateString) return;

    dispatch(checkCdlLimit(empUuid, selectedDate.dateString));
  }, [currentEmployeeDetails.employeeBasicDetails?.empUuid, selectedDate?.dateString, dispatch]);

  // Fetch fiscal year-specific accrual balance when date changes
  useEffect(() => {
    const empUuid = currentEmployeeDetails.employeeBasicDetails?.empUuid;
    if (!empUuid || !selectedDate?.dateString) return;

    // Always fetch balance for the selected date to support multi-fiscal year
    dispatch(getLeaveBalanceWithAccrual(empUuid, selectedDate.dateString));

  }, [currentEmployeeDetails.employeeBasicDetails?.empUuid, selectedDate?.dateString, dispatch]);

  const empGender = currentEmployeeDetails.employeeBasicDetails?.empGender || null;
  const currentEmployeeType = currentEmployeeDetails?.employeeCurrentJobDetails?.empType || "";
  const eligibleLeaveIds = new Set(accrualLeaveBalance.map(item => item.leaveConfigId));
  const availableLeaves = allExisitingLeaves.filter((leave) => {
    if (!eligibleLeaveIds.has(leave.leaveConfigId)) return false;
    if (!leave.isActive) return false;

    // Don't show comp off if total allotted is 0 (same as LeaveAvailable)
    const leaveTypeLower = leave?.leaveType?.toLowerCase() || "";
    const isCompOff = leaveTypeLower.includes("comp") || leaveTypeLower.includes("comp off");
    if (isCompOff && (!compOffleaveBalance || Array.isArray(compOffleaveBalance) || !(compOffleaveBalance.totalAllotted > 0))) {
      return false;
    }

    try {
      const employeeTypes = JSON.parse(leave.employeeType);
      const appliedGenders = JSON.parse(leave.appliedGender);

      if (!empGender) {
        return false;
      }

      if (!employeeTypes.includes(currentEmployeeType)) return false;
      if (!appliedGenders.includes(empGender)) return false;
      if (
        formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY &&
        !leave.isHalfDayAllowed
      ) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  });



  const handleStatusChange = (status) => {
    // Only restrict if switching to full day leave with fractional balance (0.5, 1.5, etc.)
    if (status === ATTENDANCE_STATUS.ON_LEAVE && formData.leaveConfigId) {
      const selectedLeave = allExisitingLeaves.find(
        (leave) => leave.leaveConfigId === formData.leaveConfigId
      );

      if (selectedLeave) {
        const isCompOff = selectedLeave.leaveType?.toLowerCase().includes('comp') ||
          selectedLeave.leaveType?.toLowerCase().includes('comp off');

        // Check comp off balance - only restrict if fractional
        if (isCompOff && compOffLeaveEligibility) {
          const { availableCompOffCredit } = compOffLeaveEligibility;
          const fractionalPart = availableCompOffCredit - Math.floor(availableCompOffCredit);
          const hasFractionalBalance = fractionalPart === 0.5;

          // Only restrict if balance is fractional and less than 1 day
          if (hasFractionalBalance && availableCompOffCredit < 1) {
            dispatch({
              type: "SET_NEW_SNACKBAR_MESSAGE",
              payload: {
                message: `You have only ${availableCompOffCredit} day comp off balance. Please select "Half Day" instead.`,
                severity: "error",
              },
            });
            return; // Prevent status change
          }
        }

        // Check regular leave balance - only restrict if fractional
        if (!isCompOff && accrualLeaveBalance) {
          const accrualRecord = accrualLeaveBalance.find(
            (balance) => balance.leaveConfigId === selectedLeave.leaveConfigId
          );
          if (accrualRecord) {
            const availableDays = accrualRecord.availableLeaves || 0;
            const fractionalPart = availableDays - Math.floor(availableDays);
            const hasFractionalBalance = fractionalPart === 0.5;

            // Only restrict if balance is fractional and less than 1 day
            if (hasFractionalBalance && availableDays < 1) {
              dispatch({
                type: "SET_NEW_SNACKBAR_MESSAGE",
                payload: {
                  message: `You have only ${availableDays} day ${selectedLeave.leaveType} balance. Please select "Half Day" instead.`,
                  severity: "error",
                },
              });
              return; // Prevent status change
            }
          }
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      attendanceStatus: status,
      // Clear leave type when switching between different leave statuses or to working
      leaveConfigId: status === ATTENDANCE_STATUS.WORKING ? "" :
        (prev.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY && status === ATTENDANCE_STATUS.ON_LEAVE) ? "" :
          (prev.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE && status === ATTENDANCE_STATUS.HALF_DAY) ? "" :
            prev.leaveConfigId,
      checkIn: status === ATTENDANCE_STATUS.ON_LEAVE ? "" : prev.checkIn,
      checkOut: status === ATTENDANCE_STATUS.ON_LEAVE ? "" : prev.checkOut,
    }));
    setErrors({});
    setCdlError("");
    setShowProofUpload(false);
    setProofFile(null);
  };

  const handleLeaveTypeChange = (leaveConfigId) => {
    handleInputChange("leaveConfigId", leaveConfigId);

    const selectedLeave = allExisitingLeaves.find(leave => leave.leaveConfigId === leaveConfigId);
    const isCompOff = selectedLeave && (selectedLeave.leaveType?.toLowerCase().includes('comp') || selectedLeave.leaveType?.toLowerCase().includes('comp off'));

    // Fetch comp off eligibility if comp off is selected
    if (isCompOff && selectedDate?.dateString) {
      const empUuid = currentEmployeeDetails.employeeBasicDetails?.empUuid;
      if (empUuid) {
        const isHalfDay = formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY;
        dispatch(getCompOffLeaveEligibility(empUuid, selectedDate.dateString, selectedDate.dateString, isHalfDay));
      }
    }

    // Skip CDL check for half day attendance
    if (formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY) {
      setCdlError("");
      setShowProofUpload(false);
      return;
    }

    // Check CDL for this leave type (skip for comp off as it has its own eligibility)
    if (!isCompOff) {
      const cdlAllowed = cdlData[leaveConfigId];

      // Skip CDL restrictions for admin users (access level >= 900) or users with edit permission
      if (cdlAllowed === false && !isSuperAdmin && !hasAccessToEditAttendance) {
        // Check if it's sick leave
        if (selectedLeave && selectedLeave.leaveType.toLowerCase() === 'sick') {
          setCdlError(`Need medical certificate for ${selectedLeave.leaveType} leave as continuous leave limit (CDL) reached.`);
          setShowProofUpload(true);
        } else {
          setCdlError(`Application not allowed for ${selectedLeave.leaveType} leave due to continuous leave limit (CDL) restrictions.`);
          setShowProofUpload(false);
        }
      } else {
        setCdlError("");
        setShowProofUpload(false);
      }
    } else {
      setCdlError("");
      setShowProofUpload(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (field === "leaveConfigId") {
        return { ...prev, [field]: "", remarks: "" };
      }
      return { ...prev, [field]: "" };
    });
  };

  const handleProofUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {

      // Convert file to base64 using utility function with 10MB limit
      const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
      const fileData = await convertFileToBase64(file, maxSizeInBytes);

      // Create a simple file object with base64 data
      const processedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        base64Data: fileData.base64,
        pureBase64: fileData.pureBase64,
        fileMetadata: fileData
      };

      setProofFile(processedFile);
      setErrors(prev => ({ ...prev, proof: '' }));
      if (cdlError) {
        setCdlError("");
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setErrors(prev => ({ ...prev, proof: error.message }));
      // Reset the file input on error
      const fileInput = document.getElementById('proofFile');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const validateCDL = () => {
    if (!formData.leaveConfigId) return true;
    // Skip CDL validation for admin users (access level >= 900) or users with edit permission
    if (isSuperAdmin || hasAccessToEditAttendance) {
      return true;
    }

    // Skip CDL validation for half day attendance
    if (formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY) {
      return true;
    }

    const cdlAllowed = cdlData[formData.leaveConfigId];
    const selectedLeave = allExisitingLeaves.find(leave => leave.leaveConfigId === formData.leaveConfigId);

    if (cdlAllowed === false) {
      if (selectedLeave && selectedLeave.leaveType.toLowerCase() === 'sick') {
        // For sick leave, proof is required when CDL is reached
        return proofFile !== null;
      } else {
        // For other leave types, cannot proceed when CDL is reached
        return false;
      }
    }

    return true; // CDL is true or not set, can proceed
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.attendanceStatus) {
      newErrors.attendanceStatus = "Attendance status is required";
    }

    if (formData.attendanceStatus === ATTENDANCE_STATUS.WORKING) {
      if (!formData.checkIn) newErrors.checkIn = "Check-in time is required";
      if (!formData.checkOut) newErrors.checkOut = "Check-out time is required";
      if (
        formData.checkIn &&
        formData.checkOut &&
        formData.checkOut <= formData.checkIn
      ) {
        newErrors.checkOut = "Check-out time must be after check-in time";
      }
    }

    if (
      (formData.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE ||
        formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY) &&
      !formData.leaveConfigId
    ) {
      newErrors.leaveConfigId = "Leave type is required";
    }

    const selectedLeave = allExisitingLeaves.find(
      (leave) => leave.leaveConfigId === formData.leaveConfigId
    );

    // Comp off balance validation - Only restrict for fractional balance scenarios
    if (selectedLeave && compOffLeaveEligibility) {
      const isCompOff = selectedLeave.leaveType?.toLowerCase().includes('comp') ||
        selectedLeave.leaveType?.toLowerCase().includes('comp off');

      if (isCompOff) {
        const { availableCompOffCredit } = compOffLeaveEligibility;
        const requestedDays = formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY ? 0.5 : 1;

        // Only restrict if:
        // 1. Requesting full day (not half day)
        // 2. Available balance is fractional (has 0.5)
        // 3. Requested days > available balance
        if (formData.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE && requestedDays > availableCompOffCredit) {
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

            newErrors.attendanceStatus = `You have only ${availableCompOffCredit} ${availableCompOffCredit === 0.5 ? 'day' : 'days'} comp off balance. Please select "Half Day" instead.${suggestion}`;
          }
          // If balance is not fractional (0, 1, 2, etc.) or insufficient, allow it (will be unpaid)
        }
      }
    }

    // Regular leave balance validation - Only restrict for fractional balance scenarios
    if (selectedLeave && !compOffLeaveEligibility && accrualLeaveBalance) {
      const accrualRecord = accrualLeaveBalance.find(
        (balance) => balance.leaveConfigId === selectedLeave.leaveConfigId
      );

      if (accrualRecord) {
        const availableDays = accrualRecord.availableLeaves || 0;
        const requestedDays = formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY ? 0.5 : 1;

        // Only restrict if:
        // 1. Requesting full day (not half day)
        // 2. Available balance is fractional (has 0.5)
        // 3. Requested days > available balance
        if (formData.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE && requestedDays > availableDays) {
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

            newErrors.attendanceStatus = `You have only ${availableDays} ${availableDays === 0.5 ? 'day' : 'days'} ${selectedLeave.leaveType} balance. Please select "Half Day" instead.${suggestion}`;
          }
          // If balance is not fractional (0, 1, 2, etc.) or insufficient, allow it (will be unpaid)
        }
      }
    }

    if (
      selectedLeave &&
      selectedLeave.isReasonRequired &&
      !formData.remarks.trim()
    ) {
      newErrors.remarks = "Remarks are required for this leave type";
    }

    // CDL Validation - Skip for half day attendance
    if (formData.leaveConfigId && formData.attendanceStatus !== ATTENDANCE_STATUS.HALF_DAY && !validateCDL()) {
      const selectedLeave = allExisitingLeaves.find(leave => leave.leaveConfigId === formData.leaveConfigId);
      if (selectedLeave && selectedLeave.leaveType.toLowerCase() === 'sick' && !proofFile) {
        newErrors.proof = "Medical proof is required when CDL is reached";
      } else if (selectedLeave && selectedLeave.leaveType.toLowerCase() !== 'sick') {
        newErrors.leaveConfigId = "Cannot apply for this leave type - CDL reached";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (
      (formData.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE ||
        formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY) &&
      !empGender
    ) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "Please fill all the mandatory profile details to apply for leaves",
          severity: "error",
        },
      });
      return;
    }

    if (!validateForm()) return;

    let fileBase64 = null;

    if (proofFile) {
      try {
        dispatch({ type: "UPLOAD_PROOF_DOCUMENTS" });

        // Use base64 data instead of uploading to Azure
        if (proofFile?.base64Data) {
          fileBase64 = proofFile?.base64Data;
        } else {
          const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
          const fileData = await convertFileToBase64(proofFile, maxSizeInBytes);
          fileBase64 = fileData?.base64;
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

    setIsLoading(true);
    try {
      const attendanceData = {
        ...formData,
        empUuid: currentEmployeeDetails.employeeBasicDetails?.empUuid || "",
        attachmentPath: fileBase64 ? JSON.stringify([{
          base64: fileBase64,
          fileName: proofFile.name,
          fileType: proofFile.type,
          fileSize: proofFile.size,
          uploadTimestamp: new Date().toISOString()
        }]) : null,
      };

      const isUpdate = existingAttendance && existingAttendance.attendanceId;

      if (
        attendanceData.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE ||
        attendanceData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY
      ) {
        const transformedData = {
          ...attendanceData,
          startDate: selectedDate.dateString,
          endDate: selectedDate.dateString,
          unpaidLeaveConfigId:
            allExisitingLeaves.find(
              (unpaid) => unpaid.leaveType.toLowerCase() === "unpaid"
            )?.leaveConfigId || "",
          isUpdate: isUpdate,
          attendanceId: isUpdate ? existingAttendance.attendanceId : undefined,
          leaveRequestId: isUpdate ? existingAttendance.leaveRequestId : undefined,
        };

        const isValid = validateSingleLeaveApplication(
          transformedData,
          allExisitingLeaves,
          setLeaveValidationError,
          allToolsAccessDetails?.[selectedToolName],
          hasAccessToEditAttendance,
        );

        if (!isValid) {
          return;
        }

        onSave(transformedData, setAttendanceMonth, setAttendanceYear);
      } else {
        // When changing from leave/half_day to working, set leaveRequestId to null
        const wasLeaveOrHalfDay = existingAttendance &&
          (existingAttendance.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE ||
            existingAttendance.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY);

        const transformedData = {
          ...attendanceData,
          attendanceDate: selectedDate.dateString,
          checkIn: toHHMMSS(formData.checkIn),
          checkOut: toHHMMSS(formData.checkOut),
          isUpdate: isUpdate,
          attendanceId: isUpdate ? existingAttendance.attendanceId : undefined,
          leaveRequestId: (isUpdate && wasLeaveOrHalfDay) ? null : undefined,
        };
        onSave(transformedData, setAttendanceMonth, setAttendanceYear);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (currentAttendance) => {
    const currentEmployeeId = currentEmployeeDetails.employeeBasicDetails?.empUuid;
    if (
      window.confirm("Are you sure you want to delete this attendance record?")
    ) {
      onDelete(currentAttendance?.attendanceId, setAttendanceMonth, setAttendanceYear, currentEmployeeId);
    }
  };

  const selectedLeave = availableLeaves.find(
    (leave) => leave.leaveConfigId === formData.leaveConfigId
  );

  // Check if full day leave is allowed based on balance - only restrict for fractional balance
  const canApplyFullDay = () => {
    if (!selectedLeave) return true;

    const isCompOff = selectedLeave.leaveType?.toLowerCase().includes('comp') ||
      selectedLeave.leaveType?.toLowerCase().includes('comp off');

    if (isCompOff && compOffLeaveEligibility) {
      const { availableCompOffCredit } = compOffLeaveEligibility;
      const fractionalPart = availableCompOffCredit - Math.floor(availableCompOffCredit);
      const hasFractionalBalance = fractionalPart === 0.5;

      // Only restrict if balance is fractional and less than 1 day
      if (hasFractionalBalance && availableCompOffCredit < 1) {
        return false;
      }
      return true;
    }

    if (!isCompOff && accrualLeaveBalance) {
      const accrualRecord = accrualLeaveBalance.find(
        (balance) => balance.leaveConfigId === selectedLeave.leaveConfigId
      );
      if (accrualRecord) {
        const availableDays = accrualRecord.availableLeaves || 0;
        const fractionalPart = availableDays - Math.floor(availableDays);
        const hasFractionalBalance = fractionalPart === 0.5;

        // Only restrict if balance is fractional and less than 1 day
        if (hasFractionalBalance && availableDays < 1) {
          return false;
        }
        return true;
      }
    }

    return true; // Default allow if no balance data
  };

  const isFullDayAllowed = canApplyFullDay();

  const handleDivClick = () => {
    if (formData.attendanceStatus === ATTENDANCE_STATUS.WORKING) {
      checkInInputRef.current?.focus();
      checkInInputRef.current?.showPicker?.();
    }
  };

  const handleCheckOutClick = () => {
    if (formData.attendanceStatus === ATTENDANCE_STATUS.WORKING) {
      checkOutInputRef.current?.focus();
      checkOutInputRef.current?.showPicker?.();
    }
  };

  return (
    <div className="edit-attendance-modal">
      <div className="edit-attendance-modal-content">
        <div className="edit-attendance-modal-header">
          <p>Edit Attendance</p>
          <div className="edit-attendance-close-button" onClick={onClose}>
            <img src={Cross_icon} alt="close" />
          </div>
        </div>
        <div className="modal-body">
          {/* Date Field */}
          <div className="form-group">
            <label>Date*</label>
            <div className="date-field">
              <span>{selectedDate.date.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Attendance Status */}
          <div className="form-group">
            <label>Attendance status* (select one)</label>
            <div className="status-options">
              {Object.values(ATTENDANCE_STATUS).map((status) => {
                const isOnLeave = status === ATTENDANCE_STATUS.ON_LEAVE;
                const isBalanceDisabled = isOnLeave && selectedLeave && !isFullDayAllowed;
                const isDisabled = isViewOnly || isBalanceDisabled;
                const disabledTitle = isViewOnly
                  ? "You do not have permission to edit attendance for this employee"
                  : isBalanceDisabled
                    ? selectedLeave && (selectedLeave.leaveType?.toLowerCase().includes('comp') || selectedLeave.leaveType?.toLowerCase().includes('comp off'))
                      ? compOffLeaveEligibility
                        ? `You have only ${compOffLeaveEligibility.availableCompOffCredit} ${compOffLeaveEligibility.availableCompOffCredit === 0.5 ? 'day' : 'days'} balance. Please select "Half Day" instead.`
                        : "Insufficient balance for full day leave"
                      : accrualLeaveBalance?.find(b => b.leaveConfigId === selectedLeave.leaveConfigId)
                        ? `You have only ${accrualLeaveBalance.find(b => b.leaveConfigId === selectedLeave.leaveConfigId).availableLeaves} ${accrualLeaveBalance.find(b => b.leaveConfigId === selectedLeave.leaveConfigId).availableLeaves === 0.5 ? 'day' : 'days'} balance. Please select "Half Day" instead.`
                        : "Insufficient balance for full day leave"
                    : "";

                return (
                  <button
                    key={status}
                    className={`${formData.attendanceStatus === status ? "active" : ""
                      } ${errors.attendanceStatus ? "error" : ""} ${isDisabled ? "disabled" : ""
                      }`}
                    onClick={() => handleStatusChange(status)}
                    disabled={isDisabled}
                    title={disabledTitle}
                  >
                    {status
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                );
              })}
            </div>
            {errors.attendanceStatus && (
              <p className="validation-error">{errors.attendanceStatus}</p>
            )}
          </div>

          {/* Leave Type */}
          {(formData.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE ||
            formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY) && (
              <div className="form-group">
                <label>Leave type (select one)*</label>
                {cdlLoading ? <LoadingSpinner message="Loading Leave Options..." height="10vh" /> : (
                  <div className="leave-options">
                    <div className="leave-row">
                      {empGender
                        ? availableLeaves.map((leave) => {
                          const cdlAllowed = cdlData[leave?.leaveConfigId];
                          // Skip CDL check for half day attendance or admin users (access level >= 900) or users with edit permission
                          const isCdlDisabled = formData.attendanceStatus !== ATTENDANCE_STATUS.HALF_DAY &&
                            cdlAllowed === false &&
                            leave?.leaveType?.toLowerCase() !== 'sick' &&
                            !isSuperAdmin && !hasAccessToEditAttendance;
                          const isDisabled = isViewOnly || isCdlDisabled;

                          return (
                            <button
                              key={leave.leaveConfigId}
                              className={`${formData.leaveConfigId === leave.leaveConfigId
                                ? "active"
                                : ""
                                } ${errors.leaveConfigId ? "error" : ""} ${isDisabled ? "disabled" : ""
                                }`}
                              onClick={() => handleLeaveTypeChange(leave.leaveConfigId)}
                              disabled={isDisabled}
                              title={isViewOnly ? "You do not have permission to edit attendance for this employee" : (isCdlDisabled ? "CDL reached - Cannot apply for this leave type" : "")}
                            >
                              {leave.leaveType}
                              {formData.attendanceStatus !== ATTENDANCE_STATUS.HALF_DAY &&
                                cdlAllowed === false &&
                                leave.leaveType.toLowerCase() === 'sick'}
                            </button>
                          );
                        })
                        : null}
                    </div>
                  </div>)}
                {errors.leaveConfigId && (
                  <p className="validation-error">{errors.leaveConfigId}</p>
                )}
                {cdlError && (
                  <p className="validation-error">{cdlError}</p>
                )}
                {!empGender && (
                  <>
                    <p className="no-leaves-available">
                      Please fill all the mandatory profile details to apply for leaves
                    </p>
                    <Link
                      to={`/dashboard?employeeUuid=${currentEmployeeDetails?.employeeCurrentJobDetails?.empUuid}&showEmployeeDetails=true&isEditing=true&fromAttendance=true`}
                      className="profile-update-note">
                      <span className="update-link">click here</span> to update your profile.
                    </Link>
                  </>
                )}
                {empGender && availableLeaves.length === 0 && (
                  <p className="no-leaves-available">
                    No leave types available for your employee type and gender
                  </p>
                )}
              </div>
            )}

          {/* Proof Upload for Sick Leave when CDL is reached */}
          {!isSuperAdmin && !hasAccessToEditAttendance && showProofUpload && (
            <div className="file_upload_container">
              <label>Medical Proof* (Required when CDL is reached)</label>
              <input
                type="file"
                id="proofFile"
                name="proofFile"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleProofUpload}
                required
                style={{ display: "none" }}
              />

              {proofFile ? (
                // Show uploaded file details
                <div className="custom_file_Upload">
                  <div className="uploaded-file-row">
                    <div className="file-icon-container">
                      {isFilePDF(proofFile) ? (
                        <img src={PDF_icon} alt="PDF" className="file-type-icon" />
                      ) : (
                        <img src={Image_icon} alt="Image" className="file-type-icon" />
                      )}
                    </div>
                    <div className="file-name">{getFileDisplayName(proofFile)}</div>
                    <div className="file-meta">
                      {getFileDisplaySize(proofFile)} KB | {getFileDisplayType(proofFile)}
                    </div>
                    <button
                      type="button"
                      className="delete-file-btn"
                      onClick={() => {
                        setProofFile(null);
                        // Reset the file input
                        const fileInput = document.getElementById('proofFile');
                        if (fileInput) {
                          fileInput.value = '';
                        }
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
                </div>
              ) : (
                // Show choose file option
                <label htmlFor="proofFile" className="custom_file_Upload clickable">
                  <div className="file-upload-label">
                    <img src={Image_icon} alt="Upload" className="upload-icon" />
                    Choose file
                  </div>
                </label>
              )}

              {errors.proof && (
                <span className="error">{errors.proof}</span>
              )}
              {!proofFile && <small className="file-note">
                Upload JPG, PNG, or PDF (max 10 MB)
              </small>}
            </div>
          )}

          {/* Time Inputs */}
          {(formData.attendanceStatus === ATTENDANCE_STATUS.WORKING ||
            formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY) && (
              <div className="time-inputs">
                <div className="form-group" onClick={handleDivClick} style={{ cursor: 'pointer' }}>
                  <label>
                    Check-in
                    {formData.attendanceStatus === ATTENDANCE_STATUS.WORKING
                      ? "*"
                      : ""}
                  </label>
                  <input
                    ref={checkInInputRef}
                    type="time"
                    className={errors.checkIn ? "error" : ""}
                    value={formData.checkIn}
                    onChange={(e) => handleInputChange("checkIn", e.target.value)}
                    disabled={
                      isViewOnly || formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY || (!isSuperAdmin && !hasAccessToEditAttendance && formData.attendanceStatus === ATTENDANCE_STATUS.WORKING)
                    }
                  />
                  {errors.checkIn && (
                    <p className="validation-error">{errors.checkIn}</p>
                  )}
                </div>
                <div className="form-group" onClick={handleCheckOutClick} style={{ cursor: 'pointer' }}>
                  <label>
                    Check-out
                    {formData.attendanceStatus === ATTENDANCE_STATUS.WORKING
                      ? "*"
                      : ""}
                  </label>
                  <input
                    ref={checkOutInputRef}
                    type="time"
                    className={errors.checkOut ? "error" : ""}
                    value={formData.checkOut}
                    onChange={(e) =>
                      handleInputChange("checkOut", e.target.value)
                    }
                    disabled={
                      isViewOnly || formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY || (!isSuperAdmin && !hasAccessToEditAttendance && formData.attendanceStatus === ATTENDANCE_STATUS.WORKING)
                    }
                  />
                  {errors.checkOut && (
                    <p className="validation-error">{errors.checkOut}</p>
                  )}
                </div>
              </div>
            )}

          {/* Remarks */}
          <div className="form-group">
            <label>
              Remarks
              {selectedLeave && selectedLeave.isReasonRequired ? "*" : ""}
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="A short, optional description of your day"
              className={errors.remarks ? "error" : ""}
              disabled={isViewOnly}
            />
            {errors.remarks && (
              <p className="validation-error">{errors.remarks}</p>
            )}
          </div>

          {/* Leave Balance Info */}
          {selectedLeave &&
            (formData.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE ||
              formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY) &&
            (() => {
              const isCompOff = selectedLeave.leaveType?.toLowerCase().includes('comp') ||
                selectedLeave.leaveType?.toLowerCase().includes('comp off');

              // Show comp off eligibility if comp off is selected
              if (isCompOff) {
                if (compOffLeaveEligibilityLoading) {
                  return (
                    <div className="application-status info">
                      <LoadingSpinner message="Loading comp off eligibility..." height="10vh" />
                    </div>
                  );
                }

                if (compOffLeaveEligibility) {
                  const { paidDays, unpaidDays, availableCompOffCredit, isEligible, validations, totalDays } = compOffLeaveEligibility;
                  const requestedDays = formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY ? 0.5 : totalDays;

                  return (
                    <div className={`application-status ${isEligible ? "info" : "warning"}`}>
                      <div className="status-header">
                        <p className="status-message">
                          Application For {selectedLeave.leaveType}: {requestedDays}{" "}
                          {requestedDays === 1 ? "day" : "days"}
                        </p>
                      </div>
                      <div className="status-info">
                        <p className="balance-summary">
                          Available Comp Off Credit: {availableCompOffCredit} days
                        </p>
                      </div>
                      {unpaidDays > 0 && (
                        <div className="status-alert">
                          <p className="warning-text">
                            {paidDays > 0 ? `${paidDays} ${paidDays === 1 ? "day" : "days"} as paid leave (comp off), ` : ""}
                            {unpaidDays} {unpaidDays === 1 ? "day" : "days"} will be converted to unpaid leave
                          </p>
                        </div>
                      )}
                      {unpaidDays === 0 && paidDays > 0 && (
                        <div className="status-info">
                          <p className="success-text">
                            {paidDays} {paidDays === 1 ? "day" : "days"} will be as paid leave (comp off)
                          </p>
                        </div>
                      )}
                      {validations && allToolsAccessDetails?.[selectedToolName] < 900 && (
                        <div className="status-alert">
                          {!validations.noticePeriod.valid && validations.noticePeriod.message && (
                            <p className="warning-text">{validations.noticePeriod.message}</p>
                          )}
                          {!validations.continuousLeaveLimit.valid && validations.continuousLeaveLimit.message && (
                            <p className="warning-text">{validations.continuousLeaveLimit.message}</p>
                          )}
                          {!validations.overlappingLeaves.valid && validations.overlappingLeaves.message && (
                            <p className="warning-text">{validations.overlappingLeaves.message}</p>
                          )}
                        </div>
                      )}
                      {leaveValidationError && (
                        <div className="status-alert">
                          <p className="warning-text">
                            {leaveValidationError}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              }

              // Regular leave balance display (non-comp off)
              // Fiscal Year Validation
              const conversionDate = new Date(currentEmployeeDetails?.employeeCurrentJobDetails?.empConversionDate);
              const selectedDateObj = new Date(selectedDate.dateString);

              // Calculate fiscal year boundaries for selected date
              const conversionDay = conversionDate.getDate();
              const conversionMonth = conversionDate.getMonth();
              const selectedYear = selectedDateObj.getFullYear();

              let fiscalYearStart = new Date(selectedYear, conversionMonth, conversionDay);
              if (selectedDateObj < fiscalYearStart) {
                fiscalYearStart = new Date(selectedYear - 1, conversionMonth, conversionDay);
              }

              const fiscalYearEnd = new Date(fiscalYearStart);
              fiscalYearEnd.setFullYear(fiscalYearEnd.getFullYear() + 1);
              fiscalYearEnd.setDate(fiscalYearEnd.getDate() - 1);

              // Check if selected date is outside fiscal year boundaries
              const isOutsideFiscalYear = selectedDateObj < fiscalYearStart || selectedDateObj > fiscalYearEnd;

              if (isOutsideFiscalYear) {
                return (
                  <div className="application-status warning">
                    <div className="status-header">
                      <p className="status-message">Invalid Date Selection</p>
                    </div>
                    <div className="status-alert">
                      <p className="warning-text">
                        Cannot apply leave outside fiscal year boundaries.
                        Current fiscal year: {fiscalYearStart.toLocaleDateString()} to {fiscalYearEnd.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              }

              // Find accrual record for this leave configuration
              const accrualRecord = accrualLeaveBalance?.find(
                (balance) => balance.leaveConfigId === selectedLeave.leaveConfigId
              );

              // Use accrual data if available, otherwise fallback to legacy
              const totalAlloted = accrualRecord ? accrualRecord.totalAllotedLeaves : selectedLeave.totalAllotedLeaves;
              const accruedLeaves = accrualRecord ? accrualRecord.accruedLeaves : totalAlloted;
              const usedDays = accrualRecord ? parseFloat(accrualRecord.totalUsedLeaves) : 0;
              const availableDays = accrualRecord ? accrualRecord.availableLeaves :
                Math.max(0, totalAlloted - usedDays);

              const requestedDays =
                formData.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY
                  ? 0.5
                  : 1;

              // Check if the selected leave type is "Unpaid"
              const isUnpaidLeave = selectedLeave.leaveType?.toLowerCase() === "unpaid";

              const isExceeding = availableDays <= 0 || requestedDays > availableDays;

              // Calculate paid and unpaid days
              const paidDays = Math.min(requestedDays, availableDays);
              const unpaidDays = Math.max(0, requestedDays - availableDays);

              // Check if this is historical data
              const isHistoricalData = accrualRecord?.targetDate && new Date(accrualRecord.targetDate) < new Date();

              // If unpaid leave is selected, always show as warning (red)
              const statusClassName = isUnpaidLeave ? "warning" : (isExceeding ? "warning" : "info");

              return (
                <div
                  className={`application-status ${statusClassName}`}
                >
                  <div className="status-header">
                    <p className="status-message">
                      Application For {selectedLeave.leaveType}: {requestedDays}{" "}
                      {requestedDays === 1 ? "day" : "days"}
                      {accrualRecord?.fiscalYear && (
                        <span className="fiscal-year-info"> (FY: {accrualRecord.fiscalYear})</span>
                      )}
                    </p>
                  </div>
                  <div className="status-info">
                    <p className="balance-summary">
                      Total: {totalAlloted} days | Accrued: {accruedLeaves} days | Used:{" "}
                      {usedDays} days | Available: {availableDays} days
                      {isHistoricalData ? ' (as of selected date)' : ''}
                    </p>
                  </div>
                  {isUnpaidLeave ? (
                    // Show unpaid leave message in red/warning style
                    <div className="status-alert">
                      <p className="warning-text">
                        {requestedDays} {requestedDays === 1 ? "day" : "days"} will be as unpaid leave
                      </p>
                    </div>
                  ) : (
                    <>
                      {isExceeding && (
                        <div className="status-alert">
                          <p className="warning-text">
                            {paidDays > 0 ? `${paidDays} ${paidDays === 1 ? "day" : "days"} as paid leave, ` : ""}
                            {unpaidDays} {unpaidDays === 1 ? "day" : "days"} will be converted to unpaid leave
                          </p>
                        </div>
                      )}
                      {!isExceeding && paidDays > 0 && (
                        <div className="status-info">
                          <p className="success-text">
                            {paidDays} {paidDays === 1 ? "day" : "days"} will be as paid leave
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {leaveValidationError && (
                    <div className="status-alert">
                      <p className="warning-text">
                        {leaveValidationError}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

          {/* Form Actions */}
          <div className="form-actions">
            {existingAttendance ? (
              <button
                type="button"
                className={`delete-button ${(isViewOnly || existingAttendance.attendanceStatus !== "working") ? "disabled" : ""}`}
                onClick={() => handleDelete(existingAttendance)}
                disabled={isViewOnly || existingAttendance.attendanceStatus !== "working"}
                title={isViewOnly ? "You do not have permission to delete attendance for this employee" : ""}
              >
                Delete
              </button>
            ) : (
              <button
                type="button"
                className="delete-button"
                onClick={onClose}
              >
                Cancel
              </button>
            )}
            {!isViewOnly && (
              <button
                type="button"
                className="update-button"
                onClick={handleSubmit}
                disabled={isLoading || cdlLoading}
              >
                {loading || isLoading
                  ? "Saving..."
                  : existingAttendance
                    ? "Update Attendance"
                    : "Save Attendance"}
              </button>
            )}
            {isViewOnly && (
              <button
                type="button"
                className="update-button disabled"
                disabled
                title="You do not have permission to edit attendance for this employee"
              >
                View Only
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}