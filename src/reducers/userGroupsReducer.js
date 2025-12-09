import { createReducer } from "@reduxjs/toolkit";
const initialState = {};

export const userGroupsReducer = createReducer(initialState, (builder) => {
    builder
    .addCase('FETCH_USER_GROUPS', (state) => {
        state.loading = true;
    })
    .addCase('USER_GROUPS_FETCHED_SUCCESS', (state, action) => {
        state.loading = false;
        state.userGroupsData = action.payload.groups
    })
    .addCase('USER_GROUPS_FETCH_FAILED', (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })
    .addCase('ADD_USER_GROUPS', (state) => {
        state.addgrouploading = true
    })
    .addCase('ADD_USER_GROUPS_SUCCESS', (state) => {
        state.addgrouploading = false
        state.success = true
        state.addgroupExecuted = true;
        state.error = null;
    })
    .addCase('ADD_USER_GROUPS_FAILED', (state, action) => {
        state.addgrouploading = false;
        state.success = false;
        state.addgroupExecuted = true;
        state.error = action.payload
    })
    .addCase('ADD_USER_GROUPS_NAME_BLANK',(state ,action) => {
        state.loading = false;
        state.success = false
        state.rowError = {blank:"role", message:"Please Provide a name for the User Group"}
        state.rowId = action.payload.id
    })
    .addCase('CLEAR_USER_GROUP_ERRORS',(state) => {
        state.loading = false;
        state.rowError = undefined;
        state.rowId = null
        state.error = null
        state.done = false;
    })
    .addCase('ADD_USER_GROUPS_ACCESS_BLANK', (state ,action) => {
        state.loading = false;
        state.success = false
        state.rowError = {blank:"access", message:"Please Provide at least One Level of Access"}
        state.rowId = action.payload.id
    })
    .addCase('UPDATE_USER_GROUPS', (state) => {
        state.loading = true
    })
    .addCase('UPDATE_USER_GROUPS_SUCCESS', (state) => {
        state.loading = false
        state.success = true
        state.updategroupExecuted = true;
        state.error = null;
    })
    .addCase('UPDATE_USER_GROUPS_FAILED', (state, action) => {
        state.loading = false;
        state.success = false;
        state.updategroupExecuted = true;
        state.error = action.payload
    })
    .addCase('DELETE_USER_GROUPS', (state) => {
        state.loading = true
    })
    .addCase('DELETE_USER_GROUPS_SUCCESS', (state) => {
        state.loading = false
        state.success = true
        state.delgroupExecuted = true;
        state.error = null;
    })
    .addCase('DELETE_USER_GROUPS_FAILED', (state, action) => {
        state.loading = false;
        state.success = false;
        state.delgroupExecuted = true;
        state.error = action.payload
    })
    .addCase('ALL_PROCESS_EXECUTED', (state) => {     //to check if all the save changes operations are perofrmed or not , then we can switch the page
        state.done = true;
    })
    .addCase('CHANGE_PAGE', (state) => {
        state.delgroupExecuted = false;
        state.updategroupExecuted = false;
        state.addgroupExecuted = false;
    })
})