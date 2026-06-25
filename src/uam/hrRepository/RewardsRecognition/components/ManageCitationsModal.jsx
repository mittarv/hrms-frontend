import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNomineeCitations,
  upsertGroupedCitationRewards,
  removeRewardsNomination,
  setManageCitationsModalOpen,
} from "../../../../actions/hrRepositoryAction";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import { MIN_CITATION_WORDS } from "../rewardsConstants";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import "../styles/ManageCitationsModal.scss";

const buildNominatorName = (nominatedBy) => {
  if (!nominatedBy) return "—";
  const first = nominatedBy.empFirstName || "";
  const last = nominatedBy.empLastName || "";
  return `${first} ${last}`.trim() || "—";
};

const ManageCitationsModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [groupedCitation, setGroupedCitation] = useState("");
  const [removeConfirm, setRemoveConfirm] = useState(null);

  const {
    manageCitationsModalOpen,
    manageCitationsModalData,
    rewardsNomineeCitations,
    rewardsNomineeCitationsLoading,
  } = useSelector((state) => state.hrRepositoryReducer);

  const cycleId = manageCitationsModalData?.cycleId;
  const nomineeEmpUuid = manageCitationsModalData?.nomineeEmpUuid;
  const nomineeName = manageCitationsModalData?.nomineeName || "Nominee";
  const nomineeRole = manageCitationsModalData?.nomineeRole || "";

  useEffect(() => {
    if (manageCitationsModalOpen && cycleId && nomineeEmpUuid) {
      dispatch(fetchNomineeCitations(cycleId, nomineeEmpUuid));
    }
  }, [manageCitationsModalOpen, cycleId, nomineeEmpUuid, dispatch]);

  useEffect(() => {
    if (manageCitationsModalOpen) {
      setGroupedCitation("");
    }
  }, [manageCitationsModalOpen]);

  const citations = useMemo(
    () =>
      Array.isArray(rewardsNomineeCitations?.citations)
        ? rewardsNomineeCitations.citations
        : Array.isArray(rewardsNomineeCitations)
          ? rewardsNomineeCitations
          : [],
    [rewardsNomineeCitations],
  );
  const wordCount = (groupedCitation || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  useEffect(() => {
    if (
      !rewardsNomineeCitationsLoading &&
      rewardsNomineeCitations?._forNomineeEmpUuid === nomineeEmpUuid &&
      rewardsNomineeCitations?.groupedCitation != null
    ) {
      setGroupedCitation(rewardsNomineeCitations.groupedCitation ?? "");
    }
  }, [
    rewardsNomineeCitationsLoading,
    rewardsNomineeCitations?._forNomineeEmpUuid,
    rewardsNomineeCitations?.groupedCitation,
    nomineeEmpUuid,
  ]);

  const handleSave = () => {
    if (!cycleId || !nomineeEmpUuid) return;
    dispatch(
      upsertGroupedCitationRewards(
        cycleId,
        nomineeEmpUuid,
        groupedCitation.trim(),
      ),
    );
  };

  const handleRemoveClick = (citationItem) => {
    const nominatorName = buildNominatorName(citationItem?.nominatedBy);
    setRemoveConfirm({
      nominationId: citationItem?.id,
      nominatorName,
    });
  };

  const handleRemoveConfirm = async () => {
    if (!removeConfirm || !cycleId) return;
    const done = await dispatch(
      removeRewardsNomination(removeConfirm.nominationId, cycleId),
    );
    if (done) {
      dispatch(fetchNomineeCitations(cycleId, nomineeEmpUuid));
      setRemoveConfirm(null);
    }
  };

  const handleClose = () => {
    dispatch(setManageCitationsModalOpen({ isOpen: false, data: null }));
    onClose();
  };

  const handleCopyCitations = useCallback(() => {
    const text = citations
      .map((c) => (c.citation || "").trim())
      .filter(Boolean)
      .join("\n\n");
    if (text) {
      navigator.clipboard.writeText(text);
    }
  }, [citations]);

  if (!manageCitationsModalOpen) return null;

  return (
    <div className="manage_citations_modal_overlay" onClick={handleClose}>
      <div
        className="manage_citations_modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="manage_citations_modal_header">
          <div className="manage_citations_modal_title_block">
            <h2 className="manage_citations_modal_employee_name">
              {nomineeName}
            </h2>
            {nomineeRole && (
              <p className="manage_citations_modal_employee_role">
                {nomineeRole}
              </p>
            )}
          </div>
          <button
            type="button"
            className="close_btn_icon"
            onClick={handleClose}
          >
            <img src={Cross_icon} alt="close" />
          </button>
        </div>
        <hr className="manage_citations_modal_hr" />

        <div className="manage_citations_modal_content">
          {rewardsNomineeCitationsLoading ? (
            <p className="loading_text">Loading citations...</p>
          ) : (
            <>
              {citations.length > 0 && (
                <div className="citations_list_section">
                  <div className="citations_list_header">
                    <h3>All Citations ({citations.length})</h3>
                    <button
                      type="button"
                      className="copy_citations_btn"
                      onClick={handleCopyCitations}
                    >
                      Copy Citations
                    </button>
                  </div>
                  <ul className="citations_list">
                    {citations.map((nom) => (
                      <li key={nom.id} className="citation_item">
                        <blockquote className="citation_text">
                          &ldquo;{nom.citation}&rdquo;
                        </blockquote>
                        <div className="citation_meta">
                          <span className="citation_author">
                            - {buildNominatorName(nom.nominatedBy)}
                          </span>
                          <button
                            type="button"
                            className="remove_citation_link"
                            onClick={() => handleRemoveClick(nom)}
                          >
                            Remove Citation
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="form_group group_citations_section">
                <label>Group Citations</label>
                <textarea
                  value={groupedCitation}
                  onChange={(e) => setGroupedCitation(e.target.value)}
                  rows={5}
                  placeholder="Combine or edit citations for this nominee (min 25 words)..."
                />
                <div className="textarea_footer">
                  <span
                    className={`word_count_hint ${wordCount >= MIN_CITATION_WORDS ? "sufficient" : "insufficient"}`}
                  >
                    <span className="hint_icon">ℹ</span>
                    Minimum {MIN_CITATION_WORDS} Words
                  </span>
                  <span
                    className={`word_count ${wordCount < MIN_CITATION_WORDS ? "insufficient" : "sufficient"}`}
                  >
                    {wordCount} / {MIN_CITATION_WORDS} words
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="manage_citations_modal_footer">
          <button type="button" className="cancel_btn" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="save_btn"
            onClick={handleSave}
            disabled={wordCount < MIN_CITATION_WORDS}
          >
            Save Citation
          </button>
        </div>
      </div>

      <ConfirmationPopup
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={handleRemoveConfirm}
        heading="Remove Citation"
        message={
          removeConfirm?.nominatorName != null ? (
            <>
              Do you want to remove the citation from <strong>{removeConfirm.nominatorName}</strong> for <strong>{nomineeName}</strong>?
            </>
          ) : (
            "Are you sure you want to remove this citation?"
          )
        }
        confirmText="Yes, Remove"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ManageCitationsModal;
