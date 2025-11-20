import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Routes, Route } from "react-router-dom";

import "./App.scss";
import Login from "./components/login/Login";
import Layout from "./uam/uamHome/Layout";
import PrivateRoute from "./PrivateRoute";
import useDynamicTitle from "./uam/hrRepository/hooks/useDynamicTitle";

import { loadUserInfo } from "./actions/userActions";
import { toolHomePageData } from "./constant/data";

import ToolHome from "./tools/toolHome/ToolHome";
import HrHome from "./uam/hrRepository/HrHome";
import PolicyPage from "./uam/hrRepository/PolicyPage";
import ImportantLink from "./uam/hrRepository/ImportantLink";
import Dashboard from "./uam/hrRepository/Dashboard/Dashboard";
import EmployeeRepositoryDashboard from "./uam/hrRepository/EmployeeRepository/EmployeeRepositoryDashboard";
import LeaveConfiguratorDashboard from "./uam/hrRepository/LeaveConfigurator/LeaveConfiguratorDashboard";
import Requests from "./uam/hrRepository/Requests/Requests";
import LeaveManagement from "./uam/hrRepository/LeaveManagement/LeaveManagement";
import PayrollAndReimbursements from "./uam/hrRepository/PayrollAndReimbursements/PayrollAndReimbursements";

const basicRoutes = [
  { path: "/", element: <ToolHome /> },
  { path: "/hr-repo", element: <HrHome /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/policies", element: <PolicyPage /> },
  { path: "/imp-link", element: <ImportantLink /> },
  { path: "/leave-attendance", element: <LeaveManagement /> },
  { path: "/payroll-reimbursements", element: <PayrollAndReimbursements /> },
];

const accessBasedRoutes = [
  { path: "/employee-repo", element: <EmployeeRepositoryDashboard /> },
  { path: "/leave-configurator", element: <LeaveConfiguratorDashboard /> },
  { path: "/hr-repo-requests", element: <Requests /> },
];

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useDynamicTitle();

  const { isAuthenticated, loading, allToolsAccessDetails } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    dispatch(loadUserInfo());
  }, [dispatch]);

  const isHeaderlessRoute = useMemo(() => {
    const noHeaderPaths = [
      "/",
      "/referral-board",
      "/hr-repo",
      "/partner-tool",
      "/notification-tool",
      "/policies",
      "/imp-link",
      "/employee-repo",
      "/known-issues",
      "/known-issues/imp-link",
      "/analytical-dashboard",
      "/leave-configurator",
      "/leave-attendance",
      "/hr-repo-requests",
      "/analytics",
    ];
    return (
      noHeaderPaths.some((path) => location.pathname === path) ||
      location.pathname.includes("/language-text-editor")
    );
  }, [location.pathname]);

  const hasAccessToAdvancedTools =
    allToolsAccessDetails?.[toolHomePageData?.toot_title2] > 100;

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      {isAuthenticated ? (
        isHeaderlessRoute ? (
          <Routes>
            {basicRoutes.map(({ path, element }) => (
              <Route
                key={path}
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path={path} element={element} />
              </Route>
            ))}

            {hasAccessToAdvancedTools &&
              accessBasedRoutes.map(({ path, element }) => (
                <Route
                  key={path}
                  element={<PrivateRoute isAuthenticated={isAuthenticated} />}
                >
                  <Route path={path} element={element} />
                </Route>
              ))}
          </Routes>
        ) : (
          <Layout isAuthenticated={isAuthenticated} />
        )
      ) : (
        <Login />
      )}
    </>
  );
};

export default App;
