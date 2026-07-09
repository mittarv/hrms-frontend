import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import CitationDetailModal from "./CitationDetailModal";
import {
  formatMonthYear,
  buildEmployeeName,
  getPreviousMonthYear,
} from "../rewardsUtils";
import { getComponentTypeValue } from "../../Common/utils/helper";
import { startRewardsPhase } from "../../../../actions/hrRepositoryAction";
import { PHASE_NOMINATION } from "../rewardsConstants";
import EmployeeChoiceIcon from "../../assets/icons/rewards_icon.svg";
import LeadershipChoiceIcon from "../../assets/icons/award_icon.svg";
import happy_jar_icon from "../../assets/icons/happy_jar_icon.svg";
import "../styles/WinnerComponent.scss";

const AWARD_EMPLOYEE_CHOICE = "employee_choice";
const AWARD_LEADERSHIP_CHOICE = "leadership_choice";
const CITATION_PREVIEW_CHARS = 95;

const getCitationPreview = (citation) => {
  const normalized = String(citation || "").trim();
  if (!normalized) {
    return { preview: "", truncated: false };
  }

  if (normalized.length <= CITATION_PREVIEW_CHARS) {
    return { preview: normalized, truncated: false };
  }

  const cutAt = normalized.lastIndexOf(" ", CITATION_PREVIEW_CHARS);
  const safeCut = cutAt > 0 ? cutAt : CITATION_PREVIEW_CHARS;

  return {
    preview: `${normalized.slice(0, safeCut).trim()}...`,
    truncated: true,
  };
};

