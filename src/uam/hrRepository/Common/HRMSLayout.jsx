import HRMSSidebar from "./HRMSSidebar";
import HRMSHeader from "./HRMSHeader";
import HrAllRoutes from "../HrAllRoutes";
import "./HRMSLayout.scss";

const HRMSLayout = ({ isAuthenticated }) => {
  return (
    <div className="hrms_parent_component">
      {/* =======================this sidebar and the Header will be fixed for every component ================================*/}
      <HRMSSidebar />
      <div className="hrms_static_component">
        <HRMSHeader />
        <div className="hrms_display_routes">
          <HrAllRoutes isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
};

export default HRMSLayout;
