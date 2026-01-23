import React from 'react';
import './button.scss';

const Button = ({ label, icon , onClicked }) => {
  return (
    <button className="custom-button" onClick={onClicked}>
      {icon && <img src={icon} alt={`${label} Icon`}  className="button-icon" />}
      {label}
    </button>
  );
};

export default Button;
