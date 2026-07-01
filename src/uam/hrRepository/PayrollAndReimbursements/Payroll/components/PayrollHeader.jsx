import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { finalizePayroll, generatePayroll, markFinalizedPayslipsAsPending, exportPayrollAsCsv, getNetPayPayrollAmount, deletePayrollRecords } from "../../../../../actions/hrRepositoryAction.js";
import { Payroll_Status, CURRENCY_SYMBOL, getAllMonthsLocale } from "../utils/PayrollUtils.js";
import Export_File from "../../../assets/icons/export_file_icon.svg";
import Finalize_Icon from "../../../assets/icons/finalize_icon.svg";
import Edit_Icon_Active from "../../../assets/icons/edit_icon_blue.svg";
import Edit_Icon_Disabled from "../../../assets/icons/edit_icon_grey.svg";
import Delete_Icon_Active from "../../../assets/icons/delete_red_icon.svg";
import ConfirmationPopup from "../../../Common/components/ConfirmationPopup.jsx";
import "../styles/PayrollHeader.scss";

const PayrollHeader = ({ selectedRows, resetSelections }) => {
  const dispatch = useDispatch();
  const { payrollData, payrollPagination, payrollFilters, isAllPayrollFinalized, isAllPayrollGenerated, netPayPayrollAmount, myHrmsAccess } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  
  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  const canGenerate = hasPermission("Payroll_Generate");
  const canFinalize = hasPermission("Payroll_finalize");
  const canEdit = hasPermission("Payroll_Edit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' or 'alert'
    heading: '',
    message: '',
    onConfirm: null,
    confirmText: 'Yes, Continue',
    cancelText: 'Cancel'
  });
  const { pageSize, currentPage } = payrollPagination;

  const {selectedMonth, selectedYear, searchQuery} = payrollFilters;

  useEffect(()=>{
    dispatch(getNetPayPayrollAmount(selectedMonth, selectedYear));
  },[selectedYear, selectedMonth, dispatch])

  // Get current month and year
  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();

  const normalizeMonthName = (monthValue) => {
    if (monthValue === null || monthValue === undefined || monthValue === "") {
      return "";
    }

    if (typeof monthValue === 'number') {
      return getAllMonthsLocale()[monthValue - 1] || "";
    }

    const numericMonth = Number(monthValue);
    if (!Number.isNaN(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
      return getAllMonthsLocale()[numericMonth - 1] || "";
    }

    return String(monthValue).trim();
  };

  const firstLoadedPayrollDate = payrollData?.[0]?.payrollStartDate;
  const loadedPayrollDate = firstLoadedPayrollDate ? new Date(firstLoadedPayrollDate) : currentDate;
  const loadedPayrollMonthName = loadedPayrollDate.toLocaleDateString("en-US", { month: "long" });
  const loadedPayrollYear = loadedPayrollDate.getFullYear();

  // Determine if current view is the current month/year
  const resolvedSelectedMonth = selectedMonth != null ? normalizeMonthName(selectedMonth) : loadedPayrollMonthName;
  const resolvedSelectedYear = selectedYear != null ? Number(selectedYear) : loadedPayrollYear;
  const isCurrentMonthView =
    String(resolvedSelectedMonth).toLowerCase() === String(monthName).toLowerCase() &&
    Number(resolvedSelectedYear) === Number(year);

  // Handle finalize payroll
  const handleFinalizePayroll = async () => {
    if (!canFinalize) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'Permission Denied',
        message: 'You don\'t have permission to finalize payroll',
        onConfirm: null
      });
      return;
    }
    
    if (!selectedRows || selectedRows.size === 0) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'No Selection',
        message: 'Please select at least one employee to finalize payroll',
        onConfirm: null
      });
      return;
    }

    // Get employee UUIDs from selected rows
    // selectedRows contains payslipId or empUuid as IDs
    const selectedEmployees = payrollData.filter((emp) =>
      selectedRows.has(emp.payslipId || emp.empUuid)
    );


    const pendingEmployees = selectedEmployees.filter(
      (emp) => emp.status === Payroll_Status.PENDING
    );

    if (pendingEmployees.length === 0) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'No Pending Payrolls',
        message: 'No pending payrolls selected. Only pending payrolls can be finalized.',
        onConfirm: null
      });
      return;
    }

    if (pendingEmployees.length < selectedEmployees.length) {
      const nonPendingCount = selectedEmployees.length - pendingEmployees.length;
      setModalState({
        isOpen: true,
        type: 'confirm',
        heading: 'Some Payrolls Already Finalized',
        message: `${nonPendingCount} selected employee(s) have already been finalized and will be skipped. Continue with ${pendingEmployees.length} pending payroll(s)?`,
        confirmText: 'Yes, Continue',
        cancelText: 'Cancel',
        onConfirm: () => proceedWithFinalization(pendingEmployees)
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: 'confirm',
      heading: 'Finalize Payroll',
      message: `Are you sure you want to finalize payroll for ${pendingEmployees.length} employee(s)? This action will calculate and lock the final salary amounts.`,
      confirmText: 'Yes, Finalize',
      cancelText: 'Cancel',
      onConfirm: () => proceedWithFinalization(pendingEmployees)
    });
  };

  const proceedWithFinalization = async (pendingEmployees) => {
    setModalState({ ...modalState, isOpen: false });
    setIsProcessing(true);
    try {
      const pendingEmployeePaysilpIds = pendingEmployees.map((emp) => emp.payslipId);
      const getSalaryComponentsDataParams = {
          currentPage, 
          pageSize, 
          selectedMonth, 
          selectedYear, 
          searchQuery
      };    
      await dispatch(finalizePayroll(pendingEmployeePaysilpIds, getSalaryComponentsDataParams));
    } catch (error) {
      console.error("Error finalizing payroll:", error);
    } finally {
      setIsProcessing(false);
      // Clear selection after finalization attempt
      if (resetSelections) {
        resetSelections();
      }
    }
  };

  // handle edit button on click it should make all finazlized payrolls to pending again
  const handleEditPayroll = async() => {
    if (!canEdit) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'Permission Denied',
        message: 'You don\'t have permission to edit payroll',
        onConfirm: null
      });
      return;
    }
    
    if (!selectedRows || selectedRows.size === 0) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'No Selection',
        message: 'Please select at least one employee to Edit payroll',
        onConfirm: null
      });
      return;
    }
    // Get employee UUIDs from selected rows
    // selectedRows contains payslipId or empUuid as IDs
    const selectedEmployees = payrollData.filter((emp) =>
      selectedRows.has(emp.payslipId || emp.empUuid)
    );

    // Filter out employees with non-finalized status
    const finalizedEmployees = selectedEmployees.filter(
      (emp) => emp.status === Payroll_Status.PAYROLL_FINALIZED
    );

    if (finalizedEmployees.length === 0) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'No Finalized Payrolls',
        message: 'No finalized payrolls selected. Only finalized payrolls can be edited.',
        onConfirm: null
      });
      return;
    }

    if (finalizedEmployees.length < selectedEmployees.length) {
      const nonFinalizedCount = selectedEmployees.length - finalizedEmployees.length;
      setModalState({
        isOpen: true,
        type: 'confirm',
        heading: 'Some Payrolls Not Finalized',
        message: `${nonFinalizedCount} selected employee(s) are not finalized and will be skipped. Continue with ${finalizedEmployees.length} finalized payroll(s)?`,
        confirmText: 'Yes, Continue',
        cancelText: 'Cancel',
        onConfirm: () => proceedWithEdit(finalizedEmployees)
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: 'confirm',
      heading: 'Edit Payroll',
      message: `Are you sure you want to edit payroll for ${finalizedEmployees.length} employee(s)? This action will revert the payroll status to pending.`,
      confirmText: 'Yes, Edit',
      cancelText: 'Cancel',
      onConfirm: () => proceedWithEdit(finalizedEmployees)
    });
  };

  const proceedWithEdit = async (finalizedEmployees) => {
    setModalState({ ...modalState, isOpen: false });
    setIsProcessing(true);
    try {
      const finalizedEmployeepayslipIds = finalizedEmployees.map((emp) => emp.payslipId);
      const getSalaryComponentsDataParams = {
          currentPage, 
          pageSize,
          selectedMonth,
          selectedYear,
          searchQuery
      };
      await dispatch(markFinalizedPayslipsAsPending(finalizedEmployeepayslipIds, getSalaryComponentsDataParams));
    } catch (error) {
      console.error("Error editing payroll:", error);
    } finally {
      setIsProcessing(false);
      // Clear selection after edit attempt
      if (resetSelections) {
        resetSelections();
      }
    }
  };

  const handleDeletePayroll = async () => {
    if (!canEdit) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'Permission Denied',
        message: 'You don\'t have permission to delete payroll',
        onConfirm: null
      });
      return;
    }

    if (!selectedRows || selectedRows.size === 0) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'No Selection',
        message: 'Please select at least one employee to delete payroll',
        onConfirm: null
      });
      return;
    }

    const selectedEmployees = payrollData.filter((emp) =>
      selectedRows.has(emp.payslipId || emp.empUuid)
    );

    if (selectedEmployees.length === 0) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'No Selection',
        message: 'Please select at least one employee to delete payroll',
        onConfirm: null
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: 'confirm',
      heading: 'Delete Payroll',
      message: `Are you sure you want to delete payroll for ${selectedEmployees.length} employee(s)? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: () => proceedWithDelete(selectedEmployees)
    });
  };

  const proceedWithDelete = async (selectedEmployees) => {
    setModalState({ ...modalState, isOpen: false });
    setIsProcessing(true);
    try {
      const selectedPayslipIds = selectedEmployees.map((emp) => emp.payslipId).filter(Boolean);
      const getSalaryComponentsDataParams = {
          currentPage,
          pageSize,
          selectedMonth,
          selectedYear,
          searchQuery
      };
      await dispatch(deletePayrollRecords(selectedPayslipIds, getSalaryComponentsDataParams));
    } catch (error) {
      console.error('Error deleting payroll:', error);
    } finally {
      setIsProcessing(false);
      if (resetSelections) {
        resetSelections();
      }
    }
  };

  const handleGeneratePayroll = () => {
    if (!canGenerate) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'Permission Denied',
        message: 'You don\'t have permission to generate payroll',
        onConfirm: null
      });
      return;
    }
    
    // Add logic for generating payroll
    setModalState({
      isOpen: true,
      type: 'confirm',
      heading: 'Generate Payroll',
      message: 'Are you sure you want to generate payroll?',
      confirmText: 'Yes, Generate',
      cancelText: 'Cancel',
      onConfirm: () => proceedWithGeneration()
    });
  }

  const proceedWithGeneration = async () => {
    setModalState({ ...modalState, isOpen: false });
    setIsProcessing(true);
    try {
      const getSalaryComponentsDataParams = {
          currentPage, 
          pageSize,
          selectedMonth,
          selectedYear,
          searchQuery
      };
      await dispatch(generatePayroll(getSalaryComponentsDataParams));
    } catch (error) {
      console.error("Error generating payroll:", error);
    } finally {
      setIsProcessing(false);
      // Clear selection after generation attempt
      if (resetSelections) {
        resetSelections();
      }
    }
  }

  const handleEditButton = () => {
    handleEditPayroll();
  };  
  const handleDeleteButton = () => {
    handleDeletePayroll();
  };

  const handleExportPayslip = () => {
    if (!canEdit) {
      setModalState({
        isOpen: true,
        type: 'alert',
        heading: 'Permission Denied',
        message: 'You don\'t have permission to export payroll',
        onConfirm: null
      });
      return;
    }
    dispatch(exportPayrollAsCsv(selectedMonth, selectedYear));
  }

  const hasSelectedRows = selectedRows && selectedRows.size > 0;

  return (
    <>
      <div className="payroll_header_main_container">
        <div className="total_payroll_amount_container">
          <span className="total_payroll_amount_title">
            Total Payroll Amount
          </span>
          <span className="total_payroll_amount">
            {CURRENCY_SYMBOL} {(netPayPayrollAmount || 0).toFixed(2)}
          </span>
          <span className="total_payroll_month">
            {selectedMonth || monthName} {selectedYear || year}
          </span>
          {payrollPagination && payrollPagination.totalRecords > 0 && (
            <span className="total_employees_count">
              Total Employees: {payrollPagination.totalRecords}
            </span>
          )}
        </div>
        <div className="payroll_action_buttons">
          <button className="download_payslip_button" onClick={handleExportPayslip} disabled={!isAllPayrollGenerated || !canEdit}>
            <img
              src={Export_File}
              alt="export file icon"
              className="download_payslip_button_icon"
            />
            <span className="download_payslip_button_text">Export</span>
          </button>
          <div className="payroll_button_container">
            {isCurrentMonthView && (
              <button
                className={`delete_Payroll_button ${!hasSelectedRows || isProcessing || !canEdit ? "disabled" : ""}`}
                onClick={handleDeleteButton}
                disabled={!hasSelectedRows || isProcessing || !canEdit}
              >
                <img
                  src={Delete_Icon_Active}
                  alt="delete icon"
                  className="delete_Payroll_button_icon"
                />
                <span className="delete_Payroll_button_text">Delete</span>
              </button>
            )}
            <button
              className={`edit_Payroll_button ${!hasSelectedRows || isProcessing || !canEdit ? "disabled" : ""}`}
              onClick={handleEditButton}
              disabled={!hasSelectedRows || isProcessing || !canEdit}
            >
              <img
                src={!hasSelectedRows || isProcessing ? Edit_Icon_Disabled : Edit_Icon_Active}
                alt="edit icon"
                className="edit_Payroll_button_icon"
              />
              <span className="edit_Payroll_button_text">Edit</span>
            </button>
            <button
              className={`process_payroll_button ${
                (!hasSelectedRows && !isAllPayrollFinalized) || isProcessing || (!canFinalize && !isAllPayrollFinalized) || (!canGenerate && isAllPayrollFinalized) ? "disabled" : ""
              }`}
              onClick={isAllPayrollFinalized ? handleGeneratePayroll : handleFinalizePayroll}
              disabled={(!hasSelectedRows && !isAllPayrollFinalized) || isProcessing || (!canFinalize && !isAllPayrollFinalized) || (!canGenerate && isAllPayrollFinalized)}
            >
              <img
                src={Finalize_Icon}
                alt="finalize icon"
                className="process_payroll_button_icon"
              />
              <span className="process_payroll_button_text">
                {isProcessing
                  ? "Processing..." : isAllPayrollFinalized ? "Generate Payroll"
                  : `Finalize Payroll${
                      hasSelectedRows ? ` (${selectedRows.size})` : ""
                    }`}
              </span>
            </button>
          </div>
        </div>
      </div>
      <ConfirmationPopup
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        heading={modalState.heading}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </>
  );
};

export default PayrollHeader;
