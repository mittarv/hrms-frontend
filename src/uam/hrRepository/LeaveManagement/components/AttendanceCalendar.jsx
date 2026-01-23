import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "../styles/AttendanceCalendar.scss";
import Left_arrow from "../../assets/icons/left_grey_arrow.svg";
import Right_arrow from "../../assets/icons/right_grey_arrow.svg";
import Edit_btn from "../../assets/icons/Edit_icon_btn.svg";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import EditAttendanceModal from "./EditAttendanceModal";
import LeaveAvailable from "./LeaveAvailable";
import AttendanceLog from "./AttendanceLog";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import { useSelector } from "react-redux";
import { normalizeTime } from "../../Common/utils/helper";
import {
  createAttendanceLog,
  getAttendanceLogs,
  deleteEmployeeAttendanceLog,
  updateEmployeeAttendanceLog,
  getLeaveBalanceWithAccrual,
  registerCompOffLeave,
  updateCompOffLeave
} from "../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import { getLeaveType } from "../../Common/utils/helper";
import { ATTENDANCE_STATUS } from "../../Common/utils/enums";

export default function AttendanceCalendar() {
  const {
    currentEmployeeDetails,
    employeeAttendanceData,
    showCalendarAndTable,
    attendanceLogsLoading,
  } = useSelector((state) => state.hrRepositoryReducer);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const dispatch = useDispatch();
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null); 
  const { allExisitingLeaves } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const hasAccessToEditAttendance = allToolsAccessDetails?.[selectedToolName] >= 900 || 
    myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveAttendance_write");

  // Memoize the employeeUuid to prevent unnecessary re-renders
  const employeeUuid = useMemo(() => {
    return currentEmployeeDetails?.employeeBasicDetails?.empUuid;
  }, [currentEmployeeDetails?.employeeBasicDetails?.empUuid]);

  const getLeaveTypeFromConfigId = useCallback(
    (leaveConfigId) => {
      if (!leaveConfigId || !allExisitingLeaves) return "";

      const leaveType = getLeaveType(leaveConfigId, allExisitingLeaves);

      return leaveType || "";
    },
    [allExisitingLeaves]
  );

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    if (employeeUuid) {
      dispatch({ type: "SET_ATTENDANCE_YEAR", payload: year });
      dispatch({ type: "SET_ATTENDANCE_MONTH", payload: month + 1 });
      dispatch(getAttendanceLogs(month + 1, year, employeeUuid));
    }
  }, [currentDate, employeeUuid, dispatch]);
  
  useEffect(() => {
    if (employeeAttendanceData && employeeAttendanceData.length > 0) {
      const processedData = {};
      employeeAttendanceData.forEach((record) => {
        if (!record?.isDeleted) {
          const attendanceDate = new Date(record?.attendanceDate);
          const year = attendanceDate.getFullYear();
          const month = String(attendanceDate.getMonth() + 1).padStart(2, "0");
          const day = String(attendanceDate.getDate()).padStart(2, "0");
          const dateKey = `${year}-${month}-${day}`;
          processedData[dateKey] = {
            attendanceId: record?.attendanceId,
            attendanceStatus: record?.attendanceStatus,
            checkIn: normalizeTime(record?.checkIn),
            checkOut: normalizeTime(record?.checkOut),
            workHours: record?.workHours,
            remarks: record?.remarks || "",
            leaveRequestId: record?.leaveRequestId,
            leaveConfigId: record?.leaveConfigId,
            leaveType: getLeaveTypeFromConfigId(record?.leaveConfigId),
          };
        }
      });
      setAttendanceData(processedData);
    } else {
      setAttendanceData({}); 
    }
  }, [employeeAttendanceData, allExisitingLeaves, getLeaveTypeFromConfigId]);

 
  const scrollToSelectedItem = (dropdownRef, itemIndex, itemHeight = 40) => {
    if (dropdownRef.current) {
      const scrollTop = itemIndex * itemHeight;
      dropdownRef.current.scrollTop = scrollTop;
    }
  };


  useEffect(() => {
    if (showMonthDropdown && monthDropdownRef.current) {
      const selectedMonthIndex = currentDate.getMonth();
      setTimeout(() => {
        scrollToSelectedItem(monthDropdownRef, selectedMonthIndex);
      }, 0);
    }
  }, [showMonthDropdown, currentDate]);


  useEffect(() => {
    if (showYearDropdown && yearDropdownRef.current) {
      const currentYear = currentDate.getFullYear();
      const years = Array.from(
        { length: 101 },
        (_, i) => new Date().getFullYear() - 50 + i
      );
      const selectedYearIndex = years.findIndex((year) => year === currentYear);
      if (selectedYearIndex !== -1) {
        setTimeout(() => {
          scrollToSelectedItem(yearDropdownRef, selectedYearIndex);
        }, 0);
      }
    }
  }, [showYearDropdown, currentDate]);

  const handleDateClick = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    // Use the same local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateKey = `${year}-${month}-${dayStr}`;

    setSelectedDate({
      day,
      date,
      key: dateKey,
      dateString: dateKey,
    });

    setShowViewModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    const today = new Date();
    const formattedToday = today.toISOString();
    dispatch(getLeaveBalanceWithAccrual(employeeUuid, formattedToday));
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const today = new Date();
    const days = [];

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`prev-${prevMonthLastDay - firstDay + i + 1}`}
          className="calendar-day prev-month"
        >
          {prevMonthLastDay - firstDay + i + 1}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateKey = `${yearStr}-${monthStr}-${dayStr}`;

      const attendance = attendanceData[dateKey];
      const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
      const isSelected = selectedDate && 
        selectedDate.date.getDate() === day && 
        selectedDate.date.getMonth() === month && 
        selectedDate.date.getFullYear() === year;
      const statusClass = attendance
        ? attendance.attendanceStatus.replace("_", "-")
        : "";

      days.push(
        <div
          key={day}
          className={`calendar-day ${statusClass} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
          onClick={() => handleDateClick(day)}
       >
          {day}
        </div>
      );
    }


    const totalCells = 42;
    const remainingCells = totalCells - (firstDay + lastDay);
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="calendar-day next-month">
          {i}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const navigateYear = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + direction);
      return newDate;
    });
  };

const handleEdit = (currentAttendance) => {
  // If userType is 100, block editing for half day or leave
  if (
    allToolsAccessDetails?.[selectedToolName] < 900 && !hasAccessToEditAttendance &&
    (currentAttendance?.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY ||
      currentAttendance?.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE)
  ) {
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message:
          "You cannot edit attendance for half-day or leave status. Please contact your HR.",
        severity: "error",
      },
    });
    return;
  }

  // If userType >= 500, allow editing for any leave type
  if (allToolsAccessDetails?.[selectedToolName] >= 900 && hasAccessToEditAttendance) {
    setShowViewModal(false);
    setShowEditModal(true);
    return;
  }

  setShowViewModal(false);
  setShowEditModal(true);
};



  const handleAttendanceUpdate = (updatedAttendance, attendanceMonth, attendanceYear) => {
    if (!selectedDate) return;
    const isUpdate = updatedAttendance.isUpdate;

    // Helper function to check if it's a comp off leave
    const isCompOffLeave = (leaveConfigId) => {
      if (!leaveConfigId) return false;
      const leave = allExisitingLeaves.find(l => l.leaveConfigId === leaveConfigId);
      return leave && (leave.leaveType?.toLowerCase().includes('comp') || leave.leaveType?.toLowerCase().includes('comp off'));
    };

    if (isUpdate) {
      // Check if the existing leave is comp off (updating from comp off to working/another leave)
      const existingAttendance = employeeAttendanceData?.[selectedDate.dateString];
      const existingLeaveConfigId = existingAttendance?.leaveConfigId;
      const isUpdatingFromCompOff = existingLeaveConfigId && isCompOffLeave(existingLeaveConfigId);
      
      if (isUpdatingFromCompOff) {
        // Use updateCompOffLeave when updating from comp off to working or another leave
        dispatch(
          updateCompOffLeave(
            updatedAttendance,
            updatedAttendance.attendanceId,
            attendanceMonth,
            attendanceYear,
            employeeUuid
          )
        );
      } else {
        // Use regular update for other cases
      dispatch(
        updateEmployeeAttendanceLog(
          updatedAttendance,
          updatedAttendance.attendanceId,
          attendanceMonth,
          attendanceYear,
          employeeUuid
        )
      );
      }
    } else {
      // Check if creating new comp off leave
      const currentLeaveConfigId = updatedAttendance.leaveConfigId;
      const isCreatingCompOff = currentLeaveConfigId && isCompOffLeave(currentLeaveConfigId);
      
      if (isCreatingCompOff) {
        dispatch(registerCompOffLeave(updatedAttendance, attendanceMonth, attendanceYear));
    } else {
      dispatch(createAttendanceLog(updatedAttendance, attendanceMonth, attendanceYear));
      }
    }

    setShowEditModal(false);
  };

  const handleAttendanceDelete = (currentAttendanceId, month, year, emmployeeUuid) => {
    if (!selectedDate) return;
    if (currentAttendanceId) {
      dispatch(deleteEmployeeAttendanceLog(currentAttendanceId, month, year, emmployeeUuid));
    }
    setShowEditModal(false);
    setShowViewModal(false);
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 101 },
    (_, i) => new Date().getFullYear() - 50 + i
  );

  const currentAttendance = selectedDate
    ? attendanceData[selectedDate.key]
    : null;


  return (
    <>
      {showCalendarAndTable && <div className="attendance-calendar" style={{ position: 'relative' }}>
        {attendanceLogsLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <LoadingSpinner message="Loading attendance data..." height="200px" />
          </div>
        )}
        <div className="calendar-container">
          <div className="calendar-inner-container">
            <div className="calendar-header">
              <div className="month-navigation">
                <button onClick={() => navigateMonth(-1)}>
                  <img src={Left_arrow} alt="left_arrow" />
                </button>
                <div className="custom-dropdown">
                  <div
                    className="dropdown-selector"
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  >
                    {months[currentDate.getMonth()]}
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  {showMonthDropdown && (
                    <div
                      className="dropdown-menu month-menu"
                      ref={monthDropdownRef}
                    >
                      {months.map((month, index) => (
                        <div
                          key={month}
                          className={`dropdown-item ${
                            currentDate.getMonth() === index ? "active" : ""
                          }`}
                          onClick={() => {
                            setCurrentDate(
                              (prev) => new Date(prev.getFullYear(), index, 1)
                            );
                            setShowMonthDropdown(false);
                          }}
                        >
                          {month}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => navigateMonth(1)}>
                  <img src={Right_arrow} alt="right_arrow" />
                </button>
              </div>
              <div className="year-navigation">
                <button onClick={() => navigateYear(-1)}>
                  <img src={Left_arrow} alt="left_arrow" />
                </button>
                <div className="custom-dropdown">
                  <div
                    className="dropdown-selector"
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                  >
                    {currentDate.getFullYear()}
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  {showYearDropdown && (
                    <div
                      className="dropdown-menu year-menu"
                      ref={yearDropdownRef}
                    >
                      {years.map((year) => (
                        <div
                          key={year}
                          className={`dropdown-item ${
                            currentDate.getFullYear() === year ? "active" : ""
                          }`}
                          onClick={() => {
                            setCurrentDate(
                              (prev) => new Date(year, prev.getMonth(), 1)
                            );
                            setShowYearDropdown(false);
                          }}
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => navigateYear(1)}>
                  <img src={Right_arrow} alt="right_arrow" />
                </button>
              </div>
            </div>
            <div className="calendar-grid">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={index} className="weekday-header">
                  {day}
                </div>
              ))}
              {renderCalendarDays()}
            </div>
          </div>
          <div className="calendar-legend">
            <div className="legend-item working">
              <span className="color-dot"></span>
              <span className="legend-text">Working</span>
            </div>
            <div className="legend-item half-day">
              <span className="color-dot"></span>
              <span className="legend-text">Half-day</span>
            </div>
            <div className="legend-item on-leave">
              <span className="color-dot"></span>
              <span className="legend-text">On leave</span>
            </div>
            <div className="legend-item today">
              <span className="color-dot"></span>
              <span className="legend-text">Today</span>
            </div>
          </div>
        </div>
        <LeaveAvailable />
        {showViewModal && selectedDate && (
          <div className="modal click-modal">
            <div className="modal-content">
              <div className="modal-header">
                <p className="status-modal-title">
                  {selectedDate.day}{" "}
                  {new Intl.DateTimeFormat("en-US", { month: "long" }).format(
                    selectedDate.date
                  )}{" "}
                  {selectedDate.date.getFullYear()}
                </p>
                <div className="status-modal-actions">
                  {hasAccessToEditAttendance && (
                    <div className="status-edit-button" onClick={() =>handleEdit(currentAttendance)}>
                      <img src={Edit_btn} alt="edit" />
                      <span>Edit</span>
                    </div>
                  )}
                 <div
                    className="status-close-btn"
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedDate(null);
                    }}
                  >
                  <img src={Cross_icon} alt="cross" />
                </div>
                </div>
              </div>
              <div className="modal-body">
                <div className="attendance-status">
                  <p className="status-label">Attendance status</p>
                  {currentAttendance ? (
                    <div
                      className={`status-badge ${currentAttendance.attendanceStatus.replace(
                        "_",
                        "-"
                      )}`}
                    >
                      {currentAttendance.attendanceStatus
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  ) : (
                    <div className="status-badge not-set">Not Set</div>
                  )}
                </div>
                {currentAttendance &&
                  currentAttendance.attendanceStatus ===
                    ATTENDANCE_STATUS.WORKING && (
                    <div className="time-details">
                      <div className="check-in">
                        <p className="check-in-out-title">Check-in</p>
                        <p className="check-in-out-time">
                          {currentAttendance.checkIn || "hh:mm"}
                        </p>
                      </div>
                      <div className="check-out">
                        <p className="check-in-out-title">Check-out</p>
                        <p className="check-in-out-time">
                          {currentAttendance.checkOut || "hh:mm"}
                        </p>
                      </div>
                    </div>
                  )}
                {currentAttendance &&
                  (currentAttendance.attendanceStatus ===
                    ATTENDANCE_STATUS.ON_LEAVE ||
                    currentAttendance.attendanceStatus ===
                      ATTENDANCE_STATUS.HALF_DAY) && (
                    <div className="leave-details">
                      <p className="leave-type-title">Leave type</p>
                      <p className="leave-type-text">
                        {getLeaveType(
                          currentAttendance.leaveConfigId, allExisitingLeaves
                        ) || "Not specified"}
                      </p>
                    </div>
                  )}
                <div className="remarks">
                  <p className="remarks-title">Remarks</p>
                  <p className="remarks-text">
                    {currentAttendance && currentAttendance.remarks
                      ? currentAttendance.remarks
                      : "A short, optional description of your day"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}    
      </div>}
      {showEditModal && selectedDate && (
          <EditAttendanceModal
            selectedDate={selectedDate}
            existingAttendance={currentAttendance}
            onSave={handleAttendanceUpdate}
            onDelete={handleAttendanceDelete}
            onClose={handleCloseEditModal}
          />
      )}
      <div style={{ position: 'relative' }}>
        {attendanceLogsLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <LoadingSpinner message="Loading attendance data..." height="200px" />
          </div>
        )}
        <AttendanceLog
          attendanceData={attendanceData}
          currentDate={currentDate}
          navigateMonth={navigateMonth}
          setSelectedDate={setSelectedDate}
          setShowEditModal={setShowEditModal}
        />
      </div>
    </>
  );
}
