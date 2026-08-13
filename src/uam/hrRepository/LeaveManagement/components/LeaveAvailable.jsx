import "../styles/LeaveAvailable.scss";
import { useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const COMP_OFF_INFO_TEXT =
  "is a leave you earn by working on a holiday or weekend. Once your extra work is approved, you receive credits that can be used to take a paid leave. Ensure you use them before the expiry date shown in your policy.";
const COMP_OFF_INFO_PREVIEW_CHARS = 95;

const getCompOffInfoPreview = (text) => {
  const normalized = String(text || "").trim();

  if (!normalized) {
    return { preview: "", truncated: false };
  }

  if (normalized.length <= COMP_OFF_INFO_PREVIEW_CHARS) {
    return { preview: normalized, truncated: false };
  }

  const cutAt = normalized.lastIndexOf(" ", COMP_OFF_INFO_PREVIEW_CHARS);
  const safeCut = cutAt > 0 ? cutAt : COMP_OFF_INFO_PREVIEW_CHARS;

  return {
    preview: `${normalized.slice(0, safeCut).trim()}...`,
    truncated: true,
  };
};

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

const LeaveAvailable = ({ panelHeight }) => {
  const { currentEmployeeDetails, policy, empFiscalYear, accrualLeaveBalance, compOffleaveBalance } = useSelector(
    state => state.hrRepositoryReducer
  );
  const [policyLink, setPolicyLink] = useState("");
  const [showFullCompOffInfo, setShowFullCompOffInfo] = useState(false);

  const baseLeaves = useMemo(
    () => (Array.isArray(accrualLeaveBalance) ? accrualLeaveBalance : []),
    [accrualLeaveBalance]
  );
  const dynamicLeaves = useMemo(
    () => (Array.isArray(compOffleaveBalance) ? compOffleaveBalance : []),
    [compOffleaveBalance]
  );

  useEffect(() => {
    if (policy) {
      const policyLink = policy.find((link) => link.policyName.toLowerCase() === "leave and holiday policy");
      setPolicyLink(policyLink ? policyLink.policyLink : "");
    }
  }, [policy]);

  const buildLeaveMetrics = (leave, dynamicUpdate) => {
    // Used leaves should reduce available balance, never increase quota/allotment.
    const baseTotalAllocated = Number(leave?.totalAllotedLeaves) || 0;
    const baseAccruedLeaves = Number(leave?.accruedLeaves) || 0;
    const baseTotalUsed = Number(leave?.totalUsedLeaves) || 0;

    let totalAllocated = baseTotalAllocated;
    let accruedLeaves = baseAccruedLeaves;
    let totalUsed = baseTotalUsed;

    if (dynamicUpdate) {
      const dynamicUnusedCredits = Number(dynamicUpdate.totalAllotedLeaves) || 0;
      const dynamicUsedCredits = Number(dynamicUpdate.totalUsedLeaves) || 0;
      const dynamicTotalCredits = dynamicUnusedCredits + dynamicUsedCredits;
      if (dynamicTotalCredits > 0) {
        // For Comp Off, render from one consistent pool source:
        // total = unused + used, used = used, left = unused.
        totalAllocated = dynamicTotalCredits;
        accruedLeaves = dynamicTotalCredits;
        totalUsed = dynamicUsedCredits;
      }
    }

    const availableLeaves = Math.max(0, accruedLeaves - totalUsed);

    return {
      totalAllocated,
      accruedLeaves,
      totalUsed,
      availableLeaves,
    };
  };


const applicableLeaves = useMemo(() => {
  if (baseLeaves.length === 0) return [];
  return baseLeaves.map(leave => {
    const dynamicUpdate = dynamicLeaves.find(
      (d) => d.leaveConfigId === leave.leaveConfigId
    );
    const { totalAllocated, accruedLeaves, totalUsed, availableLeaves } = buildLeaveMetrics(leave, dynamicUpdate);
    const totalLeftHandling = handleDecimalLeaveDisplay(availableLeaves);
    const accruedLeavesHandling = handleDecimalLeaveDisplay(accruedLeaves);

    return {
      ...leave,
      totalAllocated,
      hasExpiry: leave.leaveExpiresAfter !== null && leave.leaveExpiresAfter !== undefined,
      accruedLeaves: accruedLeavesHandling.displayValue,
      totalUsed,
      totalLeft: totalLeftHandling.displayValue,
      isAccrualSystem: true,
      decimalInfo: {
        totalLeft: totalLeftHandling,
        accrued: accruedLeavesHandling,
        rawValues: {
          totalLeft: availableLeaves,
          accrued: accruedLeaves
        }
      }
    };
  }).filter(leave => leave.totalAllocated > 0);
}, [baseLeaves, dynamicLeaves]);

// Find the name of the leave that has an expiry (Comp Off)
const compOffLeaveName = useMemo(() => {
  const compLeave = applicableLeaves.find(leave => leave.hasExpiry);
  return compLeave ? compLeave.leaveType : "Comp Off";
}, [applicableLeaves]);

const hasCompOffData = useMemo(() => {
  // Check if any visible leave has an expiry (which signifies it is a Comp Off)
  return applicableLeaves.some(leave => leave.hasExpiry === true);
}, [applicableLeaves]);

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

   const startFiscalYear = Number(
     typeof empFiscalYear === 'object' && empFiscalYear !== null
       ? empFiscalYear.fiscalYear
       : empFiscalYear
   );
   
   // Check if startFiscalYear exists
   if (!startFiscalYear || Number.isNaN(startFiscalYear)) {
     return '';
   }

   const endFiscalYear = startFiscalYear + 1;
   
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

  const leavePanelStyle = panelHeight
    ? { "--leave-panel-height": `${panelHeight}px` }
    : undefined;
  const compOffInfoPreview = getCompOffInfoPreview(COMP_OFF_INFO_TEXT);

  return (
    <div className="leaves-table-container leaves-table-container--scrollable" style={leavePanelStyle}>
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
                <td>{leave.hasExpiry && <span>*</span>}{leave.leaveType}</td>
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
              <div className="leave-type">{leave.hasExpiry && <span>*</span>}{leave.leaveType}</div>
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
      {hasCompOffData && (
        <p className="policy-note policy-note--comp-off">
          <span className="compOffLeaveName">{`${compOffLeaveName} `}</span>
          <span className="comp-off-info-text">
            {showFullCompOffInfo ? COMP_OFF_INFO_TEXT : compOffInfoPreview.preview}
          </span>
          {compOffInfoPreview.truncated && (
            <button
              type="button"
              className="comp-off-view-more-btn"
              onClick={() => setShowFullCompOffInfo((prev) => !prev)}
            >
              {showFullCompOffInfo ? "View less" : "View more"}
            </button>
          )}
        </p>
      )}
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