import { setupTestDatabases, cleanupTestDatabases } from "./setup";
import { AppDataSource } from "../src/data-source";
import { TargetDataSource } from "../src/data-target";
import { Film } from "../src/entity/source/Film";
import { DimFilm } from "../src/entity/target/DimFilm";
import { loadDimFilm } from "../src/load/loadDimFilm";
import { SyncStateManager } from "../src/sync/syncStateManager";

describe("Incremental Command - Updates", () => {
    const TEST_FILM_ID = 1; // Use existing film
    let originalRating: string;
    let syncManager: SyncStateManager;

    beforeAll(async () => {
        await setupTestDatabases();
        syncManager = new SyncStateManager();


        await loadDimFilm();
    });

    afterAll(async () => {
        if (originalRating) {
            await AppDataSource.getRepository(Film)
                .update({ film_id: TEST_FILM_ID }, {
                    rating: originalRating,
                    last_update: new Date()
                });
        }
        await cleanupTestDatabases();
    });

    test("should detect and update modified films in Sakila", async () => {
        const filmRepo = AppDataSource.getRepository(Film);
        const originalFilm = await filmRepo.findOne({
            where: { film_id: TEST_FILM_ID }
        });
        originalRating = originalFilm!.rating;

        const dimFilmRepo = TargetDataSource.getRepository(DimFilm);
        const originalDimFilm = await dimFilmRepo.findOne({
            where: { film_id: TEST_FILM_ID }
        });

        expect(originalDimFilm?.rating).toBe(originalRating);
        console.log(`Original rating: ${originalRating}`);

        const syncTime = new Date();
        await syncManager.updateSyncTime('film', syncTime);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const newRating = originalRating === "PG" ? "G" : "PG";
        await filmRepo.update(
            { film_id: TEST_FILM_ID },
            {
                rating: newRating,
                last_update: new Date()
            }
        );

        console.log(`Updated film rating to: ${newRating}`);

        const lastSync = await syncManager.getLastSyncTime('film');
        await loadDimFilm(lastSync);

        const updatedDimFilm = await dimFilmRepo.findOne({
            where: { film_id: TEST_FILM_ID }
        });

        expect(updatedDimFilm?.rating).toBe(newRating);
        expect(updatedDimFilm?.film_key).toBe(originalDimFilm?.film_key); // Same surrogate key

        console.log(`Incremental sync updated film rating (Type 1 SCD)`);
    });
});