import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import { getComponentTypeValue } from "../../Common/utils/helper";
import {
  setNominationModalOpen,
  setAnnounceWinnersModalOpen,
  fetchNomineesForVoting,
  startRewardsPhase,
  endRewardsPhase,
  rewardsVote,
} from "../../../../actions/hrRepositoryAction";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import CitationDetailModal from "./CitationDetailModal";
import { formatMonthYear } from "../rewardsUtils";
import { buildEmployeeName } from "../rewardsUtils";
import {
  PHASE_NOMINATION,
  PHASE_VOTING,
  PHASE_PENDING,
} from "../rewardsConstants";
import { hrToolHomePageData } from "../../constant/data";
import happy_jar_icon from "../../assets/icons/happy_jar_icon.svg";
import hands_heart_icon from "../../assets/icons/hands_heart_icon.svg";
import ThumbsUpIcon from "../../assets/icons/thumbs_up_grey_icon.svg";
import AnnounceWinnersIcon from "../../assets/icons/award_grey_icon.svg";
import "../styles/RewardsPhase.scss";

const RewardsPhase = () => {
  const CITATION_PREVIEW_CHARS = 95;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const hrToolName = hrToolHomePageData?.toot_title2 || "HR Repository";
  const {
    rewardsDashboardData,
    rewardsDashboardLoading,
    rewardsVotingList,
    rewardsVotedNomineeEmpUuid,
    rewardsVotingListLoading,
    allEmployees,
    getAllComponentType,
    rewardsPhaseActionLoading,
    myHrmsAccess,
  } = useSelector((state) => state.hrRepositoryReducer);

  const getNomineeEmployee = (nom) => {
    const uuid = nom.nomineeEmpUuid || nom.nominee?.empUuid;
    if (!uuid || !Array.isArray(allEmployees)) return null;
    return allEmployees.find((e) => e.employeeUuid === uuid) || null;
  };

  // When simulating: use interactionCycle for phase interactions (starting/ending phases)
  // But display the effective currentCycle (which may show previous month's data)
  const cycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
  const cycleId = cycle?.id ?? cycle?.cycleId;
  const phase = (cycle?.currentPhase || "").toLowerCase();
  const cycleStatus = (cycle?.status || "").toLowerCase();
  const isCycleCompleted = cycleStatus === "completed";
  const myNominations =
    rewardsDashboardData?.myNominationsForCurrentCycle ?? [];
  const currentCycleWinners = Array.isArray(
    rewardsDashboardData?.currentCycleWinners,
  )
    ? rewardsDashboardData.currentCycleWinners
    : [];
  const winnersAnnounced = isCycleCompleted || currentCycleWinners.length > 0;
  const monthYear = formatMonthYear(cycle?.month, cycle?.year);

  const permissions = myHrmsAccess?.permissions || [];
  const hasRewardsPermission = (name) =>
    permissions.some((p) => p.name === name || p.displayName === name);
  const toolAdminLevel = allToolsAccessDetails?.[hrToolName] ?? 0;
  const isRewardsAdmin =
    user?.userType === 900 ||
    toolAdminLevel >= 900 ||
    hasRewardsPermission("RewardsRecognition_Process_Manage") ||
    hasRewardsPermission("RewardsRecognition_Choose_Winner") ||
    hasRewardsPermission("RewardsRecognition_Admin_View");

  useEffect(() => {
    if (cycleId && (phase === PHASE_VOTING || phase === "winners")) {
      dispatch(fetchNomineesForVoting(cycleId));
    }
  }, [cycleId, phase, dispatch]);

  const votedNominee =
    rewardsVotingList?.find(
      (n) => (n.nomineeEmpUuid || n.empUuid) === rewardsVotedNomineeEmpUuid,
    ) || null;
  const otherNomineesList = (rewardsVotingList || []).filter(
    (n) => (n.nomineeEmpUuid || n.empUuid) !== rewardsVotedNomineeEmpUuid,
  );

  const [removeVoteConfirm, setRemoveVoteConfirm] = useState(false);
  const [phaseConfirm, setPhaseConfirm] = useState(null); // { action: 'startNomination' | 'endNomination' | 'endVoting' }
  const [selectedCitation, setSelectedCitation] = useState(null);

  const getCitationPreview = (citation) => {
    const normalized = String(citation || "").trim();
    if (!normalized) {
      return { preview: "—", truncated: false };
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

  const handleOpenNominate = () => {
    dispatch(setNominationModalOpen(true));
  };

  useEffect(() => {
    if (searchParams.get("action") === "nominate") {
      if (phase === PHASE_NOMINATION) {
        dispatch(setNominationModalOpen(true));
      }
  
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, phase, dispatch]);

  const handleStartNominationClick = () =>
    setPhaseConfirm({ action: "startNomination" });
  const handleEndNominationClick = () =>
    setPhaseConfirm({ action: "endNomination" });
  const handleEndVotingClick = () => setPhaseConfirm({ action: "endVoting" });

  const handlePhaseConfirm = () => {
    if (!cycleId || !phaseConfirm) return;
    if (phaseConfirm.action === "startNomination") {
      dispatch(startRewardsPhase(cycleId, PHASE_NOMINATION));
    } else if (phaseConfirm.action === "endNomination") {
      dispatch(endRewardsPhase(cycleId, PHASE_NOMINATION));
    } else if (phaseConfirm.action === "endVoting") {
      dispatch(endRewardsPhase(cycleId, PHASE_VOTING));
    }
    setPhaseConfirm(null);
  };

  const handleVoteForNominees = () => {
    navigate("/rewards-recognitions/vote");
  };

  const handleRemoveVoteConfirm = () => {
    if (!cycleId || !rewardsVotedNomineeEmpUuid) return;
    dispatch(rewardsVote(cycleId, rewardsVotedNomineeEmpUuid));
    setRemoveVoteConfirm(false);
  };

  const phaseConfirmConfig = phaseConfirm
    ? {
        startNomination: {
          heading: "Start Nomination Phase",
          message:
            "Are you sure you want to start the nomination phase? Employees will be able to submit nominations.",
        },
        endNomination: {
          heading: "End Nomination Phase",
          message:
            "Are you sure you want to end the nomination phase? No more nominations will be accepted.",
        },
        endVoting: {
          heading: "End Voting Phase",
          message:
            "Are you sure you want to end the voting phase? No more votes will be accepted.",
        },
      }[phaseConfirm.action]
    : null;

  const componentType = getAllComponentType || {};

  if (rewardsDashboardLoading && !rewardsDashboardData) {
    return (
      <div className="rewards_phase_container">
        <div className="rewards_phase_loading">Loading...</div>
      </div>
    );
  }

  if (!cycle || !cycleId) {
    return (
      <div className="rewards_phase_container">
        <NoResultsContainer
          message="No active cycle."
          showImage={false}
          border={false}
        />
      </div>
    );
  }

  // PENDING
  if (phase === PHASE_PENDING) {
    return (
      <>
        <div className="rewards_phase_container">
          <NoResultsContainer
            message="Nominations will start soon."
            subMessage="Let's start recognizing great work and help build a culture of appreciation."
            showImage={true}
            image={happy_jar_icon}
            border={false}
          />
          {isRewardsAdmin && (
            <div className="rewards_phase_action_button">
              <button
                className="start_nominations_button"
                onClick={handleStartNominationClick}
                disabled={rewardsPhaseActionLoading}
              >
                <span>Start Nomination Phase</span>
              </button>
            </div>
          )}
        </div>
        {phaseConfirm && phaseConfirmConfig && (
          <ConfirmationPopup
            isOpen
            onClose={() => setPhaseConfirm(null)}
            onConfirm={handlePhaseConfirm}
            heading={phaseConfirmConfig.heading}
            message={phaseConfirmConfig.message}
            confirmText="Yes, Continue"
            cancelText="Cancel"
          />
        )}
      </>
    );
  }

  // NOMINATION
  if (phase === PHASE_NOMINATION) {
    if (myNominations.length === 0) {
      return (
        <>
          <div className="rewards_phase_container">
            <NoResultsContainer
              message="Nominations have started!"
              subMessage={
                <>
                  <p className="rewards_phase_actions_row_title">
                    Let&apos;s start recognizing great work and help build a
                    culture of appreciation
                  </p>
                  <div className="rewards_phase_actions_row">
                    <button
                      type="button"
                      className={`${!isRewardsAdmin ? "nominate_peer_btn" : "nominate_primary_btn"}`}
                      onClick={handleOpenNominate}
                    >
                      + Nominate a Peer
                    </button>
                    {isRewardsAdmin && (
                      <button
                        type="button"
                        className="end_phase_btn"
                        onClick={handleEndNominationClick}
                        disabled={rewardsPhaseActionLoading}
                      >
                        End Nomination Phase
                      </button>
                    )}
                  </div>
                </>
              }
              showImage={true}
              image={happy_jar_icon}
              border={false}
            />
          </div>
          {phaseConfirm && phaseConfirmConfig && (
            <ConfirmationPopup
              isOpen
              onClose={() => setPhaseConfirm(null)}
              onConfirm={handlePhaseConfirm}
              heading={phaseConfirmConfig.heading}
              message={phaseConfirmConfig.message}
              confirmText="Yes, Continue"
              cancelText="Cancel"
            />
          )}
        </>
      );
    }

    return (
      <>
        <div className="rewards_phase_container">
          <div className="rewards_phase_panel">
            <div className="rewards_phase_panel_header">
              <div className="rewards_phase_panel_header_title">
                <p className="rewards_phase_panel_header_title_text">
                  Your Nominations for
                </p>
                <p className="rewards_phase_panel_header_title_month">
                  {monthYear}
                </p>
              </div>
              <div className="rewards_phase_panel_actions">
                <button
                  type="button"
                  className={`${!isRewardsAdmin ? "primary_btn" : "nominate_primary_btn"}`}
                  onClick={handleOpenNominate}
                >
                  + Nominate a Peer
                </button>
                {isRewardsAdmin && (
                  <button
                    type="button"
                    className="end_phase_btn"
                    onClick={handleEndNominationClick}
                    disabled={rewardsPhaseActionLoading}
                  >
                    End Nomination Phase
                  </button>
                )}
              </div>
            </div>
            <div className="rewards_phase_table_wrapper">
              <table className="rewards_phase_table">
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Citation</th>
                  </tr>
                </thead>
                <tbody>
                  {myNominations.map((nom) => {
                    const emp = getNomineeEmployee(nom);
                    const citation = String(nom.citation || "").trim();
                    const name = emp
                      ? `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""}`.trim()
                      : buildEmployeeName(nom.nominee);
                    const department = emp
                      ? getComponentTypeValue(
                          emp.employeeDepartment,
                          componentType,
                        ) || "—"
                      : "—";
                    const initial = (name[0] || "?").toUpperCase();
                    const citationPreview = getCitationPreview(citation);
                    return (
                      <tr key={nom.id || nom.nomineeEmpUuid}>
                        <td>
                          <div className="rewards_phase_nominee_cell">
                            <div className="rewards_phase_nominee_avatar">
                              {emp?.employeeProfileImage ? (
                                <img
                                  src={emp.employeeProfileImage}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="rewards_phase_nominee_initial">
                                  {initial}
                                </span>
                              )}
                            </div>
                            <div className="rewards_phase_nominee_info">
                              <span className="rewards_phase_nominee_name">
                                {name}
                              </span>
                              <span className="rewards_phase_nominee_dept">
                                {department}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="citation_cell">
                          <div className="citation_preview_text">
                            <span>{citationPreview.preview}</span>
                            {citationPreview.truncated && (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="citation_view_more_btn"
                                  onClick={() =>
                                    setSelectedCitation({
                                      name,
                                      department,
                                      citation,
                                    })
                                  }
                                >
                                  View more
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {phaseConfirm && phaseConfirmConfig && (
          <ConfirmationPopup
            isOpen
            onClose={() => setPhaseConfirm(null)}
            onConfirm={handlePhaseConfirm}
            heading={phaseConfirmConfig.heading}
            message={phaseConfirmConfig.message}
            confirmText="Yes, Continue"
            cancelText="Cancel"
          />
        )}
        <CitationDetailModal
          isOpen={!!selectedCitation}
          onClose={() => setSelectedCitation(null)}
          name={selectedCitation?.name}
          department={selectedCitation?.department}
          citation={selectedCitation?.citation}
          title="Citation"
        />
      </>
    );
  }

  // VOTING (or winners – still show voting UI if they voted)
  if (phase === PHASE_VOTING || phase === "winners") {
    const hasVoted = !!rewardsVotedNomineeEmpUuid;

    if (!hasVoted) {
      if (phase === "winners") {
        // Check if cycle completed without nominees
        const isCompletedWithoutWinners =
          isCycleCompleted && currentCycleWinners.length === 0;
        const subMessageText = isCompletedWithoutWinners
          ? "No winners for this cycle - there were no nominations."
          : winnersAnnounced
            ? "Winners have been announced."
            : "Winners will be announced soon.";

        return (
          <div className="rewards_phase_container">
            <NoResultsContainer
              message="Voting has ended"
              subMessage={
                <p className="rewards_phase_actions_row_title">
                  {subMessageText}
                </p>
              }
              showImage={true}
              image={hands_heart_icon}
              border={false}
            />
            {!winnersAnnounced && isRewardsAdmin && (
              <div className="rewards_phase_action_button">
                <button
                  type="button"
                  className="choose_winner_btn"
                  onClick={() => dispatch(setAnnounceWinnersModalOpen(true))}
                >
                 <img src={AnnounceWinnersIcon} alt="Announce Winners" className="announce_winners_icon" />Announce Winners
                </button>
              </div>
            )}
          </div>
        );
      }
      return (
        <>
          <div className="rewards_phase_container">
            <NoResultsContainer
              message="Voting has started!"
              subMessage={
                <>
                  <p className="rewards_phase_actions_row_title">
                    Let&apos;s start recognizing great work and help build a
                    culture of appreciation
                  </p>
                  <div className="rewards_phase_actions_row">
                    <button
                      type="button"
                      className="vote_nominees_btn"
                      onClick={handleVoteForNominees}
                    >
                      <img src={ThumbsUpIcon} alt="" className="thumbs_icon" />
                      Vote for Nominees
                    </button>
                    {isRewardsAdmin && (
                      <button
                        type="button"
                        className="end_phase_btn"
                        onClick={handleEndVotingClick}
                        disabled={rewardsPhaseActionLoading}
                      >
                        End Voting Phase
                      </button>
                    )}
                  </div>
                </>
              }
              showImage={true}
              image={hands_heart_icon}
              border={false}
            />
          </div>
          {phaseConfirm && phaseConfirmConfig && (
            <ConfirmationPopup
              isOpen
              onClose={() => setPhaseConfirm(null)}
              onConfirm={handlePhaseConfirm}
              heading={phaseConfirmConfig.heading}
              message={phaseConfirmConfig.message}
              confirmText="Yes, Continue"
              cancelText="Cancel"
            />
          )}
        </>
      );
    }

    if (rewardsVotingListLoading && rewardsVotingList.length === 0) {
      return (
        <div className="rewards_phase_container">
          <div className="rewards_phase_loading">Loading...</div>
        </div>
      );
    }

    const votedEmp = getNomineeEmployee(votedNominee);
    const nomineeName = votedEmp
      ? `${votedEmp.employeeFirstName || ""} ${votedEmp.employeeLastName || ""}`.trim()
      : votedNominee?.nominee
        ? buildEmployeeName(votedNominee.nominee)
        : votedNominee?.empFirstName && votedNominee?.empLastName
          ? `${votedNominee.empFirstName} ${votedNominee.empLastName}`
          : "Nominee";
    const votedDept = votedEmp
      ? getComponentTypeValue(votedEmp.employeeDepartment, componentType)
      : votedNominee?.department != null
        ? getComponentTypeValue(votedNominee.department, componentType)
        : null;
    const votedInitial = (nomineeName[0] || "?").toUpperCase();
    const hasVotedCitation =
      votedNominee?.hasGroupCitation &&
      (votedNominee?.citationDisplay || "").trim().length > 0;
    const votedCitationText = hasVotedCitation
      ? (votedNominee.citationDisplay || "").trim()
      : "—";
    const votedCitationPreview = getCitationPreview(votedCitationText);

    return (
      <div className="rewards_phase_container">
        <div className="rewards_phase_voted_section">
          <div className="rewards_phase_voted_header">
            <h3>Vote for Nominees</h3>
            <div className="rewards_phase_voted_header_actions">
              {isRewardsAdmin && phase === PHASE_VOTING && (
                <button
                  type="button"
                  className="end_phase_btn"
                  onClick={handleEndVotingClick}
                  disabled={rewardsPhaseActionLoading}
                >
                  End Voting Phase
                </button>
              )}
              {phase === "winners" &&
              winnersAnnounced ? null : isRewardsAdmin &&
                phase === "winners" ? (
                <button
                  type="button"
                  className="choose_winner_btn choose_winner_btn_header"
                  onClick={() => dispatch(setAnnounceWinnersModalOpen(true))}
                >
                  <img src={AnnounceWinnersIcon} alt="Announce Winners" className="announce_winners_icon" />Announce Winners
                </button>
              ) : phase === PHASE_VOTING ? (
                <button
                  type="button"
                  className="vote_nominees_btn"
                  onClick={handleVoteForNominees}
                >
                  <img src={ThumbsUpIcon} alt="" className="thumbs_icon" />
                  Vote for Nominees
                </button>
              ) : null}
            </div>
          </div>
          <div className="rewards_phase_voted_card">
            <div className="voted_card_header_row">
              <div className="voted_card_avatar_wrapper">
                <div className="voted_card_avatar">
                  {votedEmp?.employeeProfileImage ? (
                    <img
                      src={votedEmp.employeeProfileImage}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="voted_card_initial">{votedInitial}</span>
                  )}
                </div>
                <div className="voted_card_name_dept">
                  <span className="voted_card_name">{nomineeName}</span>
                  {votedDept && (
                    <span className="voted_card_dept">{votedDept}</span>
                  )}
                </div>
              </div>
              {phase === PHASE_VOTING && (
                <button
                  type="button"
                  className="remove_vote_btn remove_vote_btn_in_card"
                  onClick={() => setRemoveVoteConfirm(true)}
                >
                  Remove Vote
                </button>
              )}
            </div>
            <div className="voted_card_citation_box">
              {votedCitationText === "—" ? (
                "—"
              ) : (
                <div className="voted_card_citation_text">
                  <span>&ldquo;{votedCitationPreview.preview}&rdquo;</span>
                  {votedCitationPreview.truncated && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="voted_card_view_more_btn"
                        onClick={() =>
                          setSelectedCitation({
                            name: nomineeName,
                            department: votedDept,
                            citation: votedCitationText,
                          })
                        }
                      >
                        View more
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {otherNomineesList.length > 0 && (
          <div className="rewards_phase_other_nominees">
            <h3>Other Nominees</h3>
            <div className="rewards_phase_table_wrapper">
              <table className="rewards_phase_table">
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Citation</th>
                  </tr>
                </thead>
                <tbody>
                  {otherNomineesList.slice(0, 3).map((n) => {
                    const emp = getNomineeEmployee(n);
                    const name = emp
                      ? `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""}`.trim()
                      : buildEmployeeName(n.nominee) ||
                        (n.empFirstName && n.empLastName
                          ? `${n.empFirstName} ${n.empLastName}`
                          : "—");
                    const dept = emp
                      ? getComponentTypeValue(
                          emp.employeeDepartment,
                          componentType,
                        ) || "—"
                      : getComponentTypeValue(n.department, componentType) ||
                        "—";
                    const initial = (name[0] || "?").toUpperCase();
                    const hasCitation =
                      n.hasGroupCitation &&
                      (n.citationDisplay || "").trim().length > 0;
                    const citationText = hasCitation
                      ? (n.citationDisplay || "").trim()
                      : "—";
                    const citationPreview = getCitationPreview(citationText);
                    return (
                      <tr key={n.nomineeEmpUuid || n.empUuid}>
                        <td>
                          <div className="rewards_phase_nominee_cell">
                            <div className="rewards_phase_nominee_avatar">
                              {emp?.employeeProfileImage ? (
                                <img
                                  src={emp.employeeProfileImage}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="rewards_phase_nominee_initial">
                                  {initial}
                                </span>
                              )}
                            </div>
                            <div className="rewards_phase_nominee_info">
                              <span className="rewards_phase_nominee_name">
                                {name}
                              </span>
                              <span className="rewards_phase_nominee_dept">
                                {dept}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="citation_cell">
                          {citationText === "—" ? (
                            "—"
                          ) : (
                            <div className="citation_preview_text">
                              <span>{citationPreview.preview}</span>
                              {citationPreview.truncated && (
                                <>
                                  {" "}
                                  <button
                                    type="button"
                                    className="citation_view_more_btn"
                                    onClick={() =>
                                      setSelectedCitation({
                                        name,
                                        department: dept,
                                        citation: citationText,
                                      })
                                    }
                                  >
                                    View more
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="view_all_nominees_btn"
              onClick={handleVoteForNominees}
            >
              View all nominees
            </button>
          </div>
        )}

        {otherNomineesList.length === 0 && phase === PHASE_VOTING && (
          <div className="rewards_phase_vote_cta">
            <button
              type="button"
              className="view_all_nominees_btn"
              onClick={handleVoteForNominees}
            >
              View All Nominees
            </button>
          </div>
        )}

        <ConfirmationPopup
          isOpen={removeVoteConfirm}
          onClose={() => setRemoveVoteConfirm(false)}
          onConfirm={handleRemoveVoteConfirm}
          heading="Remove vote"
          message="Are you sure you want to remove your vote?"
          confirmText="Yes, Remove"
          cancelText="Cancel"
        />
        <CitationDetailModal
          isOpen={!!selectedCitation}
          onClose={() => setSelectedCitation(null)}
          name={selectedCitation?.name}
          department={selectedCitation?.department}
          citation={selectedCitation?.citation}
          title="Citation"
        />
        {phaseConfirm && phaseConfirmConfig && (
          <ConfirmationPopup
            isOpen
            onClose={() => setPhaseConfirm(null)}
            onConfirm={handlePhaseConfirm}
            heading={phaseConfirmConfig.heading}
            message={phaseConfirmConfig.message}
            confirmText="Yes, Continue"
            cancelText="Cancel"
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rewards_phase_container">
        <NoResultsContainer
          message="No content for this phase."
          showImage={false}
          border={false}
        />
      </div>
      {phaseConfirm && phaseConfirmConfig && (
        <ConfirmationPopup
          isOpen
          onClose={() => setPhaseConfirm(null)}
          onConfirm={handlePhaseConfirm}
          heading={phaseConfirmConfig.heading}
          message={phaseConfirmConfig.message}
          confirmText="Yes, Continue"
          cancelText="Cancel"
        />
      )}
    </>
  );
};

export default RewardsPhase;
