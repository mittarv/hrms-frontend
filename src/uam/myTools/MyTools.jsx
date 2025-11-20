
import { useCallback, useEffect } from 'react'
import '../../uam/myTools/MyTools.scss'
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useSelector } from "react-redux";
import { useState } from 'react';
import DialogBox from '../../components/popups/RequestAccessPopup';

import { fetchUserTools, fetchAllRequestsOfUser } from '../../actions/userToolsActions'
import { useDispatch } from 'react-redux';
import { tableStyle } from '../../constant/tableStyle'
import LeftToRightIcon from '../../assets/icons/leftToRightArrow.svg'
import { getToolAdminsOfSpecificTool } from '../../utills/getToolAdmins';
import { fetchUserPermissions } from '../../actions/userPermissionsActions';
const MyTools = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const { utloading, usertools, userrequests, otherTools } = useSelector((state) => state.usertools)
    const { loading } = useSelector((state) => state.userpermissions)

    // const [changeColor, setChangeColor] = useState(false);
    const { StyledTableRow, StyledTableCell, TableStyle, TableHeaderStyle } = tableStyle;




    // State variables for the dialog
    const [selectedToolData, setSelectedToolData] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);


    //fucntion to open the dialog
    const handleClickOpenDialog = (toolData) => {
        setSelectedToolData(toolData);
        setOpenDialog(true);
    };

    const fetchData = useCallback(() => {
        dispatch(fetchUserTools())
        dispatch(fetchAllRequestsOfUser())
        dispatch(fetchUserPermissions())
    }, [dispatch])

    //function to close the dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedToolData(null);
        //to clear all the temp data present in the state or data previously required for closing the dialog
        dispatch({
            type: "ERASE_ALL_TEMP_DATA"
        })
        //to get reloaded data after clsong the dropdown
        dispatch(fetchUserTools())
        dispatch(fetchAllRequestsOfUser())

    };

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <>
            {
                loading === true || utloading === true ? <div className="loader">Loading......</div> :
                    <div>
                        <div className='welcome_div'>
                            <h1 id='welcome_Text'>
                                Welcome,  {user.name}
                            </h1>
                            <p>
                                Here you can see the tools available to you
                            </p>
                        </div>
                        <TableContainer style={TableStyle}>
                            <Table>
                                <TableHead >
                                    <TableRow >
                                        <StyledTableCell align='left' style={TableHeaderStyle}>Tools </StyledTableCell>
                                        <StyledTableCell align='left' style={TableHeaderStyle}>Tool Admin </StyledTableCell>
                                        <StyledTableCell align='left' style={TableHeaderStyle}>Tool description</StyledTableCell>
                                        <StyledTableCell align='left' style={TableHeaderStyle}>My Access</StyledTableCell>
                                        <StyledTableCell align='left' style={TableHeaderStyle}></StyledTableCell>
                                    </TableRow>

                                </TableHead>
                                <TableBody>
                                    {
                                        usertools?.map((item) => {
                                            const toolPresentinRequests = userrequests?.find((request) => request.toolId === item.tool?.toolId);
                                            return <StyledTableRow
                                                key={item.tool?.toolId}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0, color: "#525252" } }}
                                            >
                                                <TableCell component="th" scope="row" >
                                                    <p className='tableCell_name_tool'>{item.tool.name}</p>

                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        getToolAdminsOfSpecificTool(item.tool?.toolId).length === 0 ? "No admins yet" :
                                                            getToolAdminsOfSpecificTool(item.tool?.toolId)?.map((admin, index, arr) => {
                                                                return `${admin.name} ${!arr[index + 1] ? "" : ","}`
                                                            })

                                                        // tool.admin === null ? "No Admin Yet":tool?.admin.name
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {item.tool?.description}
                                                </TableCell>
                                                {
                                                    toolPresentinRequests ?
                                                        <TableCell><div id='pending_viewer'>{item.userGroup?.role} <img src={LeftToRightIcon} alt="" /> {userrequests?.find((request) => request.toolId === item.tool.toolId)?.requestedAccessGroup?.role} </div></TableCell> :
                                                        <TableCell><div id='access_viewer'>{item.userGroup?.role}</div></TableCell>
                                                }
                                                {/* <TableCell><div id='access_viewer'>{item.userGroup.role}</div></TableCell> */}
                                                <TableCell>
                                                    {
                                                        toolPresentinRequests ? <Button
                                                            id={'Action_button_pending'}
                                                            disabled={true}
                                                        >
                                                            <p>Pending</p>
                                                        </Button> :
                                                            <Button
                                                                id={'Action_button'}
                                                                onClick={() => handleClickOpenDialog(item)}
                                                            >
                                                                <p>Request &#8599;</p>
                                                            </Button>
                                                    }

                                                </TableCell>


                                            </StyledTableRow>


                                        })
                                    }
                                    {
                                        otherTools?.map((item) => {
                                            const toolPresentinRequests = userrequests?.find((request) => request.toolId === item.tool?.toolId);
                                            return <StyledTableRow
                                                key={item.tool?.toolId}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0, color: "#525252" } }}
                                            >
                                                <TableCell component="th" scope="row" >
                                                    <p className='tableCell_name_tool'>{item.tool.name}</p>

                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        getToolAdminsOfSpecificTool(item.tool?.toolId).length === 0 ? "No admins yet" :
                                                            getToolAdminsOfSpecificTool(item.tool?.toolId)?.map((admin, index, arr) => {
                                                                return `${admin.name} ${!arr[index + 1] ? "" : ","}`
                                                            })

                                                        // tool.admin === null ? "No Admin Yet":tool?.admin.name
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {item.tool?.description}
                                                </TableCell>
                                                {
                                                    toolPresentinRequests ?
                                                        <TableCell><div id='pending_viewer'>{item.userGroup?.role} <img src={LeftToRightIcon} alt="" /> {userrequests?.find((request) => request.toolId === item.tool.toolId)?.requestedAccessGroup?.role} </div></TableCell> :
                                                        <TableCell><div id='access_viewer'>{item.userGroup?.role}</div></TableCell>
                                                }
                                                {/* <TableCell><div id='access_viewer'>{item.userGroup.role}</div></TableCell> */}
                                                <TableCell>
                                                    {
                                                        toolPresentinRequests ? <Button
                                                            id={'Action_button_pending'}
                                                            disabled={true}
                                                        >
                                                            <p>Pending</p>
                                                        </Button> :
                                                            <Button
                                                                id={'Action_button'}
                                                                onClick={() => handleClickOpenDialog(item)}
                                                            >
                                                                <p>Request &#8599;</p>
                                                            </Button>
                                                    }

                                                </TableCell>


                                            </StyledTableRow>


                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {selectedToolData && (
                            <DialogBox
                                open={openDialog}
                                handleClose={handleCloseDialog}
                                selectedTool={selectedToolData}

                            />
                        )}
                    </div>

            }

        </>

    )
}

export default MyTools