/**
 * Metadata management tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const issueMetadataSchema: z.ZodObject<{
    operation: z.ZodEnum<["get", "set", "remove"]>;
    issueId: z.ZodString;
    key: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    operation: "set" | "remove" | "get";
    issueId: string;
    value?: any;
    key?: string | undefined;
}, {
    operation: "set" | "remove" | "get";
    issueId: string;
    value?: any;
    key?: string | undefined;
}>;
export type IssueMetadataParams = z.infer<typeof issueMetadataSchema>;
export declare function issueMetadataTool(params: IssueMetadataParams, providerFactory: ProviderFactory): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        issueId: string;
        wranglerContext: import("../../types/issues.js").WranglerIssueContext;
        key?: undefined;
        value?: undefined;
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        issueId: string;
        key: string;
        value: any;
        wranglerContext?: undefined;
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        issueId: string;
        key: string;
        wranglerContext?: undefined;
        value?: undefined;
    };
}>;
//# sourceMappingURL=metadata.d.ts.map