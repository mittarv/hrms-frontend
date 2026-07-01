import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import {
  createSecondaryLocationLog,
  deleteSecondaryLocationLog,
  fetchSecondaryLocationLogs,
  fetchSecondaryLocationOverview,
  getAllComponentTypes,
  getAllEmployee,
  updateSecondaryLocationLog,
} from "../../../../actions/hrRepositoryAction";
import LogOverviewCards from "./log/LogOverviewCards";
import LogEligibilityState from "./log/LogEligibilityState";
import LogToolbar from "./log/LogToolbar";
import LogTable from "./log/LogTable";
import LogEntryModal from "./log/LogEntryModal";
import { getSortConfig, STATUS_FILTER_OPTIONS } from "./log/logConstants";
import "../styles/SecondaryLocationLog.scss";

const PAGE_SIZE = 10;

const getEmployeeName = (employee) => {
  const firstName = employee?.empFirstName || employee?.employeeFirstName || "";
  const lastName = employee?.empLastName || employee?.employeeLastName || "";
  return `${firstName} ${lastName}`.trim();
};

const normalizeDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
};

const getDaysFromToday = (dateValue) => {
  if (!dateValue) return 0;
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return 0;
  const today = new Date();
  const startTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const startToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((startTarget - startToday) / (24 * 60 * 60 * 1000));
};

