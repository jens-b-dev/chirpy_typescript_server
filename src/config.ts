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


export type Config = {
    api: APIConfig;
    db: DBConfig;
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
};

function envOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}
