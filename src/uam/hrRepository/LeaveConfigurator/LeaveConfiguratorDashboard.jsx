import Sidebar from "../../../components/sidebar/Sidebar";
import Header from "../../../components/header/Header";
import Add_icon from "../../../assets/icons/add_icon_without_background.svg";
import { useSelector, useDispatch } from "react-redux";
import LeaveConfiguratorTable from "./components/LeaveConfiguratorTable";
import { useEffect, useRef } from "react";
import {
  getAllComponentTypes,
  getAllLeaves,
  getLeaveDetails,
  checkOutstandingCheckout,
  getCheckInCheckOutStatus,
  updateEmployeeOutstandingCheckout,
} from "../../../actions/hrRepositoryAction";
import "./styles/LeaveConfiguratorDashboard.scss";
import LeaveConfiguratorForm from "./components/LeaveConfiguratorForm";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { AddNewLeaveTypePopUp, LeaveCreatedSuccess } from "./components/LeaveConfiguratorPopup";
import Snackbar from "../Common/components/Snackbar";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import { toolHomePageData } from "../../../constant/data";

const LeaveConfiguratorDashboard = () => {
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const {
    loading,
    allExisitingLeaves,
    leaveCreatedSuccess,
    leaveUpdateSuccess,
    checkInCheckOutStatus,
    outStandingCheckOut, 
    getAllComponentType,
  } = useSelector((state) => state.hrRepositoryReducer);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showLeaveDropwon, setShowLeaveDropwon] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null); // Add a ref for the button
  const showLeaveConfiguratorForm =
    searchParams.get("showLeaveConfiguratorForm") === "true";
  const showAddLeaveForm = searchParams.get("showAddLeaveForm") === "true";
  const [NewLeaveName, setNewLeaveName] = useState("");
  const dispatch = useDispatch();
  const [checkOutPopup, setCheckOutPopup] = useState(false);

  useEffect(() => {
    dispatch(getAllLeaves());
    if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
            dispatch(getAllComponentTypes());
        }
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside both the dropdown and the button
      if (
        showLeaveDropwon &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowLeaveDropwon(false);
      }
    };

    // Use mousedown to catch the event before it bubbles up
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLeaveDropwon]); // Add showLeaveDropwon as a dependency

  const handleLeaveForm = (item) => {
    const leaveType = item.leaveType;
    const leaveConfigId = item.leaveConfigId;
    if (leaveType==="Unpaid" && allToolsAccessDetails?.[selectedToolName] < 900) {
      dispatch({ type: "SET_UNPAID_LEAVE_DISABLED" ,payload:true});
    }
    setShowLeaveDropwon(false);
    const isValidLeaveConfigId = allExisitingLeaves.some(
      (leave) => leave.leaveConfigId === leaveConfigId
    );

    if (isValidLeaveConfigId) {
      dispatch(getLeaveDetails(leaveConfigId));
      setSearchParams({
        showLeaveConfiguratorForm: "true",
        edit: "true",
        leaveConfigId: leaveConfigId,
      });
    }
  };

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setShowLeaveDropwon((prev) => !prev);
  };

  return (
    <div className="leave_configurator_dashboard_main_container">
      <Sidebar />
      <div className="leave_configurator_dashboard_header_container">
        <Header />

        {showLeaveConfiguratorForm ? (
          <LeaveConfiguratorForm />
        ) : (
          <>
            <div className="leave_configurator_dashboard_body_container">
              <div className="leave_configurator_dashboard_heading_container">
                <div className="leave_configurator_dashboard_title_container">
                  <p className="leave_configurator_dashboard_title">
                    Welcome, {user.name}!
                  </p>
                  <p className="leave_configurator_dashboard_sub_title">
                    Here, you can add or modify leaves
                  </p>
                </div>
                <div className="leave_configurator_dashboard_buttons_container">
                  <div className="Add_leaves_button_main_container">
                    <button
                      className="Add_leaves_button_container"
                      ref={buttonRef} 
                      onClick={toggleDropdown}
                    >
                      <div className="Add_leaves_button">
                        <img src={Add_icon} /> <span>Add Leaves</span>
                      </div>
                    </button>
                    {showLeaveDropwon && (
                      <div
                        className="Add_leaves_button_dropdown"
                        ref={dropdownRef}
                      >
                        {allExisitingLeaves
                          ?.filter((item) => item.isDefault) 
                          .map((item) => {
                            return (
                              <p
                                key={item.leaveConfigId}
                                className="Add_leaves_button_dropdown_item"
                                onClick={() => handleLeaveForm(item)}
                              >
                                {item.leaveType}
                              </p>
                            );
                        })}
                        <p
                          className="Add_leaves_button_dropdown_item"
                          onClick={() =>
                            setSearchParams({ showAddLeaveForm: true })
                          }
                        >
                          Add More +
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <LeaveConfiguratorTable />
            </div>
          </>
        )}
      </div>
      <Snackbar />
      {showAddLeaveForm && (
        <AddNewLeaveTypePopUp
          NewLeaveName={NewLeaveName}
          setNewLeaveName={setNewLeaveName}
          setShowLeaveDropwon={setShowLeaveDropwon}
        />
      )}
      {(leaveCreatedSuccess || leaveUpdateSuccess) && (
        <LeaveCreatedSuccess
          closePopup={() => {
            if (leaveCreatedSuccess) {
              dispatch({
                type: "SET_LEAVE_CREATED_SUCCESS",
                payload: false,
              });
            }
            if (leaveUpdateSuccess) {
              dispatch({
                type: "SET_LEAVE_UPDATE_SUCCESS",
                payload: false,
              });
            }
          }}
        />
      )}
      <CheckoutPopup 
        isOpen={checkOutPopup}
        outstandingDate={outStandingCheckOut?.outstandingDate}
        checkInTime={outStandingCheckOut?.checkInTime}
        isLoading={loading}
        handleOustandingCheckout={handleOustandingCheckout}
      />
    </div>
  );
};

export default LeaveConfiguratorDashboard;
