import { useEffect, useState } from "react";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import Calendar_icon from "../../assets/icons/calendar_icon.svg";
import Clock_icon from "../../assets/icons/clock_icon.svg";
import File_icon from "../../assets/icons/file_icon.svg";
import { extraWorkLogRequest } from "../../../../actions/hrRepositoryAction";
import { convertFileToBase64 } from "../../Common/utils/helper";
import "../styles/LogExtraDayPopup.scss";
import { useDispatch, useSelector } from "react-redux";
import Snackbar from "../../Common/components/Snackbar";
import LoadingSpinner from "../../Common/components/LoadingSpinner";

const LogExtraDayPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const { currentEmployeeDetails, allExisitingLeaves, extraWorkLogLoading } =
    useSelector((state) => state.hrRepositoryReducer);
  const [inputvalue, setInputvalue] = useState({
    date: "",
    checkIn: "",
    checkOut: "",
    remarks: "",
    proof: "",
  });
  const [fileName, setFileName] = useState("");
  const [isEligibleForCompOff, setIsEligibleForCompOff] = useState(false);
  console.log(currentEmployeeDetails);
  const compOffLeave = allExisitingLeaves.find(
    (leave) => leave.leaveType.toLowerCase() === "comp off"
  );

  useEffect(() => {
    // Add safety checks
    if (!currentEmployeeDetails || !compOffLeave) return;
    console.log(compOffLeave);

    const empType =
      currentEmployeeDetails?.employeeCurrentJobDetails?.empType || "";
    const empGender =
      currentEmployeeDetails?.employeeBasicDetails?.empGender || "";

    if (!empType || !empGender) {
      setIsEligibleForCompOff(false);
      return;
    }

    // Add checks for appliedGender and employeeType arrays
    const isEligible =
      compOffLeave.appliedGender?.includes(empGender) &&
      compOffLeave.employeeType?.includes(empType);

    setIsEligibleForCompOff(isEligible);
  }, [currentEmployeeDetails, compOffLeave]);

  const totalDuration =
    inputvalue.checkIn && inputvalue.checkOut
      ? (new Date(`1970-01-01T${inputvalue.checkOut}`) -
          new Date(`1970-01-01T${inputvalue.checkIn}`)) /
        (1000 * 60 * 60)
      : 0;
  console.log("Comp Off Leave:", compOffLeave);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "checkOut") {
      const checkInTime = new Date(`1970-01-01T${inputvalue.checkIn}`);
      const checkOutTime = new Date(`1970-01-01T${value}`);
      if (checkInTime >= checkOutTime) {
        alert("Check-out time must be after Check-in time");
        return;
      }
    }
    setInputvalue({ ...inputvalue, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      const fileData = await convertFileToBase64(file, maxSizeInBytes);
      // store full data URL so backend can accept it directly
      setInputvalue({ ...inputvalue, proof: fileData.base64 });
      setFileName(file.name);
      // optional: keep a small success notice
      // (use UI toast in future) — using alert for now
      alert(`File "${file.name}" uploaded successfully!`);
    } catch (error) {
      alert(error.message);
      e.target.value = "";
      setFileName("");
    }
  };

  const SetAttendance = async () => {
    if (extraWorkLogLoading) return;
    // Validation
    const missingFields = [];

    if (!inputvalue.date) missingFields.push("Date");
    if (!inputvalue.checkIn) missingFields.push("Check In");
    if (!inputvalue.checkOut) missingFields.push("Check Out");
    if (!inputvalue.remarks) missingFields.push("Remarks");
    if (!inputvalue.proof) missingFields.push("Proof");

    if (missingFields.length > 0) {
      alert(
        `Please fill the following required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    const extraLogData = {
      empUuid: currentEmployeeDetails.employeeBasicDetails.empUuid,
      leaveConfigId: compOffLeave.leaveConfigId,
      workDate: inputvalue.date,
      checkIn: inputvalue.checkIn,
      checkOut: inputvalue.checkOut,
      remarks: inputvalue.remarks,
      proof: inputvalue.proof,
      totalDuration: totalDuration.toFixed(2),
    };
    dispatch(extraWorkLogRequest(extraLogData));
    onClose();
  };

  return (
    <div className="log_extra_day_modal">
      <div className="log_extra_day_modal_content">
        <span className="log_extra_day_modal_header">
          <p className="log_extra_day_modal_title">Log Extra Day</p>
          <img
            src={Cross_icon}
            alt="Close_icon"
            className="log_extra_day_modal_close"
            onClick={onClose}
          />
        </span>
        <div className="log_extra_day_date_container">
          <label className="extra_day_date_container_title">Date*</label>
          <div
            className="input_with_icon"
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input && e.target !== input) {
                input.showPicker?.();
              }
            }}
          >
            <span className="input_icon">
              <img src={Calendar_icon} alt="Calendar_icon" />
            </span>
            <input
              type="date"
              className="extra_day_date_input"
              onClick={(e) => e.currentTarget.showPicker?.()}
              value={inputvalue.date}
              onChange={handleInputChange}
              name="date"
            />
          </div>
        </div>
        <div className="log_extra_day_time_container">
          <div className="time_field">
            <label className="time_field_title">Check-in*</label>
            <div
              className="input_with_icon"
              onClick={(e) => {
                const input = e.currentTarget.querySelector("input");
                if (input && e.target !== input) {
                  input.showPicker?.();
                }
              }}
            >
              <span className="input_icon">
                <img src={Clock_icon} alt="Clock_icon" />
              </span>
              <input
                type="time"
                className="time_input"
                onClick={(e) => e.currentTarget.showPicker?.()}
                value={inputvalue.checkIn}
                onChange={handleInputChange}
                name="checkIn"
              />
            </div>
            {totalDuration > 0 && (
              <div className="log_extra_day_credit_info">
                <p>
                  Comp Off credit: {totalDuration > 7 ? "1 Day" : "0.5 Day"}
                </p>
              </div>
            )}
          </div>

          <div className="time_field">
            <label className="time_field_title">Check-out*</label>
            <div
              className="input_with_icon"
              onClick={(e) => {
                const input = e.currentTarget.querySelector("input");
                if (input && e.target !== input) {
                  input.showPicker?.();
                }
              }}
            >
              <span className="input_icon">
                <img src={Clock_icon} alt="Clock_icon" />
              </span>
              <input
                type="time"
                className="time_input"
                onClick={(e) => e.currentTarget.showPicker?.()}
                value={inputvalue.checkOut}
                onChange={handleInputChange}
                name="checkOut"
              />
            </div>
          </div>
        </div>
        <div className="log_extra_day_remarks_container">
          <p className="log_extra_day_remarks_title">Remarks*</p>
          <input
            type="text"
            placeholder="Enter your remarks here"
            className="log_extra_day_remarks_input"
            value={inputvalue.remarks}
            onChange={handleInputChange}
            name="remarks"
          />
        </div>
        <div className="log_extra_day_proof_container">
          <p className="log_extra_day_proof_title">Proof*</p>
          <div className="proof_upload_box">
            <input
              type="file"
              id="proof-file-input"
              className="proof_file_input"
              accept=".pdf,.png,.jpeg,.jpg"
              onChange={handleFileChange}
              name="proof"
            />
            <label htmlFor="proof-file-input" className="proof_upload_label">
              <div className="proof_text">
                <div className="proof_icon">
                  <img src={File_icon} alt="File_icon" />
                </div>
                <span className="proof_main_text">
                  {fileName ? fileName : "Add Files : Max 10MB"}
                </span>
              </div>
            </label>
          </div>
        </div>
        <div className="log_extra_day_info">
          {!isEligibleForCompOff ? (
            <div className="log_extra_day_warning_container">
              <p className="log_extra_day_warning_text">
                Note: You are not eligible for Comp-off leaves as per your
                employment type.
              </p>
            </div>
          ) : (
            <div className="log_extra_day_info_container">
              <p className="log_extra_day_info_text">
                On approval, extra work hours will be converted to Comp-off
                leave
              </p>
              <p className="log_extra_day_info_text">
                Up to 7 hrs → 0.5 Day Credit | More than 7 hrs → 1 Day Credit
              </p>
            </div>
          )}
        </div>
        <div className="log_extra_day_modal_button_container">
          <button
            className=" log_extra_day_modal_cancel_button"
            onClick={onClose}
          >
            Cancel
          </button>
          {isEligibleForCompOff && (
            <button
              className="log_extra_day_modal_submit_button"
              onClick={SetAttendance}
            >
              {extraWorkLogLoading ? (
                <LoadingSpinner
                  message=""
                  height="1vh"
                  color="#ffffff"
                  gap={0}
                  loaderSize={20}
                />
              ) : (
                "Set Attendance"
              )}
            </button>
          )}
        </div>
      </div>
      <Snackbar />
    </div>
  );
};

export default LogExtraDayPopup;
