// import React from "react";
import "./navigationCard.scss";
import { useSelector } from "react-redux";
import { fetchToolAccessForUser } from "../../actions/userToolAccessActions";
const ToolBoxNavigationCard = ({
  title,
  rightArrow,
  description,
  icon,
  navigate,
  toolname,
}) => {
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  
  const onClickTrigger = async (e) => {
    e.preventDefault();
    const userId = user.userId;
    if (!toolname || user.userType === 900) {
      navigate();
    } else if(toolname === "HR Repository"){
      if(allToolsAccessDetails?.[toolname] >= 500 || user.employeeUuid) navigate();
      else alert("You have not been onboarded. Please get in touch with your admin to proceed.");
    } else {
      const res = await fetchToolAccessForUser(userId, toolname);
      if (res.success && res.havePermission) {
        navigate();
      } else {
        window.alert(res.message)
      }
    }
  };
  
  return (
    <div className="tool_navigation__card" onClick={onClickTrigger}>
      <div className="card_left_section">
        <img src={icon} alt="" />
        <p className="card_title">{title}</p>
        <p className="card_description">{description}</p>
      </div>
      <div className="card_right_section">
        <img src={rightArrow} alt="" width="40" height="20" />
      </div>
    </div>
  );
};

export default ToolBoxNavigationCard;