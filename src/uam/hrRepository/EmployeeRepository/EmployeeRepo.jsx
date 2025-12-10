import Sidebar from "../../../components/sidebar/Sidebar";
import Header from "../../../components/header/Header";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import "./styles/EmployeeRepo.scss";
import { useEffect, useState, useCallback } from "react";
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
import Active_employees_icon from "../../../assets/icons/Active_employees_icon.svg";
import Inactive_employees_icon from "../../../assets/icons/Inactive_employees_icon.svg";
import Inactive_offboarding_icon from "../../../assets/icons/Inactive_offboarding_icon.svg";
import Inactive_offboarded_icon from "../../../assets/icons/Inactive_offboarded_icon.svg";
import Active_offboarding_icon from "../../../assets/icons/Active_offboarding_icon.svg";
import Active_offboarded_icon from "../../../assets/icons/Active_offboarded_icon.svg";
const EmployeeRepo = () => {
  const dispatch = useDispatch();
  const allToolsAccessDetails = useSelector(state => state.user.allToolsAccessDetails);
  const selectedToolName = useSelector(state => state.mittarvtools.selectedToolName);


  const userAccessLevel = allToolsAccessDetails?.[selectedToolName];
  const hasAccess=userAccessLevel>=500
  const defaultTab = hasAccess ? EMPLOYEE_TABS.DASHBOARD : EMPLOYEE_TABS.DIRECTORY;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentPath = location.pathname;
  const [activeTab, setActiveTab] = useState(
      searchParams.get('tab') || EMPLOYEE_TABS.DASHBOARD
  );
 
  const ALL_TABS = Object.values(EMPLOYEE_TABS);
const LIMITED_TABS = [EMPLOYEE_TABS.DIRECTORY];


useEffect(() => {
    
    if (hasAccess && currentPath === "/employee-directory") {
        window.location.replace("/employee-repo");
        return; 
    }
    const validTabs = hasAccess ? ALL_TABS : LIMITED_TABS;
    const tabFromUrl = searchParams.get('tab');
    let targetTab = defaultTab; 
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
        targetTab = tabFromUrl;
    } 
    else if (!validTabs.includes(activeTab)) {
        targetTab = defaultTab;
    }
    if (searchParams.get('tab') !== targetTab) {
        setSearchParams({ tab: targetTab }, { replace: true });
    }
    if (activeTab !== targetTab) {
        setActiveTab(targetTab); 
    }
}, [hasAccess, searchParams, setSearchParams, activeTab, currentPath]);
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
        return <EmployeeDirectory hasAccess={hasAccess}/>
      default:
        return null;
    }
  };

  return (
    <>
      <div className="employee_repository_main_container">
        <Sidebar/>

        <div className="employee_repository_header_container">
          <Header />

          <div className="employee_repository_body_container">

            <div className="employee_repository_tabs" data-active={activeTab}>
            { hasAccess &&(
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
              { hasAccess &&(
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
               { hasAccess &&(
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

            <div className="tab_content">{renderContent()}</div>
          </div>
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
