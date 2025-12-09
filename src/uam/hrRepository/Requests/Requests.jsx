import { useEffect, useState } from "react";
import Header from "../../../components/header/Header";
import Sidebar from "../../../components/sidebar/Sidebar";
import EmployeeDetailsRequests from "./components/EmployeeDetailsRequests";
import LeaveRequests from "./components/LeaveRequests";
import { useSelector, useDispatch } from "react-redux";
import "./styles/Requests.scss";
import { 
  getAllPendingLeaveRequests,
  checkOutstandingCheckout,
  getCheckInCheckOutStatus,
  updateEmployeeOutstandingCheckout,
 } from "../../../actions/hrRepositoryAction";
import Snackbar from "../Common/components/Snackbar";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import { toolHomePageData } from "../../../constant/data";


const Requests = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const { user } = useSelector((state) => state.user);
  const {
    pendingRequests = [], 
    leavePendingRequests =[],
    loading,
    checkInCheckOutStatus,
    outStandingCheckOut, 
  } = useSelector((state) => state.hrRepositoryReducer || {});
  const dispatch = useDispatch();
  let startDate = "";
  let endDate = "";
  const [checkOutPopup, setCheckOutPopup] = useState(false);
  
  useEffect(() => {
    dispatch(getAllPendingLeaveRequests(startDate, endDate));
     if (Array.isArray(outStandingCheckOut) && outStandingCheckOut.length === 0) {
          dispatch(checkOutstandingCheckout(user.employeeUuid));
    }
    
    if (Array.isArray(checkInCheckOutStatus) && checkInCheckOutStatus.length === 0) {
          dispatch(getCheckInCheckOutStatus(user.employeeUuid));
    }

    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: toolHomePageData.toot_title2
    });
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
    switch (activeTab) {
      case "tab1":
        return <EmployeeDetailsRequests />;
      case "tab2":
        return <LeaveRequests/>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="requests_main_container">
        <Sidebar />
        <div className="requests_header_container">
          <Header />
          <div className="requests_body_container">
            <div className="requests_tabs" data-active={activeTab}>
              <span
                onClick={() => setActiveTab("tab1")}
                className={activeTab === "tab1" ? "active_tab" : ""}
              >
                {`Employee Details Requests (${pendingRequests.length})`}
              </span>
              <span
                onClick={() => setActiveTab("tab2")}
                className={activeTab === "tab2" ? "active_tab" : ""}
              >
                {`Leave Requests (${leavePendingRequests.length})`}
              </span>
            </div>
            <div className="requests_header_title_container">
              <p>Here, you can view and approve/reject requests.</p>
            </div>
            <div className="tab_content">{renderContent()}</div>
          </div>
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
