import axios from "axios";
import store from "../store";

// Helper function to extract error messages from Blob responses
const getErrorMessage = async (error, defaultMessage) => {
  if (error.response) {
    // Check if the error response is a Blob
    if (error.response.data instanceof Blob) {
      try {
        // Convert Blob to text
        const text = await error.response.data.text();
        // Parse the text as JSON
        const jsonData = JSON.parse(text);
        // Return the message from the parsed JSON
        return jsonData.message || defaultMessage;
      } catch (e) {
        // If parsing fails, return the default message
        return defaultMessage;
      }
    }
    // If not a Blob, try to get the message directly
    return error.response.data?.message || defaultMessage;
  }
  // If no response, return error message or default
  return error.message || defaultMessage;
};

export const fetchAllImportantLinks = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");

    dispatch({ type: "FETCH_ALL_IMPORTANT_LINKS" });

    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/getall/importantlink`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "FETCH_ALL_IMPORTANT_LINKS_SUCCESS",
        payload: response.data.importantLinkList,
      });
    } else {
      dispatch({
        type: "FETCH_ALL_IMPORTANT_LINKS_FAILED",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "FETCH_ALL_IMPORTANT_LINKS_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
};

export const fetchAllPolicyDocuments = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    dispatch({ type: "FETCH_ALL_POLICY_DOCUMENTS" });

    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/getall/policy`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "FETCH_ALL_POLICY_DOCUMENTS_SUCCESS",
        payload: response.data.policyList,
      });
    } else {
      dispatch({
        type: "FETCH_ALL_POLICY_DOCUMENTS_FAILED",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "FETCH_ALL_POLICY_DOCUMENTS_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
};

//==========================passing the policy array from the jsx code,here I am extracting the array elements by using the index====================================
//===============================try to main the array indexing in the same order as mentioned below============================================================
export const addNewPolicy = (policyArray) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const { user } = store.getState().user;
    dispatch({ type: "ADD_NEW_POLICY" });
    for (let policy of policyArray) {
      if (
        policy["policyName"] === "" ||
        policy["policyLink"] === "" ||
        policy["approvedBy"] === "" ||
        policy["version"] === ""
      ) {
        return alert("Please fill all the fields");
      }
    }
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/add/policy`,
      {
        policyArray,
        createdBy: user.userId,
        lastModifiedBy: user.userId,
        employeeUuid: user.employeeUuid,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success === true) {
      dispatch(getCurrentEmployeeNotifications(user.employeeUuid));
      dispatch({
        type: "ADD_NEW_POLICY_SUCCESS",
        payload: response.data.message,
      });
      return alert(response.data.message);
    } else {
      dispatch({
        type: "ADD_NEW_POLICY_FAILED",
        payload: response.data.message,
      });
      return alert(response.data.message);
    }
  } catch (error) {
    dispatch({
      type: "ADD_NEW_POLICY_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    return alert(error.response);
  }
};

//========================here we will pass multiple ids of the policies to be deleted=================================
//========================we will pass the ids in the body of the request==============================================

export const deletePolicy = (ids) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    dispatch({ type: "DELETE_POLICY" });
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/delete/policy`,
      {
        id: ids,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success === true) {
      dispatch({
        type: "DELETE_POLICY_SUCCESS",
        payload: response.data.message,
      });
      return alert(response.data.message);
    } else {
      dispatch({
        type: "DELETE_POLICY_FAILED",
        payload: response.data.message,
      });
      return alert(response.data.message);
    }
  } catch (error) {
    dispatch({
      type: "DELETE_POLICY_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    return alert(error.response);
  }
};

//update existing policy function
export const updateExistingPolicy = (policyArray) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const { user } = store.getState().user;
    dispatch({ type: "UPDATE_POLICY" });
    for (let policy of policyArray) {
      if (
        policy["policyName"] === "" ||
        policy["policyLink"] === "" ||
        policy["approvedBy"] === "" ||
        policy["version"] === ""
      ) {
        return alert("Please fill all the fields");
      }
    }
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/update/policy`,
      {
        policyArray,
        lastModifiedBy: user.userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success === true) {
      dispatch({
        type: "UPDATE_POLICY_SUCCESS",
        payload: response.data.message,
      });
      return alert(response.data.message);
    } else {
      dispatch({
        type: "UPDATE_POLICY_FAILED",
        payload: response.data.message,
      });
      return alert(response.data.message);
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_POLICY_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    return alert(error.response);
  }
};

//add new important link function
export const addNewImportantLink = (importantLinkArray) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const { user } = store.getState().user;
    dispatch({ type: "ADD_NEW_IMPORTANT_LINK" });
    for (let tool of importantLinkArray) {
      if (tool["toolName"] === "" || tool["toolLink"] === "") {
        return alert("Please fill all the fields");
      }
    }
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/add/importantlink`,
      {
        toolArray: importantLinkArray,
        lastModifiedBy: user.userId,
        createdBy: user.userId,
        employeeUuid: user.employeeUuid,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success === true) {
      dispatch(getCurrentEmployeeNotifications(user.employeeUuid));
      dispatch({
        type: "ADD_NEW_IMPORTANT_LINK_SUCCESS",
        payload: response.data.message,
      });
      return alert(response.data.message);
    } else {
      dispatch({
        type: "ADD_NEW_IMPORTANT_LINK_FAILED",
        payload: response.data.message,
      });
      return alert(response.data.message);
    }
  } catch (error) {
    dispatch({
      type: "ADD_NEW_IMPORTANT_LINK_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    return alert(error.response);
  }
};

//=================================update important link function====================================================
export const updateImportantLink = (importantLinkArray) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const { user } = store.getState().user;
    dispatch({ type: "UPDATE_IMPORTANT_LINK" });
    for (let link of importantLinkArray) {
      if (link["toolName"] === "" || link["toolLink"] === "") {
        return alert("Please fill all the fields");
      }
    }
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/update/importantlink`,
      {
        toolArray: importantLinkArray,
        lastModifiedBy: user.userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success === true) {
      dispatch({
        type: "UPDATE_IMPORTANT_LINK_SUCCESS",
        payload: response.data.message,
      });
      return alert(response.data.message);
    } else {
      dispatch({
        type: "UPDATE_IMPORTANT_LINK_FAILED",
        payload: response.data.message,
      });
      return alert(response.data.message);
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_IMPORTANT_LINK_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    return alert(error.response);
  }
};

//===================================delete important link api function=================================================
export const deleteImportantLink = (ids) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    dispatch({ type: "DELETE_IMPORTANT_LINK" });
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrrepository/delete/importantlink`,
      {
        id: ids,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success === true) {
      dispatch({
        type: "DELETE_IMPORTANT_LINK_SUCCESS",
        payload: response.data.message,
      });
      return alert(response.data.message);
    } else {
      dispatch({
        type: "DELETE_IMPORTANT_LINK_FAILED",
        payload: response.data.message,
      });
      return alert(response.data.message);
    }
  } catch (error) {
    dispatch({
      type: "DELETE_IMPORTANT_LINK_FAILED",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    return alert(error.response);
  }
};

export const clearStateData = () => async (dispatch) => {
  dispatch({ type: "CLEAR_STATE_DATA" });
};
export const clearStateDataLink = () => async (dispatch) => {
  dispatch({ type: "CLEAR_STATE_DATA_LINK" });
};


export const getAllComponentTypes = () => async (dispatch) => {
  try {
    dispatch({type:"GET_ALL_COMPONENT_TYPES"});
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empConfig/getAllComponentType`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
     dispatch({
      type:"GET_ALL_COMPONENT_TYPES_SUCCESS",
      payload: response.data.allComponent,
     })
    } else {
      dispatch({
        type: "GET_ALL_COMPONENT_TYPES_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ALL_COMPONENT_TYPES_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
};

export const employeeOnboardingDetails = (updatedFormValueList) => async (dispatch) => {
    const token = localStorage.getItem("token");
    dispatch({ type: "EMPLOYEE_ONBOARDING_DETAILS" });
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_HOSTED_URL
        }/api/hrms/empDetails/createEmployeeData`,
        updatedFormValueList,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
       
      );
      if (response.data.success) {
        dispatch(getAllEmployee());
        dispatch(getAllManagers());
        dispatch({
          type: "EMPLOYEE_ONBOARDING_DETAILS_SUCCESS",
          payload: response.data.message,
        });
        dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Employee onboarded successfully",
            severity: "success"
          }
        });
       }
       else {
        dispatch({
          type: "EMPLOYEE_ONBOARDING_DETAILS_FAILURE",
          payload: response.data.message,
        });
        dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to onboard employee",
            severity: "error"
          }
        });
       }
    } catch (error) {
      dispatch({
        type: "EMPLOYEE_ONBOARDING_DETAILS_FAILURE",
        payload: error.message,
      })
      dispatch({
        type: "SET_SNACKBAR_MESSAGE",
        payload: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      });
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: await getErrorMessage(error, "Failed to onboard employee"),
            severity: "error"
          }
        });
    }
  };


  //Function for getting all employees
  export const getAllEmployee = () => async (dispatch) => {
    try {
      const token = localStorage.getItem("token");
      dispatch({type:"GET_ALL_EMPLOYEE"});
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empDetails/getAllEmployees`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      if (response.data.success) {
       dispatch({
        type:"GET_ALL_EMPLOYEE_SUCCESS",
        payload: response.data.allEmployeeDetails,
       })
      } else {
        dispatch({
          type: "GET_ALL_EMPLOYEE_FAILURE",
          payload: response.data.message,
        });
      }
    } catch (error) {
      dispatch({
        type: "GET_ALL_EMPLOYEE_FAILURE",
        payload: await getErrorMessage(error, "An error occurred"),
      });
    }
  };



  //Function for getting current employee details
  export const getCurrentEmployeeDetails = (employeeUuid) => async (dispatch) => {
    try {
      const token = localStorage.getItem("token");
      dispatch({type:"GET_CURRENT_EMPLOYEE_DETAILS"});
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empDetails/getCurrentEmpDetails/${employeeUuid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      if (response.data.success) {
       dispatch({
        type:"GET_CURRENT_EMPLOYEE_DETAILS_SUCCESS",
        payload: response.data,
       })
       //Show the employee details page (After successfully api called)
       dispatch({type: "SET_EMPLOYEES_DETAILS_PAGE"});
      } else {
        dispatch({
          type: "GET_CURRENT_EMPLOYEE_DETAILS_FAILURE",
          payload: response.data.message,
        });
      }
    } catch (error) {
      dispatch({
        type: "GET_CURRENT_EMPLOYEE_DETAILS_FAILURE",
        payload: await getErrorMessage(error, "An error occurred"),
      });
    }
  };

  
  export const updateEmployeeDetails = (updatedEmployeeData, employeeUuid) => async (dispatch) => {
    const token = localStorage.getItem("token");
    try {
      dispatch({type:"EMPLOYEE_DETAILS_UPDATE"});
      const response = await axios.patch(
        `${
          import.meta.env.VITE_REACT_APP_HOSTED_URL
        }/api/hrms/empDetails/updateCurrentEmpDetails/${employeeUuid}`,
        updatedEmployeeData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      if (response.data.success) {
        await dispatch(getCurrentEmployeeDetails(employeeUuid));
        dispatch(getAllEmployee());
        dispatch(getAllManagers());
        dispatch({
          type: "EMPLOYEE_DETAILS_UPDATE_SUCCESS"
        });
        dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Employee details updated successfully",
          severity: "success"
        }
      });
       }
       else {
        dispatch({
          type: "EMPLOYEE_DETAILS_UPDATE_FAILURE",
        })
        dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to update employee details",
            severity: "error"
          }
        });
       }
    } catch (error) {
      dispatch({
        type: "EMPLOYEE_DETAILS_UPDATE_FAILURE",
      })
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: await getErrorMessage(error, "Failed to update employee details"),
            severity: "error"
          }
      });
    }
  }
// to fetch all the managers list
export const getAllManagers = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    dispatch({type:"GET_ALL_MANAGER_DETAILS"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empDetails/getAllManager`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
       type:"GET_ALL_MANAGER_DETAILS_SUCCESS",
       payload: response.data.managerInfo,
      })
    } else {
      dispatch({
        type: "GET_ALL_MANAGER_DETAILS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ALL_MANAGER_DETAILS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });   
  }
}


export const getAllBirthdayAndAnniversary = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    dispatch({type:"GET_ALL_EMPLOYEE_BIRTHDAY_AND_ANNIVERSARY"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empDetails/getEmployeeDashboardDetails?timezone=${encodeURIComponent(timezone)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if(response.data.success){
      dispatch({type:"RESET_VIEW_PROFILE_PAGE"});
      dispatch({
        type: "GET_ALL_EMPLOYEE_BIRTHDAY_SUCCESS",
        payload: response.data.employeeBirthdayDetails,
      });
      dispatch({
        type: "GET_ALL_EMPLOYEE_ANNIVERSARY_SUCCESS",
        payload: response.data.employeeWorkAnniversaryDetails,
      });
    } else{
      dispatch({
        type: "GET_ALL_EMPLOYEE_BIRTHDAY_AND_ANNIVERSARY_FAILURE",
        payload: response.data.message && response.data.message,
      });
    }
    
  } catch (error) {
    dispatch({
      type: "GET_ALL_EMPLOYEE_BIRTHDAY_AND_ANNIVERSARY_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getAllLeaves = () => async (dispatch) => {
  try {
    dispatch({type:"GET_ALL_LEAVE_DETAILS"});
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/leaveConfig/getAllLeaves`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
       type:"GET_ALL_LEAVE_DETAILS_SUCCESS",
       payload: response.data.leaveDetails,
      })
    } else {
      dispatch({
        type: "GET_ALL_LEAVE_DETAILS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ALL_LEAVE_DETAILS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
};


export const createLeave = (leaveData) => async(dispatch) =>{
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"CREATE_LEAVE"});
    const response = await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_HOSTED_URL
      }/api/hrms/leaveConfig/createLeave`,
      JSON.stringify(leaveData),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
     
    );
    if (response.data.success) {
      dispatch({
        type: "CREATE_LEAVE_SUCCESS",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_LEAVE_CREATED_SUCCESS",
        payload: true,
      })
      dispatch(getAllLeaves());
     }
     else {
      dispatch({
        type: "CREATE_LEAVE_FAILURE",
        payload: response.data.message,
      }); 
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to create leave.",
            severity: "error"
          }
        });
     }
  } catch (error) {

    dispatch({
      type: "CREATE_LEAVE_FAILURE",
      payload: error.message,
    });
    dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: await getErrorMessage(error, "Failed to create leave."),
            severity: "error"
          }
        });
  }
}


