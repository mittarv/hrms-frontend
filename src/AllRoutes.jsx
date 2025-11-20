import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./components/login/Login";
import PrivateRoute from "./PrivateRoute";

import UserGroups from "./uam/userGroups/userGroups";
import MyTools from "./uam/myTools/MyTools";
import UserPermissions from "./uam/userPermissions/UserPermissions";
import MittArvTools from "./uam/mittarvTools/MittarvTools";
import PendingRequests from "./uam/pendingRequests/PendingRequests";
import Dashboard from "./uam/hrRepository/Dashboard/Dashboard";
import EmployeeRepositoryDashboard from "./uam/hrRepository/EmployeeRepository/EmployeeRepositoryDashboard";
import LeaveConfiguratorDashboard from "./uam/hrRepository/LeaveConfigurator/LeaveConfiguratorDashboard";
import Requests from "./uam/hrRepository/Requests/Requests";
import LeaveManagement from "./uam/hrRepository/LeaveManagement/LeaveManagement";
import PayrollAndReimbursements from "./uam/hrRepository/PayrollAndReimbursements/PayrollAndReimbursements";

import { toolHomePageData } from "./constant/data";

const AllRoutes = ({ isAuthenticated }) => {
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);

  const hasAdvancedAccess = (toolKey, threshold = 500) =>
    allToolsAccessDetails?.[toolKey] >= threshold;

  const isEmployee = user?.employeeUuid !== null;

  const baseRoutes = [
    { path: "/login", element: <Login />, isPublic: true },
    { path: "/user-groups", element: <UserGroups /> },
    { path: "/user-permissions", element: <UserPermissions /> },
    { path: "/my-tools", element: <MyTools /> },
    { path: "/mittarv-tools", element: <MittArvTools /> },
    { path: "/pending-requests", element: <PendingRequests /> },
    { path: "/payroll-reimbursements", element: <PayrollAndReimbursements /> },
  ];

  const conditionalRoutes = [
    {
      path: "/employee-repo",
      element: <EmployeeRepositoryDashboard />,
      condition: isEmployee || hasAdvancedAccess(toolHomePageData?.toot_title2),
    },
    {
      path: "/hr-repo-requests",
      element: <Requests />,
      condition: isEmployee || hasAdvancedAccess(toolHomePageData?.toot_title2),
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
      condition: isEmployee || hasAdvancedAccess(toolHomePageData?.toot_title2),
    },
    {
      path: "/leave-configurator",
      element: <LeaveConfiguratorDashboard />,
      condition: isEmployee || hasAdvancedAccess(toolHomePageData?.toot_title2),
    },
    {
      path: "/leave-attendance",
      element: <LeaveManagement />,
      condition: isEmployee || hasAdvancedAccess(toolHomePageData?.toot_title2),
    },
  ];

  return (
    <Routes>
      {baseRoutes.map(({ path, element, isPublic }) =>
        isPublic ? (
          <Route key={path} path={path} element={element} />
        ) : (
          <Route
            key={path}
            element={<PrivateRoute isAuthenticated={isAuthenticated} />}
          >
            <Route path={path} element={element} />
          </Route>
        )
      )}

      {conditionalRoutes
        .filter(({ condition }) => condition)
        .map(({ path, element }) => (
          <Route
            key={path}
            element={<PrivateRoute isAuthenticated={isAuthenticated} />}
          >
            <Route path={path} element={element} />
          </Route>
        ))}
    </Routes>
  );
};

export default AllRoutes;
