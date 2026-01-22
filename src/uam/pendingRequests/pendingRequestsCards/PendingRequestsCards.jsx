import React, { useState } from 'react'
import './pendingRequestsCards.scss'
import { Avatar } from '@mui/material'
import LongArrow from '../../../assets/icons/long_arrow.svg'
import DownArrow from '../../../assets/icons/down-arrow.svg'
import TickIcon from '../../../assets/icons/tick_icon.svg'
import CloseIcon from '../../../assets/icons/close_icon.svg'
import { useSelector,useDispatch } from 'react-redux'
import { convertNormalDate } from '../../../utills/convertDate'
import { changeRequestStatus } from '../../../actions/requestsAction'
const PendingRequestsCards = () => {
    const {pendingRequests} = useSelector((state) => state.requestsReducer);

    

    return (
        <div className='pending_requests_cards'>
            {
                pendingRequests?.filter((req) => req.approvalStatus === "PENDING").map((req) =>{
                    return <Card cardData = {req}/>
                })
            }
            {/* <Card />
            <Card />
            <Card />
            <Card /> */}
        </div>
    )
}

const Card = ({cardData}) => {
    const dispatch = useDispatch();
    const [extendRemark, setExtendRemark] = useState(true);

    // Debug logging
    console.log('Card data:', cardData);
    console.log('RequestedAt:', cardData.requestedAt);
    console.log('User:', cardData.user);

    return (
        <div className="pr_card">
            <div className="pr_card_header">
                <div className="pr_card_header_left">
                    <Avatar src={cardData.user?.profilePic} />
                    <p className="user_name">{cardData.user?.name} </p>
                </div>
                <div className="pr_card_header_right">
                    <p className="timer_text">{cardData.requestedAt ? convertNormalDate(cardData.requestedAt) : "N/A"}</p>
                </div>
            </div>

            <div className="pr_card_body">
                <div className="request_section">
                    <p>Request</p>
                    <div className="access_request">
                        <p className="access">{cardData?.currentAccessGroup?.role} access</p>
                        <img src={LongArrow} alt="" />
                        <p className="access">{cardData?.requestedAccessGroup?.role} access</p>
                    </div>
                </div>
                <div className="tool_name_section">
                    <p>{cardData?.tool?.name}</p>
                    <div className="tool_description">
                        <p className="description">{cardData?.tool?.description}</p>
                    </div>
                </div>
                <div className="tool_remark_section">
                    <div className="remark_toggle">
                        <p>Remark</p>
                        <img src={DownArrow} alt="" className={`${extendRemark === true ? "closed" : ""}`} onClick={() => { setExtendRemark(!extendRemark) }} />
                    </div>
                    {
                        extendRemark === true ?
                            <div className="tool_remark">
                                <p className="description">{cardData?.remark}</p>

                            </div>
                            : <></>
                    }


                </div>
            </div>

            <div className="pr_card_footer">
                <button className="accept_button" onClick={()=>{dispatch(changeRequestStatus(cardData , "approved"))}}> <img src={TickIcon} alt=""  />Accept</button>
                <button className="reject_button" onClick={()=>{dispatch(changeRequestStatus(cardData , "rejected"))}}> <img src={CloseIcon} alt="" />Reject</button>
            </div>
        </div>
    )
}

export default PendingRequestsCards
