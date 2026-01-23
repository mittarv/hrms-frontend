import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Search_icon_grey from "../../../assets/icons/Search_icon_grey.svg";
import "../styles/PayrollSearch.scss";

const PayrollSearch = ({ onSearchChange }) => {
  const { payrollFilters } = useSelector((state) => state.hrRepositoryReducer);
  const { searchQuery } = payrollFilters;
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debounceTimerRef = useRef(null);

  // Sync local state with Redux state
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchQuery = useCallback(
    (e) => {
      const value = e.target.value;
      setLocalSearchQuery(value);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced search
      debounceTimerRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 500);
    },
    [onSearchChange]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="payroll_search_container">
      <input
        type="text"
        className="payroll_search_input"
        placeholder="Search employees"
        value={localSearchQuery}
        onChange={handleSearchQuery}
      />
      <img
        src={Search_icon_grey}
        alt="Search_icon_grey"
        className="payroll_search_icon"
      />
    </div>
  );
};

export default PayrollSearch;
