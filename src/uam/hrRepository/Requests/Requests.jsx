import { useEffect, useState, useMemo, useCallback } from "react";
import EmployeeDetailsRequests from "./components/EmployeeDetailsRequests";
import LeaveRequests from "./components/LeaveRequests";
import { useSelector, useDispatch } from "react-redux";
import "./styles/Requests.scss";
import Active_employee_details_request from "../assets/icons/Active_employee_details_request.svg";
import Inactive_employee_details_request from "../assets/icons/Inactive_employee_details_request.svg";
import Active_calendar_icon from "../assets/icons/Active_calendar_icon.svg";
import Inactive_calendar_icon from "../assets/icons/Inactive_calendar_icon.svg";
import { 
  getAllPendingLeaveRequests,
  checkOutstandingCheckout,
  getCheckInCheckOutStatus,
  updateEmployeeOutstandingCheckout,
  getExtraWorkLogRequests,
 } from "../../../actions/hrRepositoryAction";
import Snackbar from "../Common/components/Snackbar";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import { hrToolHomePageData } from "../constant/data";
import ExtraWorkDayRequests from "./components/ExtraWorkDayRequests";
import Inactive_Leave_status_icon from "../assets/icons/Inactive_Leave_status_icon.svg";
import Active_leave_status_icon from "../assets/icons/Active_leave_status_icon.svg";


const Requests = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const {
    pendingRequests = [], 
    leavePendingRequests =[],
    loading,
    checkInCheckOutStatus,
    outStandingCheckOut, 
    extraWorkLogRequestsData,
    myHrmsAccess,
  } = useSelector((state) => state.hrRepositoryReducer || {});
  const dispatch = useDispatch();
  let startDate = "";
  let endDate = "";
  const [checkOutPopup, setCheckOutPopup] = useState(false);
  
  // Helper function to check if user has a specific permission (string or array)
  const hasPermission = useCallback((permissionNameOrArray) => {
    const permissions = myHrmsAccess?.permissions || [];
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    
    // Admin users have access to everything
    if (isAdmin) return true;
    
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
  }, [myHrmsAccess, allToolsAccessDetails, selectedToolName]);

  // Define tab permissions
  const tabPermissions = useMemo(() => {
    return {
      tab1: {
        permissions: ["EmployeeDetailsRequest_read", "EmployeeDetailsRequest_write"],
        label: "Employee Details Requests",
        count: pendingRequests.length,
        activeIcon: Active_employee_details_request,
        inactiveIcon: Inactive_employee_details_request,
      },
      tab2: {
        permissions: ["LeaveRequest_read", "LeaveRequest_write"],
        label: "Leave Requests",
        count: leavePendingRequests.length,
        activeIcon: Active_calendar_icon,
        inactiveIcon: Inactive_calendar_icon,
      },
      tab3: {
        permissions: ["ExtraWorkDayRequests_read", "ExtraWorkDayRequests_write"],
        label: "Extra Work Day Requests",
        count: extraWorkLogRequestsData.length,
        activeIcon: Active_leave_status_icon,
        inactiveIcon: Inactive_Leave_status_icon,
      },
    };
  }, [pendingRequests.length, leavePendingRequests.length, extraWorkLogRequestsData.length]);

  // Filter available tabs based on permissions
  const availableTabs = useMemo(() => {
    return Object.keys(tabPermissions).filter(tabId => 
      hasPermission(tabPermissions[tabId].permissions)
    );
  }, [tabPermissions, hasPermission]);

  // Set default active tab to first available tab
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  useEffect(() => {
    dispatch(getAllPendingLeaveRequests(startDate, endDate));
     if (Array.isArray(outStandingCheckOut) && outStandingCheckOut.length === 0) {
          dispatch(checkOutstandingCheckout(user.employeeUuid));
    }
    
    if (Array.isArray(checkInCheckOutStatus) && checkInCheckOutStatus.length === 0) {
          dispatch(getCheckInCheckOutStatus(user.employeeUuid));
    }

    if (Array.isArray(extraWorkLogRequestsData) && extraWorkLogRequestsData.length === 0) {
        dispatch(getExtraWorkLogRequests(startDate, endDate));
    }

    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

 useEffect(() => {
    if (outStandingCheckOut && outStandingCheckOut.isShowCheckoutPopup) {
        setCheckOutPopup(true);
    }
  }, [outStandingCheckOut]);

  const handleOustandingCheckout = (checkOutTime) => {
      const updatedData = {
          attendanceDate: outStandingCheckOut?.outstandingDate,
          checkOutTime,
      }
      dispatch(updateEmployeeOutstandingCheckout(outStandingCheckOut.attendanceId, updatedData, user.employeeUuid));
      setCheckOutPopup(false);   
  }
  const renderContent = () => {
    // Only render content if the active tab is available
    if (!availableTabs.includes(activeTab)) {
      return null;
    }
    
    switch (activeTab) {
      case "tab1":
        return <EmployeeDetailsRequests />;
      case "tab2":
        return <LeaveRequests/>;
      case "tab3":
        return <ExtraWorkDayRequests/>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="requests_container">
        <div className="requests_tabs" data-active={activeTab} role="tablist">
          {availableTabs.map((tabId) => {
            const tab = tabPermissions[tabId];
            return (
              <span
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={activeTab === tabId ? "active_tab" : "inactive_tab"}
              >
                <img
                  src={
                    activeTab === tabId
                      ? tab.activeIcon
                      : tab.inactiveIcon
                  }
                  alt="Leave Calendar Icon"
                  className="leave_calendar_icon"
                />
                {`${tab.label} (${tab.count})`}
              </span>
            );
          })}
        </div>
        <hr />
        <div className="requests_header_title_container">
          <p>Here, you can view and approve/reject requests.</p>
        </div>
        <div className="leave_management_tab_content" role="tabpanel">
          {renderContent()}
        </div>
      </div>
      <Snackbar />
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

export default Requests;
