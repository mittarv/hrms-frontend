import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateComponentType } from '../../../../actions/hrRepositoryAction';
import Snackbar from "../../Common/components/Snackbar";
import Info_icon from "../../assets/icons/info_icon.svg";
import './EmployeeTypeConfigurator.scss';

const DepartmentMappingTable = ({ onBack }) => {
    const dispatch = useDispatch();
    const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);
    const getAllComponentType = hrRepositoryReducer?.getAllComponentType ?? {};
    
    // Departments are the rows
    const departmentTypes = getAllComponentType?.department_type_dropdown || {};
    // Current mapping is the source of truth for the columns
    const initialMapping = getAllComponentType?.department_type_mapping || {};
    
    const [mapping, setMapping] = useState(initialMapping);
    const [hasChanges, setHasChanges] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    
    // Sync with Redux when it loads
    useEffect(() => {
        setMapping(getAllComponentType?.department_type_mapping || {});
        setHasChanges(false);
    }, [getAllComponentType?.department_type_mapping]);

    const handleCheckboxChange = (deptKey, field) => {
        setMapping(prev => ({
            ...prev,
            [deptKey]: {
                ...(prev[deptKey] || { disablesLevel: false }),
                [field]: !prev[deptKey]?.[field]
            }
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        const setFormErrors = (errObj) => setErrorMsg(errObj.global || "Failed to save mapping");
        await dispatch(updateComponentType("department_type_mapping", mapping, setSuccessMsg, setFormErrors));
        setHasChanges(false);
    };

    const departmentKeys = Object.keys(departmentTypes);

    if (departmentKeys.length === 0) {
        return (
            <div className="employee_configurator_empty_state">
                <p>No Departments configured.</p>
                <p className="empty_state_hint">Please configure Departments first before mapping behaviors.</p>
            </div>
        );
    }

    return (
        <div className="employee_configurator_table_wrap">
            <div className="employee_configurator_log_header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={onBack}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666', display: 'flex', alignItems: 'center' }}
                    >
                        &larr; Back
                    </button>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Map Department Behaviors</p>
                </div>
                <button 
                    className={`save_btn ${!hasChanges ? 'disabled' : ''}`}
                    onClick={handleSave}
                    disabled={!hasChanges}
                    style={{ padding: '8px 16px', backgroundColor: hasChanges ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: hasChanges ? 'pointer' : 'not-allowed' }}
                >
                    Save Changes
                </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: '600', fontSize: '16px' }}>
                    <img src={Info_icon} alt="Info" style={{ width: '20px', height: '20px' }} />
                    What do these settings mean?
                </div>
                <p style={{ margin: '0 0 0 28px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                    This section allows you to customize special rules for certain departments.
                </p>
                <ul style={{ margin: '8px 0 0 28px', color: '#475569', fontSize: '14px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Disable Job Level:</strong> Check this if employees in this department (like "Leadership" or "Advisors") do not use standard job levels. Their level field will be hidden during onboarding.</li>
                </ul>
            </div>

            <div className="employee_configurator_table_border" style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table className="employee_configurator_table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #E2E8F0' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#334155' }}>Department Name</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                                Disable Job Level
                                <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748B', marginTop: '4px' }}>Disables level field for this department</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {departmentKeys.map((key) => {
                            const row = mapping[key] || { disablesLevel: false };
                            return (
                                <tr key={key} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '16px', fontWeight: '500', color: '#1E293B' }}>{departmentTypes[key]}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={!!row.disablesLevel} 
                                            onChange={() => handleCheckboxChange(key, 'disablesLevel')}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#007bff' }}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {successMsg && <Snackbar message={successMsg} type="success" onClose={() => setSuccessMsg("")} />}
            {errorMsg && <Snackbar message={errorMsg} type="error" onClose={() => setErrorMsg("")} />}
        </div>
    );
};

export default DepartmentMappingTable;
