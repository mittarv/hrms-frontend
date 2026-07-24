import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/SetupWarningBanner.scss";

const SetupWarningBanner = ({
  orgData,
  onConfigureLeave,
  onConfigureOrg,
  showLeaveWarningOverride,
  showOrgWarningOverride,
  canCreateLeave = true,
  canCreateOrg = true,
}) => {
  const navigate = useNavigate();

  const { user, allToolsAccessDetails } = useSelector((state) => state.user || {});
  const { selectedToolName } = useSelector((state) => state.mittarvtools || {});
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer || {});

  const isSuperAdminOrToolAdmin =
    user?.userType >= 900 ||
    allToolsAccessDetails?.[selectedToolName] >= 900 ||
    allToolsAccessDetails?.["HR Repository"] >= 900 ||
    myHrmsAccess?.roleName === "Super Admin" ||
    myHrmsAccess?.roleName === "Admin" ||
    myHrmsAccess?.isSuperAdmin;

  const hasLeavePermission =
    isSuperAdminOrToolAdmin ||
    myHrmsAccess?.permissions?.some(
      (perm) =>
        perm.name === "LeaveConfigurator_Create" ||
        perm.name === "LeaveConfigurator_update"
    );

  const hasOrgPermission =
    isSuperAdminOrToolAdmin ||
    myHrmsAccess?.permissions?.some(
      (perm) =>
        perm.name === "EmployeeType_Create" ||
        perm.name === "EmployeeType_update" ||
        perm.name === "Org_Settings_Create"
    );

  const showLeaveButton = hasLeavePermission && canCreateLeave;
  const showOrgButton = hasOrgPermission && canCreateOrg;

  const isOrgWarningVisible =
    showOrgWarningOverride !== undefined
      ? showOrgWarningOverride
      : orgData?.orgConfigure === false;

  const isLeaveWarningVisible = !isOrgWarningVisible && (
    showLeaveWarningOverride !== undefined
      ? showLeaveWarningOverride
      : orgData?.leaveConfigure === false
  );

  if (!isLeaveWarningVisible && !isOrgWarningVisible) {
    return null;
  }

  const handleLeaveClick = () => {
    if (onConfigureLeave) {
      onConfigureLeave();
    } else {
      navigate("/leave-configurator");
    }
  };

  const handleOrgClick = () => {
    if (onConfigureOrg) {
      onConfigureOrg();
    } else {
      navigate("/employee-type-configurator");
    }
  };

  return (
    <div className="dashboard_setup_warning_container">
      {isLeaveWarningVisible && (
        <div className="setup_warning_banner">
          <div className="warning_content">
            <svg
              className="warning_icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="warning_text">
              {orgData?.leaveConfigureMessage ||
                "Leave types are not configured. Please add leave configurations in Leave Settings."}
            </span>
          </div>
          {showLeaveButton && (
            <div className="warning_actions">
              <button className="configure_button" onClick={handleLeaveClick}>
                Configure Leave Settings
              </button>
            </div>
          )}
        </div>
      )}

      {isOrgWarningVisible && (
        <div className="setup_warning_banner">
          <div className="warning_content">
            <svg
              className="warning_icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="warning_text">
              {orgData?.orgConfigureMessage ||
                "Organization settings missing. Please complete setup in Organization Settings."}
            </span>
          </div>
          {showOrgButton && (
            <div className="warning_actions">
              <button className="configure_button" onClick={handleOrgClick}>
                Configure Organization Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SetupWarningBanner;
