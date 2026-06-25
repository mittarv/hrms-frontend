import { useState } from "react";
import "../styles/LearnMore.scss";
import multiple_user_transparent_icon from "../../assets/icons/multiple_user_transparent_icon.svg";
import section_icon_transparent_icon from "../../assets/icons/section_icon_transparent_icon.svg";
import thumbs_up_transparent_icon from "../../assets/icons/thumbs_up_transparent_icon.svg";
import award_transparent_icon from "../../assets/icons/award_transparent_icon.svg";
import coupon_percent_color_icon from "../../assets/icons/coupon_percent_color_icon.svg";
import victory_color_icon from "../../assets/icons/victory_color_icon.svg";
import cross_icon from "../../assets/icons/cross_icon.svg";

const LearnMore = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isOpen = isHovered || isPinned;

  const closeModal = () => {
    setIsPinned(false);
    setIsHovered(false);
  };

  return (
    <div className="learn_more_wrapper">
      {isPinned && (
        <div className="learn_more_backdrop" aria-hidden onClick={closeModal} />
      )}
      <button
        type="button"
        className={`learn_more_button${isOpen ? " learn_more_button_active" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPinned(true)}
      >
        <span className="question_icon">?</span>
        <span className="learn_more_text">Learn More</span>
      </button>

      {isOpen && (
        <div
          className="learn_more_tooltip"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tooltip_header">
            <h3>How it works</h3>
            <button
              type="button"
              className="close_btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
              }}
            >
              <img src={cross_icon} alt="close" draggable={false} />
            </button>
          </div>

          <div className="tooltip_content">
            <div className="phase_item">
              <div className="phase_icon">
                <img src={multiple_user_transparent_icon} alt="Nomination" />
              </div>
              <div className="phase_details">
                <h4>Nomination Phase (3 days)</h4>
                <p>
                  Nominate one or more teammates (from your team or cross-team)
                  who&apos;ve truly gone above and beyond.
                </p>
              </div>
            </div>

            <div className="phase_item">
              <div className="phase_icon">
                <img src={section_icon_transparent_icon} alt="HR Review" />
              </div>
              <div className="phase_details">
                <h4>HR Review</h4>
                <p>HR reviews and validates all nominations.</p>
              </div>
            </div>

            <div className="phase_item">
              <div className="phase_icon">
                <img src={thumbs_up_transparent_icon} alt="Voting" />
              </div>
              <div className="phase_details">
                <h4>Voting Phase (2 days)</h4>
                <p>
                  Employees and Leadership cast their votes to select the
                  winners.
                </p>
              </div>
            </div>

            <div className="phase_item">
              <div className="phase_icon">
                <img src={award_transparent_icon} alt="Winners" />
              </div>
              <div className="phase_details">
                <h4>Winners Announced</h4>
                <p>
                  Employee&apos;s Choice and Leadership Choice winners are
                  announced and rewarded with gift vouchers.
                </p>
              </div>
            </div>
          </div>

          <div className="rewards_section">
            <h3>Rewards</h3>

            <div className="reward_item">
              <div className="reward_icon">
                <img src={coupon_percent_color_icon} alt="Gift Voucher" />
              </div>
              <div className="reward_details">
                <h4>Each Winner Recieves</h4>
                <p>
                  <span className="amount">₹500 Gift Voucher</span>{" "}
                  (Employee&apos;s Choice or Leadership Choice)
                </p>
              </div>
            </div>

            <div className="reward_item">
              <div className="reward_icon">
                <img src={victory_color_icon} alt="Double Win" />
              </div>
              <div className="reward_details">
                <h4>Double-Win Bonus</h4>
                <p>
                  If one person wins both awards, they receive a{" "}
                  <span className="amount">
                    ₹1,000 voucher + a recognition shoutout.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnMore;
