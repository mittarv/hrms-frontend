import "../styles/ViewRolePermissionsPopup.scss";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import { useMemo } from "react";

const ViewRolePermissionsPopup = ({ onClose, role }) => {
  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    if (!role?.permissions) return {};
    
    const grouped = {};
    
    // Group permissions by their category field
    role.permissions.forEach(permission => {
      const category = permission.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    // Sort permissions within each category by displayName
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const nameA = (a.displayName || a.name || '').toLowerCase();
        const nameB = (b.displayName || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });

    return grouped;
  }, [role]);

  // Get category names sorted
  const categoryNames = useMemo(() => {
    return Object.keys(permissionsByCategory).sort();
  }, [permissionsByCategory]);

  // Check if role has "All Permissions"
  const hasAllPermissions = useMemo(() => {
    if (!role?.permissions) return false;
    return role.permissions.some(
      (perm) => perm.name === "All Permissions" || perm.displayName === "All Permissions"
    );
  }, [role]);

  return (
    <div className="view_role_permissions_popup_overlay" onClick={onClose}>
      <div className="view_role_permissions_popup_container" onClick={(e) => e.stopPropagation()}>
        <div className="view_role_permissions_popup_content">
          <div className="view_role_permissions_popup_content_header">
            <p>Role Permissions</p>
            <button className="view_role_permissions_popup_close_button" onClick={onClose}>
              <img src={Cross_icon} alt="close_icon" />
            </button>
          </div>
          <div className="view_role_permissions_popup_content_body">
            <div className="role_name_display">
              <span className="role_value">{role?.roleName || ""}</span>
            </div>
            {hasAllPermissions ? (
              <div className="all_permissions_container">
                <div className="permission_category_items">
                  <div className="role_permission_item checked">
                    <span>All Permissions</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="all_permissions_container">
                {categoryNames.map((categoryName, index) => {
                  const categoryPermissions = permissionsByCategory[categoryName];
                  if (!Array.isArray(categoryPermissions) || categoryPermissions.length === 0) {
                    return null;
                  }
                  
                  return (
                    <div key={categoryName} className="permission_category_section">
                      {index > 0 && <div className="category_separator"></div>}
                      <div className="permission_category_header">
                        <h4>{categoryName}</h4>
                      </div>
                      <div className="permission_category_items">
                        {categoryPermissions.map((permission) => (
                          <div 
                            key={permission.permissionId} 
                            className="role_permission_item checked"
                          >
                            <span>{permission.displayName || permission.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRolePermissionsPopup;
