import PropTypes from "prop-types";
import EmployeeChoiceWhiteIcon from "../../assets/icons/rewards_icon.svg";
import LeadershipChoiceWhiteIcon from "../../assets/icons/award_icon.svg";
import "../dashboard.scss";

const AWARD_EMPLOYEE_CHOICE = "employee_choice";
const AWARD_LEADERSHIP_CHOICE = "leadership_choice";

const formatMonthYear = (month, year) => {
  if (!month || !year) return "";
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/**
 * WinnerBanner - Displays a banner on the dashboard if the current user is a winner
 * Props:
 *   currentWinnerStatus: { month, year, awards: [{ awardType, finalCitation, voteCount }] }
 */
const WinnerBanner = ({ currentWinnerStatus }) => {
  if (!currentWinnerStatus || !currentWinnerStatus.awards || currentWinnerStatus.awards.length === 0) {
    return null;
  }

  const { month, year, awards } = currentWinnerStatus;
  const monthYear = formatMonthYear(month, year);

  const hasEmployeeChoice = awards.some((a) => a.awardType === AWARD_EMPLOYEE_CHOICE);
  const hasLeadershipChoice = awards.some((a) => a.awardType === AWARD_LEADERSHIP_CHOICE);
  const isDoubleWinner = hasEmployeeChoice && hasLeadershipChoice;

  // Determine banner type and styling
  let bannerTitle = "";
  let bannerClass = "";
  let icon = EmployeeChoiceWhiteIcon;

  if (isDoubleWinner) {
    bannerTitle = `Double Reward Winner - ${monthYear}`;
    bannerClass = "winner_banner--double";
    icon = EmployeeChoiceWhiteIcon; // Use employee choice icon for double
  } else if (hasEmployeeChoice) {
    bannerTitle = `Employee's Choice Winner - ${monthYear}`;
    bannerClass = "winner_banner--employee";
    icon = EmployeeChoiceWhiteIcon;
  } else if (hasLeadershipChoice) {
    bannerTitle = `Leadership Choice Winner - ${monthYear}`;
    bannerClass = "winner_banner--leadership";
    icon = LeadershipChoiceWhiteIcon;
  }

  // Get the citation to display (prefer the first available)
  const citation = awards[0]?.finalCitation || "";

  return (
    <div className={`winner_banner ${bannerClass}`}>
      <div className="winner_banner_header">
        <span className="winner_banner_header_icon">
          <img src={icon} alt="" />
        </span>
        <span className="winner_banner_header_text">{bannerTitle}</span>
      </div>
      {citation && (
        <div className="winner_banner_citation_box">
          <p>&ldquo;{citation}&rdquo;</p>
        </div>
      )}
    </div>
  );
};

WinnerBanner.propTypes = {
  currentWinnerStatus: PropTypes.shape({
    month: PropTypes.number,
    year: PropTypes.number,
    awards: PropTypes.arrayOf(
      PropTypes.shape({
        awardType: PropTypes.string,
        finalCitation: PropTypes.string,
        voteCount: PropTypes.number,
      })
    ),
  }),
};

export default WinnerBanner;
