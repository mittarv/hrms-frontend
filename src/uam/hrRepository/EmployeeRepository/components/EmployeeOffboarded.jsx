import "../styles/EmployeeOffboarded.scss";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getAllOffboardedEmployees } from "../../../../actions/hrRepositoryAction";
import { useEffect, useState, useRef } from "react";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import divider from "../../assets/icons/divider_icon.svg";
import sortIcon from "../../assets/icons/sort_grey_icon.svg";
import filterIcon from "../../assets/icons/filter_grey_icon.svg";
import { getComponentTypeValue } from "../../Common/utils/helper";
import Snackbar from "../../Common/components/Snackbar";
import Happy_jar_icon from "../../assets/icons/happy_jar_icon.svg";

const formatLastWorkingDay = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const EmployeeOffboarded = () => {
  const {
    offboardedEmployees,
    getAllOffboardedEmployeesLoading,
    getAllComponentType,
  } = useSelector((state) => state.hrRepositoryReducer);
  const [searchEmployeeName, setSearchEmployeeName] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const dispatch = useDispatch();
  const [, setSearchParams] = useSearchParams();
  const hasFetchedRef = useRef(false);

  const handleNameClick = (row) => {
    setSearchParams((prev) => {
      prev.set("showEmployeeDetails", "true");
      prev.set("employeeUuid", row?.empUuid);
      return prev;
    });
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(getAllOffboardedEmployees());
    }
  }, [dispatch]);

  useEffect(() => {
    const list = offboardedEmployees || [];
    if (searchEmployeeName.trim().length > 0) {
      const q = searchEmployeeName.toLowerCase();
      setFilteredList(
        list.filter((emp) =>
          (
            emp.employeeName ||
            `${emp.empFirstName || ""} ${emp.empLastName || ""}`.trim()
          )
            .toLowerCase()
            .includes(q),
        ),
      );
    } else {
      setFilteredList(list);
    }
  }, [searchEmployeeName, offboardedEmployees]);

  return (
    <>
      {getAllOffboardedEmployeesLoading ? (
        <div className="loading_message">
          <LoadingSpinner message="Loading..." height="40vh" />
        </div>
      ) : (
        <div className="employee_offboarded_container">
          <div className="employee_offboarded_header">
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

          <div className="offboarded_log">
            <div className="log-header">
              <p>Offboarded Employees ({filteredList.length})</p>
            </div>

            <div className="log-table">
              {filteredList.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>
                        <span className="th-with-icons">
                          Employee Name
                          <img src={sortIcon} alt="Sort" className="th-icon" />
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
                      <th>
                        <span className="th-with-icons">
                          Last Working Day
                          <img src={sortIcon} alt="Sort" className="th-icon" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((row, index) => {
                      const empType = row.jobDetails?.empType ?? row.empType;
                      const empDepartment =
                        row.jobDetails?.empDepartment ?? row.empDepartment;
                      const name =
                        row.employeeName ||
                        `${row.empFirstName || ""} ${row.empLastName || ""}`.trim() ||
                        "—";
                      return (
                        <tr
                          key={row.empUuid}
                          onClick={() => handleNameClick(row)}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <button
                              type="button"
                              className="employee-name-link"
                            >
                              {name}
                            </button>
                          </td>
                          <td>
                            {getComponentTypeValue(
                              empType,
                              getAllComponentType,
                            ) ??
                              empType ??
                              "—"}
                          </td>
                          <td>
                            {getComponentTypeValue(
                              empDepartment,
                              getAllComponentType,
                            ) ??
                              empDepartment ??
                              "—"}
                          </td>
                          <td>{formatLastWorkingDay(row.lastWorkingDay)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <NoResultsContainer
                  showImage={true}
                  image={
                    offboardedEmployees.length === 0
                      ? Happy_jar_icon
                      : undefined
                  }
                  message="We couldn't find anyone matching your search."
                  subMessage="Try searching with different details."
                />
              )}
            </div>
          </div>
        </div>
      )}
      <Snackbar />
    </>
  );
};

export default EmployeeOffboarded;
