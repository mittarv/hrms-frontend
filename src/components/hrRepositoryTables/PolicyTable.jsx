import { useEffect } from "react";
import PolicyTableHeader from "../../uam/hrRepository/PolicyTableHeader";
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
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPolicyDocuments } from "../../actions/hrRepositoryAction";
import { convertDateFormat } from "../../utills/convertDate";
import LoadingSpinner from "../../uam/hrRepository/Common/components/LoadingSpinner";

const PolicyTable = ({ isEdit, toggleOptions }) => {
  const {
    StyledTableRow,
    StyledTableCell,
    TableStyle,
    TableHeaderStyle,
    ToolNameStyle,
  } = tableStyle;

  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllPolicyDocuments());
  }, [dispatch]);
  const { policy, loading } = useSelector((state) => state.hrRepositoryReducer);
  return (
    <>
      <PolicyTableHeader isEdit={isEdit} toggleOptions={toggleOptions} />
      {loading ? <LoadingSpinner message="Loading Policies..." height="40vh" /> : 
      <TableContainer style={TableStyle}>
        <Table style={{ marginTop: "20px" }}>
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
              {allToolsAccessDetails?.[selectedToolName] >= 500 && (
                <>
                  <StyledTableCell style={TableHeaderStyle}>
                    Approved by
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
                    Created date
                  </StyledTableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {policy &&
              policy?.map((tool) => (
                <StyledTableRow key={tool.id}>
                  <TableCell style={ToolNameStyle}>
                    <Tooltip title={tool.policyName} placement="bottom">
                      {tool.policyName.length > 40
                        ? tool.policyName.substring(0, 40) + "..."
                        : tool.policyName}
                    </Tooltip>
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    <a href={tool.policyLink} target="_blank" rel="noreferrer">
                      {tool.policyLink.length > 40
                        ? tool.policyLink.substring(0, 40) + "..."
                        : tool.policyLink}
                    </a>
                  </TableCell>

                  <TableCell style={ToolNameStyle}>{tool.version}</TableCell>
                  <TableCell style={ToolNameStyle}>
                  <Tooltip title={tool.remarks} placement="bottom">
                    {tool.remarks.length > 40
                      ? tool.remarks.substring(0, 40) + "..."
                      : tool.remarks}
                      </Tooltip>
                  </TableCell>
                  {allToolsAccessDetails?.[selectedToolName] >= 500 && (
                    <>
                        <TableCell style={ToolNameStyle}>
                          {tool.approvedBy}
                        </TableCell>
                        <TableCell style={ToolNameStyle}>
                          {tool.modifier?.name}
                        </TableCell>
                        <TableCell style={ToolNameStyle}>
                          {convertDateFormat(tool.updatedAt)}
                        </TableCell>
                        <TableCell style={ToolNameStyle}>
                          {" "}
                          {tool.creator?.name}
                        </TableCell>   
                        <TableCell style={ToolNameStyle}>
                          {" "}
                          {convertDateFormat(tool.createdAt)}
                        </TableCell>
                    </>
                  )}
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>}
    </>
  );
};

export default PolicyTable;
