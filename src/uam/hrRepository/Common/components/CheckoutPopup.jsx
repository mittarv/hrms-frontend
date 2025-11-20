import { useState } from 'react';
// import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import "../styles/CheckoutPopup.scss";

const CheckoutPopup = ({ 
  isOpen, 
  outstandingDate, 
  checkInTime, 
  isLoading,
  handleOustandingCheckout,
}) => {
  const [checkOutTime, setCheckOutTime] = useState('');
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).toLowerCase();
  };

  const validateTimeInput = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleSubmit = async () => {
    setError('');

    if (!checkOutTime) {
      setError('Please enter checkout time');
      return;
    }

    if (!validateTimeInput(checkOutTime)) {
      setError('Please enter time in HH:MM format (e.g., 18:30)');
      return;
    }

    // Validate checkout is after checkin
    if (checkInTime && checkOutTime <= checkInTime) {
      setError('Checkout time must be after check-in time');
      return;
    }
    handleOustandingCheckout(checkOutTime);
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-popup-overlay">
      <div className="checkout-popup">
        <div className="checkout-popup__header">
          <div className="checkout-popup__title">
            {/* <AlertCircle className="checkout-popup__warning-icon" /> */}
            <h2>Missing Checkout</h2>
          </div>
        </div>

        <div className="checkout-popup__content">
          <div className="checkout-popup__info">
            <div className="checkout-popup__info-item">
              {/* <Calendar className="checkout-popup__icon" /> */}
              <div>
                <span className="checkout-popup__label">Date</span>
                <span className="checkout-popup__value">
                  {formatDate(outstandingDate)}
                </span>
              </div>
            </div>
            
            <div className="checkout-popup__info-item">
              {/* <Clock className="checkout-popup__icon" /> */}
              <div>
                <span className="checkout-popup__label">Check-in Time</span>
                <span className="checkout-popup__value">
                  {formatTime12Hour(checkInTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="checkout-popup__message">
            <p>You forgot to check out on this day. Please enter your checkout time to complete your attendance record.</p>
          </div>

          <div className="checkout-popup__form">
            <div className="checkout-popup__input-group">
              <label htmlFor="checkoutTime" className="checkout-popup__input-label">
                {/* <Clock size={16} /> */}
                Checkout Time
              </label>
              <input
                id="checkoutTime"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="checkout-popup__input"
                placeholder="18:30"
                disabled={isLoading}
              />
              <span className="checkout-popup__input-hint">
                Enter time in 24-hour format (e.g., 18:30)
              </span>
            </div>

            {error && (
              <div className="checkout-popup__error">
                {/* <AlertCircle size={16} /> */}
                {error}
              </div>
            )}

            <div className="checkout-popup__actions">
              <button
                onClick={handleSubmit}
                className="checkout-popup__btn checkout-popup__btn--primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="checkout-popup__spinner"></div>
                    Updating...
                  </>
                ) : (
                  'Update Checkout'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPopup;