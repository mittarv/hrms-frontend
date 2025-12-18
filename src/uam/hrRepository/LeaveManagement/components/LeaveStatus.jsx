import "../styles/LeaveStatus.scss";
import Plus_icon from "../../../../assets/icons/Plus_icon.svg";
import { useEffect, useState } from "react";
import LeaveApplication from "./LeaveApplication";
import UploadProofPopup from "./UploadProofPopup";
import Upload_icon from "../../../../assets/icons/upload_icon_blue.svg";
import Upload_icon_disable from "../../../../assets/icons/upload_icon_grey.svg";
import View_icon from "../../../../assets/icons/view_icon.svg";
import {
  getEmployeeLeaveHistory,
  uploadProofDocuments,
  getCurrentEmployeeDetails,
} from "../../../../actions/hrRepositoryAction";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getLeaveType, getComponentTypeValue } from "../../Common/utils/helper";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const LeaveStatus = () => {
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const [applyLeave, setApplyLeave] = useState(false);
  const [uploadProof, setUploadProof] = useState(false);
  const [selectedLeaveForUpload, setSelectedLeaveForUpload] = useState(null);
  const { loading, currentEmployeeDetailsLoading,  employeeLeaveHistory, currentEmployeeDetails, allExisitingLeaves, getAllComponentType} = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      getEmployeeLeaveHistory(
        user?.employeeUuid
      )
    );
    dispatch(getCurrentEmployeeDetails(user?.employeeUuid));
  }, [dispatch, user]);

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

  const handleUpload = (leaveRequestId) => {
    // Find the leave data for the selected request
    const leaveData = employeeLeaveHistory.find(
      (leave) => leave.leaveRequestId === leaveRequestId
    );

    if (leaveData) {
      setSelectedLeaveForUpload(leaveData);
      setUploadProof(true);
    }
  };

  const handleViewProof = (leaveRequestId) => {
    // Handle viewing uploaded proof
    const leaveData = employeeLeaveHistory.find(
      (leave) => leave.leaveRequestId === leaveRequestId
    );
    if (leaveData && leaveData.attachmentPath) {
      // Open the attachment - you might want to open in a modal or new tab
      window.open(leaveData.attachmentPath, "_blank");
    }
  };

  const handleUploadSubmit = (uploadData, leaveReqeustId) => {
    dispatch(
      uploadProofDocuments(
        uploadData,
        leaveReqeustId,
        currentEmployeeDetails.employeeBasicDetails?.empUuid
      )
    );
  };

  const closeUploadPopup = () => {
    setUploadProof(false);
    setSelectedLeaveForUpload(null);
  };

  const renderProofButton = (leave) => {
    const isProofRequired = leave.approvalStatus === "proof_required";
    const hasAttachment = leave.attachmentPath !== null;

    if (isProofRequired) {
      if (hasAttachment) {
        // Proof required and attachment exists 
        return (
          <button
            className="view-proof-button"
            onClick={() => handleViewProof(leave.leaveRequestId)}
          >
            <img src={View_icon} alt="View" /> View Proof Uploaded
          </button>
        );
      } else {
        // Proof required but no attachment 
        return (
          <button
            className="upload-button"
            onClick={() => handleUpload(leave.leaveRequestId)}
          >
            <img src={Upload_icon} alt="Upload" /> Upload
          </button>
        );
      }
    } else {
      // Proof not required - show disabled "Upload" button
      return (
        <button className="upload_button_disable" disabled>
          <img src={Upload_icon_disable} alt="Upload disabled" /> Upload
        </button>
      );
    }
  };

  return (
    <>
      {(loading || currentEmployeeDetailsLoading)? <LoadingSpinner message="Loading Your Leave Status..." height="40vh" />
      :
      <div className="leave_status_main_container">
        <div className="leave_status_header_container">
          <span className="leave_status_header">
            <p className="leave_status_header_title">{`Employee Type`}</p>
            <p className="leave_status_header_subtitle">
              {getComponentTypeValue(
                currentEmployeeDetails?.employeeCurrentJobDetails?.empType,
                getAllComponentType
              ) || ""}
              {` ${allToolsAccessDetails?.[selectedToolName] >= 500 ? " | Admin" : ""}`}
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
                  <th>Proof (if required)</th>
                </tr>
              </thead>
              <tbody>
                {employeeLeaveHistory &&
                  employeeLeaveHistory.map((leave) => (
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
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      }

      {applyLeave && (
        <LeaveApplication
          isOpen={applyLeave}
          onClose={() => setApplyLeave(false)}
        />
      )}
      {uploadProof && (
        <UploadProofPopup
          isOpen={uploadProof}
          onClose={closeUploadPopup}
          leaveData={selectedLeaveForUpload}
          onUpload={handleUploadSubmit}
          loading={loading}
        />
      )}
    </>
  );
};

export default LeaveStatus;
