import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getPayrollContext, clearPayrollContext } from "../../../Common/utils/encryptionUtils";
import { COMPONENT_TYPES, LOP_KEYWORDS, CURRENCY_SYMBOL } from "../utils/PayrollUtils";
import Cross_icon from "../../../../../assets/icons/cross_icon.svg";
import "../styles/TaxesDeductionsModal.scss";

const TaxesDeductionsModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payrollContext, setPayrollContext] = useState(null);
  
  const sessionKey = searchParams.get('session');
  const componentType = searchParams.get('componentModal');
  
  // Retrieve payroll context from session storage
  useEffect(() => {
    const loadContext = async () => {
      if (!sessionKey) {
        setPayrollContext(null);
        return;
      }
      const context = await getPayrollContext(sessionKey);
      setPayrollContext(context);
    };
    loadContext();
  }, [sessionKey]);

  const employeeName = payrollContext?.employeeName || '';
  const defaultDeductions = payrollContext?.defaultDeductions || [];
  const unpaidLeave = payrollContext?.unpaidLeave || 0;
  const lopPerDay = payrollContext?.lopPerDay || 0;
  const lopDeduction = payrollContext?.lopDeduction || 0;
  const payrollStatus = payrollContext?.status || '';
  
  // Check if payroll is generated
  const isPayrollGenerated = payrollStatus === 'Payroll Generated';

  // Only show this modal for taxesDeduction type
  if (componentType !== COMPONENT_TYPES.TAXES_DEDUCTION) {
    return null;
  }

  // Filter out LOP component from default deductions
  const lopComponent = defaultDeductions.find(ded => 
    LOP_KEYWORDS.some(keyword => ded.componentName.toLowerCase().includes(keyword))
  );
  
  const nonLopDeductions = defaultDeductions.filter(ded => {
    const isLopComponent = LOP_KEYWORDS.some(keyword => ded.componentName.toLowerCase().includes(keyword));
    return !isLopComponent;
  });

  // Calculate total default deductions (excluding LOP)
  const totalDefaultDeductions = nonLopDeductions.reduce((sum, ded) => {
    return sum + (ded.amount || 0);
  }, 0);

  // For generated payrolls, use the LOP amount directly from API
  // For non-generated payrolls, calculate using unpaidLeave * lopPerDay
  const finalLopDeduction = isPayrollGenerated 
    ? (lopComponent?.amount || 0) 
    : lopDeduction;

  // Total including LOP
  const totalWithLOP = totalDefaultDeductions + finalLopDeduction;

  const handleClose = () => {
    // Clear all payroll-related params
    const params = new URLSearchParams(searchParams);
    params.delete('componentModal');
    params.delete('session');
    params.delete('employeeId');
    params.delete('payslipId');
    params.delete('employeeName');
    setSearchParams(params);
    
    // Clear session storage
    if (sessionKey) {
      clearPayrollContext(sessionKey);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="taxes-deductions-modal">
        <div className="modal-header">
          <div className="header-content">
            <p className="modal_title">Taxes/Deductions Breakdown</p>
            <p className="employee-name">{employeeName}</p>
          </div>
          <button className="close_button_icon" onClick={handleClose}>
            <img src={Cross_icon} alt="Close" />
          </button>
        </div>

        <div className="modal-body">
          {/* Deductions List */}
          <div className="deductions-list">
            {/* Non-LOP Deductions */}
            {nonLopDeductions.map((ded, index) => (
              <div key={index} className="deduction-item">
                <span className="component-name">{ded.componentName}</span>
                <span className="deduction-amount">{CURRENCY_SYMBOL} {ded.amount?.toLocaleString('en-IN') || '0'}</span>
              </div>
            ))}
            
            {/* LOP Deduction */}
            {finalLopDeduction > 0 && (
              <div className="deduction-item">
                <span className="component-name">
                  {isPayrollGenerated 
                    ? lopComponent?.componentName || 'Loss of Pay'
                    : `Loss of Pay (${unpaidLeave} ${unpaidLeave === 1 ? 'day' : 'days'} × ${CURRENCY_SYMBOL} ${lopPerDay.toLocaleString('en-IN')})`
                  }
                </span>
                <span className="deduction-amount">{CURRENCY_SYMBOL} {finalLopDeduction.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* No deductions message */}
            {nonLopDeductions.length === 0 && finalLopDeduction === 0 && (
              <div className="no-deductions">
                <p>No deductions for this employee</p>
              </div>
            )}
          </div>

          {/* Total Section */}
          <div className="total-section">
            <div className="total-row">
              <span className="label">Total Deductions</span>
              <span className="total-amount">{CURRENCY_SYMBOL} {totalWithLOP.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxesDeductionsModal;
