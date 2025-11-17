/**
 * Provider factory for creating issue providers
 */
import { IssueProvider } from './base.js';
import { WranglerMCPConfig, IssueProviderConfig } from '../types/config.js';
export declare class ProviderFactory {
    private config;
    private issueProvider?;
    constructor(config: WranglerMCPConfig);
    /**
     * Get the issue provider instance
     */
    getIssueProvider(): IssueProvider;
    /**
     * Get the current configuration
     */
    getConfig(): WranglerMCPConfig;
    /**
     * Create an issue provider based on configuration
     */
    private createIssueProvider;
    /**
     * Static helper for creating provider directly (legacy)
     */
    static createProvider(config: IssueProviderConfig): IssueProvider;
}
//# sourceMappingURL=factory.d.ts.map