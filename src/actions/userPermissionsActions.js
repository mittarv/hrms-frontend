import axios from "axios";
import store from "../store";


export const fetchUserPermissions = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  
  try {
    dispatch({ type: "FETCH_USER_PERMISSIONS" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/users/getall/tools`,
      
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "USER_PERMISSIONS_FETCH_SUCCESS",
        payload: response.data,
      });
    }
  } catch (error) {
    dispatch({
      type: "USER_PERMISSIONS_FETCH_FAILED",
      payload: error.response && error.response.data.message,
    });
  }
};

export const fetchAllTools = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  const { user } = store.getState().user;
  try {
    dispatch({ type: "FETCH_TOOLS" });
    const url = user.userType === 900 ? `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/getall`: `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/getall/${user.userId}` ;
    const response = await axios.get(
      url,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "TOOLS_FETCH_SUCCESS",
        payload: response.data,
      });
    }
  } catch (error) {
    dispatch({
      type: "TOOLS_FETCH_FAILED",
      payload: error.response && error.response.data.message,
    });
  }
};

//function to add a user to a specific tool
export const addUserToTool = (userArr) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const { user } = store.getState().user;
  try {
    dispatch({ type: "ADD_USER_TO_TOOL" });
    if (userArr.length === 0) {
      
      return dispatch({
        type: "ADD_USER_TO_TOOL_FAILED",
        payload: null, //marking it as null because it is not compoulsory to add user everytime, we are just using it to check if userArr is empty or not
      });

      
    }

    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/users/add`,
      {
        toolUserGroupList: userArr,
        updatedBy: user.userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "ADD_USER_TO_TOOL_SUCCESS",
      });
    }
  } catch (error) {
    
    dispatch({
      type: "ADD_USER_TO_TOOL_FAILED",
      payload: error.response && error.response.data.message,
    });
  }
};

//function to update a user's permissions for a specific tool
export const updateUserAndTool = (userArr) => async (dispatch) => {
  const token = localStorage.getItem("token");
  try {
    dispatch({ type: "UPDATE_USER_AND_TOOL" });

    if (userArr.length === 0) {
      dispatch({
        type: "UPDATE_USER_AND_TOOL_FAILED",
        payload: null, //marking it as null because it is not compoulsory to update user everytime, we are just using it to check if userArr is empty or not
      });
      return;
    }
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/users/update`,
      {
        userToolsList: userArr,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    console.log(response.data)

    if (response.data.success === true) {
      dispatch({
        type: "UPDATE_USER_AND_TOOL_SUCCESS",
      });
    }
  } catch (error) {
    dispatch({
      type: "UPDATE_USER_AND_TOOL_FAILED",
      payload: error.response && error.response.data.message,
    });
  }
};

//function to remove a user and their all permissions
export const deleteUserAndTool = (idArr) => async (dispatch) => {
  const token = localStorage.getItem("token");

  try {
    dispatch({ type: "DELETE_USER_AND_TOOL" });
    if (idArr.length === 0) {
      dispatch({
        type: "DELETE_USER_AND_TOOL_FAILED",
        payload: null,
      });
      return;
    }
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/users/delete/`,
      {
        userIds: idArr,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "DELETE_USER_AND_TOOL_SUCCESS",
      });
    }
  } catch (error) {
    dispatch({
      type: "DELETE_USER_AND_TOOL_FAILED",
      payload: error.response && error.response.data.message,
    });
  }
};


//function to create new user

export const createNewUser = (name , email) => async(dispatch)=> {
  const token = localStorage.getItem("token");

  try {
    dispatch({type:"CREATE_NEW_USER"});

    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/createUser`,
      {
        name:name,
        email:email
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    )

    if(response.data.success === true){
      const dataToAdd = {
        "user" : {
          "name":response.data.user.name,
          "email":response.data.user.email,
          "userId": response.data.user.userId,
        },
        "tools":[]
      }

      dispatch({
        type:"CREATE_NEW_USER_SUCCESS",
        payload:dataToAdd,
      })
    }else{
      dispatch({
        type:"CREATE_NEW_USER_FAILED",
        payload:response.data.message
      })
    }
  } catch (error) {
    dispatch({
      type:"CREATE_NEW_USER_FAILED",
      payload: error.response && error.response.data.message,
    })
  }
}