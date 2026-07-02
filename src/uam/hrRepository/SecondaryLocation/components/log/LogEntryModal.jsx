import CrossIcon from "../../../assets/icons/cross_icon.svg";
import InfoIcon from "../../../assets/icons/info_icon.svg";

const getDurationDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const difference = Math.floor((endUtc - startUtc) / (24 * 60 * 60 * 1000)) + 1;
  return difference > 0 ? difference : 0;
};

const LogEntryModal = ({
  isOpen,
  mode,
  employeeName,
  secondaryLocationName,
  formData,
  reason,
  showReasonField,
  errors,
  backendError,
  validationMessage,
  isValidationError,
  disableSave,
  intimationMessage,
  loading,
  onClose,
  onSave,
  onChangeField,
  onChangeReason,
}) => {
  if (!isOpen) {
    return null;
  }

  const durationDays = getDurationDays(formData.startDate, formData.endDate);

  return (
    <div className="sl_log_modal_overlay" role="presentation">
      <div className="sl_log_modal" role="dialog" aria-modal="true" aria-label="Log Secondary Location Dates">
        <div className="sl_log_modal_header">
          <h3 className="text-header-main">{mode === "edit" ? "Edit Secondary Location Dates" : "Log Secondary Location Dates"}</h3>
          <button type="button" onClick={onClose} aria-label="Close modal">
            <img src={CrossIcon} alt="close" />
          </button>
        </div>
        
        <div className="sl_log_modal_content">
          <div className="sl_log_modal_notice">
            <img src={InfoIcon} alt="info" />
            <p>
              This is for tracking purposes only. Ensure you have obtained approval from your manager
              through email or discussion before working from your secondary location.
            </p>
          </div>

          {employeeName && (
            <div className="sl_log_modal_employee_card">
              <p>Employee</p>
              <h4>{employeeName}</h4>
            </div>
          )}

          {secondaryLocationName && (
            <div className="sl_log_modal_employee_card">
              <p>Secondary Location</p>
              <h4>{secondaryLocationName}</h4>
            </div>
          )}

          <div className="sl_log_modal_dates_row">
            <label>
              <span>Start Date*</span>
              <input
                type="date"
                value={formData.startDate}
                onChange={(event) => onChangeField("startDate", event.target.value)}
                className={errors.startDate ? "input_error" : ""}
              />
              {errors.startDate && <small>{errors.startDate}</small>}
            </label>

            <label>
              <span>End Date*</span>
              <input
                type="date"
                value={formData.endDate}
                onChange={(event) => onChangeField("endDate", event.target.value)}
                className={errors.endDate ? "input_error" : ""}
              />
              {errors.endDate && <small>{errors.endDate}</small>}
            </label>
          </div>

          {durationDays > 0 && <p className="sl_log_duration_hint">Duration: {durationDays} day(s)</p>}

          {showReasonField && (
            <label className="sl_log_modal_reason_field">
              <span>Reason*</span>
              <textarea
                value={reason}
                onChange={(event) => onChangeReason(event.target.value)}
                placeholder="Please provide reason"
                className={errors.reason ? "input_error" : ""}
              />
              {errors.reason && <small>{errors.reason}</small>}
            </label>
          )}

          {validationMessage && (
            <div className={isValidationError ? "sl_log_modal_error_box" : "sl_log_modal_notice"}>
              {!isValidationError && <img src={InfoIcon} alt="info" />}
              <p>{validationMessage}</p>
            </div>
          )}

          {intimationMessage && (
            <div className="sl_log_modal_notice">
              <img src={InfoIcon} alt="info" />
              <p>{intimationMessage}</p>
            </div>
          )}

          {backendError && <div className="sl_log_modal_error_box">{backendError}</div>}
        </div>

        <div className="sl_log_modal_footer">
          <button type="button" className="cancel_btn text-btn-primary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="save_btn text-btn-primary" onClick={onSave} disabled={loading || disableSave}>
            {loading ? "Saving..." : mode === "edit" ? "Submit Request" : "Save Log"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogEntryModal;
