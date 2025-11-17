/**
 * Shared constants for issue tools
 */
/**
 * Valid artifact types for issues
 */
export declare const ARTIFACT_TYPES: readonly ["issue", "specification"];
/**
 * Valid issue statuses
 */
export declare const ISSUE_STATUSES: readonly ["open", "in_progress", "closed", "cancelled"];
/**
 * Valid issue priorities
 */
export declare const ISSUE_PRIORITIES: readonly ["low", "medium", "high", "critical"];
/**
 * Statuses considered as "completed"
 */
export declare const COMPLETED_STATUSES: Set<string>;
/**
 * Maximum title length for issues
 */
export declare const MAX_TITLE_LENGTH = 200;
/**
 * Maximum issues to return in list queries by default
 */
export declare const DEFAULT_LIST_LIMIT = 100;
/**
 * Maximum issues that can be requested in a single query
 */
export declare const MAX_LIST_LIMIT = 1000;
/**
 * Default fields to search in when searching issues
 */
export declare const DEFAULT_SEARCH_FIELDS: readonly ["title", "description", "labels"];
/**
 * Valid sort fields for issue queries
 */
export declare const SORT_FIELDS: readonly ["created", "updated", "priority", "status"];
/**
 * Valid sort orders
 */
export declare const SORT_ORDERS: readonly ["asc", "desc"];
/**
 * Tool operation types
 */
export declare const OPERATIONS: {
    LABELS: readonly ["list", "add", "remove"];
    METADATA: readonly ["get", "set", "remove"];
    PROJECTS: readonly ["list", "add", "remove"];
};
/**
 * MCP response content type
 */
export declare const MCP_CONTENT_TYPE = "text";
/**
 * Provider types
 */
export declare const PROVIDER_TYPES: readonly ["markdown", "mock"];
//# sourceMappingURL=constants.d.ts.map