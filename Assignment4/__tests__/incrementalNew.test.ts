import { setupTestDatabases, cleanupTestDatabases } from "./setup";
import { AppDataSource } from "../src/data-source";
import { TargetDataSource } from "../src/data-target";
import { Actor } from "../src/entity/source/Actor";
import { DimActor } from "../src/entity/target/DimActor";
import { loadDimActor } from "../src/load/loadDimActor";
import { SyncStateManager } from "../src/sync/syncStateManager";

describe("Incremental Command - New Data", () => {
    let testActorId: number;
    let syncManager: SyncStateManager;

    beforeAll(async () => {
        await setupTestDatabases();
        syncManager = new SyncStateManager();
    });

    afterAll(async () => {
        if (testActorId) {
            await AppDataSource.getRepository(Actor)
                .delete({ actor_id: testActorId });
        }
        await cleanupTestDatabases();
    });

    test("should detect and load new actors added to Sakila", async () => {
        await loadDimActor();
        const initialCount = await TargetDataSource.getRepository(DimActor).count();

        const syncTime = new Date();
        await syncManager.updateSyncTime('actor', syncTime);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const actorRepo = AppDataSource.getRepository(Actor);

        const newActor = new Actor();
        newActor.first_name = "TEST";
        newActor.last_name = "ACTOR";
        newActor.last_update = new Date();

        const savedActor = await actorRepo.save(newActor);
        testActorId = savedActor.actor_id;

        console.log(`Created test actor with ID: ${testActorId}`);

        const lastSync = await syncManager.getLastSyncTime('actor');
        await loadDimActor(lastSync);

        const finalCount = await TargetDataSource.getRepository(DimActor).count();
        expect(finalCount).toBe(initialCount + 1);

        const loadedActor = await TargetDataSource.getRepository(DimActor)
            .findOne({ where: { actor_id: testActorId } });

        expect(loadedActor).toBeDefined();
        expect(loadedActor?.first_name).toBe("TEST");
        expect(loadedActor?.last_name).toBe("ACTOR");

        console.log(`Incremental sync detected and loaded 1 new actor`);
    });
});