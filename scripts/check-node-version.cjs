#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  reset: '\x1b[0m'
};

// Read required version from .nvmrc
const nvmrcPath = path.join(process.cwd(), '.nvmrc');
let requiredVersion;

try {
  requiredVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
} catch (error) {
  console.error(`${colors.red}❌ Could not read .nvmrc file${colors.reset}`);
  process.exit(1);
}

// Get current Node.js version
const currentVersion = process.version.slice(1); // Remove 'v' prefix

// Function to check if version satisfies requirement
function satisfiesVersion(current, required) {
  // Handle .x notation (e.g., "24.11.x")
  if (required.includes('.x')) {
    const requiredPrefix = required.replace(/\.x$/, '');
    const currentPrefix = current.split('.').slice(0, requiredPrefix.split('.').length).join('.');
    return currentPrefix === requiredPrefix;
  }
  
  // Handle >= operator
  if (required.startsWith('>=')) {
    const minVersion = required.slice(2);
    return compareVersions(current, minVersion) >= 0;
  }
  
  // Handle exact version
  return compareVersions(current, required) === 0;
}

// Function to compare semantic versions
function compareVersions(current, required) {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;
    
    if (currentPart > requiredPart) return 1;
    if (currentPart < requiredPart) return -1;
  }
  return 0;
}

console.log('🔍 Checking Node.js version...');
console.log(`Required: v${requiredVersion}`);
console.log(`Current:  v${currentVersion}`);

const isCompatible = satisfiesVersion(currentVersion, requiredVersion);

if (isCompatible) {
  console.log(`${colors.green}✅ Node.js version is compatible!${colors.reset}`);
} else {
  console.log(`${colors.red}❌ Node.js version does not meet requirements!${colors.reset}`);
  console.log(`${colors.yellow}Please upgrade to Node.js v${requiredVersion}${colors.reset}`);
  console.log(`${colors.yellow}Download from: https://nodejs.org/${colors.reset}`);
  if (process.platform !== 'win32') {
    console.log(`${colors.yellow}Or run: nvm use${colors.reset}`);
  }
  process.exit(1);
}