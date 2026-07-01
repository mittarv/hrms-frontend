import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPayrollLevel,
  getPayrollLevels,
  updatePayrollLevel,
} from "../../../../actions/hrRepositoryAction";
import "./PayrollLevelManagement.scss";

const PayrollLevelManagement = () => {
  const dispatch = useDispatch();
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const {
    myHrmsAccess,
    payrollLevels,
    payrollLevelsLoading,
    payrollLevelsMutationLoading,
  } = useSelector((state) => state.hrRepositoryReducer);

  const [newLevelName, setNewLevelName] = useState("");
  const [editingLevelKey, setEditingLevelKey] = useState("");
  const [editingLevelName, setEditingLevelName] = useState("");

  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some((perm) => perm.name === permissionName);
  };

  const canRead = hasPermission("PayrollLevelManagement_read");
  const canCreate = hasPermission("PayrollLevelManagement_create");
  const canUpdate = hasPermission("PayrollLevelManagement_update");

  useEffect(() => {
    if (canRead) {
      dispatch(getPayrollLevels());
    }
  }, [canRead, dispatch]);

  const sortedLevels = useMemo(() => {
    return [...(payrollLevels || [])].sort((a, b) => Number(a.key) - Number(b.key));
  }, [payrollLevels]);

  const notify = (message, severity = "info") => {
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: { message, severity },
    });
  };

  const handleCreate = () => {
    const trimmedLevelName = String(newLevelName || "").trim();

    if (!trimmedLevelName) {
      notify("Please enter level name", "error");
      return;
    }

    dispatch(createPayrollLevel(trimmedLevelName));
    setNewLevelName("");
  };

  const handleEdit = (level) => {
    setEditingLevelKey(level.key);
    setEditingLevelName(level.name);
  };

  const handleCancelEdit = () => {
    setEditingLevelKey("");
    setEditingLevelName("");
  };

  const handleSaveEdit = () => {
    const trimmedLevelName = String(editingLevelName || "").trim();

    if (!trimmedLevelName) {
      notify("Please enter level name", "error");
      return;
    }

    dispatch(updatePayrollLevel(editingLevelKey, trimmedLevelName));
    handleCancelEdit();
  };

  if (!canRead) {
    return (
      <div className="payroll_level_management_container">
        <div className="payroll_level_management_empty_state">
          You don&apos;t have permission to view payroll level management
        </div>
      </div>
    );
  }

  return (
    <div className="payroll_level_management_container">
      <div className="payroll_level_management_header">
        <h3>Payroll Level Management</h3>
      </div>

      <div className="payroll_level_management_create_row">
        <input
          type="text"
          value={newLevelName}
          onChange={(event) => setNewLevelName(event.target.value)}
          placeholder="Enter new payroll level name"
          disabled={!canCreate || payrollLevelsMutationLoading}
        />
        <button
          onClick={handleCreate}
          disabled={!canCreate || payrollLevelsMutationLoading}
        >
          Create Level
        </button>
      </div>

      <div className="payroll_level_management_table_wrapper">
        {payrollLevelsLoading ? (
          <div className="payroll_level_management_empty_state">Loading payroll levels...</div>
        ) : (
          <table className="payroll_level_management_table">
            <thead>
              <tr>
                <th>Level Key</th>
                <th>Level Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedLevels.map((level) => {
                const isEditing = editingLevelKey === level.key;

                return (
                  <tr key={level.key}>
                    <td>{level.key}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingLevelName}
                          onChange={(event) => setEditingLevelName(event.target.value)}
                          disabled={payrollLevelsMutationLoading}
                        />
                      ) : (
                        level.name
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="payroll_level_management_actions">
                          <button
                            onClick={handleSaveEdit}
                            disabled={!canUpdate || payrollLevelsMutationLoading}
                          >
                            Save
                          </button>
                          <button
                            className="secondary"
                            onClick={handleCancelEdit}
                            disabled={payrollLevelsMutationLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="secondary"
                          onClick={() => handleEdit(level)}
                          disabled={!canUpdate || payrollLevelsMutationLoading}
                        >
                          Rename
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!sortedLevels.length && (
                <tr>
                  <td colSpan={3} className="payroll_level_management_empty_state">
                    No payroll levels found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PayrollLevelManagement;
