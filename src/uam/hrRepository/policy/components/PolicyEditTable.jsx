import { useEffect, useState } from "react";
import PolicyTableHeader from "./PolicyTableHeader";
import { hrRepositoryTableStyle as tableStyle } from "../../constant/hrRepositoryTableStyle";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewPolicy,
  clearStateData,
  deletePolicy,
  fetchAllPolicyDocuments,
  updateExistingPolicy,
} from "../../../../actions/hrRepositoryAction";
import { convertHrRepositoryDateFormat as convertDateFormat } from "../../Common/utils/hrRepositoryDateUtils";
import AddIcon from "../../assets/icons/add.svg";
import "../styles/policyTable.scss";
const PolicyEditTable = ({ isEdit, toggleOptions }) => {
  const {
    StyledTableRow,
    StyledTableCell,
    TableStyle,
    TableHeaderStyle,
    ToolNameStyle,
    TooldetailStyle,
  } = tableStyle;
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const dispatch = useDispatch();

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canCreate = hasPermission("Policy_create");
  const canUpdate = hasPermission("Policy_update");
  const canDelete = hasPermission("Policy_delete");
  const canViewAdmin = allToolsAccessDetails?.[selectedToolName] >= 900 || 
    myHrmsAccess?.permissions?.some(perm => perm.name === "policyAdmin_view");
  useEffect(() => {
    dispatch(fetchAllPolicyDocuments());
  }, [dispatch]);
  const { error, policy, isPolicyAdded, isPolicyUpdated, isPolicyDeleted } =
    useSelector((state) => state.hrRepositoryReducer);
  const [selectedPolicy, setSelectedPolicy] = useState([]);
  const [deletedTools, setDeletedTools] = useState([]);
  const [tempTools, settempTools] = useState(policy);
  const [updatedTools, setUpdatedTools] = useState([]);
  const [newTools, setNewTools] = useState([]);
  const warningRowId = 44;

  //onChnage function  to change the data of inputboxes of existing tools
  const onChange = (toolId, e, label) => {
    settempTools((prevtools) => {
      const updatedTool = prevtools.map((tool) => {
        if (tool.id === toolId) {
          return { ...tool, [label]: e.target.value };
        }
        return tool;
      });
      return updatedTool;
    });
    if (updatedTools.some((tool) => tool?.id === toolId)) {
      setUpdatedTools((prevtools) => {
        const updatedTool = prevtools.map((tool) => {
          if (tool.id === toolId) {
            return { ...tool, [label]: e.target.value };
          }
          return tool;
        });
        return updatedTool;
      });
    } else {
      setUpdatedTools([
        ...updatedTools,
        tempTools.find((tool) => tool.id === toolId),
      ]);
    }
  };

  const handleToolSelect = (toolId) => {
    if (deletedTools.includes(toolId)) {
      return;
    } else {
      if (selectedPolicy.includes(toolId)) {
        setSelectedPolicy(selectedPolicy.filter((id) => id !== toolId));
      } else {
        setSelectedPolicy([...selectedPolicy, toolId]);
      }
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
  //==============================================try to maintain the same order to avoid confusion,otherwise it will store random data in backend field=============================================================
  const handleCreateNewRow = () => {
    if (!canCreate) {
      alert("You don't have permission to create policy");
      return;
    }
    const newId = Math.floor(Math.random() * 100) + 899;
    let newRow = {
      id: newId,
      policyName: "",
      policyLink: "",
      remarks: "",
      approvedBy: "",
      version: "",
    };

    setNewTools([...newTools, newRow]);
  };

  const isValidLink = (link) => {
    if (!link || link.trim() === "") return false; 
    const regex = /^https?:\/\/.+\.[a-zA-Z]{2,3}(\/.*)?$/;
    return regex.test(link);
  };

  // Function to validate all links before submission
  const validateAllLinks = () => {
    const invalidLinks = [];
    
    updatedTools.forEach((tool) => {
      if (tool.policyLink && !isValidLink(tool.policyLink)) {
        invalidLinks.push({
          type: 'existing',
          toolName: tool.policyName || 'Unnamed Policy',
          toolLink: tool.policyLink
        });
      }
    });

    newTools.forEach((tool) => {
      if (tool.policyLink && tool.policyLink.trim() !== "" && !isValidLink(tool.policyLink)) {
        invalidLinks.push({
          type: 'new',
          toolName: tool.policyName || 'New Policy',
          toolLink: tool.policyLink
        });
      }
    });

    return invalidLinks;
  };
  const saveChanges = () => {
    // Check permissions before saving
    if (newTools.length > 0 && !canCreate) {
      alert("You don't have permission to create policy");
      return;
    }
    if (updatedTools.length > 0 && !canUpdate) {
      alert("You don't have permission to update policy");
      return;
    }
    if (deletedTools.length > 0 && !canDelete) {
      alert("You don't have permission to delete policy");
      return;
    }

    const invalidLinks = validateAllLinks();
    
    if (invalidLinks.length > 0) {
      let alertMessage = "Invalid link(s) found:\n\n";
      invalidLinks.forEach((item, index) => {
        alertMessage += `${index + 1}. Tool: "${item.toolName}"\n   Link: "${item.toolLink}"\n\n`;
      });
      alertMessage += "Please ensure all links start with http:// or https:// and have a valid domain (e.g., .com, .in, .org)";
      
      alert(alertMessage);
      return; 
    }
    // adding condition for create a row
    if (
      newTools.length !== 0 &&
      updatedTools.length === 0 &&
      deletedTools.length === 0
    ) {
      const filterDeletedNewTools = newTools.filter(
        (tool) => !deletedTools.some((toolId) => toolId === tool.id)
      );

      dispatch(addNewPolicy(filterDeletedNewTools));
    }
    //this condition for adding and updating the tools together
    if (newTools.length !== 0 && updatedTools.length !== 0) {
      const filterDeletedNewTools = newTools.filter(
        (tool) => !deletedTools.some((toolId) => toolId === tool.id)
      );
      dispatch(addNewPolicy(filterDeletedNewTools));
      const filterDeletedExistingTools = updatedTools.filter(
        (tool) => !deletedTools.some((toolId) => toolId === tool.toolId)
      );
      dispatch(updateExistingPolicy(filterDeletedExistingTools));
    }

    // //============================================update a tool=============================================================
    if (updatedTools.length !== 0 && newTools.length === 0) {
      const filterDeletedExistingTools = updatedTools.filter(
        (tool) => !deletedTools.some((toolId) => toolId === tool.toolId)
      );
      dispatch(updateExistingPolicy(filterDeletedExistingTools));
    }

    //==============================implemeting the delete policy function=======================================
    if (deletedTools.length !== 0) {
      const rowsToDelete = deletedTools.filter(
        (id) => !newTools.some((newTool) => newTool.id === id)
      );
      if (rowsToDelete.length === 0) {
        return window.alert("Please select the policy to delete");
      } else {
        dispatch(deletePolicy(rowsToDelete));
      }
    }
  };
  //it will just add all the selected tools to deletedTools array
  const deleteSelectedPolicy = () => {
    if (!canDelete) {
      alert("You don't have permission to delete policy");
      return;
    }
    if (selectedPolicy.length === 0) {
      return;
    }
    setDeletedTools((prevTools) => [...prevTools, ...selectedPolicy]);
    setSelectedPolicy([]);
  };

  useEffect(() => {
    if (error) {
      dispatch(clearStateData());
    }
    if (isPolicyAdded || isPolicyUpdated || isPolicyDeleted) {
      toggleOptions();
      dispatch(clearStateData());
    }
  }, [
    toggleOptions,
    isPolicyAdded,
    isPolicyUpdated,
    isPolicyDeleted,
    dispatch,
    error,
  ]);

  return (
    <>
      <PolicyTableHeader
        isEdit={isEdit}
        toggleOptions={toggleOptions}
        saveChanges={saveChanges}
      />
      <TableContainer style={TableStyle}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell style={TableHeaderStyle}>
                Policy Name
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Policy Link
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Version
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Remarks
              </StyledTableCell>
              {canViewAdmin && (
                <>
                  <StyledTableCell style={TableHeaderStyle}>
                    Approved By
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Last Modified by
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Last Modified date
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Created by
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Created Date
                  </StyledTableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {tempTools &&
              tempTools?.map((tool) => (
                <StyledTableRow
                  key={tool.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{
                    backgroundColor: deletedTools.includes(tool.id)
                      ? "#FFF5F5"
                      : selectedPolicy.includes(tool.id)
                      ? "#E9F2FE"
                      : "",
                    ...(tool.id === warningRowId ? "#FF8B8B" : ""),
                  }}
                >
                  <TableCell style={ToolNameStyle} component="th" scope="row">
                    <div className="policy_tool_input_div ">
                      <Checkbox
                        checked={
                          selectedPolicy.includes(tool.id) ||
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

                      {deletedTools.includes(tool.id) &&
                      tool?.policyName !== "" ? (
                        <p className="text127 policy_tool_input">
                          {tool.policyName.length > 20
                            ? tool.policyName.substring(0, 20) + "..."
                            : tool.policyName}
                        </p>
                      ) : (
                        <textarea
                          rows={2}
                          placeholder="enter name"
                          className={`text7 policy_tool_input ${
                            tool.policyName ===
                            policy.find((thisTool) => thisTool.id === tool.id)
                              ?.policyName
                              ? ""
                              : "policy_edited_input_box"
                          }`}
                          type="text"
                          value={tool?.policyName}
                          onChange={(e) => {
                            onChange(tool.id, e, "policyName");
                          }}
                          style={{
                            width: `${
                              tool?.policyName
                                ? tool.policyName.length * 10 + 10
                                : 120
                            }px`, // Setting min-width based on the length of the initial value
                            maxWidth: "200px",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>

                  <TableCell style={ToolNameStyle}>
                    <div className="policy_tool_input_div">
                      {deletedTools.includes(tool.id) &&
                      tool?.policyLink !== "" ? (
                        <p className="text127 policy_tool_input ">
                          {tool.policyLink.length > 20
                            ? tool.policyLink.substring(0, 20) + "..."
                            : tool.policyLink}
                        </p>
                      ) : (
                        <textarea
                          rows={1}
                          placeholder="enter link"
                          className={`text7 policy_tool_input ${
                            tool.policyLink ===
                            policy.find((thisTool) => thisTool.id === tool.id)
                              ?.policyLink
                              ? ""
                              : "policy_edited_input_box"
                          }`}
                          type="text"
                          value={tool?.policyLink}
                          onChange={(e) => {
                            onChange(tool.id, e, "policyLink");
                          }}
                          style={{
                            width: `${
                              tool?.policyLink
                                ? tool.policyLink.length * 10 + 10
                                : 120
                            }px`, // Setting min-width based on the length of the initial value
                            maxWidth: "200px",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    <div className="policy_tool_input_div">
                      {deletedTools.includes(tool.id) &&
                      tool?.version !== "" ? (
                        <p className="text127 policy_tool_input ">{tool?.version}</p>
                      ) : (
                        <input
                          placeholder="enter version"
                          className={`text7 policy_tool_input ${
                            tool.version ===
                            policy.find((thisTool) => thisTool.id === tool.id)
                              ?.version
                              ? ""
                              : "policy_edited_input_box"
                          }`}
                          type="text"
                          value={tool?.version}
                          onChange={(e) => {
                            onChange(tool.id, e, "version");
                          }}
                          style={{
                            width: `${
                              tool?.version
                                ? tool.version.length * 10 + 10
                                : 120
                            }px`, // Setting min-width based on the length of the initial value
                            maxWidth: "200px",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>

                  <TableCell style={ToolNameStyle}>
                    <div className="policy_tool_input_div" title="tool">
                      {deletedTools.includes(tool.id) &&
                      tool?.remarks !== "" ? (
                        <p className="text127 policy_tool_input" title="remarks">
                          {tool.remarks.length > 20
                            ? tool.remarks.substring(0, 20) + "..."
                            : tool.remarks}
                        </p>
                      ) : (
                        <textarea
                          rows={2}
                          placeholder="enter remarks"
                          className={`text7 policy_tool_input ${
                            tool.remarks ===
                            policy.find((thisTool) => thisTool.id === tool.id)
                              ?.remarks
                              ? ""
                              : "policy_edited_input_box"
                          }`}
                          type="text"
                          value={tool?.remarks}
                          onChange={(e) => {
                            onChange(tool.id, e, "remarks");
                          }}
                          style={{
                            width: `${
                              tool?.remarks
                                ? tool.remarks.length * 10 + 10
                                : 120
                            }px`, // Setting min-width based on the length of the initial value
                            maxWidth: "200px",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  {canViewAdmin && (
                    <TableCell style={ToolNameStyle}>
                      <div className="policy_tool_input_div">
                        {deletedTools.includes(tool.id) &&
                        tool?.approvedBy !== "" ? (
                          <p className="text127 policy_tool_input ">
                            {tool?.approvedBy}
                          </p>
                        ) : (
                          <input
                            placeholder="enter name"
                            className={`text7 policy_tool_input ${
                              tool.approvedBy ===
                              policy.find((thisTool) => thisTool.id === tool.id)
                                ?.approvedBy
                                ? ""
                                : "policy_edited_input_box"
                            }`}
                            type="text"
                            value={tool?.approvedBy}
                            onChange={(e) => {
                              onChange(tool.id, e, "approvedBy");
                            }}
                            style={{
                              // width: `${
                              //   tool?.approvedBy
                              //     ? tool.approvedBy.length * 10 + 10
                              //     : 10
                              // }px`, // Setting min-width based on the length of the initial value
                              maxWidth: "100px",
                            }}
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                  {canViewAdmin && (
                    <>
                      <TableCell style={ToolNameStyle}>
                        {tool.modifier?.name}
                      </TableCell>
                      <TableCell style={ToolNameStyle}>
                        {convertDateFormat(tool.updatedAt)}
                      </TableCell>
                      <TableCell style={ToolNameStyle}>
                        {tool.creator?.name}
                      </TableCell>
                      <TableCell style={ToolNameStyle}>
                        {convertDateFormat(tool.createdAt)}
                      </TableCell>
                    </>
                  )}
                </StyledTableRow>
              ))}

            {newTools &&
              newTools?.map((tool) => (
                <StyledTableRow
                  key={tool.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{
                    backgroundColor: deletedTools.includes(tool.id)
                      ? "#FFF5F5"
                      : selectedPolicy.includes(tool.id)
                      ? "#E9F2FE"
                      : "",
                    ...(tool.id === warningRowId ? "#FF8B8B" : ""),
                  }}
                >
                  <TableCell component="th" scope="row">
                    <div className="policy_tool_input_div policy_tool_name">
                      {deletedTools.includes(tool.id) &&
                      tool?.policyName !== "" ? (
                        <p className="text127 policy_tool_input ">
                          {tool?.policyName}
                        </p>
                      ) : (
                        <textarea
                          placeholder="enter policy name"
                          className="text7 policy_tool_input"
                          type="text"
                          value={tool?.policyName}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "policyName");
                          }}
                          style={{
                            maxWidth: "10vw",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="left" style={TooldetailStyle}>
                    <div className="policy_tool_input_div">
                      {deletedTools.includes(tool.id) &&
                      tool?.policyLink !== "" ? (
                        <strike className="text127 policy_tool_input ">
                          {tool?.policyLink}
                        </strike>
                      ) : (
                        <textarea
                          placeholder="enter policy link"
                          className="text117 policy_tool_input"
                          type="text"
                          value={tool?.policyLink}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "policyLink");
                          }}
                          style={{
                            maxWidth: "10vw",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="left" style={TooldetailStyle}>
                    <div className="policy_tool_input_div">
                      {deletedTools.includes(tool.id) &&
                      tool?.version !== "" ? (
                        <strike className="text127 policy_tool_input ">
                          {tool?.version}
                        </strike>
                      ) : (
                        <textarea
                          placeholder="enter version"
                          className="text117 policy_tool_input"
                          type="text"
                          value={tool?.version}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "version");
                          }}
                          style={{
                            maxWidth: "10vw",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="left" style={TooldetailStyle}>
                    <div className="policy_tool_input_div">
                      {deletedTools.includes(tool.id) &&
                      tool?.remarks !== "" ? (
                        <strike className="text127 policy_tool_input ">
                          {tool?.remarks}
                        </strike>
                      ) : (
                        <textarea
                          placeholder="Enter remarks"
                          className="text117 policy_tool_input"
                          type="text"
                          value={tool?.remarks}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "remarks");
                          }}
                          style={{
                            maxWidth: "10vw",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="left" style={TooldetailStyle}>
                    <div className="policy_tool_input_div">
                      {deletedTools.includes(tool.id) &&
                      tool?.approvedBy !== "" ? (
                        <strike className="text127 policy_tool_input ">
                          {tool?.version}
                        </strike>
                      ) : (
                        <textarea
                          placeholder="Enter Approved by "
                          className="text117 policy_tool_input"
                          type="text"
                          value={tool?.approvedBy}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "approvedBy");
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
      {(canCreate || allToolsAccessDetails?.[selectedToolName] >= 900) && (
        <button
          className="policy_create_new_button"
          onClick={handleCreateNewRow}
          style={{ float: "left !important", marginRight: "auto" }}
        >
          <img src={AddIcon} alt="right-arrow" /> Create New
        </button>
      )}
      {(canDelete || allToolsAccessDetails?.[selectedToolName] >= 900) && (selectedPolicy.length !== 0 || deletedTools.length !== 0) ? (
        <div className="policy_deleteButtons_section">
          {selectedPolicy.length !== 0 ? (
            <button className="policy_delete_button" onClick={deleteSelectedPolicy}>
              Delete Selected
            </button>
          ) : (
            <button className="policy_delete_button" disabled>
              Delete Selected
            </button>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default PolicyEditTable;
