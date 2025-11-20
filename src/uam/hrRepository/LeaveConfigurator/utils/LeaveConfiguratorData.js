export const LeaveConfiguratorTableHeader = [
  {
    label: "Sr. No",
    name: "srNo",
  },
  {
    label: "Leave Type",
    name: "leaveType",
  },
  {
    label: "Max. Leaves Allowed",
    name: "maxLeavesAllowed",
  },
  {
    label: "Accrual Rate",
    name: "accrualRate",
    description:
      "The amount of leave an employee earns per a defined period. It determines how much leave is added to the employee’s balance.",
  },
  {
    label: "Accrual Frequency",
    name: "accrualFrequency",
    description:
      "The interval at which leave is credited to an employee’s balance. It specifies how often the accrued leave is added, such as monthly, Quarterly, Half-Yearly, or annually.",
  },
  {
    label: "Min. Notice Period",
    name: "minNoticePeriod",
    description:
      "The shortest amount of time an employee must notify their employer before taking leave.",
  },
  {
    label: "Max. Notice Period",
    name: "maxNoticePeriod",
    description:
      "The longest duration after the leave has been taken within which an employee can apply for leave.",
  },
  {
    label: "Employee Type",
    name: "employeeType",
  },
];

export const LeaveConfiguratorFormData = [
  {
    name: "leaveType",
    label: "Leave Type",
    inputType: "select_option",
    placeholder: "e.g. Casual Leave, Sick Leave, etc.",
    required: true,
    options: [],
    multiSelect: false,
    subLabel: "(Select one)"
  },
  {
    name: "employeeType",
    label: "Employee Type",
    inputType: "select_option",
    placeholder: "Select Employee Type",
    required: true,
    options: [],
    multiSelect: true,
    subLabel: "(Can select multiple)"
  },
  {
    name: "appliedGender",
    label: "Gender",
    inputType: "select_option",
    placeholder: "Select Gender",
    options: [],
    multiSelect: true,
    required: true,
    subLabel: "(Can select multiple)"
  },

  {
    name: "minimumNoticePeriod",
    label: "Minimum Leave Intimation Period",
    inputType: "textfield",
    placeholder: "e.g. 14, 3, 0, etc.",
    required: true,
    subLabel: "(In Days)",
    Description: "The shortest amount of time an employee must notify their employer before taking leave.",
  },
  {
    name: "maximumNoticePeriod",
    label: "Maximum Leave Intimation Period",
    inputType: "textfield",
    placeholder: "e.g. 0, 3, 5, etc.",
    required: true,
    subLabel: "(In Days)",
    Description: "The longest duration after the leave has been taken within which an employee can apply for leave.",
  },
  {
    name: "totalAllotedLeaves",
    label: "Total Annual Leaves",
    inputType: "textfield",
    placeholder: "e.g. 10, 15, etc.",
    required: true,
    subLabel: "(In Days)",
    Description: "The total number of leaves that can be taken in a year.",
  },
  {
    name: "continuousLeavesLimit",
    label: "Consecutive Days Limit",
    inputType: "textfield",
    placeholder: "e.g. 2, 5, etc.",
    required: true,
    subLabel: "(In Days)",
    Description: "The maximum number of consecutive days an employee can take leave.",
  },

  {
    name: "accuralFrequency",
    label: "Accrual Frequency",
    inputType: "dropdown",
    placeholder: "e.g 1, 2, 3, etc.",
    required: true,
    subLabel: "(Select one)",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    Description: "The interval at which leave is credited to an employee’s balance. It specifies how often the accrued leave is added, such as monthly, Quarterly, Half-Yearly, or annually.",
  },
  {
    name: "accuralRate",
    label: "Accrual Rate",
    inputType: "textfield",
    placeholder: "0",
    isDisabled: true,
    Description: "The amount of leave an employee earns per a defined period. It determines how much leave is added to the employee’s balance.",
  },
  {
    name: "allotAllLeaves",
    label: "Allot All Leaves",
    inputType: "checkbox",
    required: true,
    Description: "If selected, all leaves will be allotted to the employee at once.",
  },
  {
    name: "isActive",
    label: "Status",
    inputType: "select_option",
    placeholder: "Select Status",
    required: true,
    options: ["Active", "Inactive"],
    subLabel: "(Select one)",
  },
  {
    name: "additionalInformation",
    label: "Additional Information",
    inputType: "select_option",
    multiSelect: true,
    subLabel : "(Can select multiple)",
    Description: "Additional information related to the leave type.",
    options: [
      {
        name: "isProofRequired",
        label: "Proof",
        defaultChecked: false,
      },
      {
        name: "isReasonRequired",
        label: "Reason",
        defaultChecked: false,
      },
      {
        name: "isHalfDayAllowed",
        label: "Half Day",
        defaultChecked: false,
      },
      {
        name: "excludePaidWeekend",
        label: "Include Weekends",
        defaultChecked: false,
      },
    ]
  }
];