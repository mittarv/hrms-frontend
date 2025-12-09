import ToolHeader from "../../components/header/ToolHeader";
import "./toolheader.scss";
import logo from "../../assets/images/home_logo.svg";
import { toolHomePageData } from "../../constant/data";
import ToolBoxNavigationCard from "../toolComponents/ToolBoxNavigationCard";
import rightArrow from "../../assets/icons/rightarrow.svg";
import uamIcon from "../../assets/icons/uam_icon.svg";
import webEditor from "../../assets/icons/web_editor.svg";
import { useNavigate } from "react-router-dom";

const ToolHome = () => {
  const navigate = useNavigate();

  const navigateUam = () => {
    navigate("/user-groups");
  };
  const navigateWebEditor = () => {
    navigate("/dashboard");
  };

  return (
    <div className="tool_box_home">
      <ToolHeader />
      <div className="tool_box_main_container">
        <img src={logo} alt="" className="home_logo" />

        <div className="tool_box_main_container__right">
          <p className="toolbox_home_heading">{toolHomePageData.title}</p>
          <div className="tool_navigation_grid">
            <div className="tool_navigation_row">
                <ToolBoxNavigationCard
                  title={toolHomePageData.toot_title}
                  rightArrow={rightArrow}
                  description={toolHomePageData.description}
                  icon={uamIcon}
                  navigate={navigateUam}
                />
                <ToolBoxNavigationCard
                  title={toolHomePageData.toot_title2}
                  rightArrow={rightArrow}
                  description={toolHomePageData.description2}
                  icon={webEditor}
                  navigate={navigateWebEditor}
                  toolname={toolHomePageData.tool_title2_name}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolHome;
