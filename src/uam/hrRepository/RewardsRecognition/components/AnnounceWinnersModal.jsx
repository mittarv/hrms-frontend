import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNomineesForAnnounce,
  announceRewardsWinners,
  setAnnounceWinnersModalOpen,
} from "../../../../actions/hrRepositoryAction";
import { buildEmployeeName, formatMonthYear } from "../rewardsUtils";
import { getComponentTypeValue } from "../../Common/utils/helper";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import EmployeeChoiceIcon from "../../assets/icons/rewards_icon.svg";
import LeadershipChoiceIcon from "../../assets/icons/award_icon.svg";
import CitationDetailModal from "./CitationDetailModal";
import "../styles/AnnounceWinnersModal.scss";

// Steps: 1 = Employee's Choice, 2 = Leadership Choice, 3 = Confirmation
const STEP_EMPLOYEE = 1;
const STEP_LEADERSHIP = 2;
const STEP_CONFIRM = 3;

const AnnounceWinnersModal = ({ cycleId, onClose }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(STEP_EMPLOYEE);
  const [employeeChoiceEmpUuid, setEmployeeChoiceEmpUuid] = useState("");
  const [leadershipChoiceEmpUuid, setLeadershipChoiceEmpUuid] = useState("");
  const [citationModal, setCitationModal] = useState(null); // { empUuid, name, dept, citation, nominators }

  const {
    rewardsNomineesForAnnounce,
    rewardsNomineesForAnnounceLoading,
    rewardsDashboardData,
    getAllComponentType,
    allEmployees,
  } = useSelector((state) => state.hrRepositoryReducer);

  const componentType = getAllComponentType || {};
  const nominees = Array.isArray(rewardsNomineesForAnnounce)
    ? rewardsNomineesForAnnounce
    : [];
  const sortedByEmployeeChoice = [...nominees].sort(
    (a, b) =>
      (b.voteCountEmployeeChoice ?? 0) - (a.voteCountEmployeeChoice ?? 0),
  );
  const sortedByLeadershipChoice = [...nominees].sort(
    (a, b) =>
      (b.voteCountLeadershipChoice ?? 0) - (a.voteCountLeadershipChoice ?? 0),
  );

  const cycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
  const monthYear = formatMonthYear(cycle?.month, cycle?.year);

  useEffect(() => {
    if (cycleId) {
      dispatch(fetchNomineesForAnnounce(cycleId));
    }
  }, [cycleId, dispatch]);

  const getNomineeEmployee = (row) => {
    const uuid = row.nomineeEmpUuid || row.nominee?.empUuid;
    if (!uuid || !Array.isArray(allEmployees)) return null;
    return allEmployees.find((e) => e.employeeUuid === uuid) || null;
  };

  const getNomineeName = (row) => {
    const emp = getNomineeEmployee(row);
    if (emp)
      return `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""}`.trim();
    return buildEmployeeName(row.nominee) || "—";
  };

  const getNomineeDept = (row) => {
    const emp = getNomineeEmployee(row);
    if (emp)
      return getComponentTypeValue(emp.employeeDepartment, componentType) || "";
    return (
      getComponentTypeValue(row.department, componentType) ||
      row.department ||
      ""
    );
  };

  const getNomineePhoto = (row) => {
    const emp = getNomineeEmployee(row);
    return (
      emp?.employeeProfileImage ||
      row.nominee?.profilePhoto ||
      row.nominee?.empProfileImage ||
      null
    );
  };

  const getCitation = (row) => {
    return (
      row.citationDisplay ||
      row.groupedCitation ||
      row.citation ||
      ""
    ).trim();
  };

  const getNominatorNames = (row) => {
    if (Array.isArray(row.nominatedBy)) return row.nominatedBy.join(", ");
    if (row.nominatedBy) return row.nominatedBy;
    return row.nominatedByNames || "";
  };

  const handleSubmit = () => {
    if (!cycleId || !employeeChoiceEmpUuid || !leadershipChoiceEmpUuid) return;
    dispatch(
      announceRewardsWinners(
        cycleId,
        employeeChoiceEmpUuid,
        leadershipChoiceEmpUuid,
      ),
    );
  };

  const handleEndPhaseWithoutWinners = () => {
    if (!cycleId) return;
    dispatch(announceRewardsWinners(cycleId, null, null));
  };

  const handleClose = () => {
    dispatch(setAnnounceWinnersModalOpen(false));
    onClose();
  };

  const employeeWinner = nominees.find(
    (n) => n.nomineeEmpUuid === employeeChoiceEmpUuid,
  );
  const leadershipWinner = nominees.find(
    (n) => n.nomineeEmpUuid === leadershipChoiceEmpUuid,
  );

  // Find highest vote counts for each step
  const maxEmployeeVotes = Math.max(
    ...sortedByEmployeeChoice.map((n) => n.voteCountEmployeeChoice ?? 0),
    0,
  );
  const maxLeadershipVotes = Math.max(
    ...sortedByLeadershipChoice.map((n) => n.voteCountLeadershipChoice ?? 0),
    0,
  );

  // No nominees case - show End Phase UI
  if (!rewardsNomineesForAnnounceLoading && nominees.length === 0) {
    return (
      <div className="aw_overlay" onClick={handleClose}>
        <div
          className="aw_modal aw_modal--no-nominees"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aw_modal_header">
            <h2 className="aw_modal_title">Announce Winners</h2>
            <button
              type="button"
              className="aw_close_btn_icon"
              onClick={handleClose}
            >
              <img src={Cross_icon} alt="close" />
            </button>
          </div>
          <div className="aw_modal_body aw_modal_body--no-nominees">
            <NoResultsContainer
              message="No nominees available."
              subMessage="There were no nominations or votes for this cycle. You can end the phase without selecting any winners."
              showImage={false}
              border={false}
            />
          </div>
          <div className="aw_modal_footer">
            <button
              type="button"
              className="aw_btn_cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="aw_btn_next"
              onClick={handleEndPhaseWithoutWinners}
            >
              End Phase
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderNomineeRow = (
    n,
    selectedUuid,
    onSelect,
    voteCountForStep,
    maxVoteCount,
  ) => {
    const name = getNomineeName(n);
    const dept = getNomineeDept(n);
    const photo = getNomineePhoto(n);
    const initial = (name[0] || "?").toUpperCase();
    const votes = voteCountForStep ?? 0;
    const isSelected = selectedUuid === n.nomineeEmpUuid;
    const citation = getCitation(n);
    const nominators = getNominatorNames(n);
    const isHighestVote = votes > 0 && votes === maxVoteCount;

    const handleViewCitation = (e) => {
      e.stopPropagation();
      setCitationModal({
        empUuid: n.nomineeEmpUuid,
        name,
        dept,
        citation,
        nominators,
      });
    };

    return (
      <div
        key={n.nomineeEmpUuid}
        className={`aw_nominee_row${isSelected ? " aw_nominee_row--selected" : ""}`}
        onClick={() => onSelect(n.nomineeEmpUuid)}
      >
        <input
          type="radio"
          className="aw_radio"
          checked={isSelected}
          onChange={() => onSelect(n.nomineeEmpUuid)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="aw_avatar">
          {photo ? (
            <img src={photo} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="aw_avatar_initial">{initial}</span>
          )}
        </div>
        <div className="aw_nominee_info">
          <span className="aw_nominee_name">{name}</span>
          <span className="aw_nominee_dept">{dept}</span>
        </div>
        <div className="aw_row_actions">
          {citation ? (
            <button
              type="button"
              className="aw_view_citation_btn"
              onClick={handleViewCitation}
            >
              View Citation
            </button>
          ) : (
            <span className="aw_no_citation">—</span>
          )}
          <span
            className={`aw_votes_badge${isHighestVote ? " aw_votes_badge--active" : ""}`}
          >
            {String(votes).padStart(2, "0")} Vote(s)
          </span>
        </div>
      </div>
    );
  };

  // Confirmation step
  if (step === STEP_CONFIRM) {
    return (
      <div className="aw_overlay" onClick={handleClose}>
        <div className="aw_confirm_modal" onClick={(e) => e.stopPropagation()}>
          <div className="aw_confirm_header">
            <h2 className="aw_modal_title">Confirm Winners</h2>
            <button
              type="button"
              className="aw_close_btn_icon"
              onClick={handleClose}
            >
              <img src={Cross_icon} alt="close" />
            </button>
          </div>
          <p className="aw_confirm_question">
            Do you want to confirm these winners for {monthYear}?
          </p>
          {employeeWinner && (
            <div className="aw_confirm_winner_card aw_confirm_winner_card--employee">
              <div className="aw_confirm_winner_badge">
                <img
                  src={EmployeeChoiceIcon}
                  alt=""
                  className="aw_badge_icon"
                />
                <span>Employee&apos;s Choice Winner</span>
              </div>
              <div className="aw_confirm_winner_info">
                <div className="aw_avatar aw_avatar--sm">
                  {getNomineePhoto(employeeWinner) ? (
                    <img
                      src={getNomineePhoto(employeeWinner)}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="aw_avatar_initial">
                      {(getNomineeName(employeeWinner)[0] || "?").toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="aw_confirm_winner_name">
                    {getNomineeName(employeeWinner)}
                  </span>
                  <span className="aw_confirm_winner_dept">
                    {getNomineeDept(employeeWinner)}
                  </span>
                  <span className="aw_confirm_winner_votes aw_confirm_winner_votes--employee">
                    {employeeWinner.voteCountEmployeeChoice ??
                      employeeWinner.voteCount ??
                      0}{" "}
                    Vote(s)
                  </span>
                </div>
              </div>
            </div>
          )}
          {leadershipWinner && (
            <div className="aw_confirm_winner_card aw_confirm_winner_card--leadership">
              <div className="aw_confirm_winner_badge">
                <img
                  src={LeadershipChoiceIcon}
                  alt=""
                  className="aw_badge_icon"
                />
                <span>Leadership Choice Winner</span>
              </div>
              <div className="aw_confirm_winner_info">
                <div className="aw_avatar aw_avatar--sm">
                  {getNomineePhoto(leadershipWinner) ? (
                    <img
                      src={getNomineePhoto(leadershipWinner)}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="aw_avatar_initial">
                      {(
                        getNomineeName(leadershipWinner)[0] || "?"
                      ).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="aw_confirm_winner_name">
                    {getNomineeName(leadershipWinner)}
                  </span>
                  <span className="aw_confirm_winner_dept">
                    {getNomineeDept(leadershipWinner)}
                  </span>
                  <span className="aw_confirm_winner_votes aw_confirm_winner_votes--leadership">
                    {leadershipWinner.voteCountLeadershipChoice ??
                      leadershipWinner.voteCount ??
                      0}{" "}
                    Vote(s)
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="aw_confirm_footer">
            <button
              type="button"
              className="aw_btn_back"
              onClick={() => setStep(STEP_LEADERSHIP)}
            >
              Go back
            </button>
            <button
              type="button"
              className="aw_btn_confirm"
              onClick={handleSubmit}
            >
              Yes, Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aw_overlay" onClick={handleClose}>
      <div className="aw_modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="aw_modal_header">
          <h2 className="aw_modal_title">Announce Winners</h2>
          <button
            type="button"
            className="aw_close_btn_icon"
            onClick={handleClose}
          >
            <img src={Cross_icon} alt="close" />
          </button>
        </div>

        {/* Stepper */}
        <div className="aw_stepper">
          <div
            className={`aw_step${step > STEP_EMPLOYEE ? " aw_step--done" : step === STEP_EMPLOYEE ? " aw_step--active" : ""}`}
          >
            <span className="aw_step_circle">
              {step > STEP_EMPLOYEE ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7L5.5 10.5L12 4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                "1"
              )}
            </span>
            <span className="aw_step_label">Employee&apos;s Choice</span>
          </div>
          <div className="aw_step_line" />
          <div
            className={`aw_step${step === STEP_LEADERSHIP ? " aw_step--active" : ""}`}
          >
            <span className="aw_step_circle">2</span>
            <span className="aw_step_label">Leadership Choice</span>
          </div>
        </div>

        {/* Body */}
        <div className="aw_modal_body">
          {rewardsNomineesForAnnounceLoading ? (
            <p className="aw_loading">Loading nominees...</p>
          ) : (
            <>
              <p className="aw_nominees_count">
                Nominees ({nominees.length.toString().padStart(2, "0")})
              </p>
              <div className="aw_nominees_list">
                {step === STEP_EMPLOYEE
                  ? sortedByEmployeeChoice.map((n) =>
                      renderNomineeRow(
                        n,
                        employeeChoiceEmpUuid,
                        setEmployeeChoiceEmpUuid,
                        n.voteCountEmployeeChoice,
                        maxEmployeeVotes,
                      ),
                    )
                  : sortedByLeadershipChoice.map((n) =>
                      renderNomineeRow(
                        n,
                        leadershipChoiceEmpUuid,
                        setLeadershipChoiceEmpUuid,
                        n.voteCountLeadershipChoice,
                        maxLeadershipVotes,
                      ),
                    )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="aw_modal_footer">
          {step === STEP_EMPLOYEE ? (
            <>
              <button
                type="button"
                className="aw_btn_cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="aw_btn_next"
                disabled={!employeeChoiceEmpUuid}
                onClick={() => setStep(STEP_LEADERSHIP)}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="aw_btn_cancel"
                onClick={() => setStep(STEP_EMPLOYEE)}
              >
                Back
              </button>
              <button
                type="button"
                className="aw_btn_next"
                disabled={!leadershipChoiceEmpUuid}
                onClick={() => setStep(STEP_CONFIRM)}
              >
                Confirm Winners
              </button>
            </>
          )}
        </div>
      </div>

      <CitationDetailModal
        isOpen={!!citationModal}
        onClose={() => setCitationModal(null)}
        name={citationModal?.name}
        department={citationModal?.dept}
        citation={citationModal?.citation}
        nominators={citationModal?.nominators}
        title="Citation"
      />
    </div>
  );
};

export default AnnounceWinnersModal;
