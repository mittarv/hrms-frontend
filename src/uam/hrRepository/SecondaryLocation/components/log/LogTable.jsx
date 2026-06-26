import ViewMoreText from "../../../Common/components/ViewMoreText";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("upcoming")) return "upcoming";
  if (normalized.includes("active")) return "active";
  if (normalized.includes("pending")) return "pending";
  if (normalized.includes("rejected")) return "rejected";
  if (normalized.includes("completed")) return "completed";
  return "default";
};

const isCompletedStatus = (status) => String(status || "").toLowerCase().includes("completed");

const LogTable = ({ logs, loading, onEdit, onDelete, loadMoreRef, hasNext }) => {
  return (
    <div className="sl_log_table_card">
      <table className="sl_log_table">
        <thead>
          <tr>
            <th className="text-table-header">Start Date</th>
            <th className="text-table-header">End Date</th>
            <th className="text-table-header">Duration</th>
            <th className="text-table-header">Status</th>
            <th className="text-table-header">Comments</th>
            <th className="text-table-header">Action</th>
          </tr>
        </thead>
        <tbody>
          {!logs.length && !loading && (
            <tr>
              <td className="sl_log_empty_cell" colSpan={6}>
                No location logs found.
              </td>
            </tr>
          )}

          {logs.map((log) => (
            <tr key={log.logId}>
              <td>{formatDate(log.startDate)}</td>
              <td>{formatDate(log.endDate)}</td>
              <td>{String(log.durationDays || 0).padStart(2, "0")} Day(s)</td>
              <td>
                <span className={`sl_log_status_chip ${getStatusClass(log.status)}`}>{log.status}</span>
              </td>
              <td>
                <ViewMoreText
                  text={log.comments || "-"}
                  maxLength={45}
                  modalTitle="Comments"
                  textClassName="sl_log_comment_text"
                  buttonClassName="sl_log_view_more_btn"
                />
              </td>
              <td>
                <div className="sl_log_actions">
                  <button
                    type="button"
                    className="edit text-btn-primary"
                    onClick={() => onEdit(log)}
                    disabled={isCompletedStatus(log.status)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="delete text-btn-primary"
                    onClick={() => onDelete(log)}
                    disabled={isCompletedStatus(log.status)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div ref={loadMoreRef} className="sl_log_infinite_sentinel" />
      {loading && logs.length > 0 && <p className="sl_log_loading_more text-tooltip-small">Loading more logs...</p>}
      {!hasNext && logs.length > 0 && <p className="sl_log_loading_more text-tooltip-small">No more logs</p>}
    </div>
  );
};

export default LogTable;
