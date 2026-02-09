// this file will include all the String and Object data that will be used in the application
// whatever data that will be used in the application will be included here as object
import userGroup from "../assets/icons/userGroup.svg";
import toolIcon from "../assets/icons/tool_icon.svg";
import pending_request from "../assets/icons/pending_request.svg";
import user_permission from "../assets/icons/user_permission.svg";
import policy from "../assets/icons/policies.svg";
import partnerOnboard from "../assets/icons/partnerOnboard.svg";
import partnerMonetizationTool from "../assets/icons/partnerMonetizationTool.svg";
import partnerConfigurationTool from "../assets/icons/configuration.svg";
import link from "../assets/icons/links.svg";
import ReferralAnalytics from "../assets/icons/referral_Analytics.svg";

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
  referral_title: "Referral Leader board",
  monthly: "Monthly",
  weekly: "Weekly",
  overall: "Overall",
  goto: "Go to leader board",
  tool_title3: "Article Editor",
  tool_description: "Add,Edit,Update,Delete Articles",
  tool_title4: "Asset Vault Forms",
  tool_description4: "Tool to handle Asset Vault forms in different countries",
  tool_title5: "Known Issues",
  tool_description5: "Here you can edit the known issues available.",
  tool_title6: "Language Text Editor",
  tool_description6: "Here you will be able to modify content into different languages.",
  tool_title7: "Feature Flags",
  tool_description7: "Here you will be able to modify feature flags for different features.",

  tool_title8:"Analytical Dashboard",
  tool_description8:"Here you will be able to see the analytical dashboard for different features.",

  tool_title9: "Key Value Configuration",
  tool_description9: "Here you will be able to dynamically manage the Key Value pairs across the entire platform.",

  tool_title10:"Partner Tool",
  tool_description10:"Here you will be able to see the Partner Tool for different features.",

  tool_title11:"Notification Tool",
  tool_description11:"Here you will be able to see the Notification Tool for differnt features"
};

export const referralCount = {
  first: "1ST",
  second: "2ND",
  third: "3RD",
  fname: "Debabrarta Basak",
  sname: "Ajay Reddy",
  tname: "Chandramouli Ghoshal",
  level1: "7 first level",
  level2: "10 second level",
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

// hrRepoRouterData has been moved to src/uam/hrRepository/constant/data.js

export const knownIssuesRouter = [
  {
    title: "Known Issues",
    icon: policy,
    path: "/known-issues",
  },
  {
    title: "Important Links",
    icon: link,
    path: "/known-issues/imp-link",
  },
];

export const languageTextEditorRouter = [
  {
    section: "Platform",
    routes: [
      {
        title: "App",
        icon: policy,
        path: "/language-text-editor",
      },
      {
        title: "Pre-login",
        icon: policy,
        path: "/language-text-editor/pre-login",
      },
      {
        title: "Post-login",
        icon: policy,
        path: "/language-text-editor/post-login",
      },
    ],
  },
  {
    title: "Tech Section",
    icon: policy,
    path: "/language-text-editor/tech-section",
  },
  {
    title: "User Permissions",
    icon: policy,
    path: "/language-text-editor/user-permissions",
  }
]

export const featureFlagsRouter = [
  {
    title: "Feature Flags",
    icon: policy,
    path: "/feature-flags",
  },
]

export const AppVersionControlRouter = [
  {
    title: "Key Value Configuration",
    icon: policy,
    path: "/key-value-configuration",
  },
]

export const partnerToolRouter = [
  {
    title: "Partner/Affiliate Onboarding",
    icon: partnerOnboard,
    path: "/partner-tool",
  },
  {
    title: "Subscriptions Configurator",
    icon: partnerMonetizationTool,
    path: "/subscriptions-configurator",
  },
  {
    title: "Feature Configuration",
    icon: partnerConfigurationTool,
    path: "/configuration-tool",
  },
  {
    title: "Analytics Dashboard",
    icon: ReferralAnalytics,
    path: "/referral-tracking",
  }
]

export const notificationToolRouter = [
  {
    title: "Notification Tool",
    icon: partnerOnboard,
    path: "/notification-tool",
  },
  // {
  //   title: "Notification Tool Page 2",
  //   icon: partnerMonetizationTool,
  //   path: "/notification-tool1",
  // },
  // {
  //   title: "Notification Tool Page 3",
  //   icon: partnerConfigurationTool,
  //   path: "/notification-tool2",
  // },
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

export const repoScreenArray = [
  {
    id: 1,
    name: "policy.pdf",
    lastOpened: "yesterday",
    size: "5MB",
    deleted: false,
  },
  {
    id: 2,
    name: "policy.pdf",
    lastOpened: "yesterday",
    size: "5MB",
    deleted: false,
  },
  {
    id: 3,
    name: "policy.pdf",
    lastOpened: "yesterday",
    size: "5MB",
    deleted: false,
  },
  {
    id: 4,
    name: "policy.pdf",
    lastOpened: "yesterday",
    size: "5MB",
    deleted: false,
  },
];

// hrRepoScreenPageData has been moved to src/uam/hrRepository/constant/data.js

export const knownIssuesScreenPageData = {
  heading: "Welcome",
  subHeading: "Here you can see the known issues available to you",
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
