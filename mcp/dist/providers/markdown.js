/**
 * Markdown-based issue/specification provider implementation
 */
import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import * as path from 'path';
import * as fsExtra from 'fs-extra';
const matter = __require("gray-matter");
const fastGlob = __require("fast-glob");
const glob = fastGlob.glob;
// ESM compat: fs-extra exports functions on the default export in ESM
const fs = fsExtra.default || fsExtra;
import { IssueProvider } from './base.js';
import { getMCPDirectories } from '../workspace-schema.js';
// Get defaults from workspace schema
const schemaDefaults = getMCPDirectories();
const DEFAULT_ISSUE_DIR = schemaDefaults.issuesDirectory;
const DEFAULT_SPEC_DIR = schemaDefaults.specificationsDirectory;
const DEFAULT_IDEA_DIR = schemaDefaults.ideasDirectory;
export class MarkdownIssueProvider extends IssueProvider {
    basePath;
    settings;
    issueCounter = 0;
    collectionDirs = new Map();
    constructor(settings, _config) {
        super();
        this.settings = settings;
        this.basePath = path.resolve(settings.basePath || process.cwd());
        this.registerCollection('issue', settings.issuesDirectory ?? DEFAULT_ISSUE_DIR);
        const collections = settings.collections ?? {};
        if (settings.specificationsDirectory) {
            collections['specification'] = { directory: settings.specificationsDirectory };
        }
        if (!collections['specification']) {
            collections['specification'] = { directory: DEFAULT_SPEC_DIR };
        }
        if (!collections['idea']) {
            collections['idea'] = { directory: DEFAULT_IDEA_DIR };
        }
        for (const [type, details] of Object.entries(collections)) {
            this.registerCollection(type, details.directory);
        }
    }
    async createIssue(request) {
        const artifactType = request.type ?? 'issue';
        const targetDir = this.getCollectionDir(artifactType);
        this.assertWithinWorkspace(targetDir, 'access issue directory');
        await fs.ensureDir(targetDir);
        const issueId = await this.generateIssueId();
        const fileName = this.generateFileName(issueId, request.title);
        const filePath = path.join(targetDir, fileName);
        this.assertWithinWorkspace(filePath, 'write issue file');
        const now = new Date();
        const issue = {
            id: issueId,
            title: request.title,
            description: request.description,
            type: artifactType,
            status: request.status || 'open',
            priority: request.priority || 'medium',
            labels: request.labels || [],
            createdAt: now,
            updatedAt: now,
            ...(request.assignee && { assignee: request.assignee }),
            ...(request.project && { project: request.project }),
            ...(request.wranglerContext && { wranglerContext: request.wranglerContext }),
        };
        const frontmatter = {
            id: issue.id,
            title: issue.title,
            type: issue.type,
            status: issue.status,
            priority: issue.priority,
            labels: issue.labels,
            createdAt: issue.createdAt.toISOString(),
            updatedAt: issue.updatedAt.toISOString(),
        };
        if (issue.assignee)
            frontmatter.assignee = issue.assignee;
        if (issue.project)
            frontmatter.project = issue.project;
        if (issue.wranglerContext)
            frontmatter.wranglerContext = issue.wranglerContext;
        const fileContent = matter.stringify(request.description, frontmatter);
        await fs.writeFile(filePath, fileContent, 'utf-8');
        return issue;
    }
    async getIssue(id) {
        const location = await this.findIssueLocation(id);
        if (!location) {
            return null;
        }
        const content = await fs.readFile(location.absolutePath, 'utf-8');
        const parsed = matter(content);
        return this.parseIssueFromFile(parsed, location.absolutePath, location.type);
    }
    async updateIssue(request) {
        const existingIssue = await this.getIssue(request.id);
        if (!existingIssue) {
            throw new Error(`Issue not found: ${request.id}`);
        }
        const location = await this.findIssueLocation(request.id);
        if (!location) {
            throw new Error(`Issue file not found: ${request.id}`);
        }
        const targetType = request.type ?? existingIssue.type ?? 'issue';
        const targetDir = this.getCollectionDir(targetType);
        this.assertWithinWorkspace(targetDir, 'access issue directory');
        const destinationPath = path.join(targetDir, path.basename(location.absolutePath));
        this.assertWithinWorkspace(destinationPath, 'write issue file');
        if (targetType !== location.type) {
            await fs.ensureDir(targetDir);
            await fs.move(location.absolutePath, destinationPath, { overwrite: true });
            location.absolutePath = destinationPath;
            location.directory = targetDir;
            location.type = targetType;
        }
        const updatedIssue = {
            ...existingIssue,
            title: request.title || existingIssue.title,
            description: request.description || existingIssue.description,
            type: targetType,
            status: request.status || existingIssue.status,
            priority: request.priority || existingIssue.priority,
            labels: request.labels || existingIssue.labels,
            assignee: request.assignee !== undefined ? request.assignee : existingIssue.assignee,
            project: request.project !== undefined ? request.project ?? undefined : existingIssue.project,
            updatedAt: new Date(),
            wranglerContext: request.wranglerContext || existingIssue.wranglerContext,
            createdAt: existingIssue.createdAt,
        };
        const frontmatter = {
            id: updatedIssue.id,
            title: updatedIssue.title,
            type: updatedIssue.type,
            status: updatedIssue.status,
            priority: updatedIssue.priority,
            labels: updatedIssue.labels,
            createdAt: updatedIssue.createdAt.toISOString(),
            updatedAt: updatedIssue.updatedAt.toISOString(),
        };
        if (updatedIssue.assignee)
            frontmatter.assignee = updatedIssue.assignee;
        if (updatedIssue.project)
            frontmatter.project = updatedIssue.project;
        if (updatedIssue.wranglerContext)
            frontmatter.wranglerContext = updatedIssue.wranglerContext;
        const fileContent = matter.stringify(updatedIssue.description, frontmatter);
        await fs.writeFile(location.absolutePath, fileContent, 'utf-8');
        return updatedIssue;
    }
    async deleteIssue(id) {
        const location = await this.findIssueLocation(id);
        if (!location) {
            throw new Error(`Issue not found: ${id}`);
        }
        this.assertWithinWorkspace(location.absolutePath, 'delete issue file');
        await fs.remove(location.absolutePath);
    }
    async listIssues(filters) {
        const typesFilter = this.normalizeTypes(filters);
        const collections = this.getCollections(typesFilter);
        const issues = [];
        for (const { type, directory } of collections) {
            if (!await fs.pathExists(directory)) {
                continue;
            }
            const files = await glob('**/*.md', { cwd: directory, absolute: true });
            for (const filePath of files) {
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const parsed = matter(content);
                    const issue = this.parseIssueFromFile(parsed, filePath, type);
                    if (this.matchesFilters(issue, filters)) {
                        issues.push(issue);
                    }
                }
                catch {
                    continue;
                }
            }
        }
        const limit = filters?.limit || 100;
        const offset = filters?.offset || 0;
        return issues
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(offset, offset + limit);
    }
    async searchIssues(options) {
        const allIssues = await this.listIssues(options.filters);
        const query = options.query.toLowerCase();
        const fields = options.fields || ['title', 'description', 'labels'];
        const matchingIssues = allIssues.filter(issue => {
            for (const field of fields) {
                switch (field) {
                    case 'title':
                        if (issue.title.toLowerCase().includes(query))
                            return true;
                        break;
                    case 'description':
                        if (issue.description.toLowerCase().includes(query))
                            return true;
                        break;
                    case 'labels':
                        if (issue.labels.some(label => label.toLowerCase().includes(query)))
                            return true;
                        break;
                }
            }
            return false;
        });
        if (options.sortBy) {
            matchingIssues.sort((a, b) => {
                let aVal;
                let bVal;
                switch (options.sortBy) {
                    case 'created':
                        aVal = a.createdAt.getTime();
                        bVal = b.createdAt.getTime();
                        break;
                    case 'updated':
                        aVal = a.updatedAt.getTime();
                        bVal = b.createdAt.getTime();
                        break;
                    case 'priority':
                        const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
                        aVal = priorityOrder[a.priority];
                        bVal = priorityOrder[b.priority];
                        break;
                    case 'status':
                        aVal = a.status;
                        bVal = b.status;
                        break;
                    default:
                        return 0;
                }
                const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return options.sortOrder === 'desc' ? -result : result;
            });
        }
        return matchingIssues;
    }
    async getLabels() {
        const issues = await this.listIssues();
        const labels = new Set();
        for (const issue of issues) {
            for (const label of issue.labels) {
                labels.add(label);
            }
        }
        return Array.from(labels).sort();
    }
    async getAssignees() {
        const issues = await this.listIssues();
        const assignees = new Set();
        for (const issue of issues) {
            if (issue.assignee) {
                assignees.add(issue.assignee);
            }
        }
        return Array.from(assignees).sort();
    }
    async getProjects() {
        const issues = await this.listIssues();
        const projects = new Set();
        for (const issue of issues) {
            if (issue.project) {
                projects.add(issue.project);
            }
        }
        return Array.from(projects).sort();
    }
    async isHealthy() {
        try {
            const collections = this.getCollections();
            if (collections.length === 0) {
                return false;
            }
            for (const { directory } of collections) {
                if (await fs.pathExists(directory)) {
                    return true;
                }
            }
            return false;
        }
        catch {
            return false;
        }
    }
    registerCollection(type, directory) {
        if (!directory) {
            return;
        }
        const normalizedType = type;
        const absolute = path.isAbsolute(directory) ? directory : path.join(this.basePath, directory);
        this.assertWithinWorkspace(absolute, `register collection for ${type}`);
        if (!this.collectionDirs.has(normalizedType)) {
            this.collectionDirs.set(normalizedType, absolute);
        }
    }
    getCollectionDir(type) {
        const dir = this.collectionDirs.get(type);
        if (!dir) {
            throw new Error(`Unsupported artifact type: ${type}`);
        }
        return dir;
    }
    getCollections(types) {
        const entries = Array.from(this.collectionDirs.entries());
        if (!types || types.length === 0) {
            return entries.map(([type, directory]) => ({ type, directory }));
        }
        const set = new Set(types);
        return entries
            .filter(([type]) => set.has(type))
            .map(([type, directory]) => ({ type, directory }));
    }
    parseIssueFromFile(parsed, filePath, defaultType) {
        const data = parsed.data;
        const type = data.type || defaultType || 'issue';
        return {
            id: data.id || path.basename(filePath, '.md'),
            title: data.title || 'Untitled Issue',
            description: parsed.content.trim(),
            type,
            status: data.status || 'open',
            priority: data.priority || 'medium',
            labels: Array.isArray(data.labels) ? data.labels : [],
            assignee: data.assignee,
            project: data.project,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
            closedAt: data.closedAt ? new Date(data.closedAt) : undefined,
            wranglerContext: data.wranglerContext,
        };
    }
    matchesFilters(issue, filters) {
        if (!filters)
            return true;
        const typesFilter = this.normalizeTypes(filters);
        if (typesFilter && typesFilter.length > 0 && !typesFilter.includes(issue.type)) {
            return false;
        }
        if (filters.ids && filters.ids.length > 0 && !filters.ids.includes(issue.id))
            return false;
        if (filters.status && filters.status.length > 0 && !filters.status.includes(issue.status))
            return false;
        if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(issue.priority))
            return false;
        if (filters.labels && !filters.labels.some(label => issue.labels.includes(label)))
            return false;
        if (filters.assignee && issue.assignee !== filters.assignee)
            return false;
        if (filters.project && issue.project !== filters.project)
            return false;
        if (filters.parentTaskId) {
            const contextParent = issue.wranglerContext?.parentTaskId;
            if (!contextParent || contextParent !== filters.parentTaskId) {
                return false;
            }
        }
        if (filters.createdAfter && issue.createdAt < filters.createdAfter)
            return false;
        if (filters.createdBefore && issue.createdAt > filters.createdBefore)
            return false;
        return true;
    }
    normalizeTypes(filters) {
        if (!filters) {
            return undefined;
        }
        if (filters.types && filters.types.length > 0) {
            return filters.types;
        }
        if (filters.type) {
            return [filters.type];
        }
        return undefined;
    }
    async generateIssueId() {
        this.issueCounter = await this.getNextCounter();
        return this.issueCounter.toString().padStart(6, '0');
    }
    generateFileName(id, title) {
        switch (this.settings.fileNaming) {
            case 'timestamp':
                return `${Date.now()}-${this.slugify(title)}.md`;
            case 'counter':
                return `${id}-${this.slugify(title)}.md`;
            case 'slug':
            default:
                return `${this.slugify(title)}-${id}.md`;
        }
    }
    slugify(text) {
        let slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);
        if (slug.startsWith('plan-step-')) {
            slug = slug.slice('plan-step-'.length);
        }
        if (slug.length === 0) {
            slug = 'issue';
        }
        return slug;
    }
    async getNextCounter() {
        const numbers = [];
        for (const { directory } of this.getCollections()) {
            if (!await fs.pathExists(directory)) {
                continue;
            }
            const files = await glob('**/*.md', { cwd: directory });
            for (const file of files) {
                const match = path.basename(file).match(/^(\d+)/);
                if (match) {
                    const value = parseInt(match[1], 10);
                    if (!isNaN(value)) {
                        numbers.push(value);
                    }
                }
            }
        }
        return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    }
    async findIssueLocation(id) {
        for (const { type, directory } of this.getCollections()) {
            if (!await fs.pathExists(directory)) {
                continue;
            }
            const files = await glob('**/*.md', { cwd: directory });
            for (const fileName of files) {
                const absolutePath = path.join(directory, fileName);
                this.assertWithinWorkspace(absolutePath, 'read issue file');
                try {
                    const content = await fs.readFile(absolutePath, 'utf-8');
                    const parsed = matter(content);
                    if (parsed.data.id === id) {
                        return {
                            type: type,
                            directory,
                            fileName,
                            absolutePath,
                        };
                    }
                }
                catch {
                    continue;
                }
            }
        }
        return null;
    }
    assertWithinWorkspace(targetPath, action) {
        const resolvedTarget = path.resolve(targetPath);
        const relative = path.relative(this.basePath, resolvedTarget);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            throw new Error(`Attempted to ${action} outside of workspace base "${this.basePath}": ${resolvedTarget}`);
        }
    }
}
//# sourceMappingURL=markdown.js.map