export const getLeaveDetails = (leaveUuid) => async (dispatch) => {
  try {
    dispatch({type:"GET_CURRENT_LEAVE_DETAILS"});
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/leaveConfig/getLeaveDetailsByUuid/${leaveUuid}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
     dispatch({
      type:"GET_CURRENT_LEAVE_DETAILS_SUCCESS",
      payload: response.data.leaveDetails,
     })
     dispatch({type: "SET_LEAVE_DETAILS_PAGE"});
    } else {
      dispatch({
        type: "GET_CURRENT_LEAVE_DETAILS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_CURRENT_LEAVE_DETAILS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
};

export const updateLeaveDetails = (updatedLeaveData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"UPDATED_CURRENT_LEAVE_DETAILS"});
    const response = await axios.patch(
      `${
        import.meta.env.VITE_REACT_APP_HOSTED_URL
      }/api/hrms/leaveConfig/updateLeaveConfiguration`,
      updatedLeaveData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "UPDATED_CURRENT_LEAVE_DETAILS_SUCCESS",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_LEAVE_UPDATE_SUCCESS",
        payload: true,
      })
      dispatch(getAllLeaves());
     }
     else {
      dispatch({
        type: "UPDATED_CURRENT_LEAVE_DETAILS_FAILURE",
        payload: response.data.message,
      });
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to update leave.",
            severity: "error"
          }
      });
     }
  } catch (error) {
    dispatch({
      type: "UPDATED_CURRENT_LEAVE_DETAILS_FAILURE",
      payload: error.message,
    });
    dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: await getErrorMessage(error, "Failed to update leave."),
            severity: "error"
          }
    });
  }
}

