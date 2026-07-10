import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import divider from "../../assets/icons/divider_icon.svg";
import sortIcon from "../../assets/icons/sort_grey_icon.svg";
import filterIcon from "../../assets/icons/filter_grey_icon.svg";
import Info_icon from "../../assets/icons/info_icon.svg";
import { LeaveConfiguratorTableHeader } from "../utils/LeaveConfiguratorData";
import { useSelector } from "react-redux";
import "../styles/LeaveConfiguratorTable.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import { getLeaveDetails } from "../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import { createPortal } from "react-dom";

const LeaveConfiguratorTable = () => {
  const { allLeavesLoading, allExisitingLeaves, getAllComponentType, myHrmsAccess, myHrmsAccessLoaded } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const [filteredLeaves, setFilteredLeaves] = useState(allExisitingLeaves);
  const [searchLeaves, setSearchLeaves] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const leaveConfigId = searchParams.get("leaveConfigId");
  
  const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900 || user?.userType >= 900;
  
  // Check if user has read permission
  const canRead = isAdmin || 
    myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveConfigurator_Read");
    
  const canUpdate = isAdmin || 
    myHrmsAccess?.permissions?.some(perm => perm.name === "LeaveConfigurator_update");

  const handleTooltipShow = useCallback((e, description) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 220;
    
    // Position tooltip below the icon
    setTooltipPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2 - tooltipWidth / 2,
    });
    setActiveTooltip(description);
  }, []);

  const handleTooltipHide = useCallback(() => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 100);
  }, []);

  // Hide tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      setActiveTooltip(null);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (leaveConfigId && canRead) {
      dispatch(getLeaveDetails(leaveConfigId));
    }
  }, [leaveConfigId, canRead, dispatch]);

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
        ...(canUpdate ? { edit: "true" } : { view: "true" }),
        leaveConfigId: leaveConfigId,
      });
    } else {
      console.error("Invalid leaveConfigId");
    }
  };

  // Wait for permissions to load before showing access denied
  if (!canRead) {
    if (!myHrmsAccessLoaded && !isAdmin) {
      return (
        <div className="leave_configurator_table_container">
          <LoadingSpinner message="Loading..." height="40vh" />
        </div>
      );
    }
    return (
      <div className="leave_configurator_table_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don&apos;t have permission to view leave configurations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave_configurator_table_container">
      <div className="leave_configurator_header">
        <div className="search-bar-collapsed">
          <div className="search-input-group">
            <img
              src={searchIcon}
              alt="search_icon"
              className="employee-search-icon"
            />
            <img src={divider} alt="" />
            <input
              type="text"
              placeholder="Search for leave type"
              value={searchLeaves}
              onChange={(e) => handleSearch(e.target.value)}
              className="employee-search-input"
            />
          </div>
        </div>
      </div>

      {allLeavesLoading ? (
        <LoadingSpinner message="Loading Leaves..." height="40vh" />
      ) : allExisitingLeaves.length === 0 ? (
        <NoResultsContainer
          showImage={true}
          message="We couldn't find anyone matching your search."
          subMessage="Try searching with different details."
        />
      ) : filteredLeaves.length === 0 ? (
        <NoResultsContainer
          showImage={true}
          message="We couldn't find anyone matching your search."
          subMessage="Try searching with different details."
        />
      ) : (
        <div className="leave_configurator_log">
          <div className="log-header">
            <p className="text-table-header">Leave Configurations ({filteredLeaves.length})</p>
          </div>
          <div className="log-table">
            <table className="leave_table">
              <thead>
                <tr>
                  {LeaveConfiguratorTableHeader.map((header) => (
                    <th key={header.name}>
                      <div className="th-with-icons leave_table_header_label">
                        <span className={`leave_table_label ${header.name === "leaveType" ? "th-with-icons" : ""}`}>
                          {header.name === "leaveType" ? (
                            <>
                              {header.label}
                              <img src={sortIcon} alt="Sort" className="th-icon" />
                              <img src={filterIcon} alt="Filter" className="th-icon" />
                            </>
                          ) : (
                            header.label
                          )}
                        </span>
                        {(header.name === "accrualFrequency" ||
                          header.name === "accrualRate" ||
                          header.name === "minNoticePeriod" ||
                          header.name === "maxNoticePeriod") &&
                          header?.description && (
                            <span 
                              className="info_icon"
                              onMouseEnter={(e) => handleTooltipShow(e, header.description)}
                              onMouseLeave={handleTooltipHide}
                            >
                              <img src={Info_icon} alt="info_icon" />
                            </span>
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave, index) => (
                  <tr
                    key={leave.leaveConfigId}
                    onClick={() => handleViewRowClick(leave.leaveConfigId)}
                  >
                    <td>{index + 1}</td>
                    <td>{leave.leaveType}</td>
                    <td>{leave.totalAllotedLeaves}</td>
                    <td>{leave.accuralRate}</td>
                    <td>{leave.accuralFrequency}</td>
                    <td>{leave.minimumNoticePeriod}</td>
                    <td>{leave.maximumNoticePeriod}</td>
                    <td>{getEmployeeTypeValue(JSON.parse(leave.employeeType))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tooltip Portal */}
      {activeTooltip && createPortal(
        <div 
          className="leave_configurator_tooltip_portal"
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 99999,
          }}
          onMouseEnter={() => {
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
            }
          }}
          onMouseLeave={handleTooltipHide}
        >
          <div className="tooltip_content text-tooltip-small">
            {activeTooltip}
          </div>
          <div className="tooltip_arrow" />
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeaveConfiguratorTable;
