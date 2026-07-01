import "../styles/LeaveStatus.scss";
import Plus_icon from "../../assets/icons/Plus_icon.svg";
import { useEffect, useState } from "react";
import LeaveApplication from "./LeaveApplication";
import View_icon from "../../assets/icons/view_icon.svg";
import {
  getEmployeeLeaveHistory,
  getCurrentEmployeeDetails,
} from "../../../../actions/hrRepositoryAction";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import FileViewer from "../../Common/components/FileViewerPop";
import { getLeaveType, getComponentTypeValue, handleViewProofClick } from "../../Common/utils/helper";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const LeaveStatus = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const [applyLeave, setApplyLeave] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [filesToView, setFilesToView] = useState([]);
  const { loading, currentEmployeeDetailsLoading,  employeeLeaveHistory,employeeLeavePagination, currentEmployeeDetails, allExisitingLeaves, getAllComponentType, myHrmsAccess} = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();
  const hasAccessToLeaveStatus=myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveAttendance_write");

  useEffect(() => {
    dispatch(getCurrentEmployeeDetails(user?.employeeUuid));
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.employeeUuid) {
      dispatch(getEmployeeLeaveHistory(user.employeeUuid, currentPage, pageSize));
    }
  }, [dispatch, user, currentPage]);
  const paginatedLeaveHistory = employeeLeaveHistory || [];
  const totalPagesState = employeeLeavePagination?.totalPages || Math.max(
    1,
    Math.ceil((employeeLeaveHistory?.length || 0) / pageSize)
  );
  const getVisiblePages = () => {
    const totalPages = totalPagesState;
    const visibleCount = 5;

    let startPage = Math.max(1, currentPage - Math.floor(visibleCount / 2));
    let endPage = startPage + visibleCount - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - visibleCount + 1);
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate === endDate) {
      return start.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return `${start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} - ${end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "status-accepted";
      case "pending":
        return "status-pending";
      case "rejected":
        return "status-rejected";
      case "proof_required":
        return "status-proof-required";
      default:
        return "status-pending";
    }
  };

  const getLeaveTypeName = (leaveConfigId) => {
    const leaveType = getLeaveType(leaveConfigId, allExisitingLeaves);
    return leaveType || "Leave";
  };

  const handleViewProof = (leaveRequestId) => {
    const leaveData = employeeLeaveHistory.find(
      (leave) => leave.leaveRequestId === leaveRequestId
    );
    if (leaveData?.attachmentPath) {
      handleViewProofClick(leaveData.attachmentPath, setFilesToView, setViewerOpen);
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setFilesToView([]);
  };

  const hasValidProofAttachment = (attachmentPath) => {
    let parsedAttachments = [];

    if (typeof attachmentPath === "string") {
      try {
        parsedAttachments = JSON.parse(attachmentPath);
      } catch {
        parsedAttachments = attachmentPath.trim() !== "" ? [attachmentPath] : [];
      }
    } else if (attachmentPath && typeof attachmentPath === "object" && attachmentPath.type === "Buffer") {
      try {
        const decoder = new TextDecoder("utf-8");
        const bufferString = decoder.decode(new Uint8Array(attachmentPath.data || []));
        if (!bufferString || bufferString.trim() === "") return false;
        parsedAttachments = JSON.parse(bufferString);
      } catch {
        return false;
      }
    } else if (Array.isArray(attachmentPath)) {
      parsedAttachments = attachmentPath;
    }

    if (!Array.isArray(parsedAttachments)) {
      parsedAttachments = [parsedAttachments];
    }

    return parsedAttachments.some((item) =>
        item && (
          (typeof item === "object" && item.base64) ||
          (typeof item === "string" && item.trim() !== "")
        )
    );
  };

  const renderProofButton = (leave) => {
    const hasAttachment = hasValidProofAttachment(leave?.attachmentPath);

    if (hasAttachment) {
      return (
        <button
          className="view-proof-button"
          onClick={() => handleViewProof(leave.leaveRequestId)}
        >
          <img src={View_icon} alt="View" /> View proof
        </button>
      );
    }

    return "N/A";
  };

  return (
    <>
      {(loading || currentEmployeeDetailsLoading)?(<LoadingSpinner message="Loading Your Leave Status..." height="40vh" />
      ) : (
        <div className="leave_status_main_container">
          <div className="leave_status_header_container">
            <span className="leave_status_header">
              <p className="leave_status_header_title">{`Employee Type`}</p>
              <p className="leave_status_header_subtitle">
                {getComponentTypeValue(
                  currentEmployeeDetails?.employeeCurrentJobDetails?.empType,
                  getAllComponentType
                ) || ""}
                {` ${(allToolsAccessDetails?.[selectedToolName] >= 900 || hasAccessToLeaveStatus) ? " | Admin" : ""}`}
              </p>
            </span>
            <button
              className="leave_status_header_button"
              onClick={() => setApplyLeave(true)}
            >
              <img src={Plus_icon} alt="Plus_icon" />
              <span>Apply For Leave</span>
            </button>
          </div>

          <div className="applied_leaves_container">
            <div className="applied_leaves_header">
              <p>{`Applied Leaves (${new Date().getFullYear()} - ${
                new Date().getFullYear() + 1
                })`}</p>
            </div>

            <div className="leaves_table_container">
              <table className="leaves_table">
                <thead>
                  <tr>
                    <th>Leave Duration</th>
                    <th>Leave Type</th>
                    <th>Reason</th>
                    <th>Application Status</th>
                    <th>Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaveHistory?.length > 0 ? (
                    paginatedLeaveHistory.map((leave) => (
                      <tr key={leave.leaveRequestId}>
                        <td>{formatDateRange(leave.startDate, leave.endDate)}</td>
                        <td>{getLeaveTypeName(leave.leaveConfigId)}</td>
                        <td className="reason-cell" title={leave.remarks}>
                          {leave.remarks || "No remarks"}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              leave.approvalStatus
                            )}`}
                          >
                            {leave.approvalStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td>{renderProofButton(leave)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                        No Leave History Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="leave-pagination-wrapper">
                <button
                  className="leave-page-btn nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Prev
                </button>

                {getVisiblePages().map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`leave-page-btn ${currentPage === pageNum ? "active-page" : ""
                      }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="leave-page-btn nav-btn"
                  disabled={currentPage === totalPagesState}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPagesState))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {applyLeave && (
        <LeaveApplication
          isOpen={applyLeave}
          onClose={() => setApplyLeave(false)}
        />
      )}
      <FileViewer
        fileUrls={filesToView}
        open={viewerOpen}
        onClose={handleCloseViewer}
        initialIndex={0}
      />
    </>
  );
};

export default LeaveStatus;
