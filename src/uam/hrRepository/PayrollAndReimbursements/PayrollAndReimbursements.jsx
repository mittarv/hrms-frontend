import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { hrToolHomePageData } from "../constant/data";
import Configure_Salary_Inactive_Icon from "../assets/icons/configure_salary_inactive_icon.svg";
import Configure_Salary_Active_Icon from "../assets/icons/configure_salary_active_icon.svg";
import Payroll_Inactive_Icon from "../assets/icons/payroll_inactive_icon.svg";
import Payroll_Active_Icon from "../assets/icons/payroll_active_icon.svg";
import Payslip_Active_Icon from "../assets/icons/payslip_active_icon.svg";
import Payslip_Inactive_Icon from "../assets/icons/payslip_inactive_icon.svg";
import SalaryConfiguration from "./SalaryConfiguration/SalaryConfiguration";
import Payroll from "./Payroll/Payroll";
import PaySlip from "./Payslip/Payslip";
import Snackbar from "../Common/components/Snackbar";
import "./PayrollAndReimbursements.scss";

const TABS = {
  SALARY_CONFIGURATION: "salary_configuration",
  PAYROLL: "payroll",
  PAYSLIPS: "payslips",
  REIMBURSEMENTS: "reimbursements"
};

const TAB_CONFIG = [
  {
    id: TABS.SALARY_CONFIGURATION,
    label: "Configure Salary",
    activeIcon: Configure_Salary_Active_Icon,
    inactiveIcon: Configure_Salary_Inactive_Icon,
    component: SalaryConfiguration,
    altText: "Configure Salary Icon"
  },
  {
    id: TABS.PAYROLL,
    label: "Payroll",
    activeIcon: Payroll_Active_Icon,
    inactiveIcon: Payroll_Inactive_Icon,
    component: Payroll,
    altText: "Payroll Icon"
  },
  {
    id: TABS.PAYSLIPS,
    label: "Payslips",
    activeIcon: Payslip_Active_Icon,
    inactiveIcon: Payslip_Inactive_Icon,
    component: PaySlip,
    altText: "Payslips Icon"
  },
  {
    id: TABS.REIMBURSEMENTS,
    label: "Reimbursements",
    activeIcon: Payroll_Active_Icon,
    inactiveIcon: Payroll_Inactive_Icon,
    component: null,
    altText: "Reimbursements Icon"
  }
];
const PayrollAndReimbursements = () => {
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(TABS.SALARY_CONFIGURATION);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2
    });
  }, [dispatch]);

  // Initialize active tab from URL params on component mount
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && Object.values(TABS).includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Helper function to check if user has permission
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some(perm => perm.name === permissionName);
  };

  // Check permissions for each tab
  const canViewSalaryConfig = hasPermission("ConfigureSalary_read");
  const canViewPayroll = hasPermission("Payroll_read");

  // Get user access level - only calculate after selectedToolName is available
  const userAccessLevel = selectedToolName ? (allToolsAccessDetails[selectedToolName] || 100) : null;

  // Filter tabs based on user permissions
  const availableTabs = useMemo(() => {
    if (!userAccessLevel && !canViewSalaryConfig && !canViewPayroll) return [];

    const tabs = [];
    
    // Salary Configuration tab - requires ConfigureSalary_read permission or admin
    if (userAccessLevel >= 900 || canViewSalaryConfig) {
      tabs.push(TAB_CONFIG.find(tab => tab.id === TABS.SALARY_CONFIGURATION));
    }
    
    // Payroll tab - requires Payroll_read permission or admin
    if (userAccessLevel >= 900 || canViewPayroll) {
      tabs.push(TAB_CONFIG.find(tab => tab.id === TABS.PAYROLL));
    }
    
    // Payslips tab - always available (users can view their own payslips)
    tabs.push(TAB_CONFIG.find(tab => tab.id === TABS.PAYSLIPS));
    
    // Reimbursements tab - always available
    tabs.push(TAB_CONFIG.find(tab => tab.id === TABS.REIMBURSEMENTS));
    
    return tabs.filter(Boolean); // Remove undefined entries
  }, [userAccessLevel, canViewSalaryConfig, canViewPayroll]);

  // Set default active tab based on available tabs
  useEffect(() => {
    if (availableTabs.length > 0 && userAccessLevel !== null) {
      const tabFromUrl = searchParams.get('tab');

      // If there's a valid tab in URL and it's available to the user, use that
      if (tabFromUrl && availableTabs.find(tab => tab.id === tabFromUrl)) {
        setActiveTab(tabFromUrl);
      } 
      // If current active tab is not available to user, set to first available tab
      else if (!availableTabs.find(tab => tab.id === activeTab)) {
        const defaultTab = availableTabs[0].id;
        setActiveTab(defaultTab);
        // Update URL to reflect the default tab
        setSearchParams((prev) => {
          prev.set('tab', defaultTab);
          return prev;
        });
      }
      // If no tab in URL but activeTab is valid, update URL
      else if (!tabFromUrl && availableTabs.find(tab => tab.id === activeTab)) {
        setSearchParams((prev) => {
          prev.set('tab', activeTab);
          return prev;
        });
      }
    }
  }, [availableTabs, activeTab, userAccessLevel, searchParams, setSearchParams]);

  const currentTabContent = useMemo(() => {
    if (!userAccessLevel) return null;

    const activeTabConfig = availableTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    const Component = activeTabConfig.component;
    return <Component />;
  }, [activeTab, availableTabs, userAccessLevel]);

  // Memoize tab click handler to prevent unnecessary re-renders
  const handleTabClick = useCallback((tabId, tabLabel) => {
    if (tabId === TABS.REIMBURSEMENTS) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: `${tabLabel} feature coming soon!`,
          severity: "info"
        }
      });
      return;
    }
    setActiveTab(tabId);
    setSearchParams((prev) => {
      prev.set('tab', tabId);
      return prev;
    });
  }, [dispatch, setSearchParams]);

  const renderTab = useCallback((tab) => {
    const isActive = activeTab === tab.id;

    return (
      <span
        key={tab.id}
        onClick={() => handleTabClick(tab.id, tab.label)}
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
  }, [activeTab, handleTabClick]);

  return (
    <>
      <div className="payroll_reimbursements_container">
        <div className="payroll_reimbursements_tabs" data-active={activeTab} role="tablist">
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

export default PayrollAndReimbursements;