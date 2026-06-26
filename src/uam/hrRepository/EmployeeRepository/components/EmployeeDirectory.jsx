import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import {
  getEmployeeDirectoryDetails,
  
} from "../../../../actions/hrRepositoryAction";
import Snackbar from "../../Common/components/Snackbar";
import Filter from "../../Common/components/Filter/Filter";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import EmployeeCard from "./EmployeeCard";

import Sort from "../../Common/components/Sort";

import "../styles/EmployeeDirectory.scss";





import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import cross from "../../assets/icons/cross_icon.svg";
import filter_grey_icon from "../../assets/icons/filter_grey_icon.svg";
import divider from "../../assets/icons/divider_icon.svg";



import { hrToolHomePageData } from "../../constant/data";


const EmployeeDirectory = ({hasAccess}) => {

  const dispatch = useDispatch();
  const { allEmployeesLoading, allEmployees, getAllComponentType, getAllManagersDetails } =
    useSelector((state) => state.hrRepositoryReducer);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCardUuid, setExpandedCardUuid] = useState(null);

  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]); 
  const [selectedJobTypes, setSelectedJobTypes] = useState([]); 

  const [currentSort, setCurrentSort] = useState();
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const { departmentMap, jobTypeMap } = useMemo(() => {
    const dept = {};
    const job = {};
    if (getAllComponentType?.department_type_dropdown) {
      Object.entries(getAllComponentType.department_type_dropdown).forEach(
        ([key, value]) => {
          dept[key] = value;
        }
      );
    }
    if (getAllComponentType?.emp_type_dropdown) {
      Object.entries(getAllComponentType.emp_type_dropdown).forEach(
        ([key, value]) => {
          job[key] = value;
        }
      );
    }
    return { departmentMap: dept, jobTypeMap: job };
  }, [getAllComponentType]);

  
  useEffect(() => {
     
      dispatch({
        type: "SET_SELECTED_TOOL_NAME",
        payload: hrToolHomePageData.toot_title2
      });
  
    }, [dispatch]);
  const handleCardToggle = (clickedUuid) => {
    const newExpandedUuid =
      expandedCardUuid === clickedUuid ? null : clickedUuid;
    setExpandedCardUuid(newExpandedUuid);
    if (newExpandedUuid !== null) {
      dispatch(getEmployeeDirectoryDetails(clickedUuid));
    }
  };

 
  const handleToggleFilterBar = () => {
    setIsFilterBarOpen((prev) => !prev);
  };

  const handleToggleFilterSelection = (key, setSelectedState) => {
    setSelectedState((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleClearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedJobTypes([]);
    setSearchQuery("");
    
  };

  const handleSortSelect = (clickedKey) => {
    if (currentSort === clickedKey) {
      setCurrentSort("none");
    } else {
      setCurrentSort(clickedKey);
    }
    setIsSortDropdownOpen(false);
  };

  const sortOptions = [
    { key: "name_asc", label: "Name (A - Z)" },
    { key: "name_desc", label: "Name (Z - A)" },
  ];

  const isFilterActive =
    selectedDepartments.length > 0 || selectedJobTypes.length > 0;

  const sortedAndFilteredEmployees = useMemo(() => {
    let filtered = allEmployees.filter((emp) => {
      const fullName =
        `${emp.employeeFirstName} ${emp.employeeLastName}`.toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = fullName.includes(q);
      const matchesDept =
        selectedDepartments.length === 0 ||
        selectedDepartments.includes(emp.employeeDepartment);
      const matchesJobType =
        selectedJobTypes.length === 0 ||
        selectedJobTypes.includes(emp.employeeJobType);

      return matchesSearch && matchesDept && matchesJobType;
    });

    if (currentSort !== "none") {
      filtered.sort((a, b) => {
        const nameA =
          `${a.employeeFirstName} ${a.employeeLastName}`.toLowerCase();
        const nameB =
          `${b.employeeFirstName} ${b.employeeLastName}`.toLowerCase();
        if (currentSort === "name_asc") {
          return nameA.localeCompare(nameB);
        } else if (currentSort === "name_desc") {
          return nameB.localeCompare(nameA);
        }
        return 0;
      });
    }
    return filtered;
  }, [
    allEmployees,
    searchQuery,
    selectedDepartments,
    selectedJobTypes,
    currentSort,
  ]);
  

  return (
    <>
      <Snackbar />
      {allEmployeesLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="employee-directory-container">
          
          <div className="control-bar-container">
            {isFilterBarOpen ? (
              <div className="filter-bar-expanded">
                <button
                  className="filter-toggle-icon "
                  onClick={handleToggleFilterBar}
                >
                  <img src={searchIcon} alt="Close Filter" />
                </button>
             
                <button
                  className={`filter-toggle-icon ${
                    isFilterBarOpen ? "active" : ""
                  }`}
                  onClick={handleToggleFilterBar}
                >
                  <img src={filter_grey_icon} alt="Filter" />
                </button>

                <Filter
                  title="Team"
                  options={departmentMap}
                  selected={selectedDepartments}
                  onSelect={(key) =>
                    handleToggleFilterSelection(key, setSelectedDepartments)
                  }
                />
                <Filter
                  title="Employee Type"
                  options={jobTypeMap}
                  selected={selectedJobTypes}
                  onSelect={(key) =>
                    handleToggleFilterSelection(key, setSelectedJobTypes)
                  }
                />
                <button
                  className="clear-filters-button"
                  onClick={handleClearAllFilters}
                >
                  <img src={cross} alt="Clear" className="clear-icon-x" />
                  Clear
                </button>

              
                <Sort
                  options={sortOptions}
                  currentSort={currentSort}
                  onSortSelect={handleSortSelect}
                  isOpen={isSortDropdownOpen}
                  setIsOpen={setIsSortDropdownOpen}
                />
              </div>
            ) : (
           
              <div className="search-bar-collapsed">
                <div className="search-input-group">
                  <img
                    src={searchIcon}
                    alt="search_icon"
                    className="employee-search-icon"
                  />
                  <img src={divider}/>
                  <input
                    type="text"
                    placeholder="Search employees"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="employee-search-input"
                  />
                </div>

                <button
                  className={`filter-toggle-icon ${
                    isFilterActive ? "active" : ""
                  }`}
                  onClick={handleToggleFilterBar}
                >
                  <img src={filter_grey_icon} alt="Filter" />
                  {isFilterActive && <span className="dot"></span>}
                </button>
                <Sort
                  options={sortOptions}
                  currentSort={currentSort}
                  onSortSelect={handleSortSelect}
                  isOpen={isSortDropdownOpen}
                  setIsOpen={setIsSortDropdownOpen}
                />
              </div>
            )}
          </div>

          <h3 className="employee-title">
            All Employees ({sortedAndFilteredEmployees?.length || 0})
          </h3>
          {sortedAndFilteredEmployees.length === 0 ? (
            <NoResultsContainer
              showImage={true}
              message="We couldn't find anyone matching your search."
              subMessage="Try searching with different details."
            />
          ) : (
            <div className="employee-list">
              {sortedAndFilteredEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.employeeUuid}
                  employee={emp}
                  departmentMap={departmentMap}
                  jobTypeMap={jobTypeMap}
                  isExpanded={emp.employeeUuid === expandedCardUuid}
                  onToggle={handleCardToggle}
                  getAllManagersDetails={getAllManagersDetails}
                  hasAccess={hasAccess}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EmployeeDirectory;
