import { AppDataSource } from "../src/data-source";
import { TargetDataSource } from "../src/data-target";
import * as fs from "fs";
import * as path from "path";

// Test database path
export const TEST_DB_PATH = "sakila_warehouse.db";

export async function setupTestDatabases() {
    // Initialize connections
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    if (!TargetDataSource.isInitialized) {
        await TargetDataSource.initialize();
    }
}

export async function cleanupTestDatabases() {
    // Close connections
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    if (TargetDataSource.isInitialized) {
        await TargetDataSource.destroy();
    }

    // Delete test database file
    if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
    }
}

export async function clearSQLiteTables() {
    // Clear all tables in SQLite for fresh test
    const queryRunner = TargetDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
        await queryRunner.query("DELETE FROM bridge_film_actor");
        await queryRunner.query("DELETE FROM bridge_film_category");
        await queryRunner.query("DELETE FROM fact_rental");
        await queryRunner.query("DELETE FROM fact_payment");
        await queryRunner.query("DELETE FROM dim_film");
        await queryRunner.query("DELETE FROM dim_actor");
        await queryRunner.query("DELETE FROM dim_category");
        await queryRunner.query("DELETE FROM dim_customer");
        await queryRunner.query("DELETE FROM dim_store");
        await queryRunner.query("DELETE FROM sync_state");
    } finally {
        await queryRunner.release();
    }
}