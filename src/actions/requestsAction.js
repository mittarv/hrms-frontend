import axios from 'axios';
import store from '../store'

export const fetchPendingRequests = () => async (dispatch) => {
    const token = localStorage.getItem("token");
    // const { user } = store.getState().user;
    try {
        dispatch({ type: "FETCH_ALL_REQUESTS" });

        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/request/getall/logs`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            })
            console.log('API Response:', response.data)
        if(response.data.success === true){
            console.log('Activity Logs:', response.data.activityLogs)
            console.log('Data:', response.data.data)
            // Use data array if it exists, otherwise fallback to activityLogs
            const payload = response.data.data || response.data.activityLogs || [];
            dispatch({
                type:"FETCH_ALL_REQUESTS_SUCCESS",
                payload: payload
            })
        }
    } catch (error) {
        dispatch({
            type: "FETCH_ALL_REQUESTS_FAILED",
            payload: error.response && error.response.data.message,
          });
    }
}

export const changeRequestStatus = (request , status) => async(dispatch) =>{
    const token = localStorage.getItem("token")
    const {user} = store.getState().user;
    console.log("Calling")
    try {
        dispatch({type:"CHANGE_REQUEST_STATUS"});

        const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/uam/request/update/${request.id}`,
        {
            status:status,
            resolvedBy:user.userId
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
                type:"CHANGE_REQUEST_STATUS_SUCCESS",
            })
            alert(`Request ${status} successfully`)
            dispatch(fetchPendingRequests())
        }

    } catch (error) {
        dispatch({
            type: "CHANGE_REQUEST_STATUS_FAILED",
            payload: error.response && error.response.data.message,
          });
    }
}