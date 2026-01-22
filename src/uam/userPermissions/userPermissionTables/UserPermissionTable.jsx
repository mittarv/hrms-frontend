
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { EditTable } from '../../../components/editTable_userPermission/EditTable'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPermissions, fetchAllTools } from '../../../actions/userPermissionsActions'
import { useCallback } from 'react';
import { useEffect } from 'react';
import { fetchUserGroups } from '../../../actions/userGroupsActions';
import {tableStyle} from '../../../constant/tableStyle'


export const UserPermissionTable = ({ isEdit, toggleOptions }) => {
    const {StyledTableRow ,StyledTableCell,TableStyle , TableHeaderStyle} = tableStyle;
    // **** 
    // /toggleOptions is a function to toggle between the editable and non editable table pages, here it will be used to redirect to editable page after saving the changes, it's created inside the Userpermission.jsx file and then transfered using props, it will also passed to the EditTable.jsx as props for the toggle operation
    //

    const dispatch = useDispatch();
    // ftechdata is to fetch all the data required for table like tools, users and the user groups

    const fetchData = useCallback(() => {
        dispatch(fetchAllTools());
        dispatch(fetchUserPermissions());
        dispatch(fetchUserGroups())

    }, [dispatch])

    useEffect(() => {
        fetchData();
    }, [fetchData])

    const { loading, tools, userPermissionsDataa } = useSelector((state) => state.userpermissions)


    
    return (
        <>
            <EditTable isEdit={isEdit} toggleOptions={toggleOptions} /> 
            {
                loading === true ?
                    <div className="loader">Loading......</div>
                    :

                    <TableContainer style={TableStyle}>
                        <Table aria-label="simple table" >
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell style={TableHeaderStyle}>UserName</StyledTableCell>
                                    <StyledTableCell style={TableHeaderStyle}>Email</StyledTableCell>
                                    {
                                        tools?.map((tool) => {
                                            return <StyledTableCell key={tool.toolId} align="left" style={TableHeaderStyle}>{tool.name}</StyledTableCell>
                                        })
                                    }

                                    {/* <StyledTableCell align="center" style={TableHeaderStyle}>Tool 4</StyledTableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userPermissionsDataa?.map((row) => (
                                    <StyledTableRow
                                        key={row.user.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" style={{ fontSize: '16px', color: '#033348', fontWeight: '400', }}>
                                            {row.user.name}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ fontSize: '16px', color: '#033348', fontWeight: '400', }}>
                                            {row.user.email}
                                        </TableCell>

                                        {
                                            tools?.map((tool) => {
                                                const matchingTool = row.tools.find((t) => t?.tool?.toolId === tool.toolId);

                                                if (matchingTool) {
                                                    return (
                                                        <TableCell align="left" key={tool.toolId}>
                                                            {matchingTool.userGroup?.role}
                                                        </TableCell>
                                                    );
                                                } else {
                                                    return <TableCell align="left" key={tool.toolId}>No Access</TableCell>;
                                                }

                                            })
                                        }


                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
            }
        </>
    )

}