export const getAllCountriesDetails = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"GET_ALL_COUNTRIES_DETAILS"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/platform/allCountries/getAll`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type:"GET_ALL_COUNTRIES_DETAILS_SUCCESS",
        payload: response.data.countries,
      })
    } else {
      dispatch({
        type: "GET_ALL_COUNTRIES_DETAILS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ALL_COUNTRIES_DETAILS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
};

/**
 * Dispatches an action to send changes to an approver.
 * This function is likely used to submit updates or changes to a workflow or approval process.
 */
export const sendChangesToApprover = (changeRequestData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"SEND_CHANGES_TO_APPROVER"});
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empDetails/sendChangesToApprover`,
      changeRequestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch(getAllEmployee());
      dispatch(getCurrentEmployeeDetails(changeRequestData.requestedFor));  
      dispatch(getAllManagers());  
      dispatch(getCurrentEmployeeNotifications(changeRequestData.requestedFor));
      dispatch({
        type: "SEND_CHANGES_TO_APPROVER_SUCCESS",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message,
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "SEND_CHANGES_TO_APPROVER_FAILURE",
        payload: response.data.message,
      });
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to send changes to approver.",
            severity: "error"
          }
      });
    }
  } catch (error) {
    dispatch({
      type: "SEND_CHANGES_TO_APPROVER_FAILURE",
      payload: error.message,
    });
    dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: error?.response?.data?.message || "Failed to send changes to approver.",
            severity: "error"
          }
      });
  }
}

/**
 * Dispatches an action to get all pending requests.
 * This function is likely used to get all pending requests for a user.
 */
export const getPendingRequests = () => async (dispatch) => {
  const token = localStorage.getItem("token"); 
  try {
    dispatch({type:"GET_PENDING_REQUESTS"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empDetails/getPendingRequests`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_PENDING_REQUESTS_SUCCESS",
        payload: response.data.data,
      });
    } else {
      dispatch({
        type: "GET_PENDING_REQUESTS_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_SNACKBAR_MESSAGE",
        payload: response.data.message,
        severity: "error",
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_PENDING_REQUESTS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_SNACKBAR_MESSAGE",
      payload: await getErrorMessage(error, "An error occurred"),
      severity: "error",
    });
  }
};


/**
 * Dispatches an action to approve a request.
 * This function is likely used to approve a request.
 */

export const approveOrRejectRequest = (requestData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "APPROVE_OR_REJECT_REQUEST" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empDetails/approveOrRejectRequest`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      await dispatch(getPendingRequests());
      dispatch({
        type: "APPROVE_OR_REJECT_REQUEST_SUCCESS",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Request processed successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "APPROVE_OR_REJECT_REQUEST_FAILURE",
        payload: response.data.message,
      });
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to process request.",
            severity: "error"
          }
      });
    }
  } catch (error) {
    dispatch({
      type: "APPROVE_OR_REJECT_REQUEST_FAILURE",
      payload: error.message,
    });
    dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: await getErrorMessage(error, "Failed to process request."),
            severity: "error"
          }
      });
  }
};

export const getAllEmployeeHolidays = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"GET_EMP_HOLIDAY"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empHoliday/getAllHolidays`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if(response.data.success){
      dispatch({
        type:"GET_EMP_HOLIDAY_SUCCESS",
        payload: response.data.data,
      })
    } else {
      dispatch({
        type: "GET_EMP_HOLIDAY_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_EMP_HOLIDAY_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const createHolidays = (holidayData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"CREATE_HOLIDAY_TYPE"});
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empHoliday/createHoliday`,
      holidayData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if(response.data.success){
      dispatch({
        type: "CREATE_HOLIDAY_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllEmployeeHolidays());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Holiday Created successfully",
          severity: "success"
        }
      });
    }
    else {
      dispatch({
        type: "CREATE_HOLIDAY_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Error creating holiday",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "CREATE_HOLIDAY_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: await getErrorMessage(error, "An error occurred"),
          severity: "error"
        }
    });
  }
}

export const deleteHolidays = (holidayIds) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    dispatch({ type: "DELETE_HOLIDAY_TYPE" });
    
    const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empHoliday/deleteHoliday`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${token}`, 
      },
      data: {
        holidayIds: holidayIds 
      }
    });
    
    if (response.data.success) {
      dispatch({
        type: "DELETE_HOLIDAY_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllEmployeeHolidays());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Holiday deleted successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "DELETE_HOLIDAY_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Error deleting holiday",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "DELETE_HOLIDAY_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: error?.response?.data?.message || await getErrorMessage(error, "Failed to delete holiday"),
          severity: "error"
        }
      });
  }
};

export const updateHolidays = (holidayData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"UPDATE_HOLIDAY_TYPE"});
    const response = await axios.put(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empHoliday/updateHoliday`,
      holidayData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if(response.data.success){
      dispatch({
        type: "UPDATE_HOLIDAY_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllEmployeeHolidays());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Holiday Updated successfully",
          severity: "success"
        }
      });
    }
    else {
      dispatch({
        type: "UPDATE_HOLIDAY_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Error updating holiday",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_HOLIDAY_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: await getErrorMessage(error, "An error occurred"),
          severity: "error"
        }
    });
  }
}

export const getAttendanceLogs = (month, year, employeeUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"GET_ATTENDANCE_LOGS"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${employeeUuid}/getEmployeeAttendance/?month=${month}&year=${year}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if(response.data.success){
      dispatch({
        type: "GET_ATTENDANCE_LOGS_SUCCESS",
        payload: response.data.empAttendanceDetails,
      });
    } else {
      dispatch({
        type: "GET_ATTENDANCE_LOGS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ATTENDANCE_LOGS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const createAttendanceLog = (attendanceData, attendanceMonth, attendanceYear) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"CREATE_ATTENDANCE_LOG"});
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${attendanceData.empUuid}/registerAttendance`,
      attendanceData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if(response.data.success){
      dispatch({
        type: "CREATE_ATTENDANCE_LOG_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAttendanceLogs(attendanceMonth, attendanceYear, attendanceData.empUuid));
      dispatch(getLeaveBalanceWithAccrual(attendanceData.empUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "attendance log created successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "CREATE_ATTENDANCE_LOG_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Error creating attendance log",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "CREATE_ATTENDANCE_LOG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: await getErrorMessage(error, "An error occurred"),
          severity: "error"
        }
    });
  }
}

export const registerCompOffLeave = (attendanceData, attendanceMonth, attendanceYear) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"CREATE_ATTENDANCE_LOG"});
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${attendanceData.empUuid}/registerCompOffLeave`,
      attendanceData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if(response.data.success){
      dispatch({
        type: "CREATE_ATTENDANCE_LOG_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAttendanceLogs(attendanceMonth, attendanceYear, attendanceData.empUuid));
      dispatch(getLeaveBalanceWithAccrual(attendanceData.empUuid));
      dispatch(getCompOffleaveBalance(attendanceData.empUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Comp off leave applied successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "CREATE_ATTENDANCE_LOG_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Error applying comp off leave",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "CREATE_ATTENDANCE_LOG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: await getErrorMessage(error, "An error occurred"),
          severity: "error"
        }
    });
  }
}

export const updateCompOffLeave = (attendanceData, attendanceId, month, year, employeeUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"UPDATE_EMPLOYEE_ATTENDANCE_LOG"});
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${attendanceId}/updateCompOffLeave`,
      attendanceData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "UPDATE_EMPLOYEE_ATTENDANCE_LOG_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAttendanceLogs(month, year, employeeUuid));
      dispatch(getEmployeeLeaveHistory(employeeUuid));
      dispatch(getLeaveBalanceWithAccrual(employeeUuid));
      dispatch(getCompOffleaveBalance(employeeUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Comp off leave updated successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "UPDATE_EMPLOYEE_ATTENDANCE_LOG_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Failed to update comp off leave",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_EMPLOYEE_ATTENDANCE_LOG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error"
      }
    });
  }
}

