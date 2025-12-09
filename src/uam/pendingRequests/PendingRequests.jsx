import { useEffect, useState } from 'react'
import './pendingRequests.scss';
import PendingRequestsCards from './pendingRequestsCards/PendingRequestsCards';
import ActivityLog from './activityLog/ActivityLog';
import {useDispatch} from 'react-redux'
import { fetchPendingRequests } from '../../actions/requestsAction';
const PendingRequests = () => {
    const dispatch = useDispatch();
    const [toggleActivityLog, setToggleActivityLog] = useState(false);
    useEffect(()=>{
        dispatch(fetchPendingRequests());
    },[dispatch])
    return (
        <div>
            <div className="heading">
                <div className="left__options">
                    <button className={`left__options__buttons ${toggleActivityLog === false ? "":"disable"}`} onClick={()=>{setToggleActivityLog(false)}}>Pending Requests</button>
                    <button className={`left__options__buttons  ${toggleActivityLog === true ? "":"disable"}`} onClick={()=>{setToggleActivityLog(true)}}>Activity Logs</button>
                </div>
                <div className="right__options">

                </div>
            </div>

            <div className="pending_requests_content">
                {
                    toggleActivityLog === true?
                    <ActivityLog/> :
                    <PendingRequestsCards/>
                }

            </div>
        </div>
    )
}

export default PendingRequests
