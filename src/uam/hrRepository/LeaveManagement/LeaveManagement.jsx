import { useEffect, useState } from "react";
import LeaveAttendance from "./components/LeaveAttendance";
import LeaveHolidays from "./components/LeaveHolidays";
import LeaveStatus from "./components/LeaveStatus";
import "./styles/LeaveManagement.scss";
import Inactive_calendar_icon from "../assets/icons/Inactive_calendar_icon.svg";
import Active_calendar_icon from "../assets/icons/Active_calendar_icon.svg";
import Inactive_Leave_status_icon from "../assets/icons/Inactive_Leave_status_icon.svg";
import Active_leave_status_icon from "../assets/icons/Active_leave_status_icon.svg";
import Inactive_holiday_tab_icon from "../assets/icons/Inactive_holiday_tab_icon.svg";
import Active_holiday_tab_icon from "../assets/icons/Active_holiday_tab_icon.svg";
import { useSelector } from "react-redux";
import {
  getCurrentEmployeeDetails,
  getAllComponentTypes,
  getAllEmployee,
  checkOutstandingCheckout,
  getCheckInCheckOutStatus,
  updateEmployeeOutstandingCheckout,
} from "../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import Snackbar from "../Common/components/Snackbar";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import { hrToolHomePageData } from "../constant/data";
const LeaveManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("tab1");
  const { 
        loading,
      
        checkInCheckOutStatus,
        outStandingCheckOut, 
        getAllComponentType, 
    } = useSelector((state) => state.hrRepositoryReducer);
  const [checkOutPopup, setCheckOutPopup] = useState(false);

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2
    });
  }, [dispatch])

  useEffect(() => {
    const employeeId = user?.employeeUuid;
    if (employeeId) {
      dispatch(getCurrentEmployeeDetails(employeeId));
    }
    if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
        dispatch(getAllComponentTypes());
    }
    dispatch(getAllEmployee());

    if (Array.isArray(outStandingCheckOut) && outStandingCheckOut.length === 0) {
          dispatch(checkOutstandingCheckout(user.employeeUuid));
    }
    
    if (Array.isArray(checkInCheckOutStatus) && checkInCheckOutStatus.length === 0) {
          dispatch(getCheckInCheckOutStatus(user.employeeUuid));
    }
    
  }, [dispatch, user]);

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
    switch (activeTab) {
      case "tab1":
        return <LeaveAttendance />;
      case "tab2":
        return <LeaveStatus />;
      case "tab3":
        return <LeaveHolidays />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="leave_management_container">
        <div
          className="leave_management_requests_tabs"
          data-active={activeTab}
        >
              <span
                onClick={() => setActiveTab("tab1")}
                className={activeTab === "tab1" ? "active_tab" : "inactive_tab"}
              >
                <img
                  src={
                    activeTab === "tab1"
                      ? Active_calendar_icon
                      : Inactive_calendar_icon
                  }
                  alt="Leave Calendar Icon"
                  className="leave_calendar_icon"
                />
                <p>Leave & Attendance</p>
              </span>
              <span
                onClick={() => setActiveTab("tab2")}
                className={activeTab === "tab2" ? "active_tab" : "inactive_tab"}
              >
                <img
                  src={
                    activeTab === "tab2"
                      ? Active_leave_status_icon
                      : Inactive_Leave_status_icon
                  }
                  alt="Leave Calendar Icon"
                  className="leave_calendar_icon"
                />
                <p>Leave Status</p>
              </span>
              <span
                onClick={() => setActiveTab("tab3")}
                className={activeTab === "tab3" ? "active_tab" : "inactive_tab"}
              >
                <img
                  src={
                    activeTab === "tab3"
                      ? Active_holiday_tab_icon
                      : Inactive_holiday_tab_icon
                  }
                  alt="Leave Calendar Icon"
                  className="leave_calendar_icon"
                />
                <p>Holidays</p>
              </span>
            </div>
        <hr />
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

export default LeaveManagement;
