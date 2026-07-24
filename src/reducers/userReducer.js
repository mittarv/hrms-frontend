import { createReducer } from "@reduxjs/toolkit";
import { setToken, clearAuth } from "../utils/authStorage";

const initialState = {
  loading: true,
  isAuthenticated: false,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase('GOOGLE_LOGIN_REQUEST', (state) => {
      state.loading = true;
    })
    .addCase('GOOGLE_LOGIN_SUCCESS', (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.redirectSubdomain = action.payload.redirectSubdomain;
      state.isGuest = action.payload.isGuest;
      setToken(action.payload.token);
    })
    .addCase('GOOGLE_LOGIN_FAIL', (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })
    .addCase('CLEAR_ERRORS', (state) => {
      state.error = null;
    })

    .addCase('CREATE_TMS_USER_REQUEST', (state) => {
      state.loading = true;
    })
    .addCase('CREATE_TMS_USER_SUCCESS', (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      setToken(action.payload.token);
    })
    .addCase('CREATE_TMS_USER_FAIL', (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })

    //load the user when the app loads
    .addCase('LOAD_USER_INFO_REQUEST', (state) => {
      state.loading = true;
    })
    .addCase('LOAD_USER_INFO_SUCCESS', (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.allToolsAccessDetails = action.payload.toolsAccess;
      if (action.payload.redirectSubdomain) {
        state.redirectSubdomain = action.payload.redirectSubdomain;
      }
    })
    .addCase('LOAD_USER_INFO_FAIL', (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })
    .addCase('UPDATE_USER_EMPLOYEE_UUID', (state, action) => {
      if (state.user) {
        state.user.employeeUuid = action.payload;
      }
    })

    .addCase('LOGOUT_USER', (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.redirectSubdomain = null;
      state.isGuest = false;
      clearAuth();
    });
});
