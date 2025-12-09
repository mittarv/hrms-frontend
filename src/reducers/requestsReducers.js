import {createReducer} from '@reduxjs/toolkit';
const initialState = {};

export const requestsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase('FETCH_ALL_REQUESTS', (state) => {
            state.loading = true;
        })
        .addCase('FETCH_ALL_REQUESTS_SUCCESS', (state, action) => {
            state.loading = false;
            state.pendingRequests = action.payload;
        })
        .addCase('FETCH_ALL_REQUESTS_FAILED', (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase('CHANGE_REQUEST_STATUS', (state) => {
            state.statusChangeLoading = true;
        })
        .addCase('CHANGE_REQUEST_STATUS_SUCCESS', (state) => {
            state.statusChangeLoading = false;
        })
        .addCase('CHANGE_REQUEST_STATUS_FAILED', (state) => {
            state.statusChangeLoading = false;
        });
});