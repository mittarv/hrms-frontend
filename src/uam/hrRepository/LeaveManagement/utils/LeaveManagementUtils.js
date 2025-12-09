// Calculate working days (excluding weekends if required)
const calculateWorkingDays = (start, end, excludeWeekends = false) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate)) return 0;
  
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

export const validateBulkLeave = (formData, allExistingLeaves, cdlData, userToolAccess = 100, userAccess, accrualLeaveBalance = null) => {
  const messages = {};
  const selectedLeaveConfig = allExistingLeaves?.find(
    (leave) => leave.leaveType === formData.leaveType
  );

  if (!selectedLeaveConfig || !formData.startDate || !formData.endDate) {
    return { messages: {}, isValid: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const isLeaveInPast = startDate < today;
  const isLeaveInFuture = startDate > today;
  const isLeaveToday = startDate.getTime() === today.getTime();

  // Calculate leave duration
  const workingDays = calculateWorkingDays(
    startDate, 
    endDate, 
    selectedLeaveConfig.excludePaidWeekend
  );
  const actualDays = formData.isHalfDay ? 0.5 : workingDays;

  // Apply validations for normal users (userType === 100), no validations for admin (userType > 100)
  if (userToolAccess < 500) {
    // 1. Minimum Notice Period Validation (for future leaves)
    if ((isLeaveInFuture || isLeaveToday) && selectedLeaveConfig.minimumNoticePeriod > 0) {
      const daysDifference = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
      if (daysDifference < selectedLeaveConfig.minimumNoticePeriod) {
        messages.minimumNotice = `You must apply at least ${selectedLeaveConfig.minimumNoticePeriod} days before the leave start date. Current gap: ${daysDifference} days.`;
      }
    }

    // 2. Maximum Notice Period Validation (for past leaves)
    if (isLeaveInPast && selectedLeaveConfig.maximumNoticePeriod >= 0) {
      const daysDifference = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
      if (selectedLeaveConfig.maximumNoticePeriod === 0) {
        if (!isLeaveToday) {
          messages.maximumNotice = `Past leaves can only be applied on the same day.`;
        }
      } else if (daysDifference > selectedLeaveConfig.maximumNoticePeriod) {
        messages.maximumNotice = `You can apply for past leave within ${selectedLeaveConfig.maximumNoticePeriod} days after the leave start date. Current gap: ${daysDifference} days.`;
      }
    }

    // 3. Continuous Leave Limit Validation - Always check for all leaves
    if (actualDays > selectedLeaveConfig.continuousLeavesLimit) {
      if (formData.leaveType.toLowerCase() === 'sick') {
        messages.continuousLimit = `Sick leave exceeds ${selectedLeaveConfig.continuousLeavesLimit} days limit. Medical certificate required.`;
        messages.proofRequired = true;
      } else {
        messages.continuousLimit = `Leave duration (${actualDays} days) exceeds continuous leave limit of ${selectedLeaveConfig.continuousLeavesLimit} days.`;
      }
    }

    // 4. CDL validation - Check if CDL allows leave application
    if (cdlData && selectedLeaveConfig?.leaveConfigId) {
      const leaveConfigId = selectedLeaveConfig.leaveConfigId;
      const isCdlBlocked = cdlData[leaveConfigId] === false;

      
      if (isCdlBlocked) {
        if (formData.leaveType.toLowerCase() === 'sick') {
          // Sick leave is allowed but proof is mandatory when CDL is blocked
          messages.proofRequired = true;
          messages.continuousLimit = `Medical certificate is mandatory for ${formData.leaveType} leave due to CDL restrictions.`;
        } else {
          // Non-sick leaves are completely blocked when CDL is blocked
          messages.cdlBlocked = true;
          messages.continuousLimit = `Application not allowed for ${formData.leaveType} leave due to continuous leave limit (CDL) restrictions.`;
        }
      }
    }
  }
  // No validations for admin users (userType > 100)

  // Calculate paid/unpaid days - Show for all users including admin
  // Try to use accrual data first, fallback to legacy balance details
  const accrualRecord = accrualLeaveBalance?.find(
    (balance) => balance.leaveConfigId === selectedLeaveConfig.leaveConfigId
  );

  // Use accrual data if available, otherwise fallback to legacy
  const totalAllotted = selectedLeaveConfig.totalAllotedLeaves;
  const accruedLeaves = accrualRecord ? accrualRecord.accruedLeaves : totalAllotted;
  const usedDays = accrualRecord ? parseFloat(accrualRecord.totalUsedLeaves) : 0
  const availableBalance = accrualRecord ? accrualRecord.availableLeaves : 
                          Math.max(0, totalAllotted - usedDays);

  const paidDays = Math.min(actualDays, availableBalance);
  const unpaidDays = Math.max(0, actualDays - availableBalance);

  if (unpaidDays > 0) {
    messages.leaveBreakdown = `Total: ${actualDays} days | Paid: ${paidDays} days | Unpaid: ${unpaidDays} days`;
  } else {
    messages.leaveBreakdown = `Total: ${actualDays} days (all paid)`;
  }
  
  // Return validation result - consider all validation errors including CDL
  const isValid = !messages.minimumNotice && !messages.maximumNotice && 
         !(messages.continuousLimit && formData.leaveType.toLowerCase() !== 'sick' && !messages.proofRequired) &&
         !messages.cdlBlocked;
  
  return { 
    messages, 
    isValid, 
    calculatedData: {
      actualDays,
      paidDays,
      unpaidDays,
      availableBalance,
      usedDays,
      totalAllotted,
      accruedLeaves
    }
  };
};

// Filter leaves based on employee type and gender
export const getApplicableLeaves = (allExistingLeaves, employeeType, empGender) => {
  if (!allExistingLeaves || !employeeType || !empGender) {
    return [];
  }

  return allExistingLeaves
    .filter((leave) => leave.isActive)
    .filter((leave) => {
      try {
        const allowedTypes = JSON.parse(leave.employeeType);
        const allowedGenders = JSON.parse(leave.appliedGender);
          return (
            allowedTypes.includes(employeeType) && allowedGenders.includes(empGender)
          );
      } catch (error) {
        console.error("Error parsing employeeType or appliedGender:", error);
        return false;
      }
    });
};

// Check if half-day option is allowed for the selected leave type
export const isHalfDayAllowed = (leaveType, allExistingLeaves) => {
  if (!leaveType) return false;
  const selectedLeaveConfig = allExistingLeaves?.find(
    (leave) => leave.leaveType === leaveType
  );
  return selectedLeaveConfig?.isHalfDayAllowed || false;
};

// Check if reason is required for the selected leave type
export const isReasonRequired = (leaveType, allExistingLeaves) => {
  if (!leaveType) return true;
  const selectedLeaveConfig = allExistingLeaves?.find(
    (leave) => leave.leaveType === leaveType
  );
  return selectedLeaveConfig?.isReasonRequired || false;
};

export const validateSingleLeaveApplication = (attendanceData, allExistingLeaves, setLeaveValidationError, userType = 100) => {
  try {
    const { leaveConfigId, startDate, endDate } = attendanceData;
    
    if (!leaveConfigId || !startDate) {
      setLeaveValidationError("Leave configuration ID and start date are required");
      return false;
    }

    // Find the leave configuration from allExistingLeaves
    const leaveConfig = allExistingLeaves.find(leave => leave.leaveConfigId === leaveConfigId);
    
    if (!leaveConfig) {
      setLeaveValidationError("Leave configuration not found");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // Parse start and end dates
    const leaveStartDate = new Date(startDate);
    leaveStartDate.setHours(0, 0, 0, 0);
    
    const leaveEndDate = endDate ? new Date(endDate) : leaveStartDate;
    leaveEndDate.setHours(0, 0, 0, 0);

    // Calculate leave duration in days
    const leaveDurationInDays = Math.ceil((leaveEndDate - leaveStartDate) / (1000 * 60 * 60 * 24)) + 1;

    // Extract validation parameters from leave config
    const {
      minimumNoticePeriod,
      maximumNoticePeriod,
      continuousLeavesLimit,
      excludePaidWeekend
    } = leaveConfig;

    // NEW: Weekend validation check
    if (excludePaidWeekend === true) {
      const startDayOfWeek = leaveStartDate.getDay(); // 0 = Sunday, 6 = Saturday
      if (startDayOfWeek === 0 || startDayOfWeek === 6) {
        setLeaveValidationError("You cannot apply this leave on weekends (Saturday or Sunday)");
        return false;
      }
    }

    // If userType >= 500, skip all other validations
    if (userType >= 500) {
      setLeaveValidationError('');
      return true;
    }

    // 1. Check Continuous Leave Limit
    if (leaveDurationInDays > continuousLeavesLimit) {
      setLeaveValidationError(
        `Leave duration (${leaveDurationInDays} days) exceeds continuous leave limit of ${continuousLeavesLimit} days`
      );
      return false;
    }

    // Determine if this is a past leave or future leave
    const isPastLeave = leaveStartDate < today;
    const isTodayLeave = leaveStartDate.getTime() === today.getTime();
    const isFutureLeave = leaveStartDate > today;

    // 2. Notice Period Validation
    if (isPastLeave) {
      // For past leaves, check Maximum Notice Period
      const daysSinceLeave = Math.ceil((today - leaveStartDate) / (1000 * 60 * 60 * 24));
      
      if (maximumNoticePeriod === 0) {
        // Can only apply on the same day as leave
        setLeaveValidationError(
          `Cannot apply for past leave. Maximum notice period is 0 days - leave can only be applied on the same day`
        );
        return false;
      } else if (daysSinceLeave > maximumNoticePeriod) {
        setLeaveValidationError(
          `You can apply for past leave within ${maximumNoticePeriod} days after the leave start date. Current gap: ${daysSinceLeave} days`
        );
        return false;
      }
    } else if (isTodayLeave) {
      // For today's leave
      if (minimumNoticePeriod > 0) {
        setLeaveValidationError(
          `Cannot apply for today's leave. Minimum notice period of ${minimumNoticePeriod} days is required`
        );
        return false;
      }
    } else if (isFutureLeave) {
      // For future leaves, check Minimum Notice Period
      const daysUntilLeave = Math.ceil((leaveStartDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilLeave < minimumNoticePeriod) {
        setLeaveValidationError(
          `You must apply at least ${minimumNoticePeriod} days before the leave start date. Current gap: ${daysUntilLeave} days.`
        );
        return false;
      }
    }

    // If we reach here, validation passed - clear any previous errors
    setLeaveValidationError('');
    return true;
   
  } catch (error) {
    setLeaveValidationError(`Validation error: ${error.message}`);
    return false;
  }
};