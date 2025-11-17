/**
 * Provider factory for creating issue providers
 */
import { MarkdownIssueProvider } from './markdown.js';
export class ProviderFactory {
    config;
    issueProvider;
    constructor(config) {
        this.config = config;
    }
    /**
     * Get the issue provider instance
     */
    getIssueProvider() {
        if (!this.issueProvider) {
            this.issueProvider = this.createIssueProvider();
        }
        return this.issueProvider;
    }
    /**
     * Get the current configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Create an issue provider based on configuration
     */
    createIssueProvider() {
        const issueConfig = this.config.issues;
        if (!issueConfig) {
            throw new Error('Issue provider configuration not found');
        }
        switch (issueConfig.provider) {
            case 'markdown':
                if (!issueConfig.settings) {
                    throw new Error('Markdown provider settings are required');
                }
                return new MarkdownIssueProvider(issueConfig.settings, issueConfig);
            case 'mock':
                // Mock provider doesn't require settings (for testing)
                return new MarkdownIssueProvider({}, issueConfig);
            default:
                throw new Error(`Unsupported provider type: ${issueConfig.provider}`);
        }
    }
    /**
     * Static helper for creating provider directly (legacy)
     */
    static createProvider(config) {
        switch (config.provider) {
            case 'markdown':
                if (!config.settings) {
                    throw new Error('Markdown provider settings are required');
                }
                return new MarkdownIssueProvider(config.settings, config);
            case 'mock':
                return new MarkdownIssueProvider({}, config);
            default:
                throw new Error(`Unsupported provider type: ${config.provider}`);
        }
    }
}
//# sourceMappingURL=factory.js.map