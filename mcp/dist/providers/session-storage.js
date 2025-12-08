/**
 * Session storage provider for orchestration workflows
 *
 * Handles persistence of session state, checkpoints, and audit logs
 * in the .wrangler/sessions/ directory.
 */
import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import * as path from 'path';
import * as fsExtra from 'fs-extra';
const fastGlob = __require("fast-glob");
const glob = fastGlob.glob;
// ESM compat: fs-extra exports functions on the default export in ESM
const fs = fsExtra.default || fsExtra;
const SESSIONS_DIR = '.wrangler/sessions';
export class SessionStorageProvider {
    basePath;
    sessionsDir;
    constructor(config) {
        this.basePath = path.resolve(config.basePath || process.cwd());
        this.sessionsDir = path.join(this.basePath, SESSIONS_DIR);
    }
    /**
     * Get the sessions directory path
     */
    getSessionsDir() {
        return this.sessionsDir;
    }
    /**
     * Get the directory path for a specific session
     */
    getSessionDir(sessionId) {
        this.assertValidSessionId(sessionId);
        return path.join(this.sessionsDir, sessionId);
    }
    /**
     * Create a new session directory and initialize files
     */
    async createSession(session) {
        const sessionDir = this.getSessionDir(session.id);
        this.assertWithinWorkspace(sessionDir, 'create session directory');
        await fs.ensureDir(sessionDir);
        // Write context.json
        const contextPath = path.join(sessionDir, 'context.json');
        await fs.writeJson(contextPath, session, { spaces: 2 });
        // Initialize audit.jsonl with init entry
        const auditPath = path.join(sessionDir, 'audit.jsonl');
        const initEntry = {
            phase: 'init',
            timestamp: new Date().toISOString(),
            status: 'complete',
            session_id: session.id,
            worktree: session.worktreePath,
            branch: session.branchName,
            spec_file: session.specFile,
        };
        await fs.writeFile(auditPath, JSON.stringify(initEntry) + '\n', 'utf-8');
    }
    /**
     * Get a session by ID
     */
    async getSession(sessionId) {
        const sessionDir = this.getSessionDir(sessionId);
        const contextPath = path.join(sessionDir, 'context.json');
        if (!await fs.pathExists(contextPath)) {
            return null;
        }
        try {
            return await fs.readJson(contextPath);
        }
        catch {
            return null;
        }
    }
    /**
     * Update an existing session
     */
    async updateSession(session) {
        const sessionDir = this.getSessionDir(session.id);
        this.assertWithinWorkspace(sessionDir, 'update session');
        if (!await fs.pathExists(sessionDir)) {
            throw new Error(`Session not found: ${session.id}`);
        }
        const contextPath = path.join(sessionDir, 'context.json');
        session.updatedAt = new Date().toISOString();
        await fs.writeJson(contextPath, session, { spaces: 2 });
    }
    /**
     * Append an audit entry to the session's audit log
     */
    async appendAuditEntry(sessionId, entry) {
        const sessionDir = this.getSessionDir(sessionId);
        this.assertWithinWorkspace(sessionDir, 'append audit entry');
        if (!await fs.pathExists(sessionDir)) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        const auditPath = path.join(sessionDir, 'audit.jsonl');
        await fs.appendFile(auditPath, JSON.stringify(entry) + '\n', 'utf-8');
    }
    /**
     * Get recent audit entries for a session
     */
    async getAuditEntries(sessionId, limit = 20) {
        const sessionDir = this.getSessionDir(sessionId);
        const auditPath = path.join(sessionDir, 'audit.jsonl');
        if (!await fs.pathExists(auditPath)) {
            return [];
        }
        try {
            const content = await fs.readFile(auditPath, 'utf-8');
            const lines = content.trim().split('\n').filter((line) => line.length > 0);
            const entries = lines.map((line) => JSON.parse(line));
            // Return most recent entries
            return entries.slice(-limit);
        }
        catch {
            return [];
        }
    }
    /**
     * Save a checkpoint for session recovery
     */
    async saveCheckpoint(checkpoint) {
        const sessionDir = this.getSessionDir(checkpoint.sessionId);
        this.assertWithinWorkspace(sessionDir, 'save checkpoint');
        if (!await fs.pathExists(sessionDir)) {
            throw new Error(`Session not found: ${checkpoint.sessionId}`);
        }
        // Write checkpoint.json
        const checkpointPath = path.join(sessionDir, 'checkpoint.json');
        await fs.writeJson(checkpointPath, checkpoint, { spaces: 2 });
        // Append checkpoint entry to audit log
        const auditEntry = {
            phase: 'checkpoint',
            timestamp: new Date().toISOString(),
            status: 'complete',
            checkpoint_id: checkpoint.checkpointId,
            tasks_completed: checkpoint.tasksCompleted.length,
            tasks_pending: checkpoint.tasksPending.length,
        };
        await this.appendAuditEntry(checkpoint.sessionId, auditEntry);
    }
    /**
     * Get the latest checkpoint for a session
     */
    async getCheckpoint(sessionId) {
        const sessionDir = this.getSessionDir(sessionId);
        const checkpointPath = path.join(sessionDir, 'checkpoint.json');
        if (!await fs.pathExists(checkpointPath)) {
            return null;
        }
        try {
            return await fs.readJson(checkpointPath);
        }
        catch {
            return null;
        }
    }
    /**
     * Write test output to session directory
     */
    async writeTestOutput(sessionId, output) {
        const sessionDir = this.getSessionDir(sessionId);
        this.assertWithinWorkspace(sessionDir, 'write test output');
        if (!await fs.pathExists(sessionDir)) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        const outputPath = path.join(sessionDir, 'final-test-output.txt');
        await fs.writeFile(outputPath, output, 'utf-8');
    }
    /**
     * Write git status to session directory
     */
    async writeGitStatus(sessionId, status) {
        const sessionDir = this.getSessionDir(sessionId);
        this.assertWithinWorkspace(sessionDir, 'write git status');
        if (!await fs.pathExists(sessionDir)) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        const statusPath = path.join(sessionDir, 'git-status.txt');
        await fs.writeFile(statusPath, status, 'utf-8');
    }
    /**
     * List all sessions, optionally filtered by status
     */
    async listSessions(statusFilter) {
        if (!await fs.pathExists(this.sessionsDir)) {
            return [];
        }
        const sessions = [];
        const dirs = await glob('*/', { cwd: this.sessionsDir, onlyDirectories: true });
        for (const dir of dirs) {
            const sessionId = path.basename(dir);
            const session = await this.getSession(sessionId);
            if (session) {
                if (!statusFilter || statusFilter.includes(session.status)) {
                    sessions.push(session);
                }
            }
        }
        // Sort by updatedAt descending (most recent first)
        sessions.sort((a, b) => {
            const aTime = new Date(a.updatedAt).getTime();
            const bTime = new Date(b.updatedAt).getTime();
            return bTime - aTime;
        });
        return sessions;
    }
    /**
     * Find the most recent incomplete session
     */
    async findIncompleteSession() {
        const incompleteSessions = await this.listSessions(['running', 'paused']);
        return incompleteSessions.length > 0 ? incompleteSessions[0] : null;
    }
    /**
     * Check if a session exists
     */
    async sessionExists(sessionId) {
        const sessionDir = this.getSessionDir(sessionId);
        return fs.pathExists(sessionDir);
    }
    /**
     * Delete a session (for cleanup)
     */
    async deleteSession(sessionId) {
        const sessionDir = this.getSessionDir(sessionId);
        this.assertWithinWorkspace(sessionDir, 'delete session');
        if (await fs.pathExists(sessionDir)) {
            await fs.remove(sessionDir);
        }
    }
    /**
     * Validate session ID format to prevent path traversal
     */
    assertValidSessionId(sessionId) {
        // Session IDs should only contain alphanumeric, hyphens, and underscores
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(sessionId)) {
            throw new Error(`Invalid session ID format: ${sessionId}`);
        }
        // Prevent path traversal attempts
        if (sessionId.includes('..') || sessionId.includes('/') || sessionId.includes('\\')) {
            throw new Error(`Invalid session ID (path traversal attempt): ${sessionId}`);
        }
    }
    /**
     * Assert that a path is within the workspace
     */
    assertWithinWorkspace(targetPath, action) {
        const resolvedTarget = path.resolve(targetPath);
        const relative = path.relative(this.basePath, resolvedTarget);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            throw new Error(`Attempted to ${action} outside of workspace base "${this.basePath}": ${resolvedTarget}`);
        }
    }
}
//# sourceMappingURL=session-storage.js.map