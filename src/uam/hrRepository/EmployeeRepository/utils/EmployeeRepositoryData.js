// Government ID types for multi-field component
export const govIdTypes = [
  { value: "aadhar", label: "Aadhaar" },
  { value: "passport", label: "Passport" },
  { value: "voter_id", label: "Voter ID" },
  { value: "pan", label: "PAN" },
  { value: "driving_license", label: "Driving License" },
  { value: "others", label: "Others" },
];

export const EmployeeRepositoryTableHeader = [
  {
    label: "S.no",
    name: "sno",
  },
  {
    label: "Name",
    name: "Name",
  },
  {
    label: "Type",
    name: "Type",
  },
  {
    label: "Department",
    name: "Department",
  },
];

export const EmployeeRepositoryFormData = [
  {
    label: "Employee ID *",
    inputType: "text",
    name: "emp_company_id",
    placeholder: "Enter Employee ID",
    required: true,
    isDisabled: false,
  },
  {
    label: "Email *",
    inputType: "email",
    name: "emp_official_email",
    placeholder: "Enter Employee Email",
    required: true,
    isDisabled: false,
  },
  {
    label: "Hire Date *",
    inputType: "date",
    name: "emp_latest_hire_date",
    placeholder: "Select Hire Date",
    required: true,
    isDisabled: false,
  },
   {
    label: "Employee Type *",
    inputType: "Dropdown",
    name: "emp_type",
    placeholder: "Select Type",
    required: true,
    options: [],
    isDisabled: false,
  },
  {
    label: "Job Title *",
    inputType: "text",
    name: "emp_job_title",
    placeholder: "Enter Employee Job Title",
    required: true,
    isDisabled: false,
  },
  {
    label: "Level *",
    inputType: "Dropdown",
    name: "emp_level",
    placeholder: "Select Employee Level",
    required: true,
    options: [],
    isDisabled: false,
  },
    {
    label: "First Name *",
    inputType: "text",
    name: "emp_first_name",
    placeholder: "Enter Employee First Name",
    required: true,
    isDisabled: false,
  },
  {
    label: "Department *",
    inputType: "dropdown",
    name: "emp_department",
    placeholder: "Select Department",
    required: true,
    isDisabled: false,
  },
  {
    label: "Location *",
    inputType: "Dropdown",
    name: "emp_latest_location_state",
    placeholder: "Select Employee Location",
    required: true,
    options: [],
    isDisabled: false,
  },
  {
    label: "Last Name",
    inputType: "text",
    name: "emp_last_name",
    placeholder: "Enter Employee Last Name",
    isDisabled: false,
  },
  {
    label: "Reporting Manager",
    inputType: "dropdown",
    name: "emp_reporting_manager",
    placeholder: "Select Reporting Manager",
    isDisabled: false,
  },
  {
    label: "Annual Salary *",
    inputType: "num",
    name: "emp_latest_annual_salary",
    placeholder: "Enter Employee Annual Salary",
    required: true,
    showCountryDropdown: true,
    isDisabled: false,
  },
  {
    label: "Year of Study",
    inputType: "dropdown",
    name: "emp_year_of_study",
    placeholder: "Select Year of Study",
    isDisabled: false,
  },
  {
    label: "Is People Manager",
    inputType: "checkbox",
    name: "emp_isManger",
    placeholder: "",
    isDisabled: false,
  },
];

export const formSectionKeyValues = {
  "basic-info": "Basic Information",
  "compensation": "Compensation & Payment",
  "leaves-info": "Leaves",
  "other-info": "Other Information",
};

