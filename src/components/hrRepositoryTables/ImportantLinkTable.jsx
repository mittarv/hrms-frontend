import { useEffect } from "react";
import { tableStyle } from "../../constant/tableStyle";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import ImportantLinkHeader from "../../uam/hrRepository/ImportantLinkHeader";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllImportantLinks } from "../../actions/hrRepositoryAction";
import { convertDateFormat } from "../../utills/convertDate";
import LoadingSpinner from "../../uam/hrRepository/Common/components/LoadingSpinner";
const ImportantLinkTable = ({ isEdit, toggleOptions }) => {
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

  const { importantLink, loading } = useSelector((state) => state.hrRepositoryReducer);
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  return (
    <>
      <ImportantLinkHeader isEdit={isEdit} toggleOptions={toggleOptions} />
      {loading ? (
        <LoadingSpinner message="Loading Important Links..." height="40vh" />
      ) : (
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
            {importantLink &&
              importantLink?.map((tool, index) => (
                <StyledTableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell style={ToolNameStyle}>
                    <Tooltip title={tool.toolName}>
                      {tool.toolName.length > 40
                        ? tool.toolName.substring(0, 40) + "..."
                        : tool.toolName}
                    </Tooltip>
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    <a href={tool.toolLink} target="_blank" rel="noreferrer">
                      {tool.toolLink.length > 40
                        ? tool.toolLink.substring(0, 40) + "..."
                        : tool.toolLink}
                    </a>
                  </TableCell>
                  {allToolsAccessDetails?.[selectedToolName] >= 500 && (
                    <>
                      <TableCell style={ToolNameStyle}>
                        {convertDateFormat(tool.updatedAt)}
                      </TableCell>
                      <TableCell style={ToolNameStyle}>
                        {tool.modifier?.name}
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
          </TableBody>
        </Table>
      </TableContainer>)}
    </>
  );
};

export default ImportantLinkTable;
