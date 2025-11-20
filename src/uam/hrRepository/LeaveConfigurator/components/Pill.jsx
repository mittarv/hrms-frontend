import { useState, useEffect } from 'react';
import "../styles/Pill.scss";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const Pill = ({ data = [], multiSelect = false, onChange, selected, disabled = false, requireSelection = false }) => {
  const [localSelected, setLocalSelected] = useState(multiSelect ? [] : '');
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();
  useEffect(() => {
    if (selected !== undefined) {
      setLocalSelected(selected);
    }
  }, [selected]);
  const handleSelect = (item) => {
    if (disabled) return;
    if (item==="Unpaid" && allToolsAccessDetails?.[selectedToolName] < 900) {
      dispatch({ type: "SET_UNPAID_LEAVE_DISABLED" ,payload:true});
    }
    else{
      dispatch({ type: "SET_UNPAID_LEAVE_DISABLED" ,payload:false});
    }
    if (multiSelect) {
      // For multiSelect, prevent deselecting if it's the last item and requireSelection is true
      if (requireSelection && Array.isArray(localSelected) && localSelected.length === 1 && localSelected.includes(item)) {
        return; // not allowing deselecting the last item
      }
      
      const newSelected = Array.isArray(localSelected) 
        ? (localSelected.includes(item)
            ? localSelected.filter(i => i !== item)
            : [...localSelected, item])
        : [item];
      
      setLocalSelected(newSelected);
      onChange && onChange(newSelected);
    } else {
      // For single select, not allowing deselection if requireSelection is true
      if (requireSelection && localSelected === item) {
        return; // not allowingdeselecting the currently selected item
      }
      
      const newSelected = localSelected === item ? '' : item;
      setLocalSelected(newSelected);
      onChange && onChange(newSelected);
    }
  };

  const isItemSelected = (item) => {
    if (multiSelect) {
      return Array.isArray(localSelected) && localSelected.includes(item);
    }
    return localSelected === item;
  };

  return (
    <div className="pill-container">
      {data.map((item, index) => {
        const isSelected = isItemSelected(item);
        return (
       
          <button
            key={index}
            type="button"
            className={`pill ${disabled ? 'disabled' : isSelected ? 'selected' : ''}`}
            onClick={() => !disabled && handleSelect(item)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};

export default Pill;