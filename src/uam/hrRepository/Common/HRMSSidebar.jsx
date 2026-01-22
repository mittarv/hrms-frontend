import { useState, useMemo } from "react";
import "./HRMSSidebar.scss";
import closeIcon from "../assets/icons/close_drawer.svg";
import Mittarv_logo_With_Name from "../assets/icons/mittarv_name_and_logo.svg";
import Mittarv_logo from "../assets/icons/mittarv_logo.svg";
import {
  hrRepoRouterData,
} from "../constant/data";
import { useLocation, useNavigate } from "react-router-dom";
import logout from "../assets/icons/logout.svg";
import { useDispatch, useSelector } from "react-redux";

// Route permission mapping - defines what's required to access each route
// permission can be: null, a string (single permission), or an array (multiple permissions - OR logic)
const routePermissions = {
  "/employee-directory": {
    permission: [
      "ActiveEmployee_read",
      "ActiveEmployee_update",
      "ActiveEmployee_onBoarding",
      "EmployeeDirectoryAdmin_View"
    ], // Array of permissions (user needs ANY one)
    adminThreshold: 900,
    requireEmployee: false,
  },
  "/leave-configurator": {
    permission: ["LeaveConfigurator_Read", "LeaveConfigurator_Create", "LeaveConfigurator_update"], // Array of permissions (user needs ANY one)
    adminThreshold: 900,
    requireEmployee: false,
  },
  "/hr-repo-requests": {
    permission: [
      "EmployeeDetailsRequest_read",
      "EmployeeDetailsRequest_write",
      "LeaveRequest_read",
      "LeaveRequest_write",
      "ExtraWorkDayRequests_read",
      "ExtraWorkDayRequests_write",
    ], // Array of permissions (user needs ANY one)
    adminThreshold: 900,
    requireEmployee: false,
  },
  "/employee-repo": {
    permission: null, // No permission required, only admin or employee status
    adminThreshold: 900,
    requireEmployee: true, // Requires employee status OR admin
  },
  "/hrms-access": {
    permission: [
      "HrmsRoleManagement_read",
      "HrmsRoleManagement_create",
      "HrmsRoleManagement_update",
      "HrmsRoleManagement_delete",
      "HrmsUserManagement_read",
      "HrmsUserManagement_write",
    ],
    adminThreshold: 900,
    requireEmployee: false,
  },
};

