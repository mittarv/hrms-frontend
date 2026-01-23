// HR Repository Date Utility Functions
// Separated from main utills/convertDate.js to enable HR Repository to act as a separate repository

export const convertHrRepositoryDateFormat = (inputDate) => {
  // Check if dateInput is valid
  if (!inputDate) {
    return "N/A";
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dateObj = new Date(inputDate);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date input for convertHrRepositoryDateFormat:', inputDate);
    return "Invalid Date";
  }

  const year = dateObj.getFullYear();
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  // Convert hours to 12-hour format
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  const result = `${month} ${day}, ${year} at ${formattedHours}:${String(
    minutes
  ).padStart(2, "0")}${ampm}`;
  return result;
};

export const convertHrRepositoryDateOnly = (inputDate) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dateObj = new Date(inputDate);
  const year = dateObj.getFullYear();
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  const result = `${month} ${day}, ${year}`;
  return result;
};

export const convertHrRepositoryNormalDate = (dateInput) => {
  // Check if dateInput is valid
  if (!dateInput) {
    return "N/A";
  }

  // Parse the input date string
  const dateObject = new Date(dateInput);

  // Check if the date is valid
  if (isNaN(dateObject.getTime())) {
    console.error('Invalid date input:', dateInput);
    return "Invalid Date";
  }

  // Obtain the components of the date
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(dateObject.getDate()).padStart(2, "0");

  // Form the desired date format
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

export const convertHrRepositoryMonthYear = (date) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dateObj = new Date(date);

  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${month}, ${year}`;
};

// Alias for backward compatibility (can be removed later)
export const convertDateFormat = convertHrRepositoryDateFormat;
