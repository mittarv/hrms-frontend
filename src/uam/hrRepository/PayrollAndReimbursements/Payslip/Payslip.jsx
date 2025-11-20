import { useSelector, useDispatch } from "react-redux";
import {
  setPayslipFilterYear,
  getEmployeePayslips,
} from "../../../../actions/hrRepositoryAction";
import PayslipFilter from "./components/PayslipFilter";
import PayslipTable from "./components/PayslipTable";
import { useEffect } from "react";
import "./styles/Payslip.scss";

const Payslip = () => {
  const { user } = useSelector((state) => state.user);
  const { payslipFilter } = useSelector((state) => state.hrRepositoryReducer);
  const { selectedPayslipYear } = payslipFilter;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      getEmployeePayslips(
        user.employeeUuid,
        selectedPayslipYear
      )
    );
  }, [selectedPayslipYear, user, dispatch]);


  const handlePayslipYearChange = (year) => {
    dispatch(setPayslipFilterYear(year));
  };

  return (
    <>
      <div className="payslip_main_container">
        <PayslipFilter
          selectedYear={selectedPayslipYear}
          onYearChange={handlePayslipYearChange}
        />
        <PayslipTable />
      </div>
    </>
  );
};

export default Payslip;
