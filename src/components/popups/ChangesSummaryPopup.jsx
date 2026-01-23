import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
} from "@mui/material";
import "./ChangesSummaryPopup.scss";
import { useSelector } from "react-redux";

const ChangesSummaryPopup = ({
  changeMessages,
  handleSaveAndSendForApproval,
  jiraNumbers,
  onJiraNumberChange,
  open,
  onClose,
}) => {
  const isLoading = useSelector((state) => state.knownIssues.loading);
  const loading = useSelector((state) => state.languageTextEditor.loading);

  const jiraNumbersFilled = () => {
    return changeMessages.length === jiraNumbers.filter(Boolean).length;
  };

  const isButtonDisabled = !jiraNumbersFilled() || isLoading || loading;

  return (
    <Dialog open={open} onClose={onClose} className="main_dialog" fullWidth>
      <DialogTitle className="text141">Changes Summary</DialogTitle>
      <Divider orientation="horizontal" />
      <DialogContent>
        {changeMessages.length > 0 ? (
          <ul>
            {changeMessages.map((msg, index) => (
              <div key={index} className="summary">
                <li
                  style={{ display: "flex", alignItems: "center" }}
                  className="text105"
                >
                  <span className={`${msg.startsWith('Deleted') ? 'delete_indicator' : 'dot_indicator'}`}></span>
                  <div className="summary_text">
                    {msg}
                  </div>
                </li>
                <input
                  type="text"
                  placeholder="Enter JIRA No"
                  className="jira_no_input"
                  value={jiraNumbers[index] || ""}
                  onChange={(e) => onJiraNumberChange(index, e.target.value)}
                />
              </div>
            ))}
          </ul>
        ) : (
          <p className="text105">No changes made.</p>
        )}
      </DialogContent>
      <DialogActions>
        <button onClick={onClose} className="cancel_button">
          Close
        </button>
        {changeMessages.length > 0 && (
          <button
            className={`save_button ${isButtonDisabled ? 'disabled' : ''}`}
            onClick={handleSaveAndSendForApproval}
            disabled={isButtonDisabled}
          >
            {isLoading || loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send for Approval"
            )}
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangesSummaryPopup;
