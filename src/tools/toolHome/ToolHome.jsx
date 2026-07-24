import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  useDispatch } from "react-redux";
import ToolHeader from "../../components/header/ToolHeader";
import "./toolheader.scss";
import logo from "../../assets/images/home_logo.svg";
import { toolHomePageData } from "../../constant/data";
import ToolBoxNavigationCard from "../toolComponents/ToolBoxNavigationCard";
import rightArrow from "../../assets/icons/rightarrow.svg";
import webEditor from "../../assets/icons/web_editor.svg";
import { getOrganizationDetails } from "../../actions/hrRepositoryAction";

const ToolHome = () => {
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrgName = async () => {
      const data = await dispatch(getOrganizationDetails());
      if (data && data.name) {
        setOrgName(data.name);
      }
    };
    fetchOrgName();
  }, [dispatch]);

  const navigateWebEditor = () => {
    navigate("/dashboard");
  };

  return (
    <div className="tool_box_home">
      <ToolHeader />
      <div className="tool_box_main_container">
        <img src={logo} alt="" className="home_logo" />

        <div className="tool_box_main_container__right">
          <p className="toolbox_home_heading">Welcome to the {orgName} HRMS</p>

          <div className="tool_navigation_grid">
            <div className="tool_navigation_row">
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