export const sectionFieldMapping = {
  "basic-info": [
    { name: "empType", label: "Type" },
    { name: "empFullName", label: "Full Name" },
    { name: "empFirstName", label: "First Name" },
    { name: "empLastName", label: "Last Name" },
    { name: "empOfficialEmail", label: "Email" },
    { name: "empHireDate", label: "Hire Date " },
    { name: "empCompanyId", label: "Employee ID" },
    { name: "empTitle", label: "Title" },
    { name: "empManager", label: "Reporting Manager" },
    { name: "empDepartment", label: "Department" },
    { name: "state", label: "Location" },
    { name: "empLevel", label: "Level" },
    { name: "empYearOfStudy", label: "Year of Study" },
    { name: "isManager", label: "Is Manager" },
    { name: "empConversionDate", label: "Conversion Date" },
  ],
  "compensation": [
    { name: "empAnnualSalary", label: "Annual Salary" },
    { name: "empNumberOfBonuses", label: "Number of Bonuses" },
    { name: "empCurrentAdvanceSalaryAmount", label: "Current Advance Salary" },
    { name: "empCurrentAdvanceSalaryEmi", label: "Advance Salary EMI" },
    { name: "empPanCard", label: "PAN" },
    { name: "empIFSCCode", label: "IFSC Code" },
    { name: "empAccountNumber", label: "Account Number" },
    { name: "empBenefeciaryName", label: "Beneficiary Name" },
    { name: "empPaymentCountryCode", label: "Payment Country Code" },
  ],
  "leaves-info": [
    { name: "empCasualLeave", label: "Casual Leave (balance/total)" },
    { name: "empSickLeave", label: "Sick Leave (balance/total)" },
    { name: "empStudyLeave", label: "Study Leave (balance/total)" },
    { name: "empRestrictedHoliday", label: "Restricted/Optional Holiday (balance/total)" },
    { name: "empBereavementLeave", label: "Bereavement Leave (balance/total)" }
  ],
  "other-info": [
    { name: "empOfficialPhone", label: "Phone Number" },
    { name: "empGender", label: "Gender" },
    { name: "empDob", label: "Date of Birth" },
    { name: "empPersonalPhone", label: "Personal Phone Number" },
    { name: "empPersonalEmail", label: "Personal Email Address" },
    { name: "empFatherName", label: "Father's Name" },
    { name: "empMotherName", label: "Mother's Name" },
    { name: "addressLine1", label: "Permanent Address" },
    { name: "addressLine2", label: "Current Residential address" },
    { name: "empGovId", label: "Government ID" },
    { name: "empMaritalStatus", label: "Marital Status" },
    { name: "empEmergencyContactName", label: "Emergency Contact Name" },
    { name: "empEmergencyContactNumber", label: "Emergency Contact Number" },
    { name: "empEmergencyContactRelation", label: "Emergency Contact Relation" },
    { name: "empBloodGroup", label: "Blood Group" },
    { name: "empNationality", label: "Nationality" }
  ]
};

