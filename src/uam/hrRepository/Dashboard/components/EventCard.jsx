import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { tableStyle } from '../../../../constant/tableStyle';
import '../dashboard.scss';
import { formatDate } from "../../Common/utils/helper";

const EventCard = ({ name, data }) => {
  const { MyUpdateStyle } = tableStyle;

  // If name is WorkAnniversariesTitle, show coming soon
  if (name === "Work Anniversaries") {
    return (
      <div className="coverClass">
        <div className="event-container">
          <p className="inner-div-title">{name}</p>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100px",
            color: "#888",
            fontSize: "18px",
            fontWeight: 500,
            textAlign: "center",
            fontFamily: "Plus Jakarta Sans"
          }}>
            🚀 Coming Soon! <br /> Stay tuned for updates.
          </div>
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
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100px",
            color: "#888",
            fontSize: "18px",
            fontWeight: 500,
            textAlign: "center",
            fontFamily: "Plus Jakarta Sans"
          }}>
            {`No ${name.split('-')[0].trim().toLowerCase()} is available${monthYear ? ` in ${monthYear}` : ""}.`}
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