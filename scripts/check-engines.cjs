#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the required versions from package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('❌ Could not read package.json file');
  process.exit(1);
}

const requiredNodeVersion = packageJson.engines?.node || '>=18.0.0';
const requiredNpmVersion = packageJson.engines?.npm || '>=9.0.0';

// Colors for better output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m', 
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Simple version check for ranges like ">=22.20.0" and "24.11.x"
function satisfiesVersion(current, required) {
  // Remove 'v' prefix if present
  const currentClean = current.replace('v', '');
  
  // Handle .x notation (e.g., "24.11.x")
  if (required.includes('.x')) {
    const requiredPrefix = required.replace(/\.x$/, '');
    const currentPrefix = currentClean.split('.').slice(0, requiredPrefix.split('.').length).join('.');
    return currentPrefix === requiredPrefix;
  }
  
  // Handle >= operator
  if (required.startsWith('>=')) {
    const minVersion = required.slice(2);
    return compareVersions(currentClean, minVersion) >= 0;
  }
  
  // Handle exact version
  return compareVersions(currentClean, required) === 0;
}

function compareVersions(version1, version2) {
  const v1Parts = version1.replace('v', '').split('.').map(Number);
  const v2Parts = version2.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  return 0;
}

function checkPackageCompatibility() {
  const potentiallyIncompatible = [];
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Known packages with Node version constraints
  const knownConstraints = {
    'node-sass': { maxNode: 16, suggestion: 'Replace with "sass" package' },
    'fibers': { maxNode: 16, suggestion: 'Consider removing or finding alternatives' },
    'fsevents': { minNode: 10, suggestion: 'Usually auto-resolved on macOS' }
  };
  
  for (const [pkgName, version] of Object.entries(dependencies)) {
    if (knownConstraints[pkgName]) {
      const constraint = knownConstraints[pkgName];
      const currentNodeMajor = parseInt(process.version.slice(1).split('.')[0]);
      
      if (constraint.maxNode && currentNodeMajor > constraint.maxNode) {
        potentiallyIncompatible.push({
          package: `${pkgName}@${version}`,
          issue: `May not support Node.js ${currentNodeMajor}+ (max: ${constraint.maxNode})`,
          suggestion: constraint.suggestion
        });
      }
    }
  }
  
  return potentiallyIncompatible;
}

// Main version checking
log('🔍 Checking Node.js and NPM versions...', colors.blue);
log(`Node.js Required: ${requiredNodeVersion}`);
log(`Node.js Current:  ${process.version}`);

if (!satisfiesVersion(process.version, requiredNodeVersion)) {
  log('❌ Node.js version does not meet requirements!', colors.red);
  log(`This project requires Node.js ${requiredNodeVersion}`, colors.red);
  log(`You are currently running ${process.version}`, colors.red);
  log('');
  log('Please upgrade Node.js:', colors.yellow);
  log('- Using nvm: nvm install --lts && nvm use --lts', colors.yellow);
  log('- Or download from: https://nodejs.org/', colors.yellow);
  
  // Show incompatible packages if any
  const incompatible = checkPackageCompatibility();
  if (incompatible.length > 0) {
    log('\n⚠️  Additionally, these packages may cause issues:', colors.yellow);
    incompatible.forEach(item => {
      log(`   • ${item.package}: ${item.issue}`, colors.yellow);
      log(`     💡 ${item.suggestion}`, colors.yellow);
    });
  }
  
  process.exit(1);
} else {
  log('✅ Node.js version is compatible', colors.green);
}

// Check npm version if available
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  log(`NPM Required: ${requiredNpmVersion}`);
  log(`NPM Current:  v${npmVersion}`);
  
  if (!satisfiesVersion(`v${npmVersion}`, requiredNpmVersion)) {
    log('❌ NPM version does not meet requirements!', colors.red);
    log(`This project requires NPM ${requiredNpmVersion}`, colors.red);
    log(`You are currently running v${npmVersion}`, colors.red);
    log('');
    log('Please upgrade NPM: npm install -g npm@latest', colors.yellow);
    process.exit(1);
  } else {
    log('✅ NPM version is compatible', colors.green);
  }
} catch (error) {
  log('⚠️  Could not check NPM version', colors.yellow);
}

// Check for potentially incompatible packages (only when explicitly requested)
if (process.argv.includes('--check-packages')) {
  const incompatible = checkPackageCompatibility();
  if (incompatible.length > 0) {
    log('\n⚠️  Potentially incompatible packages detected:', colors.yellow);
    incompatible.forEach(item => {
      log(`   • ${item.package}: ${item.issue}`, colors.yellow);
      log(`     💡 ${item.suggestion}`, colors.yellow);
    });
    log('\n   Run with caution or consider updating these packages.\n', colors.yellow);
  } else {
    log('\n✅ No known package compatibility issues detected', colors.green);
  }
}