export const formSections = [
  {
    id: "basic-info",
    title: formSectionKeyValues["basic-info"],
    fields: [
      {
        name: "empType",
        label: "Type",
        type: "select",
        options: [],
        disabled: true,
      },
      {
        name: "empFullName",
        label: "Full Name",
        type: "text",
        validationRules: {
          required: false,
          format: "alphabetic",
          maxLength: 50,
        },
        disabled: true,
      },
      {
        name: "empFirstName",
        label: "First Name",
        type: "text",
        validationRules: {
          required: false,
          maxLength: 50,
        },
        disabled: true,
      },
      {
        name: "empLastName",
        label: "Last Name",
        type: "text",
        validationRules: {
          required: false,
          maxLength: 50,
        },
        disabled: true,
      },
      {
        name: "empOfficialEmail",
        label: "Email",
        type: "email",
        validationRules: { rrequired: false, format: "validEmail" },
        disabled: true,
      },
      {
        name: "empHireDate",
        label: "Hire Date",
        type: "date",
        validationRules: { required: false, format: "validDate" },
        disabled: true,
      },
      {
        name: "empCompanyId",
        label: "Employee ID",
        type: "text",
        validationRules: { required: false, format: "alphanumeric" },
        disabled: true,
      },
      {
        name: "empTitle",
        label: "Title",
        type: "text",
        validationRules: { required: false },
        disabled: true,
      },
      {
        name: "empManager",
        label: "Reporting Manager",
        type: "select",
        options: [],
        validationRules: { required: false },
        disabled: true,
      },
      {
        name: "empDepartment",
        label: "Department",
        type: "select",
        options: [],
        validationRules: { required: false },
        disabled: true,
      },
      {
        name: "state",
        label: "Location",
        type: "select",
        options: [],
        validationRules: { required: false},
        disabled: true,
      },
      {
        name: "empLevel",
        label: "Level",
        type: "select",
        options: [],
        validationRules: { required: false },
        disabled: true,
      },
      {
        name: "empYearOfStudy",
        label: "Year of Study",
        type: "select",
        options: [],
        validationRules: { required: false },
        disabled: true,
      },
      {
        name: "isManager",
        label: "Is People Manager",
        type: "checkbox",
        validationRules: { required: false },
        disabled: true,
      },
      {
        name: "empConversionDate",
        label: "Conversion Date",
        type: "date",
        validationRules: { required: false },
        disabled: true,
      },
    ],
  },
  {
    id: "compensation",
    title: formSectionKeyValues["compensation"],
    fields: [
      {
        name: "empAnnualSalary",
        label: "Annual Salary",
        type: "num",
        validationRules: { required: false, format: "numeric" },
        disabled: true,
      },
      {
        name: "empNumberOfBonuses",
        label: "Number of Bonuses",
        type: "number",
        validationRules: { required: false, format: "numeric" },
        disabled: true,
      },
      {
        name: "empCurrentAdvanceSalaryAmount",
        label: "Current Advance Salary",
        type: "num",
        validationRules: { required: false, format: "numeric" },
        disabled: true,
      },
      {
        name: "empCurrentAdvanceSalaryEmi",
        label: "Advance Salary EMI",
        type: "number",
        validationRules: { required: false, format: "numeric" },
        disabled: true,
      },
      {
        name: "empPanCard",
        label: "PAN",
        type: "text",
        validationRules: { required: true, format: "alphanumeric" },
        // validationRules: { required: true, format: "alphanumeric", length: 10 },
      },
      {
        name: "empIFSCCode",
        label: "IFSC Code",
        type: "text",
        validationRules: { required: true, format: "validIFSC" },
      },
      {
        name: "empAccountNumber",
        label: "Account Number",
        type: "text",
        validationRules: { required: true, format: "numeric", maxLength: 20 },
      },
      {
        name: "empBenefeciaryName",
        label: "Beneficiary Name",
        type: "text",
        validationRules: { required: false, format: "alphabeticSpacesOnly" },
      },
    ],
  },
  {
    id: "salary-config",
    title: "Salary Configuration",
    fields: []
  },
  {
    id: "leaves-info",
    title: formSectionKeyValues["leaves-info"],
    fields: ["leaves"]
  },
  {
    id: "other-info",
    title: formSectionKeyValues["other-info"],
    fields: [
      {
        name: "empOfficialPhone",
        label: "Phone Number",
        type: "number",
        validationRules: { required: true, length: 10, format: "numeric" },
      },
      {
        name: "empGender",
        label: "Gender",
        type: "select",
        options: [],
        validationRules: { required: true },
        placeholder: "Select Gender",
      },
      {
        name: "empDob",
        label: "Date of Birth",
        type: "date",
        validationRules: {
          required: false,
          format: "validDate",
          pastDateOnly: true,
        },
      },
      {
        name: "empPersonalPhone",
        label: "Personal Phone Number",
        type: "number",
        validationRules: { required: false, length: 10, format: "numeric" },
      },
      {
        name: "empPersonalEmail",
        label: "Personal Email Address",
        type: "email",
        validationRules: { required: true, format: "validEmail" },
      },
      {
        name: "empFatherName",
        label: "Father's Name",
        type: "text",
        validationRules: { required: false, format: "alphabeticSpacesOnly" },
      },
      {
        name: "empMotherName",
        label: "Mother's Name",
        type: "text",
        validationRules: { required: false, format: "alphabeticSpacesOnly" },
      },
      {
        name: "addressLine1",
        label: "Permanent Address",
        type: "textarea",
        validationRules: { required: false },
      },
      {
        name: "addressLine2",
        label: "Current Residential address",
        type: "textarea",
        validationRules: { required: true },
      },
      {
        name: "empGovId",
        label: "Government ID",
        type: "multi-field",
        options: govIdTypes,
        dropdownLabel: "ID Type",
        inputLabel: "Number",
        placeholder: "Select ID type first",
        validationRules: { required: true },
      },
      {
        name: "empMaritalStatus",
        label: "Marital Status",
        type: "select",
        options: [],
        validationRules: { required: false },
        placeholder: "Select Marital Status",
      },
      {
        name: "empEmergencyContactName",
        label: "Emergency Contact Name",
        type: "text",
        validationRules: { required: true, format: "alphabeticSpacesOnly" },
      },
      {
        name: "empEmergencyContactNumber",
        label: "Emergency Contact Number",
        type: "number",
        validationRules: { required: true, length: 10, format: "numeric" },
      },
      {
        name: "empEmergencyContactRelation",
        label: "Emergency Contact Relation",
        type: "select",
        options: [],
        validationRules: { required: true },
        placeholder: "Select Relation",
      },
      {
        name: "empBloodGroup",
        label: "Blood Group",
        type: "select",
        options: [],
        validationRules: { required: false, format: "validBloodGroup" },
        placeholder: "Select Blood Group",
      },
      {
        name: "empNationality",
        label: "Nationality",
        type: "text",
        validationRules: { required: false, format: "alphabetic" },
      },
    ],
  },
];


