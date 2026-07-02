import "../styles/EmployeeOffboardingInProgress.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOffboardingInitiatedEmployeeDetails,
  hrClearanceStatus,
  financeClearanceStatus,
  setLastWorkingDay as setLastWorkingDayAction,
  approveOffboarding as approveOffboardingAction,
} from "../../../../actions/hrRepositoryAction";
import { useEffect, useState, useRef } from "react";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import divider from "../../assets/icons/divider_icon.svg";
import sortIcon from "../../assets/icons/sort_grey_icon.svg";
import filterIcon from "../../assets/icons/filter_grey_icon.svg";
import calendarIcon from "../../assets/icons/Calendar_enable_grey_icon.svg";
import validationApprovalIcon from "../../assets/icons/validation_approval_icon.svg";
import Snackbar from "../../Common/components/Snackbar";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import { getComponentTypeValue } from "../../Common/utils/helper";
import Happy_jar_icon from "../../assets/icons/happy_jar_icon.svg";

const EmployeeOffboardingInProgress = () => {
  const {
    offboardingInitiatedEmployeeDetails,
    offboardingInitiatedEmployeeDetailsLoading,
    getAllComponentType,
  } = useSelector((state) => state.hrRepositoryReducer);
  const [searchEmployeeName, setSearchEmployeeName] = useState("");
  const [filteredEmployeeDetails, setFilteredEmployeeDetails] = useState([]);
  const [lastWorkingDayInputs, setLastWorkingDayInputs] = useState({});
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rowToApprove, setRowToApprove] = useState(null);
  const dispatch = useDispatch();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(getAllOffboardingInitiatedEmployeeDetails());
    }
  }, [dispatch]);

  useEffect(() => {
    if (searchEmployeeName.trim().length > 0) {
      const filtered = offboardingInitiatedEmployeeDetails.filter((employee) =>
        (employee.employeeName || "")
          .toLowerCase()
          .includes(searchEmployeeName.toLowerCase()),
      );
      setFilteredEmployeeDetails(filtered);
    } else {
      setFilteredEmployeeDetails(offboardingInitiatedEmployeeDetails || []);
    }
  }, [searchEmployeeName, offboardingInitiatedEmployeeDetails]);

  // Keep lastWorkingDayInputs in sync with current list so one employee's date doesn't apply to another
  useEffect(() => {
    const currentEmpUuids = new Set(
      (offboardingInitiatedEmployeeDetails || []).map((e) => e.empUuid),
    );
    setLastWorkingDayInputs((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([empUuid]) => currentEmpUuids.has(empUuid)),
      ),
    );
  }, [offboardingInitiatedEmployeeDetails]);

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const handleHrClearanceClick = (empUuid, e) => {
    e?.stopPropagation?.();
    dispatch(hrClearanceStatus(empUuid));
  };

  const handleLastWorkingDayChange = (empUuid, value) => {
    setLastWorkingDayInputs((prev) => ({ ...prev, [empUuid]: value }));
    if (value) {
      dispatch(setLastWorkingDayAction(empUuid, value));
    }
  };

  const getEffectiveLastWorkingDay = (row) => {
    if (lastWorkingDayInputs[row.empUuid] !== undefined) {
      return lastWorkingDayInputs[row.empUuid];
    }
    return formatDateForInput(row.lastWorkingDay);
  };

  const handleFinanceClearanceClick = (empUuid, e) => {
    e?.stopPropagation?.();
    dispatch(financeClearanceStatus(empUuid));
  };

  const handleApproveOffboardingClick = (row, e) => {
    e?.stopPropagation?.();
    setRowToApprove(row);
    setApproveConfirmOpen(true);
  };

  const handleApproveConfirm = () => {
    if (rowToApprove?.empUuid) {
      dispatch(approveOffboardingAction(rowToApprove.empUuid));
      setLastWorkingDayInputs((prev) => {
        const next = { ...prev };
        delete next[rowToApprove.empUuid];
        return next;
      });
    }
    setRowToApprove(null);
    setApproveConfirmOpen(false);
  };

  const handleApproveConfirmClose = () => {
    setApproveConfirmOpen(false);
    setRowToApprove(null);
  };

  return (
    <>
      <ConfirmationPopup
        isOpen={approveConfirmOpen}
        onClose={handleApproveConfirmClose}
        onConfirm={handleApproveConfirm}
        heading="Approve offboarding"
        message={
          rowToApprove
            ? `${rowToApprove.employeeName || "this employee"} will be removed from the system and lose access to HRMS.?`
            : "Are you sure you want to approve offboarding for this employee?"
        }
        confirmText="Yes, Approve"
        cancelText="Cancel"
      />
      {offboardingInitiatedEmployeeDetailsLoading ? (
        <div className="loading_message">
          <LoadingSpinner message="Loading..." height="40vh" />
        </div>
      ) : (
        <div className="employee_offboarding_container">
          <div className="employee_offboarding_header">
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
                  placeholder="Search employees"
                  value={searchEmployeeName}
                  onChange={(e) => setSearchEmployeeName(e.target.value)}
                  className="employee-search-input"
                />
              </div>
            </div>
          </div>

          {offboardingInitiatedEmployeeDetails.length === 0 ? (
            <NoResultsContainer
              showImage={true}
              image={Happy_jar_icon}
              message="No Offboarding is in Progress."
            />
          ) : (
            <div className="offboarding_log">
              <div className="log-header">
                <p>
                  Offboarding In-Progress ({filteredEmployeeDetails.length})
                </p>
              </div>

              {filteredEmployeeDetails.length > 0 ? (
                <div className="log-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>
                          <span className="th-with-icons">
                            Employee Name
                            <img
                              src={sortIcon}
                              alt="Sort"
                              className="th-icon"
                            />
                            <img
                              src={filterIcon}
                              alt="Filter"
                              className="th-icon"
                            />
                          </span>
                        </th>
                        <th>
                          <span className="th-with-icons">
                            Type
                            <img
                              src={filterIcon}
                              alt="Filter"
                              className="th-icon"
                            />
                          </span>
                        </th>
                        <th>
                          <span className="th-with-icons">
                            Department
                            <img
                              src={filterIcon}
                              alt="Filter"
                              className="th-icon"
                            />
                          </span>
                        </th>
                        <th>HR Clearance</th>
                        <th>Finance Clearance</th>
                        <th>Last Working Day</th>
                        <th>Approval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployeeDetails.map((row, index) => (
                        <tr key={row.empUuid || row.offboardingId}>
                          <td>{index + 1}</td>
                          <td>
                            <button
                              type="button"
                              className="employee-name-link"
                            >
                              {row.employeeName || "—"}
                            </button>
                          </td>
                          <td>
                            {getComponentTypeValue(
                              row.empType,
                              getAllComponentType,
                            )}
                          </td>
                          <td>
                            {getComponentTypeValue(
                              row.empDepartment,
                              getAllComponentType,
                            )}
                          </td>
                          <td>
                            <label className="clearance-checkbox">
                              <input
                                type="checkbox"
                                checked={!!row.hrClearanceStatus}
                                onChange={(e) => e.preventDefault()}
                                onClick={(e) =>
                                  handleHrClearanceClick(row.empUuid, e)
                                }
                              />
                              <span className="checkmark" />
                            </label>
                          </td>
                          <td>
                            <label className="clearance-checkbox">
                              <input
                                type="checkbox"
                                checked={!!row.financeClearanceStatus}
                                onChange={(e) => e.preventDefault()}
                                onClick={(e) =>
                                  handleFinanceClearanceClick(row.empUuid, e)
                                }
                              />
                              <span className="checkmark" />
                            </label>
                          </td>
                          <td>
                            <div className="last-working-day-input-wrap">
                              <input
                                type="date"
                                className="last-working-day-input"
                                value={getEffectiveLastWorkingDay(row) ?? ""}
                                onChange={(e) =>
                                  handleLastWorkingDayChange(
                                    row.empUuid,
                                    e.target.value,
                                  )
                                }
                                disabled={
                                  !row.hrClearanceStatus ||
                                  !row.financeClearanceStatus
                                }
                              />
                              <img
                                src={calendarIcon}
                                alt=""
                                className="calendar-icon"
                              />
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="approve-offboarding-button"
                              onClick={(e) =>
                                handleApproveOffboardingClick(row, e)
                              }
                              disabled={
                                !row.hrClearanceStatus ||
                                !row.financeClearanceStatus ||
                                !getEffectiveLastWorkingDay(row)
                              }
                            >
                              <img src={validationApprovalIcon} alt="" />
                              Approve Offboarding
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <NoResultsContainer
                  showImage={true}
                  message="We couldn't find anyone matching your search."
                  subMessage="Try searching with different details."
                />
              )}
            </div>
          )}
        </div>
      )}
      <Snackbar />
    </>
  );
};

export default EmployeeOffboardingInProgress;
