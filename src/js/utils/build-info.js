/**
 * Blockdoku PWA - Build Information Utility
 * Loads and provides build information including version and build identifier
 */

export class BuildInfo {
    constructor() {
        this.buildInfo = null;
        this.loadBuildInfo();
    }
    
    async loadBuildInfo() {
        try {
            // Try to fetch build info from generated file
            const response = await fetch('./build-info.json');
            if (response.ok) {
                this.buildInfo = await response.json();
            } else {
                throw new Error('Build info file not found');
            }
        } catch (error) {
            console.warn('Build info not found, using fallback');
            this.buildInfo = this.getFallbackBuildInfo();
        }
    }
    
    getFallbackBuildInfo() {
        const now = new Date();
        const buildId = now.toISOString().slice(0, 16).replace(/[-:T]/g, '');
        
        return {
            version: '1.4.0',
            buildId: buildId,
            buildDate: now.toISOString(),
            fullVersion: `1.4.0+${buildId}`
        };
    }
    
    getVersion() {
        return this.buildInfo?.version || '1.4.0';
    }
    
    getBuildId() {
        return this.buildInfo?.buildId || 'dev';
    }
    
    getFullVersion() {
        return this.buildInfo?.fullVersion || '1.4.0+dev';
    }
    
    getBuildDate() {
        return this.buildInfo?.buildDate || new Date().toISOString();
    }
    
    getFormattedBuildDate() {
        const date = new Date(this.getBuildDate());
        return date.toLocaleString();
    }
    
    getDisplayVersion() {
        return `v${this.getFullVersion()}`;
    }
    
    isLoaded() {
        return this.buildInfo !== null;
    }
}

// Create singleton instance
export const buildInfo = new BuildInfo();
