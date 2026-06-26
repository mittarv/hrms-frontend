import { useSelector } from "react-redux";
import "./HRMSHeader.scss";
import Avatar from "@mui/material/Avatar";
import { Link, useLocation } from "react-router-dom";
import CustomTooltip from "./components/CustomTooltip";

const HRMSHeader = () => {
  const { user } = useSelector((state) => state.user);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const location = useLocation();
  const roleNameRaw = myHrmsAccess?.roleName;
  const roleLabel =
    user?.userType >= 900
      ? "Super Admin"
      : !roleNameRaw || (Array.isArray(roleNameRaw) && roleNameRaw.length === 0)
        ? "User"
        : Array.isArray(roleNameRaw)
          ? roleNameRaw.join(", ")
          : String(roleNameRaw);
  const permissions = myHrmsAccess?.permissions ?? [];
  const isSuperAdmin = user?.userType >= 900;
  const permissionsTooltipContent =
    isSuperAdmin
      ? permissions.length > 0
        ? `Permissions:\n${permissions.map((p) => p.displayName || p.name).join("\n")}`
        : "All permissions"
      : permissions.length > 0
        ? `Permissions:\n${permissions.map((p) => p.displayName || p.name).join("\n")}`
        : null;
  return (
    <div className="hrms_main__header">
      <div className="hrms_main__header_left">
        <p className="text-header-main">
          {location.pathname === "/hr-repo" ||
          location.pathname === "/policies" ||
          location.pathname === "/imp-link" 
            ? "HR Repository"
            : location.pathname === "/leave-configurator"
            ? "Leave Configurator" 
            : location.pathname === "/leave-attendance"
            ? "Leave & Attendance"
            : location.pathname === "/employee-repo"

            ? "Employee Repository" 
            : location.pathname === "/employee-directory"
            ? "Employee Directory" 
            : location.pathname === "/dashboard"
            ? "Dashboard"
            : location.pathname === "/hr-repo-requests"
            ? "Open Requests"
            : location.pathname === "/payroll-reimbursements"
            ? "Payroll & Reimbursements"
            : location.pathname === "/rewards-recognitions" || location.pathname === "/rewards-recognitions/vote"
            ? "Rewards & Recognitions"
            : location.pathname === "/hrms-access"
            ? "HRMS Access"
            : location.pathname === "/secondary-working-location"
            ? "Secondary Location Log"
            : "HR Repository"
            }            
        </p>
      </div>

      <div className="hrms_main__header__right">
        <div className="hrms_user_role__div">
          <p className="hrms_header_user_name">{user.name}</p>
          {roleLabel && (
            <p>
              <CustomTooltip
                text={roleLabel}
                maxWords={999}
                tooltipContent={permissionsTooltipContent}
                className="hrms_header_role_tooltip"
              />
            </p>
          )}
        </div>
        {user?.employeeUuid ? (
          <Link to={`/dashboard?employeeUuid=${user.employeeUuid}&showEmployeeDetails=true`}>
            <Avatar src={user.profilePic} />
          </Link>
        ) : (
          <Avatar src={user.profilePic} style={{ opacity: 0.5, pointerEvents: 'none' }} title="Profile unavailable" />
        )}
      </div>
    </div>
  );
};

export default HRMSHeader;
