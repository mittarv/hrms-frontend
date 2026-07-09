import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRewardsDashboard,
  fetchRewardsReceivedCitationsHistory,
} from "../../../../actions/hrRepositoryAction";
import { formatMonthYear, buildEmployeeName } from "../rewardsUtils";
import { getComponentTypeValue } from "../../Common/utils/helper";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import CustomTooltip from "../../Common/components/CustomTooltip";
import EmployeeChoiceIcon from "../../assets/icons/award_blue_icon.svg";
import LeadershipChoiceIcon from "../../assets/icons/achivement_green_icon.svg";
import EmployeeChoiceWhiteIcon from "../../assets/icons/rewards_icon.svg";
import LeadershipChoiceWhiteIcon from "../../assets/icons/award_icon.svg";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import "../styles/RewardsTabs.scss";

const TAB_WINNERS = "winners";
const TAB_YOUR_NOMINATIONS = "your_nominations";
const TAB_RECEIVED_CITATIONS = "received_citations";
const TAB_YOUR_AWARDS = "your_awards";

const AWARD_EMPLOYEE_CHOICE = "employee_choice";

// ─── Citation Modal ────────────────────────────────────────────────────────────
// supports both single (title/citation) and multi-entry (entries=[{name,citation}]) modes
const CitationModal = ({
  title,
  subtitle,
  citation,
  nominators,
  entries,
  onClose,
}) => (
  <div className="rt_citation_overlay" onClick={onClose}>
    <div className="rt_citation_modal" onClick={(e) => e.stopPropagation()}>
      <div className="rt_citation_modal_header">
        <div className="rt_citation_modal_header_container">
          <p className="rt_citation_modal_title">{title}</p>
          <button
            type="button"
            className="rt_citation_close_icon"
            onClick={onClose}
          >
            <img src={Cross_icon} alt="close" />
          </button>
        </div>
        {subtitle && <p className="rt_citation_modal_sub">{subtitle}</p>}
      </div>
      <hr className="rt_citation_divider" />
      <div className="rt_citation_modal_body">
        {entries && entries.length > 0 ? (
          entries.map((entry, idx) => (
            <div key={idx} className="rt_citation_entry">
              <p className="rt_citation_entry_name">{entry.name}</p>
              {entry.citation ? (
                <p className="rt_citation_text">
                  &ldquo;{entry.citation}&rdquo;
                </p>
              ) : (
                <p className="rt_citation_empty">No citation available.</p>
              )}
            </div>
          ))
        ) : (
          <>
            {citation ? (
              <p className="rt_citation_text">&ldquo;{citation}&rdquo;</p>
            ) : (
              <p className="rt_citation_empty">No citation available.</p>
            )}
            {nominators && (
              <p className="rt_citation_nominators">- {nominators}</p>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

// ─── Single Winner Modal ─────────────────────────────────────────────────────
// variant 'winner' = full card (avatar, name, dept, votes) when clicking a winner in Winners section
// variant 'award' = simplified card (icon + title + date + quote) for Your awards
const SingleWinnerModal = ({
  winner,
  variant,
  componentType,
  allEmployees,
  onClose,
}) => {
  const isEmployee = winner.awardType === AWARD_EMPLOYEE_CHOICE;
  const monthYear = formatMonthYear(winner.cycle?.month, winner.cycle?.year);
  const citationText = (
    winner.finalCitation ||
    winner.groupedCitation ||
    winner.citation ||
    ""
  ).trim();
  const isAwardVariant = variant === "award";

  const getEmpRecord = (uuid) =>
    uuid && Array.isArray(allEmployees)
      ? allEmployees.find((e) => e.employeeUuid === uuid) || null
      : null;
  const empRecord = getEmpRecord(winner.employee?.empUuid);
  const name = buildEmployeeName(winner.employee);
  const photo =
    empRecord?.employeeProfileImage ||
    winner.employee?.profilePhoto ||
    winner.employee?.empProfileImage ||
    null;
  const rawDept = empRecord?.employeeDepartment ?? winner.department;
  const dept =
    rawDept != null ? getComponentTypeValue(rawDept, componentType) : null;
  const initial = (name[0] || "?").toUpperCase();
  const voteText = winner.voteCount != null ? `${winner.voteCount} Vote(s)` : "";

  return (
    <div className="rt_citation_overlay" onClick={onClose}>
      <div
        className={`rt_single_winner_card rt_single_winner_card--${isEmployee ? "employee" : "leadership"}${isAwardVariant ? " rt_single_winner_card--award" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="rt_single_winner_close_btn"
          onClick={onClose}
        >
          <img src={Cross_icon} alt="close" />
        </button>
        <div className="rt_single_winner_card_header">
          <span className="rt_single_winner_card_header_icon">
            <img
              src={
                isAwardVariant
                  ? isEmployee
                    ? EmployeeChoiceIcon
                    : LeadershipChoiceIcon
                  : isEmployee
                    ? EmployeeChoiceWhiteIcon
                    : LeadershipChoiceWhiteIcon
              }
              alt=""
            />
          </span>
          {isAwardVariant ? (
            <div className="rt_single_winner_card_header_text_block">
              <span className="rt_single_winner_card_header_text">
                {isEmployee
                  ? "Employee's Choice Winner"
                  : "Leadership Choice Winner"}
              </span>
              {monthYear && (
                <span className="rt_single_winner_card_header_date">
                  {monthYear}
                </span>
              )}
            </div>
          ) : (
            <span className="rt_single_winner_card_header_text">
              {isEmployee
                ? "Employee's Choice Winner"
                : "Leadership Choice Winner"}
            </span>
          )}
        </div>
        <div className="rt_single_winner_card_body">
          {!isAwardVariant && (
            <div className="rt_single_winner_card_body_left">
              <div className="rt_single_winner_card_avatar">
                {photo ? (
                  <img src={photo} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span className="rt_single_winner_card_avatar_initial">
                    {initial}
                  </span>
                )}
              </div>
              <div className="rt_single_winner_card_info">
                <span className="rt_single_winner_card_name">{name}</span>
                {dept && (
                  <span className="rt_single_winner_card_dept">{dept}</span>
                )}
                {voteText && (
                  <span
                    className={`rt_single_winner_card_votes rt_single_winner_card_votes--${isEmployee ? "employee" : "leadership"}`}
                  >
                    {voteText}
                  </span>
                )}
              </div>
            </div>
          )}
          {citationText ? (
            <div className="rt_single_winner_card_citation_box">
              <p className="rt_single_winner_card_citation_text">
                &ldquo;{citationText}&rdquo;
              </p>
            </div>
          ) : (
            <div className="rt_single_winner_card_citation_box">
              <p className="rt_single_winner_card_citation_empty">
                No citation available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Nominations Modal (Received Citations style) ───────────────────────────
const NominationsModal = ({ heading = "Your Nominations", title, nominations, onClose }) => (
  <div className="rt_citation_overlay" onClick={onClose}>
    <div className="rt_nominations_modal" onClick={(e) => e.stopPropagation()}>
      <div className="rt_nominations_modal_header">
        <div className="rt_nominations_modal_title_block">
          <span className="rt_nominations_modal_title">{heading}</span>
          <span className="rt_nominations_modal_subtitle">{title}</span>
        </div>
        <button
          type="button"
          className="rt_nominations_modal_close"
          onClick={onClose}
        >
          <img src={Cross_icon} alt="close" />
        </button>
      </div>
      <div className="rt_nominations_modal_content">
        <div className="rt_nominations_modal_list_header">
          <h3>All Nominations ({nominations.length})</h3>
        </div>
        <div className="rt_nominations_modal_list">
          {nominations.map((n, index) => (
            <div key={index} className="rt_nominations_modal_item">
              <p className="rt_nominations_modal_quote">
                &ldquo;{n.citation || "No citation provided"}&rdquo;
              </p>
              <span className="rt_nominations_modal_author">
                &ndash; {n.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Winners For Month Modal ───────────────────────────────────────────────────
// Shows all winners for a specific month in a combined view
const WinnersForMonthModal = ({
  monthYear,
  winners,
  componentType,
  allEmployees,
  onClose,
  onWinnerClick,
}) => {
  const getEmpRecord = (uuid) =>
    uuid && Array.isArray(allEmployees)
      ? allEmployees.find((e) => e.employeeUuid === uuid) || null
      : null;

  const resolvePhoto = (empUuid, employee) => {
    const rec = getEmpRecord(empUuid || employee?.empUuid);
    return (
      rec?.employeeProfileImage ||
      employee?.profilePhoto ||
      employee?.empProfileImage ||
      null
    );
  };

  const resolveDept = (empUuid, employee, departmentRaw) => {
    const rec = getEmpRecord(empUuid || employee?.empUuid);
    const raw = rec?.employeeDepartment ?? departmentRaw;
    return raw != null ? getComponentTypeValue(raw, componentType) : null;
  };

  const employeeChoice = winners.filter(
    (w) => w.awardType === AWARD_EMPLOYEE_CHOICE,
  );
  const leadershipChoice = winners.filter(
    (w) => w.awardType !== AWARD_EMPLOYEE_CHOICE,
  );

  const renderWinnerRow = (winner, type) => {
    if (!winner) return null;
    const isEmployee = type === AWARD_EMPLOYEE_CHOICE;
    const name = buildEmployeeName(winner.employee);
    const photo = resolvePhoto(winner.employee?.empUuid, winner.employee);
    const dept = resolveDept(
      winner.employee?.empUuid,
      winner.employee,
      winner.department,
    );
    const initial = (name[0] || "?").toUpperCase();
    const voteText =
      winner.voteCount != null ? `${winner.voteCount} Vote(s)` : "";
    const citationText = (
      winner.finalCitation ||
      winner.groupedCitation ||
      ""
    ).trim();

    return (
      <div
        key={winner.id || winner.employeeEmpUuid}
        className="rt_wfm_winner_card_body"
        onClick={() => onWinnerClick && onWinnerClick(winner)}
        style={{ cursor: onWinnerClick ? "pointer" : "default", backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', marginBottom: '12px', display: 'flex', flexDirection: 'column' }}
      >
        <div className="rt_wfm_winner_card_body_left" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="rt_wfm_winner_card_avatar" style={{ marginRight: '16px' }}>
            {photo ? (
              <img src={photo} alt="" referrerPolicy="no-referrer" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span className="rt_wfm_winner_card_avatar_initial" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB', color: '#374151', fontWeight: 600 }}>
                {initial}
              </span>
            )}
          </div>
          <div className="rt_wfm_winner_card_info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="rt_wfm_winner_card_name" style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{name}</span>
            {dept && <span className="rt_wfm_winner_card_dept" style={{ color: '#6B7280', fontSize: '12px' }}>{dept}</span>}
            {voteText && (
              <span
                className={`rt_wfm_winner_card_votes rt_wfm_winner_card_votes--${isEmployee ? "employee" : "leadership"}`}
                style={{ fontSize: '12px', marginTop: '4px', fontWeight: 500, color: isEmployee ? '#19318B' : '#115F5F' }}
              >
                {voteText}
              </span>
            )}
          </div>
        </div>
        {citationText && (
          <div className="rt_wfm_winner_card_citation_box" style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px', marginTop: '12px', backgroundColor: '#F9FAFB' }}>
            <CustomTooltip
              text={`"${citationText}"`}
              maxWords={25}
              fullWidth
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rt_citation_overlay" onClick={onClose}>
      <div className="rt_wfm_modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="rt_wfm_modal_header" style={{ flexShrink: 0 }}>
          <div className="rt_wfm_modal_header_left">
            <span className="rt_wfm_modal_header_title">Winners For</span>
            <span className="rt_wfm_modal_header_month">{monthYear}</span>
          </div>
          <button
            type="button"
            className="rt_citation_close_icon"
            onClick={onClose}
          >
            <img src={Cross_icon} alt="close" />
          </button>
        </div>
        
        <div className="rt_wfm_modal_body" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {employeeChoice.length > 0 && (
            <div className="rt_wfm_winner_card rt_wfm_winner_card--employee" style={{marginBottom: "16px"}}>
              <div className="rt_wfm_winner_card_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={EmployeeChoiceWhiteIcon} alt="" style={{ margin: 0 }} />
                  <span style={{ color: 'white' }}>Employee Choice Winner{employeeChoice.length > 1 ? 's' : ''}</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', color: '#4B5563', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {employeeChoice.length} Winner{employeeChoice.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9FAFB' ,overflowY:'scroll'}}>
                {employeeChoice.map((winner) => renderWinnerRow(winner, AWARD_EMPLOYEE_CHOICE))}
              </div>
            </div>
          )}
          
          {leadershipChoice.length > 0 && (
            <div className="rt_wfm_winner_card rt_wfm_winner_card--leadership" style={{marginBottom: "16px"}}>
              <div className="rt_wfm_winner_card_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={LeadershipChoiceWhiteIcon} alt="" style={{ margin: 0 }} />
                  <span style={{ color: 'white' }}>Leadership Choice Winner{leadershipChoice.length > 1 ? 's' : ''}</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', color: '#4B5563', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {leadershipChoice.length} Winner{leadershipChoice.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9FAFB' ,overflowY:'scroll'}}>
                {leadershipChoice.map((winner) => renderWinnerRow(winner, "leadership_choice"))}
              </div>
            </div>
          )}
          
          {employeeChoice.length === 0 && leadershipChoice.length === 0 && (
            <p className="rt_wfm_no_winners">No winners for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Shared person mini-card ───────────────────────────────────────────────────
const PersonCard = ({
  photo,
  initial,
  name,
  dept,
  voteText,
  voteColor,
  badgeIcon,
  badgeColor,
  onClick,
  onView,
}) => (
  <div
    className="rt_person_card"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    {badgeIcon && (
      <div
        className="rt_person_card_badge"
        style={badgeColor ? { background: badgeColor } : undefined}
      >
        <img src={badgeIcon} alt="" />
      </div>
    )}
    <div className="rt_person_card_avatar">
      {photo ? (
        <img src={photo} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
    <div className="rt_person_card_info">
      <span className="rt_person_card_name">{name}</span>
      {dept && <span className="rt_person_card_dept">{dept}</span>}
      {voteText && (
        <span className="rt_person_card_votes" style={{ color: voteColor }}>
          {voteText}
        </span>
      )}
    </div>
    {onView && (
      <button
        type="button"
        className="rt_view_link rt_card_view_btn"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      >
        View
      </button>
    )}
  </div>
);

const RewardsTabs = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(TAB_WINNERS);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [citationModal, setCitationModal] = useState(null);
  const [winnersForMonthModal, setWinnersForMonthModal] = useState(null);
  const [singleWinnerModal, setSingleWinnerModal] = useState(null);
  const [nominationsModal, setNominationsModal] = useState(null);

  const {
    rewardsDashboardData,
    rewardsPastReceivedCitations,
    rewardsPastReceivedCitationsLoading,
    rewardsPastReceivedCitationsLoaded,
    rewardsPastReceivedCitationsLoadedYear,
    getAllComponentType,
    allEmployees,
  } = useSelector((state) => state.hrRepositoryReducer);

  useEffect(() => {
    dispatch(fetchRewardsDashboard(selectedYear));
  }, [dispatch, selectedYear]);

  useEffect(() => {
    if (
      rewardsPastReceivedCitationsLoading ||
      (rewardsPastReceivedCitationsLoaded &&
        rewardsPastReceivedCitationsLoadedYear === selectedYear)
    ) {
      return;
    }
    dispatch(fetchRewardsReceivedCitationsHistory(selectedYear));
  }, [
    dispatch,
    selectedYear,
    rewardsPastReceivedCitationsLoading,
    rewardsPastReceivedCitationsLoaded,
    rewardsPastReceivedCitationsLoadedYear,
  ]);

  const currentCycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
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
  const myNominationsAll = Array.isArray(rewardsDashboardData?.myNominationsAll)
    ? rewardsDashboardData.myNominationsAll
    : [];
  const myAwards = Array.isArray(rewardsDashboardData?.myAwards)
    ? rewardsDashboardData.myAwards.filter(
        (award) => Number(award?.cycle?.year) === selectedYear,
      )
    : [];
  const pastReceivedCitations = Array.isArray(rewardsPastReceivedCitations)
    ? rewardsPastReceivedCitations.filter(
        (citation) => Number(citation?.cycle?.year) === selectedYear,
      )
    : [];
  const componentType = getAllComponentType || {};

  const getEmpRecord = (uuid) =>
    uuid && Array.isArray(allEmployees)
      ? allEmployees.find((e) => e.employeeUuid === uuid) || null
      : null;

  const resolvePhoto = (empUuid, employee) => {
    const rec = getEmpRecord(empUuid || employee?.empUuid);
    return (
      rec?.employeeProfileImage ||
      employee?.profilePhoto ||
      employee?.empProfileImage ||
      null
    );
  };

  const resolveDept = (empUuid, employee, departmentRaw) => {
    const rec = getEmpRecord(empUuid || employee?.empUuid);
    const raw = rec?.employeeDepartment ?? departmentRaw;
    return raw != null ? getComponentTypeValue(raw, componentType) : null;
  };

  // ── Winners data ──────────────────────────────────────────────────────────
  const allWinnersByMonth = [];
  if (
    currentCycle &&
    currentCycleWinners.length > 0 &&
    Number(currentCycle.year) === selectedYear
  ) {
    allWinnersByMonth.push({
      month: currentCycle.month,
      year: currentCycle.year,
      cycleId: currentCycle.id || currentCycle.cycleId,
      winners: currentCycleWinners,
    });
  }
  pastCyclesWithWinners.forEach((c) => {
    if (
      Number(c.year) === selectedYear &&
      c.winners &&
      c.winners.length > 0
    ) {
      allWinnersByMonth.push({
        month: c.month,
        year: c.year,
        cycleId: c.id,
        winners: c.winners,
      });
    }
  });

  // ── Nominations data ──────────────────────────────────────────────────────
  const nominationsByCycle = {};
  myNominationsAll.forEach((n) => {
    const cycle = n.cycle;
    if (!cycle || Number(cycle.year) !== selectedYear) return;
    const key = `${cycle.year}-${cycle.month}`;
    if (!nominationsByCycle[key]) {
      nominationsByCycle[key] = {
        month: cycle.month,
        year: cycle.year,
        cycleId: cycle.id,
        list: [],
      };
    }
    nominationsByCycle[key].list.push(n);
  });
  const nominationsByMonth = Object.values(nominationsByCycle).sort(
    (a, b) => (b.year - a.year) * 12 + (b.month - a.month),
  );

  // ── Received citations data ───────────────────────────────────────────────
  const receivedCitationsByCycle = {};
  pastReceivedCitations.forEach((citation) => {
    const cycle = citation?.cycle;
    if (!cycle) return;
    const key = `${cycle.year}-${cycle.month}`;
    if (!receivedCitationsByCycle[key]) {
      receivedCitationsByCycle[key] = {
        month: cycle.month,
        year: cycle.year,
        cycleId: cycle.id,
        list: [],
      };
    }
    receivedCitationsByCycle[key].list.push(citation);
  });
  const receivedCitationsByMonth = Object.values(receivedCitationsByCycle).sort(
    (a, b) => (b.year - a.year) * 12 + (b.month - a.month),
  );

  const openWinnerCitation = (w) => {
    setSingleWinnerModal({ winner: w, variant: "winner" });
  };

  const openAllNominationCitations = (list) => {
    const entries = list.map((n) => ({
      name: buildEmployeeName(n.nominee),
      citation: n.citation || n.groupedCitation || "",
    }));
    setNominationsModal({
      title: `${list.length} Nominations`,
      nominations: entries,
    });
  };

  const openNominationCitation = (n) => {
    const name = buildEmployeeName(n.nominee);
    setNominationsModal({
      title: "1 Nomination",
      nominations: [{ name, citation: n.citation || n.groupedCitation || "" }],
    });
  };

  const openAllReceivedCitations = (list) => {
    const entries = list.map((c) => ({
      name: buildEmployeeName(c.nominatedBy),
      citation: c.citation || "",
    }));
    setNominationsModal({
      heading: "Received Citations",
      title: `${list.length} Citations`,
      nominations: entries,
    });
  };

  const openReceivedCitation = (c) => {
    setNominationsModal({
      heading: "Received Citations",
      title: "1 Citation",
      nominations: [
        {
          name: buildEmployeeName(c.nominatedBy),
          citation: c.citation || "",
        },
      ],
    });
  };

  const openAwardCitation = (a) => {
    // Transform award for SingleWinnerModal format
    const empRecord = getEmpRecord(a.employeeEmpUuid);
    const awardAsWinner = {
      awardType: a.awardType,
      cycle: a.cycle,
      employee: a.employee || {
        empUuid: a.employeeEmpUuid,
        empFirstName: empRecord?.employeeFirstName || "",
        empLastName: empRecord?.employeeLastName || "",
        profilePhoto: empRecord?.employeeProfileImage,
      },
      department: empRecord?.employeeDepartment ?? a.department,
      voteCount: a.voteCount,
      finalCitation: a.finalCitation || a.groupedCitation || a.citation || "",
    };
    setSingleWinnerModal({ winner: awardAsWinner, variant: "award" });
  };

  const openWinnersForMonth = (month, year, winners) => {
    const monthYear = formatMonthYear(month, year);
    setWinnersForMonthModal({
      monthYear,
      month,
      year,
      winners,
    });
  };

  const handleWinnerClickFromModal = (winner) => {
    const { month, year } = winnersForMonthModal || {};
    setWinnersForMonthModal(null);
    const w =
      month != null && year != null
        ? { ...winner, cycle: { month, year } }
        : winner;
    setSingleWinnerModal({ winner: w, variant: "winner" });
  };

  const currentYear = new Date().getFullYear();
  const goToPreviousYear = () => setSelectedYear((prev) => prev - 1);
  const goToNextYear = () => {
    setSelectedYear((prev) => (prev < currentYear ? prev + 1 : prev));
  };

  return (
    <div className="rewards_tabs_container">
      {/* Tab Header */}
      <div className="rewards_tabs_header" role="tablist">
        {[
          { key: TAB_WINNERS, label: "Winners" },
          { key: TAB_YOUR_NOMINATIONS, label: "Your Nominations" },
          { key: TAB_YOUR_AWARDS, label: "Your awards" },
          { key: TAB_RECEIVED_CITATIONS, label: "Received Citations" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={`rewards_tab ${activeTab === key ? "active" : "inactive"}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rt_year_selector" aria-label="Select rewards year">
        <button
          type="button"
          className="rt_year_nav_btn"
          onClick={goToPreviousYear}
          aria-label="Previous year"
        >
          &#8249;
        </button>
        <span className="rt_year_value">{selectedYear}</span>
        <button
          type="button"
          className="rt_year_nav_btn"
          onClick={goToNextYear}
          aria-label="Next year"
          disabled={selectedYear >= currentYear}
        >
          &#8250;
        </button>
      </div>

      <div className="rewards_tabs_content">
        {/* ── WINNERS ──────────────────────────────────────────────────── */}
        {activeTab === TAB_WINNERS && (
          <div className="rewards_tab_panel">
            {allWinnersByMonth.length === 0 ? (
              <NoResultsContainer
                message="No winners to display yet."
                showImage={false}
                border={false}
              />
            ) : (
              <div className="rt_months_grid">
                {allWinnersByMonth.map(({ month, year, winners }) => (
                  <div key={`${year}-${month}`} className="rt_month_section">
                    <div className="rt_month_header">
                      <span className="rt_month_title">
                        {formatMonthYear(month, year)}
                      </span>
                      <button
                        type="button"
                        className="rt_view_link"
                        onClick={() =>
                          openWinnersForMonth(month, year, winners)
                        }
                      >
                        View
                      </button>
                    </div>
                    <div className="rt_cards_grid">
                      {(winners || []).map((w) => {
                        const name = buildEmployeeName(w.employee);
                        const isEmp = w.awardType === AWARD_EMPLOYEE_CHOICE;
                        const photo = resolvePhoto(
                          w.employee?.empUuid,
                          w.employee,
                        );
                        const dept = resolveDept(
                          w.employee?.empUuid,
                          w.employee,
                          w.department,
                        );
                        return (
                          <PersonCard
                            key={w.id || w.employeeEmpUuid}
                            photo={photo}
                            initial={(name[0] || "?").toUpperCase()}
                            name={name}
                            dept={dept}
                            voteText={
                              w.voteCount != null ? `${w.voteCount} Vote(s)` : ""
                            }
                            voteColor={isEmp ? "#19318B" : "#115F5F"}
                            badgeIcon={
                              isEmp ? EmployeeChoiceIcon : LeadershipChoiceIcon
                            }
                            badgeColor={isEmp ? "#5D78D7" : "#28A2A2"}
                            onClick={() =>
                              openWinnerCitation({
                                ...w,
                                cycle: { month, year },
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── YOUR NOMINATIONS ─────────────────────────────────────────── */}
        {activeTab === TAB_YOUR_NOMINATIONS && (
          <div className="rewards_tab_panel">
            {nominationsByMonth.length === 0 ? (
              <NoResultsContainer
                message="You haven't made any nominations yet."
                showImage={false}
                border={false}
              />
            ) : (
              <div className="rt_months_grid">
                {nominationsByMonth.map(({ month, year, list }) => {
                  const shown = list.slice(0, 2);
                  const hasMore = list.length > 2;
                  const gridClass = shown.length === 1 ? "rt_cards_grid--single" : "rt_cards_grid--double";
                  return (
                    <div key={`${year}-${month}`} className="rt_month_section">
                      <div className="rt_month_header">
                        <span className="rt_month_title">
                          {formatMonthYear(month, year)}
                        </span>
                        <button
                          type="button"
                          className="rt_view_link"
                          onClick={() => openAllNominationCitations(list)}
                        >
                          {hasMore ? "View All" : "View"}
                        </button>
                      </div>
                      <div className={`rt_cards_grid ${gridClass}`}>
                        {shown.map((n) => {
                          const name = buildEmployeeName(n.nominee);
                          const photo = resolvePhoto(
                            n.nominee?.empUuid,
                            n.nominee,
                          );
                          const dept = resolveDept(
                            n.nominee?.empUuid,
                            n.nominee,
                            n.department,
                          );
                          return (
                            <PersonCard
                              key={n.id || n.nomineeEmpUuid}
                              photo={photo}
                              initial={(name[0] || "?").toUpperCase()}
                              name={name}
                              dept={dept}
                              voteText={
                                n.voteCount != null
                                  ? `${n.voteCount} Vote(s)`
                                  : ""
                              }
                              voteColor="#19318B"
                              onClick={() => openNominationCitation(n)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RECEIVED CITATIONS ──────────────────────────────────────── */}
        {activeTab === TAB_RECEIVED_CITATIONS && (
          <div className="rewards_tab_panel">
            {rewardsPastReceivedCitationsLoading ? (
              <LoadingSpinner
                message="Loading received citations..."
                height="30vh"
                loaderSize={36}
              />
            ) : receivedCitationsByMonth.length === 0 ? (
              <NoResultsContainer
                message="No past received citations to display yet."
                showImage={false}
                border={false}
              />
            ) : (
              <div className="rt_months_grid">
                {receivedCitationsByMonth.map(({ month, year, list }) => {
                  const shown = list.slice(0, 2);
                  const hasMore = list.length > 2;
                  const gridClass = shown.length === 1 ? "rt_cards_grid--single" : "rt_cards_grid--double";
                  return (
                    <div key={`${year}-${month}`} className="rt_month_section">
                      <div className="rt_month_header">
                        <span className="rt_month_title">
                          {formatMonthYear(month, year)}
                        </span>
                        <button
                          type="button"
                          className="rt_view_link"
                          onClick={() => openAllReceivedCitations(list)}
                        >
                          {hasMore ? "View All" : "View"}
                        </button>
                      </div>
                      <div className={`rt_cards_grid ${gridClass}`}>
                        {shown.map((c) => {
                          const nominatorName = buildEmployeeName(c.nominatedBy);
                          const photo = resolvePhoto(
                            c.nominatedBy?.empUuid,
                            c.nominatedBy,
                          );
                          const dept = resolveDept(
                            c.nominatedBy?.empUuid,
                            c.nominatedBy,
                            c.nominatedBy?.department,
                          );
                          return (
                            <PersonCard
                              key={c.id}
                              photo={photo}
                              initial={(nominatorName[0] || "?").toUpperCase()}
                              name={nominatorName}
                              dept={dept}
                              voteText=""
                              onClick={() => openReceivedCitation(c)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── YOUR AWARDS ──────────────────────────────────────────────── */}
        {activeTab === TAB_YOUR_AWARDS && (
          <div className="rewards_tab_panel">
            {myAwards.length === 0 ? (
              <NoResultsContainer
                message="You haven't won any awards yet."
                showImage={false}
                border={false}
              />
            ) : (
              <div className="rt_cards_grid">
                {myAwards.map((a) => {
                  const isEmp = a.awardType === AWARD_EMPLOYEE_CHOICE;
                  const monthYear = formatMonthYear(
                    a.cycle?.month,
                    a.cycle?.year,
                  );
                  return (
                    <div
                      key={a.id}
                      className={`rt_award_card rt_award_card--${isEmp ? "employee" : "leadership"}`}
                      onClick={() => openAwardCitation(a)}
                    >
                      <div
                        className={`rt_award_icon_wrap rt_award_icon_wrap--${isEmp ? "employee" : "leadership"}`}
                      >
                        <img
                          src={
                            isEmp ? EmployeeChoiceIcon : LeadershipChoiceIcon
                          }
                          alt=""
                        />
                      </div>
                      <div className="rt_award_info">
                        <span className="rt_award_title">
                          {isEmp
                            ? "Employee's Choice Winner"
                            : "Leadership Choice Winner"}
                        </span>
                        <span className="rt_award_month">{monthYear}</span>
                      </div>
                      <button
                        type="button"
                        className="rt_view_link"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAwardCitation(a);
                        }}
                      >
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {citationModal && (
        <CitationModal
          title={citationModal.title}
          subtitle={citationModal.subtitle}
          citation={citationModal.citation}
          nominators={citationModal.nominators}
          entries={citationModal.entries}
          onClose={() => setCitationModal(null)}
        />
      )}

      {winnersForMonthModal && (
        <WinnersForMonthModal
          monthYear={winnersForMonthModal.monthYear}
          winners={winnersForMonthModal.winners}
          componentType={componentType}
          allEmployees={allEmployees}
          onClose={() => setWinnersForMonthModal(null)}
          onWinnerClick={handleWinnerClickFromModal}
        />
      )}

      {singleWinnerModal && (
        <SingleWinnerModal
          winner={singleWinnerModal.winner}
          variant={singleWinnerModal.variant}
          componentType={componentType}
          allEmployees={allEmployees}
          onClose={() => setSingleWinnerModal(null)}
        />
      )}

      {nominationsModal && (
        <NominationsModal
          heading={nominationsModal.heading}
          title={nominationsModal.title}
          nominations={nominationsModal.nominations}
          onClose={() => setNominationsModal(null)}
        />
      )}
    </div>
  );
};

export default RewardsTabs;
