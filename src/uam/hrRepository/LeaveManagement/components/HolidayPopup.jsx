import { useState, useEffect, useMemo, useCallback } from "react";
import Dropdown_arrow from "../../../../assets/icons/dropdown_arrow.svg";
import Cross_icon from "../../../../assets/icons/cross_icon.svg";
import Cancel_icon from "../../../../assets/icons/cancel_icon_red.svg";
import Tick_icon from "../../../../assets/icons/trailing_icon.svg";
import Restore_icon from "../../../../assets/icons/restore_icon.svg";
import Remove_disable_icon from "../../../../assets/icons/remove_grey_icon.svg";
import { createHolidays, deleteHolidays, updateHolidays } from "../../../../actions/hrRepositoryAction";
import "../styles/HolidayPopup.scss";
import { useDispatch } from "react-redux";

const HolidayPopup = ({
  isOpen,
  onClose,
  editMode = false,
  holidayType = "",
  existingHolidays = [],
  currentUser = null
}) => {
  const [selectedType, setSelectedType] = useState("mandatory");
  const [entries, setEntries] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState("");
  const [deletedIds, setDeletedIds] = useState([]);
  const dispatch = useDispatch();


  const formatDateForInput = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }, []);

  // Create initial entry
  const createInitialEntry = useCallback((type = "mandatory") => ({
    eventName: "",
    eventDate: type === "mandatory" ? "" : null,
    isNew: true,
    isEdited: false,
    toDelete: false
  }), []);

 
