import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAllPendingLeaveRequests,
  getAllHistoryLeaveRequests,
  getAllEmployee,
  getAllLeaves,
  triggerProofRequiredForLeave,
  reviewLeaveRequest,
} from "../../../../actions/hrRepositoryAction";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../../Common/components/Pagination"
import "../styles/LeaveRequests.scss";
import Plus_icon from "../../assets/icons/plus_inside_circle.svg";
import FileViewer from "../../Common/components/FileViewerPop";
import View_Icon from "../../assets/icons/view_icon.svg";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import ViewMoreText from "../../Common/components/ViewMoreText";
import approve_icon from "../../assets/icons/approve_icon.svg";
import reject_icon_enable from "../../assets/icons/reject_icon_enable.svg";
import reject_icon_disable from "../../assets/icons/reject_icon_disable.svg";
import sort from "../../assets/icons/sort.svg";
import filter from "../../assets/icons/filter.svg";
import { convertBufferToString, handleViewProofClick } from "../../Common/utils/helper";
import RequestsSubTabs from "./RequestsSubTabs";
// Define the ENUM for status
export const LeaveRequestStatus = {
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Table headers for leave requests

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const START_YEAR = 2020;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

const LeaveRequests = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
 
  const pageSize = 10;
  const [selectedMonth, setSelectedMonth] = useState("all"); // 0-indexed
  const [selectedYear, setSelectedYear] = useState("all");
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

  const pagination = hrRepositoryReducer?.pagination ?? null;
  const leaveHistoryRequests = useMemo(() => 
    hrRepositoryReducer?.leaveHistoryRequests ?? [], 
    [hrRepositoryReducer?.leaveHistoryRequests]
  );
  const allExistingRequests = useMemo(() => 
    hrRepositoryReducer?.allExisitingLeaves ?? [], 
    [hrRepositoryReducer?.allExisitingLeaves]
  );
  const allEmployeeDetails = useMemo(() => 
    hrRepositoryReducer?.allEmployees ?? [], 
    [hrRepositoryReducer?.allEmployees]
  );
  const myHrmsAccess = hrRepositoryReducer?.myHrmsAccess ?? {};
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [filesToView, setFilesToView] = useState([]);
  const dispatch = useDispatch();
  
  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  useEffect(() => {
  // If user sets either to "Month" or "Year" (value "all"), 
  // we clear the dates so the backend fetches everything.
  if (selectedMonth === "all" || selectedYear === "all") {
    setStartDate("");
    setEndDate("");
  } else {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }
}, [selectedMonth, selectedYear]);

  

  const handleMonthChange = (e) => {
  const val = e.target.value;
  // If they click the placeholder "Month", val is "all", which resets the filter
  setSelectedMonth(val === "all" ? "all" : parseInt(val));
};

const handleYearChange = (e) => {
  const val = e.target.value;
  // If they click the placeholder "Year", val is "all", which resets the filter
  setSelectedYear(val === "all" ? "all" : parseInt(val));
};

  const canRead = hasPermission("LeaveRequest_read");
  const hasAccessToEditLeave = hasPermission("LeaveRequest_write");

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, startDate, endDate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const tableHeaders = useMemo(() => {
    const LeaveRequestsTableHeader = [
      { name: "employeeUuid", label: "Employee" },
      { name: "requestedDate", label: "Requested On",icon: sort },
      { name: "leaveRequestId", label: "Leave Type",icon: filter },
      { name: "leaveDuration", label: "Leave Duration" },
      { name: "reason", label: "Reason" },
      { name: "proof", label: "Proof" },
    ];
    if (activeTab === "history") {
          return [
            ...LeaveRequestsTableHeader,
            
            { name: "status", label: "Status" },
            { name: "reviewedBy", label: "Reviewed By" },
          ];
    }

    return [...LeaveRequestsTableHeader];
  }, [activeTab]);

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
    const sourceData = activeTab === "pending" 
    ? leavePendingRequests 
    : leaveHistoryRequests;
    if (
      !Array.isArray(sourceData) ||
      sourceData.length === 0
    ) {
      return [];
    }

    try {
      return sourceData
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
            reviewedByName: request?.approvedBy ?? "N/A",
            // Keep the original request data for later use if needed
            originalRequest: request ?? {},
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Error in formatPendingLeaveRequests:", error);
      return [];
    }
  }, [leavePendingRequests, formatLeaveDuration,leaveHistoryRequests, activeTab ]);

  // Fetch data when component mounts or dates change
  useEffect(() => {
    try {
      if (typeof dispatch === "function") {
        if (activeTab === "pending") {
          dispatch(getAllPendingLeaveRequests(startDate, endDate));
        } else {
          dispatch(getAllHistoryLeaveRequests(startDate, endDate,currentPage, pageSize));
        }
        dispatch(getAllEmployee());
        dispatch(getAllLeaves());
      }
    } catch (error) {
      console.error("Error dispatching get pending leave requests:", error);
    }
  }, [dispatch, startDate, endDate, activeTab,currentPage]);

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
    if (!hasAccessToEditLeave) return;
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
    if (!hasAccessToEditLeave) return;
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

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setFilesToView([]);
  };

  const hasValidProofAttachment = (attachmentPath) => {
    let parsedAttachmentPath = [];

    if (typeof attachmentPath === "string") {
      try {
        parsedAttachmentPath = JSON.parse(attachmentPath);
      } catch {
        parsedAttachmentPath = attachmentPath.trim() !== "" ? [attachmentPath] : [];
      }
    } else if (attachmentPath && typeof attachmentPath === "object" && attachmentPath.type === "Buffer") {
      const bufferString = convertBufferToString(attachmentPath);
      if (!bufferString || bufferString.trim() === "") return false;
      try {
        parsedAttachmentPath = JSON.parse(bufferString);
      } catch {
        parsedAttachmentPath = [bufferString];
      }
    } else if (Array.isArray(attachmentPath)) {
      parsedAttachmentPath = attachmentPath;
    }

    if (!Array.isArray(parsedAttachmentPath)) {
      parsedAttachmentPath = [parsedAttachmentPath];
    }

    return parsedAttachmentPath.some((item) =>
      item && (
        (typeof item === "object" && item.base64) ||
        (typeof item === "string" && item.trim() !== "")
      )
    );
  };

  // Render proof status with tab-aware behavior
  const renderProofStatus = (
    approvalStatus,
    attachmentPath,
    leaveRequestId,
    isHistoryTab = false
  ) => {
    const hasValidAttachments = hasValidProofAttachment(attachmentPath);

    if (isHistoryTab) {
      if (hasValidAttachments) {
        return (
          <button
            className="view-proof-button"
            onClick={() => handleViewProofClick(attachmentPath, setFilesToView, setViewerOpen)}
          >
            <img src={View_Icon} alt="View" /> View proof
          </button>
        );
      }
      return "N/A";
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

    if (hasValidAttachments) {
      return (
        <button
          className="view-proof-button"
          onClick={() => handleViewProofClick(attachmentPath, setFilesToView, setViewerOpen)}
        >
          <img src={View_Icon} alt="View" /> View proof
        </button>
      );
    }

    return "N/A";
  };

  // Get formatted requests
  const formattedRequests = formatPendingLeaveRequests();

  // If user doesn't have read permission, show access denied message
  if (!canRead) {
    return (
      <div className="leave_requests_main_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don&apos;t have permission to view leave requests
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave_requests_main_container">
      <div className="leave_requests_header">
        <RequestsSubTabs
          tabs={[
            { value: "pending", label: `Pending(${leavePendingRequests.length})` },
            { value: "history", label: `History(${leaveHistoryRequests.length})` },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="date-filter-dropdowns">
          <div className="custom-select-wrapper">
            <select 
              value={selectedMonth} 
              onChange={handleMonthChange}
              className="filter-select"
            >
              <option value="all">Month</option> 
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div className="custom-select-wrapper">
            <select 
              value={selectedYear} 
              onChange={handleYearChange}
              className="filter-select"
            >
              <option value="all">Year</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Action buttons */}
        <div className="leave_requests_action_buttons">
      
          {activeTab === "pending"  && hasAccessToEditLeave && <button
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
          </button>}
          {activeTab === "pending"  && hasAccessToEditLeave && <button
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
          </button>}
        </div>
      </div>

      {/* Table */}
      {loading ? (
          <LoadingSpinner message="Loading Leave Requests..." height="40vh" />
      ) : !Array.isArray(formattedRequests) ||
        formattedRequests.length === 0 ? (
        <div className="no_leave_requests_message">
          {startDate || endDate
            ? "No leave requests between the selected dates."
            : "No leave requests available."}
        </div>
      ) : (
        <div className="leave_requests_table_container">
          <table className="leave_requests_table">
            <thead>
              <tr>
                {activeTab === "pending" && (
                      <>
                <th className="checkbox-cell">
                  <input 
                    type="checkbox"
                    checked={selectAll ?? false}
                    onChange={handleSelectAllClick}
                  />
                </th>
                </>
                  )}
                {tableHeaders.map((header, index) => (
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
                    {activeTab === "pending" && (
                      <>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={isRequestChecked(requestId) ?? false}
                        onChange={() => handleCheck(request)}
                      />
                    </td>
                    </>
                    )}
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
                      <ViewMoreText
                        text={request.reason ?? "N/A"}
                        maxLength={45}
                        modalTitle="Reason"
                        textClassName="reason-text"
                      />
                    </td>
                    <td>
                      {renderProofStatus(
                        request.approvalStatus,
                        request.attachmentPath,
                        request.id,
                        activeTab === "history"
                      )}
                    </td>
                    {activeTab === "history" && (
                      <>
                        <td> <span className={`status-badge status-${request.approvalStatus?.toLowerCase()}`}>{request.approvalStatus ?? "N/A"}</span></td>
                         
                        <td>{getEmployeeNameByUuid(request.reviewedByName) }</td>
                        
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && activeTab === "history" && formattedRequests.length > 0 && (
        <Pagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
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
