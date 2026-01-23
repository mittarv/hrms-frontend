import "../styles/RevokeAccessPopup.scss";
import Cross_icon from "../../assets/icons/cross_icon.svg";

const RevokeAccessPopup = ({ isOpen, onClose, onConfirm, employee, role, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="revoke_access_popup_overlay" onClick={onClose}>
      <div className="revoke_access_popup_container" onClick={(e) => e.stopPropagation()}>
        <button className="revoke_access_popup_close_button" onClick={onClose} disabled={loading}>
          <img src={Cross_icon} alt="close_icon" />
        </button>
        <div className="revoke_access_popup_content">
          <h2 className="revoke_access_popup_heading">
            Revoke {role?.role?.roleName || "unknown"} role from {employee?.employeeFirstName} {employee?.employeeLastName}?
          </h2>
          <p className="revoke_access_popup_description">
            Access to related modules will be removed.
          </p>
        </div>
        <div className="revoke_access_popup_actions">
          <button 
            className="confirm_button" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Yes, Continue"}
          </button>
          <button 
            className="cancel_button" 
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

export default RevokeAccessPopup;
