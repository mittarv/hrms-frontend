import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitRewardsNomination,
  setNominationModalOpen,
} from "../../../../actions/hrRepositoryAction";
import { getComponentTypeValue } from "../../Common/utils/helper";
import { MIN_CITATION_WORDS } from "../rewardsConstants";
import Search_icon from "../../assets/icons/Search_icon_grey.svg";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import Info_grey_icon from "../../assets/icons/info_grey_icon.svg";
import Info_red_icon from "../../assets/icons/info_red_icon.svg";
import Info_green_icon from "../../assets/icons/info_green_icon.svg";
import "../styles/NominationModal.scss";

const NominationModal = ({
  cycleId,
  awardName = "Going above and beyond",
  onClose,
}) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [citation, setCitation] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);

  const { allEmployees, getAllComponentType, rewardsNominateLoading } =
    useSelector((state) => state.hrRepositoryReducer);

  const normalizedEmployees = useMemo(() => {
    if (!Array.isArray(allEmployees)) return [];
    return allEmployees
      .map((e) => ({
        employeeUuid: e.employeeUuid,
        employeeFirstName: e.employeeFirstName ?? "",
        employeeLastName: e.employeeLastName ?? "",
        employeeDepartment: e.employeeDepartment,
        employeeJobType: e.employeeJobType,
        employeeProfileImage: e.employeeProfileImage,
      }))
      .filter((e) => e.employeeUuid);
  }, [allEmployees]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return normalizedEmployees.slice(0, 50);
    const q = searchQuery.toLowerCase().trim();
    const componentType = getAllComponentType || {};
    return normalizedEmployees
      .filter((emp) => {
        const name =
          `${emp.employeeFirstName} ${emp.employeeLastName}`.toLowerCase();
        const deptLabel =
          getComponentTypeValue(emp.employeeDepartment, componentType) || "";
        const typeLabel =
          getComponentTypeValue(emp.employeeJobType, componentType) || "";
        return (
          name.includes(q) ||
          deptLabel.toLowerCase().includes(q) ||
          typeLabel.toLowerCase().includes(q)
        );
      })
      .slice(0, 50);
  }, [normalizedEmployees, searchQuery, getAllComponentType]);

  useEffect(() => {
    const words = citation.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [citation]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(
      `${employee.employeeFirstName} ${employee.employeeLastName}`,
    );
    setShowDropdown(false);
    if (errors.employee) setErrors((prev) => ({ ...prev, employee: null }));
  };

  const handleCitationChange = (e) => {
    setCitation(e.target.value);
    if (errors.citation) setErrors((prev) => ({ ...prev, citation: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedEmployee) {
      newErrors.employee = "Please select an employee to nominate.";
    }
    if (wordCount < MIN_CITATION_WORDS) {
      newErrors.citation = `Citation must be at least ${MIN_CITATION_WORDS} words. Current: ${wordCount}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await dispatch(
        submitRewardsNomination({
          cycleId,
          nomineeEmpUuid: selectedEmployee.employeeUuid,
          citation: citation.trim(),
        }),
      );
      onClose();
    } catch (error) {
      // Error handled by action
    }
  };

  const handleClose = () => {
    dispatch(setNominationModalOpen(false));
    onClose();
  };

  const componentType = getAllComponentType || {};
  const canSubmit =
    selectedEmployee &&
    wordCount >= MIN_CITATION_WORDS &&
    !rewardsNominateLoading;

  return (
    <div className="nomination_modal_overlay" onClick={handleClose}>
      <div className="nomination_modal" onClick={(e) => e.stopPropagation()}>
        <div className="nomination_modal_header">
          <div className="nomination_modal_header_container">
            <div className="nomination_modal_header_title">Nominate</div>
            <button
              className="nomination_modal_close_button"
              onClick={handleClose}
              type="button"
            >
              <img src={Cross_icon} alt="close" />
            </button>
          </div>
        </div>

        <div className="nomination_modal_content">
          <div className="nomination_modal_info">
            Nominate an employee for the{" "}
            <span className="award_highlight">{awardName}</span> award in your
            team or parallel team
          </div>

          <div className="form_group">
            <label>Employee Name</label>
            <div className="label_subtitle">(Select only one)</div>
            <div className="search_input_wrapper">
              <img src={Search_icon} alt="" className="search_icon_input" />
              <input
                type="text"
                placeholder="Search employee"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedEmployee(null);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={errors.employee ? "error" : ""}
              />
              {showDropdown && (
                <div className="search_results_dropdown">
                  {filteredEmployees.length === 0 ? (
                    <div className="search_result_item empty">
                      No employees match
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <div
                        key={emp.employeeUuid}
                        className="search_result_item"
                        onClick={() => handleEmployeeSelect(emp)}
                      >
                        <div className="emp_avatar">
                          {emp.employeeProfileImage ? (
                            <img
                              src={emp.employeeProfileImage}
                              alt=""
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="emp_avatar_placeholder">
                              {(emp.employeeFirstName?.[0] || "").toUpperCase()}
                              {(emp.employeeLastName?.[0] || "").toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="emp_details">
                          <span className="emp_name">
                            {emp.employeeFirstName} {emp.employeeLastName}
                          </span>
                          <span className="emp_dept">
                            {[
                              getComponentTypeValue(
                                emp.employeeDepartment,
                                componentType,
                              ),
                              getComponentTypeValue(
                                emp.employeeJobType,
                                componentType,
                              ),
                            ]
                              .filter(Boolean)
                              .join(" | ") || "—"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.employee && (
              <span className="error_message">{errors.employee}</span>
            )}

            {selectedEmployee && (
              <div className="selected_employee_card">
                <div className="emp_avatar">
                  {selectedEmployee.employeeProfileImage ? (
                    <img
                      src={selectedEmployee.employeeProfileImage}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="emp_avatar_placeholder">
                      {(
                        selectedEmployee.employeeFirstName?.[0] || ""
                      ).toUpperCase()}
                      {(
                        selectedEmployee.employeeLastName?.[0] || ""
                      ).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="selected_employee_info">
                  <span className="emp_name">
                    {selectedEmployee.employeeFirstName}{" "}
                    {selectedEmployee.employeeLastName}
                  </span>
                  <span className="emp_dept">
                    {[
                      getComponentTypeValue(
                        selectedEmployee.employeeDepartment,
                        componentType,
                      ),
                      getComponentTypeValue(
                        selectedEmployee.employeeJobType,
                        componentType,
                      ),
                    ]
                      .filter(Boolean)
                      .join(" | ") || "—"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="form_group">
            <label>Reason to Nominate</label>
            <textarea
              placeholder={`Describe why you'd like to nominate this employee (Minimum ${MIN_CITATION_WORDS} Words)`}
              value={citation}
              onChange={handleCitationChange}
              rows={6}
              className={errors.citation ? "error" : ""}
            />
            <div className="textarea_footer">
              <span
                className={`word_count_label ${
                  wordCount === 0
                    ? "empty"
                    : wordCount < MIN_CITATION_WORDS
                      ? "insufficient"
                      : "sufficient"
                }`}
              >
                <span className="info_icon" aria-hidden>
                  <img
                    src={
                      wordCount === 0
                        ? Info_grey_icon
                        : wordCount < MIN_CITATION_WORDS
                          ? Info_red_icon
                          : Info_green_icon
                    }
                    alt="info"
                  />
                </span>{" "}
                Minimum {MIN_CITATION_WORDS} Words.
              </span>
            </div>
            {errors.citation && (
              <span className="error_message">{errors.citation}</span>
            )}
          </div>
        </div>

        <div className="nomination_modal_footer">
          <button
            className="cancel_btn"
            onClick={handleClose}
            disabled={rewardsNominateLoading}
            type="button"
          >
            Cancel
          </button>
          <button
            className="submit_btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
            type="button"
          >
            Nominate
          </button>
        </div>
      </div>
    </div>
  );
};

export default NominationModal;
