import search_icon from "../../../../assets/icons/search_icon.svg";
import Info_icon from "../../../../assets/icons/info_icon.svg";
import { LeaveConfiguratorTableHeader } from "../utils/LeaveConfiguratorData";
import { useSelector } from "react-redux";
import "../styles/LeaveConfiguratorTable.scss";
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { getLeaveDetails } from "../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const LeaveConfiguratorTable = () => {
  const { loading, allExisitingLeaves, getAllComponentType } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const [filteredLeaves, setFilteredLeaves] = useState(allExisitingLeaves);
  const [searchLeaves, setSearchLeaves] = useState("");
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const leaveConfigId = searchParams.get("leaveConfigId");

  useEffect(() => {
    if (leaveConfigId) {
      dispatch(getLeaveDetails(leaveConfigId));
    }
  }, [leaveConfigId, dispatch]);

  useEffect(() => {
    if (searchLeaves) {
      const filtered = allExisitingLeaves.filter(
        (leave) =>
          leave.leaveType &&
          leave.leaveType.toLowerCase().includes(searchLeaves.toLowerCase())
      );
      setFilteredLeaves(filtered);
    } else {
      setFilteredLeaves(allExisitingLeaves);
    }
  }, [allExisitingLeaves, searchLeaves]);

  const Employee_Type_Dropdown =
    getAllComponentType && getAllComponentType?.emp_type_dropdown;
  const getEmployeeTypeValue = (keys) => {
    return keys
      .map(
        (key) =>
          (Employee_Type_Dropdown && Employee_Type_Dropdown[key]) || "Unknown"
      )
      .join(", ");
  };

  const handleSearch = (value) => {
    setSearchLeaves(value);
  };

  const handleViewRowClick = (leaveConfigId) => {
    const isValidLeaveConfigId = allExisitingLeaves.some(
      (leave) => leave.leaveConfigId === leaveConfigId
    );

    if (isValidLeaveConfigId) {
      dispatch(getLeaveDetails(leaveConfigId));
      setSearchParams({
        showLeaveConfiguratorForm: "true",
        view: "true",
        leaveConfigId: leaveConfigId,
      });
    } else {
      console.error("Invalid leaveConfigId");
    }
  };

  return (
    <div className="leave_configurator_table_container">
      <div className="employee_repository_search_bar_container">
        <input
          type="text"
          placeholder="Search for leave type"
          onChange={(e) => handleSearch(e.target.value)}
        />
        <img src={search_icon} alt="search_icon" className="search_icon" />
      </div>
      {loading ? (
        <LoadingSpinner message="Loading Leaves..." height="40vh" />
      ) : allExisitingLeaves.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="30vh"
          flexDirection="column"
        >
          <p className="leave_configurator_no_leaves_message">
            No Leaves Configured Yet.
          </p>
          <p className="leave_configurator_no_leaves_message">
            To get started, please create a new Leave.
          </p>
        </Box>
      ) : filteredLeaves.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="30vh"
          flexDirection="column"
        >
          <p className="leave_configurator_no_leaves_message">
            {`No Such Leaves Configured Yet with name "${searchLeaves}"`}.
          </p>
        </Box>
      ) : (
        <div className="leave_configurator_wrapper">
          <table className="leave_table">
            <thead className="leave_table_head">
              <tr className="leave_table_header_row">
                {LeaveConfiguratorTableHeader.map((header) => (
                  <th
                    className="leave_table_header leave_table_header_sr"
                    key={header.name}
                  >
                    <div className="leave_table_header_label">
                      <span className="leave_table_label">{header.label}</span>
                      {(header.name === "accrualFrequency" ||
                        header.name === "accrualRate" ||
                        header.name === "minNoticePeriod" ||
                        header.name === "maxNoticePeriod") && (
                        <span className="info_icon">
                          <img src={Info_icon} alt="info_icon" />
                          <span className="tooltip">{header?.description}</span>
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="leave_table_body">
              {filteredLeaves.map((leave, index) => (
                <tr
                  className="leave_table_row"
                  key={leave.leaveConfigId}
                  onClick={() => handleViewRowClick(leave.leaveConfigId)}
                >
                  <td className="leave_table_cell leave_table_cell_sr">
                    {index + 1}
                  </td>
                  <td className="leave_table_cell leave_table_cell_type">
                    {leave.leaveType}
                  </td>
                  <td className="leave_table_cell leave_table_cell_max">
                    {leave.totalAllotedLeaves}
                  </td>
                  <td className="leave_table_cell leave_table_cell_rate">
                    {leave.accuralRate}
                  </td>
                  <td className="leave_table_cell leave_table_cell_freq">
                    {leave.accuralFrequency}
                  </td>
                  <td className="leave_table_cell leave_table_cell_min">
                    {leave.minimumNoticePeriod}
                  </td>
                  <td className="leave_table_cell leave_table_cell_max_notice">
                    {leave.maximumNoticePeriod}
                  </td>
                  <td className="leave_table_cell leave_table_cell_employee_type">
                    {getEmployeeTypeValue(JSON.parse(leave.employeeType))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveConfiguratorTable;
