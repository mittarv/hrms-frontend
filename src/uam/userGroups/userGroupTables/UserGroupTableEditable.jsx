import './userGroupTableEditable.scss'
import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import { TextField } from '@mui/material';
import AddIcon from '../../../assets/icons/add.svg'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserGroups, AddUserGroups, updateUserGroups, deleteUserGroups} from '../../../actions/userGroupsActions';
import { TableHeader } from '../../../components/tableHeader_userGroups/TableHeader';
import {tableStyle} from '../../../constant/tableStyle'


const UserGroupTableEditable = ({ showEdit, toggleOptions }) => {
  const {StyledTableRow ,StyledTableCell} = tableStyle;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUserGroups());
  }, [dispatch])

  const { userGroupsData, rowError, rowId,error, addgroupExecuted,updategroupExecuted, delgroupExecuted } = useSelector((state) => state.usergroup);
  const { user } = useSelector((state) => state.user);
  //as we need to modify the userGroupsData for few operations, creating a state to store the usergroupsdata to be able to modify later
  const [tableData, setTableData] = useState(userGroupsData ?? [])


  // as mentioned in the requiremjents the first  user group is default so we can't modify those // <<--- previous requirement
  const defaultIds = [9999999, 888888888];     //keeping it to avoid major code modification as this requirement is no more needed so replacing those values with random numbers
  //this array will be used to keep track of the changed or modifed values
  const [updatedRow, setUpdatedRow] = useState([]);

  //to update the values of the checkbox a new state is used , it is also used further to check if the value id changed or not
  const initialCheckboxStates = {};
  tableData.forEach((row) => {
      initialCheckboxStates[row.id] = {
        view: row.view,
        modify: row.modify,
        approver: row.approver,
        addmembers: row.addmembers,
      };
  });



  const [checkboxStates, setCheckboxStates] = useState(initialCheckboxStates)
  // this array will be used to keep track of all the newly created rows
  const [newRows, setNewRows] = useState([])

  const [deletedRows, setDeletedRows] = useState([])
  // after selecting the rows the id will be stored here and it will be further used to delete the array or for conditional styling
  const [selectedRows, setSelectedRows] = useState([]);




  const handleChange = (row, valueChanged) => {
    //modifying the 2d array to check and unheck the clicked checkbox
    setCheckboxStates((prevCheckboxStates) => ({
      ...prevCheckboxStates,
      [row.id]: {
        ...prevCheckboxStates[row.id],
        [valueChanged]: !prevCheckboxStates[row.id]?.[valueChanged],
      },
    }));

    if (newRows.some(newRow => newRow.id === row.id)) {
      setNewRows((prevRows) => {
        const isRowUpdated = prevRows.some((prow) => prow.id === row.id);
        if (isRowUpdated) {
          // Row already exists in updatedRow array, update the specific value
          const updatedRows = prevRows.map((prow) =>
            prow.id === row.id ? { ...prow, [valueChanged]: !prow[valueChanged] } : prow
          );
          return updatedRows;
        } else {
          // Row doesn't exist in updatedRow array, add it
          return [...prevRows, { ...row, [valueChanged]: !row[valueChanged] }];
        }
      });
    }

    setUpdatedRow((prevRows) => {
      const isRowUpdated = prevRows.some((prow) => prow.id === row.id);

      if (isRowUpdated) {
        // Row already exists in updatedRow array, update the specific value
        const updatedRows = prevRows.map((prow) =>
          prow.id === row.id ? { ...prow, [valueChanged]: !prow[valueChanged] } : prow
        );
        return updatedRows;
      } else {
        // Row doesn't exist in updatedRow array, add it
        return [...prevRows, { ...row, [valueChanged]: !row[valueChanged] }];
      }
    });

  };

  const TableStyle = {
    width: '90%',
    marginTop: '4.4709vh',
    marginLeft: '5.96125vh',
    border: 'none'


  };
  const TableHeaderStyle = {
    color: '#033348',
    fontFamily: "Plus Jakarta Sans",
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '3.4277vh',
    letterSpacing: '0px',
    padding: "1.1922vh"
    // fontFamily: 'Plus Jakarta Sans'
  };

  const BorderStyleForError = {
    border: "2px solid #FF8B8B",
    borderLeft: 'none',
    borderRight: 'none',


  }

  const handleCreateNewRow = () => {
    //the random id used will not be sent to th backend , it's created only to use in the table and for the select/unslect purpose
    // also i will make the id different while creating any new row,

    const newId = Math.floor(Math.random() * 100); // Generate a random number for ID

    let newRow = {
      id: newId,
      role: "",
      view: false,
      modify: false,
      approver: false,
      addmembers: false
    };

    setTableData([...tableData, newRow]);
    //adding the new row to a specific array to store as a new row and it will be used further.
    setNewRows([...newRows, newRow]);

  }

  const handleNameChange = (id, newName) => {
    
    setNewRows((prevRows) => {
      const updatedRows = prevRows.map((row) => {
        if (row.id === id) {
          return { ...row, role: newName };
        }
        return row;
      });
      return updatedRows;
    });
  };

  const handleRowSelect = (rowId) => {
    if (deletedRows.includes(rowId)) {
      return
    } else {
      if (selectedRows.includes(rowId)) {
        setSelectedRows(selectedRows.filter((id) => id !== rowId));
      } else {
        setSelectedRows([...selectedRows, rowId]);
      }

    }
  };
  const handleSelectAll = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([]);
    } else {
      // const allRowIds = tableData.map((row) => row.id);
      const allRowIds = tableData.filter((row) => !deletedRows.includes(row.id) && !defaultIds.includes(row.id)).map((row) => row.id);

      setSelectedRows(allRowIds);
    }
  };

  const deleteRows = () => {
    if (selectedRows.length === 0) {
      return;
    }

    setDeletedRows((prevDeletedRows) => [...prevDeletedRows, ...selectedRows]);


    setSelectedRows([]);
  };



  const saveChanges = async () => {
    // as we user can delete newly created user groups , so we can sent all newRows direcly, we need tofilter out all the new rows that are present in newRows.
    const filteredUserGroups = newRows.filter((usergroup) =>
      !deletedRows.some(row => row === usergroup.id)
    )
    dispatch(AddUserGroups(filteredUserGroups))

    //update user group process

    //we can move that filtering out process to our backend as well, as the rows have multiple fields like updatedAt , createdAt etc , we can't send those data to the backend while requesting API, so filtering out all the unneccessary fileds
    const fieldsToKeep = ['id', 'role', 'view', 'approver', 'addmembers', 'modify'];

    const rowsToUpdate = updatedRow.map(row => {
      const newRowForApi = {};
      for (const field of fieldsToKeep) {
        newRowForApi[field] = row[field];
      }
      return newRowForApi;
    });
  
    

    dispatch(updateUserGroups(rowsToUpdate, user.userId))

    //delete user group process

    //deleted rows array contains the new rows also(if deleted) and we can't send those to backend , so filtering out those to avoid errors
    const rowsToDelete = deletedRows.filter((id) =>
      !newRows.some(newRow => newRow.id === id)
    )

    dispatch(deleteUserGroups(rowsToDelete))

  }

  //this useeffect will be used to toggle thr page only when all the fuctions will be executed 

  useEffect(()=>{
    if(addgroupExecuted === true && updategroupExecuted === true && delgroupExecuted === true && error=== null){
      dispatch({type:'CHANGE_PAGE'}) //it will change the all the executed values to false
      toggleOptions(); //function to toggle between the editable and non editable table pages, here it will be used to redirect to non editable page after saving the changes, it's created inside the UserGroups.jsx file and then transfered using props, it will also passed to the TableHeader.jsx as props for the toggle operation
    }
  },[addgroupExecuted, updategroupExecuted,delgroupExecuted,toggleOptions,dispatch,error])


  return (
    <>
      <TableHeader isEdit={showEdit} toggleOptions={toggleOptions} saveChanges={saveChanges} />
      <div className="tabledit-main-div">
        <TableContainer style={TableStyle}>
          <Table aria-label="Editable User Groups table" >
            <TableHead>
              <TableRow>

                <StyledTableCell style={TableHeaderStyle}><Checkbox
                  checked={selectedRows.length === tableData.length}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < tableData.length}
                  onChange={handleSelectAll}
                  style={{
                    color: "#B7BFC6",

                  }}
                />Name</StyledTableCell>
                <StyledTableCell align="center" style={TableHeaderStyle}>Read Only</StyledTableCell>
                <StyledTableCell align="center" style={TableHeaderStyle}>Modify</StyledTableCell>
                <StyledTableCell align="center" style={TableHeaderStyle}>Approver</StyledTableCell>
                <StyledTableCell align="center" style={TableHeaderStyle}>Manage Members</StyledTableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {tableData?.map((row) => (
                // keeping this code as commented as it includes a previous requirement , so if in future requirements this feature is needed than it will be easy to implement
                // defaultIds.includes(row.id) ?
                //   <StyledTableRow

                //     key={row?.id}
                //     sx={{ '&:last-child td, &:last-child th': { border: 0 } }}

                //   >
                //     <TableCell component="th" scope="row" style={{ fontSize: '2.3845vh', color: '#033348', fontWeight: '400', paddingLeft: "50px" }}>

                //       {row.role}
                //     </TableCell>
                //     <TableCell align="center" style={{ padding: 0 }}>
                //       <Checkbox
                //         style={{ color: "#054A68" }}
                //         checked={row.view}

                //         inputProps={{ 'aria-label': 'controlled' }}
                //       /></TableCell>
                //     <TableCell align="center" style={{ padding: 0 }}><Checkbox
                //       checked={row.modify}
                //       style={{ color: "#054A68" }}
                //       // onChange={handleChange}
                //       inputProps={{ 'aria-label': 'controlled' }}
                //     /></TableCell>
                //     <TableCell align="center" style={{ padding: 0 }}><Checkbox
                //       checked={row.approver}
                //       style={{ color: "#054A68" }}
                //       // onChange={handleChange}
                //       inputProps={{ 'aria-label': 'controlled' }}
                //     /></TableCell>
                //     <TableCell align="center" style={{ padding: 0 }}><Checkbox
                //       checked={row.addmembers}
                //       style={{ color: "#054A68" }}
                //       // onChange={handleChange}
                //       inputProps={{ 'aria-label': 'controlled' }}
                //     /></TableCell>
                //   </StyledTableRow>
                //   :
                  //editable row beacuse the default rows can't be edited or modified
                  <StyledTableRow
                    style={{
                      backgroundColor: deletedRows.includes(row.id) ? "#FFF5F5" : selectedRows.includes(row.id) ? "#E9F2FE" : "", ...(row.id === rowId ? BorderStyleForError : {})
                    }}
                    key={row?.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >


                    <TableCell component="th" scope="row" style={{ fontSize: '2.3845vh', color: '#033348', fontWeight: '400', padding: "1.1922vh" }}>
                      <Checkbox

                        checked={selectedRows.includes(row.id) || deletedRows.includes(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                        style={{
                          color: deletedRows.includes(row.id) ? "#FF8B8B" : "#B7BFC6",
                          marginRight: "0px"

                        }}
                      />
                      {

                        newRows.some(newRow => newRow.id === row.id) ?
                          <TextField name={`newRow${row.id}`} onChange={(e) => {
                            handleNameChange(row.id, e.target.value)
                          }} variant="standard" placeholder="Enter" style={{ border: "none", }} className={(rowError?.blank === "role" && rowId === row.id) ? "table-new-textfield" : ""} />
                          :
                          <TextField name={`newRow${row.id}`} value={row.role} onChange={(e) => {
                            handleNameChange(row.id, e.target.value)
                          }} variant="standard" placeholder="Enter" style={{ border: "none", }} className={(rowError?.blank === "role" && rowId === row.id) ? "table-new-textfield" : ""} />

                      }
                    </TableCell>


                    <TableCell align="center" style={{ padding: 0 }}>
                      <Checkbox
                        // No reqioremnt to show the changes in newly created rows that's why  newRows.some((prow) => prow.id === row.id)) is used to idenify if row is new or not for futher conditional styling
                        style={{ color: ((rowError?.blank === "access" && rowId === row.id) ? checkboxStates[row.id]?.view ? "#054A68" : "#FF8B8B" : (!newRows.some((prow) => prow.id === row.id)) ? checkboxStates[row.id]?.view !== row.view ? "#FFD600" : "#054A68" : "#054A68") }}
                        checked={checkboxStates[row.id]?.view || false}
                        onChange={() => {

                          handleChange(row, 'view')
                        }}
                        inputProps={{ 'aria-label': 'controlled' }}
                      /></TableCell>
                    <TableCell align="center" style={{ padding: 0 }}><Checkbox
                      checked={checkboxStates[row.id]?.modify || false}

                      style={{ color: ((rowError?.blank === "access" && rowId === row.id) ? checkboxStates[row.id]?.modify ? "#054A68" : "#FF8B8B" : (!newRows.some((prow) => prow.id === row.id)) ? checkboxStates[row.id]?.modify !== row.modify ? "#FFD600" : "#054A68" : "#054A68") }}
                      onChange={() => {

                        handleChange(row, 'modify')
                      }}
                      inputProps={{ 'aria-label': 'controlled' }}
                    /></TableCell>
                    <TableCell align="center" style={{ padding: 0 }}><Checkbox
                      checked={checkboxStates[row.id]?.approver || false}
                      style={{ color: ((rowError?.blank === "access" && rowId === row.id) ? checkboxStates[row.id]?.approver ? "#054A68" : "#FF8B8B" : (!newRows.some((prow) => prow.id === row.id)) ? checkboxStates[row.id]?.approver !== row.approver ? "#FFD600" : "#054A68" : "#054A68") }}
                      onChange={() => {

                        handleChange(row, 'approver')
                      }}
                      inputProps={{ 'aria-label': 'controlled' }}
                    /></TableCell>
                    <TableCell align="center" style={{ padding: 0 }}><Checkbox
                      checked={checkboxStates[row.id]?.addmembers || false}
                      // style={{color:"#054A68"}}
                      style={{ color: ((rowError?.blank === "access" && rowId === row.id) ? checkboxStates[row.id]?.addmembers ? "#054A68" : "#FF8B8B" : (!newRows.some((prow) => prow.id === row.id)) ? checkboxStates[row.id]?.addmembers !== row.addmembers ? "#FFD600" : "#054A68" : "#054A68") }}

                      onChange={() => {
                        handleChange(row, 'addmembers')
                      }}
                      inputProps={{ 'aria-label': 'controlled' }}
                    /></TableCell>
                  </StyledTableRow>

              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <button className="create-new-button" onClick={handleCreateNewRow}>
          <img src={AddIcon} alt="right-arrow" />  Create New
        </button>
        {/* <hr style={{width:"90%"}} /> */}
        {
          selectedRows.length !== 0 || deletedRows.length !== 0 ?
            <div className="deleteButtons-section">
              {
                selectedRows.length !== 0 ?
                  <button className="delete-button" onClick={deleteRows}>
                    Delete Selected
                  </button> :
                  <button className="delete-button" disabled>
                    Delete Selected
                  </button>
              }
              {/* {
                        deletedRows.length !== 0 ?
                            <button className="undo-button" onClick={undoDeleted}>
                                Undo
                            </button> :
                            <div></div>
                    } */}
            </div>
            :
            <div></div>
        }

      </div>


    </>
  )
}
export default UserGroupTableEditable;
