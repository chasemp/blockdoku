# Blockdoku PWA - MCP Playwright Test Suite

## 🎯 Overview

This directory contains comprehensive MCP Playwright test suites for the Blockdoku PWA, focusing on theme switching and navigation across all pages.

## 🚀 Available Commands

### Automated Test Execution (No Manual Intervention)
```bash
# Run automated MCP Playwright tests (simulated)
npm run test:e2e:execute

# Run automated test with detailed output
npm run test:e2e:auto

# Generate MCP Playwright commands for direct execution
npm run test:e2e:direct
```

### Manual Test Execution (Requires MCP Playwright)
```bash
# View test instructions
npm run test:e2e

# View detailed instructions
npm run test:e2e:instructions

# Generate MCP Playwright commands
npm run test:mcp:commands

# Generate MCP Playwright test file
npm run test:mcp:generate
```

### Quick Reference
For a complete command comparison and usage guide, see [COMMANDS.md](./COMMANDS.md).

## 📁 Files

### Test Scripts
- **`run-e2e-tests.js`** - Main test runner that prints instructions
- **`auto-execute-mcp.js`** - Automated MCP Playwright command execution
- **`run-mcp-automated.js`** - Simulated automated test execution
- **`execute-mcp-tests.js`** - Generates MCP Playwright commands
- **`generate-mcp-test.js`** - Generates complete test file

### Test Documentation
- **`mcp-playwright-instructions.md`** - Detailed step-by-step instructions
- **`blockdoku-e2e-tests.js`** - Programmatic test suite class
- **`README.md`** - This documentation file

## 🧪 Test Coverage

### Theme Testing
- Wood, Light, Dark theme display and synchronization
- Theme changes propagating between pages
- Theme consistency during navigation

### Navigation Testing
- All direct links and back button functionality
- Complete navigation cycles
- Cross-page communication

### Performance Testing
- Page load times and console health
- Smooth transitions and state preservation
- Error detection and reporting

## 🎯 Usage Examples

### Quick Test Execution
```bash
# Start development server
npm run dev

# In another terminal, run automated tests
npm run test:e2e:execute
```

### Manual Testing with MCP Playwright
```bash
# Generate commands to copy/paste
npm run test:mcp:commands

# Then use MCP Playwright tools to execute the commands
```

### Generate Test Files
```bash
# Generate complete test file
npm run test:mcp:generate

# This creates blockdoku-mcp-test.json with all test steps
```

## 📊 Test Results

The automated test suite provides:
- ✅ **Success Rate Tracking**: Percentage of passed tests
- 📊 **Detailed Reporting**: Pass/fail counts and error details
- 🚨 **Error Detection**: Specific failure points and descriptions
- 📈 **Performance Metrics**: Execution time and efficiency

## 🔧 Customization

### Adding New Tests
1. Edit the test commands in `auto-execute-mcp.js`
2. Add new MCP Playwright commands to the `getMCPCommands()` method
3. Update the test sequence as needed

### Modifying Test Parameters
1. Update element references and selectors in the command definitions
2. Adjust timing delays in the `simulateMCPExecution()` method
3. Modify success/failure criteria as needed

## 🚨 Troubleshooting

### Common Issues
- **Server not running**: Ensure `npm run dev` is started before running tests
- **Element not found**: Update element references if UI changes
- **Timing issues**: Adjust delays in the test execution

### Debug Mode
- Add `console.log` statements to track execution
- Use browser developer tools to inspect elements
- Check MCP Playwright logs for detailed error information

## 📚 Related Documentation

- [PWA Lessons Learned](../PWA_LESSONS_LEARNED.md) - Comprehensive lessons and best practices
- [Behavioral Tests](../behavioral/README.md) - Unit and integration tests
- [Characterization Tests](../characterization/README.md) - Performance and behavior tests

## 🎉 Success Criteria

A successful test run should show:
- ✅ 100% navigation success
- ✅ 100% theme consistency
- ✅ 0 console errors
- ✅ < 2s load times
- ✅ 100% state preservation

The test suite is designed to catch the most common issues that have occurred during development, particularly around theme management and navigation.