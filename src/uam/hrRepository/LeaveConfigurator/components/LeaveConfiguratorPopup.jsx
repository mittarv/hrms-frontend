import { useSearchParams } from "react-router-dom";
import "../styles/AddNewLeaveTypePopUp.scss";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef, useCallback } from "react";
import "../styles/MandatoryFieldPopup.scss";
import exclamation_mark from "../../../../assets/icons/exclamation_mark.svg";
import close_icon from "../../../../assets/icons/close_icon.svg";
import success from "../../../../assets/icons/success.svg";
import "../styles/LeaveDiscardPopup.scss";

const AddNewLeaveTypePopUp = ({NewLeaveName, setNewLeaveName, setShowLeaveDropwon = () => {}}) => {
const searchParams = useSearchParams(); 
const setLeaveParams = searchParams[1];
const { allExisitingLeaves } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const [error, setErrors] = useState("")

  const validateForm = () => {

    const isDuplicateLeave = allExisitingLeaves.some((leave) =>leave.leaveType.toLowerCase() === NewLeaveName.toLowerCase());

      if (isDuplicateLeave) {
        setErrors("This leave type already exists.");
        return false;
      }

      if (!NewLeaveName) {
        setErrors("Leave name cannot be empty.");
        return false;
      }
    
      return true;
    }

 const closeLeaveTypePopUp = () => {
    setNewLeaveName("");
    setLeaveParams({});
    setShowLeaveDropwon(false);    
 }

 const handleLeaveSubmit = () => {
    if(!validateForm()){
        return;
    }
    setNewLeaveName("");
    setLeaveParams({});
    setShowLeaveDropwon(false);
    setLeaveParams({
        showLeaveConfiguratorForm: "true",
        create: "true",
        leaveType: NewLeaveName,
      });
 }

 const handleKeyPress = (e) => {
    if (e.key === "Enter") {
        handleLeaveSubmit();
    }
};

 const handleInputChange = (e) => {
    setNewLeaveName(e.target.value);
    if (error) {
      setErrors("");
    }
  };

  return (
     <div className="modal_overlay">
         <div className="modal_container">
            <p className="modal_title">Add New Leave Type</p>
            <hr className="horizontal_line"/>
            <div className="modal_content">
                <p className="leave_type_name">Leave Type Name</p>
                <input
                    type="text"
                    placeholder="Enter Leave Type Name"
                    onChange={(e) => handleInputChange(e)}
                    onKeyDown={(e) => handleKeyPress(e)}
                    value={NewLeaveName}
                />
                {error && <p className="leave_error_message">{error}</p>}
            </div>
            <div className="modal_content_action_buttons"> 
                <button className="cancel_leave_button" onClick = {closeLeaveTypePopUp}>Cancel</button>
                <button className="submit_leave_button" onClick = {handleLeaveSubmit}>Submit</button>
            </div>
         </div>
     </div>
  )
}

const MandatoryFieldPopup = ({ closePopup }) => {
  const modalRef = useRef(null);

  const handleClose = useCallback(() => {
    closePopup(false);
  }, [closePopup]);

  const handleClickAway = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  }, [modalRef, handleClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickAway);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [handleClickAway]);

  return (
    <div className="mandatory_field_modal_overlay">
      <div className="mandatory_field_modal_container" ref={modalRef}>
        <div className="close_icon" onClick={handleClose}>
          <img src={close_icon} />
        </div>
        <div className="exclamation_mark">
          <img src={exclamation_mark} />
        </div>
        <div className="mandatory_field_modal_content">
          <p className="leave_type_name">
            Please fill in all mandatory fields!
          </p>
        </div>
      </div>
    </div>
  );
};

const LeaveCreatedSuccess = ({closePopup}) => {
  const modalRef = useRef(null);

  const handleClose = useCallback(() => {
    closePopup();
  }, [closePopup]);

  const handleClickAway = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  }, [modalRef, handleClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickAway);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [handleClickAway]);

  return (
    <div className="mandatory_field_modal_overlay">
      <div className="mandatory_field_modal_container" ref={modalRef}>
        <div className="close_icon" onClick={handleClose}>
          <img src={close_icon} />
        </div>
        <div className="exclamation_mark">
          <img src={success} />
        </div>
        <div className="mandatory_field_modal_content">
          <p className="leave_type_name">Saved Successfully!</p>
        </div>
      </div>
    </div>
  );
};

const LeaveDiscardPopup = ({searchParams,setSearchParams = () => {}, setFormData = () => {}}) => {
  const onClose = () => {
    const currentParams = Object.fromEntries(searchParams.entries()); 
    delete currentParams.discard_changes;
    setSearchParams(currentParams); 
  }

  const onConfirm = () => {
    setSearchParams({});
    setFormData({});
  }
  return (
    <div className="LeaveDiscardPopup-modal-overlay">
      <div className="LeaveDiscardPopup-modal-container">
        <button className="LeaveDiscardPopup-close-button" onClick={onClose}>
          <img src={close_icon} alt="close_icon" />
        </button>
        <div className="LeaveDiscardPopup-modal-content">
          <p>You have unsaved changes.</p>
          <p>Are you sure you want discard?</p>
        </div>
        <div className="LeaveDiscardPopup-modal-actions">
          <button className="LeaveDiscardPopup-submit-button" onClick={onConfirm}>
            Yes, Continue
          </button>
          <button className="LeaveDiscardPopup-cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export {AddNewLeaveTypePopUp, MandatoryFieldPopup, LeaveCreatedSuccess, LeaveDiscardPopup};
