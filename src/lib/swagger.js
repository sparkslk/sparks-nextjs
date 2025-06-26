import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: 'src/app/api', // path to your API routes
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Sparks Therapy Management API',
                version: '1.0.0',
                description: 'API documentation for the Sparks therapy management platform',
            },
            servers: [
                {
                    url: process.env.NODE_ENV === 'production'
                        ? 'https://sparks.help'
                        : 'http://localhost:3000',
                    description: process.env.NODE_ENV === 'production'
                        ? 'Production server'
                        : 'Development server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'JWT authorization header using the Bearer scheme',
                    },
                    sessionAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'next-auth.session-token',
                        description: 'Session-based authentication via cookies',
                    },
                },
                schemas: {
                    Error: {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string',
                                description: 'Error message',
                            },
                            message: {
                                type: 'string',
                                description: 'Detailed error description',
                            },
                        },
                    },
                    User: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'User unique identifier',
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                description: 'User email address',
                            },
                            name: {
                                type: 'string',
                                description: 'User full name',
                            },
                            role: {
                                type: 'string',
                                enum: ['PATIENT', 'PARENT', 'THERAPIST', 'ADMIN'],
                                description: 'User role in the system',
                            },
                        },
                    },
                },
            },
            security: [],
        },
    });
    return spec;
};