export const getAllPendingLeaveRequests = (startDate, endDate) => async (dispatch) => {
  const token =localStorage.getItem("token");
  dispatch({type:"GET_ALL_PENDING_LEAVE_REQUESTS"});
  try {
    const response  = await axios.get(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/getAllPendingLeaveRequests/?start=${startDate}&end=${endDate}`, 
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      }
    }
  )
  if(response.data.success) {
    dispatch({
      type: "GET_ALL_PENDING_LEAVE_REQUESTS_SUCCESS",
      payload : response.data.allPendingRequests

    })
  } else {
    dispatch({
      type: "GET_ALL_PENDING_LEAVE_REQUESTS_FAILURE",
      payload: response.data.message,
    });
  }
  } catch (error) {
    dispatch({
      type: "GET_ALL_PENDING_LEAVE_REQUESTS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const triggerProofRequiredForLeave = (leaveUuid) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"TRIGGER_PROOF_REQUIRED_FOR_LEAVE"});
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${leaveUuid}/requireProofForLeave`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "TRIGGER_PROOF_REQUIRED_FOR_LEAVE_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllPendingLeaveRequests("", ""));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Proof required for leave triggered successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "TRIGGER_PROOF_REQUIRED_FOR_LEAVE_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Error triggering proof required for leave",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "TRIGGER_PROOF_REQUIRED_FOR_LEAVE_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: await getErrorMessage(error, "An error occurred"),
          severity: "error"
        }
    });
  }
} 

export const getEmployeeLeaveHistory = (employeeUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"GET_EMPLOYEE_LEAVE_HISTORY"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${employeeUuid}/getEmployeeLeaveHistory`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if(response.data.success){
      dispatch({
        type: "GET_EMPLOYEE_LEAVE_HISTORY_SUCCESS",
        payload: response.data.employeeLeaveHistory,
      });
    } else {
      dispatch({
        type: "GET_EMPLOYEE_LEAVE_HISTORY_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_EMPLOYEE_LEAVE_HISTORY_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}


export const uploadProofDocuments = (uploadedData, leaveRequestId, employeeUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"UPLOAD_PROOF_DOCUMENTS"});
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${leaveRequestId}/uploadProofDocuments`,
      uploadedData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
      );

    if (response.data.success) {
      dispatch({
        type: "UPLOAD_PROOF_DOCUMENTS_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getEmployeeLeaveHistory(employeeUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Proof documents uploaded successfully",
          severity: "success"
        }
      });
    } else {
        dispatch({
          type: "UPLOAD_PROOF_DOCUMENTS_FAILURE",
          payload: response.data.message,
          });
        dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to upload proof documents",
            severity: "error"
          }
        })  
      }
   } catch (error) {
      dispatch({
         type: "UPLOAD_PROOF_DOCUMENTS_FAILURE",
         payload: await getErrorMessage(error, "An error occurred"),
       });
       dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: await getErrorMessage(error, "An error occurred"),
          severity: "error"
        }
        });
    }
};


export const reviewLeaveRequest = (reviewedData, employeeUuid) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"REVIEW_LEAVE_REQUEST"});
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${employeeUuid}/reviewLeaveRequest`,
      reviewedData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "REVIEW_LEAVE_REQUEST_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllPendingLeaveRequests("", ""));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Leave request reviewed successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "REVIEW_LEAVE_REQUEST_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Failed to review leave request",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "REVIEW_LEAVE_REQUEST_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error"
      }
    });
  }
}

export const getEmployeeLeaveBalance = (employeeUuid) => async(dispatch) => {
  const token = localStorage.getItem("token");
  if (!employeeUuid) return;
  
  try {
    dispatch({type:"GET_EMPLOYEE_LEAVE_BALANCE"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${employeeUuid}/getEmployeeLeaveBalance`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_EMPLOYEE_LEAVE_BALANCE_SUCCESS",
        payload: response.data.empBalanceDetails,
      });
    } else {
      dispatch({
        type: "GET_EMPLOYEE_LEAVE_BALANCE_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_EMPLOYEE_LEAVE_BALANCE_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}


export const deleteEmployeeAttendanceLog = (attendanceId, month, year,employeeUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"DELETE_EMPLOYEE_ATTENDANCE_LOG"});
    const response = await axios.delete(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${attendanceId}/deleteEmployeeAttendance`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "DELETE_EMPLOYEE_ATTENDANCE_LOG_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getEmployeeLeaveHistory(employeeUuid));
      dispatch(getAttendanceLogs(month, year, employeeUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Attendance log deleted successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "DELETE_EMPLOYEE_ATTENDANCE_LOG_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Failed to delete attendance log",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "DELETE_EMPLOYEE_ATTENDANCE_LOG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error"
      }
    });
  }
}

export const updateEmployeeAttendanceLog = (attendanceData, attendanceId, month, year, employeeUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"UPDATE_EMPLOYEE_ATTENDANCE_LOG"});
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${attendanceId}/updateEmployeeAttendance`,
      attendanceData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "UPDATE_EMPLOYEE_ATTENDANCE_LOG_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAttendanceLogs(month, year, employeeUuid));
      dispatch(getEmployeeLeaveHistory(employeeUuid));
      dispatch(getLeaveBalanceWithAccrual(employeeUuid));
      dispatch(getCompOffleaveBalance(employeeUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Attendance log updated successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "UPDATE_EMPLOYEE_ATTENDANCE_LOG_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Failed to update attendance log",
          severity: "error"
        }
      });
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_EMPLOYEE_ATTENDANCE_LOG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error"
      }
    });
  }
}