const HRMSSidebar = () => {
  const [tooglesidebar, setToggleSidebar] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { allToolsAccessDetails, user } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const currentPath = location.pathname;

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch({ type: "LOGOUT_USER" });
  };

  // Filter the hrRepoRouterData based on route permissions
  const filteredHrRepoRouterData = useMemo(() => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] || 0;
    const isEmployee = user?.employeeUuid !== null;
    const permissions = myHrmsAccess?.permissions || [];

    // Helper function to check if user has a specific permission (string or array)
    const hasPermission = (permissionNameOrArray) => {
      if (!permissionNameOrArray) return false;
      
      // If it's an array, check if user has ANY of the permissions (OR logic)
      if (Array.isArray(permissionNameOrArray)) {
        return permissionNameOrArray.some(permissionName =>
          permissions.some(
            (perm) => perm.name === permissionName || perm.displayName === permissionName
          )
        );
      }
      
      // If it's a string, check if user has that permission
      return permissions.some(
        (perm) => perm.name === permissionNameOrArray || perm.displayName === permissionNameOrArray
      );
    };

    // Check if user has access to Active Employees (NOT including EmployeeDirectoryAdmin_View)
    const activeEmployeePermissions = [
      "ActiveEmployee_read",
      "ActiveEmployee_update",
      "ActiveEmployee_onBoarding"
    ];
    const hasAccessToActiveEmployees = isAdmin >= 900 || hasPermission(activeEmployeePermissions);
    

    return hrRepoRouterData.filter((tab) => {
      const routeConfig = routePermissions[tab.path];
      
      // Special handling for employee-directory and employee-repo (mutually exclusive)
      // If user has access to Active Employees: show "Employee-Repo"
      // If user doesn't have access to Active Employees (but may have EmployeeDirectoryAdmin_View): show "Employee Directory"
      if (tab.path === "/employee-directory") {
        // Show employee-directory ONLY if user does NOT have access to Active Employees
        // (Even if they have EmployeeDirectoryAdmin_View, they should see Employee Directory in sidebar)
        return !hasAccessToActiveEmployees;
      }
      
      if (tab.path === "/employee-repo") {
        // Show employee-repo ONLY if user has access to Active Employees
        // EmployeeDirectoryAdmin_View does NOT grant access to Employee-Repo
        return hasAccessToActiveEmployees;
      }
      
      // If route has no special permission requirements, allow access
      if (!routeConfig) {
        return true;
      }

      // Check admin access first
      if (isAdmin >= routeConfig.adminThreshold) {
        return true;
      }

      // Check specific permission(s) - supports both string and array
      if (routeConfig.permission && hasPermission(routeConfig.permission)) {
        return true;
      }

      // Check employee requirement
      if (routeConfig.requireEmployee && isEmployee) {
        return true;
      }

      return false;
    });
  }, [allToolsAccessDetails, selectedToolName, myHrmsAccess, user]);


  const renderLinks = (content, customClass = "") => {
    // Calculate access once for all links
    const isAdmin = allToolsAccessDetails?.[selectedToolName] || 0;
    const permissions = myHrmsAccess?.permissions || [];
    const activeEmployeePermissions = [
      "ActiveEmployee_read",
      "ActiveEmployee_update",
      "ActiveEmployee_onBoarding"
    ];
    // Check for Active Employee access (NOT including EmployeeDirectoryAdmin_View)
    const hasAccessToActiveEmployees = isAdmin >= 900 || permissions.some(perm => 
      activeEmployeePermissions.includes(perm.name) || activeEmployeePermissions.includes(perm.displayName)
    );
    
    return content.map((data) => {
      // Check if current path matches
      let isActive = currentPath === data.path;
      
      // For employee routes, check based on access and current path
      // Both routes render the same component, so we need to determine active state based on access
      if ((data.path === "/employee-repo" || data.path === "/employee-directory") && 
          (currentPath === "/employee-repo" || currentPath === "/employee-directory")) {
        // If user has access to Active Employees: Employee-Repo should be active
        // If user doesn't have access to Active Employees: Employee Directory should be active
        // Note: EmployeeDirectoryAdmin_View does NOT grant access to Active Employees
        if (data.path === "/employee-repo") {
          isActive = hasAccessToActiveEmployees;
        } else if (data.path === "/employee-directory") {
          isActive = !hasAccessToActiveEmployees;
        }
      }
      
      return (
      <div
      key={data.title}
      className={`${
        tooglesidebar ? "hrms_sidebar_content_links" : "hrms_toggle_sidebar_content_links"
      } ${customClass} ${isActive ? "hrms_active_links" : ""}`}
      onClick={() => {
        dispatch({ type: "RESET_ADD_PEOPLE_MODE" })
        dispatch({ type: "RESET_LEAVE_DETAILS_PAGE" });
        dispatch({ type: "RESET_EMPLOYEES_DETAILS_PAGE" });  //For reseting state
        dispatch({ type: "RESET_EDIT_MODE" });
        if (data.path !== "/hello") {
        navigate(data.path);
        }
      }}
      >
      <img src={data.icon} alt="icon" />
      {tooglesidebar && <p className="hrms_sidebar_link_title">{data.title}</p>}
      </div>
    );
    });
  };

  return (
    <div className={tooglesidebar ? "hrms_main_sidebar" : "hrms_toggle_sidebar"}>
      <div className="hrms_sidebar_top_section">
        <div className="hrms_sidebar_header_container">
          {tooglesidebar ? (
            <img
              src={Mittarv_logo_With_Name}
              alt="logo"
              className="hrms_siderbar_header__logo"
              onClick={() => navigate("/")}
            />
          ) : (
            <img
              src={Mittarv_logo}
              className="hrms_toggled_logo"
              alt="logo"
              onClick={() => navigate("/hr-repo")}
            />
          )}

          <img
            src={closeIcon}
            alt="close icon"
            className="hrms_drawer_close_icon"
            onClick={() => setToggleSidebar(!tooglesidebar)}
          />
        </div>
        <div className="hrms_sidebar_links_container">
          {renderLinks(filteredHrRepoRouterData)}
        </div>
      </div>
      <div className={tooglesidebar ? "hrms_sidebar_content" : "hrms_toggle_sidebar_content"}>
        <div
          className={tooglesidebar ? "hrms_sidebar_content_links" : "hrms_toggle_sidebar_content_links"}
          role="button"
          onClick={handleLogout}
        >
          <img src={logout} alt="logout icon" />
          {tooglesidebar && <p className="hrms_sidebar_link_title">Logout</p>}
        </div>
      </div>
    </div>
  );
};

export default HRMSSidebar;
