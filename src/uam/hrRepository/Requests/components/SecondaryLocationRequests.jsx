import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSecondaryLocationRequests,
  reviewSecondaryLocationRequest,
} from "../../../../actions/hrRepositoryAction";
import LoadingSpinner from "../../Common/components/LoadingSpinner";
import Filter from "../../Common/components/Filter/Filter";
import Sort from "../../Common/components/Sort";
import CustomDropdown from "../../Common/components/CustomDropdown";
import ViewMoreText from "../../Common/components/ViewMoreText";
import approve_icon from "../../assets/icons/approve_icon.svg";
import reject_icon_enable from "../../assets/icons/reject_icon_enable.svg";
import reject_icon_disable from "../../assets/icons/reject_icon_disable.svg";
import RequestsSubTabs from "./RequestsSubTabs";
import "../styles/LeaveRequests.scss";

const MONTH_OPTIONS = [
  { label: "All Months", value: "" },
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const REQUEST_TYPE_OPTIONS = ["Log", "Edit", "Delete"];
const REQUEST_TYPE_FILTER_OPTIONS = REQUEST_TYPE_OPTIONS.map((option) => ({
  key: option,
  label: option,
}));

const SORT_OPTIONS = [
  { key: "name_asc", label: "Name (A-Z)", sortBy: "employeeName", sortOrder: "ASC" },
  { key: "name_desc", label: "Name (Z-A)", sortBy: "employeeName", sortOrder: "DESC" },
  { key: "start_asc", label: "Start Date (Oldest first)", sortBy: "startDate", sortOrder: "ASC" },
  { key: "start_desc", label: "Start Date (Newest first)", sortBy: "startDate", sortOrder: "DESC" },
  { key: "end_asc", label: "End Date (Oldest first)", sortBy: "endDate", sortOrder: "ASC" },
  { key: "end_desc", label: "End Date (Newest first)", sortBy: "endDate", sortOrder: "DESC" },
  { key: "duration_asc", label: "Duration (Shortest First)", sortBy: "durationDays", sortOrder: "ASC" },
  { key: "duration_desc", label: "Duration (Longest First)", sortBy: "durationDays", sortOrder: "DESC" },
];

const PAGE_SIZE = 20;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRequestTypeBadgeClass = (requestType) => {
  const normalizedType = String(requestType || "")
    .trim()
    .toLowerCase();

  if (normalizedType === "log") return "request-type-log";
  if (normalizedType === "edit") return "request-type-edit";
  if (normalizedType === "delete") return "request-type-delete";
  return "";
};

const getStatusBadgeClass = (status) => {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  if (normalizedStatus.includes("accept") || normalizedStatus.includes("approv")) {
    return "status-accepted";
  }
  if (normalizedStatus.includes("reject")) {
    return "status-rejected";
  }
  if (normalizedStatus.includes("pending")) {
    return "status-pending";
  }

  return "status-default";
};

const SecondaryLocationRequests = () => {
  const dispatch = useDispatch();
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const {
    myHrmsAccess,
    secondaryLocationRequests,
    secondaryLocationRequestsMeta,
    secondaryLocationRequestsLoading,
  } = useSelector((state) => state.hrRepositoryReducer || {});

  const [requestView, setRequestView] = useState("pending");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [requestType, setRequestType] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [checkedRequestIds, setCheckedRequestIds] = useState([]);
  const loadMoreRef = useRef(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2019 }, (_, index) => String(currentYear - index));
  }, []);

  const monthDropdownOptions = useMemo(
    () => MONTH_OPTIONS.filter((option) => option.value).map((option) => ({ value: option.label })),
    []
  );

  const yearDropdownOptions = useMemo(
    () => yearOptions.map((option) => ({ value: option })),
    [yearOptions]
  );

  const selectedMonthLabel = useMemo(
    () => MONTH_OPTIONS.find((option) => option.value === month)?.label || "",
    [month]
  );

  const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900 || user?.userType === 900;
  const permissions = myHrmsAccess?.permissions || [];
  const hasPermission = (permissionName) =>
    isAdmin || permissions.some((perm) => perm.name === permissionName || perm.displayName === permissionName);

  const canRead = hasPermission("SecondaryLocationRequests_read");
  const canWrite = hasPermission("SecondaryLocationRequests_write");

  const shouldShowPending = requestView === "pending";

  const currentSortKey = useMemo(() => {
    const selectedSort = SORT_OPTIONS.find(
      (option) => option.sortBy === sortBy && option.sortOrder === sortOrder
    );
    return selectedSort?.key || "none";
  }, [sortBy, sortOrder]);

  const fetchRequests = useCallback(
    (append = false, lastId = "") => {
      if (!canRead) return;

      dispatch(
        fetchSecondaryLocationRequests({
          month: month ? Number(month) : undefined,
          year: year ? Number(year) : undefined,
          requestTypes: requestType ? [requestType] : [],
          statuses: [],
          pendingOnly: shouldShowPending,
          sortBy,
          sortOrder,
          limit: PAGE_SIZE,
          lastId,
          append,
        })
      );
    },
    [canRead, dispatch, month, year, requestType, shouldShowPending, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchRequests(false, "");
  }, [fetchRequests, requestView]);

  useEffect(() => {
    setCheckedRequestIds([]);
  }, [secondaryLocationRequests, requestView, month, year, requestType, sortBy, sortOrder]);

  const pendingCount = useMemo(() => {
    if (typeof secondaryLocationRequestsMeta?.pendingCount === "number") {
      return secondaryLocationRequestsMeta.pendingCount;
    }
    return (secondaryLocationRequests || []).filter((request) => request.status === "Pending").length;
  }, [secondaryLocationRequests, secondaryLocationRequestsMeta]);

  const historyCount = useMemo(() => {
    if (typeof secondaryLocationRequestsMeta?.historyCount === "number") {
      return secondaryLocationRequestsMeta.historyCount;
    }
    return (secondaryLocationRequests || []).filter((request) => request.status !== "Pending").length;
  }, [secondaryLocationRequests, secondaryLocationRequestsMeta]);

  const loadedRequestCount = secondaryLocationRequests?.length || 0;
  const currentViewTotalCount = shouldShowPending ? pendingCount : historyCount;

  const selectedAll = useMemo(() => {
    if (!secondaryLocationRequests?.length) return false;
    return secondaryLocationRequests.every((request) => checkedRequestIds.includes(request.requestId));
  }, [secondaryLocationRequests, checkedRequestIds]);

  const toggleSelectAll = () => {
    if (!canWrite || !shouldShowPending) return;
    if (selectedAll) {
      setCheckedRequestIds([]);
      return;
    }
    setCheckedRequestIds((secondaryLocationRequests || []).map((request) => request.requestId));
  };

  const toggleRequest = (requestId) => {
    if (!canWrite || !shouldShowPending) return;
    setCheckedRequestIds((prev) =>
      prev.includes(requestId) ? prev.filter((id) => id !== requestId) : [...prev, requestId]
    );
  };

  const refetchCurrentList = () => {
    fetchRequests(false, "");
  };

  const loadMoreRequests = useCallback(() => {
    if (secondaryLocationRequestsLoading) return;
    if (!secondaryLocationRequestsMeta?.hasNext) return;
    if (!secondaryLocationRequestsMeta?.nextLastId) return;

    fetchRequests(true, secondaryLocationRequestsMeta.nextLastId);
  }, [fetchRequests, secondaryLocationRequestsLoading, secondaryLocationRequestsMeta]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMoreRequests();
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
  }, [loadMoreRequests]);

  const handleSortSelect = (sortKey) => {
    if (sortKey === "none") {
      setSortBy("createdAt");
      setSortOrder("DESC");
      return;
    }

    const selectedSort = SORT_OPTIONS.find((option) => option.key === sortKey);
    if (!selectedSort) return;

    setSortBy(selectedSort.sortBy);
    setSortOrder(selectedSort.sortOrder);
  };

  const handleBulkAction = async (action) => {
    if (!checkedRequestIds.length) return;

    let rejectionReason = "";
    if (action === "reject") {
      rejectionReason = window.prompt("Please enter rejection reason", "") || "";
      if (!rejectionReason.trim()) return;
    }

    for (const requestId of checkedRequestIds) {
      await dispatch(
        reviewSecondaryLocationRequest(requestId, {
          action,
          ...(action === "reject" ? { rejectionReason: rejectionReason.trim() } : {}),
        })
      );
    }

    setCheckedRequestIds([]);
    refetchCurrentList();
  };

  const handleMonthDropdownChange = (event) => {
    const selectedLabel = event?.target?.value || "";
    const matchedOption = MONTH_OPTIONS.find((option) => option.label === selectedLabel);
    setMonth(matchedOption?.value || "");
  };

  const handleYearDropdownChange = (event) => {
    setYear(String(event?.target?.value || ""));
  };

  if (!canRead) {
    return (
      <div className="leave_requests_main_container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            You don&apos;t have permission to view secondary location requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave_requests_main_container">
      <div className="leave_requests_header" style={{ alignItems: "center" }}>
        <RequestsSubTabs
          tabs={[
            { value: "pending", label: `Pending (${pendingCount})` },
            { value: "history", label: `History (${historyCount})` },
          ]}
          activeTab={requestView}
          onTabChange={setRequestView}
        />
        <div className="secondary_location_filter_row">
          <div className="date-filter-dropdowns">
            <div className="custom-select-wrapper">
              <CustomDropdown
                options={monthDropdownOptions}
                value={selectedMonthLabel}
                onChange={handleMonthDropdownChange}
                placeholder="All Months"
                fieldName="secondaryLocationMonth"
                searchable={false}
                allowClearSelection
                clearOptionLabel="None"
                deselectOnReselect
                className="secondary-filter-dropdown"
              />
            </div>

            <div className="custom-select-wrapper">
              <CustomDropdown
                options={yearDropdownOptions}
                value={year || ""}
                onChange={handleYearDropdownChange}
                placeholder="Year"
                fieldName="secondaryLocationYear"
                searchable={false}
                allowClearSelection
                clearOptionLabel="None"
                deselectOnReselect
                className="secondary-filter-dropdown"
              />
            </div>
          </div>

          <Filter
            title="Filter"
            options={REQUEST_TYPE_FILTER_OPTIONS}
            selected={requestType ? [requestType] : []}
            onSelect={(key) => setRequestType((prev) => (prev === key ? "" : key))}
            showSearch={false}
            showTitleIcon
            showCount={false}
          />

          <Sort
            title="Sort by"
            options={SORT_OPTIONS}
            currentSort={currentSortKey}
            onSortSelect={handleSortSelect}
            isOpen={isSortOpen}
            setIsOpen={setIsSortOpen}
          />
        </div>

        {canWrite && shouldShowPending && (
          <div className="leave_requests_action_buttons">
            <button
              className={`leave_requests_approve_button ${!checkedRequestIds.length ? "disabled" : ""}`}
              onClick={() => checkedRequestIds.length && handleBulkAction("approve")}
            >
              <span>
                <img src={approve_icon} alt="Approve Icon" className="approve_icon" />
                Approve
              </span>
            </button>
            <button
              className={`leave_requests_reject_button ${!checkedRequestIds.length ? "disabled" : ""}`}
              onClick={() => checkedRequestIds.length && handleBulkAction("reject")}
            >
              <span>
                <img
                  src={!checkedRequestIds.length ? reject_icon_disable : reject_icon_enable}
                  alt="Reject Icon"
                  className="reject_icon"
                />
                Reject
              </span>
            </button>
          </div>
        )}
      </div>

      {secondaryLocationRequestsLoading && !secondaryLocationRequests?.length ? (
        <LoadingSpinner message="Loading Secondary Location Requests..." height="40vh" />
      ) : !secondaryLocationRequests?.length ? (
        <div className="no_leave_requests_message">
          {shouldShowPending
            ? "No pending secondary location requests."
            : "No request history found."}
        </div>
      ) : (
        <div className="leave_requests_table_container">
          <table className="leave_requests_table">
            <thead>
              <tr>
                {shouldShowPending && canWrite && (
                  <th className="checkbox-cell">
                    <input type="checkbox" checked={selectedAll} onChange={toggleSelectAll} />
                  </th>
                )}
                <th>Employee Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Request Type</th>
                <th>Reason</th>
                {!shouldShowPending && <th>Status</th>}
                {!shouldShowPending && <th>Comments</th>}
                {!shouldShowPending && <th>Reviewed By</th>}
              </tr>
            </thead>
            <tbody>
              {(secondaryLocationRequests || []).map((request) => {
                const isChecked = checkedRequestIds.includes(request.requestId);
                return (
                  <tr key={request.requestId} className={isChecked ? "checked-row" : ""}>
                    {shouldShowPending && canWrite && (
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRequest(request.requestId)}
                        />
                      </td>
                    )}
                    <td>{request.employeeName || "-"}</td>
                    <td>{formatDate(request.startDate)}</td>
                    <td>{formatDate(request.endDate)}</td>
                    <td>{request.durationDays || 0} Day(s)</td>
                    <td>
                      {request.requestType ? (
                        <span
                          className={`request-type-badge ${getRequestTypeBadgeClass(request.requestType)}`}
                        >
                          {request.requestType}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="reason-cell">
                      <ViewMoreText
                        text={request.reason || "-"}
                        maxLength={45}
                        modalTitle="Reason"
                        textClassName="reason-text"
                      />
                    </td>
                    {!shouldShowPending && (
                      <td>
                        {request.status ? (
                          <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                            {request.status}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}
                    {!shouldShowPending && (
                      <td className="reason-cell">
                        <ViewMoreText
                          text={request.rejectionReason || "-"}
                          maxLength={45}
                          modalTitle="Comments"
                          textClassName="reason-text"
                        />
                      </td>
                    )}
                    {!shouldShowPending && <td>{request.reviewedByName || "-"}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="sl_requests_loaded_count">
            Showing {loadedRequestCount} of {currentViewTotalCount} requests
          </p>

          <div ref={loadMoreRef} className="sl_requests_infinite_sentinel" />
          {secondaryLocationRequestsLoading && secondaryLocationRequests?.length > 0 && (
            <p className="sl_requests_loading_more">Loading more requests...</p>
          )}
          {!secondaryLocationRequestsMeta?.hasNext && secondaryLocationRequests?.length > 0 && (
            <p className="sl_requests_loading_more">No more requests</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SecondaryLocationRequests;
