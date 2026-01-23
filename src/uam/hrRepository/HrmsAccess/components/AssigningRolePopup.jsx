import "../styles/AssigningRolePopup.scss";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllRoles } from "../../../../actions/hrRepositoryAction";
import ViewRolePermissionsPopup from "./ViewRolePermissionsPopup";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import Right_arrow_icon from "../../assets/icons/right_arrow.svg";
import Plus_icon from "../../assets/icons/Plus_icon.svg";
import CreateRolePopup from "./CreateRolePopup";
import Left_arrow from "../../assets/icons/left_arrow.svg";

const AssigningRolePopup = ({ isOpen, onClose, employee, onSuccess }) => {
  const dispatch = useDispatch();
  const { hrmsAccessRoles, loading, employeeRoles, myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [viewPermissionsRole, setViewPermissionsRole] = useState(null);
  const [currentView, setCurrentView] = useState('roleSelection'); // 'roleSelection', 'assignConfirmation', 'changeConfirmation'
  const [createRolePopupOpen, setCreateRolePopupOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canAssignRole = hasPermission("HrmsUserManagement_write");

  // Get current employee role - check multiple sources
  const currentRole = useMemo(() => {
    // First, check if employeeRoles from reducer matches current employee (most reliable)
    // employeeRoles can be a single object or an array
    if (employeeRoles && employee?.employeeUuid) {
      let employeeRoleData = null;
      
      if (Array.isArray(employeeRoles)) {
        employeeRoleData = employeeRoles.find(emp => emp.empUuid === employee.employeeUuid);
      } else if (employeeRoles.empUuid === employee.employeeUuid) {
        employeeRoleData = employeeRoles;
      }
      
      if (employeeRoleData) {
        // Check role property
        if (employeeRoleData.role?.roleId) {
          return hrmsAccessRoles.find(role => role.roleId === employeeRoleData.role.roleId);
        }
        // Check roles array
        if (employeeRoleData.roles && employeeRoleData.roles.length > 0) {
          const firstRole = employeeRoleData.roles[0];
          return hrmsAccessRoles.find(role => role.roleId === firstRole.roleId);
        }
      }
    }
    
    // Check if employee prop has a role property
    if (employee?.role?.roleId) {
      return hrmsAccessRoles.find(role => role.roleId === employee.role.roleId);
    }
    
    // Check if employee has roles array
    if (employee?.roles && employee.roles.length > 0) {
      const firstRole = employee.roles[0];
      return hrmsAccessRoles.find(role => role.roleId === firstRole.roleId);
    }
    
    // Fallback to employeeRole string (for backward compatibility)
    if (employee?.employeeRole) {
      return hrmsAccessRoles.find(role => role.roleName === employee.employeeRole);
    }
    
    return null;
  }, [employee, hrmsAccessRoles, employeeRoles]);

  // Fetch roles when popup opens
  useEffect(() => {
    if (isOpen && hrmsAccessRoles.length === 0) {
      dispatch(getAllRoles());
    }
  }, [isOpen, hrmsAccessRoles.length, dispatch]);

  // Set initial selected role to current role if exists
  useEffect(() => {
    if (isOpen) {
      if (currentRole) {
        setSelectedRoleId(currentRole.roleId);
      } else {
        // Try to get roleId from multiple sources
        let roleId = null;
        
        // Check employeeRoles from reducer
        if (employeeRoles && employee?.employeeUuid) {
          let employeeRoleData = null;
          
          if (Array.isArray(employeeRoles)) {
            employeeRoleData = employeeRoles.find(emp => emp.empUuid === employee.employeeUuid);
          } else if (employeeRoles.empUuid === employee.employeeUuid) {
            employeeRoleData = employeeRoles;
          }
          
          if (employeeRoleData) {
            roleId = employeeRoleData.role?.roleId || employeeRoleData.roles?.[0]?.roleId;
          }
        }
        
        // Fallback to employee prop
        if (!roleId) {
          roleId = employee?.role?.roleId || employee?.roles?.[0]?.roleId;
        }
        
        setSelectedRoleId(roleId || null);
      }
    }
  }, [isOpen, currentRole, employee, employeeRoles]);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRoleId(null);
      setViewPermissionsRole(null);
      setCurrentView('roleSelection');
      setSlideDirection('right');
    }
  }, [isOpen]);

  const selectedRole = useMemo(() => {
    if (!selectedRoleId) return null;
    return hrmsAccessRoles.find(r => r.roleId === selectedRoleId) || null;
  }, [selectedRoleId, hrmsAccessRoles]);

  const hasAllPermissions = useMemo(() => {
    // Use allPermission field from backend if available, otherwise check for "All Permissions" permission
    return selectedRole?.allPermission || selectedRole?.permissions?.some(
      (perm) => perm.name === "All Permissions" || perm.displayName === "All Permissions"
    ) || false;
  }, [selectedRole]);

  const permissionText = useMemo(() => {
    if (hasAllPermissions) return "All Permissions";
    return `${selectedRole?.permissions?.length || 0} Permissions`;
  }, [hasAllPermissions, selectedRole]);

  if (!isOpen) return null;

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
  };

  const handleViewPermissions = (role) => {
    setViewPermissionsRole(role);
  };

  const handleAssignRole = () => {
    if (!canAssignRole) {
      alert("You don't have permission to assign roles");
      return;
    }
    
    if (!selectedRoleId) return;
    
    if (!selectedRole) return;

    // Slide to confirmation view
    setSlideDirection('left');
    setTimeout(() => {
      // Check if user already has a role
      if (currentRole) {
        setCurrentView('changeConfirmation');
      } else {
        setCurrentView('assignConfirmation');
      }
      setSlideDirection('right');
    }, 300);
  };

  const handleGoBack = () => {
    setSlideDirection('left');
    setTimeout(() => {
      setCurrentView('roleSelection');
      setSlideDirection('right');
    }, 300);
  };

  const handleConfirm = () => {
    onSuccess(selectedRoleId);
    onClose();
  };

  const handleClosePermissions = () => {
    setViewPermissionsRole(null);
  };

  const handleCreateRolePopupOpen = () => {
    setCreateRolePopupOpen(true);
  };

  const renderRoleSelectionView = () => (
    <div className={`popup_view ${slideDirection}`}>
      <div className="assigning_role_popup_content">
        <div className="assigning_role_popup_header">
          <p className="assigning_role_popup_heading">Roles</p>
          <button className="assigning_role_popup_close_button" onClick={onClose}>
            <img src={Cross_icon} alt="close_icon" />
          </button>
        </div>

      {loading && hrmsAccessRoles.length === 0 ? (
        <div style={{ padding: "2rem", minHeight: "300px" }}>
          <LoadingSpinner message="Loading roles..." height="200px" />
        </div>
      ) : (
        <>
        <p className="assigning_role_popup_user_info_title">User Information</p>
          <div className="assigning_role_popup_user_info">
            <div className="user_info_field user_info_name_field">
              <span className="user_info_value">
                {employee?.employeeFirstName || employee?.empFirstName} {employee?.employeeLastName || employee?.empLastName}
              </span>
            </div>
            <div className="user_info_field user_info_email_field">
              <span className="user_info_value">{employee?.employeeOfficialEmail || employee?.empOfficialEmail}</span>
            </div>
          </div>

          <div className="assigning_role_popup_roles_section">
            <h3 className="roles_section_title">
              Roles Available ({hrmsAccessRoles.length})
            </h3>
            { hrmsAccessRoles.length <= 0 ? 
            (<div className="no_roles_created_container">
              <p>No roles created yet.</p>
              <p>Create a new role to assign permissions to employees.</p>
              <button className="create_role_btn" onClick={handleCreateRolePopupOpen}>
                <img src={Plus_icon} alt="Plus_icon" />
                <p className="create_role_btn_text">Create Role</p>
              </button>
            </div>):
            (<div className="assigning_role_popup_roles">
              {hrmsAccessRoles.map((role) => {
                const isSelected = selectedRoleId === role.roleId;
                // Use allPermission field from backend if available, otherwise check for "All Permissions" permission
                const roleHasAllPermissions = role.allPermission || role.permissions?.some(
                  (perm) => perm.name === "All Permissions" || perm.displayName === "All Permissions"
                );
                const rolePermissionText = roleHasAllPermissions 
                  ? "All Permissions" 
                  : `${role.permissions?.length || 0} Permissions`;

                return (
                  <div 
                    key={role.roleId} 
                    className={`assigning_role_popup_role_item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="role_item_left" onClick={() => handleRoleSelect(role.roleId)}>
                      <input
                        type="radio"
                        id={`role_${role.roleId}`}
                        name="role_selection"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRoleSelect(role.roleId);
                        }}
                        className="role_radio_button"
                      />
                      <div className="role_item_content ">
                        <label 
                          htmlFor={`role_${role.roleId}`}
                          className={`role_item_name ${isSelected ? 'selected' : ''}`}
                        >
                          {role.roleName}
                        </label>
                        {role.description && (
                          <p 
                            className={`role_item_description ${isSelected ? 'selected' : ''}`}
                            title={role.description}
                          >
                            {role.description}
                            <span className="description_tooltip">{role.description}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="view_permissions_button"
                      onClick={() => handleViewPermissions(role)}
                    >
                      {rolePermissionText} <img src={Right_arrow_icon} alt=">" />
                    </button>
                  </div>
                );
              })}
            </div>)}
          </div>

          <div className="assigning_role_popup_actions">
            <button 
              className="cancel_button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="assign_role_button" 
              onClick={handleAssignRole}
              disabled={!selectedRoleId || loading || (currentRole && selectedRoleId === currentRole.roleId) || !canAssignRole}
            >
              {loading ? "Processing..." : currentRole ? "Update changes" : "Assign Role"}
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  );

  const renderAssignConfirmationView = () => (
    <div className={`popup_view ${slideDirection}`}>
      <div className="assigning_role_popup_content">
        <div className="assigning_role_popup_header">
          <button className="back_button" onClick={handleGoBack}>
            <img src={Left_arrow} alt="back" />
          </button>
          <button className="assigning_role_popup_close_button" onClick={onClose}>
            <img src={Cross_icon} alt="close_icon" />
          </button>
        </div>
        <div className="confirmation_content">
          <p className="confirmation_heading">
            Assign {selectedRole?.roleName || "role"} role to {employee?.employeeFirstName || employee?.empFirstName} {employee?.employeeLastName || employee?.empLastName}?
          </p>
          <p className="confirmation_description">
            {hasAllPermissions 
              ? "This role has **full access** to all modules of HRMS"
              : `This role has access to ${selectedRole?.permissions?.length || 0} permissions.`
            }
          </p>
          <div className="role_display_field">
            <span className="role_name">{selectedRole?.roleName}</span>
            <button 
              className="view_permissions_link"
              onClick={() => handleViewPermissions(selectedRole)}
            >
              {permissionText} <img src={Right_arrow_icon} alt=">" />
            </button>
          </div>
        </div>
        <div className="assigning_role_confirmation_actions">
          <button 
            className="continue_button" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Yes, Continue"}
          </button>
          <button 
            className="go_back_button" 
            onClick={handleGoBack}
            disabled={loading}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const renderChangeConfirmationView = () => (
    <div className={`popup_view ${slideDirection}`}>
      <div className="assigning_role_popup_content">
        <div className="assigning_role_popup_header">
          <button className="back_button" onClick={handleGoBack}>
            <img src={Left_arrow} alt="back" />
          </button>
          <button className="assigning_role_popup_close_button" onClick={onClose}>
            <img src={Cross_icon} alt="close_icon" />
          </button>
        </div>
        <div className="confirmation_content">
          <p className="confirmation_heading">Update assigned role?</p>
          <p className="confirmation_description">
            This will change <strong>{employee?.employeeFirstName || employee?.empFirstName}{employee?.employeeLastName || employee?.empLastName}&apos;s </strong>role from <strong>{currentRole?.roleName || "No Role"}</strong> to <strong>{selectedRole?.roleName || "Unknown Role"}</strong>.
          </p>
          <div className="role_display_field">
            <span className="role_name">{selectedRole?.roleName || "Unknown Role"}</span>
            <button 
              className="view_permissions_link"
              onClick={() => handleViewPermissions(selectedRole)}
            >
              {permissionText} <img src={Right_arrow_icon} alt=">" />
            </button>
          </div>
        </div>
        <div className="assigning_role_confirmation_actions">
          <button 
            className="continue_button" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Yes, Continue"}
          </button>
          <button 
            className="go_back_button" 
            onClick={handleGoBack}
            disabled={loading}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="assigning_role_popup_overlay" onClick={onClose}>
        <div className="assigning_role_popup_container" onClick={(e) => e.stopPropagation()}>
          <div className="assigning_role_popup_content_wrapper">
            {currentView === 'roleSelection' && renderRoleSelectionView()}
            {currentView === 'assignConfirmation' && renderAssignConfirmationView()}
            {currentView === 'changeConfirmation' && renderChangeConfirmationView()}
          </div>
        </div>
      </div>

      {viewPermissionsRole && (
        <ViewRolePermissionsPopup
          onClose={handleClosePermissions}
          role={viewPermissionsRole}
        />
      )}
      {createRolePopupOpen && (
        <CreateRolePopup
          onClose={() => setCreateRolePopupOpen(false)}
        />
      )}
    </>
  );
};

export default AssigningRolePopup;