const SecondaryLocationLog = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const {
    myHrmsAccess,
    allEmployees,
    secondaryLocationOverview,
    secondaryLocationLogs,
    secondaryLocationLogsMeta,
    secondaryLocationLoading,
  } = useSelector((state) => state.hrRepositoryReducer);

  const actorEmployeeUuid = user?.employeeUuid || "";
  const permissions = myHrmsAccess?.permissions || [];
  const canManageOthers =
    user?.userType === 900 ||
    permissions.some((permission) =>
      permission?.name === "SecondaryLocationLogOthers_create" ||
      permission?.displayName === "SecondaryLocationLogOthers_create"
    );

  const [selectedEmployeeUuid, setSelectedEmployeeUuid] = useState(actorEmployeeUuid);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [currentSort, setCurrentSort] = useState("startAsc");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedLog, setSelectedLog] = useState(null);
  const [formData, setFormData] = useState({ startDate: "", endDate: "" });
  const [formErrors, setFormErrors] = useState({});
  const [formReason, setFormReason] = useState("");
  const [formApiError, setFormApiError] = useState("");
  const [showReasonField, setShowReasonField] = useState(false);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingLog, setIsDeletingLog] = useState(false);

  const loadMoreRef = useRef(null);

  const employeeOptions = useMemo(
    () =>
      (allEmployees || [])
        .map((employee) => ({
          empUuid: employee?.empUuid || employee?.employeeUuid || "",
          name: getEmployeeName(employee),
          profileImage:
            employee?.employeeProfileImage || employee?.profilePic || employee?.empProfileImage || "",
          isCurrentUser: (employee?.empUuid || employee?.employeeUuid || "") === actorEmployeeUuid,
        }))
        .filter((employee) => employee.empUuid && employee.name),
    [actorEmployeeUuid, allEmployees]
  );

  const selectedEmployeeName = useMemo(() => {
    const selected = employeeOptions.find((employee) => employee.empUuid === selectedEmployeeUuid);
    if (selected) {
      return selected.name;
    }

    const fallbackName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return fallbackName || user?.name || "";
  }, [employeeOptions, selectedEmployeeUuid, user?.firstName, user?.lastName, user?.name]);

  const selectedEmployeeProfileImage = useMemo(() => {
    const selected = employeeOptions.find((employee) => employee.empUuid === selectedEmployeeUuid);
    if (selected?.profileImage) {
      return selected.profileImage;
    }
    return user?.profilePic || "";
  }, [employeeOptions, selectedEmployeeUuid, user?.profilePic]);

  const showSelectedEmployeeChip =
    canManageOthers &&
    Boolean(selectedEmployeeUuid && actorEmployeeUuid && selectedEmployeeUuid !== actorEmployeeUuid);

  const employeeSearchSuggestions = useMemo(() => {
    const query = employeeSearchQuery.trim().toLowerCase();
    if (!query) {
      return employeeOptions.slice(0, 20);
    }

    return employeeOptions
      .filter((employee) => employee.name.toLowerCase().includes(query))
      .slice(0, 20);
  }, [employeeOptions, employeeSearchQuery]);

  const sortConfig = useMemo(() => getSortConfig(currentSort), [currentSort]);

  const fallbackEligibilityMessage = useMemo(() => {
    if (!secondaryLocationOverview) {
      return "";
    }

    const employeeDisplayName = selectedEmployeeName?.trim() || "this employee";
    const employeePossessive = employeeDisplayName.endsWith("s")
      ? `${employeeDisplayName}'`
      : `${employeeDisplayName}'s`;

    if (showSelectedEmployeeChip && secondaryLocationOverview?.isSecondarySameAsPrimary) {
      return `You cannot mark secondary location logs for ${employeeDisplayName} because ${employeePossessive} secondary location is marked same as primary location.`;
    }

    if (showSelectedEmployeeChip && !secondaryLocationOverview?.secondaryLocation) {
      return `You cannot mark secondary location logs for ${employeeDisplayName} because ${employeePossessive} secondary location is not set.`;
    }

    if (secondaryLocationOverview?.eligibilityMessage) {
      return secondaryLocationOverview.eligibilityMessage;
    }

    if (!secondaryLocationOverview?.secondaryLocation) {
      return "Please set your secondary location to continue.";
    }

    if (secondaryLocationOverview?.isSecondarySameAsPrimary) {
      return "You are not eligible for secondary location logs because your secondary location is marked as same as primary location.";
    }

    return "";
  }, [secondaryLocationOverview, selectedEmployeeName, showSelectedEmployeeChip]);

  const isEligible = Boolean(secondaryLocationOverview?.isEligible);
  const selectedDurationDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
    const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endUtc = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const days = Math.floor((endUtc - startUtc) / (24 * 60 * 60 * 1000)) + 1;
    return days > 0 ? days : 0;
  }, [formData.endDate, formData.startDate]);

  const policyValidation = useMemo(() => {
    const progress = secondaryLocationOverview?.progress || {};
    const requiredDurationDays = Number(progress?.requiredDurationDays) || 0;
    const usedDurationDays = Number(progress?.usedDurationDays) || 0;
    const maximumSplitsPerYear = Number(progress?.maximumSplitsPerYear) || 0;
    const usedSplits = Number(progress?.usedSplits) || 0;

    if (!selectedDurationDays || requiredDurationDays <= 0) {
      return { message: "", isError: false, disableSave: false };
    }

    const selectedLogDuration = selectedLog ? Number(selectedLog.durationDays) || 0 : 0;
    const adjustedUsedDurationDays = Math.max(usedDurationDays - selectedLogDuration, 0);
    const adjustedUsedSplits = Math.max(usedSplits - (selectedLog ? 1 : 0), 0);
    const remainingDurationDays = Math.max(requiredDurationDays - adjustedUsedDurationDays, 0);

    if (selectedDurationDays > remainingDurationDays) {
      return {
        message:
          "You have reached the maximum allotted Work From Office duration. Please adjust the selected dates.",
        isError: true,
        disableSave: true,
      };
    }

    if (maximumSplitsPerYear > 0) {
      if (adjustedUsedSplits >= maximumSplitsPerYear) {
        return {
          message:
            "You are allowed up to the configured period splits annually. You have no split remaining. Please adjust the selected dates.",
          isError: true,
          disableSave: true,
        };
      }

      const projectedUsedSplits = adjustedUsedSplits + 1;
      const projectedUsedDays = adjustedUsedDurationDays + selectedDurationDays;
      const projectedRemainingDays = Math.max(requiredDurationDays - projectedUsedDays, 0);
      const projectedRemainingSplits = maximumSplitsPerYear - projectedUsedSplits;

      if (projectedRemainingSplits > 0 && projectedRemainingDays > 0) {
        return {
          message:
            `You are allowed up to ${maximumSplitsPerYear} period splits annually. ` +
            `You have ${projectedRemainingSplits} split remaining. ` +
            `Please schedule ${projectedRemainingDays} days to complete your mandatory WFO duration.`,
          isError: false,
          disableSave: false,
        };
      }

      if (projectedRemainingSplits <= 0 && projectedRemainingDays > 0) {
        return {
          message:
            `You are allowed up to ${maximumSplitsPerYear} period splits annually. ` +
            `After this entry, you will have 0 split remaining. ` +
            `Please schedule ${projectedRemainingDays} days to complete your mandatory WFO duration.`,
          isError: false,
          disableSave: false,
        };
      }
    }

    return {
      message: `Duration: ${selectedDurationDays} day(s)`,
      isError: false,
      disableSave: false,
    };
  }, [secondaryLocationOverview?.progress, selectedDurationDays, selectedLog]);

  const intimationInfo = useMemo(() => {
    const minDays = Number(secondaryLocationOverview?.progress?.minimumIntimationPeriodDays) || 0;
    const daysToStart = getDaysFromToday(formData.startDate);
    const outsideIntimation = minDays > 0 && daysToStart < minDays;
    return { minDays, daysToStart, outsideIntimation };
  }, [formData.startDate, secondaryLocationOverview?.progress?.minimumIntimationPeriodDays]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (modalMode === "edit") {
      setShowReasonField(true);
      return;
    }
    setShowReasonField(intimationInfo.outsideIntimation);
  }, [intimationInfo.outsideIntimation, isModalOpen, modalMode]);

  const fetchLogs = useCallback(
    (append = false, lastId = "") => {
      if (!selectedEmployeeUuid) {
        return;
      }

      dispatch(
        fetchSecondaryLocationLogs({
          month: month ? Number(month) : undefined,
          year: year ? Number(year) : undefined,
          statuses: selectedStatuses,
          sortBy: sortConfig.sortBy,
          sortOrder: sortConfig.sortOrder,
          employeeUuid: selectedEmployeeUuid,
          limit: PAGE_SIZE,
          lastId,
          append,
        })
      );
    },
    [dispatch, month, year, selectedStatuses, sortConfig.sortBy, sortConfig.sortOrder, selectedEmployeeUuid]
  );

  const refreshData = useCallback(() => {
    if (!selectedEmployeeUuid) {
      return;
    }

    dispatch(fetchSecondaryLocationOverview(selectedEmployeeUuid));
    fetchLogs(false, "");
  }, [dispatch, fetchLogs, selectedEmployeeUuid]);

  useEffect(() => {
    if (actorEmployeeUuid) {
      setSelectedEmployeeUuid((prev) => prev || actorEmployeeUuid);
    }
  }, [actorEmployeeUuid]);

  useEffect(() => {
    dispatch(getAllComponentTypes());
    if (canManageOthers) {
      dispatch(getAllEmployee());
    }
  }, [dispatch, canManageOthers]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const loadMoreLogs = useCallback(() => {
    if (secondaryLocationLoading) return;
    if (!secondaryLocationLogsMeta?.hasNext) return;
    if (!secondaryLocationLogsMeta?.nextLastId) return;

    fetchLogs(true, secondaryLocationLogsMeta.nextLastId);
  }, [fetchLogs, secondaryLocationLoading, secondaryLocationLogsMeta]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMoreLogs();
        }
      },
      {
        root: null,
        rootMargin: "140px 0px",
        threshold: 0,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMoreLogs]);

  const handleEmployeeSelect = (employee) => {
    if (!employee?.empUuid || employee.empUuid === actorEmployeeUuid) {
      return;
    }

    setSelectedEmployeeUuid(employee.empUuid);
    setEmployeeSearchQuery("");
  };

  const handleClearSelectedEmployee = () => {
    setSelectedEmployeeUuid(actorEmployeeUuid);
    setEmployeeSearchQuery("");
  };

  const toggleStatusSelection = (statusKey) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusKey)
        ? prev.filter((item) => item !== statusKey)
        : [...prev, statusKey]
    );
  };

  const openCreateModal = () => {
    if (!isEligible) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    setModalMode("create");
    setSelectedLog(null);
    setFormData({ startDate: today, endDate: today });
    setFormErrors({});
    setFormReason("");
    setFormApiError("");
    setShowReasonField(false);
    setIsModalOpen(true);
  };

  const openEditModal = (log) => {
    if (String(log?.status || "").toLowerCase() === "completed") {
      return;
    }

    setModalMode("edit");
    setSelectedLog(log);
    setFormData({
      startDate: normalizeDate(log.startDate),
      endDate: normalizeDate(log.endDate),
    });
    setFormErrors({});
    setFormReason("");
    setFormApiError("");
    setShowReasonField(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
    setFormErrors({});
    setFormApiError("");
    setFormReason("");
    setShowReasonField(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLogToDelete(null);
    setDeleteReason("");
    setDeleteError("");
    setIsDeletingLog(false);
  };

  const validateLogForm = () => {
    const nextErrors = {};

    if (!formData.startDate) {
      nextErrors.startDate = "Start date is required.";
    }

    if (!formData.endDate) {
      nextErrors.endDate = "End date is required.";
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate.getTime() < startDate.getTime()) {
        nextErrors.endDate = "End date should be greater than or equal to start date.";
      }
    }

    if (showReasonField && !formReason.trim()) {
      nextErrors.reason = "Reason is required.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveLog = async () => {
    if (policyValidation.disableSave) {
      return;
    }
    if (!validateLogForm()) {
      return;
    }

    const payload = {
      employeeUuid: selectedEmployeeUuid,
      startDate: formData.startDate,
      endDate: formData.endDate,
      secondaryLocation:
        secondaryLocationOverview?.secondaryLocation ||
        secondaryLocationOverview?.secondaryLocationLabel,
      ...(formReason.trim() ? { reason: formReason.trim() } : {}),
    };

    setIsSubmittingLog(true);
    const response = selectedLog
      ? await dispatch(updateSecondaryLocationLog(selectedLog.logId, payload))
      : await dispatch(createSecondaryLocationLog(payload));
    setIsSubmittingLog(false);

    if (response?.success) {
      closeModal();
      refreshData();
      return;
    }

    const message = response?.message || "Unable to save the secondary location log.";
    setFormApiError(message);
    if (message.toLowerCase().includes("reason")) {
      setShowReasonField(true);
    }
  };

  const openDeleteModal = (log) => {
    if (String(log?.status || "").toLowerCase() === "completed") {
      return;
    }

    setLogToDelete(log);
    setDeleteReason("");
    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!logToDelete?.logId) return;

    if (!deleteReason.trim()) {
      setDeleteError("Reason is required.");
      return;
    }

    setDeleteError("");
    setIsDeletingLog(true);

    const response = await dispatch(deleteSecondaryLocationLog(logToDelete.logId, deleteReason.trim()));
    setIsDeletingLog(false);

    if (response?.success) {
      closeDeleteModal();
      refreshData();
      return;
    }

    setDeleteError(response?.message || "Unable to delete the log. Please try again.");
  };

  const formatDeleteDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!secondaryLocationOverview && secondaryLocationLoading && !secondaryLocationLogs.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="secondary_location_log_content">
      <LogOverviewCards overview={secondaryLocationOverview} />

      {!isEligible && (
        <LogEligibilityState
          type={secondaryLocationOverview?.isSecondarySameAsPrimary ? "error" : "warning"}
          message={fallbackEligibilityMessage}
        />
      )}

      <LogToolbar
        canSearchEmployees={canManageOthers}
        employeeSearchQuery={employeeSearchQuery}
        onEmployeeSearchQueryChange={setEmployeeSearchQuery}
        onEmployeeSelect={handleEmployeeSelect}
        employeeSearchSuggestions={employeeSearchSuggestions}
        actorEmployeeUuid={actorEmployeeUuid}
        selectedEmployeeName={canManageOthers ? selectedEmployeeName : ""}
        selectedEmployeeProfileImage={canManageOthers ? selectedEmployeeProfileImage : ""}
        showSelectedEmployeeChip={showSelectedEmployeeChip}
        onClearSelectedEmployee={handleClearSelectedEmployee}
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        selectedStatuses={selectedStatuses}
        onStatusSelect={toggleStatusSelection}
        statusFilterOptions={STATUS_FILTER_OPTIONS}
        currentSort={currentSort}
        onSortSelect={(key) => setCurrentSort(key)}
        isSortOpen={isSortOpen}
        setIsSortOpen={setIsSortOpen}
        onOpenCreate={openCreateModal}
        disableCreate={!isEligible || secondaryLocationLoading}
      />

      <LogTable
        logs={secondaryLocationLogs}
        loading={secondaryLocationLoading}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        loadMoreRef={loadMoreRef}
        hasNext={Boolean(secondaryLocationLogsMeta?.hasNext)}
      />

      {isDeleteModalOpen && (
        <div className="sl_log_delete_modal_overlay" onClick={closeDeleteModal}>
          <div className="sl_log_delete_modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="sl_log_delete_close" onClick={closeDeleteModal} aria-label="Close">
              ×
            </button>

            <h4 className="text-header-main">
              Submit delete request for {formatDeleteDate(logToDelete?.startDate)} - {formatDeleteDate(logToDelete?.endDate)}?
            </h4>

            <label className="sl_log_delete_reason_field">
              <span className="text-tooltip-small-bold">Reason*</span>
              <input
                type="text"
                value={deleteReason}
                onChange={(event) => {
                  setDeleteReason(event.target.value);
                  if (deleteError) setDeleteError("");
                }}
                placeholder="Enter reason"
              />
            </label>

            {deleteError && <p className="sl_log_delete_error">{deleteError}</p>}

            <div className="sl_log_delete_actions">
              <button type="button" className="cancel_btn text-btn-primary" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button
                type="button"
                className="continue_btn text-btn-primary"
                onClick={handleConfirmDelete}
                disabled={isDeletingLog}
              >
                {isDeletingLog ? "Please wait..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <LogEntryModal
        isOpen={isModalOpen}
        mode={modalMode}
        employeeName={selectedEmployeeName}
        secondaryLocationName={
          secondaryLocationOverview?.secondaryLocationLabel || secondaryLocationOverview?.secondaryLocation || ""
        }
        formData={formData}
        errors={formErrors}
        backendError={formApiError}
        validationMessage={policyValidation.message}
        isValidationError={policyValidation.isError}
        disableSave={policyValidation.disableSave}
        intimationMessage={
          modalMode !== "edit" && intimationInfo.outsideIntimation
            ? `Minimum intimation period is ${intimationInfo.minDays} day(s). Please provide reason to continue.`
            : ""
        }
        reason={formReason}
        showReasonField={showReasonField}
        loading={isSubmittingLog}
        onClose={closeModal}
        onSave={handleSaveLog}
        onChangeField={(field, value) => {
          setFormData((prev) => ({ ...prev, [field]: value }));
          setFormErrors((prev) => {
            if (!prev[field]) return prev;
            const nextErrors = { ...prev };
            delete nextErrors[field];
            return nextErrors;
          });
        }}
        onChangeReason={(value) => {
          setFormReason(value);
          setFormErrors((prev) => {
            if (!prev.reason) return prev;
            const nextErrors = { ...prev };
            delete nextErrors.reason;
            return nextErrors;
          });
        }}
      />
    </div>
  );
};

export default SecondaryLocationLog;
