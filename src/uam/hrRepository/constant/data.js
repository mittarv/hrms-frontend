// HR Repository specific constants
// This file contains all constants used by HR Repository module
// Separated from main constant/data.js to enable HR Repository to act as a separate repository

import dashboard from "../assets/icons/dashboard.svg";
import policy from "../assets/icons/policies.svg";
import link from "../assets/icons/links.svg";
import employee_repo from "../assets/icons/employee_repo.svg";
import leave_configurator from "../assets/icons/leave_configurator.svg";
import Requests from "../assets/icons/hr_repo_requests_icon.svg";
import leave_attendance from "../assets/icons/leave_and_attendance_icon.svg";
import Payroll_icon from "../assets/icons/Payroll_icon.svg";
import Notepad_icon from "../assets/icons/notepad_icon.svg";

// HR Repository Router Data - defines navigation menu items
export const hrRepoRouterData = [
  {
    title: "Dashboard",
    icon: dashboard,
    path: "/dashboard",
  },
  {
    title: "Policies",
    icon: policy,
    path: "/policies",
  },
  {
    title: "Important Links",
    icon: link,
    path: "/imp-link",
  },
  { 
    title: "Employee-Repo",
    icon: employee_repo,
    path: "/employee-repo",
  },
  { 
    title: "Employee Directory",
    icon: employee_repo,
    path: "/employee-directory",
  },
  {
    title:"Leave Configurator",
    icon: leave_configurator,
    path: "/leave-configurator",
  },
  {
    title: "Leave & Attendance",
    icon: leave_attendance,
    path: "/leave-attendance",
  },
  {
    title: "Payroll",
    icon: Payroll_icon,
    path: "/payroll-reimbursements",
  },
  {
    title: "Requests",
    icon: Requests,
    path: "/hr-repo-requests",
  },
  {
    title: "HRMS Access",
    icon: Notepad_icon,
    path: "/hrms-access",
  }
];

// HR Repository Screen Page Data
export const hrRepoScreenPageData = {
  heading: "Welcome",
  subHeading: "Here you can see the policies available to you",
  subheadingSuggestion1: "Represents any change in text",
  subheadingSuggestion2: "Represents deleted item: row/column",
  subheadingSuggestion3: "Represents deleted text",
};

// HR Repository specific tool home page data
export const hrToolHomePageData = {
  toot_title2: "HR Repository",
  tool_title2_name: "HR Repository",
  description2: "One-Stop Access to Essential Policies and Links",
};

// HR Repository Table Header Data
export const hrRepositoryTableHeaderData = {
  subheadingSuggestion1: "Represents any change in text",
  subheadingSuggestion2: "Represents deleted item: row/column",
};

// Role mapping for HR Repository
export const valueRoleMap = {
  100: "User",
  200: "Viewer",
  300: "Editor",
  500: "Tool Admin",
  900: "Super Admin"
};
