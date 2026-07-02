import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRewardsDashboard,
  fetchReviewNominees,
  setManageCitationsModalOpen,
  clearGroupedCitationRewards,
} from "../../../../actions/hrRepositoryAction";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import { getComponentTypeValue } from "../../Common/utils/helper";
import CitationDetailModal from "./CitationDetailModal";
import { buildEmployeeName } from "../rewardsUtils";
import { formatMonthYear } from "../rewardsUtils";
import searchIcon from "../../assets/icons/Search_icon_grey.svg";
import divider from "../../assets/icons/divider_icon.svg";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import "../styles/ReviewNominations.scss";

const buildNomineeRole = (row, componentType) => {
  const parts = [];
  if (row?.department != null && componentType) {
    const dept = getComponentTypeValue(row.department, componentType);
    if (dept) parts.push(dept);
  }
  if (row?.jobTitle) parts.push(row.jobTitle);
  return parts.join(" | ") || "";
};

const ReviewNominations = () => {
  const CITATION_PREVIEW_CHARS = 95;

  const dispatch = useDispatch();
  const [removeCitationRow, setRemoveCitationRow] = useState(null);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    rewardsDashboardData,
    rewardsReviewNominees,
    rewardsReviewNomineesLoading,
    getAllComponentType,
    allEmployees,
  } = useSelector((state) => state.hrRepositoryReducer);
  const componentType = useMemo(
    () => getAllComponentType || {},
    [getAllComponentType],
  );

  const getNomineeEmployee = useCallback(
    (row) => {
      const uuid = row.nomineeEmpUuid || row.nominee?.empUuid;
      if (!uuid || !Array.isArray(allEmployees)) return null;
      return allEmployees.find((e) => e.employeeUuid === uuid) || null;
    },
    [allEmployees],
  );

  const cycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
  const cycleId = cycle?.id ?? cycle?.cycleId;
  const monthYear = formatMonthYear(cycle?.month, cycle?.year);

  const filteredNominees = useMemo(() => {
    const list = rewardsReviewNominees || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const emp = getNomineeEmployee(row);
      const name = emp
        ? `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""}`.trim()
        : buildEmployeeName(row.nominee) || "";
      const department = emp
        ? getComponentTypeValue(emp.employeeDepartment, componentType) || ""
        : "";
      const nominatedBy = Array.isArray(row.nominatedBy)
        ? row.nominatedBy.join(" ")
        : "";
      const citation = (row.citationDisplay || "").trim();
      const searchable = [name, department, nominatedBy, citation]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [searchQuery, rewardsReviewNominees, componentType, getNomineeEmployee]);

  useEffect(() => {
    if (!cycleId) {
      dispatch(fetchRewardsDashboard());
    }
  }, [cycleId, dispatch]);

  useEffect(() => {
    if (cycleId) dispatch(fetchReviewNominees(cycleId));
  }, [cycleId, dispatch]);

  const handleManageCitations = (row) => {
    const nomineeName = buildEmployeeName(row.nominee) || "—";
    const nomineeRole = buildNomineeRole(row, componentType);
    dispatch(
      setManageCitationsModalOpen({
        isOpen: true,
        data: {
          cycleId,
          nomineeEmpUuid: row.nomineeEmpUuid,
          nomineeName,
          nomineeRole,
        },
      }),
    );
  };

  const handleRemoveCitationClick = (row) => {
    setRemoveCitationRow(row);
  };

  const handleConfirmRemoveCitation = () => {
    if (removeCitationRow && cycleId) {
      dispatch(
        clearGroupedCitationRewards(cycleId, removeCitationRow.nomineeEmpUuid),
      );
      setRemoveCitationRow(null);
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

  if (!cycleId) {
    return (
      <div className="review_nominations_container">
        <p className="review_nominations_empty">No active cycle.</p>
      </div>
    );
  }

  return (
    <div className="review_nominations_container">
      <div className="review_nominations_header">
        <h2>Review Nominations for {monthYear}</h2>
      </div>

      {rewardsReviewNomineesLoading ? (
        <p className="review_nominations_loading">Loading...</p>
      ) : !rewardsReviewNominees?.length ? (
        <p className="review_nominations_empty">No nominees to review yet.</p>
      ) : (
        <>
          <div className="review_nominations_search_header">
            <div className="search-bar-collapsed">
              <div className="search-input-group">
                <img
                  src={searchIcon}
                  alt="search"
                  className="employee-search-icon"
                />
                <img src={divider} alt="" />
                <input
                  type="text"
                  placeholder="Search nominees"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="employee-search-input"
                />
              </div>
            </div>
            <p className="review_nominations_count">
              Nominees ({filteredNominees.length})
            </p>
          </div>
          <div className="review_nominations_table_wrapper">
            {filteredNominees.length > 0 ? (
              <table className="review_nominations_table">
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Nominated By</th>
                    <th>Group Citation(s)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNominees.map((row) => {
                    const emp = getNomineeEmployee(row);
                    const name = emp
                      ? `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""}`.trim()
                      : buildEmployeeName(row.nominee) || "—";
                    const department = emp
                      ? getComponentTypeValue(
                          emp.employeeDepartment,
                          componentType,
                        ) || "—"
                      : "—";
                    const initial = (name[0] || "?").toUpperCase();
                    const nominatedBy = Array.isArray(row.nominatedBy)
                      ? row.nominatedBy.join(", ")
                      : "—";
                    const citationDisplay = (row.citationDisplay || "").trim();
                    const hasGroupCitation =
                      row.hasGroupCitation && citationDisplay.length > 0;
                    const citationPreview = getCitationPreview(citationDisplay);
                    return (
                      <tr key={row.nomineeEmpUuid}>
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
                        <td>{nominatedBy}</td>
                        <td className="citation_cell">
                          {hasGroupCitation ? (
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
                                        citation: citationDisplay,
                                      })
                                    }
                                  >
                                    View more
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {hasGroupCitation ? (
                            <button
                              type="button"
                              className="remove_citation_btn"
                              onClick={() => handleRemoveCitationClick(row)}
                            >
                              Remove Citation
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="manage_citations_btn"
                              onClick={() => handleManageCitations(row)}
                            >
                              Manage Citations
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <NoResultsContainer
                message="We couldn't find anyone matching your search."
                subMessage="Try searching with a different name or department."
              />
            )}
          </div>
        </>
      )}
      <CitationDetailModal
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
        name={selectedCitation?.name}
        department={selectedCitation?.department}
        citation={selectedCitation?.citation}
        nominators={selectedCitation?.nominators}
        title="Citation"
      />
      {removeCitationRow && (
        <ConfirmationPopup
          isOpen
          onClose={() => setRemoveCitationRow(null)}
          onConfirm={handleConfirmRemoveCitation}
          heading="Remove Group Citation"
          message={`Remove the group citation for ${buildEmployeeName(removeCitationRow.nominee) || "this nominee"}? The nominee will have no group citation until you add one via Manage Citations.`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default ReviewNominations;
