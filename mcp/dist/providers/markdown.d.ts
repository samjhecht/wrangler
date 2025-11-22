/**
 * Markdown-based issue/specification provider implementation
 */
import { Issue, IssueCreateRequest, IssueUpdateRequest, IssueFilters, IssueSearchOptions } from '../types/issues.js';
import { IssueProvider } from './base.js';
import { MarkdownProviderSettings, IssueProviderConfig } from '../types/config.js';
export declare class MarkdownIssueProvider extends IssueProvider {
    private basePath;
    private settings;
    private issueCounter;
    private collectionDirs;
    constructor(settings: MarkdownProviderSettings, _config?: IssueProviderConfig);
    createIssue(request: IssueCreateRequest): Promise<Issue>;
    getIssue(id: string): Promise<Issue | null>;
    updateIssue(request: IssueUpdateRequest): Promise<Issue>;
    deleteIssue(id: string): Promise<void>;
    listIssues(filters?: IssueFilters): Promise<Issue[]>;
    searchIssues(options: IssueSearchOptions): Promise<Issue[]>;
    getLabels(): Promise<string[]>;
    getAssignees(): Promise<string[]>;
    getProjects(): Promise<string[]>;
    isHealthy(): Promise<boolean>;
    private registerCollection;
    private getCollectionDir;
    private getCollections;
    private parseIssueFromFile;
    private matchesFilters;
    private normalizeTypes;
    private generateIssueId;
    private generateFileName;
    private slugify;
    private getNextCounter;
    private findIssueLocation;
    private assertWithinWorkspace;
}
//# sourceMappingURL=markdown.d.ts.map