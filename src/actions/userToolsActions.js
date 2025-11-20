import axios from "axios";
import store from "../store";

// const userId = localStorage.getItem("userId")

export const fetchUserTools = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  const { user } = store.getState().user;
  try {
    dispatch({ type: "FETCH_USER_TOOLS" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/users/get/${user.userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "FETCH_USER_TOOLS_SUCCESS",
        payload: response.data,
      });
    }
  } catch (error) {
    dispatch({
      type: "FETCH_USER_TOOLS_FAILED",
      payload: error.response && error.response.data.message,
    });
  }
};

//for requests

export const createRequest =
  (toolId, currentUserGroup, reqUserGroupId, remark) => async (dispatch) => {
    const token = localStorage.getItem("token");
    const { user } = store.getState().user;
    try {
      dispatch({ type: "CREATE_REQUEST" });

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/request/add`,
        {
          toolId: toolId,
          requestedBy: user.userId,
          remark: remark,
          requestedAccess: reqUserGroupId,
          currentAccess: currentUserGroup,
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
          type: "CREATE_REQUEST_SUCCESS",
        });
      }
    } catch (error) {
      dispatch({
        type: "CREATE_REQUEST_FAILED",
        payload: error.response && error.response.data.message,
      });
    }
  };

//function to ftech all the requests of the user (requests that are not approved yet)
export const fetchAllRequestsOfUser = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  const { user } = store.getState().user;
  try {
    dispatch({ type: "FETCH_REQUESTS_USER" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/request/get/userId/${user.userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.success === true) {
      dispatch({
        type: "FETCH_REQUESTS_USER_SUCCESS",
        payload: response.data,
      });
    }
  } catch (error) {
    dispatch({
      type: "FETCH_REQUESTS_USER_FAILED",
      payload: error.response && error.response.data.message,
    });
  }
};
