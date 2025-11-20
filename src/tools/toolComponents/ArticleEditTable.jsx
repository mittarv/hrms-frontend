import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { tableStyle } from "../../constant/tableStyle";
import { useEffect, useState } from "react";
// import { convertDateFormat } from "../../utills/convertDate";
import AddIcon from "../../assets/icons/add.svg";
// Removed react-file-base64 due to security vulnerabilities
import ArticleHeader from "./ArticleHeader";
import {
  addNewArticle,
  clearData,
  deleteArticle,
  fetchAllArticle,
  updateArticle,
} from "../../actions/articleAction";
import { useDispatch, useSelector } from "react-redux";
import { convertNormalDate } from "../../utills/convertDate";
const ArticleEditTable = ({ toggleOptions, isEdit }) => {
  const {
    StyledTableRow,
    StyledTableCell,
    TableHeaderStyle,
    ToolNameStyle,
    TableStyle,
  } = tableStyle;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAllArticle());
  }, [dispatch]);

  const { newsArticle, isArticleAdded, isArticleUpdated, isArticleDeleted } =
    useSelector((state) => state.articleReducer);
  const [tempData, setTempData] = useState(newsArticle);
  const [newLinks, setNewLinks] = useState([]);
  const [deletedLinks, setDeletedLinks] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);
  // const [importantLink,set] = useState([]);
  const [updatedLinks, setUpdatedLinks] = useState([]);
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

  const onChange = (toolId, e, label) => {
    setTempData((prevtools) => {
      const updatedTool = prevtools.map((tool) => {
        if (tool.id === toolId) {
          if (label === "image" && label.includes("image")) {
            return { ...tool, [label]: e };
          } else {
            return { ...tool, [label]: e.target.value };
          }
        }
        return tool;
      });
      return updatedTool;
    });
    if (updatedLinks.some((tool) => tool?.id === toolId)) {
      setUpdatedLinks((prevtools) => {
        const updatedLinks = prevtools.map((tool) => {
          if (tool.id === toolId) {
            if (label === "image" && label.includes("image")) {
              return { ...tool, [label]: e };
            } else {
              return { ...tool, [label]: e.target.value };
            }
            // return { ...tool, [label]: e.target.value };
          }
          return tool;
        });
        return updatedLinks;
      });
    } else {
      setUpdatedLinks([
        ...updatedLinks,
        tempData.find((tool) => tool.id === toolId),
      ]);
    }
  };
  const onChangeNewTools = (linkId, e, label) => {
    setNewLinks((prevtools) => {
      const updatedTool = prevtools.map((tool) => {
        if (tool.id === linkId) {
          if (label === "image" && label.includes("image")) {
            return { ...tool, [label]: e };
          } else {
            return { ...tool, [label]: e.target.value };
          }
        }
        return tool;
      });

      return updatedTool;
    });
  };
  const deleteSelectedPolicy = () => {
    if (selectedLinks.length === 0) {
      return;
    }
    setDeletedLinks((prevTools) => [...prevTools, ...selectedLinks]);
    setSelectedLinks([]);
  };
  const handleCreateNewRow = () => {
    const newId = Math.floor(Math.random() * 100) + 899;
    let newRow = {
      id: newId,
      toolName: "",
      toolLink: "",
    };

    setNewLinks([...newLinks, newRow]);
  };
  const saveChanges = () => {
    //adding new links,this will only add the new links to the backend
    if (
      newLinks.length !== 0 &&
      deletedLinks.length === 0 &&
      updatedLinks.length === 0
    ) {
      const filterDeletedNewTools = newLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.id)
      );
      dispatch(addNewArticle(filterDeletedNewTools));
    }
    //this will only update the existing tools
    if (
      updatedLinks.length !== 0 &&
      newLinks.length === 0 &&
      deletedLinks.length === 0
    ) {
      //============================================update a tool=============================================================
      const filterDeletedExistingTools = updatedLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.toolId)
      );

      dispatch(updateArticle(filterDeletedExistingTools));
    }
    //====================create and update a article together===============================
    if (
      newLinks.length !== 0 &&
      updatedLinks.length !== 0 &&
      deletedLinks.length === 0
    ) {
      const filterDeletedNewTools = newLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.id)
      );
      const filterDeletedExistingTools = updatedLinks.filter(
        (tool) => !deletedLinks.some((toolId) => toolId === tool.toolId)
      );
      dispatch(addNewArticle(filterDeletedNewTools));
      dispatch(updateArticle(filterDeletedExistingTools));
    }

    //this will only delete the tools
    if (deletedLinks.length !== 0) {
      //==============================implemeting the delete policy function=======================================
      const rowsToDelete = deletedLinks.filter(
        (id) => !newLinks.some((newTool) => newTool.id === id)
      );
      dispatch(deleteArticle(rowsToDelete));
    }
  };

  useEffect(() => {
    if (isArticleAdded || isArticleUpdated || isArticleDeleted) {
      toggleOptions();
      dispatch(clearData());
    }
  }, [
    isArticleAdded,
    isArticleUpdated,
    isArticleDeleted,
    dispatch,
    toggleOptions,
  ]);
  const currentDate = new Date().toISOString().split("T")[0];
  return (
    <>
      <ArticleHeader
        toggleOptions={toggleOptions}
        isEdit={isEdit}
        saveChanges={saveChanges}
      />
      <TableContainer style={TableStyle}>
        <Table style={{ marginTop: "20px" }}>
          <TableHead>
            <TableRow>
              <StyledTableCell style={TableHeaderStyle}>Title</StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Excerpts
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Release Date
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                News Paper Name
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                News Paper Link
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Begin Date
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                End Date Edit
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>Image</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tempData &&
              tempData.map((tool) => (
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
                      {deletedLinks.includes(tool.id) && tool?.title !== "" ? (
                        <p className="text127 tool_input ">
                          {tool.title.length > 20
                            ? tool.title.substring(0, 20) + "..."
                            : tool.title}
                        </p>
                      ) : (
                        <textarea
                          rows={2}
                          placeholder="Enter Title"
                          className={`text7 tool_input ${
                            tool.title ===
                            newsArticle.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.title
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="text"
                          value={tool?.title}
                          onChange={(e) => {
                            onChange(tool.id, e, "title");
                          }}
                          style={{
                            width: `${
                              tool?.title ? tool.title.length * 10 + 10 : 120
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
                      tool?.excerpts !== "" ? (
                        <p className="text127 tool_input ">{tool?.excerpts}</p>
                      ) : (
                        <textarea
                          rows={2}
                          placeholder="Enter post summary"
                          className={`text7 tool_input ${
                            tool.excerpts ===
                            newsArticle.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.excerpts
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="text"
                          value={tool?.excerpts}
                          onChange={(e) => {
                            onChange(tool.id, e, "excerpts");
                          }}
                          style={{
                            width: `${
                              tool?.excerpts
                                ? tool.excerpts.length * 10 + 10
                                : 130
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
                      tool?.releaseDate !== "" ? (
                        <p className="text127 tool_input ">
                          {convertNormalDate(tool?.releaseDate)}
                        </p>
                      ) : (
                        <input
                          placeholder="Select release date"
                          className={`text7 tool_input ${
                            tool.releaseDate ===
                            newsArticle.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.releaseDate
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="date"
                          value={convertNormalDate(tool?.releaseDate)}
                          onChange={(e) => {
                            onChange(tool.id, e, "releaseDate");
                          }}
                          style={{
                            width: `${
                              tool?.releaseDate
                                ? tool.releaseDate.length * 10 + 10
                                : 130
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
                      tool?.newsPaperName !== "" ? (
                        <p className="text127 tool_input ">
                          {tool.newsPaperName.length > 20
                            ? tool.newsPaperName.substring(0, 20) + "..."
                            : tool.newsPaperName}
                        </p>
                      ) : (
                        <input
                          placeholder="News Paper Name"
                          className={`text7 tool_input ${
                            tool.newsPaperName ===
                            newsArticle.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.newsPaperName
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="text"
                          value={tool?.newsPaperName}
                          onChange={(e) => {
                            onChange(tool.id, e, "newsPaperName");
                          }}
                          style={{
                            width: `${
                              tool?.newsPaperName
                                ? tool.newsPaperName.length * 10 + 10
                                : 130
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
                      tool?.newsLink !== "" ? (
                        <p className="text127 tool_input ">
                          {tool.newsLink.length > 20
                            ? tool.newsLink.substring(0, 20) + "..."
                            : tool.newsLink}
                        </p>
                      ) : (
                        <input
                          placeholder="News Paper Link"
                          className={`text7 tool_input ${
                            tool.newsLink ===
                            newsArticle.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.newsLink
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="text"
                          value={tool?.newsLink}
                          onChange={(e) => {
                            onChange(tool.id, e, "newsLink");
                          }}
                          style={{
                            width: `${
                              tool?.newsLink
                                ? tool.newsLink.length * 10 + 10
                                : 130
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
                      tool?.beginDate !== "" ? (
                        <p className="text127 tool_input ">
                          {convertNormalDate(tool?.beginDate)}
                        </p>
                      ) : (
                        <input
                          placeholder="News Paper Link"
                          className={`text7 tool_input ${
                            tool.beginDate ===
                            newsArticle.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.beginDate
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="date"
                          min={currentDate}
                          value={convertNormalDate(tool?.beginDate)}
                          onChange={(e) => {
                            onChange(tool.id, e, "beginDate");
                          }}
                          style={{
                            width: `${
                              tool?.beginDate
                                ? tool.beginDate.length * 10 + 10
                                : 130
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
                      tool?.endDate !== "" ? (
                        <p className="text127 tool_input ">
                          {convertNormalDate(tool?.endDate)}
                        </p>
                      ) : (
                        <input
                          placeholder="News Paper Link"
                          className={`text7 tool_input ${
                            tool.endDate ===
                            newsArticle.find(
                              (thisTool) => thisTool.id === tool.id
                            )?.endDate
                              ? ""
                              : "edited_input_box"
                          }`}
                          type="date"
                          min={currentDate}
                          value={convertNormalDate(tool?.endDate)}
                          onChange={(e) => {
                            onChange(tool.id, e, "endDate");
                          }}
                          style={{
                            width: `${
                              tool?.endDate
                                ? tool.endDate.length * 10 + 10
                                : 130
                            }px`, // Setting min-width based on the length of the initial value
                            maxWidth: "200px",
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell style={ToolNameStyle} component="th" scope="row">
                    <div className="tool_input_div">
                      {deletedLinks.includes(tool.id) && tool?.image !== "" ? (
                        <p className="text127 tool_input ">
                          {tool.image.length > 20
                            ? tool.image.substring(0, 20) + "..."
                            : tool.image}
                        </p>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                onChange(tool.id, reader.result, "image");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text7"
                        />
                      )}
                    </div>
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
                      {deletedLinks.includes(tool.id) && tool?.title !== "" ? (
                        <p className="text127 tool_input ">{tool?.title}</p>
                      ) : (
                        <textarea
                          rows={1}
                          placeholder="enter title"
                          className="text7 tool_input"
                          type="text"
                          value={tool?.title}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "title");
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
                      tool?.excerpts !== "" ? (
                        <p className="text127 tool_input ">{tool?.excerpts}</p>
                      ) : (
                        <textarea
                          rows={2}
                          placeholder="Enter post summary"
                          className="text7 tool_input"
                          type="text"
                          value={tool?.excerpts}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "excerpts");
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
                      tool?.releaseDate !== "" ? (
                        <p className="text127 tool_input ">
                          {tool?.releaseDate}
                        </p>
                      ) : (
                        <input
                          placeholder="enter tool link"
                          className="text7 tool_input"
                          type="date"
                          value={tool?.releaseDate}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "releaseDate");
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
                      tool?.newsPaperName !== "" ? (
                        <p className="text127 tool_input ">
                          {tool?.newsPaperName}
                        </p>
                      ) : (
                        <input
                          placeholder="Enter News Paper Name"
                          className="text7 tool_input"
                          type="text"
                          value={tool?.newsPaperName}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "newsPaperName");
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
                      tool?.newsPaperLink !== "" ? (
                        <p className="text127 tool_input ">
                          {tool?.newsPaperLink}
                        </p>
                      ) : (
                        <input
                          placeholder="Enter Link"
                          className="text7 tool_input"
                          type="text"
                          value={tool?.newsPaperLink}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "newsLink");
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
                      tool?.beginDate !== "" ? (
                        <p className="text127 tool_input ">{tool?.beginDate}</p>
                      ) : (
                        <input
                          placeholder="Enter begin date"
                          className="text7 tool_input"
                          type="date"
                          min={currentDate}
                          value={tool?.beginDate}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "beginDate");
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
                      tool?.endDate !== "" ? (
                        <p className="text127 tool_input ">{tool?.endDate}</p>
                      ) : (
                        <input
                          placeholder="Enter end date"
                          className="text7 tool_input"
                          type="date"
                          value={tool?.endDate}
                          min={currentDate}
                          onChange={(e) => {
                            onChangeNewTools(tool.id, e, "endDate");
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
                      {deletedLinks.includes(tool.id) && tool?.image !== "" ? (
                        <p className="text127 tool_input ">{tool?.image}</p>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                onChangeNewTools(tool.id, reader.result, "image");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text7"
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

export default ArticleEditTable;
