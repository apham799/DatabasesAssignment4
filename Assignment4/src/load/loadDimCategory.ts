import {AppDataSource} from "../data-source";
import {TargetDataSource} from "../data-target";
import {Category} from "../entity/source/Category";
import {DimCategory} from "../entity/target/DimCategory";

export async function loadDimCategory(lastSyncTime: Date | null = null) {
    const categoryRepo = AppDataSource.getRepository(Category);
    const dimCategoryRepo = TargetDataSource.getRepository(DimCategory);

    //const categories = await categoryRepo.find();
    let query = await categoryRepo.createQueryBuilder("c")

    if (lastSyncTime) {
        query = query.where("c.last_update > :lastSync", { lastSync: lastSyncTime });
        console.log(`  Fetching categories updated after ${lastSyncTime.toISOString()}`);
    } else {
        console.log(`  Fetching all categories (initial load)`);
    }

    const categories = await query.getMany();

    if (categories.length === 0) {
        console.log(`  No new/updated categories found`);
        return;
    }

    const dimCategories = categories.map(c => ({
        category_id: c.category_id,
        name: c.name,
        last_update: c.last_update
    }));

    //if (dimCategories.length > 0) {
        await dimCategoryRepo.upsert(dimCategories, ["category_id"]);
        console.log(`Loaded ${dimCategories.length} categories`);
    //}
}