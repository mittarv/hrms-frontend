import { useSelector } from "react-redux";
import Plus_icon from "../../../../assets/icons/Plus_icon.svg";
import Search_icon_grey from "../../../../assets/icons/Search_icon_grey.svg";
import EditIcon from "../../../../assets/icons/edit_button_blue.svg";
import { useState, useEffect } from "react";
import "../styles/LeaveHoliday.scss";
import HolidayPopup from "./HolidayPopup";
import { getAllEmployeeHolidays, fetchAllPolicyDocuments } from "../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import LoadingSpinner from "../../Common/components/LoadingSpinner";


const LeaveHolidays = () => {
  const { empHolidays, policy, loading } = useSelector((state) => state.hrRepositoryReducer);
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 500;
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [isHolidayPopupOpen, setIsHolidayPopupOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [policyLink, setPolicyLink] = useState("");

  useEffect(() => {
    dispatch(getAllEmployeeHolidays());
    dispatch(fetchAllPolicyDocuments());
  }, [dispatch]);

  useEffect(() => {
    if (policy) {
      const policyLink = policy.find((link) => link.policyName.toLowerCase() === "leave and holiday policy");
      setPolicyLink(policyLink ? policyLink.policyLink : "");
    }
  }, [policy]);

  const processedHolidays = {
    mandatory:
      empHolidays?.filter(
        (holiday) => holiday.eventType === "mandatory" && !holiday.isDeleted
      ) || [],
    optional:
      empHolidays?.filter(
        (holiday) =>
          holiday.eventType === "optional_restricted" && !holiday.isDeleted
      ) || [],
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${day} ${month}`;
  };

  // Filter holidays based on search
  const getFilteredHolidays = () => {
    if (!searchQuery) return { mandatory: [], optional: [] };

    const query = searchQuery.toLowerCase();
    return {
      mandatory: processedHolidays.mandatory.filter((holiday) =>
        holiday.eventName.toLowerCase().includes(query)
      ),
      optional: processedHolidays.optional.filter((holiday) =>
        holiday.eventName.toLowerCase().includes(query)
      ),
    };
  };

  const filteredHolidays = getFilteredHolidays();

  const handleOpenPopup = (editType = null) => {
    setEditMode(!!editType);
    setEditingType(editType);
    setIsHolidayPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsHolidayPopupOpen(false);
    setEditMode(false);
    setEditingType(null);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

  // Handle clicking on search result
  const handleSearchResultClick = (eventName) => {
    setSearchQuery(eventName);
    setShowSearchResults(false); // Close the dropdown
  };

  // Chunk optional holidays into rows of 4
  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  return (
    <>
      {loading ? <LoadingSpinner message="Loading Holidays..." height="40vh" /> : 
      <div className="Leave_holiday_main_container">
        {isAdmin && (
          <div className="leave_holiday_header_container">
            <span className="leave_holiday_header">
              <p className="leave_holiday_header_title">Admin</p>
              <p className="leave_holiday_header_subtitle">
                Organizational Details
              </p>
            </span>
            <button
              className="leave_holiday_header_button"
              onClick={() => handleOpenPopup()}
            >
              <img src={Plus_icon} alt="Plus_icon" />
              <span>List a Holiday</span>
            </button>
          </div>
        )}

        {/* Search Section */}
        <div className="leave_holiday_search_container">
          <div className="search_input_wrapper">
            <input
              type="text"
              className="leave_holiday_search_input"
              placeholder="Search holidays"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            <img
              src={Search_icon_grey}
              alt="Search_icon_grey"
              className="leave_holiday_search_icon"
            />
          </div>

          {showSearchResults && (
            <div className="leave_holiday_search_result">
              {[...filteredHolidays.mandatory, ...filteredHolidays.optional]
                .length > 0 ? (
                [
                  ...filteredHolidays.mandatory,
                  ...filteredHolidays.optional,
                ].map((holiday) => (
                  <div
                    key={holiday.holidayId}
                    className="leave_holiday_search_result_container"
                    onClick={() => handleSearchResultClick(holiday.eventName)}
                  >
                    <span>{holiday.eventName}</span>
                  </div>
                ))
              ) : (
                <div className="no_result_found">No result found</div>
              )}
            </div>
          )}
        </div>

        {/* Mandatory Holidays Section */}
        <div className="yearly_holidays_section">
          <p className="holiday_title">
            Yearly Mandatory Holidays
            {isAdmin && (
              <span
                className="edit-button"
                onClick={() => handleOpenPopup("mandatory")}
              >
                <img src={EditIcon} alt="EditIcon" /> Edit
              </span>
            )}
          </p>
          <div className="mandatory_holiday_table_container">
            <table className="mandatory_holidays_table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {processedHolidays.mandatory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      style={{ textAlign: "center", color: "#888" }}
                    >
                      No Yearly Mandatory holidays created
                    </td>
                  </tr>
                ) : (
                  processedHolidays.mandatory.map((holiday) => (
                    <tr
                      key={holiday.holidayId}
                      className={
                        searchQuery &&
                        holiday.eventName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                          ? "selected"
                          : ""
                      }
                    >
                      <td>{formatDate(holiday.eventDate)}</td>
                      <td>{holiday.eventName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional Holidays Section */}
        <div className="yearly_holidays_section">
          <p className="holiday_title">
            Yearly Optional/Restricted Holidays
            {isAdmin && (
              <span
                className="edit-button"
                onClick={() => handleOpenPopup("optional_restricted")}
              >
                <img src={EditIcon} alt="EditIcon" /> Edit
              </span>
            )}
          </p>
          {!isAdmin && (
            <p className="policy_reference">
              *Please refer to the{" "}
              <a
                href={policyLink}
                className="policy_link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leave and Holiday Policy
              </a>{" "}
              for further details regarding the number of leaves applicable to
              you.
            </p>
          )}

          <div className="optional_holidays_table_container">
            <table className="optional_holidays_table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Event</th>
                  <th>Event</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {processedHolidays.optional.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", color: "#888" }}
                    >
                      No Yearly Optional/Restricted holidays created
                    </td>
                  </tr>
                ) : (
                  chunkArray(processedHolidays.optional, 4).map(
                    (row, rowIndex) => (
                      <tr key={`row-${rowIndex}`}>
                        {row.map((holiday) => (
                          <td
                            key={holiday.holidayId}
                            className={
                              searchQuery &&
                              holiday.eventName
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                                ? "selected"
                                : ""
                            }
                          >
                            {holiday.eventName}
                          </td>
                        ))}
                        {/* Fill empty cells */}
                        {Array(4 - row.length)
                          .fill()
                          .map((_, i) => (
                            <td key={`empty-${rowIndex}-${i}`}></td>
                          ))}
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>}

      <HolidayPopup
        isOpen={isHolidayPopupOpen}
        onClose={handleClosePopup}
        editMode={editMode}
        holidayType={editingType}
        existingHolidays={
          editingType
            ? processedHolidays[
                editingType === "mandatory" ? "mandatory" : "optional"
              ]
            : []
        }
        currentUser={user}
      />
    </>
  );
};

export default LeaveHolidays;
