// import { X } from 'lucide-react';
import Mitt_Arv_Logo from "../../../../../assets/icons/mittar_payroll_logo.svg";
import walletIcon from "../../../../../assets/icons/wallet_icon.svg";
import walletIconDark from "../../../../../assets/icons/wallet_icon_dark.svg";
import subtarctIconGrey from "../../../../../assets/icons/subtract_icon_grey.svg";
import walletIconLight from "../../../../../assets/icons/wallet_icon_light.svg";
import deductionIcon from "../../../../../assets/icons/deduction_icon.svg";
import equalIconGrey from "../../../../../assets/icons/equal_icon_grey.svg";
import closeIcon from "../../../../../assets/icons/cross_icon.svg";
import "../styles/PayslipPreview.scss";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { getCurrentEmployeeDetails} from "../../../../../actions/hrRepositoryAction";
import { getComponentTypeValue } from "../../../Common/utils/helper";
import LoadingSpinner from "../../../Common/components/LoadingSpinner";
import addIconGrey from "../../../../../assets/icons/add_icon_grey.svg";

const PayslipModal = ({ isOpen, onClose, selectedPayslip }) => {
  const {currentEmployeeDetails, loading, getAllComponentType} = useSelector((state) => state.hrRepositoryReducer);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const userEmployeeId = user?.employeeUuid;

  useEffect(()=>{
    dispatch(getCurrentEmployeeDetails(userEmployeeId));
  },[userEmployeeId, dispatch]);

  // Helper function to calculate totals and categorize items
  const calculatePayslipData = () => {
    if (!selectedPayslip || !selectedPayslip.payslipItems) {
      return {
        earnings: [],
        deductions: [],
        grossPay: 0,
        totalDeductions: 0,
        netPay: 0
      };
    }

    const earnings = selectedPayslip.payslipItems.filter(
      item => item.componentType === 'addition' || item.componentType === 'defaultAddition'
    );

    const deductions = selectedPayslip.payslipItems.filter(
      item => item.componentType === 'deduction' || item.componentType === 'defaultDeduction'
    );

    const grossPay = earnings.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const netPay = parseFloat(selectedPayslip.netPay || 0);

    return {
      earnings,
      deductions,
      grossPay,
      totalDeductions,
      netPay
    };
  };

  // Format date for payslip title
  const getPayslipMonth = () => {
    if (!selectedPayslip || !selectedPayslip.payrollStartDate) {
      return 'N/A';
    }
    const date = new Date(selectedPayslip.payrollStartDate);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const payslipData = calculatePayslipData();

  if (!isOpen) return null;
  return (
    <div className="payslip-modal-overlay" onClick={onClose}>
      {loading ? <LoadingSpinner  message="Loading payslip"/> : <div className="payslip-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>

        <div className="payslip-content">
          <header className="payslip-header">
            <div className="payslip_addr_logo_container">
              <p>
                Ashoka Bhopal Chambers, 205, Above Standard Chartered Bank,
                <br />
                Sindhi Colony, Begumpet, Secunderabad, Hyderabad, Telangana 500003
              </p>
              <div className="company_logo">
                <img src={Mitt_Arv_Logo} alt="Mitt Arv Logo" />
              </div>
            </div>
            <div className="payslip_title_container">
              <img
                src={walletIcon}
                alt="wallet icon"
                className="payslip-logo"
              />
              <div className="paysilp_title">
                <p className="title_1">Payslip generated for</p>
                <p className="title_2">{getPayslipMonth()}</p>
              </div>
            </div>

            <div className="employee_details">
              <div className="employee_name">
                <p className='row_title'>Employee Name</p>
                <p className='row_value'>
                  {currentEmployeeDetails?.employeeBasicDetails?.empFirstName && currentEmployeeDetails?.employeeBasicDetails?.empLastName
                    ? `${currentEmployeeDetails.employeeBasicDetails.empFirstName} ${currentEmployeeDetails.employeeBasicDetails.empLastName}`
                    : '-'}
                </p>
              </div>
              <div className="employee_name">
                <p className='row_title'>Department</p>
                <p className='row_value'>
                  {getComponentTypeValue(currentEmployeeDetails?.employeeCurrentJobDetails?.empDepartment, getAllComponentType) || '-'}
                </p>
              </div>
              <div className="employee_name">
                <p className='row_title'>Bank Name</p>
                <p className='row_value'>
                  {currentEmployeeDetails?.employeeBankDetails?.empBenefeciaryName || '-'}
                </p>
              </div>
              <div className="employee_name">
                <p className='row_title'>Employee Code</p>
                <p className='row_value'>
                  {currentEmployeeDetails?.employeeBasicDetails?.empCompanyId || '-'}
                </p>
              </div>
              <div className="employee_name">
                <p className='row_title'>PAN</p>
                <p className='row_value'>
                  {currentEmployeeDetails?.employeeBasicDetails?.empPanCard || '-'}
                </p>
              </div>
              <div className="employee_name">
                <p className='row_title'>Bank Account No.</p>
                <p className='row_value'>
                  {currentEmployeeDetails?.employeeBankDetails?.empAccountNumber 
                    ? `XXXX-XXXX-${currentEmployeeDetails.employeeBankDetails.empAccountNumber.slice(-4)}`
                    : '-'}
                </p>
              </div>
              <div className="employee_name">
                <p className='row_title'>Designation</p>
                <p className='row_value'>
                  {currentEmployeeDetails?.employeeCurrentJobDetails?.empTitle || '-'}
                </p>
              </div>
              <div className="employee_name">
                <p className='row_title'>UAN Number</p>
                <p className='row_value'>-</p>
              </div>
              <div className="employee_name">
                <p className='row_title'>Date of Joining</p>
                <p className='row_value'>
                  {currentEmployeeDetails?.employeeBasicDetails?.empHireDate 
                    ? new Date(currentEmployeeDetails.employeeBasicDetails.empHireDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </header>

          <div className="payslip_body">
            {/* summary section */}
            <div className="payslip_summary_section">
              <div className="payslip_summary_header">
                <img src={walletIconDark} alt="Wallet Icon Dark" />
                <div className="summary_title">
                  <p className="title1">Summary</p>
                  <p className="title2">A TLDR of your monthly earning</p>
                </div>
              </div>
              <div className="payslip_summary_content">
                <div className="summary_row">
                  <p className="row_title">Gross Pay</p>
                  <p className="row_value">₹{payslipData.grossPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="summary_row">
                  <img src={addIconGrey} alt="Add Icon" />
                </div>
                <div className="summary_row">
                  <p className="row_title">Reimbursements</p>
                  <p className="row_value">-</p>
                </div>
                <div className="summary_row">
                  <img src={subtarctIconGrey} alt="Subtract Icon Grey" />
                </div>
                <div className="summary_row">
                  <p className="row_title">Deductions</p>
                  <p className="row_value">₹{payslipData.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="summary_row">
                  <img src={equalIconGrey} alt="Equal Icon" />
                </div>
                <div className="summary_row total">
                  <p className="row_title">Net Pay</p>
                  <p className="row_value">₹{payslipData.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="payslip_earnings_section">
              <div className="payslip_earnings_header">
                <img src={walletIconLight} alt="Wallet Icon Light" />
                <div className="earnings_title">
                  <p className="title1">Earnings</p>
                  <p className="title2">Amount you earned before the deductions</p>
                </div>
              </div>
              <div className="payslip_earnings_content">
                {payslipData.earnings && payslipData.earnings.length > 0 ? (
                  <>
                    {payslipData.earnings.map((item) => (
                      <div className="earnings_row" key={item.payrollItemId}>
                        <p className="row_title">{item.componentName}</p>
                        <p className="row_value">₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                    <div className="earnings_row total">
                      <p className="row_title">Total Earnings</p>
                      <p className="row_value">₹{payslipData.grossPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </>
                ) : (
                  <div className="earnings_row">
                    <p className="row_title">No earnings data available</p>
                    <p className="row_value">-</p>
                  </div>
                )}
              </div>
            </div>

            {/* deductions section */}
            <div className="payslip_deductions_section">
              <div className="payslip_deductions_header">
                <img src={deductionIcon} alt="Deductions Icon" />
                <div className="deductions_title">
                  <p className="title1">Deductions</p>
                  <p className="title2">Breakdown of your monthly deductions</p>
                </div>
              </div>
              <div className="payslip_deductions_content">
                {payslipData.deductions && payslipData.deductions.length > 0 ? (
                  <>
                    {payslipData.deductions.map((item) => (
                      <div className="deductions_row" key={item.payrollItemId}>
                        <p className="row_title">{item.componentName}</p>
                        <p className="row_value">₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                    <div className="deductions_row total">
                      <p className="row_title">Total Deductions</p>
                      <p className="row_value">₹{payslipData.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </>
                ) : (
                  <div className="deductions_row">
                    <p className="row_title">No deductions data available</p>
                    <p className="row_value">-</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <footer className="payslip_footer">
            <p>
              Page 1 of 1
            </p>
            <p>
              This is a computer-generated payslip and does not require a
              signature.
            </p>
          </footer>
        </div>
      </div>}
    </div>
  );
};

export default PayslipModal;
