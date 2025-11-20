#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Colors for output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m', 
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Get package name from command line
const packageName = process.argv[2];
const checkAllPackages = !packageName;

// Get current project info
let currentProject = {};
try {
  currentProject = JSON.parse(fs.readFileSync('package.json', 'utf8'));
} catch (error) {
  log('❌ Could not read package.json', colors.red);
  process.exit(1);
}

const currentNode = process.version;
const currentReact = currentProject.dependencies?.react || currentProject.devDependencies?.react || 'Not found';

if (checkAllPackages) {
  log('🔍 Checking compatibility for ALL installed packages...', colors.blue);
  log('📦 Current environment:', colors.blue);
  log(`   Node.js: ${currentNode}`);
  log(`   React: ${currentReact}`);
  log('');
  log('🔎 Scanning for incompatible packages only...', colors.yellow);
  log('');
} else {
  log(`🔍 Checking compatibility for: ${packageName}`, colors.blue);
  log(`📦 Current environment:`, colors.blue);
  log(`   Node.js: ${currentNode}`);
  log(`   React: ${currentReact}`);
  log('');
}

// Function to get package info from npm
async function getPackageInfo(pkgName) {
  try {
    const result = execSync(`npm view ${pkgName} --json`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`Could not fetch package info for ${pkgName}`);
  }
}

// Function to parse version ranges
function parseVersionRange(range) {
  if (!range) return 'Any';
  
  // Handle .x notation as-is
  if (range.includes('.x')) {
    return range;
  }
  
  // Handle multiple ranges like "^16.8.5 || ^17.0.0 || ^18.0.0"
  if (range.includes('||')) {
    const ranges = range.split('||').map(r => r.trim());
    return ranges.map(parseVersionRange).join(' OR ');
  }
  
  // Handle common patterns
  if (range.startsWith('>=')) {
    return `${range.slice(2)}+`;
  }
  if (range.startsWith('^')) {
    const version = range.slice(1);
    const major = version.split('.')[0];
    return `${major}.x.x`;
  }
  if (range.startsWith('~')) {
    const version = range.slice(1);
    const [major, minor] = version.split('.');
    return `${major}.${minor}.x`;
  }
  
  return range;
}

// Function to check if current version satisfies requirement
function checkCompatibility(current, required) {
  if (!required || required === 'Any') return { compatible: true, reason: 'No restrictions' };
  
  // Extract version numbers properly
  const getCurrentVersion = (version) => {
    const match = version.replace(/[^\d\.]/g, '').split('.');
    return {
      major: parseInt(match[0]) || 0,
      minor: parseInt(match[1]) || 0,
      patch: parseInt(match[2]) || 0
    };
  };
  
  const currentVer = getCurrentVersion(current);
  
  // Handle OR conditions
  if (required.includes('OR')) {
    const ranges = required.split(' OR ');
    for (const range of ranges) {
      const check = checkCompatibility(current, range.trim());
      if (check.compatible) return check;
    }
    return { compatible: false, reason: `None of the supported versions match ${current}` };
  }
  
  // Handle .x notation (e.g., "24.11.x" matches "24.11.0", "24.11.1", etc.)
  if (required.includes('.x')) {
    const requiredParts = required.split('.');
    const currentParts = current.replace(/[^\d\.]/g, '').split('.');
    
    for (let i = 0; i < requiredParts.length; i++) {
      if (requiredParts[i] === 'x') break;
      if (parseInt(currentParts[i]) !== parseInt(requiredParts[i])) {
        return {
          compatible: false,
          reason: `Requires ${required}, you have ${current}`
        };
      }
    }
    return { compatible: true, reason: 'Version matches pattern' };
  }
  
  // Handle version ranges
  if (required.includes('.x.x')) {
    const requiredMajor = parseInt(required.split('.')[0]);
    return {
      compatible: currentVer.major === requiredMajor,
      reason: currentVer.major === requiredMajor ? 'Major version matches' : `Requires v${requiredMajor}, you have v${currentVer.major}`
    };
  }
  
  if (required.includes('+')) {
    const minVersion = parseInt(required.replace('+', ''));
    return {
      compatible: currentVer.major >= minVersion,
      reason: currentVer.major >= minVersion ? 'Minimum version satisfied' : `Requires v${minVersion}+, you have v${currentVer.major}`
    };
  }
  
  return { compatible: true, reason: 'Unable to determine compatibility' };
}

