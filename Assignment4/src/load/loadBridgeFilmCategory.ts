import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { FilmCategory } from "../entity/source/FilmCategory";
import { BridgeFilmCategory } from "../entity/target/BridgeFilmCategory";
import { DimFilm } from "../entity/target/DimFilm";
import { DimCategory } from "../entity/target/DimCategory";

export async function loadBridgeFilmCategory() {
    const filmCategoryRepo = AppDataSource.getRepository(FilmCategory);
    const bridgeRepo = TargetDataSource.getRepository(BridgeFilmCategory);
    const dimFilmRepo = TargetDataSource.getRepository(DimFilm);
    const dimCategoryRepo = TargetDataSource.getRepository(DimCategory);
    const filmCategories = await filmCategoryRepo.find();
    const films = await dimFilmRepo.find();
    const categories = await dimCategoryRepo.find();
    const filmKeyMap = new Map(films.map(f => [f.film_id, f.film_key]));
    const categoryKeyMap = new Map(categories.map(c => [c.category_id, c.category_key]));
    const bridgeRecords = filmCategories
        .map(fc => {
            const filmKey = filmKeyMap.get(fc.film_id);
            const categoryKey = categoryKeyMap.get(fc.category_id);

            if (filmKey && categoryKey) {
                return {
                    film_key: filmKey,
                    category_key: categoryKey
                };
            }
            return null;
        })
        .filter(record => record !== null);
    if (bridgeRecords.length > 0) {
        await bridgeRepo.upsert(bridgeRecords, ["film_key", "category_key"]);
        console.log(`Loaded ${bridgeRecords.length} film-category relationships`);
    }
}