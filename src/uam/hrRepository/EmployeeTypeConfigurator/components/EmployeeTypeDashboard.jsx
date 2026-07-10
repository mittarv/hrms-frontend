import  { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllComponentTypes, updateComponentType } from '../../../../actions/hrRepositoryAction';
import Add_icon from "../../assets/icons/add_icon_without_background.svg";
import Info_icon from "../../assets/icons/info_icon.svg";
import EmployeeTypeModal from './EmployeeTypeModal';
import Snackbar from "../../Common/components/Snackbar";
import ConfirmationPopup from "../../Common/components/ConfirmationPopup";
import './EmployeeTypeConfigurator.scss';

const CONFIG_TABS = [
    { id: "emp_type_dropdown", label: "Employee Type", description: "Configures employment types (e.g., Full-Time, Part-Time, Contract). Used across the HRMS for employee categorization." },
    { id: "department_type_dropdown", label: "Department", description: "Configures the departments in the organization (e.g., Engineering, HR, Sales). Used for organizational grouping." },
    { id: "level_dropdown", label: "Level", description: "Configures hierarchical levels or grades for employees (e.g., L1, L2, Junior, Senior)." },
    { id: "location_dropdown", label: "Location", description: "Configures office locations or branches where employees are based." },
    { id: "year_of_study", label: "Year of Study", description: "Configures academic years of study, typically used for interns or fresh graduates." },
    { id: "emergency_contact_relation_dropdown", label: "Emergency Contact Relation", description: "Configures the allowed relationships for an employee's emergency contacts (e.g., Spouse, Parent, Sibling)." },
    { id: "gender_type_dropdown", label: "Gender", description: "Configures the gender options available for employees (e.g., Male, Female, Other)." },
    { id: "marital_status_dropdown", label: "Marital Status", description: "Configures marital status options (e.g., Single, Married, Divorced)." }
];

const EmployeeTypeDashboard = () => {
    const dispatch = useDispatch();
    const { getAllComponentType, myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
    const { user, allToolsAccessDetails } = useSelector((state) => state.user);
    const { selectedToolName } = useSelector((state) => state.mittarvtools);

    const [activeTab, setActiveTab] = useState(CONFIG_TABS[0].id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowTooltip(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        dispatch(getAllComponentTypes());
    }, [dispatch]);

    const activeItems = useMemo(() => {
        if (getAllComponentType && getAllComponentType[activeTab]) {
            return Object.entries(getAllComponentType[activeTab]).map(([key, label]) => ({ key, label }));
        }
        return [];
    }, [getAllComponentType, activeTab]);

    const hasWriteAccess = (() => {
        const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900 || user?.userType >= 900;
        const hasUamPerm = myHrmsAccess?.permissions?.some(
            perm => perm.name === "ActiveEmployee_update" || perm.name === "EmployeeRepository_update"
        );
        return isAdmin || hasUamPerm;
    })();

    const handleSave = async (newKey, newLabel) => {
        if (!hasWriteAccess) {
            setErrorMsg("You do not have permission to modify these settings.");
            return;
        }

        const currentDropdown = { ...(getAllComponentType?.[activeTab] || {}) };

        if (!newLabel.trim()) {
            setErrorMsg("Label cannot be empty.");
            return;
        }

        currentDropdown[newKey] = newLabel;

        const setFormErrors = (errObj) => setErrorMsg(errObj.global || "An error occurred");

        await dispatch(updateComponentType(activeTab, currentDropdown, setSuccessMsg, setFormErrors));
        setIsModalOpen(false);
        setEditItem(null);
    };

    const handleDelete = async (keyToDelete) => {
        if (!hasWriteAccess) {
            setErrorMsg("You do not have permission to modify these settings.");
            return;
        }
        setItemToDelete(keyToDelete);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const currentDropdown = { ...(getAllComponentType?.[activeTab] || {}) };
        delete currentDropdown[itemToDelete];

        const setFormErrors = (errObj) => setErrorMsg(errObj.global || "An error occurred");

        await dispatch(updateComponentType(activeTab, currentDropdown, setSuccessMsg, setFormErrors));
        setItemToDelete(null);
    };

    const currentTabLabel = CONFIG_TABS.find(t => t.id === activeTab)?.label || "Configuration";

    const handleTabClick = useCallback((tabId) => {
        setActiveTab(tabId);
    }, []);

    return (
        <>
            <div className="employee_configurator_container">
                <div className="employee_configurator_heading">
                    <div className="employee_configurator_title_container">
                        <p className="employee_configurator_title">Organization settings</p>
                        <p className="employee_configurator_sub_title">Manage dropdown options used across the organization</p>
                    </div>
                    {hasWriteAccess && (
                        <button className="employee_configurator_add_button" onClick={() => { setEditItem(null); setIsModalOpen(true); }}>
                            <div>
                                <img src={Add_icon} alt="Add Icon" />
                                <p>Add {currentTabLabel}</p>
                            </div>
                        </button>
                    )}
                </div>

                <div className="employee_configurator_tabs" role="tablist">
                    {CONFIG_TABS.map((tab) => (
                        <span
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={activeTab === tab.id ? "active_tab" : "inactive_tab"}
                            aria-pressed={activeTab === tab.id}
                        >
                            <p>{tab.label}</p>
                        </span>
                    ))}
                </div>
                <hr />

                <div className="employee_configurator_tab_content">
                    {activeItems.length === 0 ? (
                        <div className="employee_configurator_empty_state">
                            <p>No {currentTabLabel} values configured yet.</p>
                            {hasWriteAccess && (
                                <p className="empty_state_hint">Click &quot;Add {currentTabLabel}&quot; to get started.</p>
                            )}
                        </div>
                    ) : (
                        <div className="employee_configurator_table_wrap">
                            <div className="employee_configurator_log_header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <p>{currentTabLabel} ({activeItems.length})</p>
                                    <div className="employee_configurator_info_icon_wrap" ref={tooltipRef}>
                                        <img 
                                            src={Info_icon} 
                                            alt="Info" 
                                            className="info_icon" 
                                            onClick={() => setShowTooltip(!showTooltip)}
                                        />
                                        {showTooltip && (
                                            <div className="employee_configurator_tooltip">
                                                {CONFIG_TABS.find(t => t.id === activeTab)?.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="employee_configurator_table_border">
                                <table className="employee_configurator_table">
                                    <thead>
                                        <tr>
                                            <th>Display Label</th>
                                            {hasWriteAccess && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeItems.map((item) => (
                                            <tr key={item.key}>
                                                <td>{item.label}</td>
                                                {hasWriteAccess && (
                                                    <td style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="employee_configurator_edit_btn"
                                                            onClick={() => { setEditItem(item); setIsModalOpen(true); }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="employee_configurator_delete_btn"
                                                            onClick={() => handleDelete(item.key)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <EmployeeTypeModal
                    onClose={() => { setIsModalOpen(false); setEditItem(null); }}
                    onSave={handleSave}
                    editItem={editItem}
                    configLabel={currentTabLabel}
                />
            )}

            <ConfirmationPopup
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                heading={`Delete ${currentTabLabel}`}
                message={`Are you sure you want to delete this configuration? This may affect employees currently assigned to this value.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
            />

            {successMsg && (
                <Snackbar message={successMsg} type="success" onClose={() => setSuccessMsg("")} />
            )}
            {errorMsg && (
                <Snackbar message={errorMsg} type="error" onClose={() => setErrorMsg("")} />
            )}
        </>
    );
};

export default EmployeeTypeDashboard;
