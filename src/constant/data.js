// this file will include all the String and Object data that will be used in the application
// whatever data that will be used in the application will be included here as object
import userGroup from "../assets/icons/userGroup.svg";
import toolIcon from "../assets/icons/tool_icon.svg";
import pending_request from "../assets/icons/pending_request.svg";
import user_permission from "../assets/icons/user_permission.svg";
import policy from "../assets/icons/policies.svg";
import link from "../assets/icons/links.svg";
import employee_repo from "../assets/icons/employee_repo.svg";
import dashboard from "../assets/icons/dashboard.svg";
import leave_configurator from "../assets/icons/leave_configurator.svg";
import Requests from "../assets/icons/hr_repo_requests_icon.svg";
import leave_attendance from "../assets/icons/leave_and_attendance_icon.svg";
import Payroll_icon from "../assets/icons/Payroll_icon.svg";

export const loginPageData = {
  loginPageTitle: "Log in to",
  toolboxTitle: "Toolbox",
  googleLoginButton: "Continue with Google",
};

export const userPermissionsData = {
  heading: "Table For Mitt Arv User Permissions",
  subHeading:
    "To make changes, add or remove user and their permissions, click edit",
  subheadingSuggestion1: "Represents any change in text",
  subheadingSuggestion2: "Represents deleted item: row/column",
};
export const ToolHeaderdata = {
  username: "Chandramouli Ghoshal",
  logout: "Log out",
};

export const toolHomePageData = {
  title: "Toolbox",
  toot_title: "User Access Management ",
  toot_title2: "HR Repository",
  tool_title2_name: "HR Repository",
  description: "Easily manage who can access the different tools in our toolbox.",
  description2: "One-Stop Access to Essential Policies and Links",
};

export const userAccessManagementData = {
  header_title: "User Access Management",
};

export const adminsidebarContent = [
  {
    title: "User Groups",
    icon: userGroup,
    path: "/user-groups",
  },
  {
    title: "Mitt Arv Tools",
    icon: toolIcon,
    path: "/mittarv-tools",
  },
  {
    title: "User Permissions",
    icon: user_permission,
    path: "/user-permissions",
  },
  {
    title: "Pending Requests",
    icon: pending_request,
    path: "/pending-requests",
  },
];

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
];

export const userSidebarContent = [
  {
    title: "Mitt Arv Tools",
    icon: toolIcon,
    path: "/my-tools",
  },
  {
    title: "User Groups",
    icon: userGroup,
    path: "/user-groups",
  },
];

export const toolAdminSidebarContent = [
  {
    title: "User Groups",
    icon: userGroup,
    path: "/user-groups",
  },
  {
    title: "Mitt Arv Tools",
    icon: toolIcon,
    path: "/my-tools",
  },
  {
    title: "User Permissions",
    icon: user_permission,
    path: "/user-permissions",
  },
  {
    title: "Pending Requests",
    icon: pending_request,
    path: "/hello",
  },
];

export const role = {
  user: "User",
  admin: "Super Admin",
  tool: "Tool Admin",
};

export const valueRoleMap = {
  100: "User",
  200: "Viewer",
  300: "Editor",
  500: "Tool Admin",
  900: "Super Admin"
}

export const mittarvToolsPageData = {
  heading: "Table for MittArv Tools",
  subHeading:
    "To make changes, add or remove tools and it’s attributes, click edit",
  subheadingSuggestion1: "Represents any change in text",
  subheadingSuggestion2: "Represents deleted item: row/column",
  subheadingSuggestion3: "Represents deleted text",
};

export const hrRepoScreenPageData = {
  heading: "Welcome",
  subHeading: "Here you can see the policies available to you",
  subheadingSuggestion1: "Represents any change in text",
  subheadingSuggestion2: "Represents deleted item: row/column",
  subheadingSuggestion3: "Represents deleted text",
};

export const userGroupPageData = {
  heading: "Table For User group",
  subHeading:
    "To make changes, add or remove tools and it’s attributes, click edit",
  subheadingSuggestion1: "Represents any change: Check/Uncheck",
  subheadingSuggestion2: "Represents deleted item: row/column",
};

export const usergroupsUserViewPage = {
  heading: "Welcome",
  subheading:
    "Here you can see the various user groups created by the Super Admin",
};
