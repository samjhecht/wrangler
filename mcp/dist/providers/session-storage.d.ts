/**
 * Session storage provider for orchestration workflows
 *
 * Handles persistence of session state, checkpoints, and audit logs
 * in the .wrangler/sessions/ directory.
 */
import { Session, SessionCheckpoint, AuditEntry, SessionStatus } from '../types/session.js';
export interface SessionStorageConfig {
    /** Base path for the workspace */
    basePath: string;
}
export declare class SessionStorageProvider {
    private basePath;
    private sessionsDir;
    constructor(config: SessionStorageConfig);
    /**
     * Get the sessions directory path
     */
    getSessionsDir(): string;
    /**
     * Get the directory path for a specific session
     */
    getSessionDir(sessionId: string): string;
    /**
     * Create a new session directory and initialize files
     */
    createSession(session: Session): Promise<void>;
    /**
     * Get a session by ID
     */
    getSession(sessionId: string): Promise<Session | null>;
    /**
     * Update an existing session
     */
    updateSession(session: Session): Promise<void>;
    /**
     * Append an audit entry to the session's audit log
     */
    appendAuditEntry(sessionId: string, entry: AuditEntry): Promise<void>;
    /**
     * Get recent audit entries for a session
     */
    getAuditEntries(sessionId: string, limit?: number): Promise<AuditEntry[]>;
    /**
     * Save a checkpoint for session recovery
     */
    saveCheckpoint(checkpoint: SessionCheckpoint): Promise<void>;
    /**
     * Get the latest checkpoint for a session
     */
    getCheckpoint(sessionId: string): Promise<SessionCheckpoint | null>;
    /**
     * Write test output to session directory
     */
    writeTestOutput(sessionId: string, output: string): Promise<void>;
    /**
     * Write git status to session directory
     */
    writeGitStatus(sessionId: string, status: string): Promise<void>;
    /**
     * List all sessions, optionally filtered by status
     */
    listSessions(statusFilter?: SessionStatus[]): Promise<Session[]>;
    /**
     * Find the most recent incomplete session
     */
    findIncompleteSession(): Promise<Session | null>;
    /**
     * Check if a session exists
     */
    sessionExists(sessionId: string): Promise<boolean>;
    /**
     * Delete a session (for cleanup)
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * Validate session ID format to prevent path traversal
     */
    private assertValidSessionId;
    /**
     * Assert that a path is within the workspace
     */
    private assertWithinWorkspace;
}
//# sourceMappingURL=session-storage.d.ts.map