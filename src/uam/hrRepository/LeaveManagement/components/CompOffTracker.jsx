import "../styles/CompOffTracker.scss";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

// Asset Imports
import filter_grey_icon from "../../../../assets/icons/filter_grey_icon.svg";
import info_icon from "../../../../assets/icons/info_grey_icon.svg";
import navigate_icon from "../../../../assets/icons/navigate_icon.svg";
import searchIcon from "../../../../assets/icons/search_icon.svg";
import cross from "../../../../assets/icons/cross_icon.svg";
import Time_Log_Icon from "../../../../assets/icons/watch_white.svg";
import divider from "../../../../assets/icons/divider_icon.svg";

// Component Imports
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import Filter from "../../Common/components/Filter/Filter";
import LogExtraDayPopup from "./LogExtraDayPopup";
import Sort from "../../Common/components/Sort";

import { getEmployeeExtraWorkHistory } from "../../../../actions/hrRepositoryAction";

const CompOffTracker = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { loading, employeeExtraWorkHistory = [], employeeExtraWorkPagination} = useSelector((state) => state.hrRepositoryReducer);

  // States
  const [currentSort, setCurrentSort] = useState("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [logExtraDay, setLogExtraDay] = useState(false);
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [extraWorkCurrentPage, setExtraWorkCurrentPage] = useState(1);
  const extraWorkPageSize = 20;

  // Filter States
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState([]);
  const [selectedCompOffStatus, setSelectedCompOffStatus] = useState([]);
  const [selectedCreditDays, setSelectedCreditDays] = useState([]);

  // Maps for Filter Components
  const approvalStatusMap = { approved: "Approved", pending: "Pending", rejected: "Rejected" };
  const compOffStatusMap = { active: "Active", used: "Used", expired: "Expired" };
  const creditDaysMap = { 0.5: "0.5 Day/s", 1: "1 Day" };

useEffect(() => {
  if (user?.employeeUuid) {
    dispatch(getEmployeeExtraWorkHistory(user.employeeUuid, extraWorkCurrentPage, extraWorkPageSize));
  }
}, [dispatch, user, extraWorkCurrentPage]);

  const getCompOffStatus = (row) => {
    const { totalCompOffCredit, totalCompOffUsed, compOffExpiryDate, approvalStatus } = row;
    const today = new Date();
    const expiry = new Date(compOffExpiryDate);

    if (approvalStatus?.toLowerCase() === "rejected" || approvalStatus?.toLowerCase() === "pending") return { label: "", class: "status-hidden" };
    if (totalCompOffCredit > 0 && totalCompOffCredit === totalCompOffUsed) return { label: "Used", class: "status-used" };
    if (compOffExpiryDate && expiry < today) return { label: "Expired", class: "status-rejected" };
    return { label: "Active", class: "status-accepted" };
  };

const processedHistory = useMemo(() => {
    if (!employeeExtraWorkHistory) return [];

    let result = employeeExtraWorkHistory?.filter((row) => {
      const matchesSearch = !searchQuery.trim() || row.remarks?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesApproval = selectedApprovalStatus.length === 0 || selectedApprovalStatus.includes(row.approvalStatus?.toLowerCase());
      
      const compStatusObj = getCompOffStatus(row);
      const matchesCompOff = selectedCompOffStatus.length === 0 || (compStatusObj.label && selectedCompOffStatus.includes(compStatusObj.label.toLowerCase()));
      
      const matchesCredit = selectedCreditDays.length === 0 || selectedCreditDays.includes(row.totalCompOffCredit?.toString());

      return matchesSearch && matchesApproval && matchesCompOff && matchesCredit;
    });

  if (currentSort !== "none") {
      result = [...result].sort((a, b) => {
      switch (currentSort) { 
        case "date_asc": return new Date(a.workDate) - new Date(b.workDate);
        case "date_desc": return new Date(b.workDate) - new Date(a.workDate);
        case "valid_till_asc": return new Date(a.compOffExpiryDate || 0) - new Date(b.compOffExpiryDate || 0);
        case "valid_till_desc": return new Date(b.compOffExpiryDate || 0) - new Date(a.compOffExpiryDate || 0);
        default: return 0;
      }
    });
  }
  return result;
}, [employeeExtraWorkHistory, searchQuery, currentSort, selectedApprovalStatus, selectedCompOffStatus, selectedCreditDays]);
  useEffect(() => {
    setExtraWorkCurrentPage(1);
  }, [searchQuery, currentSort, selectedApprovalStatus, selectedCompOffStatus, selectedCreditDays]);
  const totalExtraWorkPages = employeeExtraWorkPagination?.totalPages || Math.max(
    1,
    Math.ceil((processedHistory?.length || 0) / extraWorkPageSize)
  );
  const paginatedProcessedHistory = (processedHistory);
  const showExtraWorkPagination = totalExtraWorkPages >= 1;

  const handleToggleFilterBar = () => setIsFilterBarOpen((prev) => !prev);

  const handleToggleFilterSelection = (key, setSelectedState) => {
    setSelectedState((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setCurrentSort("none");
    setSelectedApprovalStatus([]);
    setSelectedCompOffStatus([]);
    setSelectedCreditDays([]);
  };

  const isFilterActive = selectedApprovalStatus.length > 0 || selectedCompOffStatus.length > 0 || selectedCreditDays.length > 0;

  const sortOptions = [
    { key: "date_asc", label: "Date (Ascending)" },
    { key: "date_desc", label: "Date (Descending)" },
    { key: "valid_till_asc", label: "Valid Till (Ascending)" },
    { key: "valid_till_desc", label: "Valid Till (Descending)" },
  ];

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "status-accepted";
      case "pending": return "status-pending";
      case "rejected": return "status-rejected";
      default: return "status-pending";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const getVisibleExtraWorkPages = () => {
    if (totalExtraWorkPages === 1) return [1];
    if (totalExtraWorkPages === 0) return [];

    let startPage = Math.max(1, extraWorkCurrentPage - 1);
    let endPage = Math.min(totalExtraWorkPages, startPage + 2);

    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (

    <>
      {loading ? <LoadingSpinner /> : (
        <div className="comp-off-tracker-container">
          <div className="comp-off-header">
            <div className="control-bar-container">
              {isFilterBarOpen ? (
                <div className="filter-bar-expanded">
                  <button className="filter-toggle-icon" onClick={handleToggleFilterBar}>
                    <img src={searchIcon} alt="Close Filter" />
                  </button>
                  <button className="filter-toggle-icon active" onClick={handleToggleFilterBar}>
                    <img src={filter_grey_icon} alt="Filter" />
                  </button>

                  <Filter
                    title="Request Approval Status"
                    options={approvalStatusMap}
                    selected={selectedApprovalStatus}
                    onSelect={(key) => handleToggleFilterSelection(key, setSelectedApprovalStatus)}
                  />
                  <Filter
                    title="Comp Off Status"
                    options={compOffStatusMap}
                    selected={selectedCompOffStatus}
                    onSelect={(key) => handleToggleFilterSelection(key, setSelectedCompOffStatus)}
                  />
                  <Filter
                    title="Credit Day/s"
                    options={creditDaysMap}
                    selected={selectedCreditDays}
                    onSelect={(key) => handleToggleFilterSelection(key, setSelectedCreditDays)}
                  />

                  <button className="clear-filters-button" onClick={handleClearAllFilters}>
                    <img src={cross} alt="Clear" className="clear-icon-x" />
                    Clear
                  </button>
                  <Sort
                    options={sortOptions}
                    currentSort={currentSort}
                    onSortSelect={(key) => setCurrentSort(currentSort === key ? "none" : key)}
                    isOpen={isSortDropdownOpen}
                    setIsOpen={setIsSortDropdownOpen}
                  />
                </div>
              ) : (
                <div className="search-bar-collapsed">
                  <div className="search-input-group">
                    <img src={searchIcon} alt="search" className="employee-search-icon" />
                    <img src={divider} alt="divider" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="employee-search-input"
                    />
                  </div>
                  <button className={`filter-toggle-icon ${isFilterActive ? "active" : ""}`} onClick={handleToggleFilterBar}>
                    <img src={filter_grey_icon} alt="Filter" />
                    {isFilterActive && <span className="dot"></span>}
                  </button>
                  <Sort
                    options={sortOptions}
                    currentSort={currentSort}
                    onSortSelect={(key) => setCurrentSort(currentSort === key ? "none" : key)}
                    isOpen={isSortDropdownOpen}
                    setIsOpen={setIsSortDropdownOpen}
                  />
                </div>
              )}
            </div>
            <div className="log-extra-day">
              <button className="log-extra-day_button" onClick={() => setLogExtraDay(true)}>
                <img src={Time_Log_Icon} alt="Log" />
                <span>Log Extra Day</span>
              </button>
            </div>
          </div>

          <div className="comp-off-bottom-section">
            <div className="comp-off-navigate-leaves-table">
              <div className="info-content">
                <img src={info_icon} alt="info" />
                <p>Comp-off leaves expire 3 months from the date of application. Kindly utilize leaves before expiry.</p>
              </div>
              <div className="leave-balance-link" onClick={() => setActiveTab("tab1")}>
                <span>Check total leave balance</span>
                <img src={navigate_icon} alt="navigate" />
              </div>
            </div>

            <div className="comp_off_table_container">
              <table className="comp_off_table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Valid Till</th>
                    <th>Credit/ Used Day(s)</th>
                    <th>Reason</th>
                    <th>Request Approval Status</th>
                    <th>Comp Off Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedProcessedHistory) && paginatedProcessedHistory.length > 0 ? (
                    paginatedProcessedHistory.map((row) => {
                      const compStatus = getCompOffStatus(row);
                      const isRowDisabled = compStatus.label === "Used" || compStatus.label === "Expired";
                      return (
                        <tr key={row.extraWorkDayId} className={isRowDisabled ? "row-disabled" : ""}>
                          <td>{formatDate(row.workDate)}</td>
                          <td>{formatDate(row.compOffExpiryDate)}</td>
                          <td>
                            <div className="credit-used-cell">
                              <span className="credit-val">{row.totalCompOffCredit || 0}</span>
                              <span className="divider">/</span>
                              <span className="used-val">{row.totalCompOffUsed || 0}</span>
                            </div>
                          </td>
                          <td className="reason-cell" title={row.remarks}>{row.remarks || "No remarks"}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(row.approvalStatus)}`}>
                              {row.approvalStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${compStatus.class}`}>
                              {compStatus.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No extra work history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {showExtraWorkPagination && (
                <div className="leave-pagination-wrapper">
                  <button
                    className="leave-page-btn nav-btn"
                    disabled={extraWorkCurrentPage === 1}
                    onClick={() =>
                      setExtraWorkCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    Prev
                  </button>

                  {getVisibleExtraWorkPages().map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`leave-page-btn ${extraWorkCurrentPage === pageNum ? "active-page" : ""
                        }`}
                      onClick={() => setExtraWorkCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    className="leave-page-btn nav-btn"
                    disabled={extraWorkCurrentPage === totalExtraWorkPages}
                    onClick={() =>
                      setExtraWorkCurrentPage((prev) =>
                        Math.min(prev + 1, totalExtraWorkPages)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {logExtraDay && <LogExtraDayPopup isOpen={logExtraDay} onClose={() => setLogExtraDay(false)} />}
    </>
  );
};

export default CompOffTracker;