useEffect(() => {
  if (!isOpen) return;

  if (editMode) {
    // Always use the passed holidayType in edit mode, regardless of existing holidays count
    const normalizedType = holidayType === "optional_restricted" ? "optional" : holidayType;
    setSelectedType(normalizedType);
    
    if (existingHolidays.length > 0) {
      setEntries(existingHolidays.map(holiday => ({
        id: holiday.holidayId,
        eventName: holiday.eventName,
        eventDate: formatDateForInput(holiday.eventDate),
        isNew: false,
        isEdited: false,
        toDelete: false,
        originalEventName: holiday.eventName,
        originalEventDate: holiday.eventDate
      })));
    } else {
      setEntries([createInitialEntry(normalizedType)]);
    }
  } else {
    
    setSelectedType("mandatory");
    setEntries([createInitialEntry("mandatory")]);
  }
  
  setError("");
  setDeletedIds([]);
}, [isOpen, editMode, holidayType, existingHolidays, formatDateForInput, createInitialEntry]);

  
  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
    setIsDropdownOpen(false);
    
    if (!editMode) {
      setEntries([createInitialEntry(type)]);
    }
  }, [editMode, createInitialEntry]);

  
  const isEntryValid = useCallback((entry) => {
    if (!entry.eventName.trim()) return false;
    return selectedType !== "mandatory" || Boolean(entry.eventDate);
  }, [selectedType]);

  const validateEntries = useCallback(() => {
    const activeEntries = entries.filter(entry => !entry.toDelete);
    
    
    if (activeEntries.length === 0) {
      return editMode ? "" : "At least one holiday entry is required";
    }
    
    for (const entry of activeEntries) {
      if (!entry.eventName.trim()) {
        return "Event name is required";
      }
      if (selectedType === "mandatory" && !entry.eventDate) {
        return "Date is required for mandatory holidays";
      }
    }
    return "";
  }, [entries, selectedType, editMode]);

  // Memoized active entries
  const activeEntries = useMemo(() => 
    entries.filter(entry => !entry.toDelete), 
    [entries]
  );

 
  const isFormValid = useMemo(() => {
    // In edit mode, form is valid even with no active entries (allows deletion of all)
    if (editMode) return true;
    
    return activeEntries.length > 0 && 
           activeEntries.every(entry => isEntryValid(entry));
  }, [activeEntries, isEntryValid, editMode]);

  // Add new entry
  const handleAddEntry = useCallback(() => {
    const lastEntry = entries[entries.length - 1];
    
    if (lastEntry && !lastEntry.toDelete && !isEntryValid(lastEntry)) {
      setError("Please fill the current entry before adding a new one");
      return;
    }
    
    setError("");
    setEntries(prev => [...prev, createInitialEntry(selectedType)]);
  }, [entries, isEntryValid, createInitialEntry, selectedType]);

  // Handle input changes
  const handleInputChange = useCallback((index, field, value) => {
    setEntries(prev => {
      const updated = [...prev];
      const entry = updated[index];
      
      if (!entry.isNew && entry[field] !== value) {
        entry.isEdited = true;
      }
      
      entry[field] = value;
      return updated;
    });
    setError("");
  }, []);

  // Remove entry
  const handleRemoveEntry = useCallback((index) => {
    setEntries(prev => {
      const updated = [...prev];
      const entry = updated[index];
      
      if (entry.isNew) {
        updated.splice(index, 1);
      } else {
        entry.toDelete = true;
        if (entry.id) {
          setDeletedIds(prevIds => [...prevIds, entry.id]);
        }
      }
      
      return updated;
    });
  }, []);

  // Restore entry
  const handleRestoreEntry = useCallback((index) => {
    setEntries(prev => {
      const updated = [...prev];
      const entry = updated[index];
      
      entry.toDelete = false;
      if (entry.id) {
        setDeletedIds(prevIds => prevIds.filter(id => id !== entry.id));
      }
      
      return updated;
    });
  }, []);

 
  const handleCancel = useCallback(() => {
    setError("");
    setDeletedIds([]);
    onClose();
  }, [onClose]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    const validationError = validateEntries();
    if (validationError) {
      setError(validationError);
      return;
    }

    const eventType = selectedType === "optional" ? "optional_restricted" : selectedType;
    const baseEntry = { eventType, createdBy: currentUser?.employeeUuid || "admin" };

    if (editMode) {
      const newEntries = entries
        .filter(entry => entry.isNew && !entry.toDelete)
        .map(entry => ({
          ...baseEntry,
          eventName: entry.eventName.trim(),
          eventDate: entry.eventDate || null
        }));

      const editedEntries = entries
        .filter(entry => !entry.isNew && entry.isEdited && !entry.toDelete)
        .map(entry => ({
          ...baseEntry,
          holidayId: entry.id,
          eventName: entry.eventName.trim(),
          eventDate: entry.eventDate || null
        }));

      if (deletedIds.length > 0) {
        dispatch(deleteHolidays(deletedIds));
      }
      if (editedEntries.length > 0) {
        dispatch(updateHolidays(editedEntries));
      }
      if (newEntries.length > 0) {
        dispatch(createHolidays(newEntries));
      }
    } else {
      const newEntries = activeEntries.map(entry => ({
        ...baseEntry,
        eventName: entry.eventName.trim(),
        eventDate: entry.eventDate || null
      }));
      
      dispatch(createHolidays(newEntries));
    }

    handleCancel();
  }, [validateEntries, selectedType, currentUser, editMode, entries, deletedIds, activeEntries, dispatch, handleCancel]);


  // Check if add button should be disabled
  const isAddButtonDisabled = useMemo(() => 
    entries.some(entry => 
      !entry.toDelete && !isEntryValid(entry)
    ), 
    [entries, isEntryValid]
  );

  if (!isOpen) return null;

  return (
    <div className="holiday-popup-overlay">
      <div className="holiday-popup-container">
        <div className="holiday-popup-content">
          {/* Header with Type Selector */}
          <div className="holiday-type-selector">
            <div className="holiday-dropdown">
              <div className="holiday_dropdown_container">
                <div
                  className="dropdown-header"
                  onClick={!editMode ? () => setIsDropdownOpen(!isDropdownOpen) : undefined}
                >
                  <span className="holiday_dropdown_title">
                    {selectedType === "mandatory"
                      ? "Yearly Mandatory Holidays"
                      : "Yearly Optional/Restricted Holidays"}
                  </span>
                  {!editMode && (
                    <span className={`dropdown-arrow ${isDropdownOpen ? "open" : "close"}`}>
                      <img src={Dropdown_arrow} alt="dropdown" />
                    </span>
                  )}
                </div>
                <button className="holiday_close_button" onClick={onClose}>
                  <img src={Cross_icon} alt="close" />
                </button>
              </div>

              {isDropdownOpen && !editMode && (
                <div className="dropdown-menu">
                  {["mandatory", "optional"].map(type => (
                    <div
                      key={type}
                      className={`dropdown-item ${selectedType === type ? "active" : ""}`}
                      onClick={() => handleTypeChange(type)}
                    >
                      <span>
                        {type === "mandatory" 
                          ? "Yearly Mandatory Holidays" 
                          : "Yearly Optional/Restricted Holidays"}
                      </span>
                      {selectedType === type && (
                        <span className="check-mark">
                          <img src={Tick_icon} alt="selected" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Entries */}
          <div className="holiday-entries">
            <div className="entry-labels">
              {selectedType === "mandatory" && <label className="date-label">Date*</label>}
              <label className="event-label">Event*</label>
            </div>

            <div className={`${selectedType === "optional" && editMode ? "entries-container" : ""}`}>
              {entries.map((entry, index) => (
                <div key={index} className={`entry-row ${entry.toDelete ? "to-delete" : ""}`}>
                  {selectedType === "mandatory" && (
                    <div className="entry-field">
                      <input
                        type="date"
                        value={entry.eventDate || ""}
                        onChange={(e) => handleInputChange(index, "eventDate", e.target.value)}
                        disabled={entry.toDelete}
                      />
                    </div>
                  )}

                  <div className="entry-field event-field">
                    <input
                      type="text"
                      placeholder="A short name for the event"
                      value={entry.eventName}
                      onChange={(e) => handleInputChange(index, "eventName", e.target.value)}
                      disabled={entry.toDelete}
                    />
                  </div>

                  <div className="entry-actions">
                    {entry.toDelete ? (
                      <button
                        className="restore-button"
                        onClick={() => handleRestoreEntry(index)}
                      >
                        <img src={Restore_icon} alt="restore" />
                      </button>
                    ) : (
                      <button
                        className="remove-button"
                        onClick={() => handleRemoveEntry(index)}
                        disabled={!isEntryValid(entry)}
                      >
                        <img 
                          src={!isEntryValid(entry) ? Remove_disable_icon : Cancel_icon} 
                          alt={!isEntryValid(entry) ? "remove_disabled" : "remove"} 
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="add-entry-row">
              <button
                className="add-entry-button"
                onClick={handleAddEntry}
                disabled={isAddButtonDisabled}
              >
                Add new event
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="holiday-popup-footer">
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className={isFormValid ? "create-button" : "create-button-disabled"}
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            {editMode ? "Apply changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayPopup;