import { useEffect } from "react";
import { useSelector } from "react-redux";
import "../styles/LeaveApplicable.scss";

const LeaveApplicable = ({
  data = [],
  formData = {},
  setFormData,
  viewMode = false,
}) => {
  const { getAllComponentType } = useSelector((state) => state.hrRepositoryReducer);
  const units = ["Days", "Weeks", "Months"];
  
  const displayToKeyMap = {};
  const keyToDisplayMap = {};
  
  if (getAllComponentType?.emp_type_dropdown) {
    Object.entries(getAllComponentType.emp_type_dropdown).forEach(([key, value]) => {
      displayToKeyMap[value] = key;
      keyToDisplayMap[key] = value;
    });
  }
  
  useEffect(() => {
    const updatedFormData = { ...formData };
    let hasUpdates = false;
    
    data.forEach(label => {
      const apiKey = displayToKeyMap[label] || label;
      
      if (updatedFormData[apiKey] && !updatedFormData[apiKey].unit) {
        updatedFormData[apiKey] = {
          ...updatedFormData[apiKey],
          unit: "Days"
        };
        hasUpdates = true;
      } 
      else if (!updatedFormData[apiKey]) {
        updatedFormData[apiKey] = {
          value: "",
          unit: "Days"
        };
        hasUpdates = true;
      }
    });
    
    if (hasUpdates) {
      setFormData(updatedFormData);
    }
  }, [data, formData, setFormData, displayToKeyMap]);
  
  const handleInputChange = (label, value) => {
    const apiKey = displayToKeyMap[label] || label;
    
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      const newFormData = {
        ...formData,
        [apiKey]: {
          ...formData[apiKey],
          value: value === "" ? "" : parseInt(value, 10),
        },
      };
      setFormData(newFormData);
    }
  };

  const handleUnitSelect = (label, unit) => {
    const apiKey = displayToKeyMap[label] || label;
    
    const newFormData = {
      ...formData,
      [apiKey]: {
        ...formData[apiKey],
        unit,
      },
    };
    setFormData(newFormData);
  };

  const createPairs = (arr) => {
    const pairs = [];
    for (let i = 0; i < arr.length; i += 2) {
      pairs.push(arr.slice(i, i + 2));
    }
    return pairs;
  };

  const dataPairs = createPairs(data);

  const getValue = (label) => {
    const apiKey = displayToKeyMap[label] || label;
    return formData[apiKey] || { value: "", unit: "Days" };
  };

  return (
    <div className="time-input-container">
      {dataPairs.map((pair, rowIndex) => (
        <div key={rowIndex} className="time-input-grid-row">
          {pair.map((label) => {
            const currentData = getValue(label);
            const currentValue = currentData.value ?? "";
            const currentUnit = currentData.unit || "Days";
            
            return (
              <div key={label} className="time-input-row">
                {viewMode ? (
                  <>
                    {currentValue && currentUnit && (
                      <>
                        <div className="time-input-label">{label}</div>
                        <div className="time-input-view-pill">
                          {currentValue} {currentUnit}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="time-input-label">{label}</div>
                    <div className="time-input-value-container">
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleInputChange(label, e.target.value)}
                        className="time-input-value"
                        placeholder="0"
                      />
                    </div>
                    <div className="time-input-unit-selector">
                      {units.map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          className={`time-input-unit-option ${
                            currentUnit === unit ? "selected" : ""
                          }`}
                          onClick={() => handleUnitSelect(label, unit)}
                        >
                          {currentUnit === unit && (
                            <span className="checkmark">✓</span>
                          )}
                          {unit}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default LeaveApplicable;