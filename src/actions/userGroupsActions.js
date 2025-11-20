import axios from "axios"
const token = localStorage.getItem("token");
export const fetchUserGroups = () => async (dispatch) => {
    try {
        
        dispatch({ type: "FETCH_USER_GROUPS" });
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/permissions/getall`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
            },
        })

        if (response.data.success === true) {
            
            dispatch({
                type: "USER_GROUPS_FETCHED_SUCCESS",
                payload: response.data
            })
        }
    } catch (error) {
        dispatch({
            type: "USER_GROUPS_FETCH_FAILED",
            payload: error.response && error.response.data.message,
        });
    }

}

export const AddUserGroups = (userGroupsArray) => async (dispatch) => {
    try {
       
        dispatch({ type: "ADD_USER_GROUPS" })

        if (userGroupsArray.length === 0) {
           
            dispatch({
                type: "ADD_USER_GROUPS_FAILED",
                payload: "Please add atleast on User group"
            })
            return;
        }

        for (let group of userGroupsArray) {
           
           
            if(!group.role.trim()){
                dispatch({
                    type:"ADD_USER_GROUPS_NAME_BLANK",
                    payload:group
                })
                return;
            }
        }

        for (let group of userGroupsArray) {
           
           
            if(group.view === false && group.modify === false && group.approver === false && group.addmembers === false){
               
                dispatch({
                    type:"ADD_USER_GROUPS_ACCESS_BLANK",
                    payload:group
                })
                return;
            }
        }

        const rowsToSendToApi = userGroupsArray.map(({ id, ...rest }) => rest);
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/permissions/add`,
            {
                userGroupsList: rowsToSendToApi 
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            }
        )

        if(response.data.success === true && response.data.groups !== null){
            dispatch({
                type:"ADD_USER_GROUPS_SUCCESS",
            })
        }

    } catch (error) {
        dispatch({
           type: "ADD_USER_GROUPS_FAILED",
           payload: error.response && error.response.data.message,

        })
    }
}

export const updateUserGroups = (userGroupsArray , userId) => async (dispatch) =>{
    try {
        
        dispatch({ type:"UPDATE_USER_GROUPS" })
        if (userGroupsArray.length === 0) {
            dispatch({
                type: "UPDATE_USER_GROUPS_FAILED",
                payload: "Please add atleast one User group"
            })
            return;
        }
        const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/permissions/update`,
            {
                updatedUserGroups: userGroupsArray,
                userId: userId
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            }
        )
        
        if(response.data.success === true && response.data.groups !== null){
            dispatch({
                type:"UPDATE_USER_GROUPS_SUCCESS",
            })
        }

    } catch (error) {
        dispatch({
           type: "UPDATE_USER_GROUPS_FAILED",
           payload: error.response && error.response.data.message,

        })
    }
}
export const deleteUserGroups = (userGroupsIds) => async (dispatch) =>{
    try {
        
       
        dispatch({ type:"DELETE_USER_GROUPS" })
        if (userGroupsIds.length === 0) {
            dispatch({
                type: "DELETE_USER_GROUPS_FAILED",
                payload: "Please add atleast on User group"
            })
            return;
        }
        const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/permissions/delete`,
            {
                userGroupIds:userGroupsIds,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            }
        )
        
        if(response.data.success === true && response.data.groups !== null){
            dispatch({
                type:"DELETE_USER_GROUPS_SUCCESS",
            })
        }

    } catch (error) {
        dispatch({
           type: "DELETE_USER_GROUPS_FAILED",
           payload: error.response && error.response.data.message,

        })
    }
}

export const clearErrorData = () =>(dispatch) =>{
    dispatch({type: 'CLEAR_USER_GROUP_ERRORS'})

}
export const allProcessExecuted = () => (dispatch)=>{
    dispatch({type:"ALL_PROCESS_EXECUTED"})  
}