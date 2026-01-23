import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Dropdown_Icon from "../../../assets/icons/blue_dropdown_icon.svg";
import {
  getAllYears,
} from "../../Payroll/utils/PayrollUtils.js";
import "../styles/PayslipFilter.scss";

const PayslipFilter = ({
  selectedYear = null,
  onYearChange = () => {},
}) => {
  // Memoized utility values to prevent re-computation on every render
  const years = useMemo(() => getAllYears(), []);

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = useCallback((dropdownType) => {
    setOpenDropdown((prev) => (prev === dropdownType ? null : dropdownType));
  }, []);

  const handleYearSelect = useCallback(
    (year) => {
      onYearChange(year);
      setOpenDropdown(null);
    },
    [onYearChange]
  );

  return (
    <div ref={dropdownRef} className="payslip_filter_main_container">

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
    </div>
  );
};

export default PayslipFilter;
