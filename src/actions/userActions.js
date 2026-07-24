import axios from "axios";
import { getMyHrmsAccess } from "./hrRepositoryAction";
import { getToken, clearAuth } from "../utils/authStorage";
import { getRootHost } from "../utils/domainUtils";

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

export const googleLogin = (token) => async (dispatch) => {
  try {
    dispatch({ type: "GOOGLE_LOGIN_REQUEST" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/login`,
      { token },
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

      // Redirect to org subdomain if we're not already on it
      const { redirectSubdomain } = response.data;
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);

      if (redirectSubdomain && !isLocalhost && !hostname.startsWith(`${redirectSubdomain}.`)) {
        const protocol = window.location.protocol;
        const rootHost = getRootHost();
        window.location.href = `${protocol}//${redirectSubdomain}.${rootHost}/`;
        return;
      }

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

export const logoutUser = () => async (dispatch) => {
  try {
    const token = getToken();
    if (token) {
      // Notify backend to revoke/invalidate auth token
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/v1/user/logout`,
        { authToken: token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ).catch(() => {});
    }
  } catch {
    // Ignore backend unreachable errors to guarantee frontend logout
  } finally {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    dispatch({ type: "LOGOUT_USER" });
    window.location.replace("/login");
  }
};

export const createTmsUser = (token) => async (dispatch) => {
  try {
    dispatch({ type: "CREATE_TMS_USER_REQUEST" });
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/add`,
      { token },
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
    const token = getToken();
    if (!token) {
      dispatch({ type: "LOAD_USER_INFO_FAIL", payload: "No token" });
      return;
    }
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
      clearAuth();
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
