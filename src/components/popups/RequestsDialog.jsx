import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tableStyle } from "../../constant/tableStyle";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  getAllKnownIssuesActivityLog,
  getAllPendingKnownIssuesApprovalRequest,
  updateActionStatus,
} from "../../actions/knownIssuesActions";
import { convertDateFormat } from "../../utills/convertDate";
import "./RequestsDialog.scss";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <p className="text105">{children}</p>
        </Box>
      )}
    </div>
  );
};

const RequestsDialog = ({ open, onClose }) => {
  const { StyledTableCell, TableHeaderStyle, KnownIssueStyle } = tableStyle;
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch();
  const { pendingRequests, activityLog, loading } = useSelector(
    (state) => state.knownIssues
  );

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (open) {
      dispatch(getAllPendingKnownIssuesApprovalRequest());
      dispatch(getAllKnownIssuesActivityLog());
    }
  }, [open, dispatch]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAction = (actionStatus,issueId,userId) => {
    dispatch(updateActionStatus(actionStatus,issueId,userId)).then(() => {
      dispatch(getAllPendingKnownIssuesApprovalRequest());
      dispatch(getAllKnownIssuesActivityLog());
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleChange}>
          <Tab
            style={{ color: "#033348", fontWeight: "bold" }}
            label="Pending Requests"
          />
          <Tab
            style={{ color: "#033348", fontWeight: "bold" }}
            label="Activity Log"
          />
        </Tabs>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <div>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell style={TableHeaderStyle}>
                        S.no
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Requested By
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Requested On
                      </StyledTableCell>
                      {/* <StyledTableCell style={TableHeaderStyle}>
                        What has been changed
                      </StyledTableCell> */}
                      <StyledTableCell style={TableHeaderStyle}>
                        JIRA Ticket No
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Action
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRequests &&
                      pendingRequests.map((request, index) => (
                        <TableRow key={index}>
                          <TableCell style={KnownIssueStyle}>
                            {index + 1}
                          </TableCell>
                          <TableCell style={KnownIssueStyle}>
                            {request.modifier.lastUpdatedByUser?.name || "N/A"}
                          </TableCell>
                          <TableCell style={KnownIssueStyle}>
                            {convertDateFormat(request.requestedOn) || "N/A"}
                          </TableCell>
                          {/* <TableCell style={KnownIssueStyle}>
                            {request.modifier.issueFaced}
                          </TableCell> */}
                          <TableCell style={KnownIssueStyle}>
                            {request.modifier.jiraNo || "N/A"}
                          </TableCell>
                          <TableCell style={KnownIssueStyle}>
                            <div className="approve_reject_buttons">
                              <button
                                type="button"
                                className="approve_button"
                                onClick={() =>
                                  handleAction(
                                    10,// Approve actionStatus
                                    request.issueId,
                                    user.userId
                                  )
                                }
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="reject_button"
                                onClick={() =>
                                  handleAction(
                                    20, // Reject actionStatus
                                    request.issueId,
                                    user.userId
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <div>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell style={TableHeaderStyle}>
                        S.no
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Requested By
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Requested On
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        JIRA Ticket No
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Action Taken By
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Action Taken
                      </StyledTableCell>
                      <StyledTableCell style={TableHeaderStyle}>
                        Action Taken On
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityLog.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell style={KnownIssueStyle}>
                          {index + 1}
                        </TableCell>
                        <TableCell style={KnownIssueStyle}>
                          {log.requestedByUser.name}
                        </TableCell>
                        <TableCell style={KnownIssueStyle}>
                          {convertDateFormat(log.requestedOn)}
                        </TableCell>
                        <TableCell style={KnownIssueStyle}>
                          {log.jiraNo}
                        </TableCell>
                        <TableCell style={KnownIssueStyle}>
                          {log.actionTakenByUser.name}
                        </TableCell>
                        <TableCell style={KnownIssueStyle}>
                          {log.actionTaken === 10
                            ? "Approved"
                            : log.actionTaken === 20
                            ? "Rejected"
                            : "Pending"}
                        </TableCell>
                        <TableCell style={KnownIssueStyle}>
                          {convertDateFormat(log.actionTakenOn)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabPanel>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestsDialog;
