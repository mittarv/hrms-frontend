# HRMS Frontend

This is the frontend application for the HRMS (Human Resource Management System) built with [Vite](https://vitejs.dev/) + [React](https://react.dev/).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Node Version](#node-version)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Building the Project](#building-the-project)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 24.11.0 or higher)
- **npm** (version 11.6.0 or higher)
- **Docker** (optional, for containerized deployment)

---

## Node Version

This project requires **Node.js version 24.11.0** or higher and **npm version 11.6.0** or higher.

You can check your Node.js version by running:
```bash
node --version
```

You can check your npm version by running:
```bash
npm --version
```

If you need to install or update Node.js, visit [nodejs.org](https://nodejs.org/).

### Node.js Version Behavior

- ✅ **Node.js v24.11.0+**: Supported
- ✅ **Node.js v25.x or higher**: Also supported
- ❌ **Node.js v23.x or lower**: Not supported - project will refuse to start

### Using Node Version Manager (nvm)

If you have nvm installed, you can automatically switch to the correct version:

```bash
nvm use
# This automatically switches to v24.11.0
```

---

## Environment Setup

### Step 1: Create .env File

Create a `.env` file in the root directory of the project:

```bash
cp .env.example .env
```

If `.env.example` doesn't exist, create a new `.env` file manually:

```bash
touch .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file and configure the following environment variables:

#### Application Configuration

```env
# Backend API Base URL
# All API requests will be prefixed with this URL
VITE_REACT_APP_HOSTED_URL=http://localhost:5000

# Google OAuth Client ID (for Google Sign-In)
# Get this from Google Cloud Console
VITE_REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Encryption Key (for sensitive data encryption)
# Must be a hex string with at least 64 characters (256-bit key)
# Generate a secure key using: openssl rand -hex 32
VITE_ENCRYPTION_KEY=your-64-character-hex-encryption-key
```

### Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_REACT_APP_HOSTED_URL` | Yes | Base URL for the backend API. All API requests will be prefixed with this URL. | `http://localhost:5000` or `https://api.example.com` |
| `VITE_REACT_APP_GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 Client ID for initiating the Authorization Code flow. Get this from [Google Cloud Console](https://console.cloud.google.com/). | `123456789-abc.apps.googleusercontent.com` |
| `VITE_ENCRYPTION_KEY` | Yes | Encryption key used for encrypting sensitive data (e.g., payroll information). Must be a hex string with at least 64 characters (256 bits). | `a1b2c3d4e5f6...` (64+ characters) |
| `VITE_ALLOWED_EMAIL_DOMAIN` | Yes | Allowed email domain for client-side validation in the Add User popup (e.g., `mittarv.com`). Domain validation for login is enforced on the backend via `TMS_ALLOWED_DOMAINS`. | `mittarv.com` |



### Generating an Encryption Key

To generate a secure encryption key, use one of these methods:

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important Notes:**
- ⚠️ **Never commit the `.env` file to version control** (it's already in `.gitignore`)
- 🔒 Keep your encryption key secure and never share it publicly
- 🔄 Use different keys for development, staging, and production environments
- 📝 The encryption key must be at least 64 hexadecimal characters (256 bits)

### Getting Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins (e.g., `http://localhost:3000`)
7. Copy the Client ID and paste it into your `.env` file

> **Security Note:** The frontend only uses the Google Client ID to initiate the OAuth Authorization Code flow. The Google Client Secret is **never** used on the frontend — all token exchange and user verification happens on the backend server-to-server. See the HRMS Backend README for backend auth configuration.

---

## Installation

Install all project dependencies:

```bash
npm install
```

**Note:** The `preinstall` script automatically runs before `npm install` to check your Node.js and npm versions. If your versions don't meet the requirements, the installation will be blocked with a clear error message.

### Installation Commands

#### `npm run preinstall`

Manually run the preinstall check (also runs automatically before `npm install`):

```bash
npm run preinstall
```

This script validates your Node.js and npm versions against the project requirements.

#### `npm run check-pkg`

Check package compatibility and validate dependencies:

```bash
npm run check-pkg
```

This command checks if all installed packages are compatible with the current Node.js version and project configuration.

---

## Building the Project

Build the application for production:

```bash
npm run build
```

This command:
- ✅ Automatically checks your Node.js and npm versions (via `precheck`)
- 📦 Creates an optimized production build in the `dist/` folder
- 🗜️ Minifies and bundles all assets
- 🎯 Optimizes for best performance
- 📝 Filenames include content hashes for caching

The build output will be in the `dist/` folder, ready for deployment.

---

## Running the Application

### Development Mode

Run the application in development mode with hot-reload:

```bash
npm run dev
```

or

```bash
npm run server
```

The application will:
- ✅ Automatically check your Node.js and npm versions (via `precheck`)
- 🚀 Start the Vite development server
- 🌐 Open at [http://localhost:3000](http://localhost:3000)
- 🔥 Enable Hot Module Replacement (HMR) for instant updates
- 📝 Show lint errors in the console
- 🔄 Proxy API requests to `http://localhost:5000`

**Note:** The development server uses a proxy to `http://localhost:5000` for API requests. Make sure your backend server is running on port 5000, or update the `proxy` field in `package.json` if your backend runs on a different port.

### Production Mode

1. Build the project first:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

   This serves the production build locally so you can test it before deployment.

### Available Scripts

#### Development Commands

- **`npm run dev`** - Runs the app in development mode with Vite
- **`npm run precheck`** - Manually run the version check (also runs automatically before `dev`, `build`, `lint`, and `preview`)

#### Build Commands

- **`npm run build`** - Builds the app for production to the `dist` folder
- **`npm run preview`** - Locally preview the production build before deploying

#### Code Quality Commands

- **`npm run lint`** - Runs ESLint to check code quality and potential errors

#### Upgrade Commands

- **`npm run upgrade:safe`** - Safely update dependencies to their latest compatible versions
- **`npm run upgrade:minor`** - Update dependencies to latest minor versions (may introduce breaking changes)
- **`npm run upgrade:major`** - Update dependencies to latest major versions (use with extreme caution)

---

## Docker Setup

### Prerequisites

- Docker and Docker Compose installed
- `.env` file configured with all required environment variables

### Using Docker Compose (Recommended)

Build and run with Docker Compose:

```bash
docker compose up -d --build
```

This will:
- Build the Docker image using Node.js 24 Alpine
- Create and start the container
- Expose the application on port `3050` (configurable via `HOST_PORT` in `.env`)

**Stop the container:**
```bash
docker compose down
```

**View logs:**
```bash
docker compose logs -f
```

### Using Docker Commands

**Build the image:**
```bash
docker build -t hrms-frontend .
```

**Run the container:**
```bash
docker run -d \
  --name hrms-frontend \
  -p 3050:3050 \
  --env-file .env \
  --restart unless-stopped \
  hrms-frontend
```

**Common commands:**
```bash
# View running containers
docker ps

# View logs
docker logs hrms-frontend

# Stop container
docker stop hrms-frontend

# Remove container
docker rm hrms-frontend
```

### Important Notes

- The container exposes port `3050` by default
- Environment variables are loaded from `.env` file
- The `.env` file is automatically removed from the Docker image after build for security
- Ensure all required environment variables are set in `.env` before building

---

## CI/CD with GitHub Actions

The project includes an automated deployment workflow that builds and deploys the application using Docker on a self-hosted runner.

### Workflow Overview

The workflow automatically:
1. Bumps the version in `package.json` (patch increment)
2. Creates `.env` file from GitHub Variables and Secrets at runtime
3. Builds and deploys using Docker Compose
4. Creates a GitHub release with the new version
5. Tags the release

**Triggers:**
- Push to `main` branch
- Manual trigger via `workflow_dispatch`

### Required Configuration

The workflow reads environment variables from GitHub repository settings. Configure them at:
**Settings > Secrets and variables > Actions**

#### GitHub Secrets (Sensitive Data)

Store sensitive values as **Secrets** (automatically masked in logs):

| Secret | Description | Required |
|--------|-------------|----------|
| `VITE_ENCRYPTION_KEY` | Encryption key (64+ hex characters) | Yes |


#### GitHub Variables (Non-Sensitive Data)

Store public configuration as **Variables**:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes | - |
| `VITE_REACT_APP_HOSTED_URL` | Backend API URL | Yes | - |
| `VITE_ALLOWED_EMAIL_DOMAIN` | Allowed email domain for login | Yes | - |
| `HOST_PORT` | Port to expose on host | No | `3050` |

### Setup Instructions

1. Go to your repository on GitHub
2. Navigate to **Settings > Secrets and variables > Actions**
3. Add all required **Secrets** (sensitive data)
4. Add all required **Variables** (public configuration)
5. Ensure a self-hosted runner is configured for the repository
6. Push to `main` branch or manually trigger the workflow

**Note:** The workflow creates the `.env` file at runtime from these values, so you don't need to commit any `.env` file to the repository.

---

## Project Structure

```
hrms-frontend/
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── scripts/                   # Build and utility scripts
│   ├── check-engines.cjs      # Node.js/npm version checker
│   ├── check-node-version.cjs
│   ├── check-package-compatibility.cjs
│   └── upgrade.cjs
├── src/                       # Source code
│   ├── actions/              # Redux actions
│   │   ├── hrRepositoryAction.js
│   │   ├── mittarvToolsActions.js
│   │   ├── requestsAction.js
│   │   ├── userActions.js
│   │   ├── userGroupsActions.js
│   │   ├── userPermissionsActions.js
│   │   ├── userToolAccessActions.js
│   │   └── userToolsActions.js
│   ├── assets/               # Static assets (icons, images)
│   │   ├── icons/
│   │   └── images/
│   ├── components/           # Reusable React components
│   │   ├── accessDenied/
│   │   ├── button/
│   │   ├── dropDowns/
│   │   ├── editTable_userPermission/
│   │   ├── header/
│   │   ├── hrRepositoryTables/
│   │   ├── login/
│   │   ├── pageNotFound/
│   │   ├── popups/
│   │   ├── sidebar/
│   │   ├── tableHeader_hrrepo/
│   │   ├── tableHeader_MittarvTools/
│   │   └── tableHeader_userGroups/
│   ├── constant/             # Constants and configuration
│   │   ├── data.js
│   │   └── tableStyle.jsx
│   ├── design/               # Design system (colors, fonts)
│   │   ├── colors/
│   │   └── fonts/
│   ├── reducers/             # Redux reducers
│   │   ├── hrRepositoryReducer.js
│   │   ├── mittarvToolsReducer.js
│   │   ├── requestsReducers.js
│   │   ├── userGroupsReducer.js
│   │   ├── userPermissionsReducer.js
│   │   ├── userReducer.js
│   │   ├── userToolAccessReducer.js
│   │   └── userToolsReducer.js
│   ├── tools/                # Tool-specific components
│   │   ├── Hello.jsx
│   │   ├── hello.scss
│   │   └── toolComponents/
│   ├── uam/                  # User Access Management modules
│   │   ├── hrRepository/     # HR Repository module
│   │   ├── mittarvTools/     # Mittarv Tools module
│   │   ├── myTools/          # My Tools module
│   │   ├── pendingRequests/  # Pending Requests module
│   │   ├── uamHome/          # UAM Home/Layout
│   │   ├── userGroups/       # User Groups module
│   │   └── userPermissions/  # User Permissions module
│   ├── utills/               # Utility functions
│   │   ├── convertDate.js
│   │   ├── displaySnackbar.jsx
│   │   ├── emailHelper.js
│   │   ├── getToolAdmins.js
│   │   └── helperUtil.js
│   ├── AllRoutes.jsx         # Route configuration
│   ├── App.jsx               # Main App component
│   ├── App.scss              # App styles
│   ├── index.jsx             # Application entry point
│   ├── index.scss            # Global styles
│   ├── PrivateRoute.jsx      # Protected route component
│   └── store.js              # Redux store configuration
├── .env                      # Environment variables (not in git)
├── .gitignore                # Git ignore rules
├── Dockerfile                # Docker configuration
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── README.md                 # This file
├── SECURITY.md               # Security policy
└── vite.config.js            # Vite configuration
```

---

## Troubleshooting

### Common Issues

1. **Node.js Version Error:**
   - Ensure you have Node.js v24.11.0 or higher installed
   - Use `nvm use` if you have nvm installed
   - Check your version with `node --version`

2. **Environment Variables Not Working:**
   - Make sure your `.env` file is in the root directory
   - All environment variables must start with `VITE_` to be accessible in the app
   - Restart the development server after changing `.env` file
   - Check that there are no spaces around the `=` sign in `.env`

3. **API Connection Issues:**
   - Ensure your backend server is running
   - Check that `VITE_REACT_APP_HOSTED_URL` is correct
   - Verify CORS settings on your backend
   - Check browser console for specific error messages

4. **Google OAuth Not Working:**
   - Verify `VITE_REACT_APP_GOOGLE_CLIENT_ID` is set correctly
   - Check that authorized JavaScript origins include your domain
   - Ensure the Google+ API is enabled in Google Cloud Console

5. **Encryption Key Issues:**
   - Ensure `VITE_ENCRYPTION_KEY` is at least 64 hexadecimal characters
   - The key must be a valid hex string (0-9, a-f)
   - Generate a new key if you see encryption/decryption errors

6. **Port Already in Use:**
   - Change the port in `vite.config.js` to an available port
   - Or stop the process using port 3000

7. **Build Errors:**
   - Ensure all dependencies are installed (`npm install`)
   - Check for TypeScript/JavaScript compilation errors
   - Verify `vite.config.js` is properly configured

8. **Docker Issues:**
   - Ensure Docker is installed and running
   - Check that `.env` file exists and has all required variables
   - Verify port 3050 is not already in use (or change `HOST_PORT` in `.env`)
   - Check Docker logs: `docker logs <container-name>` or `docker compose logs`

---

## License

MIT

---

## Support

For questions, email us at: [support@mittarv.com](mailto:support@mittarv.com)
