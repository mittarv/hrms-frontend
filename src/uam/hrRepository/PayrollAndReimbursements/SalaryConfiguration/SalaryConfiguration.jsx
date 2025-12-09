import CustomDropdown from "../../Common/components/CustomDropdown";
import SalaryTablesPage from "./components/SalaryTablePage";
import { useSalaryConfiguration } from "./hooks/useSalaryConfiguration";
import { useDropdownOptions } from "./hooks/useDropdownOptions";
import "./styles/SalaryConfiguration.scss";

/**
 * Main Salary Configuration Component
 * Simplified version with extracted business logic into custom hooks
 */
const SalaryConfiguration = () => {
  const {
    selectedOptions,
    isLevelDisabled,
    showResetButton,
    isSalaryConfigEditing,
    getAllComponentType,
    handleDropdownChange,
    handleReset,
    handleEdit,
    handleCancel,
    handleSave
  } = useSalaryConfiguration();

  const {
    employeeTypeOptions,
    employeeLocationOptions,
    employeeLevelOptions,
    departmentOptions,
    yearOfStudyOptions
  } = useDropdownOptions(getAllComponentType, selectedOptions.employeeType);

  // Check if current employee type is Intern or Extended Intern
  const isInternType = selectedOptions.employeeType === "Intern" || selectedOptions.employeeType === "Extended Intern";


  return (
    <div className="salary_configuration_main_container">
      <div className="salary_configuration_header_container">
        <div className="salary_configuration_header_dropdown_container">
          <CustomDropdown
            options={employeeTypeOptions}
            value={selectedOptions.employeeType || ""}
            placeholder="Select Employee Type"
            onChange={(e) => handleDropdownChange('employeeType', e.target.value)}
            searchable={true}
          />
          <CustomDropdown
            options={employeeLocationOptions}
            value={selectedOptions.employeeLocation || ""}
            placeholder="Select Location Type"
            onChange={(e) => handleDropdownChange('employeeLocation', e.target.value)}
            searchable={true}
          />
          <CustomDropdown
            options={employeeLevelOptions}
            value={selectedOptions.employeeLevel || ""}
            placeholder="Select Level"
            onChange={(e) => handleDropdownChange('employeeLevel', e.target.value)}
            searchable={true}
            disabled={isLevelDisabled}
          />
          {isInternType && (
            <>
              <CustomDropdown
                options={departmentOptions}
                value={selectedOptions.department || ""}
                placeholder="Select Department"
                onChange={(e) => handleDropdownChange('department', e.target.value)}
                searchable={true}
              />
              <CustomDropdown
                options={yearOfStudyOptions}
                value={selectedOptions.yearOfStudy || ""}
                placeholder="Select Year of Study"
                onChange={(e) => handleDropdownChange('yearOfStudy', e.target.value)}
                searchable={true}
              />
            </>
          )}
          {showResetButton && (
            <button 
              className="salary_configuration_reset_button" 
              onClick={handleReset}
            >
              Reset
            </button>
          )}
        </div>
        <div className="header_action_button_container">
          {!isSalaryConfigEditing ? (
            <button 
              className="salary_configuration_edit_button" 
              onClick={handleEdit}
            >
              Edit
            </button>
          ) : (
            <>
              <button 
                className="salary_configuration_cancel_button" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                className="salary_configuration_save_button" 
                onClick={handleSave}
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
      <SalaryTablesPage />   
    </div>
  );
};

export default SalaryConfiguration;
