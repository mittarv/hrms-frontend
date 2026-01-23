import { useSelector } from "react-redux";
import "./HRMSHeader.scss";
import Avatar from "@mui/material/Avatar";
import { Link, useLocation } from "react-router-dom";
import { valueRoleMap } from "../constant/data";

const HRMSHeader = () => {
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const location = useLocation();

  return (
    <div className="hrms_main__header">
      <div className="hrms_main__header_left">
        <p>
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
            : location.pathname === "/hrms-access"
            ? "HRMS Access"
            : "HR Repository"
            }            
        </p>
      </div>

      <div className="hrms_main__header__right">
        <div className="hrms_user_role__div">
          <p>{user.name}</p>
          <p>{valueRoleMap?.[allToolsAccessDetails?.[selectedToolName]]}</p>
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