const WinnerRow = ({ winner, type, componentType, allEmployees, showCitation }) => {
  const [isCitationModalOpen, setCitationModalOpen] = useState(false);
  const name = buildEmployeeName(winner?.employee);
  const isEmployee = type === AWARD_EMPLOYEE_CHOICE;
  const voteText = winner?.voteCount != null ? `${winner.voteCount} Vote(s)` : "";

  const empUuid = winner?.employee?.empUuid;
  const empRecord =
    empUuid && Array.isArray(allEmployees)
      ? allEmployees.find((e) => e.employeeUuid === empUuid)
      : null;
  const dept =
    empRecord != null && empRecord.employeeDepartment != null
      ? getComponentTypeValue(empRecord.employeeDepartment, componentType)
      : winner?.department != null
        ? getComponentTypeValue(winner.department, componentType)
        : null;
  const photo =
    empRecord?.employeeProfileImage ||
    winner?.employee?.profilePhoto ||
    winner?.employee?.empProfileImage ||
    null;
  const initial = (name[0] || "?").toUpperCase();
  const citationText =
    showCitation && winner?.finalCitation
      ? (winner.finalCitation || "").trim()
      : null;
  const citationPreview = citationText ? getCitationPreview(citationText) : null;

  return (
    <div className="winner_card_body" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
      <div className="winner_card_body_left">
        <div className="winner_card_avatar">
          {photo ? (
            <img src={photo} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="winner_card_avatar_initial">{initial}</span>
          )}
        </div>
        <div className="winner_card_info">
          <span className="winner_card_name">{name}</span>
          {dept && <span className="winner_card_dept">{dept}</span>}
          {voteText && (
            <span
              className={`winner_card_votes winner_card_votes--${isEmployee ? "employee" : "leadership"}`}
            >
              {voteText}
            </span>
          )}
        </div>
      </div>
      {citationText && (
        <div className="winner_card_citation_box" style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px', marginTop: '12px', backgroundColor: '#F9FAFB' }}>
          <div className="winner_card_citation_text">
            <span>&ldquo;{citationPreview.preview}&rdquo;</span>
            {citationPreview.truncated && (
              <>
                {" "}
                <button
                  type="button"
                  className="winner_card_view_more_btn"
                  onClick={() => setCitationModalOpen(true)}
                >
                  View more
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <CitationDetailModal
        isOpen={isCitationModalOpen}
        onClose={() => setCitationModalOpen(false)}
        name={name}
        department={dept}
        citation={citationText}
        title="Citation"
      />
    </div>
  );
};

const WinnerCard = ({
  winners,
  type,
  componentType,
  allEmployees,
  showCitation = false,
}) => {
  if (!winners || winners.length === 0) return null;
  const isEmployee = type === AWARD_EMPLOYEE_CHOICE;

  return (
    <div
      className={`winner_card winner_card_${isEmployee ? "employee" : "leadership"}`}
    >
      <div className="winner_card_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="winner_card_header_icon">
            {isEmployee ? (
              <img src={EmployeeChoiceIcon} alt="Employee Choice Icon" />
            ) : (
              <img src={LeadershipChoiceIcon} alt="Leadership Choice Icon" />
            )}
          </span>
          <span className="winner_card_header_text">
            {isEmployee ? "Employee's Choice Winner" : "Leadership Choice Winner"}
            {winners.length > 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600 }}>
          {winners.length} Winner{winners.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="winner_card_list_container" style={{ maxHeight: '280px', overflowY: 'auto', padding: '10px 16px', backgroundColor: 'transparent' }}>
        {winners.map((winner, idx) => (
          <WinnerRow
            key={idx}
            winner={winner}
            type={type}
            componentType={componentType}
            allEmployees={allEmployees}
            showCitation={showCitation}
          />
        ))}
      </div>
    </div>
  );
};

const WinnerComponent = ({
  variant = "current",
  isProcessCompleted = false,
  isRewardsAdmin = false,
}) => {
  const dispatch = useDispatch();
  const [startNominationConfirmOpen, setStartNominationConfirmOpen] =
    useState(false);
  const { rewardsDashboardData, getAllComponentType, allEmployees } =
    useSelector((state) => state.hrRepositoryReducer);
  const cycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
  const cycleId = cycle?.id ?? cycle?.cycleId;
  const currentCycleWinners = Array.isArray(
    rewardsDashboardData?.currentCycleWinners,
  )
    ? rewardsDashboardData.currentCycleWinners
    : [];
  const pastCyclesWithWinners = Array.isArray(
    rewardsDashboardData?.pastCyclesWithWinners,
  )
    ? rewardsDashboardData.pastCyclesWithWinners
    : [];
  const phase = (cycle?.currentPhase || "").toLowerCase();
  const cycleStatus = (cycle?.status || "").toLowerCase();
  const isCycleCompleted = cycleStatus === "completed";
  const componentType = getAllComponentType || {};

  // Check if cycle is completed without winners (no nominees case)
  const isCompletedWithoutWinners =
    isCycleCompleted && currentCycleWinners.length === 0;

  // In winners phase with no winners AND cycle not completed, show the "Choose Winner" UI
  const isWinnersPhaseNoWinners =
    phase === "winners" &&
    currentCycleWinners.length === 0 &&
    !isCycleCompleted;

  // When process not completed: show past month's winners (e.g. April when May selected).
  // But NOT when in winners phase with no winners - that case shows Choose Winner button
  const showPastWinners =
    variant === "past" &&
    (phase === "pending" || phase === "nomination" || phase === "voting") &&
    !isWinnersPhaseNoWinners;

  // Calculate the previous month from current cycle
  const previousMonthYear =
    cycle?.month != null && cycle?.year != null
      ? getPreviousMonthYear(cycle.month, cycle.year)
      : null;

  // Find past cycle that matches exactly the previous month (not just any past winner)
  const pastCycle =
    showPastWinners && pastCyclesWithWinners.length > 0 && previousMonthYear
      ? pastCyclesWithWinners.find(
          (c) =>
            c.month === previousMonthYear.month &&
            c.year === previousMonthYear.year,
        ) || null
      : null;
  const pastWinners = pastCycle?.winners || [];
  const pastEmployeeChoice = pastWinners.filter(
    (w) => w.awardType === AWARD_EMPLOYEE_CHOICE,
  );
  const pastLeadershipChoice = pastWinners.filter(
    (w) => w.awardType === AWARD_LEADERSHIP_CHOICE,
  );
  const hasPastWinners = (pastEmployeeChoice && pastEmployeeChoice.length > 0) || (pastLeadershipChoice && pastLeadershipChoice.length > 0);

  // When showing past winners: use previous month from current cycle for label
  const monthYear = showPastWinners
    ? previousMonthYear
      ? formatMonthYear(previousMonthYear.month, previousMonthYear.year)
      : formatMonthYear(cycle?.month, cycle?.year)
    : formatMonthYear(cycle?.month, cycle?.year);
  const employeeChoice = showPastWinners
    ? pastEmployeeChoice
    : currentCycleWinners.filter((w) => w.awardType === AWARD_EMPLOYEE_CHOICE);
  const leadershipChoice = showPastWinners
    ? pastLeadershipChoice
    : currentCycleWinners.filter((w) => w.awardType === AWARD_LEADERSHIP_CHOICE);
  const hasWinners = (employeeChoice && employeeChoice.length > 0) || (leadershipChoice && leadershipChoice.length > 0);

  const showCitation = !showPastWinners && hasWinners;

  const handleStartNominationClick = () => {
    if (isProcessCompleted) {
      setStartNominationConfirmOpen(true);
    }
  };

  const handleConfirmStartNomination = () => {
    if (cycleId) {
      dispatch(startRewardsPhase(cycleId, PHASE_NOMINATION));
      setStartNominationConfirmOpen(false);
    }
  };

  // Hide header when showing the start nomination placeholder (no past winners)
  const showHeader = !(showPastWinners && !hasPastWinners);

  return (
    <div className="winner_component_container">
      {showHeader && (
        <div className="winner_component_header">
          <div className="winner_component_header_left">
            <span className="winner_component_header_left_title">
              Winners for
            </span>
            <span className="winner_component_header_left_month_year">
              {monthYear || "—"}
            </span>
          </div>
          {isProcessCompleted && isRewardsAdmin && (
            <button
              type="button"
              className="winner_component_start_nomination_btn"
              onClick={handleStartNominationClick}
            >
              Start Nomination Phase
            </button>
          )}
        </div>
      )}

      {showPastWinners && !hasPastWinners && (
        <NoResultsContainer
          message="No past winners to display."
          showImage={true}
          image={happy_jar_icon}
          border={false}
        />
      )}

      {!showPastWinners &&
        phase === "winners" &&
        !hasWinners &&
        !isCompletedWithoutWinners && (
          <NoResultsContainer
            message="The winners will be announced soon."
            showImage={true}
            border={false}
            image={happy_jar_icon}
          />
        )}

      {isCompletedWithoutWinners && (
        <NoResultsContainer
          message="No winners for this cycle."
          subMessage="There were no nominations for this cycle."
          showImage={true}
          border={false}
        />
      )}

      {hasWinners && (
        <div className="winner_component_cards">
          {employeeChoice && employeeChoice.length > 0 && (
            <WinnerCard
              winners={employeeChoice}
              type={AWARD_EMPLOYEE_CHOICE}
              componentType={componentType}
              allEmployees={allEmployees}
              showCitation={showCitation}
            />
          )}
          {leadershipChoice && leadershipChoice.length > 0 && (
            <WinnerCard
              winners={leadershipChoice}
              type={AWARD_LEADERSHIP_CHOICE}
              componentType={componentType}
              allEmployees={allEmployees}
              showCitation={showCitation}
            />
          )}
        </div>
      )}

      {startNominationConfirmOpen && (
        <ConfirmationPopup
          isOpen={startNominationConfirmOpen}
          onClose={() => setStartNominationConfirmOpen(false)}
          onConfirm={handleConfirmStartNomination}
          heading="Start Nomination Phase"
          message="Are you sure you want to start the nomination phase? Employees will be able to submit nominations."
          confirmText="Yes, Continue"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default WinnerComponent;
