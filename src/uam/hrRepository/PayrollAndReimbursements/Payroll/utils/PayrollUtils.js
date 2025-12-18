export const getAllMonthsLocale = (locale = "en-US", format = "long") => {
  const months = [];
  const ARBITRARY_YEAR = new Date().getFullYear(); // Year doesn't matter, only used for month name extraction
  for (let i = 0; i < 12; i++) {
    const date = new Date(ARBITRARY_YEAR, i, 1);
    months.push(date.toLocaleString(locale, { month: format }));
  }
  return months;
};

export const getShortMonthName = (fullMonthName) => {
  if (!fullMonthName) return "";
  const monthIndex = getAllMonthsLocale().indexOf(fullMonthName);
  const ARBITRARY_YEAR = new Date().getFullYear(); // Year doesn't matter, only used for month name extraction
  if (monthIndex !== -1) {
    const date = new Date(ARBITRARY_YEAR, monthIndex, 1);
    return date.toLocaleString("en-US", { month: "short" });
  }
  return fullMonthName;
};

export const getAllYears = () => {
  const startYear = 2025;
  const endYear = new Date().getFullYear();
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

// Sort options for payroll table
export const SORT_OPTIONS = {
  NONE: 'none',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  MONTHLY_CTC_ASC: 'monthly_ctc_asc',
  MONTHLY_CTC_DESC: 'monthly_ctc_desc',
  NET_PAY_ASC: 'net_pay_asc',
  NET_PAY_DESC: 'net_pay_desc'
};

export const SORT_DISPLAY_OPTIONS = [
  { value: SORT_OPTIONS.NONE, label: 'None' },
  { value: SORT_OPTIONS.NAME_ASC, label: 'Sort by Name (A-Z)' },
  { value: SORT_OPTIONS.NAME_DESC, label: 'Sort by Name (Z-A)' },
  { value: SORT_OPTIONS.MONTHLY_CTC_ASC, label: 'Sort by CTC (Low to High)' },
  { value: SORT_OPTIONS.MONTHLY_CTC_DESC, label: 'Sort by CTC (High to Low)' },
  { value: SORT_OPTIONS.NET_PAY_ASC, label: 'Sort by Net Pay (Low to High)' },
  { value: SORT_OPTIONS.NET_PAY_DESC, label: 'Sort by Net Pay (High to Low)' }
];

// Status filter options
export const STATUS_OPTIONS = {
  ALL: 'all',
  PENDING: 'pending',
  PAYROLL_FINALIZED: 'payroll_finalized',
  PAYROLL_GENERATED: 'payroll_generated'
};

export const STATUS_DISPLAY_OPTIONS = [
  { value: STATUS_OPTIONS.ALL, label: 'All Status' },
  { value: STATUS_OPTIONS.PENDING, label: 'Pending' },
  { value: STATUS_OPTIONS.PAYROLL_FINALIZED, label: 'Payroll Finalized' },
  { value: STATUS_OPTIONS.PAYROLL_GENERATED, label: 'Payroll Generated' }
];

// Utility function to convert monetary string to number for sorting
export const parseMonetaryValue = (value) => {
  if (!value || value === '-') return 0;
  return parseFloat(value.replace(/[₹,]/g, ''));
};

// Sorting utility functions
export const applySortToData = (data, sortOption) => {
  if (!data || data.length === 0 || sortOption === SORT_OPTIONS.NONE) {
    return data;
  }

  const sortedData = [...data];

  switch (sortOption) {
    case SORT_OPTIONS.NAME_ASC:
      return sortedData.sort((a, b) => a.name.localeCompare(b.name));
    
    case SORT_OPTIONS.NAME_DESC:
      return sortedData.sort((a, b) => b.name.localeCompare(a.name));
    
    case SORT_OPTIONS.MONTHLY_CTC_ASC:
      return sortedData.sort((a, b) => 
        parseMonetaryValue(a.monthlyCtc) - parseMonetaryValue(b.monthlyCtc)
      );
    
    case SORT_OPTIONS.MONTHLY_CTC_DESC:
      return sortedData.sort((a, b) => 
        parseMonetaryValue(b.monthlyCtc) - parseMonetaryValue(a.monthlyCtc)
      );
    
    case SORT_OPTIONS.NET_PAY_ASC:
      return sortedData.sort((a, b) => 
        parseMonetaryValue(a.netPay) - parseMonetaryValue(b.netPay)
      );
    
    case SORT_OPTIONS.NET_PAY_DESC:
      return sortedData.sort((a, b) => 
        parseMonetaryValue(b.netPay) - parseMonetaryValue(a.netPay)
      );
    
    default:
      return sortedData;
  }
};

// Status filtering utility function
export const applyStatusFilterToData = (data, statusFilter) => {
  if (!data || data.length === 0 || statusFilter === STATUS_OPTIONS.ALL) {
    return data;
  }

  return data.filter(employee => {
    const employeeStatus = employee.status.toLowerCase();
    switch (statusFilter) {
      case STATUS_OPTIONS.PENDING:
        return employeeStatus === 'pending';
      
      case STATUS_OPTIONS.PAYROLL_FINALIZED:
        return employeeStatus === 'payroll finalized';
      
      case STATUS_OPTIONS.PAYROLL_GENERATED:
        return employeeStatus === 'payroll generated';
      
      default:
        return true;
    }
  });
};

// Payroll table column definitions
export const payrollTableColumns = [
  {
    key: "checkbox",
    header: "",
    className: "checkbox-column",
    sortable: false,
  },
  {
    key: "name",
    header: "Name",
    className: "name-column",
    sortable: true,
    accessor: "name",
  },
  {
    key: "monthlyCtc",
    header: "Monthly Pay",
    className: "monthly-ctc-column",
    sortable: true,
    accessor: "monthlyCtc",
    clickable: true,
  },
  {
    key: "additions",
    header: "Additions",
    className: "additions-column",
    sortable: true,
    accessor: "additions",
    editable: true,
  },
  {
    key: "taxesDeductions",
    header: "Taxes/Deductions",
    className: "taxes-deductions-column",
    sortable: true,
    accessor: "taxesDeductions",
    editable: true,
  },
  {
    key: "deductions",
    header: "Deductions",
    className: "deductions-column",
    sortable: true,
    accessor: "deductions",
    editable: true,
  },
  {
    key: "reimbursements",
    header: "Reimbursements",
    className: "reimbursements-column",
    sortable: true,
    accessor: "reimbursements",
    editable: false,
  },
  {
    key: "netPay",
    header: "Net Pay",
    className: "net-pay-column",
    sortable: true,
    accessor: "netPay",
  },
  {
    key: "status",
    header: "Status",
    className: "status-column",
    sortable: true,
    accessor: "status",
  },
];


// Payroll Status Constants
export const Payroll_Status = { 
  PENDING: "pending",
  PAYROLL_FINALIZED: "payroll_finalized",
  PAYROLL_GENERATED: "payroll_generated"
};

// Status Display Labels
export const PAYROLL_STATUS_LABELS = {
  PENDING: "Pending",
  PAYROLL_FINALIZED: "Payroll Finalized",
  PAYROLL_GENERATED: "Payroll Generated"
};

// Component Types for Payroll
export const COMPONENT_TYPES = {
  ADDITION: 'addition',
  DEDUCTION: 'deduction',
  MONTHLY_CTC: 'monthlyCTC',
  TAXES_DEDUCTION: 'taxesDeduction'
};

// Frequency Options (Fallback - static)
export const FREQUENCY_OPTIONS = [
  { value: 'monthly_key', label: 'Monthly' },
  { value: 'annually_key', label: 'Annually' },
  { value: 'quarterly_key', label: 'Quarterly' },
  { value: 'half_yearly_key', label: 'Half Yearly' },
  { value: 'one_time_key', label: 'One Time' }
];

// Utility function to convert leave_accural_frequency to FREQUENCY_OPTIONS format
export const convertFrequencyOptionsFromAPI = (leaveAccuralFrequency) => {
  if (!leaveAccuralFrequency || typeof leaveAccuralFrequency !== 'object') {
    return FREQUENCY_OPTIONS;
  }

  return Object.entries(leaveAccuralFrequency).map(([key, value]) => ({
    value: key,
    label: Array.isArray(value) ? value[0] : value
  }));
};

// Amount Types
export const AMOUNT_TYPES = {
  FIXED: 'Fixed',
  VARIABLE: 'Variable'
};

// Currency Symbol
export const CURRENCY_SYMBOL = '₹';

// Empty Value Placeholder
export const EMPTY_VALUE = '-';

// LOP (Loss of Pay) Keywords
export const LOP_KEYWORDS = ['loss of pay', 'lop'];
