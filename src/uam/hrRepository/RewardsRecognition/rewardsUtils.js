export const formatMonthYear = (month, year) => {
  if (!month || !year) return "Current Cycle";
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

/** Previous calendar month: { month: 1-12, year } */
export const getPreviousMonthYear = (month, year) => {
  if (!month || !year) return null;
  const m = Number(month);
  const y = Number(year);
  if (m === 1) return { month: 12, year: y - 1 };
  return { month: m - 1, year: y };
};

export const formatStartsOn = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";
  const month = date.toLocaleString("en-US", { month: "long" });
  return `Starts ${day}${suffix} ${month}`;
};

/** Date 5 days before the end of the given month (1-12) and year. Used for nomination "Starts" display. */
export const getNominationStartsDate = (month, year) => {
  if (!month || !year) return null;
  const lastDay = new Date(Number(year), Number(month), 0);
  const d = new Date(lastDay);
  d.setDate(d.getDate() - 5);
  return d;
};

/** Format "Starts Xth Month Year" for the day that is 5 days before the end of the given month. */
export const formatNominationStarts = (month, year) => {
  const date = getNominationStartsDate(month, year);
  if (!date) return null;
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th";
  const monthName = date.toLocaleString("en-US", { month: "long" });
  const y = date.getFullYear();
  return `Starts ${day}${suffix} ${monthName} ${y}`;
};

/** Format date as "28th February" (no "Starts") for winners phase */
export const formatDayMonth = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";
  const month = date.toLocaleString("en-US", { month: "long" });
  return `${day}${suffix} ${month}`;
};

export const daysUntil = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Ends today";
  if (diff === 1) return "Ends in 1 Day";
  return `Ends in ${diff} Days`;
};

export const buildEmployeeName = (employee = {}) => {
  return `${employee.empFirstName || ""} ${employee.empLastName || ""}`.trim() || "N/A";
};

export const wordCount = (text) =>
  (text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
