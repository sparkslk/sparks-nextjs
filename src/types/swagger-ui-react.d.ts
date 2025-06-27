declare module 'swagger-ui-react' {
    import React from 'react';

    interface SwaggerUIProps {
        spec?: Record<string, unknown>;
        url?: string;
        docExpansion?: 'list' | 'full' | 'none';
        defaultModelsExpandDepth?: number;
        defaultModelExpandDepth?: number;
        deepLinking?: boolean;
        displayOperationId?: boolean;
        displayRequestDuration?: boolean;
        showExtensions?: boolean;
        showCommonExtensions?: boolean;
        tryItOutEnabled?: boolean;
        requestInterceptor?: (request: Record<string, unknown>) => Record<string, unknown>;
        responseInterceptor?: (response: Record<string, unknown>) => Record<string, unknown>;
        onComplete?: (system: Record<string, unknown>) => void;
        syntaxHighlight?: {
            activated?: boolean;
            theme?: string;
        };
        validatorUrl?: string | null;
        supportedSubmitMethods?: string[];
        plugins?: unknown[];
        presets?: unknown[];
        layout?: string;
        filter?: string | boolean;
    }

    const SwaggerUI: React.ComponentType<SwaggerUIProps>;
    export default SwaggerUI;
}
