import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { Actor } from "../entity/source/Actor";
import { DimActor } from "../entity/target/DimActor";

export async function loadDimActor(lastSyncTime: Date | null = null) {
    const actorRepo = AppDataSource.getRepository(Actor);
    const dimActorRepo = TargetDataSource.getRepository(DimActor);

    let query = actorRepo.createQueryBuilder("a");

    if (lastSyncTime) {
        query = query.where("a.last_update > :lastSync", { lastSync: lastSyncTime });
        console.log(`  Fetching actors updated after ${lastSyncTime.toISOString()}`);
    } else {
        console.log(`  Fetching all actors (initial load)`);
    }

    const actors = await query.getMany();

    if (actors.length === 0) {
        console.log(`  No new/updated actors found`);
        return;
    }

    const dimActors = actors.map(a => ({
        actor_id: a.actor_id,
        first_name: a.first_name,
        last_name: a.last_name,
        last_update: a.last_update
    }));

    await dimActorRepo.upsert(dimActors, ["actor_id"]);
    console.log(`  Loaded ${dimActors.length} actors`);
}