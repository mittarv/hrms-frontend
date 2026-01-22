import React from 'react';
import { MenuItem, Select } from '@mui/material';
import './SelectDropdown.scss';

const SelectDropdown = ({ value, onChange, options, label, className, sx }) => {
  return (
    <div className={className}>
      <label style={{ marginLeft: '20px' }}>
        {label}:
        <Select
          value={value}
          onChange={onChange}
          displayEmpty
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            ...sx,
          }}
          className='dropdown_input'
        >
          <MenuItem value=""><em>Select {label}</em></MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </label>
    </div>
  );
};

export default SelectDropdown;
