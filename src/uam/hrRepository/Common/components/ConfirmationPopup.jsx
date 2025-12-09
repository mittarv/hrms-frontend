import Close_icon from "../../../../assets/icons/close_icon.svg";
import '../styles/ConfirmationPopup.scss';
const ConfirmationPopup = ({ 
  isOpen = false, 
  onClose, 
  onConfirm, 
  heading, 
  message, 
  type = 'confirm', // 'confirm' or 'alert'
  confirmText = 'Yes, Continue',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;
  
  const isAlert = type === 'alert';
  
  return (
    <div className="modal_overlay_confirmation_popup">
      <div className="modal_container_confirmation_popup">
        <button className="close_button_confirmation_popup" onClick={onClose}>
          <img src={Close_icon} alt="close_icon" />
        </button>
        <div className="modal_content_confirmation_popup">
          <p className="heading_confirmation_popup">{heading}</p>
          <p className="message_confirmation_popup">{message}</p>
        </div>
        <div className="modal_actions_confirmation_popup">
          {isAlert ? (
            <button className="btn_primary_confirmation_popup" onClick={onClose}>
              Okay
            </button>
          ) : (
            <>
              <button className="btn_primary_confirmation_popup" onClick={onConfirm}>
                {confirmText}
              </button>
              <button className="btn_secondary_confirmation_popup" onClick={onClose}>
                {cancelText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ConfirmationPopup;