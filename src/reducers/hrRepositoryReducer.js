import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  allEmployees: [],
  allEmployeesLoading: false,
  getAllComponentType: [],
  payrollLevels: [],
  payrollLevelsLoading: false,
  payrollLevelsMutationLoading: false,
  payrollLevelsError: null,
  isEdit: false,
  isAddPeople: false,
  isEmployeeDetailsPage: false,
  snackbarMessage: "",
  currentEmployeeDetails:[],
  currentEmployeeDirectoryDetails: [],
  currentEmployeeDirectoryDetailsLoading: false,
  getAllManagersDetails: [],
  viewProfilePage: false,
  allEmployeesBirthday: [],
  allEmployeesAnniversary: {}, // { workAnniversary12Month: [], workAnniversary14Month: [] }
  allExisitingLeaves: [],
  allLeavesLoading: false,
  currentLeaveDetails: [],
  isCurrentLeaveDetails: false,
  isCurrentLeaveDeatilsView: false,
  getAllCountries: [],
  snackbarSeverity: "info",
  snackbarOpen: false,
  pendingRequests: [],
  processedRequests: [],
  leaveCreatedSuccess: false,
  leaveUpdateSuccess: false,
  unpaidLeaveDisabled: false,
  empHolidays: [],
  message: '',
  severity: 'info',
  isOpen: false,
  employeeAttendanceData: [],
  setAttendanceYear: "",
  setAttendanceMonth: "",
  leavePendingRequests: [],
  leaveHistoryRequests:[],
  employeeLeaveHistory: [],
  balanceDetails:[],
  showCalendarAndTable: false,
  employeesOnLeave: [],
  cdlData: [],
  checkInCheckOutStatus: [],
  outStandingCheckOut: [],
  myUpdates: [],
  organizationUpdates: [],
  empFiscalYear:"",
  attendanceLogsLoading: false,
  accrualLeaveBalance: [],
  accrualLeaveBalanceLoading: false,
  defaultComponents: [],
  globalComponents: [],
  salaryConfigLoading: false,
  isSalaryConfigEditing: false,
  showResetButton: false,
  showDefaultTables: false,
  salaryTableData: {},
  salarySaveData: {
    createData: [],
    editData: [],
    deletedData: []
  },
  selectedDropdownOptions: {},
  payrollData: [],
  payrollNotFetchedEmployees: [],
  payrollLoading: false,
  payrollError: null,
  payrollPagination: {
    currentPage: 1,
    pageSize: 20,
    totalRecords: 0,
    totalPages: 0
  },
  payrollFilters: {
    selectedMonth: null,
    selectedYear: null,
    selectedSortOption: "none",
    selectedStatusFilter: "all",
    searchQuery: "",
  },
  isAllPayrollFinalized: false,
  isAllPayrollGenerated: false,
  payslipFilter: {
    selectedPayslipYear: null,
  },
  payslipData: [],
  payslipLoading: false,
  payslipError: null,
  netPayPayrollAmount:0,
  extraWorkLogLoading: false,
  extraWorkLogRequestsData: [],
  extraWorkLogRequestsHistoryData:[],
  compOffleaveBalance: [],
  compOffLeaveEligibility: null,
  compOffLeaveEligibilityLoading: false,

  employeeExtraWorkHistory:[],

  hrmsAccessRoles: [],
  hrmsAccessPermissions: [],
  hrmsAccessRole: null,
  employeeRoles: [],
  myHrmsAccess: [],

  myHrmsAccessLoaded: false,
  offboardingLoading: false,
  offboardingInitiatedEmployeeDetails: [],
  offboardingInitiatedEmployeeDetailsLoading: false,
  offboardingInitiatedEmployeeDetailsError: null,
  hrClearanceLoading: false,
  financeClearanceLoading: false,
  setLastWorkingDayLoading: false,
  approveOffboardingLoading: false,
  getAllOffboardedEmployeesLoading: false,
  offboardedEmployees: [],

  // Rewards & Recognition
secondaryLocationOverview: null,
  secondaryLocationLogs: [],
  secondaryLocationLogsMeta: {
    page: 1,
    limit: 10,
    total: 0,
    nextLastId: null,
    hasNext: false,
  },
  secondaryLocationConfigs: [],
  secondaryLocationRequests: [],
  secondaryLocationConfigsMeta: {
    limit: 10,
    nextLastId: null,
    hasNext: false,
  },
  secondaryLocationRequestsMeta: {
    pendingCount: 0,
    historyCount: 0,
    totalCount: 0,
    limit: 20,
    nextLastId: null,
    hasNext: false,
  },
  secondaryLocationLoading: false,
  secondaryLocationRequestsLoading: false,

  rewardsDashboardLoading: false,
  rewardsDashboardData: null,
  rewardsDashboardError: null,
  rewardsCurrentCycle: null,
  rewardsCurrentCycleLoading: false,
  rewardsEmployeeSearchResults: [],
  rewardsNominateLoading: false,
  rewardsCycleNominations: [],
  rewardsCycleNominationsLoading: false,
  rewardsVotingList: [],
  rewardsVotingListLoading: false,
  rewardsVotedNomineeEmpUuid: null,
  rewardsMyCitations: [],
  rewardsMyCitationsLoading: false,
  rewardsPastReceivedCitations: [],
  rewardsPastReceivedCitationsLoading: false,
  rewardsPastReceivedCitationsLoaded: false,
  rewardsPastReceivedCitationsLoadedYear: null,
  rewardsNomineeCitations: null,
  rewardsNomineeCitationsLoading: false,
  rewardsNomineesForAnnounce: [],
  rewardsNomineesForAnnounceLoading: false,
  rewardsPhaseActionLoading: false,
  rewardsPhaseActionError: null,
  rewardsReviewNominees: [],
  rewardsReviewNomineesLoading: false,
  // UI State
  nominationModalOpen: false,
  votingModalOpen: false,
  manageCitationsModalOpen: false,
  manageCitationsModalData: null,
  announceWinnersModalOpen: false,
};

