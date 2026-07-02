import { useSelector } from "react-redux";
import {
  formatMonthYear,
  formatStartsOn,
  formatDayMonth,
  formatNominationStarts,
} from "../rewardsUtils";
import {
  PHASE_NOMINATION,
  PHASE_VOTING,
  PHASE_WINNERS,
} from "../rewardsConstants";
import multiple_user_grey_icon from "../../assets/icons/multiple_user_grey_icon.svg";
import thumbs_up_grey_icon from "../../assets/icons/thumbs_up_grey_icon.svg";
import award_grey_icon from "../../assets/icons/award_grey_icon.svg";
import checkmarkIcon from "../../assets/icons/tick_blue_icon.svg";
import "../styles/ProcessPhases.scss";

const ProcessPhases = () => {
  const { rewardsDashboardData } = useSelector(
    (state) => state.hrRepositoryReducer,
  );

  const cycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
  const currentPhase = (cycle?.currentPhase || "pending").toLowerCase();
  const cycleStatus = (cycle?.status || "").toLowerCase();
  const isCycleCompleted = cycleStatus === "completed";
  const currentCycleWinners = Array.isArray(
    rewardsDashboardData?.currentCycleWinners,
  )
    ? rewardsDashboardData.currentCycleWinners
    : [];
  const winnersAnnounced = currentCycleWinners.length > 0;
  const monthYear = formatMonthYear(cycle?.month, cycle?.year);

  const phaseOrder = [PHASE_NOMINATION, PHASE_VOTING, PHASE_WINNERS];
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
  const showActive = !isCycleCompleted;

  const nominationEnded = isCycleCompleted || currentPhaseIndex > 0;
  const votingEnded = isCycleCompleted || currentPhaseIndex > 1;
  const winnersReached = isCycleCompleted || currentPhaseIndex >= 2;

  const nominationSubtitleDefault = cycle?.nominationStartDate
    ? formatStartsOn(cycle.nominationStartDate)
    : cycle?.month && cycle?.year
      ? formatNominationStarts(cycle.month, cycle.year) ||
        `Starts 1st ${formatMonthYear(cycle.month, cycle.year).replace(/^\w+ /, "")}`
      : "Starts soon";
  const votingSubtitleDefault = cycle?.votingStartDate
    ? formatStartsOn(cycle.votingStartDate)
    : cycle?.nominationEndDate
      ? "After nomination ends"
      : "Starts after nomination";
  const winnersSubtitleDefault = cycle?.votingEndDate
    ? formatDayMonth(cycle.votingEndDate)
    : cycle?.month && cycle?.year
      ? formatDayMonth(new Date(cycle.year, cycle.month - 1, 28))
      : "—";

  const nominationSubtitle = nominationEnded
    ? "Completed"
    : nominationSubtitleDefault;
  const votingSubtitle = votingEnded ? "Completed" : votingSubtitleDefault;
  const winnersSubtitle =
    isCycleCompleted || winnersAnnounced
      ? "Winners announced"
      : winnersReached
        ? "Pending"
        : winnersSubtitleDefault;

  const phases = [
    {
      id: 1,
      key: PHASE_NOMINATION,
      title: "Nomination",
      subtitle: nominationSubtitle,
      icon: <img src={multiple_user_grey_icon} alt="" />,
      checkIcon: <img src={checkmarkIcon} alt="" />,
      isActive: showActive && currentPhase === PHASE_NOMINATION,
      isCompleted: nominationEnded,
    },
    {
      id: 2,
      key: PHASE_VOTING,
      title: "Voting",
      subtitle: votingSubtitle,
      icon: <img src={thumbs_up_grey_icon} alt="" />,
      checkIcon: <img src={checkmarkIcon} alt="" />,
      isActive: showActive && currentPhase === PHASE_VOTING,
      isCompleted: votingEnded,
    },
    {
      id: 3,
      key: PHASE_WINNERS,
      title: "Winners",
      subtitle: winnersSubtitle,
      icon: <img src={award_grey_icon} alt="" />,
      checkIcon: <img src={checkmarkIcon} alt="" />,
      isActive: showActive && currentPhase === PHASE_WINNERS,
      isCompleted: isCycleCompleted || (winnersReached && winnersAnnounced),
    },
  ];

  return (
    <div className="process_phases_container">
      <div className="title_section">
        <span className="label">Rewards & Recognitions for</span>
        <span className="month_year">{monthYear || "—"}</span>
      </div>
      <div className="phases_section">
        {phases.map((phase, index) => {
          const isCompletedOrActive = phase.isCompleted || phase.isActive;
          const connectorIsCompleted = phase.isCompleted; // thick blue line when left phase is completed
          return (
            <div key={phase.id} className="phase_wrapper">
              <div
                className={`phase_item ${phase.isActive ? "active" : ""} ${phase.isCompleted ? "completed" : ""} ${isCompletedOrActive ? "completed_or_running" : "pending"}`}
              >
                <div className="icon_container">
                  {phase.isCompleted ? phase.checkIcon : phase.icon}
                </div>
                <div className="phase_info">
                  <span className="phase_title">{phase.title}</span>
                  <span className="phase_subtitle">{phase.subtitle}</span>
                </div>
              </div>
              {index < phases.length - 1 && (
                <div
                  className={`connector_line ${connectorIsCompleted ? "connector_completed" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessPhases;
