import { useState, useCallback } from "react";
import PayrollHeader from "./components/PayrollHeader";
import PayrollContent from "./components/PayrollContent";
import "./styles/Payroll.scss";

const Payroll = () => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [resetCounter, setResetCounter] = useState(0);

  // Function to reset selections (will be passed to header for API call resets)
  const resetSelections = useCallback(() => {
    setSelectedRows(new Set());
    setResetCounter(prev => prev + 1); // Increment counter to trigger reset in child components
  }, []);

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
