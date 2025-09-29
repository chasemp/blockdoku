#!/usr/bin/env node

/**
 * Generate build information for Blockdoku PWA
 * Creates a build identifier using current date/time
 *
 * IMPORTANT BUILD SYSTEM NOTE:
 * - This script MUST run as part of the build for the site to function as expected.
 * - It writes build metadata to two files:
 *   1) src/build-info.json (used during development)
 *   2) build-info.json at repo root (used by the deployed app)
 * - It ALSO writes a plain-text `build` file at the repo root containing the
 *   `fullVersion` (e.g., 1.4.0+YYYYMMDD-HHMM) for CI/CD and support.
 * - The UI (Settings → About) reads build-info.json at runtime. If this file is missing,
 *   the app falls back to a synthesized dev value which reduces traceability.
 * - Ensure npm scripts keep this wired: see package.json `prebuild` and `postbuild`.
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
    const buildFilePath = path.join(__dirname, '..', 'build');
    
    // Write to src directory for development
    fs.writeFileSync(srcPath, JSON.stringify(buildInfo, null, 2));
    
    // Write to root directory for production builds
    fs.writeFileSync(rootPath, JSON.stringify(buildInfo, null, 2));
    
    // Also write a plain-text build file with fullVersion for quick reference
    // This is helpful for human inspection, support, and CI artifacts.
    try {
        fs.writeFileSync(buildFilePath, `${buildInfo.fullVersion}\n`);
        console.log(`Build file written: ${buildFilePath}`);
    } catch (err) {
        console.warn('Failed to write build file:', err);
    }
    
    console.log(`Build info generated: ${buildInfo.fullVersion}`);
    console.log(`Build date: ${buildInfo.buildDate}`);
    
    return buildInfo;
}

// If run directly, generate and write build info
if (require.main === module) {
    writeBuildInfo();
}

module.exports = { generateBuildInfo, writeBuildInfo };
