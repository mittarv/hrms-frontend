# TMS Web Application

This project is built with [Vite](https://vitejs.dev/) + [React](https://react.dev/).

## Prerequisites

This project requires Node.js LTS version **24.0.0** or higher.

## Node.js Version Behavior

### ✅ What Works:
- **Node.js v24.0.0+**: Perfect! ✨
- **Node.js v25.x or higher**: Also supported ✅

### ❌ What Doesn't Work:
- **Node.js v23.x or lower**: Too old, project will refuse to start ❌

## Setup Instructions

### Option 1: Using Node Version Manager (nvm) [Recommended]

Install the exact project version:
```bash
nvm use
# This automatically switches to v24.11.0
```

### Option 2: Manual Installation

If you don't have nvm, download Node.js v24+ from [nodejs.org](https://nodejs.org/)

## Running the Project

The project automatically checks your Node.js version when you run:
```bash
npm run dev    # Starts development server
npm run build  # Builds for production
npm run lint   # Runs linting
```

If you have an incompatible version, you'll see a clear error message with instructions.

## Cross-Platform Support

✅ **Works on all platforms:**
- macOS ✅
- Windows ✅  
- Linux ✅

The version checking script is written in Node.js, so it works everywhere Node.js runs!

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode with Vite.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes with hot module replacement (HMR).\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include hashes.\
Your app is ready to be deployed!

### `npm run preview`

Locally preview the production build before deploying.

### `npm run lint`

Runs ESLint to check code quality and potential errors.

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