export const getEmployeeOnLeave = (startDate, endDate) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"GET_EMPLOYEE_ON_LEAVE"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/getEmployeeOnLeave/?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_EMPLOYEE_ON_LEAVE_SUCCESS",
        payload: response.data.employeesOnLeave,
      });
    } else {
      dispatch({
        type: "GET_EMPLOYEE_ON_LEAVE_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_EMPLOYEE_ON_LEAVE_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
};

export const checkOutstandingCheckout = (empUuid) => async (dispatch) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"CHECK_OUTSTANDING_CHECKOUT"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${empUuid}/checkOutstandingCheckout?timezone=${encodeURIComponent(timezone)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "CHECK_OUTSTANDING_CHECKOUT_SUCCESS",
        payload: response.data.outStandingCheckOut,
      });
    } else {
      dispatch({
        type: "CHECK_OUTSTANDING_CHECKOUT_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "CHECK_OUTSTANDING_CHECKOUT_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}
export const getCheckInCheckOutStatus = (empUuid) => async  (dispatch) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const token = localStorage.getItem("token");
  try {
    dispatch({type:"GET_CHECK_IN_CHECK_OUT_STATUS"});
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${empUuid}/getCheckInOutStatus?timezone=${encodeURIComponent(timezone)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_CHECK_IN_CHECK_OUT_STATUS_SUCCESS",
        payload: response.data.checkInChcekOutStatus,
      });
    } else {
      dispatch({
        type: "GET_CHECK_IN_CHECK_OUT_STATUS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_CHECK_IN_CHECK_OUT_STATUS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const employeeCheckIn = (empUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    dispatch({type:"EMPLOYEE_CHECK_IN"});
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${empUuid}/employeeCheckIn`,
      {
        timezone: userTimezone  
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "EMPLOYEE_CHECK_IN_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getCheckInCheckOutStatus(empUuid));
      dispatch(checkOutstandingCheckout(empUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Employee checked in successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "EMPLOYEE_CHECK_IN_FAILURE",
        payload: response.data.message,
      });
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to check in.",
            severity: "error"
          }
      });
    }
  } catch (error) {
    dispatch({
      type: "EMPLOYEE_CHECK_IN_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: await getErrorMessage(error, "Failed to check in."),
            severity: "error"
          }
      });
  }
}

export const employeeCheckOut = (empUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    dispatch({type:"EMPLOYEE_CHECK_OUT"});
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${empUuid}/employeeCheckOut`,
      {
        timezone: userTimezone
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "EMPLOYEE_CHECK_OUT_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getCheckInCheckOutStatus(empUuid));
      dispatch(checkOutstandingCheckout(empUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "employee checked out successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "EMPLOYEE_CHECK_OUT_FAILURE",
        payload: response.data.message,
      });
      dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: response?.data?.message || "Failed to check out.",
            severity: "error"
          }
      });
    }
  } catch (error) {
    dispatch({
      type: "EMPLOYEE_CHECK_OUT_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
          type: "SET_NEW_SNACKBAR_MESSAGE",
          payload: {
            message: await getErrorMessage(error, "Failed to check out."),
            severity: "error"
          }
      });
  }
}

export const updateEmployeeOutstandingCheckout = (attendanceId, checkOutData, empUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");  
  try {
    dispatch({type:"UPDATE_EMPLOYEE_OUTSTANDING_CHECKOUT"});
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${attendanceId}/updateEmployeeOutstandingCheckout`,
      checkOutData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "UPDATE_EMPLOYEE_OUTSTANDING_CHECKOUT_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getCheckInCheckOutStatus(empUuid));
      dispatch(checkOutstandingCheckout(empUuid));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Outstanding checkout updated successfully",
          severity: "success"
        }
      });
    } else {
      dispatch({
        type: "UPDATE_EMPLOYEE_OUTSTANDING_CHECKOUT_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Failed to update outstanding checkout.",
          severity: "error"
        }
      });
    }
  }
  catch (error) {
    dispatch({
      type: "UPDATE_EMPLOYEE_OUTSTANDING_CHECKOUT_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error"
      }
    });
  }
}


export const checkCdlLimit = (empUuid, selectedDate) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "CHECK_CDL_LIMIT" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${empUuid}/getLeaveEligibility?requestDate=${selectedDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "CHECK_CDL_LIMIT_SUCCESS",
        payload: response.data.leaveEligibilityData,
      });
    } else {
      dispatch({
        type: "CHECK_CDL_LIMIT_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "CHECK_CDL_LIMIT_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getCurrentEmployeeNotifications = (empUuid) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_CURRENT_EMPLOYEE_NOTIFICATIONS" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/Notifications/${empUuid}/currentEmployeeNotifications`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_CURRENT_EMPLOYEE_NOTIFICATIONS_SUCCESS",
        payload: response.data.notifications,
      });
    } else {
      dispatch({
        type: "GET_CURRENT_EMPLOYEE_NOTIFICATIONS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_CURRENT_EMPLOYEE_NOTIFICATIONS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getLeaveBalanceWithAccrual = (empUuid, asOfDate = null) => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (!empUuid) return;
  try {
    dispatch({ type: "GET_LEAVE_BALANCE_WITH_ACCRUAL" });
    
    // Build URL with optional date parameter for multi-fiscal year support
    let url = `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${empUuid}/getLeaveBalanceWithAccrual`;
    if (asOfDate) {
      url += `?asOfDate=${asOfDate}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    if (response.data.success) {
      dispatch({
        type: "GET_LEAVE_BALANCE_WITH_ACCRUAL_SUCCESS",
        payload: {
          leaveBalance: response.data.accrualLeaveBalance.leaveBalance,
          fiscalYearInfo: {
            fiscalYear: response.data.accrualLeaveBalance.fiscalYear,
            fiscalYearStart: response.data.accrualLeaveBalance.fiscalYearStart,
            fiscalYearEnd: response.data.accrualLeaveBalance.fiscalYearEnd,
            targetDate: response.data.accrualLeaveBalance.targetDate,
            isHistoricalData: response.data.accrualLeaveBalance.isHistoricalData
          }
        },
      });

      dispatch({
        type: "GET_EMPLOYEE_LEAVE_BALANCE_SUCCESS",
        payload: response.data.accrualLeaveBalance.fiscalYear,
      });
    } else {
      dispatch({
        type: "GET_LEAVE_BALANCE_WITH_ACCRUAL_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_LEAVE_BALANCE_WITH_ACCRUAL_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getSalaryComponents = (employeeType, employeeLocation, employeeLevel, department, yearOfStudy) => async(dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({type:"GET_SALARY_CONFIG"});
  try {
    const baseUrl = `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/salaryConfigurator/getSalaryConfigDetails/`;
    const params = new URLSearchParams();

    if (employeeType) params.append('employeeType', employeeType);
    if (employeeLocation) params.append('employeeLocation', employeeLocation);
    if (employeeLevel) params.append('employeeLevel', employeeLevel);
    if (department) params.append('department', department);
    if (yearOfStudy) params.append('yearOfStudy', yearOfStudy);

    const res = `${baseUrl}?${params.toString()}`;
    const response = await axios.get(res, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      }
    });

    if(response.data.status === "success") {
        const globalComponent = response.data.salaryConfigData
          .filter(
            (item) =>
              item.employeeType === "All" &&
              item.employeeLocation === "All" &&
              item.employeeLevel === "All"
          )
          .map((item) => item.salaryComponents).flat();

        const defaultComponent = response.data.salaryConfigData
          .filter(
            (item) =>
              item.employeeType != "All" &&
              item.employeeLocation != "All" &&
              item.employeeLevel != "All"
          )
          .map((item) => item.salaryComponents).flat();

        dispatch({
          type:"GET_GLOBAL_SALARY_COMPONENTS_SUCCESS",
          payload: globalComponent
        })

        dispatch({
          type: "GET_DEFAULT_SALARY_COMPONENTS_SUCCESS",
          payload: defaultComponent
        })

    } else {
      dispatch({
        type: "GET_SALARY_CONFIG_FAILURE",
        payload: response.data.message,
      })  
    }
  } catch (error) {
    dispatch({
      type: "GET_SALARY_CONFIG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    })
  }
}

export const createSalaryConfig = (configData, employeeType, employeeLocation, employeeLevel, department, yearOfStudy, lastApiCallRef) => async(dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({type:"CREATE_SALARY_CONFIG"});
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/salaryConfigurator/createSalaryConfig`,
      { createData: configData },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if(response.data.status === "success") {
      lastApiCallRef.current=null;
      dispatch({
        type:"CREATE_SALARY_CONFIG_SUCCESS",
        payload: response.data.message
      })
      dispatch(getSalaryComponents(employeeType, employeeLocation, employeeLevel, department, yearOfStudy));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      })
    } else {
      dispatch({
        type: "CREATE_SALARY_CONFIG_FAILURE",
        payload: response.data.message,
      })  
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      })  
    }
  } catch (error) {
    dispatch({
      type: "CREATE_SALARY_CONFIG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    })
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    })
  }
}

