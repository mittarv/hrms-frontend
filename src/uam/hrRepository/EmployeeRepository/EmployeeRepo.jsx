import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./styles/EmployeeRepo.scss";
import { useEffect, useState, useCallback, useMemo } from "react";
import EmployeeRepositoryDashboard from "./components/EmployeeRepositoryDashboard";
import EmployeeDirectory from "./components/EmployeeDirectory";
import EmployeeDetailsPage from "./components/EmployeeDetailsPage";
import { useLocation } from "react-router-dom";
import EmployeeOffboardingInProgress from "./components/EmployeeOffboardingInProgress";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import EmployeeOffboarded from "./components/EmployeeOffboarded";
import AccessDenied from "../Common/components/AccessDenied";

const EMPLOYEE_TABS = {
    DASHBOARD: "active_employees",
    DIRECTORY: "employee_directory",
    OFFBOARDING: "offboarding_in_progress",
    OFFBOARDED: "offboarded_employees"
};

import {
  getAllComponentTypes,
  getAllEmployee,  
  updateEmployeeOutstandingCheckout,
} from "../../../actions/hrRepositoryAction";
import Active_employees_icon from "../assets/icons/Active_employees_icon.svg";
import Inactive_employees_icon from "../assets/icons/Inactive_employees_icon.svg";
import Inactive_offboarding_icon from "../assets/icons/Inactive_offboarding_icon.svg";
import Inactive_offboarded_icon from "../assets/icons/Inactive_offboarded_icon.svg";
import Active_offboarding_icon from "../assets/icons/Active_offboarding_icon.svg";
import Active_offboarded_icon from "../assets/icons/Active_offboarded_icon.svg";
const EmployeeRepo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const allToolsAccessDetails = useSelector(state => state.user.allToolsAccessDetails);
  const selectedToolName = useSelector(state => state.mittarvtools.selectedToolName);
  const { myHrmsAccess, myHrmsAccessLoaded } = useSelector((state) => state.hrRepositoryReducer);

  const userAccessLevel = allToolsAccessDetails?.[selectedToolName];
  const hasAccess = userAccessLevel >= 900;
  
  // Check for Active Employee permissions (NOT including EmployeeDirectoryAdmin_View)
  const hasAccessToActiveEmployees = myHrmsAccess?.permissions?.some(perm => 
    perm.name === "ActiveEmployee_read" || 
    perm.name === "ActiveEmployee_update" || 
    perm.name === "ActiveEmployee_onBoarding"
  );

  const hasAccessToEmployeeOffboardingInProgress = myHrmsAccess?.permissions?.some(perm => 
      perm.name === "Offboarding_View" || 
      perm.name === "Offboarding_Initiate" || 
      perm.name === "Offboarding_HR_Clearance" || 
      perm.name === "Offboarding_Finance_Clearance" || 
      perm.name === "Offboarding_Approve"
  );

  const hasAccessToEmployeeOffboardedEmployees = myHrmsAccess?.permissions?.some(perm => 
    perm.name === "View_Offboarded_Employees"
  );

  
  // These tabs are accessible to admins (>= 900) only
  const hasAccessToActiveEmployeesTab = hasAccess || hasAccessToActiveEmployees;
  const hasAccessToOffboardedEmployeesTab = hasAccess || hasAccessToEmployeeOffboardedEmployees;
  const hasAccessToOffboardingInProgressTab = hasAccess || hasAccessToEmployeeOffboardingInProgress;

  // Default tab: first available tab (Active Employees if allowed, else Employee Directory, etc.)
  const defaultTab = useMemo(() => {
    if (hasAccessToActiveEmployeesTab) return EMPLOYEE_TABS.DASHBOARD;
    if (hasAccessToOffboardingInProgressTab) return EMPLOYEE_TABS.OFFBOARDING;
    if (hasAccessToOffboardedEmployeesTab) return EMPLOYEE_TABS.OFFBOARDED;
    return EMPLOYEE_TABS.DIRECTORY;
  }, [hasAccessToActiveEmployeesTab, hasAccessToOffboardingInProgressTab, hasAccessToOffboardedEmployeesTab]);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentPath = location.pathname;
  const [activeTab, setActiveTab] = useState(
      searchParams.get('tab') || defaultTab
  );
  const showEmployeeDetails = searchParams.get("showEmployeeDetails") === "true";
  const employeeUuidParam = searchParams.get("employeeUuid");

  // Permission check for viewing employee details via URL
  const isOwnProfile = user?.employeeUuid === employeeUuidParam;
  const hasAccessToViewEmployeeDetails = hasAccess || isOwnProfile || 
    hasAccessToActiveEmployees || 
    hasAccessToEmployeeOffboardingInProgress || 
    hasAccessToEmployeeOffboardedEmployees ||
    myHrmsAccess?.permissions?.some(perm => 
      perm.name === "EmployeeDirectoryAdmin_View"
    );

  // Tabs the user is allowed to see, based on permissions (not just admin)
  const validTabsList = useMemo(() => {
    const tabs = [EMPLOYEE_TABS.DIRECTORY]; // Employee Directory always available
    if (hasAccessToActiveEmployeesTab) tabs.push(EMPLOYEE_TABS.DASHBOARD);
    if (hasAccessToOffboardingInProgressTab) tabs.push(EMPLOYEE_TABS.OFFBOARDING);
    if (hasAccessToOffboardedEmployeesTab) tabs.push(EMPLOYEE_TABS.OFFBOARDED);
    return tabs;
  }, [hasAccessToActiveEmployeesTab, hasAccessToOffboardingInProgressTab, hasAccessToOffboardedEmployeesTab]);


