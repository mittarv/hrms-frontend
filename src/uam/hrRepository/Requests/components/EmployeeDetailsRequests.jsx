import { useState, useEffect } from "react";
import { RequestsTableHeader } from "../utils/RequestsData";
import { getPendingRequests, approveOrRejectRequest, getAllComponentTypes } from "../../../../actions/hrRepositoryAction";
import { useSelector, useDispatch } from "react-redux";
import { formSectionKeyValues, sectionFieldMapping } from "../../EmployeeRepository/utils/EmployeeRepositoryData";
import "../styles/EmployeeDetailsRequests.scss";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

// Define the ENUM for status
export const RequestStatus = {
  APPROVED: "approve",
  REJECTED: "reject",
};

const EmployeeDetailsRequests = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [displayStartDate, setDisplayStartDate] = useState("");
  const [displayEndDate, setDisplayEndDate] = useState("");
  const [checkedRequestIds, setCheckedRequestIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);
  const loading = hrRepositoryReducer?.loading ?? false;
  const pendingRequests = hrRepositoryReducer?.pendingRequests ?? [];
  const componentTypes = hrRepositoryReducer?.getAllComponentType ?? {};
  const getAllComponentType = hrRepositoryReducer?.getAllComponentType ?? [];
  const { user } = useSelector((state) => state.user);
  
  const dispatch = useDispatch();

  // Safely parse JSON with error handling
  const safeJsonParse = (jsonString) => {
    if (jsonString === null || jsonString === undefined) return {};
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return {};
    }
  };

  // Helper function to get a user-friendly section name
  const getSectionName = (sectionKey) => {
    if (sectionKey === null || sectionKey === undefined || sectionKey === "") {
      return "Unknown";
    }
    
    return formSectionKeyValues[sectionKey] ?? sectionKey;
  };

  // Helper function to get field label from field name based on section
  const getFieldLabel = (fieldName, sectionKey) => {
    if (!fieldName || !sectionKey) return fieldName ?? "";
    
    try {
      // Handle case where sectionKey doesn't exist in mapping
      const sectionFields = sectionFieldMapping[sectionKey] ?? [];
      
      if (!Array.isArray(sectionFields)) return fieldName;
      
      // Find the field in the section's field mapping
      const field = sectionFields.find(f => f?.name === fieldName);
      
      // Return the label if found, otherwise return the field name
      return field?.label ?? fieldName;
    } catch (error) {
      console.error("Error getting field label:", error);
      return fieldName ?? "";
    }
  };

  // Helper function to get human-readable value from component types
  const getDisplayValue = (fieldName, value, componentTypes) => {
    if (value === null || value === undefined) return "N/A";
    
    // Map field names to their respective dropdown types
    const fieldDropdownMap = {
      empType: "emp_type_dropdown",
      empDepartment: "department_type_dropdown",
      empManager: null, // This is likely a different type of reference
      empGender: "gender_type_dropdown",
      empBloodGroup: "blood_group_dropdown",
      empMaritalStatus: "marital_status_dropdown",
      empEmergencyContactRelation: "emergency_contact_relation_dropdown",
      empDob: null, // This is a date field, not a dropdown
      empLevel: "level_dropdown",
      state: "location_dropdown",
      empYearOfStudy: "year_of_study",
    };
    
    // Check if this field has a dropdown mapping
    const dropdownType = fieldDropdownMap[fieldName];
    if (!dropdownType || !componentTypes[dropdownType]) {
      // For date fields, format them properly
      if (fieldName === "empDob" && value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          console.error("Error formatting date:", e);
        }
      }
      
      // For government ID field, format the JSON data properly
      if (fieldName === "empGovId" && value) {
        try {
          // Try to parse as JSON if it's a string
          const govIdData = typeof value === 'string' ? JSON.parse(value) : value;
          if (govIdData && typeof govIdData === 'object') {
            const { govIdType, govIdNumber } = govIdData;
            if (govIdType && govIdNumber) {
              return `${govIdType}: ${govIdNumber}`;
            }
          }
        } catch (e) {
          console.error("Error parsing government ID data:", e);
        }
      }
      
      // Return the raw value if no mapping exists
      return String(value);
    }
    
    // Get the dropdown values
    const dropdown = componentTypes[dropdownType];
    
    // Return the mapped value or the original if not found
    return dropdown[value] !== undefined ? dropdown[value] : String(value);
  };

  // Format the pending requests to match the expected structure
  const formatPendingRequests = () => {
    if (!Array.isArray(pendingRequests) || pendingRequests.length === 0) {
      return [];
    }
    
    try {
      return pendingRequests.map(request => {
        if (!request) return null;
        
        // Parse JSON strings to objects with safe fallbacks
        const oldData = safeJsonParse(request?.oldData);
        const newData = safeJsonParse(request?.newData);
        
        // Extract date from createdAt with fallbacks
        let formattedDate = "N/A";
        try {
          if (request?.createdAt) {
            const createdDate = new Date(request.createdAt);
            if (!isNaN(createdDate?.getTime())) { // Check if date is valid
              formattedDate = `${String(createdDate.getDate()).padStart(2, '0')}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${createdDate.getFullYear()}`;
            }
          }
        } catch (error) {
          console.error("Error formatting date:", error);
        }
        
        // Determine the request type based on sectionChanged
        const sectionKey = request?.sectionChanged ?? "";
        const requestType = getSectionName(sectionKey);
        
        return {
          id: request?.requestId ?? `unknown-${Math.random().toString(36).substring(2, 11)}`, // Generate a unique ID if none exists
          person: request?.requestedFor ?? "Unknown",
          requestedBy: request?.requestedBy ?? "Unknown",
          requestedOn: formattedDate ?? "N/A",
          type: requestType ?? "Unknown",
          oldData: oldData ?? {},
          newData: newData ?? {},
          sectionKey: sectionKey,
          // Keep the original request data for later use if needed
          originalRequest: request ?? {}
        };
      }).filter(Boolean); // Remove any null items that may have resulted from errors
    } catch (error) {
      console.error("Error in formatPendingRequests:", error);
      return [];
    }
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    try {
      const parts = isoDate.split("-");
      if (!parts || parts.length !== 3) return "";
      const [year, month, day] = parts;
      if (!year || !month || !day) return "";
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return "";
    }
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for comparison
  const formatDateForComparison = (date) => {
    if (!date) return "";
    try {
      const parts = date.split("-");
      if (!parts || parts.length !== 3) return "";
      const [day, month, year] = parts;
      if (!day || !month || !year) return "";
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date for comparison:", error);
      return "";
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    try {
      if (typeof dispatch === 'function') {
        dispatch(getPendingRequests());
        if (Array.isArray(getAllComponentType) && getAllComponentType.length === 0) {
            dispatch(getAllComponentTypes());
        }
      }
    } catch (error) {
      console.error("Error dispatching initial actions:", error);
    }
  }, [dispatch]);

  // Process pending requests when they change
  useEffect(() => {
    try {
      const formattedRequests = formatPendingRequests();
      setFilteredRequests(Array.isArray(formattedRequests) ? formattedRequests : []);
    } catch (error) {
      console.error("Error processing pending requests:", error);
      setFilteredRequests([]);
    }
  }, [pendingRequests]);

  // Update display dates when the actual dates change
  useEffect(() => {
    try {
      setDisplayStartDate(formatDateForDisplay(startDate) ?? "");
      setDisplayEndDate(formatDateForDisplay(endDate) ?? "");
    } catch (error) {
      console.error("Error updating display dates:", error);
      setDisplayStartDate("");
      setDisplayEndDate("");
    }
  }, [startDate, endDate]);

  // Filter requests based on start date and end date
  useEffect(() => {
    try {
      const formattedRequests = formatPendingRequests();
      
      const filtered = Array.isArray(formattedRequests) ? formattedRequests.filter((request) => {
        if (!request) return false;
        if (!startDate && !endDate) return true;
        
        try {
          const requestDate = formatDateForComparison(request?.requestedOn);
          if (!requestDate) return true; // Include if we can't determine the date
          
          const start = startDate ? startDate : "0000-00-00";
          const end = endDate ? endDate : "9999-12-31";
          return requestDate >= start && requestDate <= end;
        } catch (error) {
          console.error("Error filtering request date:", error);
          return true; // Include in case of error
        }
      }) : [];
      
      setFilteredRequests(filtered ?? []);

      // Update selectAll state based on filtered requests
      const filteredIds = Array.isArray(filtered) ? 
        filtered
          .filter(request => request && request.id)
          .map(request => request.id) : 
        [];
      
      const allSelected = filteredIds.length > 0 && 
        Array.isArray(checkedRequestIds) &&
        filteredIds.every(id => checkedRequestIds.includes(id));
      
      setSelectAll(allSelected);
    } catch (error) {
      console.error("Error filtering requests:", error);
      setFilteredRequests([]);
      setSelectAll(false);
    }
  }, [startDate, endDate, checkedRequestIds, pendingRequests]);

  // Handle date changes and update both actual and display dates
  const handleStartDateChange = (e) => {
    try {
      if (e && e.target) {
        setStartDate(e.target.value ?? "");
      }
    } catch (error) {
      console.error("Error handling start date change:", error);
      setStartDate("");
    }
  };

  const handleEndDateChange = (e) => {
    try {
      if (e && e.target) {
        setEndDate(e.target.value ?? "");
      }
    } catch (error) {
      console.error("Error handling end date change:", error);
      setEndDate("");
    }
  };

  const handleCheck = (request) => {
    try {
      if (!request || !request.id) return;
      
      setCheckedRequestIds(prevCheckedIds => {
        const safeCheckedIds = Array.isArray(prevCheckedIds) ? prevCheckedIds : [];
        
        const requestId = request.id;
        
        // Check if this request ID is already in the checked list
        const isAlreadyChecked = safeCheckedIds.includes(requestId);
        
        // If it's already checked, remove it; otherwise, add it
        const newCheckedIds = isAlreadyChecked
          ? safeCheckedIds.filter(id => id !== requestId)
          : [...safeCheckedIds, requestId];
        
        // Update selectAll state
        const safeFilteredRequests = Array.isArray(filteredRequests) ? filteredRequests : [];
        const validFilteredRequests = safeFilteredRequests.filter(req => req && req.id);
        
        const allSelected = validFilteredRequests.length > 0 && 
          validFilteredRequests.every(req => newCheckedIds.includes(req.id));
        
        setSelectAll(allSelected);
        
        return newCheckedIds;
      });
    } catch (error) {
      console.error("Error handling checkbox click:", error);
    }
  };

  const handleSelectAllClick = () => {
    try {
      if (selectAll) {
        // Uncheck all
        setCheckedRequestIds([]);
      } else {
        // Check all filtered requests
        const safeFilteredRequests = Array.isArray(filteredRequests) ? filteredRequests : [];
        const allIds = safeFilteredRequests
          .filter(request => request && request.id)
          .map(request => request.id);
        
        setCheckedRequestIds(allIds ?? []);
      }
      setSelectAll(!selectAll);
    } catch (error) {
      console.error("Error handling select all click:", error);
      setCheckedRequestIds([]);
      setSelectAll(false);
    }
  };

  const handleRequestApprove = () => {
    try {
      // Get the full request objects for the checked IDs
      const safeCheckedIds = Array.isArray(checkedRequestIds) ? checkedRequestIds : [];
      
      //transform the array to send the request to the backend
      const requestsIdsApproval = {
          requestIds: safeCheckedIds,
          action: RequestStatus.APPROVED,
          actionedBy: user && user.employeeUuid,
      }

      dispatch(approveOrRejectRequest(requestsIdsApproval));
      setCheckedRequestIds([]);
    } catch (error) {
      console.error("Error handling request approval:", error);
    }
  };
  
  const handleRequestReject = () => {
    try {
      // Get the full request objects for the checked IDs
      const safeCheckedIds = Array.isArray(checkedRequestIds) ? checkedRequestIds : [];
      
      //transform the array to send the request to the backend 
      const requestsIdsApproval = {
        requestIds: safeCheckedIds,
        action: RequestStatus.REJECTED,
        actionedBy: user && user.employeeUuid,
      };
      
      dispatch(approveOrRejectRequest(requestsIdsApproval));
      setCheckedRequestIds([]);
    } catch (error) {
      console.error("Error handling request rejection:", error);
    }
  };

  // Helper function to check if a request is selected
  const isRequestChecked = (requestId) => {
    try {
      if (!requestId) return false;
      const safeCheckedIds = Array.isArray(checkedRequestIds) ? checkedRequestIds : [];
      return safeCheckedIds.includes(requestId);
    } catch (error) {
      console.error("Error checking if request is checked:", error);
      return false;
    }
  };

  // Safely get table headers
  const safeTableHeaders = Array.isArray(RequestsTableHeader) ? RequestsTableHeader : [];

  // Render data entries with proper field labels and mapped values
  const renderDataEntries = (data, sectionKey, requestId, prefix) => {
    try {
      if (!data || typeof data !== 'object') return <div>No data available</div>;
      
      const entries = Object.entries(data);
      if (!Array.isArray(entries) || entries.length === 0) {
        return <div>No data available</div>;
      }
      
      return entries.map(([key, value], entryIndex) => {
        // Get the user-friendly label for this field
        const fieldLabel = getFieldLabel(key, sectionKey);
        
        // Get the display value using our helper function
        const displayValue = getDisplayValue(key, value, componentTypes);
        
        return (
          <div key={`${requestId}-${prefix}-${key}` || `${prefix}-data-${entryIndex}`}>
            <p><span className="table-cell-title">{fieldLabel || key || ""}</span>: {
              displayValue !== null && displayValue !== undefined && displayValue !== ""
                ? displayValue 
                : (prefix === 'old' ? "N/A" : "N/A")
            }
            </p>
          </div>
        );
      });
    } catch (error) {
      console.error(`Error rendering ${prefix} data entries:`, error);
      return <div>Error displaying data</div>;
    }
  };

  return (
    <div className="employee_details_requests_main_container">
      <div className="employee_details_requests_header">
        {/* Date filter */}
        <div className="date-filter">
          <div className="date-input">
            <label>From</label>
            <div className="custom-date-input">
              <input
                type="text"
                value={displayStartDate ?? ""}
                placeholder="DD/MM/YYYY"
                readOnly
              />
              <input
                type="date"
                onChange={handleStartDateChange}
                value={startDate ?? ""}
                max={endDate || undefined}
                style={{
                  opacity: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
          <div className="date-input">
            <label>To</label>
            <div className="custom-date-input">
              <input
                type="text"
                value={displayEndDate ?? ""}
                placeholder="DD/MM/YYYY"
                readOnly
              />
              <input
                type="date"
                onChange={handleEndDateChange}
                value={endDate ?? ""}
                min={startDate || undefined}
                style={{
                  opacity: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
        </div>

        {/* action buttons */}
        <div className="requests_action_buttons">
          <button 
            className={`requests_approve_button ${!Array.isArray(checkedRequestIds) || checkedRequestIds.length === 0 || pendingRequests.length <= 0 ? "disabled" : ""}`} 
            onClick={() => {
              if (Array.isArray(checkedRequestIds) && checkedRequestIds.length > 0 && pendingRequests.length > 0) {
                handleRequestApprove();
              }
            }}
          >
            <span className={`${!Array.isArray(checkedRequestIds) || checkedRequestIds.length === 0 ? "disabled" : ""}`}>Approve</span>
          </button>
          <button 
            className={`requests_reject_button ${!Array.isArray(checkedRequestIds) || checkedRequestIds.length === 0 ? "disabled" : ""}`}
            onClick={() => {
              if (Array.isArray(checkedRequestIds) && checkedRequestIds.length > 0) {
                handleRequestReject();
              }
            }}
          >
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* table */}
      {loading ? (
        <div className="loading_message">
          <LoadingSpinner message="Loading Employee Requests..." height="40vh" />
        </div>
      ) : !Array.isArray(filteredRequests) || filteredRequests.length === 0 ? (
        <div className="no_requests_message">
          {startDate || endDate
            ? "No pending requests between the selected dates."
            : "No pending requests available."}
        </div>
      ) : (
        <div className="employee_requests_table_container">
          <table className="employee_requests_table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll ?? false}
                    onChange={handleSelectAllClick}
                  />
                </th>
                {safeTableHeaders.map((header, index) => (
                  <th key={(header?.name ?? index) || `header-${index}`}>{header?.label ?? ""}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filteredRequests || []).map((request, index) => {
                if (!request) return null;
                const requestId = request.id ?? `request-${index}`;
                const sectionKey = request.sectionKey ?? "";
                const oldData = request.oldData ?? {};
                const newData = request.newData ?? {};
                
                return (
                  <tr key={requestId || `row-${index}`}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isRequestChecked(requestId) ?? false}
                        onChange={() => handleCheck(request)}
                      />
                    </td>
                    <td>{request.person ?? "N/A"}</td>
                    <td>{request.requestedBy ?? "N/A"}</td>
                    <td>{request.requestedOn ?? "N/A"}</td>
                    <td>{request.type ?? "N/A"}</td>
                    <td>
                      {renderDataEntries(oldData, sectionKey, requestId, 'old')}
                      {Object.keys(oldData || {}).length === 0 && <div>No previous data</div>}
                    </td>
                    <td>
                      {renderDataEntries(newData, sectionKey, requestId, 'new')}
                      {Object.keys(newData || {}).length === 0 && <div>No new data</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailsRequests;