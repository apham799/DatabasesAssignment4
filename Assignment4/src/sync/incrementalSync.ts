import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { SyncStateManager } from "./syncStateManager";
import { validateData} from "./validateData";

import { loadDimDate } from "../load/loadDimDate";
import { loadDimStore } from "../load/loadDimStore";
import { loadDimCustomer } from "../load/loadDimCustomer";
import { loadDimFilm } from "../load/loadDimFilm";
import { loadDimActor } from "../load/loadDimActor";
import { loadDimCategory } from "../load/loadDimCategory";
import { loadBridgeFilmActor } from "../load/loadBridgeFilmActor";
import { loadBridgeFilmCategory } from "../load/loadBridgeFilmCategory";
import { loadFactRental } from "../load/loadFactRental";
import { loadFactPayment } from "../load/loadFactPayment";

export async function incrementalSync() {
    const syncManager = new SyncStateManager();
    const syncStartTime = new Date();

    console.log("\n Starting Incremental Sync...");
    console.log(`Sync started at: ${syncStartTime.toISOString()}\n`);

    try {
        // Get last sync times for all tables
        const tableNames = [
            'film', 'actor', 'category', 'customer', 'store',
            'rental', 'payment', 'film_actor', 'film_category'
        ];

        const syncTimes = await syncManager.getLastSyncTimes(tableNames);

        console.log("Syncing Dimensions...");

        console.log("\n Film:");
        await loadDimFilm(syncTimes.get('film'));

        console.log("\n Actor:");
        await loadDimActor(syncTimes.get('actor'));

        console.log("\n Category:");
        await loadDimCategory(syncTimes.get('category'));

        console.log("\n Customer:");
        await loadDimCustomer(syncTimes.get('customer'));

        console.log("\n Store:");
        await loadDimStore(syncTimes.get('store'));

        const dimensionsChanged =
            syncTimes.get('film') !== null ||
            syncTimes.get('actor') !== null ||
            syncTimes.get('category') !== null;

        if (dimensionsChanged || syncTimes.get('film_actor') === null) {
            console.log("\n Syncing Bridges...");
            console.log("\n Film-Actor:");
            await loadBridgeFilmActor();
            console.log("\n Film-Category:");
            await loadBridgeFilmCategory();
        } else {
            console.log("\n Skipping Bridges (no dimension changes)");
        }

        console.log("\n Syncing Facts...");

        console.log("\n Rentals:");
        await loadFactRental(syncTimes.get('rental'));

        console.log("\n Payments:");
        await loadFactPayment(syncTimes.get('payment'));

        console.log("\n Updating sync state...");
        await syncManager.updateSyncTimes([
            { tableName: 'film', syncTime: syncStartTime },
            { tableName: 'actor', syncTime: syncStartTime },
            { tableName: 'category', syncTime: syncStartTime },
            { tableName: 'customer', syncTime: syncStartTime },
            { tableName: 'store', syncTime: syncStartTime },
            { tableName: 'rental', syncTime: syncStartTime },
            { tableName: 'payment', syncTime: syncStartTime },
            { tableName: 'film_actor', syncTime: syncStartTime },
            { tableName: 'film_category', syncTime: syncStartTime }
        ]);

        console.log("\n Incremental sync completed successfully!");
        console.log(`Sync finished at: ${new Date().toISOString()}`);

        await validateData();

    } catch (error) {
        console.error("\n Incremental sync failed:", error);
        throw error;
    }
}