import { useEffect, useState } from "react";
import ImportantLinkHeader from "../../uam/hrRepository/ImportantLinkHeader";
import { tableStyle } from "../../constant/tableStyle";
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
  addNewImportantLink,
  clearStateDataLink,
  deleteImportantLink,
  fetchAllImportantLinks,
  updateImportantLink,
} from "../../actions/hrRepositoryAction";
import { convertDateFormat } from "../../utills/convertDate";
import AddIcon from "../../assets/icons/add.svg";

const ImportantEditTable = ({ isEdit, toggleOptions }) => {
  const {
    StyledTableRow,
    StyledTableCell,
    TableStyle,
    TableHeaderStyle,
    ToolNameStyle,
  } = tableStyle;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAllImportantLinks());
  }, [dispatch]);

  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  const {
    importantLink,
    isImportantLinkAdded,
    isImportantLinkUpdated,
    isImportantLinkDeleted,
  } = useSelector((state) => state.hrRepositoryReducer);
  const [tempImportantLink, setTempImportantLInks] = useState(importantLink);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [deletedLinks, setDeletedLinks] = useState([]);
  const [updatedLinks, setUpdatedLinks] = useState([]);
  const [newLinks, setNewLinks] = useState([]);
  const warningRowId = 44;

  const handleLinksSelect = (linkId) => {
    if (deletedLinks.includes(linkId)) {
      return;
    } else {
      if (selectedLinks.includes(linkId)) {
        setSelectedLinks(selectedLinks.filter((id) => id !== linkId));
      } else {
        setSelectedLinks([...selectedLinks, linkId]);
      }
    }
  };

  //onChnage function  to change the data of inputboxes of existing tools
  const onChange = (toolId, e, label) => {
    setTempImportantLInks((prevtools) => {
      const updatedTool = prevtools.map((tool) => {
        if (tool.id === toolId) {
          return { ...tool, [label]: e.target.value };
        }
        return tool;
      });
      return updatedTool;
    });
    if (updatedLinks.some((tool) => tool?.id === toolId)) {
      setUpdatedLinks((prevtools) => {
        const updatedLinks = prevtools.map((tool) => {
          if (tool.id === toolId) {
            return { ...tool, [label]: e.target.value };
          }
          return tool;
        });
        return updatedLinks;
      });
    } else {
      setUpdatedLinks([
        ...updatedLinks,
        tempImportantLink.find((tool) => tool.id === toolId),
      ]);
    }
  };
  //==============================================try to maintain the same order to avoid confusion,otherwise it will store random data in backend field=============================================================
  const handleCreateNewRow = () => {
    const newId = Math.floor(Math.random() * 100) + 899;
    let newRow = {
      id: newId,
      toolName: "",
      toolLink: "",
    };

    setNewLinks([...newLinks, newRow]);
  };
  //it will just add all the selected tools to deletedTools array
  const deleteSelectedPolicy = () => {
    if (selectedLinks.length === 0) {
      return;
    }
    setDeletedLinks((prevTools) => [...prevTools, ...selectedLinks]);
    setSelectedLinks([]);
  };
  const onChangeNewTools = (linkId, e, label) => {
    setNewLinks((prevtools) => {
      const updatedTool = prevtools.map((tool) => {
        if (tool.id === linkId) {
          return { ...tool, [label]: e.target.value };
        }
        return tool;
      });

      return updatedTool;
    });
  };

  const isValidLink = (link) => {
    if (!link || link.trim() === "") return false; 
    const regex = /^https?:\/\/.+\.[a-zA-Z]{2,3}(\/.*)?$/;
    return regex.test(link);
  };

  // Function to validate all links before submission
  const validateAllLinks = () => {
    const invalidLinks = [];
    
    // Check existing updated links
    updatedLinks.forEach((tool) => {
      if (tool.toolLink && !isValidLink(tool.toolLink)) {
        invalidLinks.push({
          type: 'existing',
          toolName: tool.toolName || 'Unnamed Tool',
          toolLink: tool.toolLink
        });
      }
    });

    // Check new links
    newLinks.forEach((tool) => {
      // Only validate if toolLink is provided (not empty)
      if (tool.toolLink && tool.toolLink.trim() !== "" && !isValidLink(tool.toolLink)) {
        invalidLinks.push({
          type: 'new',
          toolName: tool.toolName || 'New Tool',
          toolLink: tool.toolLink
        });
      }
    });

    return invalidLinks;
  };

  const saveChanges = () => {
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

    //adding new links,this will only add the new links to the backend
    if (newLinks.length !== 0 && deletedLinks.length === 0 && updatedLinks.length === 0) {
      const filterDeletedNewTools = newLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.id)
      );
      dispatch(addNewImportantLink(filterDeletedNewTools));
    }
    //this will only update the existing tools
    if (updatedLinks.length !== 0 && newLinks.length === 0 && deletedLinks.length === 0) {
      //============================================update a tool=============================================================
      const filterDeletedExistingTools = updatedLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.toolId)
      );

      dispatch(updateImportantLink(filterDeletedExistingTools));
    }
    if(newLinks.length !== 0 && updatedLinks.length !== 0 && deletedLinks.length === 0){
      const filterDeletedNewTools = newLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.id)
      );
      const filterDeletedExistingTools = updatedLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.toolId)
      );
      dispatch(addNewImportantLink(filterDeletedNewTools));
      dispatch(updateImportantLink(filterDeletedExistingTools));
    }
    //this will only delete the tools
    if (deletedLinks.length !== 0) {
      //==============================implemeting the delete policy function=======================================
      const rowsToDelete = deletedLinks.filter(
        (id) => !newLinks.some((newTool) => newTool.id === id)
      );
      dispatch(deleteImportantLink(rowsToDelete));
    }
  };

  useEffect(() => {
    if (
      isImportantLinkAdded ||
      isImportantLinkUpdated ||
      isImportantLinkDeleted
    ) {
      toggleOptions();
      dispatch(clearStateDataLink());
    }
  }, [
    isImportantLinkAdded,
    isImportantLinkUpdated,
    isImportantLinkDeleted,
    dispatch,
    toggleOptions
  ]);

  return (
    <>
      <ImportantLinkHeader
        isEdit={isEdit}
        toggleOptions={toggleOptions}
        saveChanges={saveChanges}
      />
      <TableContainer style={TableStyle}>
        <Table style={{ marginTop: "20px" }}>
          <TableHead>
            <TableRow>
              <StyledTableCell style={TableHeaderStyle}>
                Tool Name
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Tool Link
              </StyledTableCell>
              {allToolsAccessDetails?.[selectedToolName] >= 500 && (
                <>
                  <StyledTableCell style={TableHeaderStyle}>
                    Last Modified date
                  </StyledTableCell>
                  <StyledTableCell style={TableHeaderStyle}>
                    Last Modified by
                  </StyledTableCell>
                </>
              )}

              <StyledTableCell style={TableHeaderStyle}>
                Created by
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Created Date
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tempImportantLink &&
              tempImportantLink?.map((tool) => (
                <StyledTableRow
                  key={tool.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{
                    backgroundColor: deletedLinks.includes(tool.id)
                      ? "#FFF5F5"
                      : selectedLinks.includes(tool.id)
                      ? "#E9F2FE"
                      : "",
                    ...(tool.id === warningRowId ? "#FF8B8B" : ""),
                  }}
                >
                  <TableCell style={ToolNameStyle} component="th" scope="row">
                    <div className="tool_input_div">
                      <Checkbox
                        checked={
                          selectedLinks.includes(tool.id) ||
                          deletedLinks.includes(tool.id)
                        }
                        onChange={() => {
                          handleLinksSelect(tool.id);
                        }}
                        style={{
                          color: deletedLinks.includes(tool.id)
                            ? "#FF8B8B"
                            : "#B7BFC6",
                          marginRight: "0px",
                        }}
                      />
                      {deletedLinks.includes(tool.id) &&
                      tool?.toolName !== "" ? (
                        <p className="text127 tool_input ">
                          {tool.toolName.length > 20
                            ? tool.toolName.substring(0, 20) + "..."
                            : tool.toolName}
                        </p>
                      ) : (
                        <textarea
                          rows={1}
                          placeholder="enter tool name"
                          className={`text7 tool_input ${
                            tool.toolName ===
                            importantLink.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.toolName
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="text"
                          value={tool?.toolName}
                          onChange={(e) => {
                            onChange(tool.id, e, "toolName");
                          }}
                          style={{
                            width: `${
                              tool?.toolName
                                ? tool.toolName.length * 10 + 10
                                : 120
                            }px`, // Setting min-width based on the length of the initial value
                            maxWidth: "200px",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell style={ToolNameStyle} component="th" scope="row">
                    <div className="tool_input_div">
                      {deletedLinks.includes(tool.id) &&
                      tool?.toolLink !== "" ? (
                        <p className="text127 tool_input ">
                          {tool.toolLink.length > 20
                            ? tool.toolLink.substring(0, 20) + "..."
                            : tool.toolLink}
                        </p>
                      ) : (
                        <textarea
                          rows={1}
                          placeholder="enter tool link (e.g., https://example.com)"
                          className={`text7 tool_input ${
                            tool.toolLink ===
                            importantLink.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.toolLink
                              ? ""
                              : "edited_input_box"
                          } ${
                            tool.toolLink && !isValidLink(tool.toolLink) 
                              ? "invalid_link" 
                              : ""
                          }`}
                          type="text"
                          value={tool?.toolLink}
                          onChange={(e) => {
                            onChange(tool.id, e, "toolLink");
                          }}
                          style={{
                            width: `${
                              tool?.toolLink
                                ? tool.toolLink.length * 10 + 10
                                : 120
                            }px`, // Setting min-width based on the length of the initial value
                            maxWidth: "200px",
                            borderColor: tool.toolLink && !isValidLink(tool.toolLink) 
                              ? "#ff0000" 
                              : ""
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  { allToolsAccessDetails?.[selectedToolName] >= 500 && (
                    <>
                      <TableCell style={ToolNameStyle}>
                        {convertDateFormat(tool.updatedAt)}
                      </TableCell>
                      <TableCell style={ToolNameStyle}>
                        {tool.modifier?.name}
                      </TableCell>
                    </>
                  )}
                  <TableCell style={ToolNameStyle}>
                    {tool.creator?.name}
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    {convertDateFormat(tool.createdAt)}
                  </TableCell>
                </StyledTableRow>
              ))}

            {newLinks &&
              newLinks.map((tool) => (
                <StyledTableRow
                  key={tool.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{
                    backgroundColor: deletedLinks.includes(tool.id)
                      ? "#FFF5F5"
                      : selectedLinks.includes(tool.id)
                      ? "#E9F2FE"
                      : "",
                    ...(tool.id === warningRowId ? "#FF8B8B" : ""),
                  }}
                >
                  <TableCell style={ToolNameStyle} component="th" scope="row">
                    <div className="tool_input_div">
                      {deletedLinks.includes(tool.id) &&
                      tool?.toolName !== "" ? (
                        <p className="text127 tool_input ">{tool?.toolName}</p>
                      ) : (
                        <textarea
                          rows={1}
                          placeholder="enter tool name"
                          className="text7 tool_input"
                          type="text"
                          value={tool?.toolName}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "toolName");
                          }}
                          style={{
                            maxWidth: "10vw",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell style={ToolNameStyle} component="th" scope="row">
                    <div className="tool_input_div">
                      {deletedLinks.includes(tool.id) &&
                      tool?.toolLink !== "" ? (
                        <p className="text127 tool_input ">{tool?.toolLink}</p>
                      ) : (
                        <textarea
                          rows={1}
                          placeholder="enter tool link (e.g., https://example.com)"
                          className={`text7 tool_input ${
                            tool.toolLink && !isValidLink(tool.toolLink) 
                              ? "invalid_link" 
                              : ""
                          }`}
                          type="text"
                          value={tool?.toolLink}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "toolLink");
                          }}
                          style={{
                            maxWidth: "10vw",
                            borderColor: tool.toolLink && !isValidLink(tool.toolLink) 
                              ? "#ff0000" 
                              : ""
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
      <button
        className="create-new-button"
        onClick={handleCreateNewRow}
        style={{ float: "left !important", marginRight: "auto" }}
      >
        <img src={AddIcon} alt="right-arrow" /> Create New
      </button>
      {selectedLinks.length !== 0 || deletedLinks.length !== 0 ? (
        <div className="deleteButtons-section">
          {selectedLinks.length !== 0 ? (
            <button className="delete-button" onClick={deleteSelectedPolicy}>
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
    </>
  );
};

export default ImportantEditTable;