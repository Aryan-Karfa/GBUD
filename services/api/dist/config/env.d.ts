export interface Environment {
    nodeEnv: 'development' | 'production' | 'test';
    port: number;
    corsOrigin?: string;
    apiVersion: string;
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiresIn: string;
    jwtRefreshExpiresIn: string;
}
export declare function loadEnv(): Environment;
export declare const env: Environment;
//# sourceMappingURL=env.d.ts.map