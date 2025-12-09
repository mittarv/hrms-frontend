import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getPayrollContext, clearPayrollContext } from "../../../Common/utils/encryptionUtils";
import { COMPONENT_TYPES, CURRENCY_SYMBOL } from "../utils/PayrollUtils";
import Cross_icon from "../../../../../assets/icons/cross_icon.svg";
import "../styles/MonthlyCTCModal.scss";

const MonthlyCTCModal = () => {
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
  const defaultAdditions = payrollContext?.defaultAdditions || [];

  // Only show this modal for monthlyCTC type
  if (componentType !== COMPONENT_TYPES.MONTHLY_CTC) {
    return null;
  }

  // Calculate total CTC
  const totalCTC = defaultAdditions.reduce((sum, addition) => {
    return sum + (addition.amount || 0);
  }, 0);

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
    <div className="modal_overlay_monthly_ctc">
      <div className="monthly-ctc-modal">
        <div className="modal_header_monthly_ctc">
          <div className="header-content">
            <p className="model_title">Monthly CTC Breakdown</p>
            <p className="employee-name">{employeeName}</p>
          </div>
          <button className="close_button_monthly_ctc" onClick={handleClose}>
            <img src={Cross_icon} alt="Close" />
          </button>
        </div>

        <div className="modal-body">
          {/* Additions List */}
          <div className="additions-list">
            {defaultAdditions.length > 0 ? (
              <>
                {defaultAdditions.map((addition, index) => (
                  <div key={index} className="addition-item">
                    <span className="component-name">{addition.componentName}</span>
                    <span className="addition-amount">{CURRENCY_SYMBOL} {addition.amount?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="no-additions">
                <p>No salary components found</p>
              </div>
            )}
          </div>

          {/* Total Section */}
          <div className="total-section">
            <div className="total-row">
              <span className="label">Total Monthly CTC</span>
              <span className="total-amount">{CURRENCY_SYMBOL} {totalCTC.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCTCModal;
