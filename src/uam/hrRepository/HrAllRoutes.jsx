import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import PrivateRoute from "../../PrivateRoute";

import Dashboard from "./Dashboard/Dashboard";
import EmployeeRepo from "./EmployeeRepository/EmployeeRepo";
import LeaveConfiguratorDashboard from "./LeaveConfigurator/LeaveConfiguratorDashboard";
import Requests from "./Requests/Requests";
import LeaveManagement from "./LeaveManagement/LeaveManagement";
import PayrollAndReimbursements from "./PayrollAndReimbursements/PayrollAndReimbursements";
import HrmsAccess from "./HrmsAccess/HrmsAccess";
import PolicyPage from "./policy/PolicyPage";
import ImportantLink from "./importantLink/ImportantLink";
import HrHome from "./HrHome";
import RewardsRecognition from "./RewardsRecognition/RewardsRecognition";
import VoteForNomineesPage from "./RewardsRecognition/components/VoteForNomineesPage";
import SecondaryLocation from "./SecondaryLocation/SecondaryLocation";
import EmployeeTypeDashboard from "./EmployeeTypeConfigurator/components/EmployeeTypeDashboard";
import AccessDenied from "./Common/components/AccessDenied";
import { hrToolHomePageData } from "./constant/data";
import exclamationMarkIcon from "./assets/icons/exclamation_mark.svg";
import "./HrAllRoutes.scss";

const HrAllRoutes = ({ isAuthenticated }) => {
  const { user, allToolsAccessDetails, loading } = useSelector((state) => state.user);
  const { myHrmsAccess, myHrmsAccessLoaded } = useSelector((state) => state.hrRepositoryReducer);

  const hasAdvancedAccess = (toolKey, threshold = 900) =>
    allToolsAccessDetails?.[toolKey] >= threshold;

  // Check if user has specific permission(s) in myHrmsAccess
  // Supports both single permission (string) or multiple permissions (array) - OR logic
  const hasPermission = (permissionNameOrArray) => {
    if (!myHrmsAccess || !Array.isArray(myHrmsAccess.permissions)) {
      return false;
    }
    
    // If it's an array, check if user has ANY of the permissions (OR logic)
    if (Array.isArray(permissionNameOrArray)) {
      return permissionNameOrArray.some(permissionName =>
        myHrmsAccess.permissions.some(
          (perm) => perm.name === permissionName || perm.displayName === permissionName
        )
      );
    }
    
    // If it's a string, check if user has that permission
    return myHrmsAccess.permissions.some(
      (perm) => perm.name === permissionNameOrArray || perm.displayName === permissionNameOrArray
    );
  };

  const isEmployee = user?.employeeUuid !== null;
  const selectedToolName = hrToolHomePageData?.toot_title2 || "HR Repository";
  const hasAccessToAdvancedTools = hasAdvancedAccess(selectedToolName);

  // Base routes - accessible to all HR users (no permission checks needed)
  const baseRoutes = [
    { path: "/hr-repo", element: <HrHome /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/policies", element: <PolicyPage /> },
    { path: "/imp-link", element: <ImportantLink /> },
    { path: "/leave-attendance", element: <LeaveManagement /> },
    { path: "/payroll-reimbursements", element: <PayrollAndReimbursements /> },
    { path: "/rewards-recognitions", element: <RewardsRecognition /> },
    { path: "/rewards-recognitions/vote", element: <VoteForNomineesPage /> },
    { path: "/secondary-working-location", element: <SecondaryLocation /> },
    { path: "/employee-type-configurator", element: <EmployeeTypeDashboard /> },
  ];

  // Conditional routes - require specific permissions or admin access (>= 900)
  // If condition is false, show AccessDenied page instead
  const conditionalRoutes = [
    {
      path: "/employee-repo",
      element: <EmployeeRepo />,
      accessDeniedElement: <AccessDenied />,
      // Require admin access (>= 900) OR Employee Repository permissions OR isEmployee
      condition: hasAccessToAdvancedTools || isEmployee || hasPermission([
        "ActiveEmployee_read",
        "ActiveEmployee_onBoarding",
        "ActiveEmployee_update",
        "EmployeeDirectoryAdmin_View",
        "Offboarding_View",
        "Offboarding_Initiate",
        "Offboarding_HR_Clearance",
        "Offboarding_Finance_Clearance",
        "Offboarding_Approve",
        "View_Offboarded_Employees",
      ]),
    },
    {
      path: "/employee-directory",
      element: <EmployeeRepo />,
      accessDeniedElement: <AccessDenied />,
      // Require admin access (>= 900) OR Employee Repository permissions OR isEmployee
      condition: hasAccessToAdvancedTools || isEmployee || hasPermission([
        "ActiveEmployee_read",
        "ActiveEmployee_update",
        "ActiveEmployee_onBoarding",
        "EmployeeDirectoryAdmin_View",
      ]),
    },
    {
      path: "/leave-configurator",
      element: <LeaveConfiguratorDashboard />,
      accessDeniedElement: <AccessDenied />,
      // Require admin access (>= 900) OR Leave Configurator permissions
      condition: hasAccessToAdvancedTools || hasPermission([
        "LeaveConfigurator_Read",
        "LeaveConfigurator_Create",
        "LeaveConfigurator_update",
      ]),
    },
    {
      path: "/hr-repo-requests",
      element: <Requests />,
      accessDeniedElement: <AccessDenied />,
      // Require admin access (>= 900) OR Requests & Approvals permissions
      condition: hasAccessToAdvancedTools || hasPermission([
        "EmployeeDetailsRequest_read",
        "EmployeeDetailsRequest_write",
        "LeaveRequest_read",
        "LeaveRequest_write",
        "ExtraWorkDayRequests_read",
        "ExtraWorkDayRequests_write",
        "SecondaryLocationRequests_read",
        "SecondaryLocationRequests_write",
      ]),
    },
    {
      path: "/hrms-access",
      element: <HrmsAccess />,
      accessDeniedElement: <AccessDenied />,
      // Require admin access (>= 900) OR HrmsAccess permissions
      condition: hasAccessToAdvancedTools || hasPermission([
        "HrmsRoleManagement_read",
        "HrmsRoleManagement_create",
        "HrmsRoleManagement_update",
        "HrmsRoleManagement_delete",
        "HrmsUserManagement_read",
        "HrmsUserManagement_write",
      ]),
    },
  ];

  if (loading) return <div className="loader">Loading...</div>;

  if (user && user.isActive === false || (user?.employeeUuid === null && user?.userType !== 900)) {
    return (
      <div className="account_inactive_container">
        <div className="account_inactive_content">
          <div className="account_inactive_icon_wrapper">
            <img src={exclamationMarkIcon} alt="" className="account_inactive_icon" />
          </div>
          <h2 className="account_inactive_title">Your account is not active</h2>
          <p className="account_inactive_message">
            Please contact your admin to proceed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {baseRoutes.map(({ path, element }) => (
        <Route
          key={path}
          element={<PrivateRoute isAuthenticated={isAuthenticated} />}
        >
          <Route path={path} element={element} />
        </Route>
      ))}

      {conditionalRoutes.map(({ path, element, accessDeniedElement, condition }) => (
        <Route
          key={path}
          element={<PrivateRoute isAuthenticated={isAuthenticated} />}
        >
          <Route 
            path={path} 
            element={
              !myHrmsAccessLoaded && !hasAccessToAdvancedTools
                ? <div className="loader">Loading...</div>
                : condition 
                  ? element 
                  : (accessDeniedElement || <AccessDenied />)
            } 
          />
        </Route>
      ))}
    </Routes>
  );
};

export default HrAllRoutes;