// Check single package compatibility
async function checkSinglePackage(pkgName) {
  try {
    log('📡 Fetching package information...', colors.blue);
    const packageInfo = await getPackageInfo(pkgName);
    
    log(`📋 Package: ${packageInfo.name}@${packageInfo.version}`, colors.blue);
    log(`📄 Description: ${packageInfo.description || 'N/A'}`, colors.gray);
    log('');
    
    return await checkPackageCompatibilityDetails(packageInfo, pkgName);
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    log('Make sure the package name is correct and you have internet access.', colors.yellow);
    return { hasIssues: true, packageName: pkgName };
  }
}

// Check all installed packages
async function checkAllInstalledPackages() {
  const allDependencies = { ...currentProject.dependencies, ...currentProject.devDependencies };
  const incompatiblePackages = [];
  let checkedCount = 0;
  const totalPackages = Object.keys(allDependencies).length;
  
  log(`📊 Checking ${totalPackages} installed packages...`, colors.blue);
  
  for (const [pkgName, version] of Object.entries(allDependencies)) {
    checkedCount++;
    process.stdout.write(`\r🔄 Progress: ${checkedCount}/${totalPackages} - ${pkgName}`.padEnd(80));
    
    try {
      const packageInfo = await getPackageInfo(pkgName);
      const result = await checkPackageCompatibilityDetails(packageInfo, pkgName, true); // silent mode
      
      if (result.hasIssues) {
        incompatiblePackages.push(result);
      }
    } catch (error) {
      // Skip packages that can't be fetched (private, deprecated, etc.)
      continue;
    }
  }
  
  console.log('\n'); // New line after progress
  
  return incompatiblePackages;
}

