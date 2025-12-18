import { useState } from "react";
import "../styles/AttendanceLog.scss";
import LeftArrowIcon from "../../../../assets/icons/left_grey_arrow.svg";
import RightArrowIcon from "../../../../assets/icons/right_grey_arrow.svg";
import EditIcon from "../../../../assets/icons/edit_button_blue.svg";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

export const ATTENDANCE_STATUS = {
  WORKING: "working",
  HALF_DAY: "half_day", 
  ON_LEAVE: "on_leave"
};

export default function AttendanceLog({
  attendanceData,
  currentDate,
  navigateMonth,
  setSelectedDate,
  setShowEditModal,
}) {
  const [showOnlyLeaves, setShowOnlyLeaves] = useState(false);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();
  // Format date for unique keys and data access (same as AttendanceCalendar)
  const formatDateKey = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let day = 1; day <= lastDay; day++) {
      const dateKey = formatDateKey(day);
      const dateObj = new Date(year, month, day);
      days.push({ day, date: dateObj, key: dateKey });
    }

    return days;
  };

  // Check if a date is a weekend
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getLogData = () => {
    const days = getDaysInMonth();
    const logData = days.map((dayInfo) => {

      const attendanceRecord = attendanceData[dayInfo.key];
      
      const isWeekendDay = isWeekend(dayInfo.date);
      
      let status, displayStatus;
      if (attendanceRecord) {
        status = attendanceRecord.attendanceStatus;
        switch (status) {
          case ATTENDANCE_STATUS.WORKING:
            displayStatus = "Working";
            break;
          case ATTENDANCE_STATUS.HALF_DAY:
            displayStatus = "Half Day";
            break;
          case ATTENDANCE_STATUS.ON_LEAVE:
            displayStatus = "On Leave";
            break;
          default:
            displayStatus = "Not Set";
        }
      } else {
        status = isWeekendDay ? "weekend" : "not_set";
        displayStatus = isWeekendDay ? "Weekend" : "Not Set";
      }

      return {
        ...dayInfo,
        status: status,
        displayStatus: displayStatus,
        checkIn: attendanceRecord?.checkIn || "--:--",
        checkOut: attendanceRecord?.checkOut || "--:--",
        duration: attendanceRecord?.checkIn && attendanceRecord?.checkOut
          ? calculateDuration(attendanceRecord.checkIn, attendanceRecord.checkOut)
          : "--:--",
        remarks: attendanceRecord?.remarks || "-",
        leaveType: attendanceRecord?.leaveType || "",
        workHours: attendanceRecord?.workHours || null,
        isWeekend: isWeekendDay,
        attendanceRecord: attendanceRecord
      };
    });

    if (showOnlyLeaves) {
      return logData.filter(
        (day) => day.status === ATTENDANCE_STATUS.ON_LEAVE || day.status === ATTENDANCE_STATUS.HALF_DAY
      );
    }
    return logData;
  };

  const calculateDuration = (checkInTime, checkOutTime) => {
    if (!checkInTime || !checkOutTime || checkInTime === "--:--" || checkOutTime === "--:--") {
      return "--:--";
    }

    try {
      // checkInTime and checkOutTime are already in HH:MM format from AttendanceCalendar
      const [inHours, inMinutes] = checkInTime.split(":").map(Number);
      const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

      let durationMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
      if (durationMinutes < 0) return "--:--"; 

      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    } catch (e) {
      return "--:--";
    }
  };

  const formatDisplayDate = (date) => {
    return `${date.getDate()} ${date.toLocaleDateString("en-US", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text || text === "-") return "-";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Handle edit button click
  const handleEditAttendance = (dayInfo) => {
      if (
        (allToolsAccessDetails?.[selectedToolName] < 500) &&
        (dayInfo?.attendanceRecord?.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY ||
          dayInfo?.attendanceRecord?.attendanceStatus === ATTENDANCE_STATUS.ON_LEAVE)
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
    setSelectedDate({
      day: dayInfo?.day,
      date: dayInfo?.date,
      key: dayInfo?.key,
      dateString: dayInfo?.key
    });

    setShowEditModal(true);
  };

  
  const getLogTitle = () => {
    const month = currentDate.toLocaleDateString("en-US", { month: "short" });
    const year = currentDate.getFullYear();

    if (showOnlyLeaves) {
      return `Applied Leaves (${month} ${year})`;
    } else {
      return `Your Attendance Log (${month} ${year})`;
    }
  };

  
  const getStatusClass = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.WORKING:
        return "working";
      case ATTENDANCE_STATUS.HALF_DAY:
        return "half-day";
      case ATTENDANCE_STATUS.ON_LEAVE:
        return "on-leave";
      case "weekend":
        return "weekend";
      case "not_set":
      default:
        return "not-set";
    }
  };

  return (
    <div className="attendance-log">
      <div className="log-header">
        <p>{getLogTitle()}</p>
        <div className="navigation-controls">
          <button onClick={() => navigateMonth(-1)} className="nav-button">
            <img src={LeftArrowIcon} alt="Previous month" />
          </button>
          <span>
            {currentDate.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <button onClick={() => navigateMonth(1)} className="nav-button">
            <img src={RightArrowIcon} alt="Next month" />
          </button>
        </div>
      </div>

      <div className="filter-controls">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={showOnlyLeaves}
            onChange={() => setShowOnlyLeaves(!showOnlyLeaves)}
          />
          <span>Only show days on leave and half-days</span>
        </label>
      </div>

      <div className="log-table">
        {getLogData().length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Attendance</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Remarks</th>
                <th>Edit Entry</th>
              </tr>
            </thead>
            <tbody>
              {getLogData().map((dayInfo) => (
                <tr
                  key={dayInfo.key}
                  className={dayInfo.isWeekend ? "weekend-row" : ""}
                >
                  <td>{formatDisplayDate(dayInfo.date)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(dayInfo.status)}`}>
                      {dayInfo.displayStatus}
                      {dayInfo.leaveType && (dayInfo.status === ATTENDANCE_STATUS.ON_LEAVE || dayInfo.status === ATTENDANCE_STATUS.HALF_DAY) && (
                        <span className="leave-type-info"> ({dayInfo.leaveType})</span>
                      )}
                    </span>
                  </td>
                  <td>{dayInfo.checkIn}</td>
                  <td>{dayInfo.checkOut}</td>
                  <td>
                    {dayInfo.workHours && !isNaN(Number(dayInfo.workHours)) ? `${Number(dayInfo.workHours).toFixed(2)}h` : dayInfo?.duration}
                  </td>
                  <td className="remarks-cell" title={dayInfo.remarks}>
                    {truncateText(dayInfo.remarks)}
                  </td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEditAttendance(dayInfo)}
                    >
                      <img src={EditIcon} alt="Edit" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data-message">
            <p>No data to display</p>
            {showOnlyLeaves && (
              <p className="no-data-subtext">
                There are no leave or half-day records for this month.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}