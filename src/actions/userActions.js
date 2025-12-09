import axios from "axios";
import { checkEmailType } from "../utills/emailHelper";

export const googleLogin = (email, name, profilePic) => async (dispatch) => {
  try {
    dispatch({ type: "GOOGLE_LOGIN_REQUEST" });
    if (!checkEmailType(email)) {
      window.location.reload();
      return window.alert("Please use your Mittarv email to login");
    } else {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/login`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success === true && response.data.user !== null) {
        dispatch({
          type: "GOOGLE_LOGIN_SUCCESS",
          payload: response.data,
        });
        dispatch(loadUserInfo());
      }
    }
  } catch (error) {
    dispatch(createTmsUser(email, name, profilePic));
    dispatch({
      type: "GOOGLE_LOGIN_FAIL",
      payload: error.response && error.response.data.message,
    });
  }
};

export const createTmsUser = (email, name, profilePic) => async (dispatch) => {
  try {
    dispatch({ type: "CREATE_TMS_USER_REQUEST" });
    if (!checkEmailType(email)) {
      window.location.reload();
      return window.alert("Please use your Mittarv email to login");
    }
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/add`,
      { email, name, profilePic },
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
    } else {
      dispatch({
        type: "CREATE_TMS_USER_FAIL",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "CREATE_TMS_USER_FAIL",
      payload: error.response && error.response.data.message,
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
    } else {
      dispatch({
        type: "LOAD_USER_INFO_FAIL",
        payload: response.data.message,
      });
    }
  } catch (error) {
    dispatch({
      type: "LOAD_USER_INFO_FAIL",
      payload: error.response && error.response.data.message,
    });
  }
};
