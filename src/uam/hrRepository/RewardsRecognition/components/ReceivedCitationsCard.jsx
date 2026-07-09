import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatMonthYear } from "../rewardsUtils";
import NoResultsContainer from "../../Common/components/NoResultsContainer";
import CitationDetailModal from "./CitationDetailModal";
import ReceivedCitationsModal from "./ReceivedCitationsModal";
import "../styles/ReceivedCitationsCard.scss";

const MAX_VISIBLE = 3;
const CITATION_PREVIEW_CHARS = 95;

const ReceivedCitationsCard = ({ cycleId, month, year }) => {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const { rewardsDashboardData } = useSelector(
    (state) => state.hrRepositoryReducer,
  );

  const currentCycleWinners = Array.isArray(rewardsDashboardData?.currentCycleWinners)
    ? rewardsDashboardData.currentCycleWinners
    : [];

  const monthYear = formatMonthYear(month, year);
  
  const list = currentCycleWinners
    .filter(w => w.finalCitation)
    .map(w => ({
      citation: w.finalCitation,
      nominatedBy: w.employee ? `${w.employee.empFirstName || ""} ${w.employee.empLastName || ""}`.trim() : "Winner",
      awardType: w.awardType
    }));
  const visible = list.slice(0, MAX_VISIBLE);
  const hasMore = list.length > MAX_VISIBLE;



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
    <div className="received_citations_card">
      <div className="received_citations_card_header">
        <div className="received_citations_card_header_left">
          <span className="received_citations_card_title">
            Received Citation(s)
          </span>
          <span className="received_citations_card_month_year">
            {monthYear || "—"}
          </span>
        </div>
        {list.length > MAX_VISIBLE && (
          <button
            type="button"
            className="received_citations_view_all_btn"
            onClick={() => setModalOpen(true)}
          >
            View All
          </button>
        )}
      </div>

      <div className="received_citations_card_content">
        {list.length === 0 ? (
          <NoResultsContainer
            message="No citations found for this month's winners."
            showImage={false}
            border={false}
          />
        ) : (
          <>
            <ul className="received_citations_list">
              {visible.map((item, index) => {
                const citationText = String(item.citation || "").trim();
                const preview = getCitationPreview(citationText);

                return (
                  <li key={index} className="received_citations_item">
                    <p className="received_citations_quote">
                      <span>{preview.preview}</span>
                      {preview.truncated && (
                        <>
                          {" "}
                          <button
                            type="button"
                            className="received_citations_view_more_btn"
                            onClick={() =>
                              setSelectedCitation({
                                citation: citationText,
                                nominatedBy: item.nominatedBy || "",
                              })
                            }
                          >
                            View more
                          </button>
                        </>
                      )}
                    </p>
                    <span className="received_citations_author">
                      - Citation for {item.nominatedBy || "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
            {hasMore && (
              <button
                type="button"
                className="received_citations_view_all_link"
                onClick={() => setModalOpen(true)}
              >
                View All
              </button>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <ReceivedCitationsModal
          citations={list}
          monthYear={monthYear}
          onClose={() => setModalOpen(false)}
        />
      )}

      <CitationDetailModal
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
        name="Received Citation"
        department={monthYear}
        citation={selectedCitation?.citation}
        nominators={selectedCitation?.nominatedBy}
        title="Citation"
      />
    </div>
  );
};

export default ReceivedCitationsCard;
