import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProcessPhases from "./components/ProcessPhases";
import LearnMore from "./components/LearnMore";
import Snackbar from "../Common/components/Snackbar";
import RewardsPhase from "./components/RewardsPhase";
import WinnerComponent from "./components/WinnerComponent";
import ReceivedCitationsCard from "./components/ReceivedCitationsCard";
import RewardsTabs from "./components/RewardsTabs";
import NominationModal from "./components/NominationModal";
import ReviewNominations from "./components/ReviewNominations";
import ManageCitationsModal from "./components/ManageCitationsModal";
import AnnounceWinnersModal from "./components/AnnounceWinnersModal";
import CustomDropdown from "../Common/components/CustomDropdown";
import {
  getAllEmployee,
  getAllComponentTypes,
  setNominationModalOpen,
  setAnnounceWinnersModalOpen,
  setManageCitationsModalOpen,
  fetchAllCycles,
  fetchRewardsDashboard,
} from "../../../actions/hrRepositoryAction";
import { hrToolHomePageData } from "../constant/data";
import "./styles/RewardsRecognition.scss";

const TAB_DASHBOARD = 0;
const TAB_REVIEW_NOMINATIONS = 1;

const RewardsRecognition = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(TAB_DASHBOARD);
  const [selectedCampaignLabel, setSelectedCampaignLabel] = useState("Current / Active Campaign");

  const { user } = useSelector((state) => state.user);
  const {
    allEmployees,
    getAllComponentType,
    rewardsDashboardData,
    nominationModalOpen,
    announceWinnersModalOpen,
    manageCitationsModalOpen,
    myHrmsAccess,
    rewardsAllCycles,
  } = useSelector((state) => state.hrRepositoryReducer);

  const permissions = myHrmsAccess?.permissions || [];
  const hasRewardsPermission = (name) =>
    permissions.some((p) => p.name === name || p.displayName === name);
  const isRewardsAdmin =
    user?.userType === 900 ||
    hasRewardsPermission("RewardsRecognition_Process_Manage") ||
    hasRewardsPermission("RewardsRecognition_Choose_Winner") ||
    hasRewardsPermission("RewardsRecognition_Admin_View");

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData?.toot_title2 || "HR Repository",
    });
  }, [dispatch]);

  useEffect(() => {
    const hasEmployees = Array.isArray(allEmployees) && allEmployees.length > 0;
    if (!hasEmployees) {
      dispatch(getAllEmployee());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, allEmployees?.length]);

  useEffect(() => {
    const hasTypes =
      getAllComponentType &&
      typeof getAllComponentType === "object" &&
      Object.keys(getAllComponentType).length > 0;
    if (!hasTypes) {
      dispatch(getAllComponentTypes());
    }
  }, [dispatch, getAllComponentType]);

  useEffect(() => {
    if (isRewardsAdmin && (!rewardsAllCycles || rewardsAllCycles.length === 0)) {
      dispatch(fetchAllCycles());
    }
  }, [dispatch, isRewardsAdmin,rewardsAllCycles]);

  const handleCycleSelect = (e) => {
    const val = e.target.value;
    setSelectedCampaignLabel(val);
    setSearchParams(val === "Current / Active Campaign" ? {} : { campaign: val }, { replace: true });
    
    if (val === "Current / Active Campaign") {
      dispatch(fetchRewardsDashboard());
    } else {
      const selectedCycle = rewardsAllCycles?.find(c => {
        const label = `${new Date(c.year, c.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}${c.status === 'completed' ? ' (Completed)' : ''}`;
        return label === val;
      });
      if (selectedCycle) {
        dispatch(fetchRewardsDashboard(selectedCycle.month, selectedCycle.year));
      }
    }
  };
  
  // Fetch specific campaign on load if present in URL
  useEffect(() => {
    if (isRewardsAdmin && rewardsAllCycles && rewardsAllCycles.length > 0) {
      const urlCampaign = searchParams.get("campaign");
      if (urlCampaign && urlCampaign !== "Current / Active Campaign") {
        const selectedCycle = rewardsAllCycles.find(c => {
          const label = `${new Date(c.year, c.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}${c.status === 'completed' ? ' (Completed)' : ''}`;
          return label === urlCampaign;
        });
        if (selectedCycle) {
          dispatch(fetchRewardsDashboard(selectedCycle.month, selectedCycle.year));
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRewardsAdmin, rewardsAllCycles?.length]);

  const dropdownOptions = [
    { value: "Current / Active Campaign" },
    ...(Array.isArray(rewardsAllCycles) ? rewardsAllCycles.map(c => ({
      value: `${new Date(c.year, c.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}${c.status === 'completed' ? ' (Completed)' : ''}`
    })) : [])
  ];

  const cycle =
    rewardsDashboardData?.currentCycle || rewardsDashboardData?.cycle;
  const cycleId = cycle?.id ?? cycle?.cycleId;
  const currentCycleWinners = Array.isArray(
    rewardsDashboardData?.currentCycleWinners,
  )
    ? rewardsDashboardData.currentCycleWinners
    : [];
  const phase = (cycle?.currentPhase || "").toLowerCase();
  const cycleStatus = (cycle?.status || "").toLowerCase();
  const isCycleCompleted = cycleStatus === "completed";
  const isProcessCompleted =
    phase === "winners" && (isCycleCompleted || currentCycleWinners.length > 0);

  return (
    <>
      <div className="rewards_recognition_main_container">
        {isRewardsAdmin && (
          <div className="rewards_recognition_tabs" role="tablist">
            <span
              role="tab"
              tabIndex={0}
              className={
                tabValue === TAB_DASHBOARD ? "active_tab" : "inactive_tab"
              }
              onClick={() => setTabValue(TAB_DASHBOARD)}
              onKeyDown={(e) => e.key === "Enter" && setTabValue(TAB_DASHBOARD)}
            >
              Rewards Dashboard
            </span>
            <span
              role="tab"
              tabIndex={0}
              className={
                tabValue === TAB_REVIEW_NOMINATIONS
                  ? "active_tab"
                  : "inactive_tab"
              }
              onClick={() => setTabValue(TAB_REVIEW_NOMINATIONS)}
              onKeyDown={(e) =>
                e.key === "Enter" && setTabValue(TAB_REVIEW_NOMINATIONS)
              }
            >
              Review Nominations
            </span>
          </div>
        )}
        {isRewardsAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 30px', position: 'relative', zIndex: 10 }}>
            <div style={{ width: '250px' }}>
              <CustomDropdown
                options={dropdownOptions}
                value={selectedCampaignLabel}
                onChange={handleCycleSelect}
                placeholder="Select Campaign"
              />
            </div>
          </div>
        )}
        {isRewardsAdmin && <hr className="rewards_recognition_tabs_hr" />}

        <div
          className={`rewards_recognition_content_container ${tabValue === TAB_REVIEW_NOMINATIONS ? "review_active" : ""}`}
        >
          {tabValue === TAB_DASHBOARD && (
            <>
              <ProcessPhases />
              <div className="rewards_dashboard_top_row">
                {isProcessCompleted ? (
                  <>
                    <WinnerComponent
                      isProcessCompleted={true}
                      isRewardsAdmin={isRewardsAdmin}
                    />
                    <ReceivedCitationsCard
                      cycleId={cycleId}
                      month={cycle?.month}
                      year={cycle?.year}
                    />
                  </>
                ) : (
                  <>
                    <RewardsPhase />
                    <WinnerComponent
                      variant="past"
                      isRewardsAdmin={isRewardsAdmin}
                    />
                  </>
                )}
              </div>
              <RewardsTabs />
            </>
          )}
          {tabValue === TAB_REVIEW_NOMINATIONS && isRewardsAdmin && (
            <ReviewNominations />
          )}
        </div>
      </div>

      {nominationModalOpen && cycleId && (
        <NominationModal
          cycleId={cycleId}
          awardName="Going above and beyond"
          onClose={() => dispatch(setNominationModalOpen(false))}
        />
      )}
      {announceWinnersModalOpen && cycleId && (
        <AnnounceWinnersModal
          cycleId={cycleId}
          onClose={() => dispatch(setAnnounceWinnersModalOpen(false))}
        />
      )}
      {manageCitationsModalOpen && (
        <ManageCitationsModal
          onClose={() =>
            dispatch(setManageCitationsModalOpen({ isOpen: false, data: null }))
          }
        />
      )}
      <LearnMore />
      <Snackbar />
    </>
  );
};

export default RewardsRecognition;