export const updateSalaryConfig = (updateData, employeeType, employeeLocation, employeeLevel, department, yearOfStudy, lastApiCallRef) => async(dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({type:"UPDATE_SALARY_CONFIG"});
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/salaryConfigurator/updateSalaryConfig`,
      { editData: updateData },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if(response.data.status === "success") {
      lastApiCallRef.current=null;
      dispatch({
        type:"UPDATE_SALARY_CONFIG_SUCCESS",
        payload: response.data.message
      })
      dispatch(getSalaryComponents(employeeType, employeeLocation, employeeLevel, department, yearOfStudy));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      })
    } else {
      dispatch({
        type: "UPDATE_SALARY_CONFIG_FAILURE",
        payload: response.data.message,
      })  
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      })  
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_SALARY_CONFIG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    })
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    })
  }
}

export const deleteSalaryConfig = (deletedData, employeeType, employeeLocation, employeeLevel, department, yearOfStudy, lastApiCallRef) => async(dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({type:"DELETE_SALARY_CONFIG"});
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/salaryConfigurator/deleteSalaryConfig`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        data: {
          deletedData: deletedData
        }
      }
    );

    if(response.data.status === "success") {
      lastApiCallRef.current=null;
      dispatch({
        type:"DELETE_SALARY_CONFIG_SUCCESS",
        payload: response.data.message
      })
      dispatch(getSalaryComponents(employeeType, employeeLocation, employeeLevel, department, yearOfStudy));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      })
    } else {
      dispatch({
        type: "DELETE_SALARY_CONFIG_FAILURE",
        payload: response.data.message,
      })  
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      })  
    }
  } catch (error) {
    dispatch({
      type: "DELETE_SALARY_CONFIG_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    })
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    })
  }
}

// Payroll Api Actions
// Fetch all employee payroll details
export const getAllEmployeePayrollDetails = (currentPage, pageSize, selectedMonth, selectedYear, searchQuery) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({ type: "GET_ALL_EMPLOYEE_PAYROLL_REQUEST" });
  try {
    const baseUrl = `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/GetAllEmployeePayrollDetails`;
    const params = new URLSearchParams();
    if (currentPage) params.append("page", currentPage);
    if (pageSize) params.append("limit", pageSize);
    
    // Convert month name to month number (1-12)
    if (selectedMonth) {
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const monthNumber = monthNames.indexOf(selectedMonth) + 1;
      if (monthNumber > 0) {
        params.append("month", monthNumber);
      }
    }
    
    if (selectedYear) params.append("year", selectedYear);
    if (searchQuery) params.append("search", searchQuery);

    const response = await axios.get(`${baseUrl}?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (response.data.success) {
      dispatch({
        type: "GET_ALL_EMPLOYEE_PAYROLL_SUCCESS",
        payload: {
          data: response.data.data,
          pagination: response.data.pagination,
          isAllPayrollFinalized: response.data.isAllPayrollFinalized,
          isAllPayrollGenerated: response.data.isAllPayrollGenerated
        },
      });
    } else {
      dispatch({
        type: "GET_ALL_EMPLOYEE_PAYROLL_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Failed to fetch payroll details",
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ALL_EMPLOYEE_PAYROLL_FAILURE",
      payload: await getErrorMessage(error, "Failed to fetch payroll details"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to fetch payroll details"),
        severity: "error",
      },
    });
  }
}

// Update payroll component adjustments (additions/deductions)
export const updatePayrollItems = (employeeId, employeeName, payslipId, componentType, adjustments, getSalaryComponentsDataParams) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({ type: "UPDATE_PAYROLL_ITEMS_REQUEST" });
  const { 
      currentPage, 
      pageSize, 
      selectedMonth, 
      selectedYear, 
      searchQuery 
    } = getSalaryComponentsDataParams;
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/UpdatePayrollItems`,
      {
        employeeId,
        employeeName,
        payslipId,
        componentType,
        adjustments
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success) {
      dispatch({
        type: "UPDATE_PAYROLL_ITEMS_SUCCESS",
        payload: response.data.data,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || `${componentType === 'addition' ? 'Additions' : 'Deductions'} updated successfully`,
          severity: "success",
        },
      });
      // Refresh payroll data after update
      dispatch(getAllEmployeePayrollDetails(currentPage, pageSize, selectedMonth, selectedYear, searchQuery));
      return { success: true };
    } else {
      dispatch({
        type: "UPDATE_PAYROLL_ITEMS_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Failed to update payroll items",
          severity: "error",
        },
      });
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_PAYROLL_ITEMS_FAILURE",
      payload: await getErrorMessage(error, "Failed to update payroll items"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to update payroll items"),
        severity: "error",
      },
    });
    return { success: false, message: await getErrorMessage(error, "Failed to update payroll items") };
  }
}

// Finalize payroll for selected employees
export const finalizePayroll = (payslipIds, getSalaryComponentsDataParams) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const { 
      currentPage, 
      pageSize, 
      selectedMonth, 
      selectedYear, 
      searchQuery 
    } = getSalaryComponentsDataParams;
  dispatch({ type: "FINALIZE_PAYROLL_REQUEST" });
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/finalizePayslips`,
      {
        payslipIds
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success) {
      dispatch({
        type: "FINALIZE_PAYROLL_SUCCESS",
        payload: response.data.data,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Payroll finalized successfully",
          severity: "success",
        },
      });
      // Refresh payroll data after finalization
      dispatch(getAllEmployeePayrollDetails(currentPage, pageSize, selectedMonth, selectedYear, searchQuery));
      return { success: true };
    } else {
      dispatch({
        type: "FINALIZE_PAYROLL_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Failed to finalize payroll",
          severity: "error",
        },
      });
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    dispatch({
      type: "FINALIZE_PAYROLL_FAILURE",
      payload: await getErrorMessage(error, "Failed to finalize payroll"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to finalize payroll"),
        severity: "error",
      },
    });
    return { success: false, message: await getErrorMessage(error, "Failed to finalize payroll") };
  }
}

// Mark finalized payslips as pending for selected employees
export const markFinalizedPayslipsAsPending  = (payslipIds, getSalaryComponentsDataParams) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const { 
      currentPage, 
      pageSize, 
      selectedMonth, 
      selectedYear, 
      searchQuery 
    } = getSalaryComponentsDataParams;
  dispatch({ type: "MARK_PAYSLIPS_AS_PENDING_REQUEST" });
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/markPayslipsAsPending`,
      {
        payslipIds
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success) {
      dispatch({
        type: "MARK_PAYSLIPS_AS_PENDING_SUCCESS",
        payload: response.data.data,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Payslips marked as pending successfully",
          severity: "success",
        },
      });
      // Refresh payroll data after update
      dispatch(getAllEmployeePayrollDetails(currentPage, pageSize, selectedMonth, selectedYear, searchQuery));
      return { success: true };
    } else {
      dispatch({
        type: "MARK_PAYSLIPS_AS_PENDING_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Failed to mark payslips as pending",
          severity: "error",
        },
      });
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    dispatch({
      type: "MARK_PAYSLIPS_AS_PENDING_FAILURE",
      payload: await getErrorMessage(error, "Failed to mark payslips as pending"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to mark payslips as pending"),
        severity: "error",
      },
    });
    return { success: false, message: await getErrorMessage(error, "Failed to mark payslips as pending") };
  }
}

