import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchIconGrey from "../../assets/icons/Search_icon_grey.svg";
import PlusIcon from "../../assets/icons/Plus_icon.svg";
import EditIcon from "../../assets/icons/edit_blue_icon.svg";
import DeleteIcon from "../../assets/icons/delete_red_icon.svg";
import Filter from "../../Common/components/Filter/Filter";
import Sort from "../../Common/components/Sort";
import ConfigureLocationModal from "./ConfigureLocationModal";
import {
  createSecondaryLocationConfig,
  deleteSecondaryLocationConfig,
  fetchSecondaryLocationConfigs,
  getAllComponentTypes,
  updateSecondaryLocationConfig,
} from "../../../../actions/hrRepositoryAction";
import "../styles/ConfigurationTab.scss";

const DEFAULT_FORM = {
  location: "",
  durationInput: "",
  maximumSplitsPerYear: "",
  minimumIntimationPeriodDays: "",
  employeeTypes: [],
};

const SORT_OPTIONS = [
  { key: "durationAsc", label: "Duration (Shortest First)" },
  { key: "durationDesc", label: "Duration (Longest First)" },
  { key: "splitsAsc", label: "Splits (Ascending)" },
  { key: "splitsDesc", label: "Splits (Descending)" },
];

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 700;

const SORT_TO_API_MAP = {
  none: {
    sortBy: "createdAt",
    sortOrder: "DESC",
  },
  durationAsc: {
    sortBy: "durationWeeks",
    sortOrder: "ASC",
  },
  durationDesc: {
    sortBy: "durationWeeks",
    sortOrder: "DESC",
  },
  splitsAsc: {
    sortBy: "maximumSplitsPerYear",
    sortOrder: "ASC",
  },
  splitsDesc: {
    sortBy: "maximumSplitsPerYear",
    sortOrder: "DESC",
  },
};

const getWeeksFromInput = (input) => Number(String(input || "").trim());

