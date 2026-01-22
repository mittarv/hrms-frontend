import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import PayrollHeader from "./components/PayrollHeader";
import PayrollContent from "./components/PayrollContent";
import "./styles/Payroll.scss";

const Payroll = () => {
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  
  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canRead = hasPermission("Payroll_read");
  
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [resetCounter, setResetCounter] = useState(0);

  // Function to reset selections (will be passed to header for API call resets)
  const resetSelections = useCallback(() => {
    setSelectedRows(new Set());
    setResetCounter(prev => prev + 1); // Increment counter to trigger reset in child components
  }, []);

  // If user doesn't have read permission, show access denied message
  if (!canRead) {
    return (
      <div className="payroll_main_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don't have permission to view payroll
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payroll_main_container">
      <PayrollHeader selectedRows={selectedRows} resetSelections={resetSelections} />
      <PayrollContent 
        onSelectionChange={setSelectedRows} 
        resetCounter={resetCounter}
      />
    </div>
  );
};

export default Payroll;
