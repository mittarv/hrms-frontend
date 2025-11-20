import Sidebar from "../../../components/sidebar/Sidebar";
import Header from "../../../components/header/Header";
import { useSelector, useDispatch } from "react-redux";
import "./styles/EmployeeRepositoryDashboard.scss";
import Add_icon from "../../../assets/icons/add_icon_without_background.svg";
import { useEffect, useState } from "react";
import EmployeeRepositoryTable from "./components/EmployeeRepositoryTable";
import {
  getAllEmployee,
  getAllComponentTypes,
  getAllManagers,
  getAllCountriesDetails,
  checkOutstandingCheckout,
  getCheckInCheckOutStatus,
  updateEmployeeOutstandingCheckout,
} from "../../../actions/hrRepositoryAction";
import { useSearchParams } from "react-router-dom";
import EmployeeOnBoardingForm from "./components/EmployeeOnBoardingForm";
import EmployeeDetailsPage from "./components/EmployeeDetailsPage";
import Snackbar from "../Common/components/Snackbar";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import LoadingSpinner from "../Common/components/LoadingSpinner";
import { toolHomePageData } from "../../../constant/data";

const EmployeeRepositoryDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const { 
        loading,
        checkInCheckOutStatus,
        outStandingCheckOut,
        getAllComponentType,  
      } = useSelector((state) => state.hrRepositoryReducer);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const showEmployeeOnBOardingForm =
    searchParams.get("EmployeeOnBoardingForm") === "true";
  const showEmployeeDetails =
    searchParams.get("showEmployeeDetails") === "true";
  const [checkOutPopup, setCheckOutPopup] = useState(false);
  const handleAddEmployeeForm = () => {
    setSearchParams((prev) => {
      if (showEmployeeOnBOardingForm) {
        prev.delete("EmployeeOnBoardingForm");
      } else {
        prev.set("EmployeeOnBoardingForm", "true");
      }
      return prev;
    });
  };

  //Fetching all employees and dropdowns values with key
  useEffect(() => {
    if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
        dispatch(getAllComponentTypes());
    }
    dispatch(getAllEmployee());
    dispatch(getAllManagers());
    dispatch(getAllCountriesDetails());

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
  return ( 
    <>
      <div className="employee_repository_dashboard_main_container">
        <Sidebar />
        <div className="employee_repository_dashboard_header_container">
          <Header />
          {showEmployeeOnBOardingForm ? (
            <EmployeeOnBoardingForm />
          ) : showEmployeeDetails ? (
            <EmployeeDetailsPage />
          ) : (
            <div className="employee_repository_dashboard_body_container">
              <div className="employee_repository_dashboard_heading_container">
                <div className="employee_repository_dashboard_title_container">
                  <p className="employee_repository_dashboard_title">
                    Welcome, {user.name}!
                  </p>
                  <p className="employee_repository_dashboard_sub_title">
                    Here, you can view and maintain details within the employee
                    repository.
                  </p>
                </div>
                <div className="employee_repository_dashboard_buttons_container">
                  <button
                    className="employee_repository_dashboard_button"
                    onClick={handleAddEmployeeForm}
                  >
                    <p>
                      <img src={Add_icon} /> <span>Add Employee</span>
                    </p>
                  </button>
                </div>
              </div>
              {loading ? (
                <LoadingSpinner message="Loading Employees Data..." height="40vh" />
              ) : (
                <EmployeeRepositoryTable />
              )}
            </div>
          )}
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

export default EmployeeRepositoryDashboard;
