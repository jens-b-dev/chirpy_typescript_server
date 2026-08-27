import { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile()

export type APIConfig = {
    fileserverHits: number;
    dbURL: string;
    platform: string;
}

export type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

export type JWTConfig = {
    defaultDuration: number;
    secret: string;
    issuer: string;
}


export type Config = {
    api: APIConfig;
    db: DBConfig;
    jwt: JWTConfig;
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "src/db/migrations",
};


export const config: Config = {
    api: {
        fileserverHits: 0,
        dbURL: envOrThrow("DB_URL"),
        platform: envOrThrow("PLATFORM"),
    },
    db: {
        url: envOrThrow('DB_URL'),
        migrationConfig,
    },
    jwt: {
        defaultDuration: 60 * 60,
        secret: envOrThrow("JWT_SECRET"),
        issuer: "chirpy",
    },
};

function envOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}
