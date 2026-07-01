export const STATUS_FILTER_OPTIONS = {
  Upcoming: "Upcoming",
  Active: "Active",
  Pending: "Pending",
  Completed: "Completed",
  Rejected: "Rejected",
};

export const SORT_OPTIONS = [
  { key: "latest", label: "Latest created" },
  { key: "oldest", label: "Oldest created" },
  { key: "startAsc", label: "Start date (Earliest first)" },
  { key: "startDesc", label: "Start date (Latest first)" },
  { key: "endAsc", label: "End date (Earliest first)" },
  { key: "endDesc", label: "End date (Latest first)" },
];

export const MONTH_OPTIONS = [
  { value: "", label: "Month" },
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const endYear = currentYear + 1;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index
  );

  return ["", ...years].map((year) => ({
    value: year,
    label: year || "Year",
  }));
};

export const getSortConfig = (sortKey) => {
  switch (sortKey) {
    case "oldest":
      return { sortBy: "createdAt", sortOrder: "ASC" };
    case "startAsc":
      return { sortBy: "startDate", sortOrder: "ASC" };
    case "startDesc":
      return { sortBy: "startDate", sortOrder: "DESC" };
    case "endAsc":
      return { sortBy: "endDate", sortOrder: "ASC" };
    case "endDesc":
      return { sortBy: "endDate", sortOrder: "DESC" };
    case "latest":
    default:
      return { sortBy: "createdAt", sortOrder: "DESC" };
  }
};
