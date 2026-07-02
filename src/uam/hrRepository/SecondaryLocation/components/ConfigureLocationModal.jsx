import CrossIcon from "../../assets/icons/cross_icon.svg";
import CustomDropdown from "../../Common/components/CustomDropdown";
import "../styles/ConfigureLocationModal.scss";

const ConfigureLocationModal = ({
  isOpen,
  isEditing,
  formData,
  errors = {},
  locationDropdown,
  employeeTypeDropdown,
  loading,
  onClose,
  onSave,
  onChangeField,
  onToggleEmployeeType,
}) => {
  if (!isOpen) {
    return null;
  }

  const locationEntries = Object.entries(locationDropdown || {});
  const locationOptions = locationEntries.map(([key, value]) => ({ key, value }));
  const selectedLocationLabel = locationDropdown?.[formData.location] || formData.location || "";

  const handleLocationChange = (event) => {
    const selectedLabel = event?.target?.value || "";
    const matchedLocation = locationEntries.find(([, label]) => label === selectedLabel);
    onChangeField("location", matchedLocation ? matchedLocation[0] : selectedLabel);
  };

  return (
    <div className="sl_config_modal_overlay" role="presentation">
      <div className="sl_config_modal" role="dialog" aria-modal="true" aria-label="Configure Location">
        <div className="sl_config_modal_header">
          <div className="sl_config_modal_title_block">
            <h3>{isEditing ? "Edit Configuration" : "Configure Location"}</h3>
            <div className="sl_config_title_underline" />
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <img src={CrossIcon} alt="close" />
          </button>
        </div>

        <div className="sl_config_modal_body">
          <label>
            <span className="field_label">Location <em>*</em></span>
            <CustomDropdown
              options={locationOptions}
              value={selectedLocationLabel}
              onChange={handleLocationChange}
              placeholder="Select location"
              fieldName="location"
              error={!!errors.location}
              searchable={false}
            />
            {errors.location && <span className="error_text">{errors.location}</span>}
          </label>

          <label>
            <span className="field_label">Duration (Weeks) <em>*</em></span>
            <input
              type="number"
              min="1"
              className={errors.durationInput ? "input_error" : ""}
              value={formData.durationInput}
              onChange={(event) => onChangeField("durationInput", event.target.value)}
              placeholder="8"
            />
            {errors.durationInput && <span className="error_text">{errors.durationInput}</span>}
          </label>

          <label>
            <span className="field_label">Maximum Splits per Year <em>*</em></span>
            <input
              type="number"
              min="1"
              className={errors.maximumSplitsPerYear ? "input_error" : ""}
              value={formData.maximumSplitsPerYear}
              onChange={(event) => onChangeField("maximumSplitsPerYear", event.target.value)}
            />
            {errors.maximumSplitsPerYear && <span className="error_text">{errors.maximumSplitsPerYear}</span>}
          </label>

          <label>
            <span className="field_label">Minimum intimation period (In Days) <em>*</em></span>
            <input
              type="number"
              min="0"
              className={errors.minimumIntimationPeriodDays ? "input_error" : ""}
              value={formData.minimumIntimationPeriodDays}
              onChange={(event) => onChangeField("minimumIntimationPeriodDays", event.target.value)}
            />
            {errors.minimumIntimationPeriodDays && <span className="error_text">{errors.minimumIntimationPeriodDays}</span>}
          </label>

          <div className="employee_type_group">
            <p>Employee Type <em>*</em></p>
            <div className="employee_type_checkboxes">
              {Object.entries(employeeTypeDropdown).map(([key, label]) => {
                const selected = formData.employeeTypes.includes(key);
                return (
                  <label
                    key={key}
                    className={selected ? "checkbox_row selected" : "checkbox_row"}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleEmployeeType(key)}
                      className="checkbox_input"
                    />
                    <span className="checkbox_icon" />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
            {errors.employeeTypes && <span className="error_text">{errors.employeeTypes}</span>}
          </div>
        </div>

        <div className="sl_config_modal_footer">
          <button type="button" className="cancel_btn" onClick={onClose}>Cancel</button>
          <button type="button" className="save_btn" onClick={onSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureLocationModal;
