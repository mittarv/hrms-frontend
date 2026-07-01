import { useState } from "react";
import { Table, TableBody, TableCell, TableRow, Box } from "@mui/material";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { hrRepositoryTableStyle as tableStyle } from '../../constant/hrRepositoryTableStyle';
import '../dashboard.scss';
import { formatDate } from "../../Common/utils/helper";

const emptyStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100px",
  color: "#888",
  fontSize: "18px",
  fontWeight: 500,
  textAlign: "center",
  fontFamily: "Plus Jakarta Sans",
  gap: "12px",
};

const WORK_ANNIVERSARIES_TITLE = "Work Anniversaries";
const OPTION_12_MONTH = "12_month";
const OPTION_14_MONTH = "14_month";

const EventCard = ({ name, data }) => {
  const { MyUpdateStyle } = tableStyle;
  const [workAnniversaryOption, setWorkAnniversaryOption] = useState(OPTION_12_MONTH);

  const isWorkAnniversaries = name === WORK_ANNIVERSARIES_TITLE;
  // Support both shapes: { workAnniversary12Month, workAnniversary14Month } or legacy array (treated as 12th month)
  const workAnniversaryData = (() => {
    if (!isWorkAnniversaries || !data) return null;
    if (Array.isArray(data)) {
      return {
        workAnniversary12Month: data.map((item) => ({
          empUuid: item.empUuid,
          empFirstName: item.empFirstName,
          empLastName: item.empLastName,
          anniversaryDate: item.anniversaryDate ?? item.empHireDate
        })),
        workAnniversary14Month: []
      };
    }
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return data;
    }
    return null;
  })();

  // Work Anniversaries: show dropdown and list (12th / 14th month from conversion date)
  if (isWorkAnniversaries) {
    const list = workAnniversaryOption === OPTION_12_MONTH
      ? (workAnniversaryData?.workAnniversary12Month ?? [])
      : (workAnniversaryData?.workAnniversary14Month ?? []);
    const listIsEmpty = !Array.isArray(list) || list.length === 0;

    return (
      <div className="coverClass">
        <div className="event-container event-container--work-anniversary">
          <div className="event-container__header">
            <p className="inner-div-title">{name}</p>
            <div className="work-anniversary-month-dropdown">
              <select
                className="work-anniversary-month-dropdown__select"
                value={workAnniversaryOption}
                onChange={(e) => setWorkAnniversaryOption(e.target.value)}
                aria-label="Work anniversary month filter"
              >
                <option value={OPTION_12_MONTH}>12th month</option>
                <option value={OPTION_14_MONTH}>14th month</option>
              </select>
            </div>
          </div>
          {listIsEmpty ? (
            <div style={emptyStateStyle}>
              <Box display="flex" alignItems="center" gap={1} sx={{ color: "#888" }}>
                <EventBusyOutlinedIcon sx={{ fontSize: 28 }} />
                <span>
                  No work anniversaries ({workAnniversaryOption === OPTION_12_MONTH ? "12th" : "14th"} month) available this month.
                </span>
              </Box>
            </div>
          ) : (
            <Table>
              <TableBody>
                {list.map((row, index) => (
                  <TableRow key={row.empUuid ?? index}>
                    <TableCell style={MyUpdateStyle}>
                      <span><strong>{formatDate(row.anniversaryDate, true)}</strong></span>
                      <span> - </span>
                      <span className="table-cell-title">
                        {[row.empFirstName, row.empLastName].filter(Boolean).join(" ")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    );
  }

  // If data is empty, show no {name}
  if (!data || Object.keys(data).length === 0) {
    // Extract month and year from the name if available, or pass them as props if needed
    let monthYear = "";
    if (name && name.includes("-")) {
      // Example: "Birthdays - June 2025"
      monthYear = name.split("-")[1]?.trim();
    }
    return (
      <div className="coverClass">
        <div className="event-container">
          <p className="inner-div-title">{name}</p>
          <div style={emptyStateStyle}>
            <Box display="flex" alignItems="center" gap={1} sx={{ color: "#888" }}>
              <EventBusyOutlinedIcon sx={{ fontSize: 28 }} />
              <span>{`No ${name.split('-')[0].trim().toLowerCase()} is available${monthYear ? ` in ${monthYear}` : ""}.`}</span>
            </Box>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="coverClass">
      <div className="event-container">
        <p className="inner-div-title">{name}</p>
        <Table>
          <TableBody>
            {Object.keys(data).map((key, index) => (
              <TableRow key={index}>
                <TableCell style={MyUpdateStyle}>
                  <span><strong>{formatDate(data[key]?.empDob, true)}</strong></span>
                  <span> - </span>
                  <span className="table-cell-title">
                    {data[key].empFirstName + " " + data[key].empLastName}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EventCard;