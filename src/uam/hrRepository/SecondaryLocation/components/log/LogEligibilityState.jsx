const LogEligibilityState = ({ type = "info", message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`sl_log_eligibility_state ${type}`}>
      <p>{message}</p>
    </div>
  );
};

export default LogEligibilityState;