export const hrRepositoryReducer = createReducer(initialState, (builder) => {
  builder
  .addCase('FETCH_ALL_IMPORTANT_LINKS', (state) => {
    state.loading = true;
  })
  .addCase('FETCH_ALL_IMPORTANT_LINKS_SUCCESS', (state, action) => {
    state.loading = false;
    state.importantLink = action.payload;
  })
  .addCase('FETCH_ALL_IMPORTANT_LINKS_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('FETCH_ALL_POLICY_DOCUMENTS', (state) => {
    state.loading = true;
  })
  .addCase('FETCH_ALL_POLICY_DOCUMENTS_SUCCESS', (state, action) => {
    state.loading = false;
    state.policy = action.payload;
  })
  .addCase('FETCH_ALL_POLICY_DOCUMENTS_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('ADD_NEW_POLICY', (state) => {
    state.loading = true;
  })
  .addCase('ADD_NEW_POLICY_SUCCESS', (state) => {
    state.loading = false;
    state.isPolicyAdded = true;
    state.message = "Policy Added Successfully";
  })
  .addCase('ADD_NEW_POLICY_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('UPDATE_POLICY', (state) => {
    state.loading = true;
  })
  .addCase('UPDATE_POLICY_SUCCESS', (state) => {
    state.loading = false;
    state.isPolicyUpdated = true;
    state.message = "Policy Updated Successfully";
  })
  .addCase('UPDATE_POLICY_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('DELETE_POLICY', (state) => {
    state.loading = true;
  })
  .addCase('DELETE_POLICY_SUCCESS', (state) => {
    state.loading = false;
    state.isPolicyDeleted = true;
  })
  .addCase('DELETE_POLICY_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('CLEAR_STATE_DATA', (state) => {
    state.isPolicyAdded = false;
    state.isPolicyUpdated = false;
    state.isPolicyDeleted = false;
    state.error = null;
  })
  .addCase('ADD_NEW_IMPORTANT_LINK', (state) => {
    state.loading = true;
  })
  .addCase('ADD_NEW_IMPORTANT_LINK_SUCCESS', (state) => {
    state.loading = false;
    state.isImportantLinkAdded = true;
    state.message = "Important Link Added Successfully";
  })
  .addCase('ADD_NEW_IMPORTANT_LINK_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('UPDATE_IMPORTANT_LINK', (state) => {
    state.loading = true;
  })
  .addCase('UPDATE_IMPORTANT_LINK_SUCCESS', (state) => {
    state.loading = false;
    state.isImportantLinkUpdated = true;
    state.message = "Important Link Updated Successfully";
  })
  .addCase('UPDATE_IMPORTANT_LINK_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('DELETE_IMPORTANT_LINK', (state) => {
    state.loading = true;
  })
  .addCase('DELETE_IMPORTANT_LINK_SUCCESS', (state) => {
    state.loading = false;
    state.isImportantLinkDeleted = true;
  })
  .addCase('DELETE_IMPORTANT_LINK_FAILED', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('CLEAR_STATE_DATA_LINK', (state) => {
    state.isImportantLinkAdded = false;
    state.isImportantLinkUpdated = false;
    state.isImportantLinkDeleted = false;
    state.error = null;
    state.message = null;
  })
  .addCase('SET_EDIT_MODE', (state) => {
    state.isEdit = true;
  })
  .addCase('RESET_EDIT_MODE', (state) => {
    state.isEdit = false;
  })
  .addCase('SET_ADD_PEOPLE_MODE', (state) => {
    state.isAddPeople = true;
  })
  .addCase('RESET_ADD_PEOPLE_MODE', (state) => {
    state.isAddPeople = false;
  })
  .addCase('GET_ALL_COMPONENT_TYPES', (state) => {
    state.loading = true;
  })
  .addCase('GET_ALL_COMPONENT_TYPES_SUCCESS', (state, action) => {
    state.loading = false;
    state.getAllComponentType = action.payload;
  })
  .addCase('GET_ALL_COMPONENT_TYPES_FAILURE', (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  .addCase('GET_PAYROLL_LEVELS_REQUEST', (state) => {
    state.payrollLevelsLoading = true;
    state.payrollLevelsError = null;
  })
  .addCase('GET_PAYROLL_LEVELS_SUCCESS', (state, action) => {
    state.payrollLevelsLoading = false;
    state.payrollLevels = action.payload;
  })
  .addCase('GET_PAYROLL_LEVELS_FAILURE', (state, action) => {
    state.payrollLevelsLoading = false;
    state.payrollLevelsError = action.payload;
  })
  .addCase('CREATE_PAYROLL_LEVEL_REQUEST', (state) => {
    state.payrollLevelsMutationLoading = true;
    state.payrollLevelsError = null;
  })
  .addCase('CREATE_PAYROLL_LEVEL_SUCCESS', (state) => {
    state.payrollLevelsMutationLoading = false;
  })
  .addCase('CREATE_PAYROLL_LEVEL_FAILURE', (state, action) => {
    state.payrollLevelsMutationLoading = false;
    state.payrollLevelsError = action.payload;
  })
  .addCase('UPDATE_PAYROLL_LEVEL_REQUEST', (state) => {
    state.payrollLevelsMutationLoading = true;
    state.payrollLevelsError = null;
  })
  .addCase('UPDATE_PAYROLL_LEVEL_SUCCESS', (state) => {
    state.payrollLevelsMutationLoading = false;
  })
  .addCase('UPDATE_PAYROLL_LEVEL_FAILURE', (state, action) => {
    state.payrollLevelsMutationLoading = false;
    state.payrollLevelsError = action.payload;
  })
      .addCase('SET_EMPLOYEES_DETAILS_PAGE', (state) => {
        state.isEmployeeDetailsPage = true;
      })
      .addCase('RESET_EMPLOYEES_DETAILS_PAGE', (state) => {
        state.isEmployeeDetailsPage = false;
      })
      .addCase('SET_SNACKBAR_MESSAGE', (state, action) => {
        state.snackbarMessage = action.payload;
        state.snackbarSeverity = action.severity || "info";
        state.snackbarOpen = action.payload !== ""; 
      })
      .addCase('GET_ALL_EMPLOYEE', (state,) => {
        state.allEmployeesLoading = true;
      })
      .addCase('GET_ALL_EMPLOYEE_SUCCESS', (state, action) => {
        state.allEmployeesLoading = false;
        state.allEmployees = action.payload;
      })
      .addCase('GET_ALL_EMPLOYEE_FAILURE', (state, action) => {
        state.allEmployeesLoading = false;
        state.error = action.payload;
      })
      .addCase('GET_CURRENT_EMPLOYEE_DETAILS', (state) => {
        state.currentEmployeeDetailsLoading = true;
        state.currentEmployeeDetails = [];
      })
      .addCase('GET_CURRENT_EMPLOYEE_DETAILS_SUCCESS', (state, action) => {
        state.currentEmployeeDetailsLoading = false;
        state.currentEmployeeDetails = action.payload;
      })
      .addCase('GET_CURRENT_EMPLOYEE_DETAILS_FAILURE', (state, action) => {
        state.currentEmployeeDetailsLoading = false;
        state.error = action.payload;
      })
      .addCase('GET_EMPLOYEE_DIRECTORY_DETAILS', (state) => {
        state.currentEmployeeDirectoryDetailsLoading = true;
        state.currentEmployeeDirectoryDetails = [];
      })
      .addCase('GET_EMPLOYEE_DIRECTORY_DETAILS_SUCCESS', (state, action) => {
        state.currentEmployeeDirectoryDetailsLoading = false;
        state.currentEmployeeDirectoryDetails = action.payload;
      })
      .addCase('GET_EMPLOYEE_DIRECTORY_DETAILS_FAILURE', (state, action) => {
        state.currentEmployeeDirectoryDetailsLoading = false;
        state.error = action.payload;
      })
      .addCase('EMPLOYEE_ONBOARDING_DETAILS', (state) => {
        state.loading = true;
      })
      .addCase('EMPLOYEE_ONBOARDING_DETAILS_SUCCESS', (state, action) => {
        state.loading = false;
        state.employeeOnboardingDetails = action.payload;
      })
      .addCase('EMPLOYEE_ONBOARDING_DETAILS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('EMPLOYEE_DETAILS_UPDATE', (state) => {
        state.loading = true;
      })
      .addCase('EMPLOYEE_DETAILS_UPDATE_SUCCESS', (state) => {
        state.loading = false;
      })
      .addCase('EMPLOYEE_DETAILS_UPDATE_FAILURE', (state) => {
        state.loading = false;
      })
      .addCase('GET_ALL_MANAGER_DETAILS', (state) => {
        state.loading = true;
      })
      .addCase('GET_ALL_MANAGER_DETAILS_SUCCESS', (state, action) => {
        state.loading = false;
        state.getAllManagersDetails = action.payload;
      })
      .addCase('GET_ALL_MANAGER_DETAILS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('SET_VIEW_PROFILE_PAGE', (state) => {
        state.viewProfilePage = true;
      })
      .addCase('RESET_VIEW_PROFILE_PAGE', (state) => {
        state.viewProfilePage = false;
      })
      .addCase('GET_ALL_EMPLOYEE_BIRTHDAY_SUCCESS', (state, action) => {
        state.loading = false;
        state.allEmployeesBirthday = action.payload;
      })
      .addCase('GET_ALL_EMPLOYEE_ANNIVERSARY_SUCCESS', (state, action) => {
        state.loading = false;
        state.allEmployeesAnniversary = action.payload;
      })
      .addCase('GET_ALL_EMPLOYEE_BIRTHDAY_AND_ANNIVERSARY_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_ALL_EMPLOYEE_BIRTHDAY_AND_ANNIVERSARY', (state) => {
        state.loading = true;
      })
      .addCase('GET_ALL_LEAVE_DETAILS', (state) => {
        state.allLeavesLoading = true;
      })
      .addCase('GET_ALL_LEAVE_DETAILS_SUCCESS', (state, action) => {
        state.allLeavesLoading = false;
        state.allExisitingLeaves = action.payload;
      })
      .addCase('GET_ALL_LEAVE_DETAILS_FAILURE', (state, action) => {
        state.allLeavesLoading = false;
        state.error = action.payload;
      })
      .addCase('CREATE_LEAVE', (state) => {
        state.loading = true;
      })
      .addCase('CREATE_LEAVE_SUCCESS', (state) => {
        state.loading = false;
        state.message = "Leave Created Successfully";
      })
      .addCase('CREATE_LEAVE_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_CURRENT_LEAVE_DETAILS', (state) => {
        state.loading = true;
      })
      .addCase('GET_CURRENT_LEAVE_DETAILS_SUCCESS', (state, action) => {
        state.loading = false;
        state.currentLeaveDetails = action.payload;
      })
      .addCase('GET_CURRENT_LEAVE_DETAILS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('SET_LEAVE_DETAILS_PAGE', (state) => {
        state.isCurrentLeaveDetails = true;
      })
      .addCase('RESET_LEAVE_DETAILS_PAGE', (state) => {
        state.isCurrentLeaveDetails = false;
      })
      .addCase('SET_LEAVE_VIEW_PAGE', (state) => {
        state.isCurrentLeaveDeatilsView = true;
      })
      .addCase('RESET_LEAVE_VIEW_PAGE', (state) => {
        state.isCurrentLeaveDeatilsView = false;
      })
      .addCase('UPDATED_CURRENT_LEAVE_DETAILS', (state) => {
        state.loading = true;
      })
      .addCase('UPDATED_CURRENT_LEAVE_DETAILS_SUCCESS', (state, action) => {
        state.loading = false;
        state.currentLeaveDetails = action.payload;
      })
      .addCase('UPDATED_CURRENT_LEAVE_DETAILS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_ALL_COUNTRIES_DETAILS', (state) => {
        state.loading = true;
      })
      .addCase('GET_ALL_COUNTRIES_DETAILS_SUCCESS', (state, action) => {
        state.loading = false;
        const allCountries = action.payload.map((country) => ({
          ...country,
          countryFlagSvg: `data:image/svg+xml;base64,${country?.countryFlagSvg}`,
          key: country.countryIsoCode     // Ensure each country has a unique key
        }));
        state.getAllCountries = allCountries;
      })
      .addCase('GET_ALL_COUNTRIES_DETAILS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('SEND_CHANGES_TO_APPROVER_SUCCESS', (state) => {
        state.loading = false;
        state.message = "Changes Sent Successfully";
      })
      .addCase('SEND_CHANGES_TO_APPROVER_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('SEND_CHANGES_TO_APPROVER', (state) => {
        state.loading = true;
      })
      .addCase('GET_PENDING_REQUESTS_SUCCESS', (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
      })
      .addCase('GET_PENDING_REQUESTS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_PENDING_REQUESTS', (state) => {
        state.loading = true;
      })
      .addCase('GET_PROCESSED_REQUESTS_SUCCESS', (state, action) => {
        state.loading = false;
        state.processedRequests = action.payload;
      })
      .addCase('GET_PROCESSED_REQUESTS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_PROCESSED_REQUESTS', (state) => {
        state.loading = true;
      })
      .addCase('APPROVE_OR_REJECT_REQUEST_SUCCESS', (state) => {
        state.loading = false;
        state.message = "Request Approved Successfully";
      })
      .addCase('APPROVE_OR_REJECT_REQUEST_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('APPROVE_OR_REJECT_REQUEST', (state) => {
        state.loading = true;
      })
      .addCase('SET_LEAVE_CREATED_SUCCESS', (state, action) => {
        state.leaveCreatedSuccess = action.payload;
        state.loading = false;
      })
      .addCase('SET_LEAVE_UPDATE_SUCCESS', (state, action) => {
        state.leaveUpdateSuccess = action.payload;
        state.loading = false;
      })
      .addCase('SET_UNPAID_LEAVE_DISABLED', (state,action) => {
        state.unpaidLeaveDisabled =action.payload;
      })
      .addCase('GET_EMP_HOLIDAY_SUCCESS', (state, action) => {
        state.loading = false;
        state.empHolidays = action.payload;
      })
      .addCase('GET_EMP_HOLIDAY_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_EMP_HOLIDAY', (state) => {
        state.loading = true;
      })
      .addCase('CREATE_HOLIDAY_SUCCESS', (state, action) => {
        state.loading = false;
        state.leaveType = action.payload;
      })
      .addCase('CREATE_HOLIDAY_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('CREATE_HOLIDAY_TYPE', (state) => {
        state.loading = true;
      })
      .addCase('DELETE_HOLIDAY_TYPE', (state) => {
        state.loading = true;
      })
      .addCase('DELETE_HOLIDAY_SUCCESS', (state, action) => {
        state.loading = false;
        state.leaveType = action.payload;
      })
      .addCase('DELETE_HOLIDAY_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('UPDATE_HOLIDAY_TYPE', (state) => {
        state.loading = true;
      })
      .addCase('UPDATE_HOLIDAY_SUCCESS', (state, action) => {
        state.loading = false;
        state.leaveType = action.payload;
      })
      .addCase('UPDATE_HOLIDAY_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('SET_NEW_SNACKBAR_MESSAGE', (state, action) => {
        state.message = action.payload.message || action.payload;
        state.severity = action.payload.severity || "info";
        state.isOpen = true;
      })
      .addCase('CLEAR_NEW_SNACKBAR_MESSAGE', (state) => {
        state.message = "";
        state.severity = "info";
        state.isOpen = false;
      })
      .addCase('CREATE_ATTENDANCE_LOG', (state) => {
        state.loading = true;
      })
      .addCase('CREATE_ATTENDANCE_LOG_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Attendance Log Created Successfully";
      })
      .addCase('CREATE_ATTENDANCE_LOG_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Create Attendance Log";
      })
      .addCase('GET_ATTENDANCE_LOGS', (state) => {
          state.attendanceLogsLoading = true;
      })
      .addCase('GET_ATTENDANCE_LOGS_SUCCESS', (state, action) => {
        state.attendanceLogsLoading = false;
        state.employeeAttendanceData = action.payload;
      })
      .addCase('GET_ATTENDANCE_LOGS_FAILURE', (state, action) => {
        state.attendanceLogsLoading = false;
        state.error = action.payload;
      })
      .addCase('SET_ATTENDANCE_YEAR', (state, action) => {
        state.setAttendanceYear = action.payload;
      })
      .addCase('SET_ATTENDANCE_MONTH', (state, action) => {
        state.setAttendanceMonth = action.payload;
      })
      .addCase('GET_ALL_PENDING_LEAVE_REQUESTS', (state) => {
        state.loading = true;
      })
      .addCase('GET_ALL_PENDING_LEAVE_REQUESTS_SUCCESS', (state, action) => {
        state.loading = false;
        state.leavePendingRequests = action.payload;
      })
      .addCase('GET_ALL_PENDING_LEAVE_REQUESTS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_ALL_HISTORY_LEAVE_REQUESTS', (state) => {
        state.loading = true;
      })
      .addCase('GET_ALL_HISTORY_LEAVE_REQUESTS_SUCCESS', (state, action) => {
        state.loading = false;
        state.leaveHistoryRequests = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase('GET_ALL_HISTORY_LEAVE_REQUESTS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('TRIGGER_PROOF_REQUIRED_FOR_LEAVE', (state) => {
        state.loading = true;
      })
      .addCase('TRIGGER_PROOF_REQUIRED_FOR_LEAVE_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Proof Required Triggered Successfully";
      })
      .addCase('TRIGGER_PROOF_REQUIRED_FOR_LEAVE_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Trigger Proof Required";
      })
      .addCase('GET_EMPLOYEE_LEAVE_HISTORY', (state) => {
        state.loading = true;
      })
      .addCase('GET_EMPLOYEE_LEAVE_HISTORY_SUCCESS', (state, action) => {
        state.loading = false;
        state.employeeLeaveHistory = action.payload;
      })
      .addCase('GET_EMPLOYEE_LEAVE_HISTORY_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('UPLOAD_PROOF_DOCUMENTS', (state) => {
        state.loading = true;
      })
      .addCase('UPLOAD_PROOF_DOCUMENTS_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Proof Documents Uploaded Successfully";
      })
      .addCase('UPLOAD_PROOF_DOCUMENTS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Upload Proof Documents";
      })
      .addCase('REVIEW_LEAVE_REQUEST', (state) => {
        state.loading = true;
      })
      .addCase('REVIEW_LEAVE_REQUEST_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Leave Request Reviewed Successfully";
      })
      .addCase('REVIEW_LEAVE_REQUEST_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Review Leave Request";
      })
      .addCase('GET_EMPLOYEE_LEAVE_BALANCE', (state) => {
        state.loading = true;
      })
      .addCase('GET_EMPLOYEE_LEAVE_BALANCE_SUCCESS', (state, action) => {
        state.loading = false;
        state.balanceDetails = action.payload.balanceDetails;
        state.empFiscalYear = action.payload || "";
      })
      .addCase('GET_EMPLOYEE_LEAVE_BALANCE_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('DELETE_EMPLOYEE_ATTENDANCE_LOG', (state) => {
        state.loading = true;
      })
      .addCase('DELETE_EMPLOYEE_ATTENDANCE_LOG_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Attendance Log Deleted Successfully";
      })
      .addCase('DELETE_EMPLOYEE_ATTENDANCE_LOG_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Delete Attendance Log";
      })
      .addCase('SET_SHOW_CALENDAR_AND_TABLE', (state, action) => {
        state.showCalendarAndTable = action.payload;
      })
      .addCase('UPDATE_EMPLOYEE_ATTENDANCE_LOG', (state) => {
        state.loading = true;
      })
      .addCase('UPDATE_EMPLOYEE_ATTENDANCE_LOG_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Attendance Log Updated Successfully";
      })
      .addCase('UPDATE_EMPLOYEE_ATTENDANCE_LOG_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Update Attendance Log";
      })
      .addCase('GET_EMPLOYEE_ON_LEAVE', (state) => {
        state.loader = true;
      })
      .addCase('GET_EMPLOYEE_ON_LEAVE_SUCCESS', (state, action) => {
        state.loader = false;
        state.employeesOnLeave = action.payload;
      })
      .addCase('GET_EMPLOYEE_ON_LEAVE_FAILURE', (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })
      .addCase('CHECK_CDL_LIMIT', (state) => {
        state.cdlLoading = true;
      })
      .addCase('CHECK_CDL_LIMIT_SUCCESS', (state, action) => {
        state.cdlLoading = false;
        state.cdlData = action.payload;
      })
      .addCase('CHECK_CDL_LIMIT_FAILURE', (state, action) => {
        state.cdlLoading = false;
        state.error = action.payload;
      })
      .addCase('GET_CHECK_IN_CHECK_OUT_STATUS', (state) => {
        state.loading = true;
      })
      .addCase('GET_CHECK_IN_CHECK_OUT_STATUS_SUCCESS', (state, action) => {
        state.loading = false;
        state.checkInCheckOutStatus = action.payload;
      })
      .addCase('GET_CHECK_IN_CHECK_OUT_STATUS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('EMPLOYEE_CHECK_IN', (state) => {
        state.loading = true;
      })
      .addCase('EMPLOYEE_CHECK_IN_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Check-In Successful";
      })
      .addCase('EMPLOYEE_CHECK_IN_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Check-In Failed";
      })
      .addCase('EMPLOYEE_CHECK_OUT', (state) => {
        state.loading = true;
      })
      .addCase('EMPLOYEE_CHECK_OUT_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Check-Out Successful";
      })
      .addCase('EMPLOYEE_CHECK_OUT_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Check-Out Failed";
      })
      .addCase('CHECK_OUTSTANDING_CHECKOUT', (state) => {
        state.loading = true;
      })
      .addCase('CHECK_OUTSTANDING_CHECKOUT_SUCCESS', (state, action) => {
        state.loading = false;
        state.outStandingCheckOut = action.payload || "Outstanding Check-Out Processed Successfully";
      })
      .addCase('CHECK_OUTSTANDING_CHECKOUT_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Process Outstanding Check-Out";
      })
      .addCase('UPDATE_EMPLOYEE_OUTSTANDING_CHECKOUT', (state) => {
        state.loading = true;
      })
      .addCase('UPDATE_EMPLOYEE_OUTSTANDING_CHECKOUT_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Outstanding Check-Out Updated Successfully";
      })
      .addCase('UPDATE_EMPLOYEE_OUTSTANDING_CHECKOUT_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to Update Outstanding Check-Out";
      })
      .addCase('GET_CURRENT_EMPLOYEE_NOTIFICATIONS', (state) => {
        state.loading = true;
      })
      .addCase('GET_CURRENT_EMPLOYEE_NOTIFICATIONS_SUCCESS', (state, action) => {
        state.loading = false;
        state.myUpdates = action.payload.myUpdates || [];
        state.organizationUpdates = action.payload.organizationUpdates || [];
      })
      .addCase('GET_CURRENT_EMPLOYEE_NOTIFICATIONS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_LEAVE_BALANCE_WITH_ACCRUAL', (state) => {
        state.accrualLeaveBalanceLoading = true;
      })
      .addCase('GET_LEAVE_BALANCE_WITH_ACCRUAL_SUCCESS', (state, action) => {
        state.accrualLeaveBalanceLoading = false;
        state.accrualLeaveBalance = action.payload.leaveBalance;
        state.accrualFiscalYearInfo = action.payload.fiscalYearInfo;
      })
      .addCase('GET_LEAVE_BALANCE_WITH_ACCRUAL_FAILURE', (state, action) => {
        state.accrualLeaveBalanceLoading = false;
        state.error = action.payload;
      })
      .addCase('GET_SALARY_CONFIG', (state) => {
        state.salaryConfigLoading = true;
      })
      .addCase('GET_DEFAULT_SALARY_COMPONENTS_SUCCESS', (state, action) => {
        state.salaryConfigLoading = false;
        state.defaultComponents = action.payload;
      })
      .addCase('GET_GLOBAL_SALARY_COMPONENTS_SUCCESS', (state, action) => {
        state.salaryConfigLoading = false;
        state.globalComponents = action.payload;
      })
      .addCase('GET_SALARY_CONFIG_FAILURE', (state, action) => {
        state.salaryConfigLoading = false;
        state.error = action.payload;
      })
      .addCase('SET_SALARY_CONFIG_EDITING', (state, action) => {
        state.isSalaryConfigEditing = action.payload;
      })
      .addCase('SET_SHOW_RESET_BUTTON', (state, action) => {
        state.showResetButton = action.payload;
      })
      .addCase('SET_SHOW_DEFAULT_TABLES', (state, action) => {
        state.showDefaultTables = action.payload;
      })
      .addCase('UPDATE_SALARY_TABLE_DATA', (state, action) => {
        const { tableType, data, categoryDetails } = action.payload;
        state.salaryTableData[tableType] = {
          data,
          categoryDetails
        };
      })
      .addCase('SET_SALARY_SAVE_DATA', (state, action) => {
        state.salarySaveData = action.payload;
      })
      .addCase('CLEAR_SALARY_SAVE_DATA', (state) => {
        state.salarySaveData = {
          createData: [],
          editData: [],
          deletedData: []
        };
      })
      .addCase('SET_SELECTED_DROPDOWN_OPTIONS', (state, action) => {
        state.selectedDropdownOptions = action.payload;
      })
      .addCase('CREATE_SALARY_CONFIG', (state) => {
        state.salaryConfigLoading = true;
      })
      .addCase('CREATE_SALARY_CONFIG_SUCCESS', (state, action) => {
        state.salaryConfigLoading = false;
        state.message = action.payload.message || "Salary Configuration Created Successfully";
      })
      .addCase('CREATE_SALARY_CONFIG_FAILURE', (state, action) => {
        state.salaryConfigLoading = false;
        state.error = action.payload.message || "Failed to Create Salary Configuration";
      })
      .addCase('UPDATE_SALARY_CONFIG', (state) => {
        state.salaryConfigLoading = true;
      })
      .addCase('UPDATE_SALARY_CONFIG_SUCCESS', (state, action) => {
        state.salaryConfigLoading = false;
        state.message = action.payload.message || "Salary Configuration Updated Successfully";
      })
      .addCase('UPDATE_SALARY_CONFIG_FAILURE', (state, action) => {
        state.salaryConfigLoading = false;
        state.error = action.payload.message || "Failed to Update Salary Configuration";
      })
      .addCase('DELETE_SALARY_CONFIG', (state) => {
        state.salaryConfigLoading = true;
      })
      .addCase('DELETE_SALARY_CONFIG_SUCCESS', (state, action) => {
        state.salaryConfigLoading = false;
        state.message = action.payload.message || "Salary Configuration Deleted Successfully";
      })
      .addCase('DELETE_SALARY_CONFIG_FAILURE', (state, action) => {
        state.salaryConfigLoading = false;
        state.error = action.payload.message || "Failed to Delete Salary Configuration";
      })  
      // Payroll actions
      .addCase('GET_ALL_EMPLOYEE_PAYROLL_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payrollError = null;
        state.payrollNotFetchedEmployees = [];
      })
      .addCase('GET_ALL_EMPLOYEE_PAYROLL_SUCCESS', (state, action) => {
        state.payrollData = action.payload.data;
        state.payrollNotFetchedEmployees = action.payload.notFetchedEmployees || [];
        state.payrollPagination = action.payload.pagination;
        state.isAllPayrollFinalized = action.payload.isAllPayrollFinalized;
        state.isAllPayrollGenerated = action.payload.isAllPayrollGenerated;
        state.payrollLoading = false;
        state.payrollError = null;
      })
      .addCase('GET_ALL_EMPLOYEE_PAYROLL_FAILURE', (state, action) => {
        state.payrollLoading = false;
        state.payrollError = action.payload;
        state.payrollNotFetchedEmployees = [];
      })

      // Update payroll items actions
      .addCase('UPDATE_PAYROLL_ITEMS_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payrollError = null;
      })
      .addCase('UPDATE_PAYROLL_ITEMS_SUCCESS', (state) => {
        state.payrollLoading = false;
        state.payrollError = null;
      })
      .addCase('UPDATE_PAYROLL_ITEMS_FAILURE', (state, action) => {
        state.payrollLoading = false;
        state.payrollError = action.payload;
      })

      // Finalize payroll actions
      .addCase('FINALIZE_PAYROLL_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payrollError = null;
      })
      .addCase('FINALIZE_PAYROLL_SUCCESS', (state) => {
        state.payrollLoading = false;
        state.payrollError = null;
      })
      .addCase('FINALIZE_PAYROLL_FAILURE', (state, action) => {
        state.payrollLoading = false;
        state.payrollError = action.payload;
      })
      .addCase('MARK_PAYSLIPS_AS_PENDING_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payrollError = null;
      })
      .addCase('MARK_PAYSLIPS_AS_PENDING_SUCCESS', (state) => {
        state.payrollLoading = false;
        state.payrollError = null;
      })
      .addCase('MARK_PAYSLIPS_AS_PENDING_FAILURE', (state, action) => {
        state.payrollLoading = false;
        state.payrollError = action.payload;
      })

      // Payroll filter actions
      .addCase('SET_PAYROLL_MONTH', (state, action) => {
        state.payrollFilters.selectedMonth = action.payload;
      })
      .addCase('SET_PAYROLL_YEAR', (state, action) => {
        state.payrollFilters.selectedYear = action.payload;
      })
      .addCase('SET_PAYROLL_SORT_OPTION', (state, action) => {
        state.payrollFilters.selectedSortOption = action.payload;
      })
      .addCase('SET_PAYROLL_STATUS_FILTER', (state, action) => {
        state.payrollFilters.selectedStatusFilter = action.payload;
      })
      .addCase('SET_PAYROLL_SEARCH_QUERY', (state, action) => {
        state.payrollFilters.searchQuery = action.payload;
      })
      .addCase('RESET_PAYROLL_FILTERS', (state) => {
        state.payrollFilters = {
          selectedMonth: null,
          selectedYear: null,
          selectedSortOption: "none",
          selectedStatusFilter: "all",
          searchQuery: "",
        };
      })
      .addCase('SET_PAYROLL_CURRENT_PAGE', (state, action) => {
        state.payrollPagination.currentPage = action.payload;
      })
      // Payslip Filter Reducers
      .addCase('SET_PAYSLIP_FILTER_MONTH', (state, action) => {
        state.payslipFilter.selectedPayslipMonth = action.payload;
      })
      .addCase('SET_PAYSLIP_FILTER_YEAR', (state, action) => {
        state.payslipFilter.selectedPayslipYear = action.payload;
      })
      .addCase('RESET_PAYSLIP_FILTERS', (state) => {
        state.payslipFilter = {
          selectedPayslipMonth: null,
          selectedPayslipYear: null,
        };
      })
      .addCase('GET_EMPLOYEE_PAYSLIPS_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payslipError = null;
      })
      .addCase('GET_EMPLOYEE_PAYSLIPS_SUCCESS', (state, action) => {
        state.payslipLoading = false;
        state.payslipError = null;
        state.payslipData = action.payload;
      })
      .addCase('GET_EMPLOYEE_PAYSLIPS_FAILURE', (state, action) => {
        state.payslipLoading = false;
        state.payslipError = action.payload;
      })
      .addCase('EXPORT_PAYROLL_CSV_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payrollError = null;
      })
      .addCase('EXPORT_PAYROLL_CSV_SUCCESS', (state) => {
        state.payrollLoading = false;
        state.payrollError = null;
      })
      .addCase('EXPORT_PAYROLL_CSV_FAILURE', (state, action) => {
        state.payrollLoading = false;
        state.payrollError = action.payload;
      })
      .addCase('DOWNLOAD_PAYSLIP_PDF_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payslipError = null;
      })
      .addCase('DOWNLOAD_PAYSLIP_PDF_SUCCESS', (state) => {
        state.payrollLoading = false;
        state.payslipError = null;
      })
      .addCase('DOWNLOAD_PAYSLIP_PDF_FAILURE', (state, action) => {
        state.payrollLoading = false;
        state.payslipError = action.payload;
      })
      .addCase('GET_NET_PAY_PAYROLL_AMOUNT_REQUEST', (state) => {
        state.payrollLoading = true;
        state.payrollError = null;
      })
      .addCase('GET_NET_PAY_PAYROLL_AMOUNT_SUCCESS', (state, action) => {
        state.payrollLoading = false;
        state.payrollError = null;
        state.netPayPayrollAmount = action.payload;
      })
      .addCase('GET_NET_PAY_PAYROLL_AMOUNT_FAILURE', (state, action) => {
        state.payrollLoading = false;
        state.payrollError = action.payload;
      })
      .addCase('EXTRA_WORK_LOG_REQUEST', (state) => {
        state.extraWorkLogLoading = true;
      })
      .addCase('EXTRA_WORK_LOG_REQUEST_SUCCESS' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogData = action.payload;
      })
      .addCase('EXTRA_WORK_LOG_REQUEST_FAILURE' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogError = action.payload;
      })
      .addCase('GET_EXTRA_WORK_LOG_REQUESTS', (state) => {
        state.extraWorkLogLoading = true;
      })
      .addCase('GET_EXTRA_WORK_LOG_REQUESTS_SUCCESS' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogRequestsData = action.payload;
      })
      .addCase('GET_EXTRA_WORK_LOG_REQUESTS_FAILURE' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogError = action.payload; 
      })
      .addCase('GET_EXTRA_WORK_LOG_REQUESTS_HISTORY', (state) => {
        state.extraWorkLogLoading = true;
      })
      .addCase('GET_EXTRA_WORK_LOG_REQUESTS_HISTORY_SUCCESS' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogRequestsHistoryData = action.payload;
      })
      .addCase('GET_EXTRA_WORK_LOG_REQUESTS_HISTORY_FAILURE' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogError = action.payload; 
      })
      .addCase('UPDATE_EXTRA_WORK_LOG_REQUEST_STATUS', (state) => { 
        state.extraWorkLogLoading = true;
      })
      .addCase('UPDATE_EXTRA_WORK_LOG_REQUEST_STATUS_SUCCESS' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogUpdateStatus = action.payload;
      })
      .addCase('UPDATE_EXTRA_WORK_LOG_REQUEST_STATUS_FAILURE' , (state, action) => {
        state.extraWorkLogLoading = false;
        state.extraWorkLogError = action.payload;
      })
      .addCase('GET_COMP_OFFLEAVE_BALANCE', (state) => {
        state.loading = true;
      })
      .addCase('GET_COMP_OFFLEAVE_BALANCE_SUCCESS', (state, action) => {
        state.compOffleaveBalanceLoading = false;
        state.compOffleaveBalance = action.payload;
      })
      .addCase('GET_COMP_OFFLEAVE_BALANCE_FAILURE', (state, action) => {
        state.compOffleaveBalanceLoading = false;
        state.error = action.payload;
      })
      .addCase('GET_COMP_OFF_LEAVE_ELIGIBILITY', (state) => {
        state.compOffLeaveEligibilityLoading = true;
      })
      .addCase('GET_COMP_OFF_LEAVE_ELIGIBILITY_SUCCESS', (state, action) => {
        state.compOffLeaveEligibilityLoading = false;
        state.compOffLeaveEligibility = action.payload;
      })
      .addCase('GET_COMP_OFF_LEAVE_ELIGIBILITY_FAILURE', (state, action) => {
        state.compOffLeaveEligibilityLoading = false;
        state.compOffLeaveEligibility = null;
        state.error = action.payload;
      })

      .addCase('GET_EMPLOYEE_EXTRA_WORK_HISTORY', (state) => {
        state.loading = true;
      })
      .addCase('GET_EMPLOYEE_EXTRA_WORK_HISTORY_SUCCESS', (state, action) => {
        state.loading = false;
        state.employeeExtraWorkHistory = action.payload?.data || action.payload || [];
        state.employeeExtraWorkPagination = action.payload?.pagination || null;
      })
      .addCase('GET_EMPLOYEE_EXTRA_WORK_HISTORY_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase('GET_ALL_ROLES', (state) => {
        state.loading = true;
      })
      .addCase('GET_ALL_ROLES_SUCCESS', (state, action) => {
        state.loading = false;
        state.hrmsAccessRoles = action.payload;
      })
      .addCase('GET_ALL_ROLES_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_ALL_HRMS_ACCESS_PERMISSIONS', (state) => {
        state.loading = true;
      })
      .addCase('GET_ALL_HRMS_ACCESS_PERMISSIONS_SUCCESS', (state, action) => {
        state.loading = false;
        state.hrmsAccessPermissions = action.payload;
      })
      .addCase('GET_ALL_HRMS_ACCESS_PERMISSIONS_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('CREATE_HRMS_ROLE', (state) => {
        state.loading = true;
      })
      .addCase('CREATE_HRMS_ROLE_SUCCESS', (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase('CREATE_HRMS_ROLE_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_HRMS_ROLE_BY_ID', (state) => {
        state.loading = true;
      })
      .addCase('GET_HRMS_ROLE_BY_ID_SUCCESS', (state, action) => {
        state.loading = false;
        state.hrmsAccessRole = action.payload;
      })
      .addCase('GET_HRMS_ROLE_BY_ID_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('UPDATE_HRMS_ROLE', (state) => {
        state.loading = true;
      })
      .addCase('UPDATE_HRMS_ROLE_SUCCESS', (state) => {
        state.loading = false;
      })
      .addCase('UPDATE_HRMS_ROLE_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('DELETE_HRMS_ROLE', (state) => {
        state.loading = true;
      })
      .addCase('DELETE_HRMS_ROLE_SUCCESS', (state) => {
        state.loading = false;
      })
      .addCase('DELETE_HRMS_ROLE_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_EMPLOYEE_ROLES', (state) => {
        state.loading = true;
      })
      .addCase('GET_EMPLOYEE_ROLES_SUCCESS', (state, action) => {
        state.loading = false;
        state.employeeRoles = action.payload;
      })
      .addCase('GET_EMPLOYEE_ROLES_FAILURE', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('GET_MY_HRMS_ACCESS', (state) => {
        state.myHrmsAccessLoaded = false;
      })
      .addCase('GET_MY_HRMS_ACCESS_SUCCESS', (state, action) => {
        state.myHrmsAccess = action.payload;
        state.myHrmsAccessLoaded = true;
      })
      .addCase('GET_MY_HRMS_ACCESS_FAILURE', (state, action) => {

        state.loading = false;

        state.error = action.payload;
        state.myHrmsAccessLoaded = true;
      })
      .addCase('INITIATE_OFFBOARDING', (state) => {
        state.offboardingLoading = true;
      })
      .addCase('INITIATE_OFFBOARDING_SUCCESS', (state, action) => {
        state.offboardingLoading = false;
        state.message = action.payload;
      })
      .addCase('INITIATE_OFFBOARDING_FAILURE', (state, action) => {
        state.offboardingLoading = false;
        state.error = action.payload;
      })
      .addCase('GET_ALL_OFFBOARDING_INITIATED_EMPLOYEE_DETAILS', (state) => {
        state.offboardingInitiatedEmployeeDetailsLoading = true;
      })
      .addCase('GET_ALL_OFFBOARDING_INITIATED_EMPLOYEE_DETAILS_SUCCESS', (state, action) => {
        state.offboardingInitiatedEmployeeDetailsLoading = false;
        state.offboardingInitiatedEmployeeDetails = action.payload;
      })
      .addCase('GET_ALL_OFFBOARDING_INITIATED_EMPLOYEE_DETAILS_FAILURE', (state, action) => {
        state.offboardingInitiatedEmployeeDetailsLoading = false;
        state.error = action.payload;
      })
      .addCase('HR_CLEARANCE', (state) => {
        state.hrClearanceLoading = true;
      })
      .addCase('HR_CLEARANCE_SUCCESS', (state, action) => {
        state.hrClearanceLoading = false;
        state.message = action.payload;
      })
      .addCase('HR_CLEARANCE_FAILURE', (state, action) => {
        state.hrClearanceLoading = false;
        state.error = action.payload;
      })
      .addCase('FINANCE_CLEARANCE', (state) => {
        state.financeClearanceLoading = true;
      })
      .addCase('FINANCE_CLEARANCE_SUCCESS', (state, action) => {
        state.financeClearanceLoading = false;
        state.message = action.payload;
      })
      .addCase('FINANCE_CLEARANCE_FAILURE', (state, action) => {
        state.financeClearanceLoading = false;
        state.error = action.payload;
      })
      .addCase('SET_LAST_WORKING_DAY', (state) => {
        state.setLastWorkingDayLoading = true;
      })
      .addCase('SET_LAST_WORKING_DAY_SUCCESS', (state) => {
        state.setLastWorkingDayLoading = false;
      })
      .addCase('SET_LAST_WORKING_DAY_FAILURE', (state, action) => {
        state.setLastWorkingDayLoading = false;
        state.error = action.payload;
      })
      .addCase('APPROVE_OFFBOARDING', (state) => {
        state.approveOffboardingLoading = true;
      })
      .addCase('APPROVE_OFFBOARDING_SUCCESS', (state) => {
        state.approveOffboardingLoading = false;
      })
      .addCase('APPROVE_OFFBOARDING_FAILURE', (state, action) => {
        state.approveOffboardingLoading = false;
        state.error = action.payload;
      })
      .addCase('GET_ALL_OFFBOARDED_EMPLOYEES', (state) => {
        state.getAllOffboardedEmployeesLoading = true;
      })
      .addCase('GET_ALL_OFFBOARDED_EMPLOYEES_SUCCESS', (state, action) => {
        state.getAllOffboardedEmployeesLoading = false;
        state.offboardedEmployees = action.payload;
      })
      .addCase('GET_ALL_OFFBOARDED_EMPLOYEES_FAILURE', (state, action) => {
        state.getAllOffboardedEmployeesLoading = false;

        state.error = action.payload;
      })

    // Rewards & Recognition
    .addCase('FETCH_REWARDS_DASHBOARD', (state) => {
      state.rewardsDashboardLoading = true;
      state.rewardsDashboardError = null;
    })
    .addCase('FETCH_REWARDS_DASHBOARD_SUCCESS', (state, action) => {
      state.rewardsDashboardLoading = false;
      state.rewardsDashboardData = action.payload;
      state.rewardsDashboardError = null;
      state.rewardsPhaseActionError = null;
    })
    .addCase('FETCH_REWARDS_DASHBOARD_FAILED', (state, action) => {
      state.rewardsDashboardLoading = false;
      state.rewardsDashboardData = null;
      state.rewardsDashboardError = action.payload;
    })
    .addCase('REWARDS_EMPLOYEE_SEARCH_SUCCESS', (state, action) => {
      state.rewardsEmployeeSearchResults = action.payload;
    })
    .addCase('REWARDS_NOMINATE', (state) => {
      state.rewardsNominateLoading = true;
    })
    .addCase('REWARDS_NOMINATE_SUCCESS', (state) => {
      state.rewardsNominateLoading = false;
    })
    .addCase('REWARDS_NOMINATE_FAILED', (state) => {
      state.rewardsNominateLoading = false;
    })
    .addCase('FETCH_REWARDS_NOMINEES_FOR_VOTING', (state) => {
      state.rewardsVotingListLoading = true;
    })
    .addCase('FETCH_REWARDS_NOMINEES_FOR_VOTING_SUCCESS', (state, action) => {
      state.rewardsVotingListLoading = false;
      state.rewardsVotingList = action.payload?.list ?? [];
      state.rewardsVotedNomineeEmpUuid = action.payload?.votedNomineeEmpUuid ?? null;
    })
    .addCase('FETCH_REWARDS_NOMINEES_FOR_VOTING_FAILED', (state) => {
      state.rewardsVotingListLoading = false;
      state.rewardsVotingList = [];
      state.rewardsVotedNomineeEmpUuid = null;
    })
    .addCase('REWARDS_VOTE_SUCCESS', (state, action) => {
      state.rewardsVotingList = action.payload?.list ?? state.rewardsVotingList;
      state.rewardsVotedNomineeEmpUuid = action.payload?.votedNomineeEmpUuid ?? null;
    })
    .addCase('FETCH_REWARDS_MY_CITATIONS_SUCCESS', (state, action) => {
      state.rewardsMyCitations = action.payload ?? [];
    })
    .addCase('REWARDS_PHASE_ACTION', (state) => {
      state.rewardsPhaseActionLoading = true;
      state.rewardsPhaseActionError = null;
    })
    .addCase('REWARDS_PHASE_ACTION_SUCCESS', (state, action) => {
      state.rewardsPhaseActionLoading = false;
      state.rewardsPhaseActionError = null;
      if (state.rewardsDashboardData && action.payload) {
        state.rewardsDashboardData = { ...state.rewardsDashboardData, currentCycle: action.payload };
      }
    })
    .addCase('REWARDS_PHASE_ACTION_FAILED', (state, action) => {
      state.rewardsPhaseActionLoading = false;
      state.rewardsPhaseActionError = action.payload;
    })
    .addCase('CLEAR_REWARDS_EMPLOYEE_SEARCH', (state) => {
      state.rewardsEmployeeSearchResults = [];
    })
    // Current Cycle
    .addCase('FETCH_CURRENT_CYCLE', (state) => {
      state.rewardsCurrentCycleLoading = true;
    })
    .addCase('FETCH_CURRENT_CYCLE_SUCCESS', (state, action) => {
      state.rewardsCurrentCycleLoading = false;
      state.rewardsCurrentCycle = action.payload;
    })
    .addCase('FETCH_CURRENT_CYCLE_FAILED', (state) => {
      state.rewardsCurrentCycleLoading = false;
    })
    // Cycle Nominations
    .addCase('FETCH_CYCLE_NOMINATIONS', (state) => {
      state.rewardsCycleNominationsLoading = true;
    })
    .addCase('FETCH_CYCLE_NOMINATIONS_SUCCESS', (state, action) => {
      state.rewardsCycleNominationsLoading = false;
      state.rewardsCycleNominations = action.payload;
    })
    .addCase('FETCH_CYCLE_NOMINATIONS_FAILED', (state) => {
      state.rewardsCycleNominationsLoading = false;
    })
    // Voting
    .addCase('FETCH_NOMINEES_FOR_VOTING', (state) => {
      state.rewardsVotingListLoading = true;
    })
    .addCase('FETCH_NOMINEES_FOR_VOTING_SUCCESS', (state, action) => {
      state.rewardsVotingListLoading = false;
      state.rewardsVotingList = action.payload?.list ?? [];
      state.rewardsVotedNomineeEmpUuid = action.payload?.votedNomineeEmpUuid ?? null;
    })
    .addCase('FETCH_NOMINEES_FOR_VOTING_FAILED', (state) => {
      state.rewardsVotingListLoading = false;
    })
    // Citations
    .addCase('FETCH_MY_CITATIONS', (state) => {
      state.rewardsMyCitationsLoading = true;
    })
    .addCase('FETCH_MY_CITATIONS_SUCCESS', (state, action) => {
      state.rewardsMyCitationsLoading = false;
      state.rewardsMyCitations = action.payload;
    })
    .addCase('FETCH_MY_CITATIONS_FAILED', (state) => {
      state.rewardsMyCitationsLoading = false;
    })
    .addCase('FETCH_REWARDS_RECEIVED_CITATIONS_HISTORY', (state) => {
      state.rewardsPastReceivedCitationsLoading = true;
    })
    .addCase('FETCH_REWARDS_RECEIVED_CITATIONS_HISTORY_SUCCESS', (state, action) => {
      state.rewardsPastReceivedCitationsLoading = false;
      state.rewardsPastReceivedCitations = action.payload?.data ?? [];
      state.rewardsPastReceivedCitationsLoaded = true;
      state.rewardsPastReceivedCitationsLoadedYear = action.payload?.year ?? null;
    })
    .addCase('FETCH_REWARDS_RECEIVED_CITATIONS_HISTORY_FAILED', (state, action) => {
      state.rewardsPastReceivedCitationsLoading = false;
      state.rewardsPastReceivedCitationsLoaded = true;
      state.rewardsPastReceivedCitationsLoadedYear = action.payload?.year ?? null;
    })
    .addCase('FETCH_NOMINEE_CITATIONS', (state) => {
      state.rewardsNomineeCitationsLoading = true;
    })
    .addCase('FETCH_NOMINEE_CITATIONS_SUCCESS', (state, action) => {
      state.rewardsNomineeCitationsLoading = false;
      state.rewardsNomineeCitations = action.payload;
    })
    .addCase('FETCH_NOMINEE_CITATIONS_FAILED', (state) => {
      state.rewardsNomineeCitationsLoading = false;
    })
    // Admin: Announce
    .addCase('FETCH_NOMINEES_FOR_ANNOUNCE', (state) => {
      state.rewardsNomineesForAnnounceLoading = true;
    })
    .addCase('FETCH_NOMINEES_FOR_ANNOUNCE_SUCCESS', (state, action) => {
      state.rewardsNomineesForAnnounceLoading = false;
      state.rewardsNomineesForAnnounce = action.payload;
    })
    .addCase('FETCH_NOMINEES_FOR_ANNOUNCE_FAILED', (state) => {
      state.rewardsNomineesForAnnounceLoading = false;
    })
    .addCase('FETCH_REVIEW_NOMINEES', (state) => {
      state.rewardsReviewNomineesLoading = true;
    })
    .addCase('FETCH_REVIEW_NOMINEES_SUCCESS', (state, action) => {
      state.rewardsReviewNomineesLoading = false;
      state.rewardsReviewNominees = action.payload ?? [];
    })
    .addCase('FETCH_REVIEW_NOMINEES_FAILED', (state) => {
      state.rewardsReviewNomineesLoading = false;
    })
    // Phase Management
    .addCase('START_PHASE', (state) => {
      state.rewardsPhaseActionLoading = true;
    })
    .addCase('START_PHASE_SUCCESS', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    .addCase('START_PHASE_FAILED', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    .addCase('END_PHASE', (state) => {
      state.rewardsPhaseActionLoading = true;
    })
    .addCase('END_PHASE_SUCCESS', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    .addCase('END_PHASE_FAILED', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    .addCase('ANNOUNCE_WINNERS', (state) => {
      state.rewardsPhaseActionLoading = true;
    })
    .addCase('ANNOUNCE_WINNERS_SUCCESS', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    .addCase('ANNOUNCE_WINNERS_FAILED', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    // Remove Nomination
    .addCase('REMOVE_NOMINATION', (state) => {
      state.rewardsPhaseActionLoading = true;
    })
    .addCase('REMOVE_NOMINATION_SUCCESS', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    .addCase('REMOVE_NOMINATION_FAILED', (state) => {
      state.rewardsPhaseActionLoading = false;
    })
    // UI State
    .addCase('SET_NOMINATION_MODAL_OPEN', (state, action) => {
      state.nominationModalOpen = action.payload;
    })
    .addCase('SET_VOTING_MODAL_OPEN', (state, action) => {
      state.votingModalOpen = action.payload;
    })
    .addCase('SET_MANAGE_CITATIONS_MODAL_OPEN', (state, action) => {
      state.manageCitationsModalOpen = action.payload.isOpen;
      state.manageCitationsModalData = action.payload.data;
    })
    .addCase('SET_ANNOUNCE_WINNERS_MODAL_OPEN', (state, action) => {
      state.announceWinnersModalOpen = action.payload;
    })

    // Secondary Location
    .addCase('FETCH_SECONDARY_LOCATION_OVERVIEW', (state) => {
      state.secondaryLocationLoading = true;
      state.secondaryLocationError = null;
    })
    .addCase('FETCH_SECONDARY_LOCATION_OVERVIEW_SUCCESS', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationOverview = action.payload;
    })
    .addCase('FETCH_SECONDARY_LOCATION_OVERVIEW_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('FETCH_SECONDARY_LOCATION_LOGS', (state) => {
      state.secondaryLocationLoading = true;
      state.secondaryLocationError = null;
    })
    .addCase('FETCH_SECONDARY_LOCATION_LOGS_SUCCESS', (state, action) => {
      state.secondaryLocationLoading = false;
      const incomingList = action.payload?.list || [];
      if (action.append) {
        const existing = state.secondaryLocationLogs || [];
        const seen = new Set(existing.map((item) => item.logId));
        state.secondaryLocationLogs = [
          ...existing,
          ...incomingList.filter((item) => !seen.has(item.logId)),
        ];
      } else {
        state.secondaryLocationLogs = incomingList;
      }
      state.secondaryLocationLogsMeta = action.payload?.meta || state.secondaryLocationLogsMeta;
    })
    .addCase('FETCH_SECONDARY_LOCATION_LOGS_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('FETCH_SECONDARY_LOCATION_CONFIGS', (state) => {
      state.secondaryLocationLoading = true;
      state.secondaryLocationError = null;
    })
    .addCase('FETCH_SECONDARY_LOCATION_CONFIGS_SUCCESS', (state, action) => {
      state.secondaryLocationLoading = false;
      if (Array.isArray(action.payload)) {
        state.secondaryLocationConfigs = action.payload;
        state.secondaryLocationConfigsMeta = {
          limit: 10,
          nextLastId: null,
          hasNext: false,
        };
        return;
      }

      const incomingList = action.payload?.list || [];
      if (action.append) {
        const existing = state.secondaryLocationConfigs || [];
        const seen = new Set(existing.map((item) => item.configId));
        state.secondaryLocationConfigs = [
          ...existing,
          ...incomingList.filter((item) => !seen.has(item.configId)),
        ];
      } else {
        state.secondaryLocationConfigs = incomingList;
      }

      state.secondaryLocationConfigsMeta = action.payload?.meta || state.secondaryLocationConfigsMeta;
    })
    .addCase('FETCH_SECONDARY_LOCATION_CONFIGS_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('FETCH_SECONDARY_LOCATION_REQUESTS', (state) => {
      state.secondaryLocationRequestsLoading = true;
      state.secondaryLocationError = null;
    })
    .addCase('FETCH_SECONDARY_LOCATION_REQUESTS_SUCCESS', (state, action) => {
      state.secondaryLocationRequestsLoading = false;
      const incomingList = action.payload?.requests || [];
      if (action.append) {
        const existing = state.secondaryLocationRequests || [];
        const seen = new Set(existing.map((item) => item.requestId));
        state.secondaryLocationRequests = [
          ...existing,
          ...incomingList.filter((item) => !seen.has(item.requestId)),
        ];
      } else {
        state.secondaryLocationRequests = incomingList;
      }
      state.secondaryLocationRequestsMeta = action.payload?.meta || state.secondaryLocationRequestsMeta;
    })
    .addCase('FETCH_SECONDARY_LOCATION_REQUESTS_FAILURE', (state, action) => {
      state.secondaryLocationRequestsLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('REVIEW_SECONDARY_LOCATION_REQUEST', (state) => {
      state.secondaryLocationRequestsLoading = true;
      state.secondaryLocationError = null;
    })
    .addCase('REVIEW_SECONDARY_LOCATION_REQUEST_SUCCESS', (state) => {
      state.secondaryLocationRequestsLoading = false;
    })
    .addCase('REVIEW_SECONDARY_LOCATION_REQUEST_FAILURE', (state, action) => {
      state.secondaryLocationRequestsLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('CREATE_SECONDARY_LOCATION_LOG', (state) => {
      state.secondaryLocationLoading = true;
    })
    .addCase('CREATE_SECONDARY_LOCATION_LOG_SUCCESS', (state) => {
      state.secondaryLocationLoading = false;
    })
    .addCase('CREATE_SECONDARY_LOCATION_LOG_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('UPDATE_SECONDARY_LOCATION_LOG', (state) => {
      state.secondaryLocationLoading = true;
    })
    .addCase('UPDATE_SECONDARY_LOCATION_LOG_SUCCESS', (state) => {
      state.secondaryLocationLoading = false;
    })
    .addCase('UPDATE_SECONDARY_LOCATION_LOG_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('DELETE_SECONDARY_LOCATION_LOG', (state) => {
      state.secondaryLocationLoading = true;
    })
    .addCase('DELETE_SECONDARY_LOCATION_LOG_SUCCESS', (state) => {
      state.secondaryLocationLoading = false;
    })
    .addCase('DELETE_SECONDARY_LOCATION_LOG_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('CREATE_SECONDARY_LOCATION_CONFIG', (state) => {
      state.secondaryLocationLoading = true;
    })
    .addCase('CREATE_SECONDARY_LOCATION_CONFIG_SUCCESS', (state) => {
      state.secondaryLocationLoading = false;
    })
    .addCase('CREATE_SECONDARY_LOCATION_CONFIG_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('UPDATE_SECONDARY_LOCATION_CONFIG', (state) => {
      state.secondaryLocationLoading = true;
    })
    .addCase('UPDATE_SECONDARY_LOCATION_CONFIG_SUCCESS', (state) => {
      state.secondaryLocationLoading = false;
    })
    .addCase('UPDATE_SECONDARY_LOCATION_CONFIG_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    })
    .addCase('DELETE_SECONDARY_LOCATION_CONFIG', (state) => {
      state.secondaryLocationLoading = true;
    })
    .addCase('DELETE_SECONDARY_LOCATION_CONFIG_SUCCESS', (state) => {
      state.secondaryLocationLoading = false;
    })
    .addCase('DELETE_SECONDARY_LOCATION_CONFIG_FAILURE', (state, action) => {
      state.secondaryLocationLoading = false;
      state.secondaryLocationError = action.payload;
    });
});
