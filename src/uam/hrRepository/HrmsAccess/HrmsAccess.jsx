import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { hrToolHomePageData } from "../constant/data";
import Single_user_icon from "../assets/icons/single_user_icon.svg";
import Multiple_user_icon from "../assets/icons/multiple_user_icon.svg";
import RoleManagement from "./components/RoleManagement";
import UserManagement from "./components/UserManagement";
import Snackbar from "../Common/components/Snackbar";
import "./styles/HrmsAccess.scss";

const TABS = {
  ROLE_MANAGEMENT: "role_management",
  USER_MANAGEMENT: "user_management",
};

const TAB_CONFIG = [
  {
    id: TABS.ROLE_MANAGEMENT,
    label: "Role Management",
    activeIcon: Single_user_icon,
    inactiveIcon: Single_user_icon,
    component: RoleManagement,
    altText: "Role Management Icon",
    permissions: [
      "HrmsRoleManagement_read",
      "HrmsRoleManagement_write",
    ],
  },
  {
    id: TABS.USER_MANAGEMENT,
    label: "User Management",
    activeIcon: Multiple_user_icon,
    inactiveIcon: Multiple_user_icon,
    component: UserManagement,
    altText: "User Management Icon",
    permissions: [
      "HrmsUserManagement_read",
      "HrmsUserManagement_write",
    ],
  },
];

const HrmsAccess = () => {
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(TABS.ROLE_MANAGEMENT);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2,
    });
  }, [dispatch]);

  // Initialize active tab from URL params on component mount
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && Object.values(TABS).includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Get user access level - only calculate after selectedToolName is available
  const userAccessLevel = selectedToolName
    ? allToolsAccessDetails[selectedToolName] || 100
    : null;

  // Helper function to check if user has a specific permission (string or array)
  const hasPermission = useCallback((permissionNameOrArray) => {
    const permissions = myHrmsAccess?.permissions || [];
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    
    // Admin users have access to everything
    if (isAdmin) return true;
    
    if (!permissionNameOrArray) return false;
    
    // If it's an array, check if user has ANY of the permissions (OR logic)
    if (Array.isArray(permissionNameOrArray)) {
      return permissionNameOrArray.some(permissionName =>
        permissions.some(
          (perm) => perm.name === permissionName || perm.displayName === permissionName
        )
      );
    }
    
    // If it's a string, check if user has that permission
    return permissions.some(
      (perm) => perm.name === permissionNameOrArray || perm.displayName === permissionNameOrArray
    );
  }, [myHrmsAccess, allToolsAccessDetails, selectedToolName]);

  // Filter tabs based on permissions
  const availableTabs = useMemo(() => {
    if (!selectedToolName) return [];

    return TAB_CONFIG.filter((tab) => {
      // Admin users can see all tabs
      if (allToolsAccessDetails?.[selectedToolName] >= 900) {
        return true;
      }
      
      // Check if user has any of the required permissions for this tab
      return hasPermission(tab.permissions);
    });
  }, [selectedToolName, allToolsAccessDetails, hasPermission]);

  // Set default active tab based on available tabs
  useEffect(() => {
    if (availableTabs.length > 0 && selectedToolName) {
      const tabFromUrl = searchParams.get("tab");

      // If there's a valid tab in URL and it's available to the user, use that
      if (tabFromUrl && availableTabs.find((tab) => tab.id === tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }
      // If current active tab is not available to user, set to first available tab
      else if (!availableTabs.find((tab) => tab.id === activeTab)) {
        const defaultTab = availableTabs[0].id;
        setActiveTab(defaultTab);
        // Update URL to reflect the default tab
        setSearchParams((prev) => {
          prev.set("tab", defaultTab);
          return prev;
        });
      }
      // If no tab in URL but activeTab is valid, update URL
      else if (
        !tabFromUrl &&
        availableTabs.find((tab) => tab.id === activeTab)
      ) {
        setSearchParams((prev) => {
          prev.set("tab", activeTab);
          return prev;
        });
      }
    }
  }, [
    availableTabs,
    activeTab,
    selectedToolName,
    searchParams,
    setSearchParams,
  ]);

  const currentTabContent = useMemo(() => {
    if (!selectedToolName) return null;

    const activeTabConfig = availableTabs.find((tab) => tab.id === activeTab);
    if (!activeTabConfig) return null;

    const Component = activeTabConfig.component;
    return <Component key={activeTab} />; // Add key to force remount when tab changes
  }, [activeTab, availableTabs, selectedToolName]);

  // Memoize tab click handler to prevent unnecessary re-renders
  const handleTabClick = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      setSearchParams((prev) => {
        prev.set("tab", tabId);
        return prev;
      });
    },
    [setSearchParams]
  );

  const renderTab = useCallback(
    (tab) => {
      const isActive = activeTab === tab.id;

      return (
        <span
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={isActive ? "active_tab" : "inactive_tab"}
          aria-pressed={isActive}
          aria-label={`Switch to ${tab.label} tab`}
        >
          <img
            src={isActive ? tab.activeIcon : tab.inactiveIcon}
            alt={tab.altText}
            className="leave_calendar_icon"
          />
          <p>{tab.label}</p>
        </span>
      );
    },
    [activeTab, handleTabClick]
  );

  return (
    <>
      <div className="hrms_access_container">
        <div
          className="hrms_access_tabs"
          data-active={activeTab}
          role="tablist"
        >
          {availableTabs.map(renderTab)}
        </div>
        <hr />
        <div className="leave_management_tab_content" role="tabpanel">
          {currentTabContent}
        </div>
      </div>
      <Snackbar />
    </>
  );
};

export default HrmsAccess;
