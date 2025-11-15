import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { FilmActor } from "../entity/source/FilmActor";
import { BridgeFilmActor } from "../entity/target/BridgeFilmActor";
import { DimFilm } from "../entity/target/DimFilm";
import { DimActor } from "../entity/target/DimActor";

export async function loadBridgeFilmActor() {
    const filmActorRepo = AppDataSource.getRepository(FilmActor);
    const bridgeRepo = TargetDataSource.getRepository(BridgeFilmActor);
    const dimFilmRepo = TargetDataSource.getRepository(DimFilm);
    const dimActorRepo = TargetDataSource.getRepository(DimActor);
    const filmActors = await filmActorRepo.find();
    const films = await dimFilmRepo.find();
    const actors = await dimActorRepo.find();

    //debugging
    console.log(`\n=== BRIDGE FILM-ACTOR DEBUG ===`);
    console.log(`Source film_actor records: ${filmActors.length}`);
    console.log(`Target dim_film records: ${films.length}`);
    console.log(`Target dim_actor records: ${actors.length}`);

    console.log(`\nFirst 5 source film_actor records:`);
    filmActors.slice(0, 5).forEach(fa => {
        console.log(`  actor_id: ${fa.actor_id}, film_id: ${fa.film_id}`);
    });

    console.log(`\nFirst 5 dim_film records:`);
    films.slice(0, 5).forEach(f => {
        console.log(`  film_id: ${f.film_id}, film_key: ${f.film_key}`);
    });

    console.log(`\nFirst 5 dim_actor records:`);
    actors.slice(0, 5).forEach(a => {
        console.log(`  actor_id: ${a.actor_id}, actor_key: ${a.actor_key}`);
    });

    const filmKeyMap = new Map(films.map(f => [f.film_id, f.film_key]));
    const actorKeyMap = new Map(actors.map(a => [a.actor_id, a.actor_key]));

    console.log(`\nMap sizes:`);
    console.log(`  filmKeyMap: ${filmKeyMap.size} entries`);
    console.log(`  actorKeyMap: ${actorKeyMap.size} entries`);

    console.log(`\nTest lookups from first source record:`);
    const testRecord = filmActors[0];
    console.log(`  Looking up film_id ${testRecord.film_id}: ${filmKeyMap.get(testRecord.film_id)}`);
    console.log(`  Looking up actor_id ${testRecord.actor_id}: ${actorKeyMap.get(testRecord.actor_id)}`);

    let missingFilmKeys = 0;
    let missingActorKeys = 0;
    let successCount = 0;

    const bridgeRecords = filmActors
        .map(fa => {
            const filmKey = filmKeyMap.get(fa.film_id);
            const actorKey = actorKeyMap.get(fa.actor_id);

            if (!filmKey) {
                missingFilmKeys++;
            }
            if (!actorKey) {
                missingActorKeys++;
            }

            if (filmKey && actorKey) {
                successCount++;
                return {
                    film_key: filmKey,
                    actor_key: actorKey
                };
            }
            return null;
        })
        .filter(record => record !== null);

    console.log(`\n=== RESULTS ===`);
    console.log(`Successful mappings: ${successCount}`);
    console.log(`Missing film keys: ${missingFilmKeys}`);
    console.log(`Missing actor keys: ${missingActorKeys}`);
    console.log(`Bridge records created: ${bridgeRecords.length}`);

    if (bridgeRecords.length > 0) {
        //await bridgeRepo.upsert(bridgeRecords, ["film_key", "actor_key"]);
        await bridgeRepo.clear();
        await bridgeRepo.insert(bridgeRecords);
        console.log(`Loaded ${bridgeRecords.length} film-actor relationships`);
    }
}