export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" }); // Full month name
  const year = date.getFullYear();

  // Add ordinal suffix for the day
  const ordinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
      }
  };
  return `${day}${ordinalSuffix(day)} ${month} ${year}`;
};



export const salaryComponents =[
                {
                    "componentId": "66bb2a86-b79c-4004-8e4d-2b48ded9b8b0",
                    "salaryCategoryId": "3a75a88a-d443-4ce3-8e0d-61b7db56edc8",
                    "componentName": "Remote Work Allowance",
                    "componentType": "defaultAddition",
                    "amount": 5000,
                    "percentageOfBasicSalary": null,
                    "thresholdAmount": null,
                    "frequency": "one_time_key",
                    "isVariable": false,
                    "includeinLop": true,
                    "isDeleted": false,
                    "createdBy": "abhishek.anand@mittarv.com",
                    "updatedBy": "abhishek.anand@mittarv.com",
                    "effectiveFrom": null,
                    "effectiveTill": null,
                    "createdAt": "2025-09-05T11:57:39.000Z",
                    "updatedAt": "2025-09-05T11:57:39.000Z"
                },
                {
                    "componentId": "f369445b-764e-4c57-96c3-c60b6731f7fd",
                    "salaryCategoryId": "11071ac1-fffa-4587-a536-1028f03d61dd",
                    "componentName": "Bug Bash",
                    "componentType": "addition",
                    "amount": 5000,
                    "percentageOfBasicSalary": null,
                    "thresholdAmount": 10000,
                    "frequency": "one_time_key",
                    "isVariable": true,
                    "includeinLop": false,
                    "isDeleted": false,
                    "createdBy": "abhishek.anand@mittarv.com",
                    "updatedBy": "abhishek.anand@mittarv.com",
                    "effectiveFrom": "2025-01-01T00:00:00.000Z",
                    "effectiveTill": "2025-12-31T23:59:59.000Z",
                    "createdAt": "2025-09-05T12:00:29.000Z",
                    "updatedAt": "2025-09-05T12:00:29.000Z"
                }
            ];