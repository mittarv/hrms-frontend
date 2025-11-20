import { createReducer } from "@reduxjs/toolkit";
const initialState = {};

export const userToolsReducer = createReducer(initialState , (builder) => {
    builder
    .addCase('FETCH_USER_TOOLS', (state)=>{
        state.utloading = true;
    })
    .addCase('FETCH_USER_TOOLS_SUCCESS', (state, action)=>{
        state.utloading = false;
        state.usertools = action.payload.userTools
        state.otherTools = action.payload.othertools
    })
    .addCase('FETCH_USER_TOOLS_FAILED', (state,action) => {
        state.utloading = false;
        state.error = action.payload
    })


    // for requests
    .addCase('CREATE_REQUEST', (state)=>{
        state.loading = true;
    })
    .addCase('CREATE_REQUEST_SUCCESS', (state) => {
        state.loading = false;
        state.requestExecuted = true;
    })
    .addCase('CREATE_REQUEST_FAILED', (state,action) => {
        state.loading = false;
        state.requestExecuted = true;
        state.error = action.payload
    })


    .addCase('FETCH_REQUESTS_USER', (state) => {
        state.loading = true;
    })
    .addCase('FETCH_REQUESTS_USER_SUCCESS', (state , action)=> {
        state.loading = false;
        state.userrequests = action.payload.requests;
    })
    .addCase('FETCH_REQUESTS_USER_FAILED', (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })

    .addCase('ERASE_ALL_TEMP_DATA', (state) => {  //created to remove all the temporary data from state that are to be used only once
        state.requestExecuted = null;
        state.error = null
    })



    

})