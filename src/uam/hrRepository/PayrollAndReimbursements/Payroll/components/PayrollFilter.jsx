import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Dropdown_Icon from "../../../../../assets/icons/blue_dropdown_icon.svg";
import Sort_Icon from "../../../../../assets/icons/sort_icon.svg";
import Filter_Icon from "../../../../../assets/icons/filter_blue_icon.svg";
import {
  getAllMonthsLocale,
  getShortMonthName,
  getAllYears,
  SORT_DISPLAY_OPTIONS,
  STATUS_DISPLAY_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "../utils/PayrollUtils.js";
import "../styles/PayrollFilter.scss";

const PayrollFilter = ({
  onMonthChange,
  onYearChange,
  onSortChange,
  onStatusFilterChange,
  onFilterReset,
}) => {
  const { payrollFilters } = useSelector((state) => state.hrRepositoryReducer);
  const { 
    selectedMonth, 
    selectedYear, 
    selectedSortOption, 
    selectedStatusFilter 
  } = payrollFilters;
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Memoized utility values to prevent re-computation on every render
  const monthsLocale = useMemo(() => getAllMonthsLocale(), []);
  const years = useMemo(() => getAllYears(), []);
  const sortOptions = useMemo(() => SORT_DISPLAY_OPTIONS, []);
  const statusOptions = useMemo(() => STATUS_DISPLAY_OPTIONS, []);



  // Memoized function to get short month name
  const ShortMonthName = useCallback((fullMonthName) => {
    return getShortMonthName(fullMonthName);
  }, []);

  // Close dropdown when clicking outside - TEMPORARILY DISABLED FOR DEBUGGING
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Temporarily disable to test if this is causing the issue
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTimeout(() => {
          setOpenDropdown(null);
        }, 0);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = useCallback(
    (dropdownType) => {
      setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
    },
    [openDropdown]
  );

  const handleMonthSelect = useCallback(
    (month) => {
      onMonthChange(month);
      setOpenDropdown(null);
    },
    [onMonthChange]
  );

  const handleYearSelect = useCallback(
    (year) => {
      onYearChange(year);
      setOpenDropdown(null);
    },
    [onYearChange]
  );

  const handleSortSelect = useCallback(
    (sortOption) => {
      onSortChange(sortOption);
      setOpenDropdown(null);
    },
    [onSortChange]
  );

  const handleStatusFilterSelect = useCallback(
    (statusFilter) => {
      onStatusFilterChange(statusFilter);
      setOpenDropdown(null);
    },
    [onStatusFilterChange]
  );

  const handleFilterReset = useCallback(() => {
    onFilterReset();
  }, [onFilterReset]);

  const getSortDisplayLabel = useCallback(() => {
    const option = sortOptions.find(opt => opt.value === selectedSortOption);
    return option ? option.label : "Sort By";
  }, [selectedSortOption, sortOptions]);

  const getStatusFilterDisplayLabel = useCallback(() => {
    const option = statusOptions.find(opt => opt.value === selectedStatusFilter);
    return option ? option.label : "Filter Status";
  }, [selectedStatusFilter, statusOptions]);

  return (
    <div ref={dropdownRef}>
      <div className="payroll_filter_container">
        <div className="payroll_month_filter">
          <span
            className={`payroll_month_filter_title ${
              openDropdown === "month" ? "active" : ""
            }`}
            onClick={() => toggleDropdown("month")}
          >
            <span className="selected_month">
              {selectedMonth ? ShortMonthName(selectedMonth) : "Month"}
            </span>
            <img
              src={Dropdown_Icon}
              alt="Dropdown Icon"
              className={`dropdown_icon ${
                openDropdown === "month" ? "rotated" : ""
              }`}
            />
          </span>
          <div
            className={`payroll_month_options ${
              openDropdown === "month" ? "show" : ""
            }`}
          >
            {monthsLocale.map((month) => (
              <div
                key={month}
                className="payroll_month_option"
                onClick={() => handleMonthSelect(month)}
              >
                {month}
              </div>
            ))}
          </div>
        </div>

        <div className="payroll_year_filter">
          <span
            className={`payroll_year_filter_title ${
              openDropdown === "year" ? "active" : ""
            }`}
            onClick={() => toggleDropdown("year")}
          >
            <span className="selected_year">{selectedYear || "Year"}</span>
            <img
              src={Dropdown_Icon}
              alt="Dropdown Icon"
              className={`dropdown_icon ${
                openDropdown === "year" ? "rotated" : ""
              }`}
            />
          </span>
          <div
            className={`payroll_year_options ${
              openDropdown === "year" ? "show" : ""
            }`}
          >
            {years.map((year) => (
              <div
                key={year}
                className="payroll_year_option"
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </div>
            ))}
          </div>
        </div>

        <div className="payroll_sort_filter">
          <span
            className={`payroll_sort_filter_title ${
              openDropdown === "sort" ? "active" : ""
            }`}
            onClick={() => toggleDropdown("sort")}
          >
            <img src={Sort_Icon} alt="Sort Icon" className="sort_filter_icon" />
            <span className="selected_sort">{getSortDisplayLabel()}</span>
            <img
              src={Dropdown_Icon}
              alt="Dropdown Icon"
              className={`dropdown_icon ${
                openDropdown === "sort" ? "rotated" : ""
              }`}
            />
          </span>
          <div
            className={`payroll_sort_options_dropdown ${
              openDropdown === "sort" ? "show" : ""
            }`}
          >
            {sortOptions.map((option) => (
              <div
                key={option.value}
                className="payroll_sort_option"
                onClick={() => handleSortSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>

        <div className="payroll_status_filter">
          <span
            className={`payroll_status_filter_title ${
              openDropdown === "status" ? "active" : ""
            }`}
            onClick={() => toggleDropdown("status")}
          >
            <img src={Filter_Icon} alt="Filter Icon" className="status_filter_icon" />
            <span className="selected_status">{getStatusFilterDisplayLabel()}</span>
            <img
              src={Dropdown_Icon}
              alt="Dropdown Icon"
              className={`dropdown_icon ${
                openDropdown === "status" ? "rotated" : ""
              }`}
            />
          </span>
          <div
            className={`payroll_status_options_dropdown ${
              openDropdown === "status" ? "show" : ""
            }`}
          >
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className="payroll_status_option"
                onClick={() => handleStatusFilterSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>

        {(selectedMonth 
          || selectedYear
          || selectedSortOption !== SORT_OPTIONS.NONE
          || selectedStatusFilter !== STATUS_OPTIONS.ALL
        ) && (
          <div className="clear_filter_button" onClick={handleFilterReset}>
            <span className="clear_filter_title">Clear Filters</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollFilter;
