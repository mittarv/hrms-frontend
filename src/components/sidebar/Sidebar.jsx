import { useState } from "react";
import "./sidebar.scss";
import closeIcon from "../../assets/icons/close_drawer.svg";
import Mittarv_logo_With_Name from "../../assets/icons/mittarv_name_and_logo.svg";
import Mittarv_logo from "../../assets/icons/mittarv_logo.svg";
import {
  adminsidebarContent,
  hrRepoRouterData,
  toolAdminSidebarContent,
  userSidebarContent,
} from "../../constant/data";
import { useLocation, useNavigate } from "react-router-dom";
import logout from "../../assets/icons/logout.svg";
import { useDispatch, useSelector } from "react-redux";

const Sidebar = () => {
  const [tooglesidebar, setToggleSidebar] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const currentPath = location.pathname;

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch({ type: "LOGOUT_USER" });
  };

  //Filter the hrRepoRouterData to remove the Employee-Repo tab for non-admin
   const filteredHrRepoRouterData = allToolsAccessDetails?.[selectedToolName] >= 500 ? hrRepoRouterData.filter((tab) => tab.path !== "/employee-directory")  : 
       hrRepoRouterData.filter((tab) =>  tab.path !== "/leave-configurator" && tab.path!== "/hr-repo-requests" && tab.path!== "/employee-repo");
 
  const renderLinks = (content, customClass = "") => {
    return content.map((data) => (
      <div
      key={data.title}
      className={`${
        tooglesidebar ? "sidebar_content_links" : "toggle_sidebar_content_links"
      } ${customClass} ${currentPath === data.path ? "active_links" : ""}`}
      onClick={() => {
        dispatch({ type: "RESET_ADD_PEOPLE_MODE" })
        dispatch({ type: "RESET_LEAVE_DETAILS_PAGE" });
        dispatch({ type: "RESET_EMPLOYEES_DETAILS_PAGE" });  //For reseting state
        dispatch({ type: "RESET_EDIT_MODE" });
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

  

  const renderSidebarContent = () => {
    if (currentPath === "/hr-repo" || currentPath === "/policies" || currentPath === "/imp-link" || currentPath === "/employee-repo" || currentPath === "/dashboard" || currentPath === "/leave-configurator" || currentPath === "/hr-repo-requests" || currentPath === "/leave-attendance" || currentPath === "/payroll-reimbursements" || currentPath === "/employee-directory") {
      return renderLinks(filteredHrRepoRouterData);
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
