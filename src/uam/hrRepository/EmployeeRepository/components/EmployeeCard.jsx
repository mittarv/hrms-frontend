import { useState } from "react";
import {  useSelector } from "react-redux";
import "../styles/EmployeeCard.scss";
import dropdown_arrow from "../../assets/icons/dropdown_arrow.svg";

import MinLoader from "../../Common/components/MinLoader";
const EMPLOYEE_STATUS = {
    ACTIVE: "Active",
};
const EmployeeCard = ({ employee, departmentMap, jobTypeMap,isExpanded,onToggle,getAllManagersDetails ,hasAccess }) => {
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const hasEmployeeDirectoryAdminAccess=myHrmsAccess?.permissions?.some(perm => perm.name === "EmployeeDirectoryAdmin_View");
  const [imgError, setImgError] = useState(false);
  const firstLetter = employee?.employeeFirstName?.charAt(0)?.toUpperCase();
   const handleToggle = () => {
    onToggle(employee.employeeUuid);
  };
  
    const { currentEmployeeDetails,currentEmployeeDetailsLoading } = useSelector((state) => state.hrRepositoryReducer);

    const employeeDetails = currentEmployeeDetails && currentEmployeeDetails.employeeBasicDetails?.empUuid === employee.employeeUuid 
        ? currentEmployeeDetails 
        : null;
            const showDetailsLoader =
  isExpanded &&
  currentEmployeeDetailsLoading &&
  (!employeeDetails || employeeDetails.employeeBasicDetails.empUuid !== employee.employeeUuid);
    const hasLoadedDetailsForThisEmployee = employeeDetails && !currentEmployeeDetailsLoading;
    const manager = getAllManagersDetails?.find(m => m.empUuid === employeeDetails?.employeeCurrentJobDetails?.empManager);
    const ManagerName = manager ? `${manager.empFirstName} ${manager.empLastName}` : '---';
    const HiringDate = employeeDetails?.employeeBasicDetails?.empHireDate;
    const formattedHiringDate = HiringDate ? new Date(HiringDate).toLocaleDateString('en-GB') : '---';
    const phone = employeeDetails?.employeeContactDetails?.empOfficialPhone || employee.employeePhone || '---';
    const email = employeeDetails?.employeeContactDetails?.empOfficialEmail || employee.employeeEmail || '---';
    const formatWorkLocation = (locationKey) => {
      if (!locationKey) return "---";

      const parts = locationKey.split("_");
      if (parts.length <= 1) return "---";
      const trimmed = parts.slice(0, -1);
      const formatted = trimmed
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return formatted || "---";
    };
    
    const workLocationKey = employeeDetails?.employeeAddressDetails?.state || '---';
    const displayWorkLocation = formatWorkLocation(workLocationKey);
  return (
    <div className={`employee-card ${isExpanded ? "expanded" : ""}`}>
      <div className="employee-default-details" onClick={handleToggle}>
      <div className="emp-left">
        {(employee?.employeeProfileImage)  ? (
          <img
            src={employee.employeeProfileImage}
            alt="profile"
            className="emp-img"
            onError={() => setImgError(true)} 
            referrerPolicy="no-referrer" 
          />
        ) : (
          <div className="emp-placeholder">{firstLetter}</div>
        )}

 
        <div className="emp-info">
          <div className="emp-name-status">
            <h4 className="emp-name">
              {employee?.employeeFirstName} {employee?.employeeLastName}
            </h4>
            {(hasAccess || hasEmployeeDirectoryAdminAccess) && (
            <p>{EMPLOYEE_STATUS.ACTIVE}</p>
            )}
          </div>
          <p className="emp-subinfo">
            {departmentMap[employee?.employeeDepartment]} |{" "}
            {jobTypeMap[employee?.employeeJobType]}
          </p>
        </div>
      </div>

      <div className="emp-right">
        <img src={dropdown_arrow} alt="dropdown" className={`employees_icon ${isExpanded ? "rotate" : ""}`} />
      </div>
      </div>
       {isExpanded  && (
      <div className="employee-details">
        <hr></hr>
        {showDetailsLoader ? (
          
          <MinLoader/>
            
        ) : hasLoadedDetailsForThisEmployee ? (
        <div className="details">
          {(hasAccess || hasEmployeeDirectoryAdminAccess) && (
          <div className="each">
            <h3>Employee ID</h3>
            <p>{employeeDetails?.employeeBasicDetails?.empCompanyId || "---"}</p>
          </div>)}
          <div className="each">
            <h3>Work Location</h3>
            <p>{displayWorkLocation}</p>
          </div>
          <div className="each">
            <h3>Hiring Date</h3>
            <p>{formattedHiringDate}</p>
          </div>
          
          {(hasAccess || hasEmployeeDirectoryAdminAccess) && <div className="each">
            <h3>Reporting Manager</h3>
            <p>{ManagerName}</p>
          </div>}
          <div className="each">
            <h3>Phone</h3>
            <p>{phone}</p>
          </div>
          <div className="each">
            <h3>Email Id</h3>
            <p>{email}</p>
          </div>
        </div>
        ):null}
      </div>
       
      )}
    </div>
  );
};

export default EmployeeCard;
