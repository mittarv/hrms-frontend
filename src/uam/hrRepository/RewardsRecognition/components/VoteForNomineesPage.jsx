import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getComponentTypeValue } from "../../Common/utils/helper";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import CitationDetailModal from "./CitationDetailModal";
import {
  fetchRewardsDashboard,
  fetchNomineesForVoting,
  rewardsVote,
  getAllEmployee,
  getAllComponentTypes,
} from "../../../../actions/hrRepositoryAction";
import { hrToolHomePageData } from "../../constant/data";
import { buildEmployeeName } from "../rewardsUtils";
import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import divider from "../../assets/icons/divider_icon.svg";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import Snackbar from "../../Common/components/Snackbar";
import backGreyIcon from "../../assets/icons/back_grey_icon.svg";
import "../styles/VoteForNomineesPage.scss";

const VoteForNomineesPage = () => {
  const CITATION_PREVIEW_CHARS = 95;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [voteConfirm, setVoteConfirm] = useState(null);
  const [removeVoteConfirm, setRemoveVoteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCitation, setSelectedCitation] = useState(null);

  const {
    rewardsDashboardData,
    rewardsVotingList,
    rewardsVotedNomineeEmpUuid,
    rewardsVotingListLoading,
    getAllComponentType,
    allEmployees,
  } = useSelector((state) => state.hrRepositoryReducer);

  const cycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
  const cycleId = cycle?.id ?? cycle?.cycleId;
  const phase = (cycle?.currentPhase || "").toLowerCase();
  const winnersAnnounced = Boolean(cycle?.winnersAnnouncedDate);
  const canFetchVotingNominees =
    phase === "voting" || (phase === "winners" && !winnersAnnounced);

  const getNomineeEmployee = (row) => {
    const uuid = row.nomineeEmpUuid || row.empUuid || row.nominee?.empUuid;
    if (!uuid || !Array.isArray(allEmployees)) return null;
    return allEmployees.find((e) => e.employeeUuid === uuid) || null;
  };

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData?.toot_title2 || "HR Repository",
    });
  }, [dispatch]);

  useEffect(() => {
    if (!Array.isArray(allEmployees) || allEmployees.length === 0) {
      dispatch(getAllEmployee());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (
      !getAllComponentType ||
      typeof getAllComponentType !== "object" ||
      Object.keys(getAllComponentType).length === 0
    ) {
      dispatch(getAllComponentTypes());
    }
  }, [dispatch, getAllComponentType]);

  useEffect(() => {
    if (!cycleId) {
      dispatch(fetchRewardsDashboard());
    }
  }, [cycleId, dispatch]);

  useEffect(() => {
    if (cycleId && canFetchVotingNominees) {
      dispatch(fetchNomineesForVoting(cycleId));
    }
  }, [cycleId, canFetchVotingNominees, dispatch]);

  const handleVote = (nomineeEmpUuid) => {
    setVoteConfirm({ nomineeEmpUuid });
  };

  const handleRemoveVote = () => {
    if (rewardsVotedNomineeEmpUuid) {
      setRemoveVoteConfirm(true);
    }
  };

  const onConfirmVote = () => {
    if (!voteConfirm || !cycleId) return;
    dispatch(rewardsVote(cycleId, voteConfirm.nomineeEmpUuid));
    setVoteConfirm(null);
  };

  const onConfirmRemoveVote = () => {
    if (!cycleId || !rewardsVotedNomineeEmpUuid) return;
    dispatch(rewardsVote(cycleId, rewardsVotedNomineeEmpUuid));
    setRemoveVoteConfirm(false);
  };

  const componentType = getAllComponentType || {};

  const filteredList = useMemo(() => {
    const list = rewardsVotingList || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const emp = getNomineeEmployee(row);
      const name = emp
        ? `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""}`.trim()
        : buildEmployeeName(row.nominee) ||
          (row.empFirstName && row.empLastName
            ? `${row.empFirstName} ${row.empLastName}`
            : "");
      const department = emp
        ? getComponentTypeValue(emp.employeeDepartment, componentType) || ""
        : getComponentTypeValue(row.department, componentType) || "";
      const nominatedBy = Array.isArray(row.nominatedBy)
        ? row.nominatedBy.join(" ")
        : row.nominatedBy
          ? buildEmployeeName(row.nominatedBy)
          : row.nominatedByNames || "";
      const citationForSearch = (
        row.citationDisplay ||
        row.groupedCitation ||
        row.citation ||
        ""
      ).trim();
      const searchable = [name, department, nominatedBy, citationForSearch]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, rewardsVotingList, allEmployees, componentType]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/rewards-recognitions");
    }
  };

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

  return (
    <div className="vote_for_nominees_page">
      <div className="vote_page_header">
        <button type="button" className="back_btn" onClick={handleBack}>
          <img src={backGreyIcon} alt="back" /> 
        </button>
        <h1>Vote for Nominees</h1>
      </div>

      {rewardsVotingListLoading && rewardsVotingList.length === 0 ? (
        <div className="vote_page_loading">Loading nominees...</div>
      ) : !cycleId ? (
        <div className="vote_page_empty">No active cycle.</div>
      ) : (
        <div className="vote_page_content">
          <div className="vote_page_search_header">
            <div className="search-bar-collapsed">
              <div className="search-input-group">
                <img
                  src={searchIcon}
                  alt="search"
                  className="employee-search-icon"
                  referrerPolicy="no-referrer"
                />
                <img src={divider} alt="" referrerPolicy="no-referrer" />
                <input
                  type="text"
                  placeholder="Search nominees"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="employee-search-input"
                />
              </div>
            </div>
            <p className="vote_page_nominees_count">
              Nominees ({filteredList.length})
            </p>
          </div>
          <div className="vote_page_table_wrapper">
            {filteredList.length > 0 ? (
              <table className="vote_page_table">
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Nominated By</th>
                    <th>Citation(s)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((row) => {
                    const nomineeUuid = row.nomineeEmpUuid || row.empUuid;
                    const isVoted = nomineeUuid === rewardsVotedNomineeEmpUuid;
                    const emp = getNomineeEmployee(row);
                    const name = emp
                      ? `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""}`.trim()
                      : buildEmployeeName(row.nominee) ||
                        (row.empFirstName && row.empLastName
                          ? `${row.empFirstName} ${row.empLastName}`
                          : "—");
                    const department = emp
                      ? getComponentTypeValue(
                          emp.employeeDepartment,
                          componentType,
                        ) || "—"
                      : getComponentTypeValue(row.department, componentType) ||
                        "—";
                    const initial = (name[0] || "?").toUpperCase();
                    const citationText = (
                      row.citationDisplay ||
                      row.groupedCitation ||
                      row.citation ||
                      ""
                    ).trim();
                    const hasCitation = citationText.length > 0;
                    const citationPreview = getCitationPreview(citationText);
                    const nominatedBy = Array.isArray(row.nominatedBy)
                      ? row.nominatedBy.join(", ")
                      : row.nominatedBy
                        ? buildEmployeeName(row.nominatedBy)
                        : row.nominatedByNames || "—";

                    return (
                      <tr key={nomineeUuid}>
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
                              <div className="rewards_phase_nominee_name_row">
                                <span className="rewards_phase_nominee_name">
                                  {name}
                                </span>
                                {isVoted && (
                                  <span className="voted_pill">Voted</span>
                                )}
                              </div>
                              <span className="rewards_phase_nominee_dept">
                                {department}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{nominatedBy}</td>
                        <td className="citation_cell">
                          {!hasCitation ? (
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
                                        department,
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
                        <td>
                          {isVoted ? (
                            <button
                              type="button"
                              className="remove_vote_btn"
                              onClick={handleRemoveVote}
                            >
                              Remove Vote
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="vote_btn"
                              disabled={!!rewardsVotedNomineeEmpUuid}
                              onClick={() => handleVote(nomineeUuid)}
                            >
                              Vote
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (rewardsVotingList || []).length === 0 ? (
              <NoResultsContainer
                message="Nominees will show once voting starts."
                subMessage="No nominees are available for this cycle yet."
              />
            ) : (
              <NoResultsContainer
                message="We couldn't find anyone matching your search."
                subMessage="Try searching with a different name or department."
              />
            )}
          </div>
        </div>
      )}

      <ConfirmationPopup
        isOpen={!!voteConfirm}
        onClose={() => setVoteConfirm(null)}
        onConfirm={onConfirmVote}
        heading="Confirm vote"
        message="Are you sure you want to cast your vote for this nominee?"
        confirmText="Yes, Vote"
        cancelText="Cancel"
      />
      <ConfirmationPopup
        isOpen={removeVoteConfirm}
        onClose={() => setRemoveVoteConfirm(false)}
        onConfirm={onConfirmRemoveVote}
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
      <Snackbar />
    </div>
  );
};

export default VoteForNomineesPage;
