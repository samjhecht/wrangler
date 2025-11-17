/**
 * Structured error handling for MCP tools
 */
export var MCPErrorCode;
(function (MCPErrorCode) {
    // Tool errors
    MCPErrorCode["TOOL_NOT_FOUND"] = "TOOL_NOT_FOUND";
    MCPErrorCode["TOOL_EXECUTION_ERROR"] = "TOOL_EXECUTION_ERROR";
    // Validation errors
    MCPErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    MCPErrorCode["INVALID_ARGUMENTS"] = "INVALID_ARGUMENTS";
    MCPErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    // Permission errors
    MCPErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    MCPErrorCode["ACCESS_DENIED"] = "ACCESS_DENIED";
    MCPErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Resource errors
    MCPErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    MCPErrorCode["RESOURCE_ALREADY_EXISTS"] = "RESOURCE_ALREADY_EXISTS";
    MCPErrorCode["RESOURCE_LOCKED"] = "RESOURCE_LOCKED";
    // File errors
    MCPErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    MCPErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    MCPErrorCode["PATH_TRAVERSAL_DENIED"] = "PATH_TRAVERSAL_DENIED";
    // Issue errors
    MCPErrorCode["ISSUE_NOT_FOUND"] = "ISSUE_NOT_FOUND";
    MCPErrorCode["ISSUE_INVALID_STATUS"] = "ISSUE_INVALID_STATUS";
    MCPErrorCode["ISSUE_OPERATION_FAILED"] = "ISSUE_OPERATION_FAILED";
    // Configuration errors
    MCPErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    MCPErrorCode["PROVIDER_ERROR"] = "PROVIDER_ERROR";
    // Server errors
    MCPErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    MCPErrorCode["TIMEOUT"] = "TIMEOUT";
    MCPErrorCode["UNAVAILABLE"] = "UNAVAILABLE";
})(MCPErrorCode || (MCPErrorCode = {}));
/**
 * Create a structured error response
 */
export function createErrorResponse(code, message, options = {}) {
    const errorDetails = {
        code,
        message,
        details: options.details,
        context: {
            ...options.context,
            timestamp: new Date().toISOString(),
        },
        remediation: options.remediation,
    };
    // Include stack trace only if requested (debug mode)
    if (options.includeStack && options.error) {
        errorDetails.stack = options.error.stack;
    }
    // Create human-readable text message
    let text = `Error [` + code + `]: ` + message;
    if (options.remediation) {
        text += `\n\nSuggested fix: ` + options.remediation;
    }
    if (options.details) {
        text += `\n\nDetails: ` + JSON.stringify(options.details, null, 2);
    }
    return {
        content: [{ type: 'text', text }],
        isError: true,
        metadata: {
            error: errorDetails,
        },
    };
}
/**
 * Create a success response
 */
export function createSuccessResponse(text, metadata) {
    return {
        content: [{ type: 'text', text }],
        isError: false,
        metadata,
    };
}
/**
 * Error remediation suggestions by error code
 */
export const ERROR_REMEDIATIONS = {
    [MCPErrorCode.TOOL_NOT_FOUND]: 'Check that the tool name is correct and the server is properly configured.',
    [MCPErrorCode.VALIDATION_ERROR]: 'Review the tool parameters and ensure they match the expected schema.',
    [MCPErrorCode.PERMISSION_DENIED]: 'Verify you have the necessary permissions to perform this operation.',
    [MCPErrorCode.RATE_LIMIT_EXCEEDED]: 'Wait a moment before retrying the operation.',
    [MCPErrorCode.RESOURCE_NOT_FOUND]: 'Verify the resource ID or path is correct.',
    [MCPErrorCode.FILE_TOO_LARGE]: 'Reduce the file size or increase the configured limit.',
    [MCPErrorCode.PATH_TRAVERSAL_DENIED]: 'Use relative paths within the workspace directory.',
    [MCPErrorCode.ISSUE_NOT_FOUND]: 'Verify the issue ID exists. Use issues_list to see available issues.',
    [MCPErrorCode.CONFIGURATION_ERROR]: 'Check your workspace configuration and ensure all required fields are set.',
};
/**
 * Get remediation suggestion for an error code
 */
export function getRemediation(code) {
    return ERROR_REMEDIATIONS[code];
}
//# sourceMappingURL=errors.js.map