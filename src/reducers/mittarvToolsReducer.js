import { createReducer } from "@reduxjs/toolkit";
const initialState = {};

export const mittarvToolsReducer = createReducer(initialState , (builder) => {
  builder
    .addCase('FETCH_MITTARV_TOOLS', (state)=>{
        state.loading = true;
    })
    .addCase('FETCH_MITTARV_TOOLS_SUCCESS', (state, action)=>{
        state.loading = false;
        state.mittarvtools = action.payload.tools
    })
    .addCase('FETCH_MITTARV_TOOLS_FAILED', (state,action) => {
        state.loading = false;
        state.error = action.payload
    })

    .addCase('ADD_NEW_TOOL', (state) =>{
        state.loading = true;
    }) 
    .addCase('ADD_NEW_TOOL_SUCCESS', (state) =>{
        state.loading = false;
        state.success = true;
        state.addToolExecuted = true;
        
    })
    .addCase('ADD_NEW_TOOL_FAILED', (state ,action) =>{
        state.loading = false;
        state.addToolExecuted = true;
        state.error = action.payload
    })
    .addCase('ADD_NEW_TOOL_ERROR_NAME', (state, action) => {
        state.loading = false;
        state.toolwitherror = {error:true , message:action.payload}
        state.error = action.payload
    })

    .addCase('UPDATE_EXISTING_TOOL', (state) =>{
        state.loading = true;
    }) 
    .addCase('UPDATE_EXISTING_TOOL_SUCCESS', (state) =>{
        state.loading = false;
        state.success = true;
        state.updateToolExecuted = true;
        
    })
    .addCase('UPDATE_EXISTING_TOOL_FAILED', (state ,action) =>{
        state.loading = false;
        state.updateToolExecuted = true;
        state.error = action.payload
    })
    .addCase('UPDATE_EXISTING_TOOL_ERROR_NAME', (state, action) => {
        state.loading = false;
        state.toolwitherror = action.payload;
    })
    .addCase('DELETE_TOOL', (state) => {
        state.loading = true
    })
    .addCase('DELETE_TOOL_SUCCESS', (state) => {
        state.loading = false
        state.success = true
        state.deltoolExecuted = true;
        state.error = null;
    })
    .addCase('DELETE_TOOL_FAILED', (state, action) => {
        state.loading = false;
        state.success = false;
        state.deltoolExecuted = true;
        state.error = action.payload
    })

    .addCase('CHANGE_PAGE_TOOLS', (state)=>{
        state.deltoolExecuted = false;
        state.updateToolExecuted = false;
        state.addToolExecuted = false;
        state.toolwitherror = null;
        state.error  = null;
    })
    .addCase('CLEAR_ALL_ERRORS', (state) => {
        state.error = null;
        state.toolwitherror = null;
        state.deltoolExecuted = false;
        state.updateToolExecuted = false;
        state.addToolExecuted = false;
    })

    .addCase('SET_SELECTED_TOOL_NAME', (state,action) => {
        state.selectedToolName = action.payload;
    });
});