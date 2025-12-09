import Plus_icon from "../../../../assets/icons/Plus_icon.svg";
import Search_icon_grey from "../../../../assets/icons/Search_icon_grey.svg";
import { useSelector, useDispatch } from "react-redux";
import "../styles/LeaveAttendance.scss";
import AttendanceCalendar from "./AttendanceCalendar";
import LeaveApplication from "./LeaveApplication";
import { useEffect, useState, useMemo } from "react";
import {
  fetchAllPolicyDocuments,
  getAllLeaves,
  getCurrentEmployeeDetails,
  getLeaveBalanceWithAccrual,
} from "../../../../actions/hrRepositoryAction";
import mittarv_logo from "../../../../assets/images/mittarv_logo_dark.svg";
import Cross_icon from "../../../../assets/icons/cross_icon.svg";
import Dropdown_Arrow from "../../../../assets/icons/dropdow_arrow.svg";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const LeaveAttendance = () => {
  const {loading, currentEmployeeDetails, getAllComponentType} = useSelector((state) => state.hrRepositoryReducer);
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const hrRepositoryReducer = useSelector(
    (state) => state?.hrRepositoryReducer
  );
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const allEmployees = useMemo(
    () => hrRepositoryReducer.allEmployees ?? [],
    [hrRepositoryReducer.allEmployees]
  );
  const showCalendarAndTable = hrRepositoryReducer.showCalendarAndTable ?? false;
  const [applyLeave, setApplyLeave] = useState(false);
  const dispatch = useDispatch();
  const [handleEmployeeSearch, setHandleEmployeeSearch] = useState("");
  const [filterEmployees, setFilterEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    dispatch(getAllLeaves());
    dispatch(fetchAllPolicyDocuments());
    dispatch(getLeaveBalanceWithAccrual(currentEmployeeDetails?.employeeBasicDetails?.empUuid));
  }, [dispatch, currentEmployeeDetails?.employeeBasicDetails?.empUuid]);

  // Dynamic search effect - triggers whenever search input changes
  useEffect(() => {
    if (handleEmployeeSearch.trim().length > 0) {
      const filteredEmployees = allEmployees.filter((employee) => {
        const fullName =
          `${employee.employeeFirstName} ${employee.employeeLastName}`.toLowerCase();
        const matchesSearch = fullName.includes(
          handleEmployeeSearch.toLowerCase()
        );
        return matchesSearch;
      });
      setFilterEmployees(filteredEmployees);
    } else {
      setFilterEmployees([]);
    }
  }, [handleEmployeeSearch, allEmployees]);

  function getEmployeeTypeValue(key) {
    const empTypeDropdown = getAllComponentType?.emp_type_dropdown ?? {};
    return empTypeDropdown[key] || "";
  }
  // Function to get the current user's employee details
  // This function is used to get the employee details of the currently logged-in user
  const getCurrentUserEmployeeDetails = () => {
    return allEmployees.find(employee => employee.employeeUuid === user.employeeUuid);
  };

  const handleEmployeeSelect = (employee) => {
    dispatch(getCurrentEmployeeDetails(employee.employeeUuid));
    setSelectedEmployee(employee);
    setHandleEmployeeSearch(""); 
    setFilterEmployees([]);
  };

  const handleResetEmployee = () => {
    setSelectedEmployee(null);
    dispatch(getCurrentEmployeeDetails(user.employeeUuid));
    setHandleEmployeeSearch("");
    setFilterEmployees([]);
  };

  const handleCalendarView = () => {
    dispatch({ type: "SET_SHOW_CALENDAR_AND_TABLE", payload: !showCalendarAndTable });
  };

  const handleSearchInputChange = (e) => {
    setHandleEmployeeSearch(e.target.value);
  };

  return (
    <>
      {loading ? 
      <LoadingSpinner message="Loading..." height="40vh" /> 
      : 
      <div className="leave_attendance_main_container">
        <div className="leave_attendance_header_container">
          <span className="leave_attendance_header">
            <p className="leave_attendance_header_title">YOUR EMPLOYEE TYPE</p>
            <p className="leave_attendance_header_subtitle">
              {`${
                getEmployeeTypeValue(
                  getCurrentUserEmployeeDetails()?.employeeJobType
                ) ?? ""
              }`}{" "}
              {`${allToolsAccessDetails?.[selectedToolName] >= 500 ? " | Admin" : ""}`}
            </p>
          </span>
          <button
            className="leave_attendance_header_button"
            onClick={() => setApplyLeave(true)}
          >
            {" "}
            <img src={Plus_icon} alt="Plus_icon" />
            <span>Apply For Leave</span>
          </button>
        </div>
        {allToolsAccessDetails?.[selectedToolName] >= 500 && (
          <div className="leave_attendance_search_container">
            <input
              type="text"
              className="leave_attendance_search_input"
              placeholder="Search employees"
              value={handleEmployeeSearch}
              onChange={handleSearchInputChange}
            />
            <img
              src={Search_icon_grey}
              alt="Search_icon_grey"
              className="leave_attendance_search_icon"
            />
            {handleEmployeeSearch.length > 0 && (
              <div className="leave_attendance_search_result" >
                {filterEmployees.length > 0 ? (
                  filterEmployees.map((employee) => {
                    const isCurrentUser = employee.employeeUuid === user.employeeUuid;
                    return (
                      <div
                        className={`leave_attendance_search_result_container${isCurrentUser ? " disabled" : ""}`}
                        onClick={() => {
                          if (!isCurrentUser) handleEmployeeSelect(employee);
                        }}
                        key={employee.employeeUuid}
                        style={isCurrentUser ? { cursor: "not-allowed", opacity: 0.8} : {}}
                      >
                        <img src={employee.employeeProfileImage || mittarv_logo} alt="profile_pic" referrerPolicy="no-referrer"/>
                        <span>
                          {isCurrentUser
                            ? `${employee.employeeFirstName} ${employee.employeeLastName} (You)`
                            : `${employee.employeeFirstName} ${employee.employeeLastName}`}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="no_result_found">no result found</div>
                )}
              </div>
            )}
          </div>
        )}
        {allToolsAccessDetails?.[selectedToolName] >= 500 && (
          <div className="attendance_records_container">
            <p className="attendance_records_title">Attendance records of</p>
            <div className="attendance_records_employee_container">
              {selectedEmployee ? <img
                src={selectedEmployee?.employeeProfileImage || mittarv_logo}
                alt="profile_pic"
                className="profile_picture_container"
                referrerPolicy="no-referrer"
              /> :
              <img src = {user?.profilePic || mittarv_logo} alt="profile_pic" className="profile_picture_container" referrerPolicy="no-referrer"/>}
              <span>
                {selectedEmployee
                  ? `${selectedEmployee?.employeeFirstName} ${selectedEmployee?.employeeLastName}`
                  : `${user?.name}`}
              </span>
              {selectedEmployee && (
                <div
                  className="reset_slected_employee"
                  onClick={() => handleResetEmployee()}
                >
                  <img src={Cross_icon} alt="Cross_icon" />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="leave_attendance_calendar_subtitle" onClick={() => handleCalendarView()}>
          <p>
            🗓️ View attendance and leaves available
          </p>
          <img src={Dropdown_Arrow} alt="Calendar_icon" className={showCalendarAndTable ? "rotated" : "default_image"} />
        </div>
        <div className="leave_attendance_calendar_container">
          <AttendanceCalendar />
        </div>
      </div>}
      {applyLeave && (
        <LeaveApplication
          isOpen={applyLeave}
          onClose={() => setApplyLeave(false)}
        />
      )}
    </>
  );
};

export default LeaveAttendance;