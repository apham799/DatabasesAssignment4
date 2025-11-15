import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { loadDimDate } from "../load/loadDimDate";

export async function initAnalytics() {
    console.log("\n Initializing Analytics Database...\n");

    try {
        console.log("Verifying MySQL connection...");
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        console.log("MySQL connection verified");

        console.log("\n Initializing SQLite database...");
        if (!TargetDataSource.isInitialized) {
            await TargetDataSource.initialize();
        }

        console.log("Creating analytics tables...");
        await TargetDataSource.synchronize();
        console.log("Analytics tables created successfully");

        console.log("\n Pre-populating date dimension...");
        await loadDimDate();
        console.log("Date dimension populated");

        console.log("\n Preparing sync state tracking...");
        const syncStateRepo = TargetDataSource.getRepository("SyncState");
        const count = await syncStateRepo.count();
        console.log(`Sync state table ready (${count} entries)`);

        console.log("\n" + "═".repeat(80));
        console.log("INITIALIZATION COMPLETE");
        console.log("Analytics database is ready for data loading.");
        console.log("Next step: Run 'npm start full-load' to import data.");
        console.log("═".repeat(80) + "\n");

    } catch (error) {
        console.log("\n" + "═".repeat(80));
        console.error("INITIALIZATION FAILED");
        console.error("Error:", error.message);
        console.log("═".repeat(80) + "\n");
        throw error;
    }
}