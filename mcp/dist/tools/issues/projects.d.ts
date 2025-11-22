/**
 * Projects management tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const issueProjectsSchema: z.ZodObject<{
    operation: z.ZodEnum<["list", "add", "remove"]>;
    issueId: z.ZodOptional<z.ZodString>;
    project: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    operation: "list" | "add" | "remove";
    project?: string | undefined;
    issueId?: string | undefined;
}, {
    operation: "list" | "add" | "remove";
    project?: string | undefined;
    issueId?: string | undefined;
}>;
export type IssueProjectsParams = z.infer<typeof issueProjectsSchema>;
export declare function issueProjectsTool(params: IssueProjectsParams, providerFactory: ProviderFactory): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        projects: string[];
        totalProjects: number;
        issueId?: undefined;
        project?: undefined;
    };
} | {
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
        project: string;
        projects?: undefined;
        totalProjects?: undefined;
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        issueId: string;
        projects?: undefined;
        totalProjects?: undefined;
        project?: undefined;
    };
}>;
//# sourceMappingURL=projects.d.ts.map