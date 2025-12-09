import { createReducer } from "@reduxjs/toolkit";
const initialState = {};

export const userPermissionsReducer = createReducer(initialState, (builder) => {
    builder
    .addCase('FETCH_USER_PERMISSIONS', (state)=>{
        state.loading = true;

    })
    .addCase('USER_PERMISSIONS_FETCH_SUCCESS', (state,action)=>{
        state.loading = false;
        state.userPermissionsDataa = action.payload.userTools
    })
    .addCase('USER_PERMISSIONS_FETCH_FAILED', (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })
    
    //for the tools , will be moved to another reducer file while working on the tools screen
    .addCase('FETCH_TOOLS', (state)=>{
        state.loading = true;

    })
    .addCase('TOOLS_FETCH_SUCCESS', (state,action)=>{
        state.loading = false;
        state.tools = action.payload.tools
    })
    .addCase('TOOLS_FETCH_FAILED', (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })

    .addCase('ADD_USER_TO_TOOL', (state) => {
        state.adduserloading = true

    })

    // the **Executed values are used to check if the functions is executed or not
    .addCase('ADD_USER_TO_TOOL_SUCCESS', (state) => {
        state.adduserloading = false;
        state.success = true;
        state.addExecuted = true;       
    })
    .addCase('ADD_USER_TO_TOOL_FAILED', (state , action) => {
        state.adduserloading = false;
        state.success = false;
        state.addExecuted = true;
        state.error = action.payload;
    })
    .addCase('UPDATE_USER_AND_TOOL', (state) => {
        state.updateuserloading = true
    })
    .addCase('UPDATE_USER_AND_TOOL_SUCCESS', (state) => {
        state.updateuserloading = false;
        state.updateExecuted = true;
        state.success = true;
    })
    .addCase('UPDATE_USER_AND_TOOL_FAILED', (state , action) => {
        state.updateuserloading = false;
        state.success = false;
        state.updateExecuted = true;
        state.error = action.payload;
    })
    .addCase('DELETE_USER_AND_TOOL', (state) => {
        state.deluserloading= true
    })
    .addCase('DELETE_USER_AND_TOOL_SUCCESS', (state) => {
        state.deluserloading = false;
        state.deleteExecuted = true;
        state.success = true;
    })
    .addCase('DELETE_USER_AND_TOOL_FAILED', (state , action) => {
        state.deluserloading = false;
        state.success = false;    
        state.deleteExecuted = true;   
        state.error = action.payload;
    })
    .addCase('CREATE_NEW_USER', (state)=>{
        state.createnewuserloading = true;
    })
    .addCase('CREATE_NEW_USER_SUCCESS', (state, action)=>{
        state.createnewuserloading = false;
        state.newuserCreated = true;
        state.userPermissionsDataa = state.userPermissionsDataa.concat(action.payload);
        
    })
    .addCase('CREATE_NEW_USER_FAILED', (state, action)=>{
        state.createnewuserloading = false;
        state.error = action.payload;
        
    })
    .addCase('CHANGE_PAGE', (state)=>{
        state.deleteExecuted = false;
        state.updateExecuted = false;
        state.addExecuted = false;
    });
})