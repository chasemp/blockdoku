#!/usr/bin/env node

/**
 * Generate build information for Blockdoku PWA
 * Creates a build identifier using current date/time
 */

const fs = require('fs');
const path = require('path');

// Generate build identifier using current date/time
function generateBuildId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    // Format: YYYYMMDD-HHMM
    return `${year}${month}${day}-${hour}${minute}`;
}

// Get package.json version
function getPackageVersion() {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
}

// Generate build info
function generateBuildInfo() {
    const version = getPackageVersion();
    const buildId = generateBuildId();
    const buildDate = new Date().toISOString();
    
    const buildInfo = {
        version,
        buildId,
        buildDate,
        fullVersion: `${version}+${buildId}`
    };
    
    return buildInfo;
}

// Write build info to file
function writeBuildInfo() {
    const buildInfo = generateBuildInfo();
    const srcPath = path.join(__dirname, '..', 'src', 'build-info.json');
    const rootPath = path.join(__dirname, '..', 'build-info.json');
    
    // Write to src directory for development
    fs.writeFileSync(srcPath, JSON.stringify(buildInfo, null, 2));
    
    // Write to root directory for production builds
    fs.writeFileSync(rootPath, JSON.stringify(buildInfo, null, 2));
    
    console.log(`Build info generated: ${buildInfo.fullVersion}`);
    console.log(`Build date: ${buildInfo.buildDate}`);
    
    return buildInfo;
}

// If run directly, generate and write build info
if (require.main === module) {
    writeBuildInfo();
}

module.exports = { generateBuildInfo, writeBuildInfo };
