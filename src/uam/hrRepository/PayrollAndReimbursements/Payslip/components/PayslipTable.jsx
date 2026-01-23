import { useState } from "react";
import { useSelector } from "react-redux";
import "../styles/PayslipTable.scss";
import PayslipPreview from "./PayslipPreview";
import View_Icon from "../../../assets/icons/view_icon.svg";
import downloadIconBlue from "../../../assets/icons/download_icon_blue.svg";
import LoadingSpinner from "../../../Common/components/LoadingSpinner";
import { downloadPayslipPdf } from "../../../../../actions/hrRepositoryAction";
import { useDispatch } from "react-redux";
const PayslipTable = () => {
  const { payslipData, payslipLoading } = useSelector((state) => state.hrRepositoryReducer);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const dispatch = useDispatch();
  // Calculate totals for each payslip
  const calculateTotals = (payslipItems) => {
    let earnings = 0;
    let reimbursements = 0;
    let deductions = 0;

    payslipItems?.forEach((item) => {
      const amount = parseFloat(item.amount) || 0;

      if (item.componentType === "defaultAddition") {
        earnings += amount;
      } else if (item.componentType === "addition") {
        earnings += amount;
      } else if (item.componentType === "defaultDeduction") {
        deductions += amount;
      } else if (item.componentType === "deduction"){
        deductions += amount;
      }
    });

    return { earnings, reimbursements, deductions };
  };

  // Format date to Month Year
  const formatMonth = (startDate) => {
    const date = new Date(startDate);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "-";
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const handlePreview = (payslipId) => {
    const payslip = payslipData.find((p) => p.payslipId === payslipId);
    if (payslip) {
      setSelectedPayslip(payslip);
    }
  };

  const handleClosePreview = () => {
    setSelectedPayslip(null);
  };

  const handleDownload = (payslipId) => {
    dispatch(downloadPayslipPdf(payslipId));
  };

  return (
    <div className="payslip-table-container">
      <div className="payslip-table-header">
        <h2>Payslips</h2>
      </div>

      {payslipLoading ? <LoadingSpinner message="Loading Payslips"/> : <div className="payslip-table-wrapper">
        <table className="payslip-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Earnings</th>
              <th>Reimbursements</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Action(s)</th>
            </tr>
          </thead>
          <tbody>
            {payslipData && payslipData.length > 0 ? (
              payslipData.map((payslip) => {
                const { earnings, reimbursements, deductions } =
                  calculateTotals(payslip.payslipItems);

                return (
                  <tr key={payslip.payslipId}>
                    <td>{formatMonth(payslip.payrollStartDate)}</td>
                    <td>{formatCurrency(earnings)}</td>
                    <td>{formatCurrency(reimbursements)}</td>
                    <td>{formatCurrency(deductions)}</td>
                    <td>{formatCurrency(payslip.netPay)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-preview"
                          onClick={() => handlePreview(payslip.payslipId)}
                        >
                          <span className="icon">
                            <img src={View_Icon} alt="View Icon"/>
                            </span> Preview
                        </button>
                        <button
                          className="btn-download"
                          onClick={() => handleDownload(payslip.payslipId)}
                        >
                          <span className="icon">
                            <img src={downloadIconBlue} alt="Download Icon"/>
                            </span> Download Payslip
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No payslip data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}

      {/* Payslip Preview Modal */}
      {selectedPayslip && (
        <PayslipPreview
          isOpen={selectedPayslip}
          onClose={handleClosePreview}
          selectedPayslip={selectedPayslip} // Pass the specific payslip object
        />
      )}
    </div>
  );
};

export default PayslipTable;
