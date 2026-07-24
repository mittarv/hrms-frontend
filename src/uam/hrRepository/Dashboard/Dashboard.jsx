import { useSelector } from "react-redux";
import MyUpdates from "../Dashboard/components/MyUpdates";
import MyProfile from "./components/MyProfile";
import EventCard from "./components/EventCard";
import LeaveCard from "./components/LeaveCard";
import WinnerBanner from "./components/WinnerBanner";
import "./dashboard.scss";
import EmployeeChart from "./components/EmployeeChart";
import EmployeeDetailsPage from "../EmployeeRepository/components/EmployeeDetailsPage";
import AccessDenied from "../Common/components/AccessDenied";
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
    getOrganizationDetails,
} from "../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import Snackbar from "../Common/components/Snackbar";
import SetupWarningBanner from "../Common/components/SetupWarningBanner";
import check_in_icon from "../assets/icons/check_in_icon.svg";
import check_out_icon from "../assets/icons/check_out_icon.svg";
import check_in_disable_icon from "../assets/icons/check_in_disabled_icon.svg";
import check_out_disable_icon from "../assets/icons/check_out_disabled_icon.svg";
import CheckoutPopup from "../Common/components/CheckoutPopup";
import { useSearchParams } from "react-router-dom";
import LoadingSpinner from "../Common/components/LoadingSpinner";
import AccessRestrictedPopup from "./components/AccessRestrictedPopup";
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
        organizationDetails,
    } = useSelector((state) => state.hrRepositoryReducer);
    const [searchParams, setSearchParams] = useSearchParams();
    const viewProfilePage = searchParams.get('showEmployeeDetails') === 'true';
    const employeeUuidParam = searchParams.get('employeeUuid');
    const targetEmployeeUuid = employeeUuidParam || user?.employeeUuid;
    
    const fetchedUuidRef = useRef(null);
    const fetchedAttendanceUuidRef = useRef(null);

    // On Dashboard, only allow viewing own profile
    const isOwnProfile = !employeeUuidParam || employeeUuidParam === user?.employeeUuid;
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
    const Year = new Date().getFullYear();
    const BirthdayTitle = `Birthdays - ${monthName} ${Year}`;
    const WorkAnniversariesTitle = "Work Anniversaries";

    const dispatch = useDispatch();
    const [checkOutPopup, setCheckOutPopup] = useState(false);

    const isSuperAdmin = user?.userType === 900;
    const [orgDetails, setOrgDetails] = useState(null);

    const activeOrgData = orgDetails || organizationDetails;

    useEffect(() => {
        dispatch(getOrganizationDetails()).then(data => {
            if (data && !data.inactive) setOrgDetails(data);
        });
    }, [dispatch]);

    // If not super admin and no employee profile found, show "not onboarded" popup
    const showNotOnboardedPopup = !isSuperAdmin && !targetEmployeeUuid;

    useEffect(() => {
        dispatch({
            type: "SET_SELECTED_TOOL_NAME",
            payload: hrToolHomePageData.toot_title2
        });
    }, [dispatch]);

    // Automatically sync employeeUuid into URL search parameters if missing
    useEffect(() => {
        if (user?.employeeUuid && !employeeUuidParam) {
            const params = new URLSearchParams(searchParams);
            params.set('employeeUuid', user.employeeUuid);
            setSearchParams(params, { replace: true });
        }
    }, [user?.employeeUuid, employeeUuidParam, setSearchParams, searchParams]);
    
    // Single useEffect for all data fetching to prevent multiple loading states
    useEffect(() => {
        const fetchData = async () => {
            // Birthday and Anniversary data (single endpoint: fetch when either payload is not yet loaded)
            const anniversaryNotLoaded = Array.isArray(allEmployeesAnniversary)
                ? allEmployeesAnniversary.length === 0
                : (allEmployeesAnniversary?.workAnniversary12Month === undefined ||
                   allEmployeesAnniversary?.workAnniversary14Month === undefined);
            if (
                Array.isArray(allEmployeesBirthday) && allEmployeesBirthday.length === 0 &&
                anniversaryNotLoaded
            ) {
                dispatch(getAllBirthdayAndAnniversary());
            }

            // Current employee details - fetch for target employee (guarded by ref to prevent infinite retry loops)
            const loadedEmpUuid = currentEmployeeDetails?.employeeBasicDetails?.empUuid 
                || currentEmployeeDetails?.employeeContactDetails?.empUuid;

            if (
                targetEmployeeUuid && 
                !currentEmployeeDetailsLoading && 
                loadedEmpUuid !== targetEmployeeUuid && 
                fetchedUuidRef.current !== targetEmployeeUuid
            ) {
                fetchedUuidRef.current = targetEmployeeUuid;
                dispatch(getCurrentEmployeeDetails(targetEmployeeUuid));
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

            // Attendance and notification calls (guarded by ref per target UUID)
            if (targetEmployeeUuid && fetchedAttendanceUuidRef.current !== targetEmployeeUuid) {
                fetchedAttendanceUuidRef.current = targetEmployeeUuid;

                if (Array.isArray(checkInCheckOutStatus) && checkInCheckOutStatus.length === 0) {
                    dispatch(getCheckInCheckOutStatus(targetEmployeeUuid));
                }

                if (Array.isArray(outStandingCheckOut) && outStandingCheckOut.length === 0) {
                    dispatch(checkOutstandingCheckout(targetEmployeeUuid));
                }

                if (!myUpdates?.length || !organizationUpdates?.length) {
                    dispatch(getCurrentEmployeeNotifications(targetEmployeeUuid));
                }
            }

            // Component types
            if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
                dispatch(getAllComponentTypes());
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, targetEmployeeUuid]);

    useEffect(() => {
        if (outStandingCheckOut && outStandingCheckOut.isShowCheckoutPopup) {
            setCheckOutPopup(true);
        }
    }, [outStandingCheckOut]);

    const handleCheckIn = () => {
        if (targetEmployeeUuid) {
            dispatch(employeeCheckIn(targetEmployeeUuid))
        }
    }

    const handleCheckOut = () => {
        if (targetEmployeeUuid) {
            dispatch(employeeCheckOut(targetEmployeeUuid))
        }
    }

    const handleOustandingCheckout = (checkOutTime) => {
        const updatedData = {
            attendanceDate: outStandingCheckOut?.outstandingDate,
            checkOutTime,
        }
        dispatch(updateEmployeeOutstandingCheckout(outStandingCheckOut.attendanceId, updatedData, targetEmployeeUuid));
        setCheckOutPopup(false);   
    }
    
  return (
    <>
    {
        viewProfilePage ? (
            isOwnProfile ? <EmployeeDetailsPage /> : 
            <AccessDenied 
              message="You can only view your own profile from the Dashboard."
              submessage="To view other employee details, please go to Employee Repository."
              showDashboardButton={false}
              extraAction={{ label: "Go to Employee Repo", onClick: () => window.location.href = "/employee-repo" }}
            />
        ) : 
    
     <>
        {(loading || currentEmployeeDetailsLoading) ? (
            <LoadingSpinner message="Loading dashboard..." height="40vh" />
        ) : (
        <div className="dashboard_page">
            <SetupWarningBanner orgData={activeOrgData} />

            <div className="dashboard_top_section">
                <div className="main_table_header_div_dashboard" id="top">
                    <div className="inner-div-left-section_dashboard">
                        <p className="inner-div-left-title_dashboard">Welcome, {user?.name}!</p>
                        <p className="inner-div-left-subtitle-2_dashboard">
                            Here you can view key insights and stay updated on important details.
                        </p>
                    </div>
                    <div className="check_in_check_out_container">
                        <div
                            className={`check_in ${!checkInCheckOutStatus?.checkInStatus ? "disabled" : ""}`}
                            onClick={handleCheckIn}
                        >
                            <img
                                src={user?.checkInStatus ? check_in_icon : check_in_disable_icon}
                                alt="check-in-icon"
                                className="check_in_icon"
                            />
                            <p className="check_in_text">Check-In</p>
                        </div>
                        <div
                            className={`check_out ${!checkInCheckOutStatus?.checkOutStatus ? "disabled" : ""}`}
                            onClick={handleCheckOut}
                        >
                            <img
                                src={user?.checkOutStatus ? check_out_icon : check_out_disable_icon}
                                alt="check-out-icon"
                                className="check_in_icon"
                            />
                            <p className="check_out_text">Check-Out</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-body-container">
                <div className="main-body-columns">
                    <div className="dashboard-left-column">
                        {currentEmployeeDetails?.currentWinnerStatus && (
                            <div className="dashboard-winner-banner-wrap">
                                <WinnerBanner currentWinnerStatus={currentEmployeeDetails.currentWinnerStatus} />
                            </div>
                        )}
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
                    </div>
                    <div className="dashboard-profile-column">
                        <MyProfile currentEmployeeDetails={currentEmployeeDetails} getAllManagersDetails={getAllManagersDetails}/>
                    </div>
                </div>
            </div>
        </div>
        )}   
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
    <AccessRestrictedPopup isOpen={showNotOnboardedPopup} />
</>)
}

export default Dashboard;
