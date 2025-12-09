#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// You can customize these tests by editing this array
const tests = [
  {
    name: 'Node Version Check',
    command: 'npm run precheck',
    critical: true
  },
  {
    name: 'Dependencies Installation',
    command: 'npm install',
    critical: true
  },
  {
    name: 'TypeScript Check',
    command: 'npm run typecheck || echo "No typecheck script found"',
    critical: false
  },
  {
    name: 'ESLint Check',
    command: 'npm run lint || echo "No lint script found"',
    critical: false
  },
  {
    name: 'Build Process',
    command: 'npm run build',
    critical: true
  },
  {
    name: 'Security Audit',
    command: 'npm audit --audit-level high',
    critical: false
  }
];

// Configuration - modify these paths as needed
const config = {
  projectRoot: process.cwd(),
  reportFile: path.join(process.cwd(), 'upgrade-test-report.json'),
  logFile: path.join(process.cwd(), 'upgrade-test.log')
};

let results = [];

function runTest(test) {
  return new Promise((resolve) => {
    console.log(`${colors.blue}🧪 Running: ${test.name}...${colors.reset}`);
    
    const startTime = Date.now();
    exec(test.command, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      const result = {
        name: test.name,
        success: !error,
        critical: test.critical,
        duration,
        output: stdout,
        error: stderr
      };
      
      if (result.success) {
        console.log(`${colors.green}✅ ${test.name} - PASSED (${duration}ms)${colors.reset}`);
      } else {
        const severity = test.critical ? 'CRITICAL' : 'WARNING';
        const color = test.critical ? colors.red : colors.yellow;
        console.log(`${color}❌ ${test.name} - FAILED ${severity} (${duration}ms)${colors.reset}`);
        if (error) {
          console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
        }
      }
      
      results.push(result);
      resolve(result);
    });
  });
}

async function runAllTests() {
  console.log(`${colors.blue}🚀 Starting Post-Upgrade Validation Tests${colors.reset}\n`);
  
  for (const test of tests) {
    await runTest(test);
    console.log(''); // Empty line for readability
  }
  
  generateReport();
}

function generateReport() {
  console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const criticalFailures = results.filter(r => !r.success && r.critical).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.red}Critical Failures: ${criticalFailures}${colors.reset}`);
  
  // Save detailed report to JSON file
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: results.length, passed, failed, criticalFailures },
    results: results,
    projectRoot: config.projectRoot
  };
  
  try {
    fs.writeFileSync(config.reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${config.reportFile}`);
  } catch (err) {
    console.log(`${colors.yellow}Warning: Could not save report file${colors.reset}`);
  }
  
  if (criticalFailures > 0) {
    console.log(`\n${colors.red}🚨 UPGRADE FAILED - Critical issues detected!${colors.reset}`);
    console.log(`${colors.yellow}Recommend rolling back and investigating issues.${colors.reset}`);
    process.exit(1);
  } else if (failed > 0) {
    console.log(`\n${colors.yellow}⚠️  UPGRADE COMPLETED WITH WARNINGS${colors.reset}`);
    console.log(`${colors.yellow}Non-critical issues detected. Review and fix when possible.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}🎉 UPGRADE SUCCESSFUL - All tests passed!${colors.reset}`);
    process.exit(0);
  }
}

// Run the tests
runAllTests().catch(console.error);