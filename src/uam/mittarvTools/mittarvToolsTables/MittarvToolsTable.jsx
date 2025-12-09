import { useEffect } from 'react'
import './mittarvToolsTable.scss'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TableHeader } from '../../../components/tableHeader_MittarvTools/TableHeader'
import { tableStyle } from '../../../constant/tableStyle';
// import InfoButton from '../../../assets/icons/tooltip_icon_1.svg'

import { useDispatch , useSelector } from 'react-redux';
import { fetchAllTools } from '../../../actions/mittarvToolsActions';
import { fetchUserPermissions } from '../../../actions/userPermissionsActions';
import {getToolAdminsOfSpecificTool} from '../../../utills/getToolAdmins'


const MittarvToolsTable = ({ isEdit, toggleOptions }) => {
    const {StyledTableRow ,StyledTableCell,TableStyle , TableHeaderStyle , ToolNameStyle , TooldetailStyle} = tableStyle;
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(fetchUserPermissions());
        dispatch(fetchAllTools());
    },[dispatch])

    const {mittarvtools} = useSelector((state) => state.mittarvtools)
    const {loading} = useSelector((state) => state.userpermissions)
    
  return (
    <>
        <TableHeader isEdit={isEdit} toggleOptions={toggleOptions} /> 
        {
            loading === true ? 
            <div className="loader">Loading......</div>
            :
            <TableContainer style={TableStyle}>
                <Table >
                    <TableHead>
                        <TableRow>
                            <StyledTableCell style={TableHeaderStyle} >Tools</StyledTableCell>
                            <StyledTableCell style={TableHeaderStyle} >Tool Admin</StyledTableCell>
                            <StyledTableCell style={TableHeaderStyle} >Link</StyledTableCell>
                            <StyledTableCell style={TableHeaderStyle} >Tool Description</StyledTableCell>
                            
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            mittarvtools?.map((tool)=> (
                                <StyledTableRow key={tool.toolId}
                                sx={{'&:last-child td, &:last-child th': { border: 0 }}}
                                >
                                <TableCell style={ToolNameStyle}>
                                    {tool.name} 
                                    {/* <ToolTip1 title={tool?.description} arrow placement='right-start'>
                                        <img src={InfoButton} alt="" />
                                    </ToolTip1> */}
                                </TableCell>   
                                <TableCell align='left' style={TooldetailStyle}>
                                    {   
                                        getToolAdminsOfSpecificTool(tool.toolId).length === 0 ?"No admins yet":
                                        getToolAdminsOfSpecificTool(tool.toolId)?.map((admin, index, arr) => {
                                            return `${admin.name} ${!arr[index +1] ? "":","}`
                                        })
                                        
                                        // tool.admin === null ? "No Admin Yet":tool?.admin.name
                                    }
                                </TableCell>
                                <TableCell align='left' style={TooldetailStyle}>
                                    {
                                        tool.link === null || tool?.link === '' ? "No Link" : <a className='tool-link' target='_blank' href={tool.link} rel="noreferrer">{tool.link}</a>
                                    }
                                </TableCell>
                                <TableCell align='left' style={TooldetailStyle}>
                                    {
                                        tool?.description === '' || tool?.description === null ? "No Description" : tool.description
                                    }
                                </TableCell>
                                </StyledTableRow>
                            ))
                        }
                    </TableBody>
                </Table>


            </TableContainer>
        }

    </>
  )
}

export default MittarvToolsTable