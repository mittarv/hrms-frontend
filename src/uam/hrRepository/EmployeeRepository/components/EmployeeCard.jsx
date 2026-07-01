import { useState } from "react";
import {  useSelector } from "react-redux";
import "../styles/EmployeeCard.scss";
import dropdown_arrow from "../../assets/icons/dropdown_arrow.svg";

import MinLoader from "../../Common/components/MinLoader";
const EMPLOYEE_STATUS = {
    ACTIVE: "Active",
    NOT_INITIATED: "not_initiated",
    INITIATED: "Offboarding Initiated",

};
const EmployeeCard = ({ employee, departmentMap, jobTypeMap,isExpanded,onToggle,getAllManagersDetails ,hasAccess }) => {
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const hasEmployeeDirectoryAdminAccess=myHrmsAccess?.permissions?.some(perm => perm.name === "EmployeeDirectoryAdmin_View");
  const [imgError, setImgError] = useState(false);
  const firstLetter = employee?.employeeFirstName?.charAt(0)?.toUpperCase();
   const handleToggle = () => {
    onToggle(employee.employeeUuid);
  };
  
    const { currentEmployeeDirectoryDetails,currentEmployeeDirectoryDetailsLoading } = useSelector((state) => state.hrRepositoryReducer);

    const employeeDetails = currentEmployeeDirectoryDetails && currentEmployeeDirectoryDetails.employeeDirectoryDetails?.employeeUuid === employee.employeeUuid 
        ? currentEmployeeDirectoryDetails.employeeDirectoryDetails 
        : null;
            const showDetailsLoader =
  isExpanded &&
  currentEmployeeDirectoryDetailsLoading &&
  !employeeDetails;
    const hasLoadedDetailsForThisEmployee = employeeDetails && !currentEmployeeDirectoryDetailsLoading;
    const manager = getAllManagersDetails?.find(m => m.empUuid === employeeDetails?.reportingManager?.empUuid);
    const ManagerName = employeeDetails?.reportingManager?.name || (manager ? `${manager.empFirstName} ${manager.empLastName}` : '---');
    const HiringDate = employeeDetails?.hiringDate;
    const formattedHiringDate = HiringDate ? new Date(HiringDate).toLocaleDateString('en-GB') : '---';
    const phone = employeeDetails?.phone || employee.employeePhone || '---';
    const email = employeeDetails?.emailId || employee.employeeEmail || '---';
    const displayWorkLocation = employeeDetails?.workLocation || '---';
    const showSensitiveFields = employeeDetails?.canViewSensitiveFields;
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
            <p className={employee.offboarding_status === EMPLOYEE_STATUS.NOT_INITIATED ? "active_employee" : "Offboarding_initiated"}>{employee.offboarding_status === EMPLOYEE_STATUS.NOT_INITIATED ? EMPLOYEE_STATUS.ACTIVE : EMPLOYEE_STATUS.INITIATED}</p>
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
          {showSensitiveFields && (
          <div className="each">
            <h3>Employee ID</h3>
            <p>{employeeDetails?.employeeId || "---"}</p>
          </div>)}
          <div className="each">
            <h3>Work Location</h3>
            <p>{displayWorkLocation}</p>
          </div>
          <div className="each">
            <h3>Hiring Date</h3>
            <p>{formattedHiringDate}</p>
          </div>
          
          {showSensitiveFields && <div className="each">
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