useEffect(() => {
    // Don't make routing decisions until permissions are loaded
    if (!myHrmsAccessLoaded && !hasAccess) return;

    // Valid tabs = tabs the user has permission to see (validTabsList)
    const validTabs = validTabsList;
    const tabFromUrl = searchParams.get('tab');
    let targetTab = defaultTab;

    // If on /employee-directory route
    if (currentPath === "/employee-directory") {
        // User clicked a valid non-directory tab (e.g. Offboarding) -> go to /employee-repo with that tab
        if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== EMPLOYEE_TABS.DIRECTORY) {
            navigate(`/employee-repo?tab=${tabFromUrl}`, { replace: true });
            setActiveTab(tabFromUrl);
            return;
        }
        // If user has access to Active Employees, redirect to /employee-repo
        if (hasAccessToActiveEmployees || hasAccess) {
            navigate("/employee-repo", { replace: true });
            return;
        }
        // Otherwise, ensure we're showing Employee Directory tab
        targetTab = EMPLOYEE_TABS.DIRECTORY;
    }
    // If on /employee-repo route and user doesn't have access to any repo tab except directory, redirect to /employee-directory
    else if (currentPath === "/employee-repo" && validTabs.length === 1 && validTabs[0] === EMPLOYEE_TABS.DIRECTORY) {
        navigate("/employee-directory", { replace: true });
        return;
    }
    // Prefer current activeTab if valid (e.g. user just clicked; URL may not have updated yet)
    else if (validTabs.includes(activeTab)) {
        targetTab = activeTab;
    }
    // Otherwise use tab from URL if valid
    else if (tabFromUrl && validTabs.includes(tabFromUrl)) {
        targetTab = tabFromUrl;
    }
    else {
        targetTab = defaultTab;
    }

    // Update URL params if needed
    if (searchParams.get('tab') !== targetTab) {
        setSearchParams({ tab: targetTab }, { replace: true });
    }
    // Update active tab state if needed
    if (activeTab !== targetTab) {
        setActiveTab(targetTab);
    }
}, [hasAccess, hasAccessToActiveEmployees, searchParams, setSearchParams, activeTab, currentPath, validTabsList, defaultTab, navigate, myHrmsAccessLoaded]);

  useEffect(() => {
        dispatch(getAllComponentTypes());
        dispatch(getAllEmployee());
    }, [dispatch]);
  const {
    loading,
  
    outStandingCheckOut = {},
  } = useSelector((state) => state.hrRepositoryReducer || {});

  const [checkOutPopup, setCheckOutPopup] = useState(false);

  
  useEffect(() => {
    if (outStandingCheckOut && outStandingCheckOut.isShowCheckoutPopup) {
      setCheckOutPopup(true);
    }
  }, [outStandingCheckOut]);


  const handleOustandingCheckout = (checkOutTime) => {
    const updatedData = {
      attendanceDate: outStandingCheckOut?.outstandingDate,
      checkOutTime,
    };

    dispatch(
      updateEmployeeOutstandingCheckout(
        outStandingCheckOut.attendanceId,
        updatedData,
        user.employeeUuid
      )
    );

    setCheckOutPopup(false);
  };

  const tabsEnum = {
    DASHBOARD: "Active Employees",
    EMPLOYEE_DIRECTORY: "Employee Directory",
    OFFBOARDING_IN_PROGRESS: "Offboarding In Progress",
    OFFBOARDED_EMPLOYEES: "Offboarded Employees"
  };

