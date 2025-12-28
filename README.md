# TMS Web Application

This project is built with [Vite](https://vitejs.dev/) + [React](https://react.dev/).

## Prerequisites

This project requires:
- **Node.js**: LTS version **24.11.0** or higher
- **npm**: Version **11.6.0** or higher
- **Docker** (optional): For containerized deployment

## Node.js Version Behavior

### ✅ What Works:
- **Node.js v24.0.0+**: Perfect! ✨
- **Node.js v25.x or higher**: Also supported ✅

### ❌ What Doesn't Work:
- **Node.js v23.x or lower**: Too old, project will refuse to start ❌

## Setup

### Step 1: Install Node.js

#### Option 1: Using Node Version Manager (nvm)

Install the exact project version:
```bash
nvm use
# This automatically switches to v24.11.0
```

#### Option 2: Manual Installation

If you don't have nvm, download Node.js v24.11.0+ from [nodejs.org](https://nodejs.org/)

### Step 2: Clone the Repository

```bash
git clone <repository-url>
cd hrms-frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

**Note:** The `preinstall` script automatically runs before `npm install` to check your Node.js and npm versions. If your versions don't meet the requirements, the installation will be blocked with a clear error message.

## Environment Variables Setup

### Step 1: Create .env File

Create a `.env` file in the root directory of the project:

```bash
# Option 1: Copy from example (if available)
cp .env.example .env

# Option 2: Create a new .env file
touch .env
```

### Step 2: Set Environment Variables

Open the `.env` file and add the following environment variables:

```env
# Backend API Base URL
VITE_REACT_APP_HOSTED_URL=http://localhost:5000

# Google OAuth Client ID (for Google Sign-In)
VITE_REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Encryption Key (for sensitive data encryption)
# Must be a hex string with at least 64 characters (256-bit key)
# Generate a secure key using: openssl rand -hex 32
VITE_ENCRYPTION_KEY=your-64-character-hex-encryption-key
```

### Environment Variables Explained

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_REACT_APP_HOSTED_URL` | Base URL for the backend API. All API requests will be prefixed with this URL. | ✅ Yes | `http://localhost:5000` or `https://api.example.com` |
| `VITE_REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID for Google Sign-In authentication. Get this from [Google Cloud Console](https://console.cloud.google.com/). | ✅ Yes | `123456789-abc.apps.googleusercontent.com` |
| `VITE_ENCRYPTION_KEY` | Encryption key used for encrypting sensitive data (e.g., payroll information). Must be a hex string with at least 64 characters (256 bits). | ✅ Yes | `a1b2c3d4e5f6...` (64+ characters) |

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

## Commands

### Installation Commands

#### `npm install`

Installs all project dependencies. This command automatically runs the `preinstall` script which:
- ✅ Checks Node.js version (must be >= 24.11.0)
- ✅ Checks npm version (must be >= 11.6.0)
- ✅ Blocks installation if versions don't meet requirements

```bash
npm install
```

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

### Development Commands

#### `npm run dev`

Runs the app in development mode with Vite:

```bash
npm run dev
```

The application will:
- ✅ Automatically check your Node.js and npm versions (via `precheck`)
- 🚀 Start the Vite development server
- 🌐 Open at [http://localhost:3000](http://localhost:3000)
- 🔥 Enable Hot Module Replacement (HMR) for instant updates
- 📝 Show lint errors in the console
- 🔄 Proxy API requests to `http://localhost:5000`

**Note:** The development server uses a proxy to `http://localhost:5000` for API requests. Make sure your backend server is running on port 5000, or update the `proxy` field in `package.json` if your backend runs on a different port.

#### `npm run precheck`

Manually run the version check (also runs automatically before `dev`, `build`, `lint`, and `preview`):

```bash
npm run precheck
```

This validates Node.js and npm versions before running other commands.

### Build Commands

#### `npm run build`

Builds the app for production to the `dist` folder:

```bash
npm run build
```

This will:
- ✅ Check Node.js and npm versions (via `precheck`)
- 📦 Create an optimized production build in the `dist` folder
- 🗜️ Minify and bundle all assets
- 🎯 Optimize for best performance
- 📝 Filenames include content hashes for caching

#### `npm run preview`

Locally preview the production build before deploying:

```bash
npm run preview
```

This serves the production build locally so you can test it before deployment.

### Code Quality Commands

#### `npm run lint`

Runs ESLint to check code quality and potential errors:

```bash
npm run lint
```

This will:
- ✅ Check Node.js and npm versions (via `precheck`)
- 🔍 Check for code style issues
- 🐛 Identify potential bugs
- 📋 Enforce coding standards

### Upgrade Commands

#### `npm run upgrade:safe`

Safely update dependencies to their latest compatible versions:

```bash
npm run upgrade:safe
```

This command:
- Updates packages within their current version ranges
- Runs tests after upgrade to ensure compatibility

#### `npm run upgrade:minor`

Update dependencies to latest minor versions:

```bash
npm run upgrade:minor
```

**Warning:** This may introduce breaking changes. Test thoroughly after running.

#### `npm run upgrade:major`

Update dependencies to latest major versions:

```bash
npm run upgrade:major
```

**Warning:** This will likely introduce breaking changes. Use with extreme caution and test thoroughly.

## Docker Setup

### Prerequisites

- Docker installed on your system
- `.env` file configured with all required environment variables

### Build Docker Image

Build the Docker image for the application:

```bash
docker build -t hrms-frontend .
```

This command:
- Builds a Docker image tagged as `hrms-frontend`
- Uses the `Dockerfile` in the project root
- Includes all dependencies and production build

### Run Docker Container

Run the application in a Docker container:

```bash
docker run -p 3000:3000 --env-file .env hrms-frontend
```

**Options explained:**
- `-p 3000:3000` - Maps port 3000 from container to host
- `--env-file .env` - Loads environment variables from `.env` file
- `hrms-frontend` - The image name to run

### Docker Commands Reference

**Build with custom tag:**
```bash
docker build -t hrms-frontend:latest .
```

**Run in detached mode (background):**
```bash
docker run -d -p 3000:3000 --env-file .env --name hrms-frontend-container hrms-frontend
```

**View running containers:**
```bash
docker ps
```

**Stop container:**
```bash
docker stop hrms-frontend-container
```

**Remove container:**
```bash
docker rm hrms-frontend-container
```

**View container logs:**
```bash
docker logs hrms-frontend-container
```

**Run with custom port:**
```bash
docker run -p 8080:3000 --env-file .env hrms-frontend
```

**Run with environment variables inline:**
```bash
docker run -p 3000:3000 \
  -e VITE_REACT_APP_HOSTED_URL=http://localhost:5000 \
  -e VITE_REACT_APP_GOOGLE_CLIENT_ID=your-client-id \
  -e VITE_ENCRYPTION_KEY=your-encryption-key \
  hrms-frontend
```

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

## Configuration

### Port Configuration

The development server runs on port **3000** by default. To change this, modify `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3000, // Change this to your desired port
  },
})
```

### API Proxy

The project is configured to proxy API requests to `http://localhost:5000` during development. This is set in `package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

To change the backend URL:
1. Update the `proxy` field in `package.json` for development
2. Update `VITE_REACT_APP_HOSTED_URL` in `.env` for production

## Cross-Platform Support

✅ **Works on all platforms:**
- macOS ✅
- Windows ✅  
- Linux ✅

The version checking script is written in Node.js, so it works everywhere Node.js runs!

## Troubleshooting

### Node.js Version Issues

If you see an error about Node.js version:
- Ensure you have Node.js v24.11.0 or higher installed
- Use `nvm use` if you have nvm installed
- Check your version with `node --version`

### Environment Variables Not Working

- ✅ Make sure your `.env` file is in the root directory
- ✅ All environment variables must start with `VITE_` to be accessible in the app
- ✅ Restart the development server after changing `.env` file
- ✅ Check that there are no spaces around the `=` sign in `.env`

### API Connection Issues

- ✅ Ensure your backend server is running
- ✅ Check that `VITE_REACT_APP_HOSTED_URL` is correct
- ✅ Verify CORS settings on your backend
- ✅ Check browser console for specific error messages

### Google OAuth Not Working

- ✅ Verify `VITE_REACT_APP_GOOGLE_CLIENT_ID` is set correctly
- ✅ Check that authorized JavaScript origins include your domain
- ✅ Ensure the Google+ API is enabled in Google Cloud Console

### Encryption Key Issues

- ✅ Ensure `VITE_ENCRYPTION_KEY` is at least 64 hexadecimal characters
- ✅ The key must be a valid hex string (0-9, a-f)
- ✅ Generate a new key if you see encryption/decryption errors

### Docker Issues

- ✅ Ensure Docker is installed and running
- ✅ Check that `.env` file exists and has all required variables
- ✅ Verify port 3000 is not already in use
- ✅ Check Docker logs: `docker logs <container-name>`

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Docker Documentation](https://docs.docker.com/)
