import "../styles/DeleteRolePopup.scss";
import Cross_icon from "../../assets/icons/cross_icon.svg";

const DeleteRolePopup = ({ isOpen, onClose, onConfirm, roleName, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="delete_role_popup_overlay">
      <div className="delete_role_popup_container">
        <button className="delete_role_popup_close_button" onClick={onClose} disabled={loading}>
          <img src={Cross_icon} alt="close_icon" />
        </button>
        <div className="delete_role_popup_content">
          <h2 className="delete_role_popup_heading">Delete {roleName} role?</h2>
          <p className="delete_role_popup_message">
            Users will lose access to all modules provided by this role.
          </p>
        </div>
        <div className="delete_role_popup_actions">
          <button 
            className="delete_role_confirm_button" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Continue"}
          </button>
          <button 
            className="delete_role_cancel_button" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRolePopup;

