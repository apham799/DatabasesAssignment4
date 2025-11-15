import {AppDataSource} from "../data-source";
import {TargetDataSource} from "../data-target";
import {Film} from "../entity/source/Film";
import {DimFilm} from "../entity/target/DimFilm";

export async function loadDimFilm(lastSyncTime: Date | null = null) {
    const filmRepo = AppDataSource.getRepository(Film);
    const dimFilmRepo = TargetDataSource.getRepository(DimFilm);

    /*const films = await filmRepo
        .createQueryBuilder("f")
        .leftJoinAndSelect("f.language", "lang")
        .getMany();*/

    let query = filmRepo
        .createQueryBuilder("f")
        .leftJoinAndSelect("f.language", "lang");

    if (lastSyncTime) {
        query = query.where("f.last_update > :lastSync", { lastSync: lastSyncTime });
        console.log(`  Fetching films updated after ${lastSyncTime.toISOString()}`);
    } else {
        console.log(`  Fetching all films (initial load)`);
    }

    const films = await query.getMany();


    const dimFilms = films.map(f => ({
        film_id: f.film_id,
        title: f.title,
        rating: f.rating,
        length: f.length,
        language: f.language.name,
        release_year: f.release_year,
        last_update: f.last_update
    }));


    if (dimFilms.length > 0) {
        await dimFilmRepo.upsert(dimFilms, ["film_id"]);
        console.log(`Loaded ${dimFilms.length} films into DimFilm`);
    }

}