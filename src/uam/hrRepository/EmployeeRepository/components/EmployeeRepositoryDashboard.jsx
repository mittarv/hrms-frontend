
import { useSelector, useDispatch } from "react-redux";
import "../styles/EmployeeRepositoryDashboard.scss";
import Add_icon from "../../assets/icons/add_icon_without_background.svg";
import { useEffect } from "react";
import EmployeeRepositoryTable from "./EmployeeRepositoryTable";
import {
  
  getAllManagers,
  getAllCountriesDetails,
} from "../../../../actions/hrRepositoryAction";
import { useSearchParams } from "react-router-dom";
import EmployeeOnBoardingForm from "./EmployeeOnBoardingForm";
import EmployeeDetailsPage from "./EmployeeDetailsPage";
import Snackbar from "../../Common/components/Snackbar";

import LoadingSpinner from "../../Common/components/LoadingSpinner";
import { hrToolHomePageData } from "../../constant/data";

const EmployeeRepositoryDashboard = () => {
  
  const { user } = useSelector((state) => state.user);
  const { 
        loading,
        myHrmsAccess,
      } = useSelector((state) => state.hrRepositoryReducer);
  const allToolsAccessDetails = useSelector(state => state.user.allToolsAccessDetails);
  const selectedToolName = useSelector(state => state.mittarvtools.selectedToolName);
  const userAccessLevel = allToolsAccessDetails?.[selectedToolName];
  const hasAccess=userAccessLevel>=900;
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const showEmployeeOnBOardingForm =
    searchParams.get("EmployeeOnBoardingForm") === "true";
  const showEmployeeDetails =
    searchParams.get("showEmployeeDetails") === "true";
  const hasAccessToAddEmployee = hasAccess || 
    myHrmsAccess?.permissions?.some(perm => perm.name === "ActiveEmployee_onBoarding");

  const handleAddEmployeeForm = () => {
    if(!hasAccessToAddEmployee){
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "You do not have permission to add employees",
          severity: "info",
        },
      });
    }
    else{
    setSearchParams((prev) => {
      if (showEmployeeOnBOardingForm) {
        prev.delete("EmployeeOnBoardingForm");
      } else {
        prev.set("EmployeeOnBoardingForm", "true");
      }
        return prev;
      });
    }
  };

  //Fetching all employees and dropdowns values with key
  useEffect(() => {
    
    dispatch(getAllManagers());
    dispatch(getAllCountriesDetails());
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2
    });

  }, [dispatch]);


  return ( 
    <>    
          {showEmployeeOnBOardingForm ? (
            <EmployeeOnBoardingForm />
          ) : showEmployeeDetails ? (
            <EmployeeDetailsPage />
          ) : (
            <div className="employee_repository_dashboard_body_container">
              <div className="employee_repository_dashboard_heading_container">
                <div className="employee_repository_dashboard_title_container">
                  <p className="employee_repository_dashboard_title">
                    Welcome, {user.name}!
                  </p>
                  <p className="employee_repository_dashboard_sub_title">
                    Here, you can view and maintain details within the employee
                    repository.
                  </p>
                </div>
                <div className="employee_repository_dashboard_buttons_container">
                  {hasAccessToAddEmployee && <button
                    className="employee_repository_dashboard_button"
                    onClick={handleAddEmployeeForm}
                    disabled={!hasAccessToAddEmployee}
                  >
                    <p>
                      <img src={Add_icon} /> <span>Add Employee</span>
                    </p>
                  </button>}
                </div>
              </div>
              {loading ? (
                <LoadingSpinner message="Loading Employees Data..." height="40vh" />
              ) : (
                <EmployeeRepositoryTable />
              )}
            </div>
          )}
        
      <Snackbar />
      
    </>
  );
};

export default EmployeeRepositoryDashboard;