// Check package compatibility details
async function checkPackageCompatibilityDetails(packageInfo, pkgName, silent = false) {
  const result = {
    packageName: pkgName,
    version: packageInfo.version,
    hasIssues: false,
    nodeIssues: [],
    peerIssues: [],
    description: packageInfo.description
  };
  
  // Check Node.js compatibility
  const nodeEngines = packageInfo.engines?.node;
  if (nodeEngines) {
    const nodeRange = parseVersionRange(nodeEngines);
    const nodeCheck = checkCompatibility(currentNode, nodeRange);
    
    if (!silent) {
      log('🟢 Node.js Requirements:', colors.green);
      log(`   Required: ${nodeRange}`, colors.gray);
      log(`   Current: ${currentNode}`);
    }
    
    if (nodeCheck.compatible) {
      if (!silent) log(`   ✅ Compatible: ${nodeCheck.reason}`, colors.green);
    } else {
      if (!silent) log(`   ❌ Incompatible: ${nodeCheck.reason}`, colors.red);
      result.hasIssues = true;
      result.nodeIssues.push(`Node.js: ${nodeCheck.reason}`);
    }
    if (!silent) log('');
  } else {
    if (!silent) {
      log('🟡 Node.js Requirements: No specific requirements', colors.yellow);
      log('');
    }
  }
  
  // Define optional/ignoreable dependencies
  const optionalDeps = new Set([
    '@emotion/react',
    '@mui/material-pigment-css', 
    '@testing-library/dom',
    'redux', // When using @reduxjs/toolkit
    '@babel/core', // Often optional
    'tsx', 'jiti', 'less', 'yaml', 'stylus', 'terser', 'sugarss',
    '@types/node', 'lightningcss', 'sass-embedded'
  ]);
  
  // Check peer dependencies
  const peerDeps = packageInfo.peerDependencies;
  if (peerDeps && Object.keys(peerDeps).length > 0) {
    if (!silent) log('🔗 Peer Dependencies:', colors.blue);
    
    for (const [depName, depRange] of Object.entries(peerDeps)) {
      const currentDep = currentProject.dependencies?.[depName] || currentProject.devDependencies?.[depName];
      const parsedRange = parseVersionRange(depRange);
      
      // Skip optional dependencies in silent mode (all packages check)
      if (silent && optionalDeps.has(depName) && !currentDep) {
        continue;
      }
      
      if (!silent) {
        log(`   📦 ${depName}:`);
        log(`      Required: ${parsedRange}`, colors.gray);
      }
      
      if (currentDep) {
        const compatibility = checkCompatibility(currentDep, parsedRange);
        if (!silent) log(`      Current: ${currentDep}`);
        
        if (compatibility.compatible) {
          if (!silent) log(`      ✅ Compatible: ${compatibility.reason}`, colors.green);
        } else {
          if (!silent) log(`      ❌ Incompatible: ${compatibility.reason}`, colors.red);
          result.hasIssues = true;
          result.peerIssues.push(`${depName}: ${compatibility.reason}`);
        }
      } else {
        // Only flag as issue if it's not optional
        if (!optionalDeps.has(depName)) {
          if (!silent) log(`      ⚠️  Not installed in current project`, colors.yellow);
          result.hasIssues = true;
          result.peerIssues.push(`${depName}: Not installed`);
        } else {
          if (!silent) log(`      🟡 Optional - not installed`, colors.blue);
        }
      }
      if (!silent) log('');
    }
  } else {
    if (!silent) {
      log('🟡 Peer Dependencies: None', colors.yellow);
      log('');
    }
  }
  
  // Overall assessment for single package check
  if (!silent) {
    if (result.hasIssues) {
      log('🚨 COMPATIBILITY ISSUES DETECTED!', colors.red);
      log('   This package may not work correctly with your current setup.', colors.red);
      log('   Consider:', colors.yellow);
      if (result.nodeIssues.length > 0) log('   - Updating Node.js version', colors.yellow);
      if (result.peerIssues.length > 0) log('   - Updating peer dependencies', colors.yellow);
      log('   - Using --legacy-peer-deps flag (may cause runtime issues)', colors.yellow);
      log('   - Finding an alternative package', colors.yellow);
    } else {
      log('✅ PACKAGE APPEARS COMPATIBLE!', colors.green);
      log('   Safe to install with: npm install ' + pkgName, colors.green);
    }
  }
  
  return result;
}

// Main function to handle both modes
async function checkPackageCompatibility() {
  if (checkAllPackages) {
    // Check all installed packages
    const incompatiblePackages = await checkAllInstalledPackages();
    
    if (incompatiblePackages.length === 0) {
      log('🎉 ALL PACKAGES ARE COMPATIBLE!', colors.green);
      log('   No compatibility issues found with your current setup.', colors.green);
    } else {
      log(`🚨 FOUND ${incompatiblePackages.length} INCOMPATIBLE PACKAGES:`, colors.red);
      log('');
      
      for (const pkg of incompatiblePackages) {
        log(`📦 ${pkg.packageName}@${pkg.version}`, colors.red);
        if (pkg.description) {
          log(`   📄 ${pkg.description}`, colors.gray);
        }
        
        if (pkg.nodeIssues.length > 0) {
          log('   🟥 Node.js Issues:', colors.red);
          pkg.nodeIssues.forEach(issue => log(`      • ${issue}`, colors.red));
        }
        
        if (pkg.peerIssues.length > 0) {
          log('   🟨 Peer Dependency Issues:', colors.yellow);
          pkg.peerIssues.forEach(issue => log(`      • ${issue}`, colors.yellow));
        }
        
        log('');
      }
      
      log('💡 Recommendations:', colors.blue);
      log('   • Run "npm run check-pkg <package-name>" for detailed analysis', colors.blue);
      log('   • Consider updating incompatible packages', colors.blue);
      log('   • Look for alternative packages', colors.blue);
      log('   • Use --legacy-peer-deps as last resort', colors.blue);
    }
  } else {
    // Check single package
    await checkSinglePackage(packageName);
  }
}

// Run the check
checkPackageCompatibility();
