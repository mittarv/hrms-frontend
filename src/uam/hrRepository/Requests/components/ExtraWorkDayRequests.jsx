import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getExtraWorkLogRequests,
  getExtraWorkLogRequestsHistory,
  getAllEmployee,
  updateExtraWorkLogRequestStatus,
} from "../../../../actions/hrRepositoryAction";
import "../styles/LeaveRequests.scss";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import approve_icon from "../../assets/icons/approve_icon.svg";
import reject_icon_enable from "../../assets/icons/reject_icon_enable.svg";
import reject_icon_disable from "../../assets/icons/reject_icon_disable.svg";
import { handleViewProofClick } from "../../Common/utils/helper";
import FileViewer from "../../Common/components/FileViewerPop";
import View_Icon from "../../assets/icons/view_icon.svg";
import { ExtraWorkRequestStatus } from "../../Common/utils/enums";
import Pagination from "../../Common/components/Pagination"
import ViewMoreText from "../../Common/components/ViewMoreText";
import RequestsSubTabs from "./RequestsSubTabs";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const START_YEAR = 2020;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);
// Table headers for extra work day requests
const ExtraWorkDayRequestsTableHeader = [
  { name: "employeeUuid", label: "Employee" },
  { name: "requestedDate", label: "Requested By" },
  { name: "workDate", label: "Date" },

  { name: "day", label: "Duration" },

  { name: "reason", label: "Reason" },
  { name: "proof", label: "Proof" },
];

const SORT_OPTIONS = [
  { label: "Name (A to Z)", value: "name_asc", field: "employeeUuid", order: "asc" },
  { label: "Name (Z to A)", value: "name_desc", field: "employeeUuid", order: "desc" },
  { label: "Date (Oldest first)", value: "date_asc", field: "workDate", order: "asc" },
  { label: "Date (Newest first)", value: "date_desc", field: "workDate", order: "desc" },
  { label: "Duration (Shortest first)", value: "dur_asc", field: "day", order: "asc" },
  { label: "Duration (Longest first)", value: "dur_desc", field: "day", order: "desc" },
];

const ExtraWorkDayRequests = () => {
  const [selectedMonth, setSelectedMonth] = useState("all"); 
  const [selectedYear, setSelectedYear] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checkedRequestIds, setCheckedRequestIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [filesToView, setFilesToView] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;


  const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);

  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  const loading = hrRepositoryReducer?.loading ?? false;
  const extraWorkLogLoading = hrRepositoryReducer?.extraWorkLogLoading ?? false;
  
  const extraWorkLogRequestsData = useMemo(
    () => hrRepositoryReducer?.extraWorkLogRequestsData ?? [],
    [hrRepositoryReducer?.extraWorkLogRequestsData]
  );
  const extraWorkLogRequestsHistoryData = hrRepositoryReducer?.extraWorkLogRequestsHistoryData?.data ?? [];
  const pagination = hrRepositoryReducer?.extraWorkLogRequestsHistoryData?.pagination ?? null;
  const allEmployeeDetails = useMemo(
    () => hrRepositoryReducer?.allEmployees ?? [],
    [hrRepositoryReducer?.allEmployees]
  );
  const myHrmsAccess = hrRepositoryReducer?.myHrmsAccess;


  const dispatch = useDispatch();

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };


