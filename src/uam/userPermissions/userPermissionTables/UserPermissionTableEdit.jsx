import "./userPermissionTableEdit.scss";
import { EditTable } from "../../../components/editTable_userPermission/EditTable";
import { useEffect, useRef } from "react";
import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserPermissions,
  fetchAllTools,
  addUserToTool,
  updateUserAndTool,
  deleteUserAndTool,
} from "../../../actions/userPermissionsActions";
import { useCallback } from "react";
import { useState } from "react";
import { ButtonGroup, Button, Popper } from "@mui/material";
import ArrowDropDownIcon from "../../../assets/icons/dropdown-icon.svg";
import Grow from "@mui/material/Grow";
import { fetchUserGroups } from "../../../actions/userGroupsActions";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Checkbox from "@mui/material/Checkbox";
import { tableStyle } from "../../../constant/tableStyle";
import AddIcon from '../../../assets/icons/add.svg'
import AddUserPopup from "../../../components/popups/AddUserPopup";

export const UserPermissionTableEdit = ({ isEdit, toggleOptions }) => {
  const { StyledTableRow, StyledTableCell, TableStyle, TableHeaderStyle } =
    tableStyle;

  const [updatedPermissions, setUpdatedPermissions] = useState([]);
  const [newPermissions, setNewPermissions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);

  //for the create new user popup
  const [openCreateUserpopup, setOpenCreateUserpopup] = useState(false);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // ftechdata is to fetch all the data required for table like tools, users and the user groups
  const fetchData = useCallback(() => {
    dispatch(fetchAllTools());
    dispatch(fetchUserPermissions());
    dispatch(fetchUserGroups());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const {
    tools,
    userPermissionsDataa,
    addExecuted,
    updateExecuted,
    deleteExecuted,
  } = useSelector((state) => state.userpermissions);
  const { userGroupsData } = useSelector((state) => state.usergroup);

  //open indexes is a 2D array that represents the values present the open and closed dropdowns [[false,false,false],[false,false,true],[false,false,false]]
  const [openIndexes, setOpenIndexes] = useState(
    userPermissionsDataa.map(() => tools.map(() => false))
  );

  // it is used to selectt or unselect a row, or simply to change the value of the checkboxes, it will add the id of the user to the selectedUsers array when the row will be selected
  const handleRowSelect = (rowId) => {
    if (deletedUsers.includes(rowId)) {
      //if the rowId is present is deletedUsrs, then no need to unselect it
      return;
    } else {
      if (selectedUsers.includes(rowId)) {
        setSelectedUsers(selectedUsers.filter((id) => id !== rowId));
      } else {
        setSelectedUsers([...selectedUsers, rowId]);
      }
    }
  };

  //to select/unselect all the rows, here if any row is present in the deletedUsers, it will skip the row when unselecting
  const handleSelectAll = () => {
    if (
      selectedUsers.length ===
      userPermissionsDataa.length - deletedUsers.length
    ) {
      setSelectedUsers([]);
    } else {
      const allRowIds = userPermissionsDataa
        .filter((row) => !deletedUsers.includes(row.user.userId))
        .map((row) => row.user.userId);

      setSelectedUsers(allRowIds);
    }
  };

  //function to add the selectedUsers's userIds to deletedUsers.deletedUsers array is to be used during api call
  const deleteRows = () => {
    if (selectedUsers.length === 0) {
      return;
    }

    setDeletedUsers((prevdeletedUsers) => [
      ...prevdeletedUsers,
      ...selectedUsers,
    ]);
    setSelectedUsers([]);
  };

  //fucntion to toggle the dropdowns, it will change the openIndex array elements according to the value on the indexs provided
  const handleToggle = (event, rowIndex, toolIndex, row) => {
    event.stopPropagation();
    // if user id is present in deletedUsers, then no dropdown will be opened
    if (deletedUsers.includes(row.user.userId)) {
      return;
    } else {
      //this will check the given index, and change the bool value accordingly
      setOpenIndexes((prevOpenIndexes) =>
        prevOpenIndexes.map(
          (row, idx) =>
            idx === rowIndex
              ? row.map((isOpen, tIndex) =>
                tIndex === toolIndex ? !isOpen : false
              )
              : row.map(() => false) // Close dropdowns in other rows
        )
      );
    }
  };

  const handleClose = (rowIndex, toolIndex, event) => {
    event.stopPropagation();
    const anchorRef = anchorRefs?.current[rowIndex][toolIndex];
    if (anchorRef?.current && anchorRef?.current?.contains(event.target)) {
      return;
    }
    setOpenIndexes((prevOpenIndexes) =>
      prevOpenIndexes.filter((index) => index !== rowIndex)
    );
  };

  // function to save the changes, it will be passed to the EditTable.jsx file as props as the button is present there.
  const saveChanges = () => {

    dispatch(addUserToTool(newPermissions));
    dispatch(updateUserAndTool(updatedPermissions));
    dispatch(deleteUserAndTool(deletedUsers));
  };

  //this useeffect will be used to toggle thr page only when all the fuctions will be executed
  useEffect(() => {
    if (
      addExecuted === true &&
      updateExecuted === true &&
      deleteExecuted === true
    ) {
      dispatch({ type: "CHANGE_PAGE" }); //it will change the all the executed values to false
      toggleOptions(); //function to toggle between the editable and non editable table pages, here it will be used to redirect to non editable page after saving the changes, it's created inside the Userpermission.jsx file and then transfered using props, it will also passed to the EditTable.jsx as props for the toggle operation
    }
  }, [addExecuted, updateExecuted, deleteExecuted, dispatch, toggleOptions]);




  // function to be executed while clicking on any dropdown item,or changing any permissions
  const handleMenuItemClick = (
    event,
    toolId,
    userGroupId,
    row,
    newPermission
  ) => {
    // to check if any item ith the same userId and toolId is present or not , if it's present then only the usergroupid needs to be updated
    const isItemExists = (permissionsArray) =>
      permissionsArray.some(
        (item) => item.userId === row.user.userId && item.toolId === toolId
      );

    if (newPermission) {
      // Check if the item exists in newPermissions
      const existsInNewPermissions = isItemExists(newPermissions);
      if (existsInNewPermissions) {

        // changing the usergroupId
        setNewPermissions((prev) =>
          prev.map((pr) =>
            pr.userId === row.user.userId && pr.toolId === toolId
              ? { ...pr, userGroupId: userGroupId }
              : pr
          )
        );
      } else {

        setNewPermissions((prev) => [
          ...prev,
          { userId: row.user.userId, toolId, userGroupId },
        ]);
      }
    } else {
      // Check if the item exists in updatedPermissions
      const existsInUpdatedPermissions = isItemExists(updatedPermissions);

      if (existsInUpdatedPermissions) {
        setUpdatedPermissions((prev) =>
          prev.map((pr) =>
            pr.userId === row.user.userId && pr.toolId === toolId
              ? { ...pr, userGroupId: userGroupId }
              : pr
          )
        );
      } else {
        setUpdatedPermissions((prev) => [
          ...prev,
          { userId: row.user.userId, toolId, userGroupId },
        ]);
      }
    }
  };

  // anchorrefs is also a 2D array to open and close the dropdowns and to get the positions of the dropdown

  let anchorRefs = useRef(
    userPermissionsDataa?.map(() =>
      userGroupsData?.slice(0, tools.length).map(() => React.createRef())
    )
  );


  //create a new user


  const handleCreateNewRow = () => {

    // setOpenIndexes(... prev , tools.map(()=> false));
    const newRefsArray = userGroupsData.slice(0, tools.length).map(() => React.createRef());
    anchorRefs?.current.push(newRefsArray);

    setOpenIndexes((prev) => [...prev, Array.from({ length: userPermissionsDataa.length + 1 }, () => false)]);

  }


  return (
    <div
      className="tableedit_main_div"
      onClick={() =>
        setOpenIndexes(userPermissionsDataa.map(() => tools.map(() => false)))
      }
    >
      <EditTable
        isEdit={isEdit}
        toggleOptions={toggleOptions}
        saveChanges={saveChanges}
      />
      <TableContainer style={TableStyle}>
        <Table aria-label="User Permission Screen">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.length === userPermissionsDataa.length}
                  indeterminate={
                    selectedUsers.length > 0 &&
                    selectedUsers.length < userPermissionsDataa.length
                  }
                  onChange={handleSelectAll}
                  style={{
                    color: "#B7BFC6",

                    // marginLeft: "-4px"
                  }}
                />
              </TableCell>
              <StyledTableCell style={TableHeaderStyle}>
                UserName
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Email
              </StyledTableCell>
              {tools?.map((tool) => {
                return (
                  <StyledTableCell
                    key={tool.toolId}
                    align="left"
                    style={TableHeaderStyle}
                  >
                    {tool.name}
                  </StyledTableCell>
                );
              })}

              {/* <StyledTableCell align="center" style={TableHeaderStyle}>Tool 4</StyledTableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {userPermissionsDataa?.map((row, rowIndex) => (
              <StyledTableRow
                style={{
                  backgroundColor: deletedUsers.includes(row.user.userId)
                    ? "#FFF5F5"
                    : selectedUsers.includes(row.user.userId)
                      ? "#E9F2FE"
                      : "",
                }}
                key={row.user.userId}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedUsers.includes(row.user.userId) ||
                      deletedUsers.includes(row.user.userId)
                    }
                    onChange={() => handleRowSelect(row.user.userId)}
                    style={{
                      color: deletedUsers.includes(row.user.userId)
                        ? "#FF8B8B"
                        : "#B7BFC6",
                    }}
                  />
                </TableCell>
                <TableCell
                  component="th"
                  scope="row"
                  style={{
                    fontSize: "16px",
                    color: "#033348",
                    fontWeight: "400",
                  }}
                >
                  {row.user.name}
                </TableCell>
                <TableCell
                  component="th"
                  scope="row"
                  style={{
                    fontSize: "16px",
                    color: "#033348",
                    fontWeight: "400",
                  }}
                >
                  {row.user.email}
                </TableCell>

                {tools?.map((tool, index) => {
                  const currentRef = anchorRefs?.current[rowIndex];
                  const matchingTool = row.tools?.find(
                    (t) => t.tool?.toolId === tool.toolId
                  );

                  if (matchingTool) {
                    return (
                      <TableCell align="left" key={tool.toolId}>
                        <ButtonGroup
                          disableElevation
                          variant="contained"
                          ref={currentRef[index]}
                          style={
                            updatedPermissions.find(
                              (per) =>
                                per.userId === row.user?.userId &&
                                per.toolId === matchingTool.tool.toolId &&
                                per.userGroupId !== matchingTool.userGroup?.id
                            )
                              ? {
                                backgroundColor: "#FFF6C5",
                                color: "black",
                                border: "2px solid #FFD600",
                                borderRadius: "25px",
                                height: "30px",
                                marginLeft: "-3px",
                                paddingLeft: "5px",
                              }
                              : {
                                backgroundColor: "transparent",
                                color: "black",
                                border: "none",
                              }
                          }
                        >
                          <p
                            style={{
                              backgroundColor: "transparent",
                              color: "#525252",
                              border: "none",
                              textTransform: "none",
                              width: "80px",
                              paddingTop: "4px",
                            }}
                          >
                            {updatedPermissions.find(
                              (per) =>
                                per.userId === row.user?.userId &&
                                per.toolId === matchingTool.tool.toolId &&
                                per.userGroupId !== matchingTool.userGroup?.id
                            )
                              ? userGroupsData.find(
                                (usergroup) =>
                                  usergroup.id ===
                                  updatedPermissions.find(
                                    (per) =>
                                      per.userId === row.user?.userId &&
                                      per.toolId ===
                                      matchingTool.tool.toolId &&
                                      per.userGroupId !==
                                      matchingTool.userGroup?.id
                                  ).userGroupId
                              ).role
                              : matchingTool.userGroup?.role}
                          </p>
                          <Button
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              border: "none",
                              cursor: `${deletedUsers.includes(row.user.userId)
                                  ? "not-allowed"
                                  : "pointer"
                                }`,
                            }}
                            size="small"
                            onClick={(event) => {
                              handleToggle(event, rowIndex, index, row);
                            }}
                          >
                            <img
                              src={ArrowDropDownIcon}
                              alt="dropdown-icon"
                              style={{
                                transform: openIndexes[rowIndex][index]
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              }}
                            />
                          </Button>
                        </ButtonGroup>

                        <Popper
                          sx={{
                            zIndex: 1,
                            position: "absolute",
                          }}
                          anchorEl={currentRef[index]?.current}
                          open={openIndexes[rowIndex][index]}
                          role={undefined}
                          transition
                          disablePortal
                          placement="bottom"
                        >
                          {({ TransitionProps, placement }) => (
                            <Grow
                              {...TransitionProps}
                              style={{
                                // transformOrigin: placement === 'bottom' ? 'center bottom' : 'center bottom',
                                transformOrigin:
                                  placement === "bottom-start"
                                    ? "center top"
                                    : "center top",
                              }}
                            >
                              <Paper>
                                <ClickAwayListener
                                  onClickAway={(event) =>
                                    handleClose(rowIndex, index, event)
                                  }
                                >
                                  <MenuList
                                    id={`split-button-menu-${rowIndex}-${index}`}
                                    autoFocusItem
                                  >
                                    {userGroupsData.map((option, index) => (
                                      <MenuItem
                                        key={option.id}
                                        style={
                                          matchingTool.userGroup?.id ===
                                            option.id
                                            ? {
                                              fontWeight: 600,
                                              backgroundColor: "white",
                                            }
                                            : {}
                                        }
                                        // selected={option.role === accessTypes[row[`tool${toolIndex + 1}`]]}
                                        onClick={(event) => {
                                          handleMenuItemClick(
                                            event,
                                            matchingTool.tool.toolId,
                                            option.id,
                                            row,
                                            false
                                          );
                                        }}
                                      >
                                        {option.role}
                                      </MenuItem>
                                    ))}
                                  </MenuList>
                                </ClickAwayListener>
                              </Paper>
                            </Grow>
                          )}
                        </Popper>
                      </TableCell>
                    );
                  } else {
                    return (
                      <TableCell align="left" key={tool.toolId}>
                        <ButtonGroup
                          disableElevation
                          variant="contained"
                          ref={currentRef[index]}
                          style={
                            newPermissions.find(
                              (per) =>
                                per.userId === row.user?.userId &&
                                per.toolId === tool.toolId &&
                                per.userGroupId !== 1
                            )
                              ? {
                                backgroundColor: "#FFF6C5",
                                color: "black",
                                border: "2px solid #FFD600",
                                borderRadius: "25px",
                                height: "30px",
                                marginLeft: "-3px",
                                paddingLeft: "5px",
                              }
                              : {
                                backgroundColor: "transparent",
                                color: "black",
                                border: "none",
                              }
                          }
                        >
                          <p
                            style={{
                              backgroundColor: "transparent",
                              color: "#525252",
                              border: "none",
                              textTransform: "none",
                              width: "80px",
                              paddingTop: "4px",
                            }}
                          >
                            {
                              // 1 is the default id for No Access
                              newPermissions.find(
                                (per) =>
                                  per.userId === row.user?.userId &&
                                  per.toolId === tool.toolId &&
                                  per.userGroupId !== 1
                              )
                                ? userGroupsData.find(
                                  (usergroup) =>
                                    usergroup.id ===
                                    newPermissions.find(
                                      (per) =>
                                        per.userId === row.user?.userId &&
                                        per.toolId === tool.toolId &&
                                        per.userGroupId !== 1
                                    ).userGroupId
                                ).role
                                : "No Access"
                            }
                          </p>
                          <Button
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              border: "none",
                              cursor: `${deletedUsers.includes(row.user.userId)
                                  ? "not-allowed"
                                  : "pointer"
                                }`,
                            }}
                            size="small"
                            onClick={(event) => {
                              handleToggle(event, rowIndex, index, row);
                            }}
                          >
                            <img
                              src={ArrowDropDownIcon}
                              alt="dropdown-icon"
                              style={{
                                transform: openIndexes[rowIndex][index]
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              }}
                            />
                          </Button>
                        </ButtonGroup>

                        <Popper
                          sx={{
                            zIndex: 1,
                            position: "absolute",
                          }}
                          anchorEl={currentRef[index]?.current}
                          open={openIndexes[rowIndex][index]}
                          role={undefined}
                          transition
                          disablePortal
                          placement="bottom"
                        >
                          {({ TransitionProps, placement }) => (
                            <Grow
                              {...TransitionProps}
                              style={{
                                // transformOrigin: placement === 'bottom' ? 'center bottom' : 'center bottom',
                                transformOrigin:
                                  placement === "bottom-start"
                                    ? "bottom-start"
                                    : "bottom-start",
                              }}
                            >
                              <Paper>
                                <ClickAwayListener
                                  onClickAway={(event) =>
                                    handleClose(rowIndex, index, event)
                                  }
                                >
                                  <MenuList
                                    id={`split-button-menu-${rowIndex}-${index}`}
                                    autoFocusItem
                                  >
                                    {userGroupsData.map((option, index) => (
                                      <MenuItem
                                        key={option.id}
                                        // style={option.role === accessTypes[row[`tool${toolIndex + 1}`]] ? { fontWeight: 600, backgroundColor: "white" } : {}}
                                        // selected={option.role === accessTypes[row[`tool${toolIndex + 1}`]]}
                                        onClick={(event) =>
                                          handleMenuItemClick(
                                            event,
                                            tool.toolId,
                                            option.id,
                                            row,
                                            true
                                          )
                                        }
                                      >
                                        {option.role}
                                      </MenuItem>
                                    ))}
                                  </MenuList>
                                </ClickAwayListener>
                              </Paper>
                            </Grow>
                          )}
                        </Popper>
                      </TableCell>
                    );
                  }
                })}
              </StyledTableRow>
            ))}

            {/* this part will include code for the new users (after clicking on the create new user button) */}
          </TableBody>
        </Table>
      </TableContainer>
      {
        user.userType !== 500 ?
          <button className="create-new-button" onClick={() => { setOpenCreateUserpopup(true) }}>
            <img src={AddIcon} alt="right-arrow" />  Create New
          </button>
          :
          <></>
      }


      {(selectedUsers.length !== 0 || deletedUsers.length !== 0) && user.userType !== 500 ? (
        <div className="deleteButtons_section">
          {selectedUsers.length !== 0 ? (
            <button className="delete_button" onClick={deleteRows}>
              Delete Selected
            </button>
          ) : (
            <button className="delete_button" disabled>
              Delete Selected
            </button>
          )}
          {/* {
                            deletedUsers.length !== 0 ?
                                <button className="undo_button" onClick={undoDeleted}>
                                    Undo
                                </button> :
                                <div></div>
                        } */}
        </div>
      ) : (
        <div></div>
      )}

      <AddUserPopup openpopup={openCreateUserpopup} setOpenPopup={setOpenCreateUserpopup} handleCreateNewRow={handleCreateNewRow} />
    </div>
  );
};

export default UserPermissionTableEdit;
