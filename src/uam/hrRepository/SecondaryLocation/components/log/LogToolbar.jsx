import { useEffect, useMemo, useRef, useState } from "react";
import SearchIconGrey from "../../../assets/icons/Search_icon_grey.svg";
import PlusIcon from "../../../assets/icons/Plus_icon.svg";
import CrossIcon from "../../../assets/icons/cross_icon.svg";
import MittarvLogo from "../../../assets/images/mittarv_logo_dark.svg";
import Filter from "../../../Common/components/Filter/Filter";
import Sort from "../../../Common/components/Sort";
import CustomDropdown from "../../../Common/components/CustomDropdown";
import { MONTH_OPTIONS, getYearOptions } from "./logConstants";

const LogToolbar = ({
  canSearchEmployees,
  employeeSearchQuery,
  onEmployeeSearchQueryChange,
  onEmployeeSelect,
  employeeSearchSuggestions,
  actorEmployeeUuid,
  selectedEmployeeName,
  selectedEmployeeProfileImage,
  showSelectedEmployeeChip,
  onClearSelectedEmployee,
  month,
  year,
  onMonthChange,
  onYearChange,
  selectedStatuses,
  onStatusSelect,
  statusFilterOptions,
  currentSort,
  onSortSelect,
  isSortOpen,
  setIsSortOpen,
  onOpenCreate,
  disableCreate,
}) => {
  const yearOptions = getYearOptions();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchWrapRef = useRef(null);

  const monthDropdownOptions = useMemo(
    () =>
      MONTH_OPTIONS.filter((item) => item.value !== "").map((item) => ({
        value: item.label,
      })),
    []
  );

  const yearDropdownOptions = useMemo(
    () =>
      yearOptions
        .filter((item) => item.value !== "")
        .map((item) => ({ value: String(item.label) })),
    [yearOptions]
  );

  const selectedMonthLabel = useMemo(() => {
    if (month === "" || month === null || month === undefined) return "";
    const matchedMonth = MONTH_OPTIONS.find((item) => String(item.value) === String(month));
    return matchedMonth?.label || "";
  }, [month]);

  const selectedYearLabel = useMemo(() => {
    if (year === "" || year === null || year === undefined) return "";
    const matchedYear = yearOptions.find((item) => String(item.value) === String(year));
    return matchedYear ? String(matchedYear.label) : String(year);
  }, [year, yearOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!employeeSearchQuery.trim()) {
      setShowSearchResults(false);
    }
  }, [employeeSearchQuery]);

  const handleMonthChange = (event) => {
    const selectedLabel = event?.target?.value || "";
    const matchedMonth = MONTH_OPTIONS.find((item) => item.label === selectedLabel);
    onMonthChange(matchedMonth ? String(matchedMonth.value) : "");
  };

  const handleYearChange = (event) => {
    const selectedLabel = event?.target?.value || "";
    const matchedYear = yearOptions.find((item) => String(item.label) === selectedLabel);
    onYearChange(matchedYear ? String(matchedYear.value) : "");
  };

  return (
    <div className="sl_log_toolbar_wrap">
      <div className="sl_log_toolbar_left">
        <div className="sl_log_top_controls_row">
          {canSearchEmployees && (
            <div className="sl_log_search_block">
              <div className="sl_log_employee_search_wrap" ref={searchWrapRef}>
                <div className="sl_log_search_group">
                  <div className="sl_log_search_box">
                    <img src={SearchIconGrey} alt="Search" />
                    <input
                      type="text"
                      value={employeeSearchQuery}
                      onChange={(event) => {
                        onEmployeeSearchQueryChange(event.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => setShowSearchResults(true)}
                      placeholder="Search employees"
                    />
                  </div>
                </div>

                {employeeSearchQuery.trim().length > 0 && showSearchResults && (
                  <div className="sl_log_employee_search_results">
                    {employeeSearchSuggestions.length > 0 ? (
                      employeeSearchSuggestions.map((employee) => {
                        const isCurrentUser = employee.empUuid === actorEmployeeUuid;
                        return (
                          <div
                            key={employee.empUuid}
                            className={`sl_log_employee_search_item${isCurrentUser ? " disabled" : ""}`}
                            onClick={() => {
                              if (!isCurrentUser) {
                                onEmployeeSelect(employee);
                                setShowSearchResults(false);
                              }
                            }}
                            style={isCurrentUser ? { cursor: "not-allowed", opacity: 0.8 } : {}}
                          >
                            <img
                              src={employee.profileImage || MittarvLogo}
                              alt="profile_pic"
                              referrerPolicy="no-referrer"
                            />
                            <span>
                              {isCurrentUser ? `${employee.name} (you)` : employee.name}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="sl_log_employee_no_results">No result found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="sl_log_filters_group">
            <CustomDropdown
              options={monthDropdownOptions}
              value={selectedMonthLabel}
              onChange={handleMonthChange}
              placeholder="Month"
              fieldName="secondaryLocationLogMonth"
              searchable={false}
              allowClearSelection
              clearOptionLabel="None"
              deselectOnReselect
              className="sl-log-month-dropdown"
            />

            <CustomDropdown
              options={yearDropdownOptions}
              value={selectedYearLabel}
              onChange={handleYearChange}
              placeholder="Year"
              fieldName="secondaryLocationLogYear"
              searchable={false}
              allowClearSelection
              clearOptionLabel="None"
              deselectOnReselect
              className="sl-log-year-dropdown"
            />

            <Filter
              options={statusFilterOptions}
              selected={selectedStatuses}
              onSelect={onStatusSelect}
              showSearch={false}
            />

            <Sort
              options={[
                { key: "latest", label: "Latest created" },
                { key: "oldest", label: "Oldest created" },
                { key: "startAsc", label: "Start date (Earliest first)" },
                { key: "startDesc", label: "Start date (Latest first)" },
                { key: "endAsc", label: "End date (Earliest first)" },
                { key: "endDesc", label: "End date (Latest first)" },
              ]}
              currentSort={currentSort}
              onSortSelect={onSortSelect}
              isOpen={isSortOpen}
              setIsOpen={setIsSortOpen}
            />
          </div>
        </div>

        {canSearchEmployees && showSelectedEmployeeChip && selectedEmployeeName && (
          <div className="sl_log_records_container">
            <p className="sl_log_records_title">Location logs of</p>
            <div className="sl_log_records_employee_container">
              <img
                src={selectedEmployeeProfileImage || MittarvLogo}
                alt="profile_pic"
                className="profile_picture_container"
                referrerPolicy="no-referrer"
              />
              <span>{selectedEmployeeName}</span>
              <button type="button" onClick={onClearSelectedEmployee} aria-label="Clear selected employee">
                <img src={CrossIcon} alt="clear" />
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        className="sl_log_primary_button"
        onClick={onOpenCreate}
        disabled={disableCreate}
      >
        <img src={PlusIcon} alt="add" />
        <span>Log Secondary Location Dates</span>
      </button>
    </div>
  );
};

export default LogToolbar;
