import { useState } from "react";
import "../styles/ConversionDatePopup.scss";

const ConversionDatePopup = ({
    onCancel,
    onSave
}) => {
    const [conversionDate, setConversionDate] = useState(null);
    
    return(
        <div className="joining_popup_overlay">
            <div className="joining_popup">
                <div className="joining_header">
                    Conversion Date
                </div>
                <div className="joining_body">
                    <label htmlFor="joining_popup_input">Enter Date of Conversion</label>
                    <input 
                        type="date" 
                        id="joining_popup_input"
                        onClick={(e) => e.currentTarget.showPicker()} 
                        value={conversionDate} 
                        onChange={(e) => setConversionDate(e.target.value)}
                    />
                </div>
                <div className="joining_footer">
                    <div className="joining_button_block">
                        <button className="joining_cancel_button" onClick={onCancel}>Cancel</button>
                        <button
                            className={`joining_save_button ${conversionDate ? 'save_enabled' : ''}`}
                            onClick={() => onSave(conversionDate)}
                        >Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConversionDatePopup;