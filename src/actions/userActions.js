import axios from "axios";
import { getMyHrmsAccess } from "./hrRepositoryAction";

const getErrorMessage = async (error, defaultMessage) => {
  if (error.response) {
    if (error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const jsonData = JSON.parse(text);
        return jsonData.message || defaultMessage;
      } catch {
        return defaultMessage;
      }
    }
    return error.response.data?.message || defaultMessage;
  }
  return error.message || defaultMessage;
};

export const googleLogin = (code) => async (dispatch) => {
  try {
    dispatch({ type: "GOOGLE_LOGIN_REQUEST" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/login`,
      { code },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.success === true) {
      dispatch({
        type: "GOOGLE_LOGIN_SUCCESS",
        payload: response.data,
      });
      dispatch(loadUserInfo());
      dispatch(getMyHrmsAccess());
    } else {
      dispatch({
        type: "GOOGLE_LOGIN_FAIL",
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
      type: "GOOGLE_LOGIN_FAIL",
      payload: error.response && error.response.data.message,
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    });
  }
};

export const createTmsUser = (code) => async (dispatch) => {
  try {
    dispatch({ type: "CREATE_TMS_USER_REQUEST" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/add`,
      { code },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.success === true) {
      dispatch({
        type: "CREATE_TMS_USER_SUCCESS",
        payload: response.data,
      });
      dispatch(loadUserInfo());
      dispatch(getMyHrmsAccess());
    } else {
      dispatch({
        type: "CREATE_TMS_USER_FAIL",
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
      type: "CREATE_TMS_USER_FAIL",
      payload: error.response && error.response.data.message,
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    });
  }
};

export const loadUserInfo = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    dispatch({ type: "LOAD_USER_INFO_REQUEST" });
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/get`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.data.success === true) {
      dispatch({
        type: "LOAD_USER_INFO_SUCCESS",
        payload: response.data.user,
      });
      dispatch(getMyHrmsAccess());
    } else {
      dispatch({
        type: "LOAD_USER_INFO_FAIL",
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
    if (error.response?.status === 403) {
      localStorage.removeItem("token");
    }
    dispatch({
      type: "LOAD_USER_INFO_FAIL",
      payload: error.response?.data?.message,
    });
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: await getErrorMessage(error, "An error occurred"),
        severity: "error",
      },
    });
  }
};
