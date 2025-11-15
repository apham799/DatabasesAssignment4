import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { Store } from "../entity/source/Store";
import { DimStore } from "../entity/target/DimStore";

export async function loadDimStore(lastSyncTime: Date | null = null) {
    const storeRepo = AppDataSource.getRepository(Store);
    const dimStoreRepo = TargetDataSource.getRepository(DimStore);

    /*const stores = await storeRepo
        .createQueryBuilder("s")
        .leftJoinAndSelect("s.address", "addr")
        .leftJoinAndSelect("addr.city", "city")
        .leftJoinAndSelect("city.country", "country")
        .getMany();*/

    let query = await storeRepo
        .createQueryBuilder("s")
        .leftJoinAndSelect("s.address", "addr")
        .leftJoinAndSelect("addr.city", "city")
        .leftJoinAndSelect("city.country", "country")

    if (lastSyncTime) {
        query = query.where("s.last_update > :lastSync", { lastSync: lastSyncTime });
        console.log(`  Fetching stores updated after ${lastSyncTime.toISOString()}`);
    } else {
        console.log(`  Fetching all stores (initial load)`);
    }

    const stores = await query.getMany();

    if (stores.length === 0) {
        console.log(`  No new/updated stores found`);
        return;
    }

    const dimStores = stores.map(s => ({
        store_id: s.store_id,
        city: s.address?.city?.city || 'Unknown',
        country: s.address?.city?.country?.country || 'Unknown',
        last_update: s.last_update
    }));

    //if (dimStores.length > 0) {
        await dimStoreRepo.upsert(dimStores, ["store_id"]);
        console.log(`Loaded ${dimStores.length} stores`);
    //}
}