export const generatePayroll = (getSalaryComponentsDataParams) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({ type: "GENERATE_PAYROLL_REQUEST" });
  const { 
      currentPage, 
      pageSize, 
      selectedMonth, 
      selectedYear, 
      searchQuery
    } = getSalaryComponentsDataParams;
  const queryParams = new URLSearchParams();
    // Convert month name to month number (1-12)
  if (selectedMonth) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthNumber = monthNames.indexOf(selectedMonth) + 1;
    if (monthNumber > 0) {
      queryParams.append("month", monthNumber);
    }
  }
    
  if (selectedYear) queryParams.append("year", selectedYear);
  
  
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/generatePayroll?${queryParams.toString()}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success) {
      dispatch({
        type: "GENERATE_PAYROLL_SUCCESS",
        payload: response.data.data,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Payroll generated successfully",
          severity: "success",
        },
      });
      // Refresh payroll data after generation
      dispatch(getAllEmployeePayrollDetails(currentPage, pageSize, selectedMonth, selectedYear, searchQuery));
    } else {
      dispatch({
        type: "GENERATE_PAYROLL_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Failed to generate payroll",
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "GENERATE_PAYROLL_FAILURE",
      payload: await getErrorMessage(error, "Failed to generate payroll"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to generate payroll"),
        severity: "error",
      },
    });
  } 
}

export const getEmployeePayslips = (employeeId, year) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({ type: "GET_EMPLOYEE_PAYSLIPS_REQUEST" });
  try {
    const baseUrl = `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/fetchEmployeePayslipsForYear`;
    const params = new URLSearchParams();
    if (employeeId) params.append("employeeId", employeeId);
    if (year) params.append("year", year);

    const response = await axios.get(`${baseUrl}?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (response.data.success) {
      dispatch({
        type: "GET_EMPLOYEE_PAYSLIPS_SUCCESS",
        payload: response.data.data,
      });
    } else {
      dispatch({
        type: "GET_EMPLOYEE_PAYSLIPS_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message || "Failed to fetch payslips",
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_EMPLOYEE_PAYSLIPS_FAILURE",
      payload: await getErrorMessage(error, "Failed to fetch payslips"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to fetch payslips"),
        severity: "error",
      },
    });
  }
}

export const exportPayrollAsCsv = (selectedMonth, selectedYear) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({ type: "EXPORT_PAYROLL_CSV_REQUEST" });
  try {
    const baseUrl = `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/exportPayrollAsCSV`;
    const params = new URLSearchParams();
    if (selectedMonth) params.append("month", selectedMonth);
    if (selectedYear) params.append("year", selectedYear);

    const response = await axios.get(`${baseUrl}?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      responseType: "blob", // Important for file download
    });

    console.log(response.success)

    if (response.status === 200) {
      console.log(response)
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payroll_${selectedMonth || 'all_months'}_${selectedYear || 'all_years'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      dispatch({
        type: "EXPORT_PAYROLL_CSV_SUCCESS",
        payload: response.data.message || "Payroll CSV exported successfully",
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Payroll CSV exported successfully",
          severity: "success",
        },
      });
    } else {
      console.log(response)
      dispatch({
        type: "EXPORT_PAYROLL_CSV_FAILURE",
        payload: response?.data?.message || "Failed to export payroll CSV",
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Failed to export payroll CSV",
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "EXPORT_PAYROLL_CSV_FAILURE",
      payload: await getErrorMessage(error, "Failed to export payroll CSV"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to export payroll CSV"),
        severity: "error",
      },
    });
  }
}

export const downloadPayslipPdf = (payslipId) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({ type: "DOWNLOAD_PAYSLIP_PDF_REQUEST" });
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/downloadPayslip?payslipId=${payslipId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        responseType: "text", // Backend returns HTML
      }
    );

    if (response.status === 200) {
      // Import jsPDF and html2canvas dynamically
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      
      // Get suggested filename from response header
      const suggestedFilename = response.headers['x-filename'] || `payslip_${payslipId}.pdf`;
      
      // Create a temporary container to render HTML
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.innerHTML = response.data;
      document.body.appendChild(tempDiv);

      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF (handle multi-page if needed)
      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 297; // A4 height in mm

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF with suggested filename
      pdf.save(suggestedFilename);

      dispatch({
        type: "DOWNLOAD_PAYSLIP_PDF_SUCCESS",
        payload: "Payslip PDF downloaded successfully",
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "Payslip PDF downloaded successfully",
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "DOWNLOAD_PAYSLIP_PDF_FAILURE",
        payload: response?.data?.message || "Failed to download payslip PDF",
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response?.data?.message || "Failed to download payslip PDF",
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "DOWNLOAD_PAYSLIP_PDF_FAILURE",
      payload: await getErrorMessage(error, "Failed to download payslip PDF"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to download payslip PDF"),
        severity: "error",
      },
    });
  }
}

export const getNetPayPayrollAmount = (month, year) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch({ type: "GET_NET_PAY_PAYROLL_AMOUNT_REQUEST" });
  
  try {
    const baseUrl = `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/payroll/getNetPayAmount`;
    const params = new URLSearchParams();
    
    // Convert month name to month number if month is provided
    if (month) {
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const monthNumber = monthNames.indexOf(month) + 1;
      if (monthNumber > 0) {
        params.append("month", monthNumber);
      }
    }
    
    if (year) params.append("year", year);
    
    const response = await axios.get(`${baseUrl}?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (response.data.success) {
      dispatch({
        type: "GET_NET_PAY_PAYROLL_AMOUNT_SUCCESS",
        payload: response.data.netPayAmount,
      });
    } else {
      dispatch({
        type: "GET_NET_PAY_PAYROLL_AMOUNT_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_NET_PAY_PAYROLL_AMOUNT_FAILURE",
      payload: await getErrorMessage(error, "Failed to fetch net pay amount"),
    });
  } 
};
// Payroll filter actions
export const setPayrollMonth = (month) => (dispatch) => {
  dispatch({ type: "SET_PAYROLL_MONTH", payload: month });
};

export const setPayrollYear = (year) => (dispatch) => {
  dispatch({ type: "SET_PAYROLL_YEAR", payload: year });
};

export const setPayrollSortOption = (sortOption) => (dispatch) => {
  dispatch({ type: "SET_PAYROLL_SORT_OPTION", payload: sortOption });
};

export const setPayrollStatusFilter = (statusFilter) => (dispatch) => {
  dispatch({ type: "SET_PAYROLL_STATUS_FILTER", payload: statusFilter });
};

export const setPayrollSearchQuery = (searchQuery) => (dispatch) => {
  dispatch({ type: "SET_PAYROLL_SEARCH_QUERY", payload: searchQuery });
  // Reset to page 1 when search query changes
  dispatch({ type: "SET_PAYROLL_CURRENT_PAGE", payload: 1 });
};

export const resetPayrollFilters = () => (dispatch) => {
  dispatch({ type: "RESET_PAYROLL_FILTERS" });
};

export const setPayrollCurrentPage = (page) => (dispatch) => {
  dispatch({ type: "SET_PAYROLL_CURRENT_PAGE", payload: page });
};

// Payslip Filter Actions
export const setPayslipFilterMonth = (month) => (dispatch) => {
  console.log(month)
  dispatch({ type: "SET_PAYSLIP_FILTER_MONTH", payload: month });
};

export const setPayslipFilterYear = (year) => (dispatch) => {
  dispatch({ type: "SET_PAYSLIP_FILTER_YEAR", payload: year });
};

export const extraWorkLogRequest = (requestData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "EXTRA_WORK_LOG_REQUEST" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/extraWorkLogRequest`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "EXTRA_WORK_LOG_REQUEST_SUCCESS",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "EXTRA_WORK_LOG_REQUEST_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "EXTRA_WORK_LOG_REQUEST_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to submit extra work log request"),
        severity: "error",
      },
    });
  }
}

