import CustomDropdown from "../../Common/components/CustomDropdown";
import SalaryTablesPage from "./components/SalaryTablePage";
import { useSalaryConfiguration } from "./hooks/useSalaryConfiguration";
import { useDropdownOptions } from "./hooks/useDropdownOptions";
import { useSelector } from "react-redux";
import "./styles/SalaryConfiguration.scss";

/**
 * Main Salary Configuration Component
 * Simplified version with extracted business logic into custom hooks
 */
const SalaryConfiguration = () => {
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  
  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canRead = hasPermission("ConfigureSalary_read");
  const canCreate = hasPermission("ConfigureSalary_create");
  const canUpdate = hasPermission("ConfigureSalary_update");
  const canDelete = hasPermission("ConfigureSalary_delete");

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

  // If user doesn't have read permission, show access denied message
  if (!canRead) {
    return (
      <div className="salary_configuration_main_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don't have permission to view salary configuration
          </p>
        </div>
      </div>
    );
  }

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
            (canUpdate || canCreate || canDelete) && (
              <button 
                className="salary_configuration_edit_button" 
                onClick={handleEdit}
              >
                Edit
              </button>
            )
          ) : (
            <>
              <button 
                className="salary_configuration_cancel_button" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              {(canUpdate || canCreate || canDelete) && (
                <button 
                  className="salary_configuration_save_button" 
                  onClick={handleSave}
                >
                  Save
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <SalaryTablesPage />   
    </div>
  );
};

export default SalaryConfiguration;
