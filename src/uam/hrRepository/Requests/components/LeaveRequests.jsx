import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAllPendingLeaveRequests,
  getAllEmployee,
  getAllLeaves,
  triggerProofRequiredForLeave,
  reviewLeaveRequest,
} from "../../../../actions/hrRepositoryAction";
import { useSelector, useDispatch } from "react-redux";
import "../styles/LeaveRequests.scss";
import Plus_icon from "../../../../assets/icons/plus_inside_circle.svg";
import FileViewer from "../../Common/components/FileViewerPop";
import View_Icon from "../../../../assets/icons/view_icon.svg";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import approve_icon from "../../../../assets/icons/approve_icon.svg";
import reject_icon_enable from "../../../../assets/icons/reject_icon_enable.svg";
import reject_icon_disable from "../../../../assets/icons/reject_icon_disable.svg";
import sort from "../../../../assets/icons/sort.svg";
import filter from "../../../../assets/icons/filter.svg";
// Define the ENUM for status
export const LeaveRequestStatus = {
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Table headers for leave requests
const LeaveRequestsTableHeader = [
  { name: "employeeUuid", label: "Employee" },
  { name: "requestedDate", label: "Requested On",icon: sort },
  { name: "leaveRequestId", label: "Leave Type",icon: filter },
  { name: "leaveDuration", label: "Leave Duration" },
  { name: "reason", label: "Reason" },
  { name: "proof", label: "Proof" },
];

const LeaveRequests = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [displayStartDate, setDisplayStartDate] = useState("");
  const [displayEndDate, setDisplayEndDate] = useState("");
  const [checkedRequestIds, setCheckedRequestIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const hrRepositoryReducer = useSelector(
    (state) => state?.hrRepositoryReducer
  );
  const loading = hrRepositoryReducer?.loading ?? false;
  const leavePendingRequests = useMemo(() => 
    hrRepositoryReducer?.leavePendingRequests ?? [], 
    [hrRepositoryReducer?.leavePendingRequests]
  );
  const allExistingRequests = useMemo(() => 
    hrRepositoryReducer?.allExisitingLeaves ?? [], 
    [hrRepositoryReducer?.allExisitingLeaves]
  );
  const allEmployeeDetails = useMemo(() => 
    hrRepositoryReducer?.allEmployees ?? [], 
    [hrRepositoryReducer?.allEmployees]
  );
  const { user } = useSelector((state) => state.user);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [filesToView, setFilesToView] = useState([]);
  const dispatch = useDispatch();

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    try {
      const parts = isoDate.split("-");
      if (!parts || parts.length !== 3) return "";
      const [year, month, day] = parts;
      if (!year || !month || !day) return "";
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return "";
    }
  };

  // Format date to readable format (e.g., "2 Apr 2025")
  const formatDateToReadable = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      const options = {
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      return date.toLocaleDateString("en-GB", options);
    } catch (error) {
      console.error("Error formatting readable date:", error);
      return "N/A";
    }
  };

  // Format leave duration
  const formatLeaveDuration = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";

    try {
      const start = formatDateToReadable(startDate);
      const end = formatDateToReadable(endDate);

      // If start and end dates are the same, show only one date
      if (startDate === endDate || start === end) {
        return start;
      }

      return `${start} - ${end}`;
    } catch (error) {
      console.error("Error formatting leave duration:", error);
      return "N/A";
    }
  }, []);

  const getEmployeeNameByUuid = (uuid) => {
    if (!uuid) return "Unknown";
    try {
      const employee = allEmployeeDetails.find(
        (emp) => emp.employeeUuid === uuid
      );
      return employee
        ? `${employee.employeeFirstName} ${employee.employeeLastName}`
        : "Unknown";
    } catch (error) {
      console.error("Error getting employee name by UUID:", error);
      return "Unknown";
    }
  };

  const getLeaveTypeByUuid = (uuid) => {
    if (!uuid) return "Unknown";
    try {
      const leaveType = allExistingRequests.find(
        (leave) => leave.leaveConfigId === uuid
      );
      return leaveType ? leaveType.leaveType : "Unknown";
    } catch (error) {
      console.error("Error getting leave type by UUID:", error);
      return "Unknown";
    }
  };
  // Format pending leave requests
  const formatPendingLeaveRequests = useCallback(() => {
    if (
      !Array.isArray(leavePendingRequests) ||
      leavePendingRequests.length === 0
    ) {
      return [];
    }

    try {
      return leavePendingRequests
        .map((request) => {
          if (!request) return null;

          // Format requested date
          let formattedRequestedDate = "N/A";
          try {
            if (request?.applicationDate) {
              const requestedDate = new Date(request.applicationDate);
              if (!isNaN(requestedDate?.getTime())) {
                formattedRequestedDate = `${String(
                  requestedDate.getDate()
                ).padStart(2, "0")}-${String(
                  requestedDate.getMonth() + 1
                ).padStart(2, "0")}-${requestedDate.getFullYear()}`;
              }
            }
          } catch (error) {
            console.error("Error formatting requested date:", error);
          }

          return {
            id:
              request?.leaveRequestId ??
              `unknown-${Math.random().toString(36).substring(2, 11)}`,
            employeeUuid: request?.empUuid ?? "Unknown",
            requestedDate: formattedRequestedDate,
            leaveConfigId: request?.leaveConfigId ?? "N/A",
            leaveDuration: formatLeaveDuration(
              request?.startDate,
              request?.endDate
            ),
            reason: request?.remarks ?? "N/A",
            approvalStatus: request?.approvalStatus ?? "Pending",
            attachmentPath: request?.attachmentPath ?? null,
            totalDays: request?.totalDays ?? "0",
            isHalfDay: request?.isHalfDay ?? false,
            // Keep the original request data for later use if needed
            originalRequest: request ?? {},
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Error in formatPendingLeaveRequests:", error);
      return [];
    }
  }, [leavePendingRequests, formatLeaveDuration]);

  // Fetch data when component mounts or dates change
  useEffect(() => {
    try {
      if (typeof dispatch === "function") {
        dispatch(getAllPendingLeaveRequests(startDate, endDate));
        dispatch(getAllEmployee());
        dispatch(getAllLeaves());
      }
    } catch (error) {
      console.error("Error dispatching get pending leave requests:", error);
    }
  }, [dispatch, startDate, endDate]);

  // Update display dates when the actual dates change
  useEffect(() => {
    try {
      setDisplayStartDate(formatDateForDisplay(startDate) ?? "");
      setDisplayEndDate(formatDateForDisplay(endDate) ?? "");
    } catch (error) {
      console.error("Error updating display dates:", error);
      setDisplayStartDate("");
      setDisplayEndDate("");
    }
  }, [startDate, endDate]);

  // Update selectAll state based on filtered requests
  useEffect(() => {
    try {
      const formattedRequests = formatPendingLeaveRequests();
      const filteredIds = Array.isArray(formattedRequests)
        ? formattedRequests
            .filter((request) => request && request.id)
            .map((request) => request.id)
        : [];

      const allSelected =
        filteredIds.length > 0 &&
        Array.isArray(checkedRequestIds) &&
        filteredIds.every((id) => checkedRequestIds.includes(id));

      setSelectAll(allSelected);
    } catch (error) {
      console.error("Error updating select all state:", error);
      setSelectAll(false);
    }
  }, [checkedRequestIds, leavePendingRequests, allExistingRequests, allEmployeeDetails, formatPendingLeaveRequests]);

  // Handle date changes
  const handleStartDateChange = (e) => {
    try {
      if (e && e.target) {
        setStartDate(e.target.value ?? "");
      }
    } catch (error) {
      console.error("Error handling start date change:", error);
      setStartDate("");
    }
  };

  const handleEndDateChange = (e) => {
    try {
      if (e && e.target) {
        setEndDate(e.target.value ?? "");
      }
    } catch (error) {
      console.error("Error handling end date change:", error);
      setEndDate("");
    }
  };

  const handleCheck = (request) => {
    try {
      if (!request || !request.id) return;

      setCheckedRequestIds((prevCheckedIds) => {
        const safeCheckedIds = Array.isArray(prevCheckedIds)
          ? prevCheckedIds
          : [];
        const requestId = request.id;

        const isAlreadyChecked = safeCheckedIds.includes(requestId);

        return isAlreadyChecked
          ? safeCheckedIds.filter((id) => id !== requestId)
          : [...safeCheckedIds, requestId];
      });
    } catch (error) {
      console.error("Error handling checkbox click:", error);
    }
  };

  const handleSelectAllClick = () => {
    try {
      if (selectAll) {
        setCheckedRequestIds([]);
      } else {
        const formattedRequests = formatPendingLeaveRequests();
        const allIds = formattedRequests
          .filter((request) => request && request.id)
          .map((request) => request.id);

        setCheckedRequestIds(allIds ?? []);
      }
      setSelectAll(!selectAll);
    } catch (error) {
      console.error("Error handling select all click:", error);
      setCheckedRequestIds([]);
      setSelectAll(false);
    }
  };

  const handleLeaveRequestApprove = () => {
    try {
      const safeCheckedIds = Array.isArray(checkedRequestIds)
        ? checkedRequestIds
        : [];
        const unpaidId = allExistingRequests.find(
            (unpaid) => unpaid.leaveType.toLowerCase() === "unpaid"
          )?.leaveConfigId || "";

      const leaveRequestsApproval = {
        leaveRequestIds: safeCheckedIds,
        action: LeaveRequestStatus.APPROVED,
        unpaidLeaveConfigId: unpaidId,
      };

      dispatch(
        reviewLeaveRequest(leaveRequestsApproval, user && user.employeeUuid)
      );
      setCheckedRequestIds([]);
    } catch (error) {
      console.error("Error handling leave request approval:", error);
    }
  };

  const handleLeaveRequestReject = () => {
    try {
      const safeCheckedIds = Array.isArray(checkedRequestIds)
        ? checkedRequestIds
        : [];

      const leaveRequestsRejection = {
        leaveRequestIds: safeCheckedIds,
        action: LeaveRequestStatus.REJECTED,
      };

      dispatch(
        reviewLeaveRequest(leaveRequestsRejection, user && user.employeeUuid)
      );
      setCheckedRequestIds([]);
    } catch (error) {
      console.error("Error handling leave request rejection:", error);
    }
  };

  // Helper function to check if a request is selected
  const isRequestChecked = (requestId) => {
    try {
      if (!requestId) return false;
      const safeCheckedIds = Array.isArray(checkedRequestIds)
        ? checkedRequestIds
        : [];
      return safeCheckedIds.includes(requestId);
    } catch (error) {
      console.error("Error checking if request is checked:", error);
      return false;
    }
  };

  // Handle request proof click
  const handleRequestProofClick = (leaveRequestId) => {
    dispatch(triggerProofRequiredForLeave(leaveRequestId));
  };

  // Helper function to convert Buffer to string
  const convertBufferToString = (bufferData) => {
    try {
      if (bufferData && typeof bufferData === "object" && bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
        // Convert Buffer data array to string
        const uint8Array = new Uint8Array(bufferData.data);
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(uint8Array);
      }
      return null;
    } catch (error) {
      console.error("Error converting Buffer to string:", error);
      return null;
    }
  };

  // Handle view proof click
  const handleViewProofClick = (attachmentPath) => {
    try {
      let validFiles = [];

      // Parse attachmentPath - it could be a Buffer, stringified JSON array, or direct base64 data
      let parsedAttachments = [];
      
      if (typeof attachmentPath === "string") {
        try {
          // Try to parse as JSON first (new format with base64 data)
          parsedAttachments = JSON.parse(attachmentPath);
        } catch {
          // If JSON parsing fails, treat it as a direct URL (legacy format)
          parsedAttachments = [attachmentPath];
        }
      } else if (attachmentPath && typeof attachmentPath === "object" && attachmentPath.type === "Buffer") {
        // Handle Buffer data from backend
        const bufferString = convertBufferToString(attachmentPath);
        if (bufferString) {
          try {
            parsedAttachments = JSON.parse(bufferString);
          } catch {
            parsedAttachments = [bufferString];
          }
        }
      } else if (Array.isArray(attachmentPath)) {
        parsedAttachments = attachmentPath;
      }

      // Process each attachment
      parsedAttachments.forEach((item, index) => {
        if (item && typeof item === "object" && item.base64) {
          // New format: base64 data with metadata
          validFiles.push({
            url: item.base64, // Use the base64 data URL
            fileName: item.fileName || `attachment_${index + 1}`,
            fileType: item.fileType || 'application/octet-stream',
            isBase64: true
          });
        } else if (item && typeof item === "string" && item.trim() !== "") {
          // Legacy format: direct URL or base64 string
          if (item.startsWith('data:')) {
            // Direct base64 data URL
            validFiles.push({
              url: item,
              fileName: `attachment_${index + 1}`,
              fileType: item.split(';')[0].split(':')[1] || 'application/octet-stream',
              isBase64: true
            });
          } else {
            // Regular URL
            validFiles.push({
              url: item,
              fileName: item.split('/').pop() || `attachment_${index + 1}`,
              fileType: 'application/octet-stream',
              isBase64: false
            });
          }
        }
      });

      if (validFiles.length === 0) {
        alert("No valid documents found to view.");
        return;
      }

      setFilesToView(validFiles);
      setViewerOpen(true);
    } catch (error) {
      console.error("Error opening document:", error);
      alert("An error occurred while trying to open the document.");
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setFilesToView([]);
  };

  // Render proof status with updated logic
  const renderProofStatus = (
    approvalStatus,
    attachmentPath,
    leaveRequestId
  ) => {
    // Parse attachmentPath if it's a stringified array, Buffer, or direct data
    let parsedAttachmentPath = [];
    let hasValidAttachments = false;
    
    if (typeof attachmentPath === "string") {
      try {
        parsedAttachmentPath = JSON.parse(attachmentPath);
        // Check if parsed data contains valid base64 attachments
        hasValidAttachments = Array.isArray(parsedAttachmentPath) && 
          parsedAttachmentPath.some(item => 
            item && (
              (typeof item === "object" && item.base64) || 
              (typeof item === "string" && item.trim() !== "")
            )
          );
      } catch {
        // If JSON parsing fails, check if it's a direct URL or base64 string
        hasValidAttachments = attachmentPath.trim() !== "";
        parsedAttachmentPath = hasValidAttachments ? [attachmentPath] : [];
      }
    } else if (attachmentPath && typeof attachmentPath === "object" && attachmentPath.type === "Buffer") {
      // Handle Buffer data from backend
      const bufferString = convertBufferToString(attachmentPath);
      if (bufferString) {
        try {
          parsedAttachmentPath = JSON.parse(bufferString);
          hasValidAttachments = Array.isArray(parsedAttachmentPath) && 
            parsedAttachmentPath.some(item => 
              item && (
                (typeof item === "object" && item.base64) || 
                (typeof item === "string" && item.trim() !== "")
              )
            );
        } catch {
          hasValidAttachments = bufferString.trim() !== "";
          parsedAttachmentPath = hasValidAttachments ? [bufferString] : [];
        }
      }
    } else if (Array.isArray(attachmentPath)) {
      parsedAttachmentPath = attachmentPath;
      hasValidAttachments = attachmentPath.some(item => 
        item && (
          (typeof item === "object" && item.base64) || 
          (typeof item === "string" && item.trim() !== "")
        )
      );
    }

    if (approvalStatus !== "proof_required" && !hasValidAttachments) {
      return (
        <button
          className="request-proof-button"
          onClick={() => handleRequestProofClick(leaveRequestId)}
        >
          <img src={Plus_icon} alt="plus" /> Request proof
        </button>
      );
    }

    if (approvalStatus === "proof_required") {
      return (
        <button className="proof-requested-button" disabled>
          Proof requested
        </button>
      );
    }

    if (approvalStatus === "pending" && hasValidAttachments) {
      return (
        <button
          className="view-proof-button"
          onClick={() => handleViewProofClick(attachmentPath)}
        >
          <img src={View_Icon} /> View proof
        </button>
      );
    }

    return "N/A";
  };

  // Get formatted requests
  const formattedRequests = formatPendingLeaveRequests();

  return (
    <div className="leave_requests_main_container">
      <div className="leave_requests_header">
        {/* Date filter */}
        <div className="date-filter">
          <div className="date-input">
            <label>From</label>
            <div className="custom-date-input">
              <input
                type="text"
                value={displayStartDate ?? ""}
                placeholder="DD/MM/YYYY"
                readOnly
              />
              <input
                type="date"
                onChange={handleStartDateChange}
                value={startDate ?? ""}
                max={endDate || undefined}
                style={{
                  opacity: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
          <div className="date-input">
            <label>To</label>
            <div className="custom-date-input">
              <input
                type="text"
                value={displayEndDate ?? ""}
                placeholder="DD/MM/YYYY"
                readOnly
              />
              <input
                type="date"
                onChange={handleEndDateChange}
                value={endDate ?? ""}
                min={startDate || undefined}
                style={{
                  opacity: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="leave_requests_action_buttons">
          <button
            className={`leave_requests_approve_button ${
              !Array.isArray(checkedRequestIds) ||
              checkedRequestIds.length === 0 ||
              leavePendingRequests.length <= 0
                ? "disabled"
                : ""
            }`}
            onClick={() => {
              if (
                Array.isArray(checkedRequestIds) &&
                checkedRequestIds.length > 0 &&
                leavePendingRequests.length > 0
              ) {
                handleLeaveRequestApprove();
              }
            }}
          >
            <span
              className={`${
                !Array.isArray(checkedRequestIds) ||
                checkedRequestIds.length === 0
                  ? "disabled"
                  : ""
              }`}
            >
              <img src={approve_icon} 
              alt="Approve Icon"
              className="approve_icon"/>
              Approve
            </span>
          </button>
          <button
            className={`leave_requests_reject_button ${
              !Array.isArray(checkedRequestIds) ||
              checkedRequestIds.length === 0
                ? "disabled"
                : ""
            }`}
            onClick={() => {
              if (
                Array.isArray(checkedRequestIds) &&
                checkedRequestIds.length > 0
              ) {
                handleLeaveRequestReject();
              }
            }}
          >
            <span>
              <img src={
                checkedRequestIds.length === 0
                  ? reject_icon_disable
                  : reject_icon_enable} 
              alt="Reject Icon"
              className="reject_icon"/>
              Reject
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
          <LoadingSpinner message="Loading Leave Requests..." height="40vh" />
      ) : !Array.isArray(formattedRequests) ||
        formattedRequests.length === 0 ? (
        <div className="no_leave_requests_message">
          {startDate || endDate
            ? "No pending leave requests between the selected dates."
            : "No pending leave requests available."}
        </div>
      ) : (
        <div className="leave_requests_table_container">
          <table className="leave_requests_table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input 
                    type="checkbox"
                    checked={selectAll ?? false}
                    onChange={handleSelectAllClick}
                  />
                </th>
                {LeaveRequestsTableHeader.map((header, index) => (
                  <th key={(header?.name ?? index) || `header-${index}`}>
                    {header?.label ?? ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(formattedRequests || []).map((request, index) => {
                if (!request) return null;
                const requestId = request.id ?? `request-${index}`;

                return (
                  <tr key={requestId || `row-${index}`} className={isRequestChecked(requestId) ? "checked-row" : ""}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={isRequestChecked(requestId) ?? false}
                        onChange={() => handleCheck(request)}
                      />
                    </td>
                    <td className="employee_name">
                      {getEmployeeNameByUuid(request.employeeUuid) ?? "N/A"}
                    </td>
                    <td>{request.requestedDate ?? "N/A"}</td>
                    <td>
                      {getLeaveTypeByUuid(request.leaveConfigId) ?? "N/A"}{" "}
                      {request.isHalfDay ? `(Half-Day)` : null}
                    </td>
                    <td>
                      <div className="leave-duration">
                        {request.leaveDuration ?? "N/A"}
                      </div>
                    </td>
                    
                    <td className="reason-cell">
                      <div className="reason-text">{request.reason ?? "N/A"}</div>
                    </td>
                    <td>
                      {renderProofStatus(
                        request.approvalStatus,
                        request.attachmentPath,
                        request.id
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <FileViewer
        fileUrls={filesToView}
        open={viewerOpen}
        onClose={handleCloseViewer}
        initialIndex={0}
      />
    </div>
  );
};

export default LeaveRequests;
