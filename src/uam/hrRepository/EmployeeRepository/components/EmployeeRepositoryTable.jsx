import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "../styles/EmployeeRepositoryTable.scss";
import { EmployeeRepositoryTableHeader } from "../utils/EmployeeRepositoryData";
import { useSelector } from "react-redux";
import filter_icon from "../../assets/icons/filter_icon.svg";
import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import divider from "../../assets/icons/divider_icon.svg";
import sortIcon from "../../assets/icons/sort_grey_icon.svg";
import filterIcon from "../../assets/icons/filter_grey_icon.svg";
import { useSearchParams } from "react-router-dom";
import Dropdown_Arrow from "../../assets/icons/dropdown_blue_arrow.svg";
import User_Remove_Icon from "../../assets/icons/user_remove_icon.svg";
import { initiateOffboarding } from "../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import { OFFBOARDING_STATUS } from "../../Common/utils/enums";

const EmployeeRepositoryTable = () => {
  const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);
  const allEmployees = hrRepositoryReducer.allEmployees?? [];
  const getAllComponentType = useMemo(
    () => hrRepositoryReducer?.getAllComponentType ?? {},
    [hrRepositoryReducer?.getAllComponentType]
  );
  const [employeeTypeDropdown, setEmployeeTypeDropdown] = useState([]);
  const [employeeDepartmentType, setEmployeeDepartmentType] = useState([]);
  const [searchContent, setSearchContent] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const showFilters = searchParams.get("showFilters") === "true";
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [appliedTypes, setAppliedTypes] = useState([]);
  const [appliedRoles, setAppliedRoles] = useState([]);
  const [stagingTypes, setStagingTypes] = useState([]);
  const [stagingRoles, setStagingRoles] = useState([]);
  const filterContainerRef = useRef(null);
  const offboardingLoading = hrRepositoryReducer?.offboardingLoading?? false;
  const [offboardConfirmOpen, setOffboardConfirmOpen] = useState(false);
  const [employeeToOffboard, setEmployeeToOffboard] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    setEmployeeTypeDropdown(getAllComponentType && getAllComponentType?.emp_type_dropdown);
    setEmployeeDepartmentType(getAllComponentType && getAllComponentType?.department_type_dropdown);
  }, [getAllComponentType]);

  const filterEmployees = allEmployees.filter((employee) => {
    const fullName =
      `${employee.employeeFirstName} ${employee.employeeLastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchContent.toLowerCase());
    const matchesType =
      appliedTypes.length === 0 ||
      appliedTypes.includes(employee.employeeJobType);
    const matchesRole =
      appliedRoles.length === 0 ||
      appliedRoles.includes(employee.employeeDepartment);
    return matchesSearch && matchesType && matchesRole;
  });

  const handleNameClick = (employee) => {
    setSearchParams((prev) => {
      prev.set("showEmployeeDetails", "true");
      prev.set("employeeUuid", employee?.employeeUuid);
      return prev;
    });
  };

  const handleOffboardClick = (employee, e) => {
    e.stopPropagation();
    if (offboardingLoading) return;
    setEmployeeToOffboard(employee);
    setOffboardConfirmOpen(true);
  };

  const handleOffboardConfirm = () => {
    if (employeeToOffboard) {
      dispatch(initiateOffboarding(employeeToOffboard?.employeeUuid));
      setEmployeeToOffboard(null);
    }
    setOffboardConfirmOpen(false);
  };

  const handleOffboardConfirmClose = () => {
    setOffboardConfirmOpen(false);
    setEmployeeToOffboard(null);
  };

  const handleInClearanceClick = (employee, e) => {
    e.stopPropagation();
    if(offboardingLoading) return;
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: "Employee Offboarding is already Initiated",
        severity: "error",
      },
    });
  };

  const handleFilterClick = () => {
    setSearchParams((prev) => {
      if (showFilters) {
        prev.delete("showFilters");
      } else {
        prev.set("showFilters", "true");
      }
      return prev;
    });

    // Reset staging filters to current applied filters
    setStagingTypes(appliedTypes);
    setStagingRoles(appliedRoles);
  };

  const handleCheckboxChange = (category, value) => {
    if (category === "type") {
      setStagingTypes((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    } else {
      setStagingRoles((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    }
  };

  const handleApplyFilters = () => {
    setAppliedTypes(stagingTypes);
    setAppliedRoles(stagingRoles);

    setSearchParams((prev) => {
      prev.delete("showFilters");
      return prev;
    });

    setShowTypeDropdown(false);
    setShowRoleDropdown(false);
  };

  const handleSearch = (searchedText) => {
    setSearchContent(searchedText);
  };

  const getEmployeeType = (employeeJobType) => {
    if (!employeeTypeDropdown || !employeeJobType) {
      return "Unknown";
    }
    return employeeTypeDropdown[employeeJobType] || employeeJobType;
  };

  const getEmployeeDepartment = (employeeDepartment) => {
    if (!employeeDepartmentType || !employeeDepartment) {
      return "Unknown";
    }
    return employeeDepartmentType[employeeDepartment] || employeeDepartment;
  };

  const toggleTypeDropdown = () => {
    setShowTypeDropdown(!showTypeDropdown);
  };

  const toggleRoleDropdown = () => {
    setShowRoleDropdown(!showRoleDropdown);
  };

  
  const handleClickOutside = useCallback(
    (event) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target) &&
        !event.target.classList.contains("filter_icon")
      ) {
        setSearchParams((prev) => {
          prev.delete("showFilters");
          return prev;
        });
        setShowTypeDropdown(false);
        setShowRoleDropdown(false);
      }
    },
    [setSearchParams, setShowTypeDropdown, setShowRoleDropdown]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <>
      <ConfirmationPopup
        isOpen={offboardConfirmOpen}
        onClose={handleOffboardConfirmClose}
        onConfirm={handleOffboardConfirm}
        heading="Confirm Offboarding"
        message={
          employeeToOffboard
            ? `Start the offboarding process for ${employeeToOffboard.employeeFirstName} ${employeeToOffboard.employeeLastName}?`
            : "Are you sure you want to offboard this employee?"
        }
        confirmText="Yes, Offboard"
        cancelText="Cancel"
      />
      <div className="employee_repository_table_container">
        <div className="employee_repository_header">
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
                value={searchContent}
                onChange={(e) => handleSearch(e.target.value)}
                className="employee-search-input"
              />
              <button
                type="button"
                className="filter_icon_button"
                onClick={handleFilterClick}
                aria-label="Filter"
              >
                <img src={filter_icon} alt="filter_icon" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div
              className="employee_repository_filter_container"
              ref={filterContainerRef}
            >
              <div className="filter_dropdown">
                <p className="filter_header">Filter By:</p>
                <div className="filter_options">
                  <div className="filter_select">
                    <div className="custom-dropdown">
                      <button
                        className="dropdown-button"
                        onClick={toggleTypeDropdown}
                      >
                        <span>Type</span>
                        <span>
                          <img src={Dropdown_Arrow} />
                        </span>
                      </button>
                      {showTypeDropdown && (
                        <div className="dropdown-content">
                          {getAllComponentType?.emp_type_dropdown &&
                            Object.entries(
                              getAllComponentType?.emp_type_dropdown
                            ).map(([key, value]) => (
                              <label key={key} className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={stagingTypes.includes(key)}
                                  onChange={() =>
                                    handleCheckboxChange("type", key)
                                  }
                                />
                                <span>{value}</span>
                              </label>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="filter-select">
                    <div className="custom-dropdown">
                      <button
                        className="dropdown-button"
                        onClick={toggleRoleDropdown}
                      >
                        <span>Role</span>
                        <span>
                          <img src={Dropdown_Arrow} />
                        </span>
                      </button>
                      {showRoleDropdown && (
                        <div className="dropdown-content">
                          {getAllComponentType?.department_type_dropdown &&
                            Object.entries(
                              getAllComponentType?.department_type_dropdown
                            ).map(([key, value]) => (
                              <label key={key} className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={stagingRoles.includes(key)}
                                  onChange={() =>
                                    handleCheckboxChange("role", key)
                                  }
                                />
                                <span>{value}</span>
                              </label>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="filter_actions">
                  <button className="apply_button" onClick={handleApplyFilters}>
                    <p>Apply</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {allEmployees.length > 0 ? (filterEmployees.length > 0 ? (
          <div className="employee_repository_log">
            <div className="log-header">
              <p>Active Employees ({filterEmployees.length})</p>
            </div>
            <div className="log-table">
              <table className="employee-table">
                <thead>
                  <tr>
                    {EmployeeRepositoryTableHeader.map((header) => (
                      <th key={header.name}>
                        {header.name === "Name" && (
                          <span className="th-with-icons">
                            {header.label}
                            <img src={sortIcon} alt="Sort" className="th-icon" />
                            <img src={filterIcon} alt="Filter" className="th-icon" />
                          </span>
                        )}
                        {header.name === "Type" && (
                          <span className="th-with-icons">
                            {header.label}
                            <img src={filterIcon} alt="Filter" className="th-icon" />
                          </span>
                        )}
                        {header.name === "Department" && (
                          <span className="th-with-icons">
                            {header.label}
                            <img src={filterIcon} alt="Filter" className="th-icon" />
                          </span>
                        )}
                        {!["Name", "Type", "Department"].includes(header.name) && header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterEmployees.map((employee, index) => (
                    <tr
                      key={employee.employeeUuid}
                      onClick={() => handleNameClick(employee)}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <button
                          type="button"
                          className="employee-name-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNameClick(employee);
                          }}
                        >
                          {`${employee.employeeFirstName} ${employee.employeeLastName}`}
                        </button>
                      </td>
                      <td>{getEmployeeType(employee.employeeJobType)}</td>
                      <td>{getEmployeeDepartment(employee.employeeDepartment)}</td>
                      <td>
                        {employee.offboarding_status !== OFFBOARDING_STATUS.NOT_INITIATED ? (
                          <button
                            type="button"
                            className="offboard_button in_clearance_button"
                            onClick={(e) => handleInClearanceClick(employee, e)}
                          >
                            <img src={User_Remove_Icon} alt="Offboard_icon" /> In Clearance
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="offboard_button"
                            onClick={(e) => handleOffboardClick(employee, e)}
                          >
                            {offboardingLoading ? (
                              <LoadingSpinner message="" height="20px" color="#ffffff" loaderSize={20}/>
                            ) : (
                              <>
                                <img src={User_Remove_Icon} alt="Offboard_icon" /> Offboard
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <NoResultsContainer
            showImage={true}
            message="We couldn't find anyone matching your search."
            subMessage="Try searching with different details."
          />
        )) : (
          <NoResultsContainer
            showImage={true}
            message="We couldn't find anyone matching your search."
            subMessage="Try searching with different details."
          />
        )}
      </div>
    </>
  );
};

export default EmployeeRepositoryTable;
