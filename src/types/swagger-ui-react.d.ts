declare module 'swagger-ui-react' {
    import React from 'react';

    interface SwaggerUIProps {
        spec?: any;
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
        requestInterceptor?: (request: any) => any;
        responseInterceptor?: (response: any) => any;
        onComplete?: (system: any) => void;
        syntaxHighlight?: {
            activated?: boolean;
            theme?: string;
        };
        validatorUrl?: string | null;
        supportedSubmitMethods?: string[];
        plugins?: any[];
        presets?: any[];
        layout?: string;
        filter?: string | boolean;
    }

    const SwaggerUI: React.ComponentType<SwaggerUIProps>;
    export default SwaggerUI;
}
