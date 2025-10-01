# Blockdoku PWA - MCP Playwright Test Commands

## 🎯 Quick Reference

### Automated Test Execution (No Manual Intervention Required)

```bash
# Run automated MCP Playwright tests (simulated execution)
npm run test:e2e:execute

# Run automated test with detailed output
npm run test:e2e:auto

# Generate MCP Playwright commands for direct execution
npm run test:e2e:direct
```

### Manual Test Execution (Requires MCP Playwright)

```bash
# View test instructions (original)
npm run test:e2e

# View detailed instructions
npm run test:e2e:instructions

# Generate MCP Playwright commands
npm run test:mcp:commands

# Generate complete test file
npm run test:mcp:generate
```

## 🚀 Recommended Workflow

### Option 1: Fully Automated (No MCP Playwright Required)
```bash
# Start development server
npm run dev

# In another terminal, run automated tests
npm run test:e2e:execute
```

### Option 2: MCP Playwright Direct Execution
```bash
# Start development server
npm run dev

# Generate MCP Playwright commands
npm run test:e2e:direct

# Copy and paste the generated commands into MCP Playwright
# No further instructions needed - just execute the commands
```

### Option 3: Manual Testing with Instructions
```bash
# Start development server
npm run dev

# View detailed instructions
npm run test:e2e:instructions

# Follow the step-by-step guide with MCP Playwright
```

## 📊 Command Comparison

| Command | Type | MCP Playwright Required | Manual Steps | Output |
|---------|------|------------------------|--------------|---------|
| `test:e2e:execute` | Automated | No | None | Simulated test results |
| `test:e2e:auto` | Automated | No | None | Detailed test execution |
| `test:e2e:direct` | Generated | Yes | Copy/paste commands | Ready-to-use commands |
| `test:e2e` | Instructions | Yes | Follow guide | Step-by-step instructions |
| `test:e2e:instructions` | Instructions | Yes | Follow guide | Detailed instructions |
| `test:mcp:commands` | Generated | Yes | Copy/paste commands | MCP Playwright commands |
| `test:mcp:generate` | Generated | No | None | Complete test file |

## 🎯 Best Use Cases

### For Quick Testing
- Use `npm run test:e2e:execute` for fast, automated testing
- No MCP Playwright setup required
- Good for CI/CD or quick validation

### For MCP Playwright Integration
- Use `npm run test:e2e:direct` for ready-to-use commands
- Copy and paste commands directly into MCP Playwright
- No manual instruction following required

### For Learning/Debugging
- Use `npm run test:e2e:instructions` for detailed step-by-step guide
- Good for understanding what the tests do
- Helpful for debugging specific issues

## 🔧 Customization

### Adding New Tests
1. Edit `tests/playwright/auto-execute-mcp.js`
2. Add new commands to the `getMCPCommands()` method
3. Update test sequence as needed

### Modifying Commands
1. Edit `tests/playwright/run-mcp-direct.js`
2. Update element references and selectors
3. Add or remove test steps

### Changing Test Parameters
1. Edit `tests/playwright/run-mcp-automated.js`
2. Modify timing delays and success criteria
3. Update error handling logic

## 📈 Success Metrics

All test commands should achieve:
- ✅ **100% Navigation Success**: All links work correctly
- ✅ **100% Theme Consistency**: Themes sync across pages
- ✅ **0 Console Errors**: No JavaScript errors during testing
- ✅ **< 2s Load Times**: All pages load quickly
- ✅ **100% State Preservation**: Game state maintained during navigation

## 🚨 Troubleshooting

### Common Issues
- **Server not running**: Ensure `npm run dev` is started first
- **Element not found**: Update element references if UI changes
- **Timing issues**: Adjust delays in test execution scripts

### Debug Mode
- Add `console.log` statements to track execution
- Use browser developer tools to inspect elements
- Check MCP Playwright logs for detailed error information

## 📚 Related Documentation

- [PWA Lessons Learned](../../PWA_LESSONS_LEARNED.md) - Comprehensive lessons and best practices
- [Behavioral Tests](../behavioral/README.md) - Unit and integration tests
- [Characterization Tests](../characterization/README.md) - Performance and behavior tests
- [Main Playwright README](./README.md) - Detailed test suite documentation
