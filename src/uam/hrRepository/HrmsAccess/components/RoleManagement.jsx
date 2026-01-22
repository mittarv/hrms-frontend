import Plus_icon from "../../assets/icons/Plus_icon.svg";
import Search_icon_grey from "../../assets/icons/Search_icon_grey.svg";
import Hot_air_balloon from "../../assets/icons/hot_air_balloon.svg";
import EditIcon from "../../assets/icons/edit_button_blue.svg";
import Delete_icon from "../../assets/icons/delete_red_icon.svg";
import "../styles/RoleManagement.scss";
import { getAllRoles, getAllHrmsAccessPermissions, deleteHrmsRole } from "../../../../actions/hrRepositoryAction";
import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateRolePopup from "./CreateRolePopup";
import DeleteRolePopup from "./DeleteRolePopup";
import ViewRolePermissionsPopup from "./ViewRolePermissionsPopup";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const RoleManagement = () => {
  const { hrmsAccessRoles, hrmsAccessPermissions, loading, myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const [createRolePopupOpen, setCreateRolePopupOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [deleteRolePopupOpen, setDeleteRolePopupOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [viewPermissionsPopupOpen, setViewPermissionsPopupOpen] = useState(false);
  const [roleToView, setRoleToView] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canRead = hasPermission("HrmsRoleManagement_read");
  const canCreate = hasPermission("HrmsRoleManagement_create");
  const canUpdate = hasPermission("HrmsRoleManagement_update");
  const canDelete = hasPermission("HrmsRoleManagement_delete");
  
  // User can edit if they have create, update, or delete permission
  const hasAccessToEditRole = canCreate || canUpdate || canDelete;
  // Fetch roles and permissions only once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      // Only fetch roles if we don't have any
      if (hrmsAccessRoles.length === 0) {
        dispatch(getAllRoles());
      }
      // Only fetch permissions if we don't have any
      if (Array.isArray(hrmsAccessPermissions) && hrmsAccessPermissions.length === 0) {
        dispatch(getAllHrmsAccessPermissions());
      }
      hasInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Filter roles based on search query
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) {
      return hrmsAccessRoles;
    }
    const query = searchQuery.toLowerCase();
    return hrmsAccessRoles.filter(role => 
      role.roleName?.toLowerCase().includes(query) ||
      role.description?.toLowerCase().includes(query)
    );
  }, [hrmsAccessRoles, searchQuery]);

  const handleCreateRolePopupOpen = () => {
    setEditingRoleId(null);
    setCreateRolePopupOpen(true);
  }

  const handleEditRole = (roleId) => {
    setEditingRoleId(roleId);
    setCreateRolePopupOpen(true);
  }

  const handleClosePopup = () => {
    setCreateRolePopupOpen(false);
    setEditingRoleId(null);
  }

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setDeleteRolePopupOpen(true);
  }

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      dispatch(deleteHrmsRole(roleToDelete.roleId));
      setDeleteRolePopupOpen(false);
      setRoleToDelete(null);
    }
  }

  const handleCloseDeletePopup = () => {
    setDeleteRolePopupOpen(false);
    setRoleToDelete(null);
  }

  const handleViewPermissions = (role) => {
    setRoleToView(role);
    setViewPermissionsPopupOpen(true);
  }

  const handleCloseViewPermissionsPopup = () => {
    setViewPermissionsPopupOpen(false);
    setRoleToView(null);
  }

  // If user doesn't have read permission, show access denied message
  if (!canRead) {
    return (
      <div className="role_management_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don't have permission to view role management
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="role_management_container">
        <div className="role_management_header_container">
          <div className="role_management_search_container">
            <input
              type="text"
              className="role_management_search_input"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <img
              src={Search_icon_grey}
              alt="Search_icon_grey"
              className="role_management_search_icon"
            />
          </div>
          <div className="header_actions_container">
            {canCreate && <button className="create_role_btn" onClick={handleCreateRolePopupOpen}>
              <img src={Plus_icon} alt="Plus_icon" />
              <p>Create Role</p>
            </button>}
          </div>
        </div>
        {loading && hrmsAccessRoles.length === 0 ? (
          <LoadingSpinner message="Loading roles..." height="50vh" />
        ) : filteredRoles.length === 0 && hrmsAccessRoles.length === 0 ? (
          <div className="no_roles_container">
            <img src={Hot_air_balloon} alt="Hot_air_balloon" />
            <p>No roles created yet.</p>
            <p>Create a new role to assign permissions to employees.</p>
            <div className="create_role_btn_container">
              {canCreate && <button className="create_role_btn" onClick={handleCreateRolePopupOpen}>
                <img src={Plus_icon} alt="Plus_icon" />
                <p>Create Role</p>
              </button>}
            </div>
          </div>
        ) : filteredRoles.length === 0 && searchQuery ? (
          <div className="no_roles_container">
            <p>No roles found matching &quot;{searchQuery}&quot;</p>
          </div>
        ):(
          <>
            <p>All Roles ({filteredRoles.length})</p>
            {loading ? (
              <div style={{ padding: "2rem", minHeight: "200px" }}>
                <LoadingSpinner message="Loading roles..." height="150px" />
              </div>
            ) : (
            <div className="roles_table_container">
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Date Created</th>
                    <th>Permissions</th>
                    <th>Description</th>
                    {(canUpdate || canDelete) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => {
                    const formatDate = (dateString) => {
                      const date = new Date(dateString);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    };

                    const permissions = role.permissions || [];
                    const maxVisibleTags = 3;
                    const visiblePermissions = permissions.slice(0, maxVisibleTags);
                    const remainingCount = permissions.length - maxVisibleTags;
                    // Use allPermission field from backend if available, otherwise check for "All Permissions" permission
                    const hasAllPermissions = role.allPermission || permissions.some(
                      (perm) => perm.name === "All Permissions" || perm.displayName === "All Permissions"
                    );

                    return (
                      <tr key={role.roleId}>
                        <td>{role.roleName}</td>
                        <td>{formatDate(role.createdAt)}</td>
                        <td>
                          <div className="permissions_tags_container">
                            {hasAllPermissions ? (
                              <span 
                                className="permission_tag all_permissions_tag"
                                onClick={() => handleViewPermissions(role)}
                                style={{ cursor: 'pointer' }}
                              >
                                All Permissions
                              </span>
                            ) : (
                              <>
                                {visiblePermissions.map((permission) => (
                                  <span 
                                    key={permission.permissionId} 
                                    className="permission_tag"
                                    onClick={() => handleViewPermissions(role)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {permission.displayName}
                                  </span>
                                ))}
                                {remainingCount > 0 && (
                                  <span 
                                    className="permission_tag more_permissions_tag"
                                    onClick={() => handleViewPermissions(role)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    +{remainingCount}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          {role.description ? (
                            <p 
                              className="role_description_text"
                              title={role.description}
                            >
                              {role.description}
                              <span className="description_tooltip">{role.description}</span>
                            </p>
                          ) : (
                            "-"
                          )}
                        </td>
                        {(canUpdate || canDelete) && <td>
                          <div className="roles_actions_container">
                            {canUpdate && <button 
                              className="role_action_button edit_button"
                              onClick={() => handleEditRole(role.roleId)}
                            >
                              <img src={EditIcon} alt="Edit" />
                              <span>Edit</span>
                            </button>}
                            {canDelete && <button 
                              className="role_action_button delete_button"
                              onClick={() => handleDeleteRole(role)}
                            >
                              <img src={Delete_icon} alt="Delete" />
                              <span>Delete</span>
                            </button>}
                          </div>
                        </td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </>
        )}
      </div>
      {createRolePopupOpen && 
      <CreateRolePopup 
        onClose={handleClosePopup} 
        roleId={editingRoleId}
      />}
      {deleteRolePopupOpen && roleToDelete && 
      <DeleteRolePopup 
        isOpen={deleteRolePopupOpen}
        onClose={handleCloseDeletePopup}
        onConfirm={handleConfirmDelete}
        roleName={roleToDelete.roleName}
        loading={loading}
      />}
      {viewPermissionsPopupOpen && roleToView && 
      <ViewRolePermissionsPopup 
        onClose={handleCloseViewPermissionsPopup}
        role={roleToView}
        hrmsAccessPermissions={hrmsAccessPermissions}
      />}
    </>
  );
};

export default RoleManagement;
