import { useEffect, useState, useMemo, useRef } from "react";
import { getAllEmployee, getAllRoles, assignEmployeeRole, revokeEmployeeAccess, getEmployeeRoles } from "../../../../actions/hrRepositoryAction";
import { useDispatch, useSelector } from "react-redux";
import { ClickAwayListener } from "@mui/material";
import filter_grey_icon from "../../assets/icons/filter_grey_icon.svg";
import Suspend_icon from "../../assets/icons/suspend_icon.svg";
import EditIcon from "../../assets/icons/edit_button_blue.svg";
import "../styles/UserManagement.scss";
import { formatDate } from "../../Common/utils/helper";
import Search_icon_grey from "../../assets/icons/Search_icon_grey.svg";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import Hot_air_balloon from "../../assets/icons/hot_air_balloon.svg";
import AssigningRolePopup from "./AssigningRolePopup";
import RevokeAccessPopup from "./RevokeAccessPopup";
import Sort from "../../Common/components/Sort";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { allEmployees, loading, employeeRoles, hrmsAccessRoles, myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSort, setCurrentSort] = useState("name_asc");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState(new Set());
  const [assignRolePopupOpen, setAssignRolePopupOpen] = useState(false);
  const [revokeAccessPopupOpen, setRevokeAccessPopupOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const hasInitialized = useRef(false);

  const sortOptions = [
    { key: "none", label: "None" },
    { key: "name_asc", label: "User Name (A - Z)" },
    { key: "name_desc", label: "User Name (Z - A)" },
    { key: "email_asc", label: "Email ID (A - Z)" },
    { key: "email_desc", label: "Email ID (Z - A)" },
    { key: "date_asc", label: "Added On (Ascending)" },
    { key: "date_desc", label: "Added On (Descending)" },
  ];
  
  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canRead = hasPermission("HrmsUserManagement_read");
  const hasAccessToEditUser = hasPermission("HrmsUserManagement_write");

  // Fetch employees and roles only once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      if (Array.isArray(allEmployees) && allEmployees.length === 0) {
        dispatch(getAllEmployee());
      }
      if (Array.isArray(hrmsAccessRoles) && hrmsAccessRoles.length === 0) {
        dispatch(getAllRoles());
      }
      hasInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return allEmployees;
    }
    const query = searchQuery.toLowerCase();
    return allEmployees.filter((employee) => {
      const fullName = `${employee.employeeFirstName} ${employee.employeeLastName}`.toLowerCase();
      const email = employee.employeeOfficialEmail?.toLowerCase() || "";
      return fullName.includes(query) || email.includes(query);
    });
  }, [allEmployees, searchQuery]);

  // Filter employees by selected roles: show only users that have one of the selected roles
  const filteredByRoleEmployees = useMemo(() => {
    if (selectedRoleIds.size === 0) return filteredEmployees;
    return filteredEmployees.filter((employee) => {
      const roleId = employee?.employeeHrmsRoleDetails?.roleId;
      return roleId != null && selectedRoleIds.has(roleId);
    });
  }, [filteredEmployees, selectedRoleIds]);

  const handleSortSelect = (clickedKey) => {
    setCurrentSort(clickedKey);
    setIsSortDropdownOpen(false);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const handleClearRoleFilter = () => {
    setSelectedRoleIds(new Set());
  };

  // Apply sort to filtered employees (after role filter)
  const sortedEmployees = useMemo(() => {
    const list = [...filteredByRoleEmployees];
    if (currentSort === "none") return list;
    const getFullName = (e) => `${e.employeeFirstName || ""} ${e.employeeLastName || ""}`.trim();
    const getEmail = (e) => (e.employeeOfficialEmail || "").toLowerCase();
    if (currentSort === "name_asc") return list.sort((a, b) => getFullName(a).localeCompare(getFullName(b)));
    if (currentSort === "name_desc") return list.sort((a, b) => getFullName(b).localeCompare(getFullName(a)));
    if (currentSort === "email_asc") return list.sort((a, b) => getEmail(a).localeCompare(getEmail(b)));
    if (currentSort === "email_desc") return list.sort((a, b) => getEmail(b).localeCompare(getEmail(a)));
    if (currentSort === "date_asc") return list.sort((a, b) => new Date(a.employeeAddedOn || 0) - new Date(b.employeeAddedOn || 0));
    if (currentSort === "date_desc") return list.sort((a, b) => new Date(b.employeeAddedOn || 0) - new Date(a.employeeAddedOn || 0));
    return list;
  }, [filteredByRoleEmployees, currentSort]);

  const handleEditRole = (employee) => {
    if (!hasAccessToEditUser) {
      alert("You don't have permission to assign or revoke roles");
      return;
    }
    setSelectedEmployee(employee);
    setAssignRolePopupOpen(true);
    dispatch(getEmployeeRoles(employee?.employeeUuid));
  };

  const handleRevokeAccess = (employee) => {
    if (!hasAccessToEditUser) {
      alert("You don't have permission to assign or revoke roles");
      return;
    }
    dispatch(getEmployeeRoles(employee?.employeeUuid));
    setSelectedEmployee(employee);
    setRevokeAccessPopupOpen(true);
  };

  const handleAssignRoleSuccess = (roleId) => {
    if (selectedEmployee?.employeeUuid) {
      dispatch(assignEmployeeRole(selectedEmployee.employeeUuid, roleId));
    }
    setAssignRolePopupOpen(false);
    setSelectedEmployee(null);
  };

  const handleRevokeAccessConfirm = () => {
    if (selectedEmployee?.employeeUuid) {
      dispatch(revokeEmployeeAccess(selectedEmployee.employeeUuid));
    }
    setRevokeAccessPopupOpen(false);
    setSelectedEmployee(null);
  };

  const handleCloseAssignRolePopup = () => {
    setAssignRolePopupOpen(false);
    setSelectedEmployee(null);
  };

  const handleCloseRevokeAccessPopup = () => {
    setRevokeAccessPopupOpen(false);
    setSelectedEmployee(null);
  };

  // If user doesn't have read permission, show access denied message
  if (!canRead) {
    return (
      <div className="user_management_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don&apos;t have permission to view user management
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="user_management_container">
        <div className="user_management_header_container">
          <div className="user_management_search_container">
            <input
              type="text"
              className="user_management_search_input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <img
              src={Search_icon_grey}
              alt="Search_icon_grey"
              className="user_management_search_icon"
            />
            <ClickAwayListener onClickAway={() => setIsFilterDropdownOpen(false)}>
              <div className="user_management_filter_wrapper">
                <button
                  type="button"
                  className={`user_management_filter_button ${selectedRoleIds.size > 0 ? "active" : ""}`}
                  onClick={() => {
                    setIsFilterDropdownOpen((prev) => !prev);
                    setIsSortDropdownOpen(false);
                  }}
                  aria-label="Filter by role"
                >
                  <img src={filter_grey_icon} alt="Filter" />
                  {selectedRoleIds.size > 0 && (
                    <span className="user_management_filter_badge">{selectedRoleIds.size}</span>
                  )}
                </button>
                {isFilterDropdownOpen && (
                  <div className="user_management_filter_dropdown">
                    <div className="user_management_filter_dropdown_header">
                      <span>Filter by role</span>
                      {selectedRoleIds.size > 0 && (
                        <button type="button" className="user_management_filter_clear" onClick={handleClearRoleFilter}>
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="user_management_filter_dropdown_list">
                      {hrmsAccessRoles.map((role) => {
                        const isChecked = selectedRoleIds.has(role.roleId);
                        return (
                          <label
                            key={role.roleId}
                            className="user_management_filter_role_item"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleRoleToggle(role.roleId)}
                            />
                            <span>{role.roleName}</span>
                          </label>
                        );
                      })}
                      {hrmsAccessRoles.length === 0 && (
                        <div className="user_management_filter_empty">No roles available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ClickAwayListener>
            <Sort
              options={sortOptions}
              currentSort={currentSort}
              onSortSelect={handleSortSelect}
              isOpen={isSortDropdownOpen}
              setIsOpen={(fn) => {
                setIsSortDropdownOpen((prev) => {
                  const next = typeof fn === "function" ? fn(prev) : fn;
                  if (next) setIsFilterDropdownOpen(false);
                  return next;
                });
              }}
            />
          </div>
        </div>
        {loading && allEmployees.length === 0 ? (
          <LoadingSpinner message="Loading users..." height="50vh" />
        ) : filteredEmployees.length === 0 && allEmployees.length === 0 ? (
          <div className="no_users_container">
            <img src={Hot_air_balloon} alt="Hot_air_balloon" />
            <p>No users found.</p>
          </div>
        ) : filteredEmployees.length === 0 && searchQuery ? (
          <NoResultsContainer
            showImage={true}
            message="We couldn't find anyone matching your search."
            subMessage="Try searching with different details."
          />
        ) : sortedEmployees.length === 0 && selectedRoleIds.size > 0 ? (
          <NoResultsContainer
            showImage={true}
            message="We couldn't find anyone matching your search."
            subMessage="Try searching with different details."
          />
        ) : (
          <>
            <p>All Users ({sortedEmployees.length})</p>
            {loading ? (
              <div style={{ padding: "2rem", minHeight: "200px" }}>
                <LoadingSpinner message="Loading users..." height="150px" />
              </div>
            ) : (
              <div className="user_management_table_container">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Added On</th>
                      <th>Role</th>
                      {hasAccessToEditUser && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEmployees.map((employee) => (
                      <tr key={employee.employeeUuid}>
                        <td>{employee.employeeFirstName} {employee.employeeLastName}</td>
                        <td>{employee.employeeOfficialEmail}</td>
                        <td>{formatDate(employee.employeeAddedOn)}</td>
                        <td>{employee?.employeeHrmsRoleDetails?.roleName ? <div className="role_name_text">{employee?.employeeHrmsRoleDetails?.roleName}</div> : "-"}</td>
                        {hasAccessToEditUser && <td>
                          <div className="user_management_actions_container">
                            <button 
                              className="user_action_button edit_button"
                              onClick={() => handleEditRole(employee)}
                            >
                              <img src={EditIcon} alt="Edit" />
                              <span>Edit</span>
                            </button>
                            <button 
                              className={`user_action_button revoke_button ${employee?.employeeHrmsRoleDetails?.roleName ? "revoke_button_text" : "revoke_button_text_disabled"}`}
                              onClick={() => employee?.employeeHrmsRoleDetails?.roleName ? handleRevokeAccess(employee) : null}
                            >
                              <img src={Suspend_icon} alt="Revoke Access" />
                              <span>Revoke Access</span>
                            </button>
                          </div>
                        </td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      <AssigningRolePopup 
        isOpen={assignRolePopupOpen}
        onClose={handleCloseAssignRolePopup}
        employee={selectedEmployee}
        onSuccess={handleAssignRoleSuccess}
      />
      {revokeAccessPopupOpen && selectedEmployee && (
        <RevokeAccessPopup
          isOpen={revokeAccessPopupOpen}
          onClose={handleCloseRevokeAccessPopup}
          onConfirm={handleRevokeAccessConfirm}
          employee={selectedEmployee}
          role={employeeRoles}
          loading={loading}
        />
      )}
    </>
  );
};
export default UserManagement;
