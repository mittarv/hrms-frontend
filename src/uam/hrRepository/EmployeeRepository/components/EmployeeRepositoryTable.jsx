import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "../styles/EmployeeRepositoryTable.scss";
import { EmployeeRepositoryTableHeader } from "../utils/EmployeeRepositoryData";
import { useSelector } from "react-redux";
import filter_icon from "../../../../assets/icons/filter_icon.svg";
import search_icon from "../../../../assets/icons/search_icon.svg";
import { useSearchParams } from "react-router-dom";
import Dropdown_Arrow from "../../../../assets/icons/dropdown_blue_arrow.svg";
import { getCurrentEmployeeDetails } from "../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";

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
    dispatch(getCurrentEmployeeDetails(employee?.employeeUuid));
    setSearchParams((prev) => {
      prev.set("showEmployeeDetails", "true");
      prev.set("employeeUuid", employee?.employeeUuid);
      return prev;
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
      <div className="employee_repository_search_bar_container">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        <img src={search_icon} alt="search_icon" className="search_icon" />
        <img
          src={filter_icon}
          alt="filter_icon"
          className="filter_icon"
          onClick={handleFilterClick}
        />

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
        <div className="employee_table_container">
          <table className="employee-table">
            <thead>
              <tr>
                {EmployeeRepositoryTableHeader.map((header) => (
                  <th key={header.name}>{header.label}</th>
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
                <td className="employee_name">{`${employee.employeeFirstName} ${employee.employeeLastName}`}</td>
                <td>{getEmployeeType(employee.employeeJobType)}</td>
                <td>{getEmployeeDepartment(employee.employeeDepartment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>) : (
        <div className="no_employees_found">
          <p>{`No employees found with name "${searchContent}"`}</p>
        </div>
      )) : (
        <div className="no_employees_found">
          <p>No employees have been onboarded yet. Start building your team!</p>
        </div>
      )}
    </>
  );
};

export default EmployeeRepositoryTable;