useEffect(() => {
  if (selectedMonth === "all" || selectedYear === "all") {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  } else {
    // This creates the dates correctly in local time
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);

    // Helper to format YYYY-MM-DD without timezone shifting
    const formatLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    setStartDate(formatLocal(start));
    setEndDate(formatLocal(end));
    setCurrentPage(1); // Reset page on filter change
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

  const canRead = hasPermission("ExtraWorkDayRequests_read");
  const hasAccessToEditExtraWorkDay = hasPermission("ExtraWorkDayRequests_write");

  const activeTableHeaders = useMemo(() => {
  // Start with the base headers
  const headers = [...ExtraWorkDayRequestsTableHeader];

  // If the tab is history, add the extra columns
  if (activeTab === "history") {
    return [
      ...headers,
      { name: "approvalStatus", label: "Status" },
      { name: "reviewedBy", label: "Reviewed By" },
    ];
  }

  return headers;
}, [activeTab]);

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  // Format date to readable format (e.g., "2 Apr 2025")
  const formatDateToReadable = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEmployeeNameByUuid = (uuid) => {
    if (!uuid) return "Unknown";
    const employee = allEmployeeDetails.find((emp) => emp.employeeUuid === uuid);
    return employee ? `${employee.employeeFirstName} ${employee.employeeLastName}` : "Unknown";
  };

  // Format extra work day requests

  const formattedRequests = useMemo(() => {
  const sourceData = activeTab === "pending" ? extraWorkLogRequestsData : extraWorkLogRequestsHistoryData;
  
  return sourceData.map((request) => {
    // 1. Determine Status Text
    let statusText = "Pending";
    if (request?.approvalStatus === ExtraWorkRequestStatus.APPROVED) statusText = "Approved";
    else if (request?.approvalStatus === ExtraWorkRequestStatus.REJECTED) statusText = "Rejected";

    return {
      id: request?.extraWorkDayId ?? `unknown-${Math.random()}`,
      employeeUuid: request?.empUuid ?? "Unknown",
      requestedBy: request?.requestBy ?? "N/A",
      workDate: formatDateToReadable(request?.workDate),
      day: request?.totalCompOffCredit === 1 
        ? "Full Day" 
        : request?.totalCompOffCredit === 0.5 
        ? "Half Day" 
        : "N/A",
      reason: request?.remarks ?? "N/A",
      approvalStatus: request?.approvalStatus ?? "Pending",
      proof: request?.proof ?? null,
      // Always include these or handle them carefully in the return
      status: statusText, 
      reviewedBy: getEmployeeNameByUuid(request?.approvedBy || request?.actionedBy), 
    };
  });
}, [extraWorkLogRequestsData, extraWorkLogRequestsHistoryData, activeTab, allEmployeeDetails]); 
// Added allEmployeeDetails to dependencies to ensure names update when list loads

  // Fetch data when component mounts
  useEffect(() => {
    if (allEmployeeDetails.length === 0) dispatch(getAllEmployee());
    
    if (activeTab === "pending") {
      dispatch(getExtraWorkLogRequests(startDate, endDate));
    } else {
      dispatch(getExtraWorkLogRequestsHistory(currentPage, pageSize, startDate, endDate));
    }
  }, [dispatch, activeTab, currentPage, startDate, endDate]);

  // Update selectAll state based on checked requests
  useEffect(() => {
    const allIds = formattedRequests.map((r) => r.id);
    setSelectAll(allIds.length > 0 && allIds.every((id) => checkedRequestIds.includes(id)));
  }, [checkedRequestIds, formattedRequests]);

  const handleCheck = (request) => {
    if (!hasAccessToEditExtraWorkDay) return;
    setCheckedRequestIds((prev) =>
      prev.includes(request.id)
        ? prev.filter((id) => id !== request.id)
        : [...prev, request.id]
    );
  };

  const handleSelectAllClick = () => {
    if (!hasAccessToEditExtraWorkDay) return;
    setCheckedRequestIds(selectAll ? [] : formattedRequests.map((r) => r.id));
    setSelectAll(!selectAll);
  };

  const handleExtraWorkRequestApprove = () => {
    if (!hasAccessToEditExtraWorkDay) return;
    dispatch(updateExtraWorkLogRequestStatus(
      checkedRequestIds,
      ExtraWorkRequestStatus.APPROVED,
      startDate,
      endDate
    ))
    setCheckedRequestIds([]);
  };

  const handleExtraWorkRequestReject = () => {
    if (!hasAccessToEditExtraWorkDay) return;
    dispatch(updateExtraWorkLogRequestStatus(
      checkedRequestIds,
      ExtraWorkRequestStatus.REJECTED,
      startDate,
      endDate
    ))
    setCheckedRequestIds([]);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setFilesToView([]);
  };

  const hasCheckedRequests = checkedRequestIds.length > 0;
  const displayStartDate = formatDateForDisplay(startDate);
  const displayEndDate = formatDateForDisplay(endDate);

  // If user doesn't have read permission, show access denied message
  if (!canRead) {
    return (
      <div className="leave_requests_main_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don&apos;t have permission to view extra work day requests
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
            { value: "pending", label: "Pending" },
            { value: "history", label: "History" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {/* Date filter */}
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
          {activeTab === "pending"  &&hasAccessToEditExtraWorkDay && <button
            className={`leave_requests_approve_button ${!hasCheckedRequests ? "disabled" : ""}`}
            onClick={hasCheckedRequests ? handleExtraWorkRequestApprove : undefined}
          >
            <span className={!hasCheckedRequests ? "disabled" : ""}>
              <img src={approve_icon} alt="Approve Icon" className="approve_icon" />
              Approve
            </span>
          </button>}
          {activeTab === "pending"  &&hasAccessToEditExtraWorkDay && <button
            className={`leave_requests_reject_button ${!hasCheckedRequests ? "disabled" : ""}`}
            onClick={hasCheckedRequests ? handleExtraWorkRequestReject : undefined}
          >
            <span>
              <img
                src={hasCheckedRequests ? reject_icon_enable : reject_icon_disable}
                alt="Reject Icon"
                className="reject_icon"
              />
              Reject
            </span>
          </button>}
        </div>
      </div>

      {/* Table */}
      {loading || extraWorkLogLoading? (
        <LoadingSpinner message="Loading Extra Work Day Requests..." height="40vh" />
      ) : formattedRequests.length === 0 ? (
        <div className="no_leave_requests_message">
          {startDate || endDate
            ? "No extra work day requests between the selected dates."
            : "No extra work day requests available."}
        </div>
      ) : (
        <div className="leave_requests_table_container">
          <table className="leave_requests_table">
            <thead>
              <tr>
                {activeTab === "pending" && (
                      <>
                <th className="checkbox-cell">
                  {hasAccessToEditExtraWorkDay && <input type="checkbox" checked={selectAll} onChange={handleSelectAllClick} />}
                </th>
                </>)}
                {activeTableHeaders.map((header, index) => (
                  <th key={header.name || `header-${index}`}>{header.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formattedRequests.map((request, index) => {
                const isChecked = checkedRequestIds.includes(request.id);
                return (
                  <tr key={request.id || `row-${index}`} className={isChecked ? "checked-row" : ""}>
                    {activeTab === "pending" && (
                      <>
                    <td className="checkbox-cell">
                      {hasAccessToEditExtraWorkDay && <input type="checkbox" checked={isChecked} onChange={() => handleCheck(request)} />}
                    </td>
                    </>)}
                    <td className="employee_name">{getEmployeeNameByUuid(request.employeeUuid)}</td>
                    <td>{getEmployeeNameByUuid(request.requestedBy)}</td>
                    <td>{request.workDate}</td>
                    <td>{request.day} </td>
                    <td className="reason-cell">
                      <ViewMoreText
                        text={request.reason}
                        maxLength={45}
                        modalTitle="Reason"
                        textClassName="reason-text"
                      />
                    </td>
                    <td>
                      <button
                        className="view-proof-button"
                        onClick={() => handleViewProofClick(request.proof, setFilesToView, setViewerOpen)}
                      >
                        <img src={View_Icon} alt="View" /> View proof
                      </button>
                    </td>
                    {activeTab === "history" && (
                      <>
                        <td> <span className={`status-badge status-${request.status?.toLowerCase()}`}>{request.status ?? "N/A"}</span></td>
                        <td>{request.reviewedBy}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !extraWorkLogLoading && activeTab === "history" && pagination && (
        <Pagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)} // Added handler
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

export default ExtraWorkDayRequests;