import "../styles/CreateRolePopup.scss";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import { useSelector } from "react-redux";
import { useState, useMemo, useEffect } from "react";
import { createHrmsRole, getHrmsRoleById, updateHrmsRole } from "../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const CreateRolePopup = ({ onClose, roleId = null }) => {
  const { hrmsAccessPermissions, hrmsAccessRole, loading, myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const dispatch = useDispatch();
  const isEditMode = !!roleId;

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canCreate = hasPermission("HrmsRoleManagement_create");
  const canUpdate = hasPermission("HrmsRoleManagement_update");

  // Get all permission IDs for select all functionality
  const allPermissionIds = useMemo(() => {
    if (!hrmsAccessPermissions || typeof hrmsAccessPermissions !== 'object') return [];
    const ids = [];
    Object.values(hrmsAccessPermissions).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(permission => {
          if (permission.permissionId) {
            ids.push(permission.permissionId);
          }
        });
      }
    });
    return ids;
  }, [hrmsAccessPermissions]);

  // Check if all permissions are selected
  const isAllSelected = useMemo(() => {
    return allPermissionIds.length > 0 && allPermissionIds.every(id => selectedPermissions.has(id));
  }, [allPermissionIds, selectedPermissions]);

  // Check if all permissions in a category are selected
  const isCategoryAllSelected = (categoryPermissions) => {
    if (!Array.isArray(categoryPermissions) || categoryPermissions.length === 0) return false;
    return categoryPermissions.every(permission => selectedPermissions.has(permission.permissionId));
  };

  // Handle select all permissions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPermissions(new Set(allPermissionIds));
    } else {
      setSelectedPermissions(new Set());
    }
  };

  // Handle select all for a category
  const handleCategorySelectAll = (categoryPermissions, checked) => {
    const newSelected = new Set(selectedPermissions);
    if (checked) {
      categoryPermissions.forEach(permission => {
        if (permission.permissionId) {
          newSelected.add(permission.permissionId);
        }
      });
    } else {
      categoryPermissions.forEach(permission => {
        if (permission.permissionId) {
          newSelected.delete(permission.permissionId);
        }
      });
    }
    setSelectedPermissions(newSelected);
  };

  // Handle individual permission toggle
  const handlePermissionToggle = (permissionId) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // Handle form submission
  const handleCreateRole = () => {
    // Check permissions before submitting
    if (isEditMode && !canUpdate) {
      alert("You don't have permission to update roles");
      return;
    }
    if (!isEditMode && !canCreate) {
      alert("You don't have permission to create roles");
      return;
    }

    const roleData = {
      roleName,
      description,
      permissionIds: Array.from(selectedPermissions)
    };
    
    if (isEditMode) {
      dispatch(updateHrmsRole(roleId, roleData));
    } else {
      dispatch(createHrmsRole(roleData));
    }
    onClose();
  };

  // Fetch role data when in edit mode
  useEffect(() => {
    if (isEditMode && roleId) {
      dispatch(getHrmsRoleById(roleId));
    }
  }, [isEditMode, roleId, dispatch]);

  // Populate form when role data is loaded
  useEffect(() => {
    if (isEditMode && hrmsAccessRole && hrmsAccessRole.roleId === roleId) {
      setRoleName(hrmsAccessRole.roleName || "");
      setDescription(hrmsAccessRole.description || "");
      const permissionIds = (hrmsAccessRole.permissions || []).map(p => p.permissionId);
      setSelectedPermissions(new Set(permissionIds));
    } else if (!isEditMode) {
      // Reset form when not in edit mode
      setRoleName("");
      setDescription("");
      setSelectedPermissions(new Set());
    }
  }, [isEditMode, hrmsAccessRole, roleId]);

  // Get category names sorted
  const categoryNames = useMemo(() => {
    if (!hrmsAccessPermissions || typeof hrmsAccessPermissions !== 'object') return [];
    return Object.keys(hrmsAccessPermissions).sort();
  }, [hrmsAccessPermissions]);

  // Check if we're loading role data (edit mode) vs saving
  // When in edit mode and no role data yet, we're loading
  // When we have role data and loading, we're saving (create/update)
  const isLoadingRoleData = loading && isEditMode && !hrmsAccessRole;
  const isSaving = loading && !isLoadingRoleData;

  return (
    <div className="create_role_popup_overlay">
        <div className="create_role_popup_container">
            {isLoadingRoleData ? (
                <div style={{ padding: "2rem", minHeight: "300px" }}>
                    <LoadingSpinner message="Loading role data..." height="200px" />
                </div>
            ) : (
            <div className="create_role_popup_content" style={{ position: 'relative' }}>
                {isSaving && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '16px'
                    }}>
                        <LoadingSpinner message="Saving role..." height="150px" />
                    </div>
                )}
                <div className="create_role_popup_content_header">
                    <p>{isEditMode ? "Edit Role" : "Create New Role"}</p>
                    <button className="create_role_popup_close_button" onClick={onClose} disabled={isSaving}>
                        <img src={Cross_icon} alt="close_icon" />
                    </button>
                </div>
                <div className="create_role_popup_content_body">
                    <div className="form_field">
                        <label htmlFor="role_name">Role Name*</label>
                        <input 
                            type="text" 
                            id="role_name" 
                            placeholder="Enter role name"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="form_field">
                        <label htmlFor="role_description">Description</label>
                        <input 
                            type="text"
                            id="role_description" 
                            placeholder="Description goes here."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="form_field">
                        <div className="role_permissions_header">
                            <label>Role Permissions*</label>
                            {hrmsAccessPermissions && Object.keys(hrmsAccessPermissions).length > 0 && (
                                <div className="select_all_checkbox">
                                    <input 
                                        type="checkbox" 
                                        id="select_all_permissions"
                                        checked={isAllSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={isSaving}
                                    />
                                    <label htmlFor="select_all_permissions">Select All Permissions</label>
                                </div>
                            )}
                        </div>
                        <div className="role_permissions_container">
                            {categoryNames.map((categoryName) => {
                                const categoryPermissions = hrmsAccessPermissions[categoryName];
                                if (!Array.isArray(categoryPermissions) || categoryPermissions.length === 0) {
                                    return null;
                                }
                                const categoryAllSelected = isCategoryAllSelected(categoryPermissions);
                                
                                return (
                                    <div key={categoryName} className="permission_category_container">
                                        <div className="permission_category_header">
                                            <h4>{categoryName}</h4>
                                            <div className="select_all_checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    id={`select_all_${categoryName}`}
                                                    checked={categoryAllSelected}
                                                    onChange={(e) => handleCategorySelectAll(categoryPermissions, e.target.checked)}
                                                    disabled={isSaving}
                                                />
                                                <label htmlFor={`select_all_${categoryName}`}>Select All</label>
                                            </div>
                                        </div>
                                        <div className="permission_category_items">
                                            {categoryPermissions.map((permission) => {
                                                const isChecked = selectedPermissions.has(permission.permissionId);
                                                return (
                                                    <div 
                                                        key={permission.permissionId} 
                                                        className={`role_permission_item ${isChecked ? 'checked' : ''}`}
                                                        onClick={() => !isSaving && handlePermissionToggle(permission.permissionId)}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            id={`permission_${permission.permissionId}`}
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handlePermissionToggle(permission.permissionId);
                                                            }}
                                                            disabled={isSaving}
                                                        />
                                                        <label htmlFor={`permission_${permission.permissionId}`}>
                                                            {permission.displayName}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="create_role_popup_actions">
                    <button className="cancel_button" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </button>
                    <button 
                        className="create_role_button" 
                        onClick={handleCreateRole}
                        disabled={!roleName.trim() || selectedPermissions.size === 0 || isSaving}
                    >
                        {isSaving ? "Processing..." : (isEditMode ? "Update role" : "Create role")}
                    </button>
                </div>
            </div>
            )}
        </div>
    </div>
  )
}

export default CreateRolePopup