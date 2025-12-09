import { useSelector} from "react-redux";
// import { role } from "../../constant/data";
import "./header.scss";
import Avatar from "@mui/material/Avatar";
import { Link, useLocation } from "react-router-dom";
import mittArvLogo from "../../assets/images/mittarv_logo_dark.svg";
import { valueRoleMap } from "../../constant/data";
// import { role } from "../../constant/data";

const Header = () => {
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const location = useLocation();

  return (
    <div className="uam_main__header">
      <div className="uam_main__header_left">
        {location.pathname === "/asset-vault-forms" ? (
          <img src={mittArvLogo} alt="mitt-arv-logo" />
        ) : (
          <></>
        )}
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
            : location.pathname === "/asset-vault-forms"
            ? "Asset Vault Forms"
            :location.pathname === "/dashboard"
            ? "Dashboard"
             :location.pathname === "/hr-repo-requests"
            ? "Open Requests"
             : location.pathname === "/payroll-reimbursements"
            ? "Payroll & Reimbursements"
            : location.pathname === "/known-issues" ||
              location.pathname === "/known-issues/imp-link"
            ? "Known Issues"
            : location.pathname.includes("/language-text-editor")
            ? "Language Text Editor"
            : location.pathname === "/key-value-configuration"? "Key Value Configuration"
            : location.pathname === "/partner-tool" || location.pathname === "/subscriptions-configurator" || location.pathname === "/configuration-tool" || location.pathname === "/referral-tracking" ? "Partner Tool" : location.pathname == '/notification-tool' ? "Notification Tool": "Toolbox"
            }            
        </p>
      </div>

      <div className="uam_main__header__right">
        <div className="user_role__div">
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

export default Header;
