import Close_icon from "../../assets/icons/close_icon.svg";
import '../styles/EmployeeRepositoryPopup.scss';
const EmployeeRepositoryPopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>
          <img src={Close_icon} alt="close_icon" />
        </button>
        <div className="modal-content">
          <p>You have unsaved changes.</p>
          <p>Are you sure you want discard?</p>
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onConfirm}>
            Yes, Continue
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default EmployeeRepositoryPopup;