const handleActiveTab = useCallback((tabId) => {
  setActiveTab(tabId);
  setSearchParams({ tab: tabId });
}, [setSearchParams]);


  const renderContent = () => {
    switch (activeTab) {
      case EMPLOYEE_TABS.DASHBOARD:
        return <EmployeeRepositoryDashboard />;
      case EMPLOYEE_TABS.DIRECTORY:
        { const hasAccessToDirectory = hasAccess || 
          myHrmsAccess?.permissions?.some(perm => perm.name === "EmployeeDirectoryAdmin_View");
        return <EmployeeDirectory hasAccess={hasAccessToDirectory}/> }
      case EMPLOYEE_TABS.OFFBOARDING:
        return <EmployeeOffboardingInProgress />;
      case EMPLOYEE_TABS.OFFBOARDED:
        return <EmployeeOffboarded />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`employee_repository_container ${showEmployeeDetails ? "employee_details_view" : ""}`}>
        {!showEmployeeDetails && (
          <>
            <div className="employee_repository_tabs" data-active={activeTab}>
                { (hasAccessToActiveEmployeesTab) && (
                  <span
                    onClick={() => handleActiveTab(EMPLOYEE_TABS.DASHBOARD, tabsEnum.DASHBOARD)}
                    className={activeTab === EMPLOYEE_TABS.DASHBOARD ? "active_tab" : "inactive_tab"}
                  >
                    <img
                      src={
                        activeTab === EMPLOYEE_TABS.DASHBOARD
                          ? Active_employees_icon
                          : Inactive_employees_icon
                      }
                      alt="Employees Icon"
                      className="employees_icon"
                    />
                    <p>Active Employees</p>
                  </span>
                 )}
                  { (hasAccessToOffboardingInProgressTab) &&(
                  <span
                    onClick={() => handleActiveTab(EMPLOYEE_TABS.OFFBOARDING,tabsEnum.OFFBOARDING_IN_PROGRESS)}
                    className={activeTab === EMPLOYEE_TABS.OFFBOARDING ? "active_tab" : "inactive_tab"}
                  >
                    <img
                      src={
                        activeTab === EMPLOYEE_TABS.OFFBOARDING
                          ? Active_offboarding_icon
                          : Inactive_offboarding_icon
                      }
                      alt="Employees Icon"
                      className="employees_icon"
                    />
                    <p>Offboarding In Progress</p>
                  </span>
                  )}
                   { (hasAccessToOffboardedEmployeesTab) &&(
                  <span
                    onClick={() => handleActiveTab(EMPLOYEE_TABS.OFFBOARDED,tabsEnum.OFFBOARDED_EMPLOYEES)}
                    className={activeTab === EMPLOYEE_TABS.OFFBOARDED ? "active_tab" : "inactive_tab"}
                  >
                    <img
                      src={
                        activeTab === EMPLOYEE_TABS.OFFBOARDED
                          ? Active_offboarded_icon
                          : Inactive_offboarded_icon
                      }
                      alt="Employees Icon"
                      className="employees_icon"
                    />
                    <p>Offboarded Employees</p>
                  </span>
                   )}
               
                  <span
                    onClick={() => handleActiveTab(EMPLOYEE_TABS.DIRECTORY,tabsEnum.EMPLOYEE_DIRECTORY)}
                    className={activeTab === EMPLOYEE_TABS.DIRECTORY ? "active_tab" : "inactive_tab"}
                  >
                    <img
                      src={
                        activeTab === EMPLOYEE_TABS.DIRECTORY
                          ? Active_employees_icon
                          : Inactive_employees_icon
                      }
                      alt="Employees Icon"
                      className="employees_icon"
                    />
                    <p>Employee Directory</p>
                  </span>
                </div>
            <hr />
          </>
        )}
        <div className="leave_management_tab_content" role="tabpanel">
          {showEmployeeDetails 
            ? (!myHrmsAccessLoaded && !hasAccess 
                ? <div className="permissions-loading">Loading...</div>
                : hasAccessToViewEmployeeDetails 
                  ? <EmployeeDetailsPage /> 
                  : <AccessDenied 
                      message="You don't have permission to view this employee's details."
                      submessage="Please contact your administrator to get the required access."
                    />
              )
            : renderContent()
          }
        </div>
      </div>

      
      <CheckoutPopup
        isOpen={checkOutPopup}
        outstandingDate={outStandingCheckOut?.outstandingDate}
        checkInTime={outStandingCheckOut?.checkInTime}
        isLoading={loading}
        handleOustandingCheckout={handleOustandingCheckout}
      />
    </>
  );
};

export default EmployeeRepo;
