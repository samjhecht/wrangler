/**
 * Labels management tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const issueLabelsSchema: z.ZodObject<{
    operation: z.ZodEnum<["list", "add", "remove"]>;
    issueId: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    operation: "list" | "add" | "remove";
    labels?: string[] | undefined;
    issueId?: string | undefined;
}, {
    operation: "list" | "add" | "remove";
    labels?: string[] | undefined;
    issueId?: string | undefined;
}>;
export type IssueLabelsParams = z.infer<typeof issueLabelsSchema>;
export declare function issueLabelsTool(params: IssueLabelsParams, providerFactory: ProviderFactory): Promise<{
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
        labels: string[];
        totalLabels?: undefined;
        operation?: undefined;
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        labels: string[];
        totalLabels: number;
        issueId?: undefined;
        operation?: undefined;
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        issueId: string;
        operation: "add" | "remove";
        labels: string[];
        totalLabels?: undefined;
    };
}>;
//# sourceMappingURL=labels.d.ts.map