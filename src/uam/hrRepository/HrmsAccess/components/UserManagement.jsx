import { useEffect, useState, useMemo, useRef } from "react";
import { getAllEmployee, assignEmployeeRole, revokeEmployeeAccess, getEmployeeRoles } from "../../../../actions/hrRepositoryAction";
import { useDispatch, useSelector } from "react-redux";
import Suspend_icon from "../../assets/icons/suspend_icon.svg";
import EditIcon from "../../assets/icons/edit_button_blue.svg";
import "../styles/UserManagement.scss";
import { formatDate } from "../../Common/utils/helper";
import Search_icon_grey from "../../assets/icons/Search_icon_grey.svg";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import Hot_air_balloon from "../../assets/icons/hot_air_balloon.svg";
import AssigningRolePopup from "./AssigningRolePopup";
import RevokeAccessPopup from "./RevokeAccessPopup";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { allEmployees, loading, employeeRoles, myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignRolePopupOpen, setAssignRolePopupOpen] = useState(false);
  const [revokeAccessPopupOpen, setRevokeAccessPopupOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const hasInitialized = useRef(false);
  
  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canRead = hasPermission("HrmsUserManagement_read");
  const hasAccessToEditUser = hasPermission("HrmsUserManagement_write");

  // Fetch employees only once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      // Only fetch employees if we don't have any
      if (Array.isArray(allEmployees) && allEmployees.length === 0) {
        dispatch(getAllEmployee());
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
            You don't have permission to view user management
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
          <div className="no_users_container">
            <p>No users found matching &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <>
            <p>All Users ({filteredEmployees.length})</p>
            {loading ? (
              <div style={{ padding: "2rem", minHeight: "200px" }}>
                <LoadingSpinner message="Loading users..." height="150px" />
              </div>
            ) : (
              <div className="user_management_table_container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Added On</th>
                      <th>Role</th>
                      {hasAccessToEditUser && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
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
