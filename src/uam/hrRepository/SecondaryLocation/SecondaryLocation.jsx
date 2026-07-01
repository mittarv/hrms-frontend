import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConfigurationTab from "./components/ConfigurationTab";
import SecondaryLocationLog from "./components/SecondaryLocationLog";
import Snackbar from "../Common/components/Snackbar";
import LoadingSpinner from "../Common/components/LoadingSpinner";
import { getMyHrmsAccess } from "../../../actions/hrRepositoryAction";
import { hrToolHomePageData } from "../constant/data";
import "./SecondaryLocation.scss";

const TAB_CONFIGURATION = 0;
const TAB_LOG = 1;

const SecondaryLocation = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(TAB_CONFIGURATION);

  const { user } = useSelector((state) => state.user);
  const { myHrmsAccess, myHrmsAccessLoaded } = useSelector((state) => state.hrRepositoryReducer);

  const isSuperAdmin = user?.userType === 900;

  const permissions = myHrmsAccess?.permissions || [];
  const hasSecondaryLocationPermission = (name) =>
    permissions.some((p) => p.name === name || p.displayName === name);

  const hasConfigPermission = [
    "SecondaryLocationConfig_read",
    "SecondaryLocationConfig_create",
    "SecondaryLocationConfig_update",
    "SecondaryLocationConfig_delete",
  ].some((permissionName) => hasSecondaryLocationPermission(permissionName));

  const isSecondaryLocationAdmin =
    isSuperAdmin ||
    hasSecondaryLocationPermission("SecondaryLocation_Manage") ||
    hasSecondaryLocationPermission("SecondaryLocation_Admin_View") ||
    hasConfigPermission;

  const activeTab = isSecondaryLocationAdmin ? tabValue : TAB_LOG;

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2,
    });
  }, [dispatch]);

  // Fetch myHrmsAccess on component mount
  useEffect(() => {
    if (!isSuperAdmin && !myHrmsAccessLoaded) {
      dispatch(getMyHrmsAccess());
    }
  }, [dispatch, isSuperAdmin, myHrmsAccessLoaded]);

  if (!isSuperAdmin && !myHrmsAccessLoaded) {
    return (
      <div className="secondary_location_main_container">
        <LoadingSpinner message="Loading..." height="30vh" />
      </div>
    );
  }

  return (
    <>
      <div className="secondary_location_main_container">
        {isSecondaryLocationAdmin && (
          <div className="secondary_location_tabs" role="tablist">
            <span
              role="tab"
              tabIndex={0}
              className={
                `text-tab-common ${tabValue === TAB_CONFIGURATION ? "active_tab" : "inactive_tab"}`
              }
              onClick={() => setTabValue(TAB_CONFIGURATION)}
              onKeyDown={(e) => e.key === "Enter" && setTabValue(TAB_CONFIGURATION)}
            >
              Configuration
            </span>
            <span
              role="tab"
              tabIndex={0}
              className={
                `text-tab-common ${tabValue === TAB_LOG ? "active_tab" : "inactive_tab"}`
              }
              onClick={() => setTabValue(TAB_LOG)}
              onKeyDown={(e) => e.key === "Enter" && setTabValue(TAB_LOG)}
            >
              Secondary Location Log
            </span>
          </div>
        )}
        {isSecondaryLocationAdmin && <hr className="secondary_location_tabs_hr" />}

        <div
          className={`secondary_location_content_container ${
            activeTab === TAB_LOG ? "log_active" : ""
          }`}
        >
          {activeTab === TAB_CONFIGURATION && (
            <ConfigurationTab />
          )}
          {activeTab === TAB_LOG && (
            <SecondaryLocationLog />
          )}
        </div>
      </div>
      <Snackbar />
    </>
  );
};

export default SecondaryLocation;
