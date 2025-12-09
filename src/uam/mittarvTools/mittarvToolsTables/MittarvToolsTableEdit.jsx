import React, { useCallback, useEffect, useState, useRef } from "react";
import "./mittarvToolsTable.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import { TableHeader } from "../../../components/tableHeader_MittarvTools/TableHeader";
import { tableStyle } from "../../../constant/tableStyle";
import AddIcon from "../../../assets/icons/add.svg";
import { useSelector, useDispatch } from "react-redux";
import {
  addNewTool,
  deleteTools,
  updateExistingTool,
} from "../../../actions/mittarvToolsActions";
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import ArrowDropDownIcon from "../../../assets/icons/dropdown-icon.svg";
import { getToolAdminsOfSpecificTool } from "../../../utills/getToolAdmins";
import GreenTickIcon from "../../../assets/icons/green_tick_icon.svg"
import { addUserToTool } from "../../../actions/userPermissionsActions";

const MittarvToolsTableEdit = ({ isEdit, toggleOptions }) => {

  const {
    StyledTableRow,
    StyledTableCell,
    TableStyle,
    TableHeaderStyle,
    ToolNameStyle,
    TooldetailStyle,
  } = tableStyle;
  const {
    loading,
    mittarvtools,
    deltoolExecuted,
    updateToolExecuted,
    addToolExecuted,
    error,
  } = useSelector((state) => state.mittarvtools);

  const {
    userGroupsData
  } = useSelector((state) => state.usergroup)

  const {
    userPermissionsDataa,
  } = useSelector((state) => state.userpermissions);

  // const mittarvtools = mittarvToolsPageData.sampleResponse.tools
  const dispatch = useDispatch();
  const [tempTools, settempTools] = useState(mittarvtools);
  const [updatedTools, setUpdatedTools] = useState([]);
  const [newTools, setNewTools] = useState([]);
  const [deletedTools, setDeletedTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [toolAdmins, setToolAdmins] = useState([])
  const [toolAdminsNewTool, setToolAdminsNewTool] = useState([])


  const [openIndexes, setOpenIndexes] = useState(
    tempTools.map(() => false)
  );


  let anchorRefs = useRef(
    tempTools?.map(() =>
      React.createRef()
    )
  )

  //for new tools
  const [openIndexesnew, setOpenIndexesnew] = useState(
    newTools.map(() => false)
  );


  let anchorRefsNew = useRef(
    newTools?.map(() =>
      React.createRef()
    )
  )

  //onChnage function  to change the data of inputboxes of existing tools
  const onChange = (toolId, e, label) => {
    settempTools((prevtools) => {
      const updatedTool = prevtools.map((tool) => {
        if (tool.toolId === toolId) {
          return { ...tool, [label]: e.target.value };
        }
        return tool;
      });
      return updatedTool;
    });
    if (updatedTools.some((tool) => tool?.toolId === toolId)) {
      setUpdatedTools((prevtools) => {
        const updatedTool = prevtools.map((tool) => {
          if (tool.toolId === toolId) {
            return { ...tool, [label]: e.target.value };
          }
          return tool;
        });
        return updatedTool;
      });
    } else {
      setUpdatedTools([
        ...updatedTools,
        tempTools.find((tool) => tool.toolId === toolId),
      ]);
    }
  };

  //onChange functions to change the data of input boxes specifically for the new tools
  const onChangeNewTools = (toolId, e, label) => {
    setNewTools((prevtools) => {
      const updatedTool = prevtools.map((tool) => {
        if (tool.id === toolId) {
          return { ...tool, [label]: e.target.value };
        }
        return tool;
      });

      return updatedTool;
    });
  };


  const handleSelectAlltools = () => {
    if (selectedTools.length === newTools.length + tempTools.length) {
      setSelectedTools([]);
    } else {
      const allRowIds = newTools
        .filter((tool) => !deletedTools.includes(tool.id))
        .map((tool) => tool.id);
      const allExistingToolIds = tempTools
        .filter((tool) => !deletedTools.includes(tool.id))
        .map((tool) => tool.toolId);
      const combinedIds = [...allRowIds, allExistingToolIds];
      setSelectedTools(combinedIds);
    }
  };

  //helper function for the checkboxes to select a tool

  const handleToolSelect = (toolId) => {
    if (deletedTools.includes(toolId)) {
      return;
    } else {
      if (selectedTools.includes(toolId)) {
        setSelectedTools(selectedTools.filter((id) => id !== toolId));
      } else {
        setSelectedTools([...selectedTools, toolId]);
      }
    }
  };

  //it will just add all the selected tools to deletedTools array
  const deleteTool = () => {
    if (selectedTools.length === 0) {
      return;
    }
    setDeletedTools((prevTools) => [...prevTools, ...selectedTools]);
    setSelectedTools([]);
  };

  const warningRowId = 44;

  const handleCreateNewRow = () => {
    //the random id used will not be sent to th backend , it's created only to use in the table and for the select/unslect purpose
    // also i will make the id different while creating any new row,

    const newId = Math.floor(Math.random() * 100) + 899; // Generate a random number for ID

    let newRow = {
      id: newId,
      adminId: null,
      description: "",
      link: "",
      name: "",
      remark: "",
      admin: null
    };



    setNewTools([...newTools, newRow]);
    anchorRefsNew.current.push(React.createRef());
    setOpenIndexesnew((prev) => [...prev, false])
  };

  const saveChanges = () => {


    // as we user can delete newly created user groups , so we can sent all newRows direcly, we need tofilter out all the new rows that are present in newRows.
    const filterDeletedNewTools = newTools.filter(
      (tool) => !deletedTools.some((toolId) => toolId === tool.id)
    );



    dispatch(addNewTool(filterDeletedNewTools));

    //============================================update a tool=============================================================
    const filterDeletedExistingTools = updatedTools.filter(
      (tool) => !deletedTools.some((toolId) => toolId === tool.toolId)
    );
    dispatch(updateExistingTool(filterDeletedExistingTools));
    //deleted rows array may contain the new rows also(if deleted) and we can't send those to backend , so filtering out those to avoid errors
    const rowsToDelete = deletedTools.filter(
      (id) => !newTools.some((newTool) => newTool.id === id)
    );

    dispatch(deleteTools(rowsToDelete));

    if(toolAdmins?.length > 0){
      dispatch(addUserToTool(toolAdmins))
    }
    if(toolAdminsNewTool.length > 0){
      dispatch(addUserToTool(toolAdminsNewTool))
    }
  };


  // a function to clear all the errors and change the page
  const changepage = useCallback(() => {
    dispatch({ type: "CHANGE_PAGE_TOOLS" });
    toggleOptions();
  }, [dispatch, toggleOptions]);

  useEffect(() => {
    if (
      addToolExecuted === true &&
      updateToolExecuted === true &&
      deltoolExecuted === true &&
      error === null
    ) {
      changepage();
    }
  }, [addToolExecuted, updateToolExecuted, deltoolExecuted, error, changepage]);


  const handleToggle = (rowId, rowindex) => {
    if (deletedTools.includes(rowId)) {
      return;
    }
    else {
      setOpenIndexes((prev) =>
        prev.map((pr, index) =>
          index === rowindex ?
            !pr : false
        )

      )
    }
  }

  const handleToggleNew = (rowId, rowindex) => {
    if (deletedTools.includes(rowId)) {
      return;
    }
    else {
      setOpenIndexesnew((prev) =>
        prev.map((pr, index) =>
          index === rowindex ?
            !pr : false
        )

      )
    }
  }

  const handleMenuItemClick = (username, user, toolId, newuser) => {
    const toolAdminId = userGroupsData?.find((group) => group.role === "Tool Admin").id
    if (!toolAdminId) {
      return alert("Tool Admin user group not found, please create one first")
    }
    const noAccessId = userGroupsData?.find((group) => group.role === "No Access").id
    if (!noAccessId) {
      return alert("Tool Admin user group not found, please create one first")
    }


    if (newuser === false) {
      // Case 1 : The toolId and userId is present in the userPermission table, it means the user has tool admin permission, and now we want to remove their access
      const toolAdminUserTool = getToolAdminsOfSpecificTool(toolId)
      let userIdPresent = toolAdminUserTool.find((tool) => tool.userId === user.userId)
      const presentInToolAdmin = toolAdmins.find((permission) => permission.userId === user.userId && permission.toolId === toolId && permission.userGroupId === toolAdminId)
      const presentInToolAdminNoAccess = toolAdmins.find((permission) => permission.userId === user.userId && permission.toolId === toolId && permission.userGroupId === noAccessId)
      // Case 1.A --> Data not present --> Add a new entry into the toolAdmin array
      if (!userIdPresent && !presentInToolAdmin) {
        let data = {
          name: username,
          toolId: toolId,
          userId: user.userId,
          userGroupId: toolAdminId
        }
        if (presentInToolAdminNoAccess) {
          // Case 1.A.1: The user has no access entry in toolAdmins, update their userGroupId to toolAdminId
          const updatedToolAdmins = toolAdmins.map(admin => {
            if (admin.userId === user.userId && admin.toolId === toolId) {
              // Modify the existing entry to change the userGroupId
              return { ...admin, userGroupId: toolAdminId };
            }
            return admin;
          });

          setToolAdmins(updatedToolAdmins)
        } else {
          // Case 1.A.2: The user has no existing entries, add a new entry with toolAdminId
          setToolAdmins([...toolAdmins, data])
        }

      } else {
        // Case 2: The toolId and userId is present in userPermission table, but the user doesn't have tool admin permission in toolAdmins

        if (!presentInToolAdmin && userIdPresent) {
          
          let data = {
            name: username,
            toolId: toolId,
            userId: user.userId,
            userGroupId: noAccessId
          }
          if (presentInToolAdminNoAccess) {
            // Case 2.A: The user already has a noAccess entry, update their userGroupId to toolAdminId
            const updatedToolAdmins = toolAdmins.map(admin => {
              if (admin.userId === user.userId && admin.toolId === toolId) {
                // Modify the existing entry to change the userGroupId
                return { ...admin, userGroupId: toolAdminId };
              }
              return admin;
            });

            setToolAdmins(updatedToolAdmins)
          } else {
            // Case 2.B: The user doesn't have an existing noAccess entry, add a new entry with noAccessId
            setToolAdmins([...toolAdmins, data])
          }
        } else {
         
          // setToolAdmins([...toolAdmins, data])
          const updatedToolAdmins = toolAdmins.map(admin => {
            if (admin.userId === user.userId && admin.toolId === toolId) {
              // Modify the existing entry to change the userGroupId
              return { ...admin, userGroupId: noAccessId };
            }
            return admin;
          });

          setToolAdmins(updatedToolAdmins)
        }

      }

      setOpenIndexes((prev) =>
        prev?.map(() =>
          false
        ))
    } else {

      const existingAdmin = toolAdminsNewTool.some((tool) => tool.toolId === toolId && tool.userId === user.userId)
      if (!existingAdmin) {
        let data = {
          toolId: toolId,
          userId: user.userId,
          userGroupId: toolAdminId
        }
        setToolAdminsNewTool([...toolAdminsNewTool, data]);
      } else {
        let filterToolAdmin = toolAdminsNewTool.filter((admin) => admin.toolId !== toolId && admin.userId !== user.userId)  // filter out the entry
        setToolAdminsNewTool(filterToolAdmin)
      }

      setOpenIndexesnew((prev) =>
        prev?.map(() =>
          false
        ))
    }



  }

  return (
    <>
      <TableHeader
        isEdit={isEdit}
        toggleOptions={toggleOptions}
        saveChanges={saveChanges}
      />
      {loading === true ? (
        <div className="loader">Loading ....</div>
      ) : (
        <div>
          <TableContainer style={TableStyle}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell style={TableHeaderStyle}>
                    {
                      <Checkbox
                        checked={
                          selectedTools.length ===
                          newTools.length + tempTools.length
                        }
                        indeterminate={
                          selectedTools.length > 0 &&
                          selectedTools.length <
                          newTools.length + tempTools.length
                        }
                        onChange={() => {
                          handleSelectAlltools();
                        }}
                        style={{
                          color: "#B7BFC6",
                        }}
                      />
                    }
                    Tools
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Tool Admin
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Link
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Tool Description
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tempTools?.map((tool, index) => (
                  <StyledTableRow
                    key={tool.toolId}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    style={{
                      backgroundColor: deletedTools.includes(tool.toolId)
                        ? "#FFF5F5"
                        : selectedTools.includes(tool.toolId)
                          ? "#E9F2FE"
                          : "",
                      ...(tool.toolId === warningRowId ? "#FF8B8B" : ""),
                    }}
                  >
                    <TableCell component="th" scope="row" style={ToolNameStyle}>
                      <div className="tool_input_div">
                        <Checkbox
                          checked={
                            selectedTools.includes(tool.toolId) ||
                            deletedTools.includes(tool.toolId)
                          }
                          onChange={() => {
                            handleToolSelect(tool.toolId);
                          }}
                          style={{
                            color: deletedTools.includes(tool?.toolId)
                              ? "#FF8B8B"
                              : "#B7BFC6",
                            marginRight: "0px",
                          }}
                        />
                        {deletedTools.includes(tool.toolId) &&
                          tool?.name !== "" ? (
                          <p className="text127 tool_input ">{tool?.name}</p>
                        ) : (
                          <input
                            placeholder="enter name"
                            className={`text7 tool_input ${tool.name ===
                              mittarvtools.find(
                                (thisTool) => thisTool.toolId === tool.toolId
                              )?.name
                              ? ""
                              : "edited_input_box"
                              }`}
                            type="text"
                            value={tool?.name}
                            onChange={(e) => {
                              onChange(tool.toolId, e, "name");
                            }}
                            style={{
                              width: `${tool?.name ? tool.name?.length * 10 + 10 : 100
                                }px`, // Setting min-width based on the length of the initial value
                              maxWidth: "200px",
                            }}
                          />
                        )}
                      </div>
                      {/* <ToolTip1 title={tool?.description} arrow placement='right-start'>
                            <img src={InfoButton} alt="" />
                          </ToolTip1> */}
                    </TableCell>
                    {/* <TableCell align="left" style={{ width: "25%" }}>
                      {
                        <div className="tool_input_div">
                          {deletedTools.includes(tool.toolId) &&
                            tool?.adminId !== "" ? (
                            <strike className="text127 tool_input ">
                              {tool?.adminId}
                            </strike>
                          ) : (
                            <input
                              placeholder="enter admin"
                              className={`text117 tool_input ${tool.adminId ===
                                  mittarvtools.find(
                                    (thisTool) => thisTool.toolId === tool.toolId
                                  )?.adminId
                                  ? ""
                                  : "edited_input_box"
                                }`}
                              type="text"
                              value={
                                tool?.adminId === null ? "No Admin" : tool.admin?.name
                              }
                              onChange={(e) => {
                                onChange(tool.toolId, e, "adminId");
                              }}
                              style={{
                                width: `${tool?.adminId
                                    ? tool.adminId.length * 10 + 10
                                    : 110
                                  }px`, // Setting min-width based on the length of the initial value
                                maxWidth: "200px",
                              }}
                            />
                          )}
                        </div>
                      }
                    </TableCell> */}

                    <TableCell align="left" style={{ width: "25%" }}>
                      <ButtonGroup
                        disableElevation
                        variant="contained"
                        ref={anchorRefs.current[index]}
                      >
                        <p>
                          {
                            getToolAdminsOfSpecificTool(tool.toolId)?.length === 0 ? "No Admin yet" :
                              getToolAdminsOfSpecificTool(tool.toolId)?.length === 1 ?
                                getToolAdminsOfSpecificTool(tool.toolId)?.map((admin) => admin.name) :
                                "Multiple Admin Selected"
                            // tool?.adminId !== null ? (
                            //   // <strike className="text127 tool_input ">
                            //   tool.admin?.name
                            //   // </strike>
                            // ) : tempTools.find((too) => too.toolId === tool.toolId)?.admin?.name || "No admin yet"
                          }

                        </p>

                        <Button style={{
                          backgroundColor: "transparent",
                          color: "black",
                          border: "none",

                        }}
                          onClick={() => {
                            handleToggle(tool.toolId, index)
                          }}
                        >
                          <img
                            src={ArrowDropDownIcon}
                            alt="dropdown-icon"
                          // style={{
                          //   transform: openIndexes[rowIndex][index]
                          //     ? "rotate(180deg)"
                          //     : "rotate(0deg)",
                          // }}
                          />
                        </Button>
                      </ButtonGroup>
                      <Popper
                        sx={{
                          zIndex: 1,
                          position: "absolute",
                        }}
                        anchorEl={anchorRefs.current[index].current}
                        open={openIndexes[index]}
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
                              <ClickAwayListener onClickAway={() => setOpenIndexes((prev) =>
                                prev?.map(() =>
                                  false
                                )

                              )}>
                                <MenuList>
                                  {
                                    userPermissionsDataa?.map((user) => {
                                      return <MenuItem
                                        key={user.user?.id}
                                        onClick={() => {

                                          handleMenuItemClick(
                                            user.user?.name,
                                            user.user,
                                            tool.toolId,
                                            false

                                          )
                                        }}
                                      >
                                        {
                                          getToolAdminsOfSpecificTool(tool.toolId, toolAdmins).some((admin) => admin.name === user.user?.name) ? <> {user.user?.name}<img className="selected_user_tick" src={GreenTickIcon} alt="" /> </> : user.user?.name
                                          // user.user?.name
                                        }
                                      </MenuItem>
                                    })
                                  }
                                </MenuList>
                              </ClickAwayListener>
                            </Paper>
                          </Grow>
                        )}
                      </Popper>
                    </TableCell>


                    <TableCell align="left" style={{ width: "25%" }}>
                      {
                        <div className="tool_input_div">
                          {deletedTools.includes(tool.toolId) &&
                            tool?.link !== "" ? (
                            <strike className="text127 tool_input ">
                              {tool?.link}
                            </strike>
                          ) : (
                            <input
                              placeholder="enter link"
                              className={`text117 tool_input ${tool.link ===
                                mittarvtools.find(
                                  (thisTool) => thisTool.toolId === tool.toolId
                                )?.link
                                ? ""
                                : "edited_input_box"
                                }`}
                              type="text"
                              value={tool?.link}
                              onChange={(e) => {
                                onChange(tool.toolId, e, "link");
                              }}
                              style={{
                                width: `${tool?.link ? tool.link.length * 9 + 9 : 100
                                  }px`, // Setting min-width based on the length of the initial value
                                maxWidth: "200px",
                              }}
                            />
                          )}
                        </div>
                      }
                    </TableCell>
                    <TableCell align="left" style={{ width: "25%" }}>
                      {
                        <div className="tool_input_div">
                          {deletedTools.includes(tool.toolId) &&
                            tool?.description !== "" ? (
                            <strike className="text127 tool_input ">
                              {tool?.description}
                            </strike>
                          ) : (
                            <input
                              placeholder="enter description"
                              className={`text7 tool_input ${tool.description ===
                                mittarvtools.find(
                                  (thisTool) => thisTool.toolId === tool.toolId
                                )?.description
                                ? ""
                                : "edited_input_box"
                                }`}
                              type="text"
                              value={tool?.description}
                              onChange={(e) => {
                                onChange(tool.toolId, e, "description");
                              }}
                              style={{
                                width: `${tool?.description
                                  ? tool.description.length * 9
                                  : 150
                                  }px`, // Setting min-width based on the length of the initial value
                                maxWidth: "10vw",
                              }}
                            />
                          )}
                        </div>
                      }
                    </TableCell>
                  </StyledTableRow>
                ))}
                {/* separting the new tools from the existing ones to reduce the complexity */}
                {newTools?.map((tool, index) => (
                  <StyledTableRow
                    key={tool.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    style={{
                      backgroundColor: deletedTools.includes(tool.id)
                        ? "#FFF5F5"
                        : selectedTools.includes(tool.id)
                          ? "#E9F2FE"
                          : "",
                      ...(tool.id === warningRowId ? "#FF8B8B" : ""),
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <div className="tool_input_div tool_name">
                        <Checkbox
                          checked={
                            selectedTools.includes(tool.id) ||
                            deletedTools.includes(tool.id)
                          }
                          onChange={() => {
                            handleToolSelect(tool.id);
                          }}
                          style={{
                            color: deletedTools.includes(tool.id)
                              ? "#FF8B8B"
                              : "#B7BFC6",
                            marginRight: "0px",
                          }}
                        />
                        {deletedTools.includes(tool.id) && tool?.name !== "" ? (
                          <p className="text127 tool_input ">{tool?.name}</p>
                        ) : (
                          <input
                            placeholder="enter name"
                            className="text7 tool_input"
                            type="text"
                            value={tool?.name}
                            onChange={(e) => {
                              onChangeNewTools(tool.id, e, "name");
                            }}
                            style={{
                              maxWidth: "10vw",
                            }}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="left" style={{ width: "25%" }}>
                      <ButtonGroup
                        disableElevation
                        variant="contained"
                        ref={anchorRefsNew?.current[index]}
                      >
                        <p>
                          {
                            tool?.adminId !== null ? (
                              // <strike className="text127 tool_input ">
                              tool.admin?.name
                              // </strike>
                            ) : "No admin yet"
                          }

                        </p>

                        <Button style={{
                          backgroundColor: "transparent",
                          color: "black",
                          border: "none",

                        }}
                          onClick={() => {
                            handleToggleNew(tool.toolId, index)
                          }}
                        >
                          <img
                            src={ArrowDropDownIcon}
                            alt="dropdown-icon"
                          
                          />
                        </Button>
                      </ButtonGroup>
                      <Popper
                        sx={{
                          zIndex: 1,
                          position: "absolute",
                        }}
                        anchorEl={anchorRefsNew?.current[index]?.current}
                        open={openIndexesnew[index]}
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
                              <ClickAwayListener onClickAway={() => setOpenIndexesnew((prev) =>
                                prev?.map(() =>
                                  false
                                )

                              )}>
                                <MenuList>
                                  {
                                    userPermissionsDataa?.map((user) => {
                                      return <MenuItem
                                        key={user.user?.id}
                                        onClick={() => {
                                          handleMenuItemClick(
                                            user.user?.name,
                                            user.user,
                                            tool.id,
                                            true

                                          )
                                        }}
                                      >
                                        {
                                          getToolAdminsOfSpecificTool(tool.id, toolAdminsNewTool).some((admin) => admin.name === user.user?.name) ? <> {user.user?.name}<img className="selected_user_tick" src={GreenTickIcon} alt="" /> </> : user.user?.name
                                          // user.user?.name
                                        }
                                      </MenuItem>
                                    })
                                  }
                                </MenuList>
                              </ClickAwayListener>
                            </Paper>
                          </Grow>
                        )}

                      </Popper>

                    </TableCell>


                    <TableCell align="left" style={TooldetailStyle}>
                      <div className="tool_input_div">
                        {deletedTools.includes(tool.id) && tool?.link !== "" ? (
                          <strike className="text127 tool_input ">
                            {tool?.link}
                          </strike>
                        ) : (
                          <input
                            placeholder="enter link"
                            className="text117 tool_input"
                            type="text"
                            value={tool?.link}
                            onChange={(e) => {
                              onChangeNewTools(tool.id, e, "link");
                            }}
                            style={{
                              maxWidth: "10vw",
                            }}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="left">
                      <div className="tool_input_div">
                        {deletedTools.includes(tool.id) &&
                          tool?.description !== "" ? (
                          <strike className="text127 tool_input ">
                            {tool?.description}
                          </strike>
                        ) : (
                          <input
                            placeholder="enter description"
                            className="text117 tool_input"
                            type="text"
                            value={tool?.description}
                            onChange={(e) => {
                              onChangeNewTools(tool.id, e, "description");
                            }}
                            style={{
                              maxWidth: "10vw",
                            }}
                          />
                        )}
                      </div>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <button className="create-new-button" onClick={handleCreateNewRow}>
            <img src={AddIcon} alt="right-arrow" /> Create New
          </button>
          {selectedTools.length !== 0 || deletedTools.length !== 0 ? (
            <div className="deleteButtons-section">
              {selectedTools.length !== 0 ? (
                <button className="delete-button" onClick={deleteTool}>
                  Delete Selected
                </button>
              ) : (
                <button className="delete-button" disabled>
                  Delete Selected
                </button>
              )}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}

    </>
  );
};

export default MittarvToolsTableEdit;
