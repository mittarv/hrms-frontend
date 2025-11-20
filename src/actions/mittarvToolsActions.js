import axios from "axios";
import store from "../store";

// const userId = localStorage.getItem("userId")
// const user = decodeUserInfo(token);

export const fetchAllTools = () => async (dispatch) => {
    
    const token = localStorage.getItem("token");
    try {
        dispatch({ type: "FETCH_MITTARV_TOOLS" })
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/getall`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
            },
        })

        if (response.data.success === true) {
            dispatch({
                type: "FETCH_MITTARV_TOOLS_SUCCESS",
                payload: response.data
            })
        } else {
            dispatch({
                type: "FETCH_MITTARV_TOOLS_FAILED",
                payload: response.data
            })
        }
    } catch (error) {
        dispatch({
            type: "FETCH_MITTARV_TOOLS_FAILED",
            payload: error.response && error.response.data.message
        })
    }
}

export const addNewTool = (toolsArray) => async (dispatch) => {
    const { user } = store.getState().user;
    const token = localStorage.getItem("token");
    try {
        dispatch({type:"ADD_NEW_TOOL"});
        if(toolsArray.length === 0){

            dispatch({
                type:"ADD_NEW_TOOL_FAILED",
                payload:null
            })

            return;
        }

        for( let tool of toolsArray) {
            
            if(tool.name === '' ){
                dispatch({
                    type:"ADD_NEW_TOOL_ERROR_NAME",
                    payload: "Please provide a name"

                })
                return;
            }
            if(tool.description === ''){
                dispatch({
                    type:"ADD_NEW_TOOL_ERROR_NAME",
                    payload: "Please provide a description"

                })
                return;
            }

            if(tool.link === ''){
                dispatch({
                    type:"ADD_NEW_TOOL_ERROR_NAME",
                    payload: "Please provide a link"

                })
                return;
            }
        }
        
        const toolsWithoutID = toolsArray.map(({id , ...rest})=> rest)
       
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/add`,
        {
            toolsArray:toolsWithoutID ,
            updatedBy:user.userId
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
            },
        }

        )

        

        if(response.data.success === true){
            alert(response.data.message);
            dispatch({
                type:"ADD_NEW_TOOL_SUCCESS",
            })
            
        }else{
            dispatch({
                type:"ADD_NEW_TOOL_FAILED",
                payload:response.data
            })
           
        }
        
    } catch (error) {
        dispatch({
            type: "ADD_NEW_TOOL_FAILED",
            payload: error.response && error.response.data.message,
 
         })
    }
}

export const updateExistingTool = (toolsArray) => async (dispatch) => {
    const { user } = store.getState().user;
    const token = localStorage.getItem("token");
    try {
       
        dispatch({type:"UPDATE_EXISTING_TOOL"});
        if(toolsArray.length === 0){
            dispatch({
                type:"UPDATE_EXISTING_TOOL_FAILED",
                payload:null
            })
            return;
        }

        for( let tool of toolsArray) {
            
            if(tool.name === '' ){
                dispatch({
                    type:"ADD_NEW_TOOL_ERROR_NAME",
                    payload: "Please provide a name"

                })
                return;
            }
            if(tool.description === ''){
                dispatch({
                    type:"ADD_NEW_TOOL_ERROR_NAME",
                    payload: "Please provide a description"

                })
                return;
            }

            if(tool.link === ''){
                dispatch({
                    type:"ADD_NEW_TOOL_ERROR_NAME",
                    payload: "Please provide a link"

                })
                return;
            }
        }

        
        
        const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/update`,
        {
            updatedToolDetails:toolsArray,
            updatedBy:user.userId
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
            },
        }

        )

       

        if(response.data.success === true){
            dispatch({
                type:"UPDATE_EXISTING_TOOL_SUCCESS",
            })
            return alert(response.data.message);
        }else{
            dispatch({
                type:"UPDATE_EXISTING_TOOL_FAILED",
                payload:response.data
            })
        
        }
        
    } catch (error) {
        dispatch({
            type: "UPDATE_EXISTING_TOOL_FAILED",
            payload: error.response && error.response.data.message,
 
         })
    }
}


export const deleteTools = (toolIds) => async (dispatch) =>{
    
    const token = localStorage.getItem("token");
    try {
        
       
        dispatch({ type:"DELETE_TOOL" })
        if (toolIds.length === 0) {
            dispatch({
                type: "DELETE_TOOL_FAILED",
                payload: null
            })
            return;
        }
        const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/tools/delete`,
            {
                toolIds:toolIds,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            }
        )
        
        if(response.data.success === true){
            alert(response.data.message);
            dispatch({
                type:"DELETE_TOOL_SUCCESS",
            })
            return;
        }

    } catch (error) {
        dispatch({
           type: "DELETE_TOOL_FAILED",
           payload: error.response && error.response.data.message,

        })
    }
}

export const clearTempandErrorData = () => async (dispatch) => {
    dispatch({type:"CLEAR_ALL_ERRORS"})
}