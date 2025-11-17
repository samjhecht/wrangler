/**
 * Structured error handling for MCP tools
 */
export declare enum MCPErrorCode {
    TOOL_NOT_FOUND = "TOOL_NOT_FOUND",
    TOOL_EXECUTION_ERROR = "TOOL_EXECUTION_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INVALID_ARGUMENTS = "INVALID_ARGUMENTS",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    ACCESS_DENIED = "ACCESS_DENIED",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
    RESOURCE_LOCKED = "RESOURCE_LOCKED",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    PATH_TRAVERSAL_DENIED = "PATH_TRAVERSAL_DENIED",
    ISSUE_NOT_FOUND = "ISSUE_NOT_FOUND",
    ISSUE_INVALID_STATUS = "ISSUE_INVALID_STATUS",
    ISSUE_OPERATION_FAILED = "ISSUE_OPERATION_FAILED",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    PROVIDER_ERROR = "PROVIDER_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    TIMEOUT = "TIMEOUT",
    UNAVAILABLE = "UNAVAILABLE"
}
export interface MCPErrorContext {
    tool?: string;
    arguments?: any;
    timestamp?: string;
    [key: string]: any;
}
export interface MCPErrorDetails {
    code: MCPErrorCode;
    message: string;
    details?: any;
    context?: MCPErrorContext;
    remediation?: string;
    stack?: string;
}
export interface MCPErrorResponse {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError: true;
    metadata?: {
        error: MCPErrorDetails;
        [key: string]: any;
    };
}
export interface MCPSuccessResponse<T = any> {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError: false;
    metadata?: T;
}
export type MCPResponse<T = any> = MCPSuccessResponse<T> | MCPErrorResponse;
/**
 * Create a structured error response
 */
export declare function createErrorResponse(code: MCPErrorCode, message: string, options?: {
    details?: any;
    context?: MCPErrorContext;
    remediation?: string;
    includeStack?: boolean;
    error?: Error;
}): MCPErrorResponse;
/**
 * Create a success response
 */
export declare function createSuccessResponse<T = any>(text: string, metadata?: T): MCPSuccessResponse<T>;
/**
 * Error remediation suggestions by error code
 */
export declare const ERROR_REMEDIATIONS: Partial<Record<MCPErrorCode, string>>;
/**
 * Get remediation suggestion for an error code
 */
export declare function getRemediation(code: MCPErrorCode): string | undefined;
//# sourceMappingURL=errors.d.ts.map