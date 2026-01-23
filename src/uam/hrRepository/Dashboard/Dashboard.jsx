import { useSelector } from "react-redux";
import MyUpdates from "../Dashboard/components/MyUpdates";
import MyProfile from "./components/MyProfile";
import EventCard from "./components/EventCard";
import LeaveCard from "./components/LeaveCard";
import "./dashboard.scss";
import EmployeeChart from "./components/EmployeeChart";
import EmployeeDetailsPage from "../EmployeeRepository/components/EmployeeDetailsPage";
import { 
    getAllBirthdayAndAnniversary, 
    getCurrentEmployeeDetails, 
    getAllManagers, 
    getAllComponentTypes, 
    getAllCountriesDetails, 
    getAllEmployee,
    getCheckInCheckOutStatus, 
    employeeCheckIn,
    employeeCheckOut,
    checkOutstandingCheckout,
    updateEmployeeOutstandingCheckout,
    getCurrentEmployeeNotifications,
} from "../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Snackbar from "../Common/components/Snackbar";
import check_in_icon from "../assets/icons/check_in_icon.svg";
import check_out_icon from "../assets/icons/check_out_icon.svg";
import check_in_disable_icon from "../assets/icons/check_in_disabled_icon.svg";
import check_out_disable_icon from "../assets/icons/check_out_disabled_icon.svg";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import { useSearchParams } from "react-router-dom";
import LoadingSpinner from "../Common/components/LoadingSpinner";
import { hrToolHomePageData } from "../constant/data";

const Dashboard = () => {
    const { user } = useSelector((state) => state.user);
    const { 
        loading, 
        currentEmployeeDetailsLoading, 
        allEmployeesBirthday, 
        allEmployeesAnniversary, 
        currentEmployeeDetails, 
        getAllManagersDetails, 
        checkInCheckOutStatus,
        outStandingCheckOut, 
        getAllComponentType, 
        allEmployees,
        myUpdates,
        organizationUpdates,
    } = useSelector((state) => state.hrRepositoryReducer);
    const [searchParams, setSearchParams] = useSearchParams();
    const viewProfilePage = searchParams.get('showEmployeeDetails') === 'true';
    const employeeUuid = searchParams.get('employeeUuid') || user.employeeUuid;
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
    const Year = new Date().getFullYear();
    const BirthdayTitle = `Birthdays - ${monthName} ${Year}`;
    const WorkAnniversariesTitle = "Work Anniversaries";

    const dispatch = useDispatch();
    const [checkOutPopup, setCheckOutPopup] = useState(false);

    useEffect(() => {
        dispatch({
            type: "SET_SELECTED_TOOL_NAME",
            payload: hrToolHomePageData.toot_title2
        });
    }, [dispatch]);

    // Handle URL parameter updates
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (params.get('employeeUuid') !== employeeUuid) {
            params.set('employeeUuid', employeeUuid);
            setSearchParams(params);
        }
    }, [employeeUuid, setSearchParams, searchParams]);
    
    // Single useEffect for all data fetching to prevent multiple loading states
    useEffect(() => {
        const fetchData = async () => {
            // Birthday and Anniversary data
            if (
                Array.isArray(allEmployeesBirthday) && allEmployeesBirthday.length === 0 &&
                Array.isArray(allEmployeesAnniversary) && allEmployeesAnniversary.length === 0
            ) {
                dispatch(getAllBirthdayAndAnniversary());
            }

            // Current employee details - only fetch if not already loaded
            if (!currentEmployeeDetails || currentEmployeeDetails.employeeUuid !== user.employeeUuid) {
                dispatch(getCurrentEmployeeDetails(user.employeeUuid));
            }

            // Managers data
            if (Array.isArray(getAllManagersDetails) && getAllManagersDetails.length === 0) {
                dispatch(getAllManagers());
            }

            // All employees data
            if (Array.isArray(allEmployees) && allEmployees.length === 0) {
                dispatch(getAllEmployee());
            }

            // Countries data - only fetch if not already loaded
            dispatch(getAllCountriesDetails());

            // Check-in/Check-out status
            if (Array.isArray(checkInCheckOutStatus) && checkInCheckOutStatus.length === 0) {
                dispatch(getCheckInCheckOutStatus(user.employeeUuid));
            }

            // Outstanding checkout
            if (Array.isArray(outStandingCheckOut) && outStandingCheckOut.length === 0) {
                dispatch(checkOutstandingCheckout(user.employeeUuid));
            }

            // Component types
            if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
                dispatch(getAllComponentTypes());
            }

            // Notifications
            if (!myUpdates?.length || !organizationUpdates?.length) {
                dispatch(getCurrentEmployeeNotifications(user.employeeUuid));
            }
        };

        fetchData();
    }, [dispatch, user.employeeUuid]);

    useEffect(() => {
        if (outStandingCheckOut && outStandingCheckOut.isShowCheckoutPopup) {
            setCheckOutPopup(true);
        }
    }, [outStandingCheckOut]);

    const handleCheckIn = () => {
        dispatch(employeeCheckIn(user.employeeUuid))
    }

    const handleCheckOut = () => {
        dispatch(employeeCheckOut(user.employeeUuid))
    }

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
    {
        viewProfilePage ? (
            <EmployeeDetailsPage />
        ) : 
    
     <>
        {(loading  || currentEmployeeDetailsLoading)?  (
            <LoadingSpinner message="Loading dashboard..." height="40vh" />
        ) : (
        <>
            <div className="main_table_header_div_dashboard" id="top">
                <div className="inner-div-left-section_dashboard">
                    <p className="inner-div-left-title_dashboard">Welcome, {user?.name}!</p>
                    <p className="inner-div-left-subtitle-2_dashboard">
                        Here you can view key insights and stay updated on important details.
                    </p>         
                </div>
                <div className="check_in_check_out_container">
                    <div 
                        className={`check_in ${!checkInCheckOutStatus?.checkInStatus ? 'disabled' : ''}`}
                        onClick={handleCheckIn}>
                        <img 
                            src={user?.checkInStatus ? check_in_icon : check_in_disable_icon} 
                            alt="check-in-icon"
                            className="check_in_icon" 
                        />
                        <p className="check_in_text">Check-In</p>
                    </div>
                    <div 
                        className={`check_out ${!checkInCheckOutStatus?.checkOutStatus ? 'disabled' : ''}`}
                        onClick={handleCheckOut}>
                        <img 
                            src={user?.checkOutStatus ? check_out_icon : check_out_disable_icon} 
                            alt="check-out-icon" 
                            className="check_in_icon" 
                        />
                        <p className="check_out_text">Check-Out</p>
                    </div>
                </div>
            </div>

            <div className="main-body-container">
                <div className="inner-body-container">
                    <div className="inner-container">
                        <MyUpdates />
                        <LeaveCard />
                    </div>
                    <div className="inner-container">
                        <div className="event-card-container">
                            <EventCard name={BirthdayTitle} data={allEmployeesBirthday}/>
                            <EventCard name={WorkAnniversariesTitle} data={allEmployeesAnniversary}/>
                        </div>
                        <EmployeeChart/>
                    </div>
                </div>
                <MyProfile currentEmployeeDetails={currentEmployeeDetails} getAllManagersDetails={getAllManagersDetails}/>
            </div>
        </>)}   
     </>
    }
    <Snackbar />
    <CheckoutPopup 
        isOpen={checkOutPopup}
        outstandingDate={outStandingCheckOut?.outstandingDate}
        checkInTime={outStandingCheckOut?.checkInTime}
        isLoading={loading}
        handleOustandingCheckout={handleOustandingCheckout}
    />
</>)
}

export default Dashboard;
