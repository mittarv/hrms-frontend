import { useState } from "react";
// import Drawer from "@mui/material/Drawer";
import "./sidebar.scss";
import closeIcon from "../../assets/icons/close_drawer.svg";
import Mittarv_logo_With_Name from "../../assets/icons/mittarv_name_and_logo.svg";
import Mittarv_logo from "../../assets/icons/mittarv_logo.svg";
import dropdownIcon from "../../assets/icons/dropdown_icon_white.svg";
import {
  adminsidebarContent,
  toolAdminSidebarContent,
  knownIssuesRouter,
  userSidebarContent,
  languageTextEditorRouter,
  featureFlagsRouter,
  AppVersionControlRouter,
  partnerToolRouter,
  notificationToolRouter,
} from "../../constant/data";
import { useLocation, useNavigate } from "react-router-dom";
import logout from "../../assets/icons/logout.svg";
import { useDispatch, useSelector } from "react-redux";

const Sidebar = () => {
  const [tooglesidebar, setToggleSidebar] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const currentPath = location.pathname;
  const [isPlatformExpanded, setPlatformExpanded] = useState(true);

  const handlePlatformToggle = () => {
    setPlatformExpanded(!isPlatformExpanded);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch({ type: "LOGOUT_USER" });
  };

  const renderLinks = (content, customClass = "") => {
    return content.map((data) => (
      <div
      key={data.title}
      className={`${
        tooglesidebar ? "sidebar_content_links" : "toggle_sidebar_content_links"
      } ${customClass} ${currentPath === data.path ? "active_links" : ""}`}
      onClick={() => {
        dispatch({ type: "RESET_ADD_PEOPLE_MODE" })
        dispatch({ type: "RESET_EDIT_MODE" });
        dispatch({ type: "RESET_ADD_PARTNER_FORM_PAGE" });
        dispatch({ type: "RESET_PARTNER_FORM_EDIT_MODE" });
        dispatch({ type: "RESET_PARTNER_FORM_READ_MODE" });
        if (data.path === "/known-issues/imp-link" && currentPath === "/known-issues") {
        alert("The 'Important Link' feature is currently disabled.");
        } else if (data.path !== "/hello") {
        navigate(data.path);
        }
      }}
      >
      <img src={data.icon} alt="icon" />
      {tooglesidebar && <p className="sidebar_link_title">{data.title}</p>}
      </div>
    ));
  };
  

  const renderLanguageTextEditorSection = () => {
    const platformSection = languageTextEditorRouter.find(section => section.section === "Platform");
    const otherSections = languageTextEditorRouter.filter(section => !section.section);
    return (
      <div>
        <div className={`active_links ${isPlatformExpanded ? "expanded" : ""}`}>
          <div className="platform_dropdown" onClick={handlePlatformToggle}>
            <p className="sidebar_link_title">Platform</p>
            <img src={dropdownIcon} alt="dropdown icon" className={`dropdown_icon ${isPlatformExpanded ? "up_arrow" : ""}`} />
          </div>
        </div>
        {isPlatformExpanded && platformSection && (
          <div className={`platform_links ${isPlatformExpanded ? "expanded" : ""}`}>
            {renderLinks(platformSection.routes, "platform_section_links")}
          </div>
        )}
        {otherSections.map(section => (
          <div key={section.title}>
            {renderLinks([section])}
          </div>
        ))}
      </div>
    );
  };

  

  const renderSidebarContent = () => {
    if (currentPath === "/known-issues" || currentPath === "/known-issues/imp-links") {
      return renderLinks(knownIssuesRouter);
    } else if(currentPath.includes("/language-text-editor")) {
      return renderLanguageTextEditorSection();
    }else if(currentPath.includes("/feature-flags")) {
      return renderLinks(featureFlagsRouter);
    } else if(currentPath.includes("/key-value-configuration")){
      return renderLinks(AppVersionControlRouter);
    } else if(currentPath === "/partner-tool" || currentPath === "/subscriptions-configurator" || currentPath === "/configuration-tool" || currentPath === "/referral-tracking") {
      return renderLinks(partnerToolRouter);
    } else if(currentPath === '/notification-tool') {
      return renderLinks(notificationToolRouter);
    } else if (user?.userType === 900) {
      return renderLinks(adminsidebarContent);
    } else if (user?.userType === 500) {
      return renderLinks(toolAdminSidebarContent);
    } else {
      return renderLinks(userSidebarContent);
    }
  };

  return (
    <div className={tooglesidebar ? "main_sidebar" : "toggle_sidebar"}>
      <div className="sidebar_top_section">
        {tooglesidebar ? (
          <img
            src={Mittarv_logo_With_Name}
            alt="logo"
            className="siderbar_header__logo"
            onClick={() => navigate("/")}
          />
        ) : (
          <img
            src={Mittarv_logo}
            className="toggled_logo"
            alt="logo"
            onClick={() => navigate("/")}
          />
        )}

        <img
          src={closeIcon}
          alt="close icon"
          className="drawer_close_icon"
          style={{
            marginLeft: tooglesidebar ? "85%" : "60%",
            marginTop: tooglesidebar ? "-30px" : " -33px",
            position: "relative",
          }}
          onClick={() => setToggleSidebar(!tooglesidebar)}
        />
        {renderSidebarContent()}
      </div>
      <div className={tooglesidebar ? "sidebar_content" : "toggle_sidebar_content"}>
        <div
          className={tooglesidebar ? "sidebar_content_links" : "toggle_sidebar_content_links"}
          role="button"
          onClick={handleLogout}
        >
          <img src={logout} alt="logout icon" />
          {tooglesidebar && <p className="sidebar_link_title">Logout</p>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
