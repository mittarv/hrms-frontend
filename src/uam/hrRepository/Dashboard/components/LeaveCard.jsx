import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { hrRepositoryTableStyle as tableStyle } from '../../constant/hrRepositoryTableStyle';
import '../dashboard.scss';
import { getEmployeeOnLeave } from '../../../../actions/hrRepositoryAction';
import { getEmployeeName, formatDate } from '../../Common/utils/helper';

const LeaveCard = () => {
  const dispatch = useDispatch();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[todayIndex]);
  const [weekRange, setWeekRange] = useState({ startDate: '', endDate: '' });
  const { allEmployees, employeesOnLeave } = useSelector((state) => state.hrRepositoryReducer);

  const getWeekRange = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + daysToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0]
    };
  };

  const getSelectedDate = () => {
    const daysMap = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };
    const monday = new Date(weekRange.startDate);
    const selectedDate = new Date(monday);
    selectedDate.setDate(monday.getDate() + daysMap[selectedDay]);
    return selectedDate.toISOString().split('T')[0];
  };

  const getEmployeesOnLeaveForDay = () => {
    if (!employeesOnLeave.length || !weekRange.startDate) return [];
    
    const selectedDate = getSelectedDate();
    return employeesOnLeave.filter(employee => 
      employee?.attendanceDate?.split('T')[0] === selectedDate && 
      employee?.attendanceStatus === 'on_leave'
    );
  };

  const getGroupedEmployeeNames = () => {
    const employees = getEmployeesOnLeaveForDay();
    const names = employees
      .map(emp => emp.empUuid)
      .filter(Boolean)
      .map(empUuid => getEmployeeName(empUuid, allEmployees))
      .filter(name => name !== 'Unknown Employee');

    const grouped = [];
    for (let i = 0; i < names.length; i += 2) {
      grouped.push(names.slice(i, i + 2));
    }
    return grouped;
  };

  // Fixed calculation for week of month
  const getWeekOfMonth = (dateString) => {
    const date = new Date(dateString);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    
    // Calculate which week this date falls in
    const weekOfMonth = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
    return weekOfMonth;
  };

  useEffect(() => {
    const range = getWeekRange();
    setWeekRange(range);
    dispatch(getEmployeeOnLeave(range.startDate, range.endDate));
  }, [dispatch]);

  const { MyUpdateStyle } = tableStyle;
  const groupedNames = getGroupedEmployeeNames();

  return (
    <div className='coverClass'>
      <div className="leave-main-container">
        <p className="inner-div-title">
          {`On Leave - Week ${getWeekOfMonth(weekRange.startDate)} of ${new Date(weekRange.startDate).toLocaleString('default', { month: 'long' })} [${formatDate(weekRange.startDate, true)} - ${formatDate(weekRange.endDate, true)}]`}
        </p>
        
        <select 
          value={selectedDay} 
          onChange={(e) => setSelectedDay(e.target.value)} 
          className="day-dropdown"
        >
          {daysOfWeek.map(day => (
            <option key={day} value={day} className="dropdown_values">
              {day}
            </option>
          ))}
        </select>

        <div className='table-body-container'>
          <Table className="leave-table-container">
            <TableBody>
              {groupedNames.length > 0 ? (
                groupedNames.map((pair, index) => (
                  <TableRow key={index}>
                    {pair.map((name, subIndex) => (
                      <TableCell key={subIndex} style={MyUpdateStyle}>
                        {name}
                      </TableCell>
                    ))}
                    {pair.length < 2 && <TableCell style={MyUpdateStyle}></TableCell>}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} style={{...MyUpdateStyle, textAlign: 'center'}}>
                    No employees on leave for {selectedDay}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default LeaveCard;