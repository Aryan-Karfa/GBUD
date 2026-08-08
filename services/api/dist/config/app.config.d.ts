export declare const appConfig: {
    name: "GBUD";
    version: "0.1.0";
    env: "development" | "production" | "test";
    port: number;
    apiVersion: string;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: boolean | string[];
        credentials: boolean;
    };
    bodyLimit: string;
};
//# sourceMappingURL=app.config.d.ts.map