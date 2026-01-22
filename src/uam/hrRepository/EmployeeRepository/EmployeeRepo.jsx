import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./styles/EmployeeRepo.scss";
import { useEffect, useState, useCallback, useMemo } from "react";
import EmployeeRepositoryDashboard from "./components/EmployeeRepositoryDashboard";
import EmployeeDirectory from "./components/EmployeeDirectory";
import { useLocation } from "react-router-dom";

import CheckoutPopup from "../Common/components/CheckoutPopup";

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
  const allToolsAccessDetails = useSelector(state => state.user.allToolsAccessDetails);
  const selectedToolName = useSelector(state => state.mittarvtools.selectedToolName);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);

  const userAccessLevel = allToolsAccessDetails?.[selectedToolName];
  const hasAccess = userAccessLevel >= 900;
  
  // Check for Active Employee permissions (NOT including EmployeeDirectoryAdmin_View)
  const hasAccessToActiveEmployees = myHrmsAccess?.permissions?.some(perm => 
    perm.name === "ActiveEmployee_read" || 
    perm.name === "ActiveEmployee_update" || 
    perm.name === "ActiveEmployee_onBoarding"
  );
  
  // Check for Employee Directory Admin View permission (separate from Active Employees)
  const hasEmployeeDirectoryAdminAccess = myHrmsAccess?.permissions?.some(perm => 
    perm.name === "EmployeeDirectoryAdmin_View"
  );
  
  // Note: OffBoardedEmployee and OffBoardingInProgress permissions don't exist in the migration
  // These tabs are accessible to admins (>= 900) only
  const hasAccessToOffboardedEmployees = hasAccess;
  const hasAccessToOffboarding = hasAccess;

  // Default tab: Active Employees if user has access to Active Employees, otherwise Employee Directory
  // Note: EmployeeDirectoryAdmin_View does NOT grant access to Active Employees tab
  const defaultTab = (hasAccess || hasAccessToActiveEmployees) ? EMPLOYEE_TABS.DASHBOARD : EMPLOYEE_TABS.DIRECTORY;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentPath = location.pathname;
  const [activeTab, setActiveTab] = useState(
      searchParams.get('tab') || defaultTab
  );
 
  const ALL_TABS = useMemo(() => Object.values(EMPLOYEE_TABS), []);
  const LIMITED_TABS = useMemo(() => [EMPLOYEE_TABS.DIRECTORY], []);


useEffect(() => {
    // Determine valid tabs based on access
    // Active Employees tab: only if user has ActiveEmployee permissions OR admin access
    // Employee Directory tab: always available (for users with EmployeeDirectoryAdmin_View or no access)
    const validTabs = (hasAccess || hasAccessToActiveEmployees) ? ALL_TABS : LIMITED_TABS;
    const tabFromUrl = searchParams.get('tab');
    let targetTab = defaultTab;
    
    // If on /employee-directory route
    if (currentPath === "/employee-directory") {
        // If user has access to Active Employees, redirect to /employee-repo
        if (hasAccessToActiveEmployees || hasAccess) {
            navigate("/employee-repo", { replace: true });
            return;
        }
        // Otherwise, ensure we're showing Employee Directory tab
        targetTab = EMPLOYEE_TABS.DIRECTORY;
    }
    // If on /employee-repo route and user doesn't have access to Active Employees, redirect to /employee-directory
    else if (currentPath === "/employee-repo" && !hasAccessToActiveEmployees && !hasAccess) {
        navigate("/employee-directory", { replace: true });
        return;
    }
    // Use tab from URL if valid, otherwise use default
    else if (tabFromUrl && validTabs.includes(tabFromUrl)) {
        targetTab = tabFromUrl;
    } 
    else if (!validTabs.includes(activeTab)) {
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
}, [hasAccess, hasAccessToActiveEmployees, searchParams, setSearchParams, activeTab, currentPath, ALL_TABS, LIMITED_TABS, defaultTab, navigate]);

  useEffect(() => {
        dispatch(getAllComponentTypes());
        dispatch(getAllEmployee());
    }, [dispatch]);
  const { user } = useSelector((state) => state.user);
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

const handleActiveTab = useCallback((tabId, tabLabel) => {
   if ([EMPLOYEE_TABS.OFFBOARDING, EMPLOYEE_TABS.OFFBOARDED].includes(tabId)) {
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: `${tabLabel} feature coming soon!`,
        severity: "info",
      },
    });
    return;
  }
 

  setActiveTab(tabId);
  setSearchParams({ tab: tabId });
}, [dispatch,setSearchParams]);


  const renderContent = () => {
    switch (activeTab) {
      case EMPLOYEE_TABS.DASHBOARD:
        return <EmployeeRepositoryDashboard />;
      case EMPLOYEE_TABS.DIRECTORY:
        { const hasAccessToDirectory = hasAccess || 
          myHrmsAccess?.permissions?.some(perm => perm.name === "EmployeeDirectoryAdmin_View");
        return <EmployeeDirectory hasAccess={hasAccessToDirectory}/> }
      default:
        return null;
    }
  };

  return (
    <>
      <div className="employee_repository_container">
        <div className="employee_repository_tabs" data-active={activeTab}>
            { (hasAccess || hasAccessToActiveEmployees) && (
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
              { (hasAccess || hasAccessToOffboarding) &&(
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
               { (hasAccess || hasAccessToOffboardedEmployees) &&(
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
        <div className="leave_management_tab_content" role="tabpanel">
          {renderContent()}
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
