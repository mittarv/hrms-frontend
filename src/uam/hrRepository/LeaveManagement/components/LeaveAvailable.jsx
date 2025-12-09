import "../styles/LeaveAvailable.scss";
import { useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Handles decimal leave values according to specific rules:
 * Exact 0.5: Shows as 0.5 usable (no carry forward)
 * Case 1 (< 0.5): Only integer value displayed, remainder noted as carried forward
 * Case 2 (> 0.5): Integer + 0.5 displayed, remainder noted as carried forward
 */
const handleDecimalLeaveDisplay = (decimalValue) => {
  if (typeof decimalValue !== 'number' || isNaN(decimalValue)) {
    return { displayValue: 0, carryForward: 0, hasCarryForward: false };
  }

  const integerPart = Math.floor(decimalValue);
  const decimalPart = decimalValue - integerPart;
  
  let displayValue;
  let carryForward;
  
  if (decimalPart === 0.5) {
    // Exact 0.5: Shows as 0.5 usable (no carry forward)
    displayValue = integerPart + 0.5;
    carryForward = 0;
  } else if (decimalPart < 0.5) {
    // Case 1: < 0.5 - Only integer value displayed
    displayValue = integerPart;
    carryForward = decimalPart;
  } else {
    // Case 2: > 0.5 - Integer + 0.5 displayed  
    displayValue = integerPart + 0.5;
    carryForward = decimalPart - 0.5;
  }
  
  return {
    displayValue: Number(displayValue.toFixed(1)),
    carryForward: Number(carryForward.toFixed(1)),
    hasCarryForward: carryForward > 0,
    originalValue: decimalValue
  };
};

const LeaveAvailable = () => {
  const { currentEmployeeDetails, policy, empFiscalYear, accrualLeaveBalance } = useSelector(
    state => state.hrRepositoryReducer
  );
  const [policyLink, setPolicyLink] = useState("");



useEffect(() => {
    if (policy) {
      const policyLink = policy.find((link) => link.policyName.toLowerCase() === "leave and holiday policy");
      setPolicyLink(policyLink ? policyLink.policyLink : "");
    }
  }, [policy]);

  // Calculate applicable leaves for the current employee
  const applicableLeaves = useMemo(() => {
    return accrualLeaveBalance.map(leave => {
      const accrualRecord = leave;

      // Use accrual data if available, otherwise fallback to legacy
      const totalAllocated = accrualRecord ? accrualRecord?.totalAllotedLeaves : 0;
      const accruedLeaves = accrualRecord ? accrualRecord?.accruedLeaves : totalAllocated;
      const rawTotalLeft = accrualRecord && accrualRecord?.availableLeaves;
      const totalUsed = accrualRecord && accrualRecord?.totalUsedLeaves;
      
      // **DECIMAL LEAVE HANDLING** - Apply decimal rules to displayed values
      const totalLeftHandling = handleDecimalLeaveDisplay(rawTotalLeft);
      const accruedLeavesHandling = handleDecimalLeaveDisplay(accruedLeaves);
      
      // Display processed values according to decimal rules
      const totalLeft = totalLeftHandling?.displayValue;
      const processedAccruedLeaves = accruedLeavesHandling?.displayValue;
      
      return {
        ...leave,
        totalAllocated,
        accruedLeaves: processedAccruedLeaves,
        totalUsed,
        totalLeft,
        isAccrualSystem: !!accrualRecord,
        // Decimal handling information for tooltips/details
        decimalInfo: {
          totalLeft: totalLeftHandling,
          accrued: accruedLeavesHandling,
          rawValues: {
            totalLeft: rawTotalLeft,
            accrued: accruedLeaves
          }
        }
      };
    });
  }, [accrualLeaveBalance]);

const getFiscalYear = () => {
   // Check if hire date exists
   if (!currentEmployeeDetails?.employeeCurrentJobDetails?.empConversionDate) {
     return '';
   }

   const conversionDate = new Date(currentEmployeeDetails?.employeeCurrentJobDetails?.empConversionDate);
   
   // Check if joiningDate is valid
   if (isNaN(conversionDate.getTime())) {
     return '';
   }

   const startFiscalMonth = conversionDate.toLocaleString('default', { month: 'short' });
   
   // Check if startFiscalMonth is valid
   if (!startFiscalMonth) {
     return '';
   }

   const endFiscalDate = new Date(conversionDate);
   endFiscalDate.setMonth(endFiscalDate.getMonth() - 1);
   const endFiscalMonth = endFiscalDate.toLocaleString('default', { month: 'short' });
   
   // Check if endFiscalMonth is valid
   if (!endFiscalMonth) {
     return '';
   }

   const startFiscalYear = empFiscalYear;
   
   // Check if startFiscalYear exists
   if (!startFiscalYear) {
     return '';
   }

   const endFiscalYear = startFiscalYear + 1;
 
   // Check if endFiscalYear is valid
   if (!endFiscalYear) {
     return '';
   }
   
   return `(${startFiscalMonth} ${startFiscalYear} - ${endFiscalMonth} ${endFiscalYear})`;
};

  // Check if gender is missing
  const empGender = currentEmployeeDetails?.employeeBasicDetails?.empGender;
  const employeeId = currentEmployeeDetails?.employeeBasicDetails?.empUuid;
  if (!empGender) {
    return (
      <div className="leaves-table-container">
        <p className="leaves-title">Leaves Available {getFiscalYear()}</p>
        <p className="gender-missing-message">
          Please fill all the mandatory profile details to apply for leaves
        </p>
        <Link
          to = {`/dashboard?employeeUuid=${employeeId}&showEmployeeDetails=true&isEditing=true&fromAttendance=true`}
          className="profile-update-note">
           <span className="update-link">click here</span> to update your profile.
        </Link>
      </div>
    );
  }

  if (!applicableLeaves.length) {
    return (
      <div className="leaves-table-container">
        <p className="leaves-title">Leaves Available {getFiscalYear()}</p>
        <p>No leave data available for this employee.</p>
      </div>
    );
  }

  return (
    <div className="leaves-table-container">
      <p className="leaves-title">Leaves Available {getFiscalYear()}</p>
      <div className="leaves-table">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Total Leaves</th>
              <th>Allotted Leaves</th>
              <th>Leaves Taken</th>
              <th>Leaves Left</th>
            </tr>
          </thead>
          <tbody>
            {applicableLeaves.map((leave, index) => (
              <tr key={leave.leaveConfigId || index}>
                <td>{leave.leaveType}</td>
                <td>{leave.totalAllocated}</td>
                <td>
                  {leave.accruedLeaves}
                  {leave.decimalInfo?.accrued?.hasCarryForward && (
                    <span 
                      className="decimal-info" 
                      title={`${leave.decimalInfo.accrued.carryForward} will be carried forward to next cycle`}
                    >
                      *
                    </span>
                  )}
                </td>
                <td>{leave.totalUsed}</td>
                <td>
                  {leave.totalLeft}
                  {leave.decimalInfo?.totalLeft?.hasCarryForward && (
                    <span 
                      className="decimal-info" 
                      title={`${leave.decimalInfo.totalLeft.carryForward} will be carried forward to next cycle`}
                    >
                      *
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mobile-cards">
          {applicableLeaves.map((leave, index) => (
            <div className="leave-card" key={leave.leaveConfigId || index}>
              <div className="leave-type">{leave.leaveType}</div>
              <div className="leave-details">
                <div className="leave-item">
                  <span className="label">Total:</span>
                  <span className="value">{leave.totalAllocated}</span>
                </div>
                <div className="leave-item">
                  <span className="label">Accrued:</span>
                  <span className="value">
                    {leave.accruedLeaves}
                    {leave.decimalInfo?.accrued?.hasCarryForward && (
                      <span 
                        className="decimal-info" 
                        title={`${leave.decimalInfo.accrued.carryForward} will be carried forward to next cycle`}
                      >
                        *
                      </span>
                    )}
                  </span>
                </div>
                <div className="leave-item">
                  <span className="label">Taken:</span>
                  <span className="value">{leave.totalUsed}</span>
                </div>
                <div className="leave-item">
                  <span className="label">Left:</span>
                  <span className="value">
                    {leave.totalLeft}
                    {leave.decimalInfo?.totalLeft?.hasCarryForward && (
                      <span 
                        className="decimal-info" 
                        title={`${leave.decimalInfo.totalLeft.carryForward} will be carried forward to next cycle`}
                      >
                        *
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="policy-note">
        *Please refer to the{" "}
        <a 
          href={policyLink}
          className="policy-link" 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()}>
          Leave and Holiday Policy
        </a>{" "}
        for further details regarding the number of leaves applicable to you.
      </p>
    </div>
  );
};

export default LeaveAvailable;