export const getExtraWorkLogRequests = (startDate, endDate) => async(dispatch)=> {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_EXTRA_WORK_LOG_REQUESTS" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/getExtraWorkLogRequests/?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_EXTRA_WORK_LOG_REQUESTS_SUCCESS",
        payload: response.data.workLogRequests,
      });
    } else {
      dispatch({
        type: "GET_EXTRA_WORK_LOG_REQUESTS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_EXTRA_WORK_LOG_REQUESTS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const updateExtraWorkLogRequestStatus = (requestIds, action, startDate, endDate) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "UPDATE_EXTRA_WORK_LOG_REQUEST_STATUS" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/updateExtraWorkLogRequestStatus`,
      { requestIds, action },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "UPDATE_EXTRA_WORK_LOG_REQUEST_STATUS_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getExtraWorkLogRequests(startDate, endDate));
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "UPDATE_EXTRA_WORK_LOG_REQUEST_STATUS_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_EXTRA_WORK_LOG_REQUEST_STATUS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "Failed to update request status"),
        severity: "error",
      },
    });
  }
}

export const getCompOffleaveBalance = (empUuid) => async(dispatch) => {
  if (!empUuid) return;
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_COMP_OFFLEAVE_BALANCE" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/getCompOffleaveBalance?empUuid=${empUuid}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_COMP_OFFLEAVE_BALANCE_SUCCESS",
        payload: response.data.compOffleaveBalance,
      });
    } else {
      dispatch({
        type: "GET_COMP_OFFLEAVE_BALANCE_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_COMP_OFFLEAVE_BALANCE_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getCompOffLeaveEligibility = (empUuid, startDate, endDate, isHalfDay) => async(dispatch) => {
  if (!empUuid || !startDate) return;
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_COMP_OFF_LEAVE_ELIGIBILITY" });
    const params = new URLSearchParams({
      empUuid,
      startDate,
      ...(endDate && { endDate }),
      ...(isHalfDay !== undefined && { isHalfDay: isHalfDay ? 'true' : 'false' })
    });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/empAttendanceManagement/${empUuid}/getCompOffLeaveEligibility?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_COMP_OFF_LEAVE_ELIGIBILITY_SUCCESS",
        payload: response.data.data,
      });
    } else {
      dispatch({
        type: "GET_COMP_OFF_LEAVE_ELIGIBILITY_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_COMP_OFF_LEAVE_ELIGIBILITY_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getAllRoles = () => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_ALL_ROLES" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/getAllRoles`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_ALL_ROLES_SUCCESS",
        payload: response.data.roles,
      });
    } else {
      dispatch({
        type: "GET_ALL_ROLES_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ALL_ROLES_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getAllHrmsAccessPermissions = () => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_ALL_HRMS_ACCESS_PERMISSIONS" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/permissions`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    ); 
    if (response.data.success) {
      dispatch({
        type: "GET_ALL_HRMS_ACCESS_PERMISSIONS_SUCCESS",
        payload: response.data.permissions,
      });
    } else {
      dispatch({
        type: "GET_ALL_HRMS_ACCESS_PERMISSIONS_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_ALL_HRMS_ACCESS_PERMISSIONS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const createHrmsRole = (roleData) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "CREATE_HRMS_ROLE" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/createRole`,
      roleData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "CREATE_HRMS_ROLE_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllRoles());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "CREATE_HRMS_ROLE_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
        type: "CREATE_HRMS_ROLE_FAILURE",
        payload: await getErrorMessage(error, "An error occurred"),
      });
    }
  }

export const getHrmsRoleById = (roleId) => async(dispatch) => {
  if (!roleId) return;
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_HRMS_ROLE_BY_ID" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/${roleId}/getRoleById`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_HRMS_ROLE_BY_ID_SUCCESS",
        payload: response.data.role,
      });
    } else {
      dispatch({
        type: "GET_HRMS_ROLE_BY_ID_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_HRMS_ROLE_BY_ID_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const updateHrmsRole = (roleId, roleData) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "UPDATE_HRMS_ROLE" });
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/${roleId}/updateRole`,
      roleData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "UPDATE_HRMS_ROLE_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllRoles());
      dispatch(getAllEmployee());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "UPDATE_HRMS_ROLE_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_HRMS_ROLE_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    });
  }
}

export const deleteHrmsRole = (roleId) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "DELETE_HRMS_ROLE" });
    const response = await axios.delete(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/${roleId}/deleteRole`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "DELETE_HRMS_ROLE_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllRoles());
      dispatch(getAllEmployee());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "DELETE_HRMS_ROLE_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "DELETE_HRMS_ROLE_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    });
  }
}

export const assignEmployeeRole = (empUuid, roleId) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "ASSIGN_EMPLOYEE_ROLE" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/assignEmployeeRole`,
      { empUuid, roleId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "ASSIGN_EMPLOYEE_ROLE_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllEmployee());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "ASSIGN_EMPLOYEE_ROLE_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "ASSIGN_EMPLOYEE_ROLE_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    });
  }
}

export const revokeEmployeeAccess = (empUuid) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "REVOKE_EMPLOYEE_ACCESS" });
    const response = await axios.delete(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/${empUuid}/revokeEmployeeAccess`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "REVOKE_EMPLOYEE_ACCESS_SUCCESS",
        payload: response.data.message,
      });
      dispatch(getAllEmployee());
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "success",
        },
      });
    } else {
      dispatch({
        type: "REVOKE_EMPLOYEE_ACCESS_FAILURE",
        payload: response.data.message,
      });
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: response.data.message,
          severity: "error",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "REVOKE_EMPLOYEE_ACCESS_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    });
  }
}

export const getEmployeeRoles = (empUuid) => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_EMPLOYEE_ROLES" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/${empUuid}/getEmployeeRoles`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_EMPLOYEE_ROLES_SUCCESS",
        payload: response.data.employeeRoles,
      });
    } else {
      dispatch({
        type: "GET_EMPLOYEE_ROLES_FAILURE",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "GET_EMPLOYEE_ROLES_FAILURE",
      payload: await getErrorMessage(error, "An error occurred"),
    });
  }
}

export const getMyHrmsAccess = () => async(dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "GET_MY_HRMS_ACCESS" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/hrms/access/myHrmsAccess`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      dispatch({
        type: "GET_MY_HRMS_ACCESS_SUCCESS",
        payload: response.data.myHrmsAccess,
      });
      return { success: true, data: response.data.myHrmsAccess };
    } else {
      dispatch({
        type: "GET_MY_HRMS_ACCESS_FAILURE",
        payload: response.data.message,
      });
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    const errorMessage = await getErrorMessage(error, "An error occurred");
    dispatch({
      type: "GET_MY_HRMS_ACCESS_FAILURE",
      payload: errorMessage,
    });
    return { success: false, message: errorMessage };
  }
}