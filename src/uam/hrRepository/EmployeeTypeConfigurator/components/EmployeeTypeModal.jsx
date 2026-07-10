import React, { useState, useEffect } from 'react';
import './EmployeeTypeConfigurator.scss';

const EmployeeTypeModal = ({ onClose, onSave, editItem, configLabel }) => {
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (editItem) {
            setLabel(editItem.label);
        }
    }, [editItem]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Auto-generate key if it's a new item (e.g. "Full Time" -> "full_time_key")
        let key = editItem?.key;
        if (!key) {
            key = label.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_key';
        }
        
        onSave(key, label);
    };

    return (
        <div className="employee_type_modal_overlay">
            <div className="employee_type_modal">
                <div className="modal_header">
                    <h3>{editItem ? `Edit ${configLabel}` : `Add New ${configLabel}`}</h3>
                    <button className="close_btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal_body">
                    <div className="form_group">
                        <label>Display Label</label>
                        <input 
                            type="text" 
                            value={label} 
                            onChange={(e) => setLabel(e.target.value)} 
                            placeholder="e.g. Full Time"
                            required
                        />
                    </div>
                    
                    {editItem && (
                        <div className="form_group">
                            <label>Key (Cannot be changed)</label>
                            <input 
                                type="text" 
                                value={editItem.key} 
                                disabled
                                className="disabled_input"
                            />
                        </div>
                    )}
                    
                    <div className="modal_footer">
                        <button type="button" className="cancel_btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save_btn">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeTypeModal;
