import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import {
  
  getCurrentEmployeeDetails,
  
} from "../../../../actions/hrRepositoryAction";
import Snackbar from "../../Common/components/Snackbar";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import EmployeeCard from "./EmployeeCard";
import Sort from "./Sort";
import "../styles/EmployeeDirectory.scss";
import noResultsImg from "../../assets/icons/no_results_icon.svg";
import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import cross from "../../assets/icons/cross_icon.svg";
import filter_grey_icon from "../../assets/icons/filter_grey_icon.svg";
import divider from "../../assets/icons/divider_icon.svg";
import tick_icon from "../../assets/icons/tick_icon.svg";
import { ClickAwayListener } from "@mui/material";
import dropdown_arrow from "../../assets/icons/dropdown_arrow.svg";
import { hrToolHomePageData } from "../../constant/data";

const FilterDropdown = ({ title, options, selected, onSelect }) => {
  

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const activeCount = selected.length;

 
  const listOptions = Object.entries(options).map(([key, value]) => ({
    key,
    label: value,
  }));
  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return listOptions;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return listOptions.filter(option =>
      option.label.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [listOptions, searchTerm]);
 

  const handleOptionClick = (key) => {
   
    onSelect(key);
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div
        className={`filter-dropdown-container ${
          activeCount > 0 ? "active" : ""
        }`}
      >
        <button
          className="filter-button-label"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <p>{activeCount > 0 && <span>{activeCount}</span>} {title} </p>

          
          <img
            src={dropdown_arrow}
            alt="Dropdown"
            className={`dropdown-arrow-icon ${isOpen ? "rotated" : ""}`}
          />
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            <div className="search-input-container">
              <img src={searchIcon}/>
              <img src={divider}/>
              <input
                type="text"
                placeholder="Start Searching"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dropdown-search-input" 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>

            
            {filteredOptions.length > 0 ? (
              <div className="dropdown-options-list">
                {filteredOptions.map((option) => (
                  <div
                    key={option.key}
                    className={`dropdown-item ${
                      selected.includes(option.key) ? "selected" : ""
                    }`}
                    onClick={() => handleOptionClick(option.key)}
                  >
                    {option.label}
                    {selected.includes(option.key) && <img src={tick_icon} alt="Selected" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};


const EmployeeDirectory = ({hasAccess}) => {

  const dispatch = useDispatch();
  const { loading, allEmployees, getAllComponentType, getAllManagersDetails } =
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
      dispatch(getCurrentEmployeeDetails(clickedUuid));
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
      {loading ? (
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

                <FilterDropdown
                  title="Team"
                  options={departmentMap}
                  selected={selectedDepartments}
                  onSelect={(key) =>
                    handleToggleFilterSelection(key, setSelectedDepartments)
                  }
                />
                <FilterDropdown
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
            <div className="no-results-container">
              <img
                src={noResultsImg}
                alt="No results"
                className="no-results-image"
              />
              <p className="no-results-text">
                We couldn’t find anyone matching your search.
                <br />
                Try searching with different details.
              </p>
            </div>
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