const ConfigurationTab = () => {
  const dispatch = useDispatch();
  const {
    getAllComponentType,
    secondaryLocationConfigs,
    secondaryLocationConfigsMeta,
    secondaryLocationLoading,
  } = useSelector((state) => state.hrRepositoryReducer);

  const locationDropdown = useMemo(
    () => getAllComponentType?.location_dropdown || {},
    [getAllComponentType]
  );
  const employeeTypeDropdown = useMemo(
    () => getAllComponentType?.emp_type_dropdown || {},
    [getAllComponentType]
  );

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");
  const [selectedEmployeeTypes, setSelectedEmployeeTypes] = useState([]);
  const [currentSort, setCurrentSort] = useState("none");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const loadMoreRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(getAllComponentTypes());
  }, [dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchInput(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const baseQuery = useMemo(() => {
    const sortConfig = SORT_TO_API_MAP[currentSort] || SORT_TO_API_MAP.none;

    return {
      search: debouncedSearchInput,
      employeeTypes: selectedEmployeeTypes,
      sortBy: sortConfig.sortBy,
      sortOrder: sortConfig.sortOrder,
    };
  }, [debouncedSearchInput, selectedEmployeeTypes, currentSort]);

  useEffect(() => {
    dispatch(
      fetchSecondaryLocationConfigs({
        ...baseQuery,
        lastId: "",
        limit: PAGE_SIZE,
        append: false,
      })
    );
  }, [dispatch, baseQuery]);

  const loadMoreConfigs = useCallback(() => {
    if (secondaryLocationLoading) return;
    if (!secondaryLocationConfigsMeta?.hasNext) return;

    const nextLastId = secondaryLocationConfigsMeta?.nextLastId;
    if (!nextLastId) return;

    dispatch(
      fetchSecondaryLocationConfigs({
        ...baseQuery,
        lastId: nextLastId,
        limit: PAGE_SIZE,
        append: true,
      })
    );
  }, [dispatch, baseQuery, secondaryLocationLoading, secondaryLocationConfigsMeta]);

  useEffect(() => {
    const observerTarget = loadMoreRef.current;
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMoreConfigs();
        }
      },
      {
        root: null,
        rootMargin: "180px 0px",
        threshold: 0,
      }
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [loadMoreConfigs]);

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const toggleEmployeeTypeFilter = (employeeTypeKey) => {
    setSelectedEmployeeTypes((prev) =>
      prev.includes(employeeTypeKey)
        ? prev.filter((item) => item !== employeeTypeKey)
        : [...prev, employeeTypeKey]
    );
  };

  const handleOpenCreateModal = () => {
    setEditingConfigId("");
    setFormData(DEFAULT_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (config) => {
    setEditingConfigId(config.configId || "");
    setFormData({
      location: config.location || "",
      durationInput: String(Number(config.durationWeeks) || ""),
      maximumSplitsPerYear: String(Number(config.maximumSplitsPerYear) || ""),
      minimumIntimationPeriodDays: String(Number(config.minimumIntimationPeriodDays) || ""),
      employeeTypes: (config.employeeTypes || []).map((item) => item.employeeType),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingConfigId("");
    setFormErrors({});
  };

  const handleToggleFormEmployeeType = (employeeTypeKey) => {
    setFormData((prev) => ({
      ...prev,
      employeeTypes: prev.employeeTypes.includes(employeeTypeKey)
        ? prev.employeeTypes.filter((item) => item !== employeeTypeKey)
        : [...prev.employeeTypes, employeeTypeKey],
    }));
    setFormErrors((prev) => ({ ...prev, employeeTypes: "" }));
  };

  const handleModalFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    const durationWeeks = getWeeksFromInput(formData.durationInput);
    const maximumSplitsPerYear = getWeeksFromInput(formData.maximumSplitsPerYear);
    const minimumIntimationPeriodDays = getWeeksFromInput(formData.minimumIntimationPeriodDays);

    if (!formData.location) {
      nextErrors.location = "This field is required.";
    }

    if (formData.durationInput === "") {
      nextErrors.durationInput = "This field is required.";
    } else if (Number.isNaN(durationWeeks) || durationWeeks <= 0) {
      nextErrors.durationInput = "Enter a valid positive number.";
    }

    if (formData.maximumSplitsPerYear === "") {
      nextErrors.maximumSplitsPerYear = "This field is required.";
    } else if (Number.isNaN(maximumSplitsPerYear) || maximumSplitsPerYear <= 0) {
      nextErrors.maximumSplitsPerYear = "Enter a valid positive number.";
    }

    if (formData.minimumIntimationPeriodDays === "") {
      nextErrors.minimumIntimationPeriodDays = "This field is required.";
    } else if (Number.isNaN(minimumIntimationPeriodDays) || minimumIntimationPeriodDays < 0) {
      nextErrors.minimumIntimationPeriodDays = "Enter a valid number (0 or more).";
    }

    if (!formData.employeeTypes.length) {
      nextErrors.employeeTypes = "Please select at least one employee type.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveConfig = async () => {
    if (!validateForm()) {
      return;
    }

    const durationWeeks = getWeeksFromInput(formData.durationInput);
    const payload = {
      location: formData.location,
      durationWeeks,
      maximumSplitsPerYear: getWeeksFromInput(formData.maximumSplitsPerYear),
      minimumIntimationPeriodDays: getWeeksFromInput(formData.minimumIntimationPeriodDays),
      employeeTypes: formData.employeeTypes,
    };

    const response = editingConfigId
      ? await dispatch(updateSecondaryLocationConfig(editingConfigId, payload))
      : await dispatch(createSecondaryLocationConfig(payload));

    if (response?.success) {
      setIsModalOpen(false);
      setEditingConfigId("");
      setFormErrors({});
      dispatch(
        fetchSecondaryLocationConfigs({
          ...baseQuery,
          lastId: "",
          limit: PAGE_SIZE,
          append: false,
        })
      );
      return;
    }
  };

  const handleDeleteConfig = async (configId) => {
    const confirmed = window.confirm("Are you sure you want to delete this configuration?");
    if (!confirmed) return;

    const response = await dispatch(deleteSecondaryLocationConfig(configId));
    if (response?.success) {
      dispatch(
        fetchSecondaryLocationConfigs({
          ...baseQuery,
          lastId: "",
          limit: PAGE_SIZE,
          append: false,
        })
      );
      return;
    }
  };

  return (
    <div className="sl_config_container">
      <div className="sl_config_toolbar">
        <div className="sl_config_left_controls">
          <div className="sl_config_search_box">
            <img src={SearchIconGrey} alt="search" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search location"
            />
          </div>

          <Filter
            
            options={employeeTypeDropdown}
            selected={selectedEmployeeTypes}
            onSelect={toggleEmployeeTypeFilter}
          />

          <Sort
            options={SORT_OPTIONS}
            currentSort={currentSort}
            onSortSelect={(sortKey) => setCurrentSort(sortKey)}
            isOpen={isSortOpen}
            setIsOpen={setIsSortOpen}
          />
        </div>

        <button type="button" className="sl_config_primary_button" onClick={handleOpenCreateModal}>
          <img src={PlusIcon} alt="add" />
          <span>Configure Location</span>
        </button>
      </div>

      <div className="sl_config_table_wrapper">
        <table className="sl_config_table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Duration</th>
              <th>Number of Splits per Year</th>
              <th>Employee Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!secondaryLocationConfigs.length && (
              <tr>
                <td className="empty_cell" colSpan={5}>No configuration found.</td>
              </tr>
            )}

            {secondaryLocationConfigs.map((config) => (
              <tr key={config.configId}>
                <td>{locationDropdown[config.location] || config.location}</td>
                <td>{config.durationWeeks}</td>
                <td>{config.maximumSplitsPerYear}</td>
                <td>
                  {(config.employeeTypes || [])
                    .map((item) => employeeTypeDropdown[item.employeeType] || item.employeeType)
                    .join(", ") || "-"}
                </td>
                <td className="actions_col">
                  <button type="button" className="edit_link" onClick={() => handleOpenEditModal(config)}>
                    <img src={EditIcon} alt="edit" />
                    <span>Edit</span>
                  </button>
                  <button type="button" className="delete_link" onClick={() => handleDeleteConfig(config.configId)}>
                    <img src={DeleteIcon} alt="delete" />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={loadMoreRef} className="sl_config_infinite_sentinel" aria-hidden="true" />
      {secondaryLocationLoading && secondaryLocationConfigs.length > 0 && (
        <div className="sl_config_loading_more">Loading more...</div>
      )}

      <ConfigureLocationModal
        isOpen={isModalOpen}
        isEditing={Boolean(editingConfigId)}
        formData={formData}
        errors={formErrors}
        locationDropdown={locationDropdown}
        employeeTypeDropdown={employeeTypeDropdown}
        loading={secondaryLocationLoading}
        onClose={handleModalClose}
        onSave={handleSaveConfig}
        onChangeField={handleModalFieldChange}
        onToggleEmployeeType={handleToggleFormEmployeeType}
      />
    </div>
  );
};

export default ConfigurationTab;
