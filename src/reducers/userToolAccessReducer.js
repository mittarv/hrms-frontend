import { createReducer } from "@reduxjs/toolkit";
const initialState = {};

export const userToolAccessReducer = createReducer(initialState, (builder) => {
  builder
  .addCase('FETCH_TOOL_ACCESS', (state) => {
    state.loading = true;
  })
  .addCase('FETCH_TOOL_ACCESS_SUCCESS', (state, action) => {
    state.loading = false;
    state.havePermission = action.payload.havePermission;
    state.roleAndValue = action.payload.roleAndValue;
  })

  .addCase('FETCH_TOOL_ACCESS_FAIL', (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.havePermission = false;
    window.alert(state.action.payload);
  });
});
