import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getExtraWorkLogRequests,
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


// Table headers for extra work day requests
const ExtraWorkDayRequestsTableHeader = [
  { name: "employeeUuid", label: "Employee" },
  { name: "requestedDate", label: "Requested By" },
  { name: "workDate", label: "Date" },
  { name: "checkIn", label: "Check-In" },
  { name: "checkOut", label: "Check-Out" },
  { name: "hours", label: "Duration" },
  { name: "reason", label: "Reason" },
  { name: "proof", label: "Proof" },
];

const ExtraWorkDayRequests = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checkedRequestIds, setCheckedRequestIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [filesToView, setFilesToView] = useState([]);

  const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  const loading = hrRepositoryReducer?.loading ?? false;
  const extraWorkLogRequestsData = useMemo(
    () => hrRepositoryReducer?.extraWorkLogRequestsData ?? [],
    [hrRepositoryReducer?.extraWorkLogRequestsData]
  );
  const allEmployeeDetails = useMemo(
    () => hrRepositoryReducer?.allEmployees ?? [],
    [hrRepositoryReducer?.allEmployees]
  );
  const myHrmsAccess = hrRepositoryReducer?.myHrmsAccess;

  console.log(extraWorkLogRequestsData)
  const dispatch = useDispatch();

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canRead = hasPermission("ExtraWorkDayRequests_read");
  const hasAccessToEditExtraWorkDay = hasPermission("ExtraWorkDayRequests_write");

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
    return extraWorkLogRequestsData.map((request) => ({
      id: request?.extraWorkDayId ?? `unknown-${Math.random().toString(36).substring(2, 11)}`,
      employeeUuid: request?.empUuid ?? "Unknown",
      requestedBy: request?.requestBy ?? "N/A",
      workDate: formatDateToReadable(request?.workDate),
      checkIn: request?.checkIn ?? "N/A",
      checkOut: request?.checkOut ?? "N/A",
      hours: request?.totalDuration ?? "0",
      reason: request?.remarks ?? "N/A",
      approvalStatus: request?.approvalStatus ?? "Pending",
      proof: request?.proof ?? null,
    }));
  }, [extraWorkLogRequestsData]);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(getExtraWorkLogRequests(startDate, endDate));
    dispatch(getAllEmployee());
  }, [dispatch, startDate, endDate]);

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
            You don't have permission to view extra work day requests
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave_requests_main_container">
      <div className="leave_requests_header">
        {/* Date filter */}
        <div className="date-filter">
          <div className="date-input">
            <label>From</label>
            <div className="custom-date-input">
              <input type="text" value={displayStartDate} placeholder="DD/MM/YYYY" readOnly />
              <input
                type="date"
                onChange={(e) => setStartDate(e.target.value)}
                value={startDate}
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
              <input type="text" value={displayEndDate} placeholder="DD/MM/YYYY" readOnly />
              <input
                type="date"
                onChange={(e) => setEndDate(e.target.value)}
                value={endDate}
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
          {hasAccessToEditExtraWorkDay && <button
            className={`leave_requests_approve_button ${!hasCheckedRequests ? "disabled" : ""}`}
            onClick={hasCheckedRequests ? handleExtraWorkRequestApprove : undefined}
          >
            <span className={!hasCheckedRequests ? "disabled" : ""}>
              <img src={approve_icon} alt="Approve Icon" className="approve_icon" />
              Approve
            </span>
          </button>}
          {hasAccessToEditExtraWorkDay && <button
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
      {loading ? (
        <LoadingSpinner message="Loading Extra Work Day Requests..." height="40vh" />
      ) : formattedRequests.length === 0 ? (
        <div className="no_leave_requests_message">
          {startDate || endDate
            ? "No pending extra work day requests between the selected dates."
            : "No pending extra work day requests available."}
        </div>
      ) : (
        <div className="leave_requests_table_container">
          <table className="leave_requests_table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  {hasAccessToEditExtraWorkDay && <input type="checkbox" checked={selectAll} onChange={handleSelectAllClick} />}
                </th>
                {ExtraWorkDayRequestsTableHeader.map((header, index) => (
                  <th key={header.name || `header-${index}`}>{header.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formattedRequests.map((request, index) => {
                const isChecked = checkedRequestIds.includes(request.id);
                return (
                  <tr key={request.id || `row-${index}`} className={isChecked ? "checked-row" : ""}>
                    <td className="checkbox-cell">
                      {hasAccessToEditExtraWorkDay && <input type="checkbox" checked={isChecked} onChange={() => handleCheck(request)} />}
                    </td>
                    <td className="employee_name">{getEmployeeNameByUuid(request.employeeUuid)}</td>
                    <td>{getEmployeeNameByUuid(request.requestedBy)}</td>
                    <td>{request.workDate}</td>
                    <td>{request.checkIn}</td>
                    <td>{request.checkOut}</td>
                    <td>{request.hours} h</td>
                    <td className="reason-cell">
                      <div className="reason-text">{request.reason}</div>
                    </td>
                    <td>
                      <button
                        className="view-proof-button"
                        onClick={() => handleViewProofClick(request.proof, setFilesToView, setViewerOpen)}
                      >
                        <img src={View_Icon} alt="View" /> View proof
                      </button>
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

export default ExtraWorkDayRequests;