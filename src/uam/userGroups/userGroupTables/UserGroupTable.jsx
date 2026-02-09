import { useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';

import { useDispatch, useSelector } from 'react-redux';
import { fetchUserGroups } from '../../../actions/userGroupsActions';
import { TableHeader } from '../../../components/tableHeader_userGroups/TableHeader';
import {usergroupsUserViewPage} from '../../../constant/data'
import {tableStyle} from '../../../constant/tableStyle'


const UserGroupTable = ({showEdit, toggleOptions}) => {
  const { user } = useSelector((state) => state.user);
  const {StyledTableRow ,StyledTableCell} = tableStyle;

  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(fetchUserGroups());
  }, [dispatch])

  const {loading ,userGroupsData} = useSelector((state)=>state.usergroup);
  // const [rolesAndIds, setRolesAndIds] = useState(tableData.map(item => ({ id: item.id, role: item.role })));
  

  const TableStyle = {
    width: '90%',
    marginTop: '30px',
    marginLeft: '40px',
    border: 'none'


  };
  const TableHeaderStyle = {
    color: '#033348',
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '3.4277vh',
    letterSpacing: '0px',
    fontFamily: 'Plus Jakarta Sans'
  };
  
  
 
  
  
  return (
    <>
    {
    user.userType === 100 || user.userType === 500?
    <div className='welcome_div'>
    <h1 id='welcome_Text'>
        {usergroupsUserViewPage.heading},  {user.name}
    </h1>
    <p>
        {usergroupsUserViewPage.subheading}
    </p>
</div>
    :
    <TableHeader isEdit={showEdit} toggleOptions={toggleOptions} />
    }
    {
      loading === true ?
      <div className="loader">Loadin.....</div>
      :
    
      <TableContainer style={TableStyle} >
        <Table aria-label="User Group Table" >
          <TableHead>
            <TableRow>
              <StyledTableCell style={TableHeaderStyle}>Name</StyledTableCell>
              <StyledTableCell align="center" style={TableHeaderStyle}>Read Only</StyledTableCell>
              <StyledTableCell align="center" style={TableHeaderStyle}>Modify</StyledTableCell>
              <StyledTableCell align="center" style={TableHeaderStyle}>Approver</StyledTableCell>
              <StyledTableCell align="center" style={TableHeaderStyle}>Manage Members</StyledTableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {userGroupsData?.map((row) => (
              <StyledTableRow
                key={row?.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" style={{ fontSize: '2.3845vh', color: '#033348', fontWeight: '400', }}>
                  {row.role}
                </TableCell>
                <TableCell style={{padding:0}} align="center" >
                  <Checkbox
                    checked={row.view}
                    style={{ color: "#054A68" }}
                    inputProps={{ 'aria-label': 'controlled' }}
                  /></TableCell>
                <TableCell style={{padding:0}} align="center"><Checkbox
                  checked={row.modify}
                  style={{ color: "#054A68" }}
                  inputProps={{ 'aria-label': 'controlled' }}
                /></TableCell>
                <TableCell style={{padding:0}} align="center"><Checkbox
                  checked={row.approver}
                  style={{ color: "#054A68" }}
                  
                  inputProps={{ 'aria-label': 'controlled' }}
                /></TableCell>
                <TableCell style={{padding:0}}  align="center" ><Checkbox
                  checked={row.addmembers}
                  style={{ color: "#054A68" }}
                  
                  inputProps={{ 'aria-label': 'controlled' }}
                /></TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> 

      
    }
    </>
  )
}

export default UserGroupTable;
