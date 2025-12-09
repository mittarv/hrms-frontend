import { createReducer } from "@reduxjs/toolkit";
const initialState = {};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase('GOOGLE_LOGIN_REQUEST', (state) => {
      state.loading = true;
    })
    .addCase('GOOGLE_LOGIN_SUCCESS', (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      //we don't need to store the userId in the local storage
      // localStorage.setItem("userId", action.payload.user.userId);
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
      // state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token);
      // localStorage.setItem("userId", action.payload.user.userId);
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
      state.allToolsAccessDetails = action.payload.toolsAccess
    })
    .addCase('LOAD_USER_INFO_FAIL', (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })

    .addCase('LOGOUT_USER', (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("token");
    });
});
