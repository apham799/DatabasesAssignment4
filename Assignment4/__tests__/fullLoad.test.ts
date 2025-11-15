import { setupTestDatabases, cleanupTestDatabases, clearSQLiteTables } from "./setup";
import { loadDimFilm } from "../src/load/loadDimFilm";
import { loadDimActor } from "../src/load/loadDimActor";
import { loadDimCategory } from "../src/load/loadDimCategory";
import { loadDimCustomer } from "../src/load/loadDimCustomer";
import { loadDimStore } from "../src/load/loadDimStore";
import { loadBridgeFilmActor } from "../src/load/loadBridgeFilmActor";
import { loadBridgeFilmCategory } from "../src/load/loadBridgeFilmCategory";
import { loadFactRental } from "../src/load/loadFactRental";
import { loadFactPayment } from "../src/load/loadFactPayment";
import { AppDataSource } from "../src/data-source";
import { TargetDataSource } from "../src/data-target";
import { Film } from "../src/entity/source/Film";
import { Actor } from "../src/entity/source/Actor";
import { Category } from "../src/entity/source/Category";
import { Rental } from "../src/entity/source/Rental";
import { Payment } from "../src/entity/source/Payment";
import { DimFilm } from "../src/entity/target/DimFilm";
import { DimActor } from "../src/entity/target/DimActor";
import { DimCategory } from "../src/entity/target/DimCategory";
import { FactRental } from "../src/entity/target/FactRental";
import { FactPayment } from "../src/entity/target/FactPayment";

describe("Full-Load Command", () => {
    beforeAll(async () => {
        await setupTestDatabases();
        await clearSQLiteTables();
    });

    afterAll(async () => {
        await cleanupTestDatabases();
    });

    test("should load all films from Sakila to SQLite", async () => {
        const sourceCount = await AppDataSource.getRepository(Film).count();

        await loadDimFilm();

        const targetCount = await TargetDataSource.getRepository(DimFilm).count();

        expect(targetCount).toBe(sourceCount);
        expect(targetCount).toBe(1000); // Sakila has 1000 films
        console.log(`Loaded ${targetCount} films`);
    });

    test("should load all actors from Sakila to SQLite", async () => {
        const sourceCount = await AppDataSource.getRepository(Actor).count();

        await loadDimActor();

        const targetCount = await TargetDataSource.getRepository(DimActor).count();

        expect(targetCount).toBe(sourceCount);
        expect(targetCount).toBe(200); // Sakila has 200 actors
        console.log(`Loaded ${targetCount} actors`);
    });

    test("should load all categories from Sakila to SQLite", async () => {
        const sourceCount = await AppDataSource.getRepository(Category).count();

        await loadDimCategory();

        const targetCount = await TargetDataSource.getRepository(DimCategory).count();

        expect(targetCount).toBe(sourceCount);
        expect(targetCount).toBe(16); // Sakila has 16 categories
        console.log(`✅ Loaded ${targetCount} categories`);
    });

    test("should load all fact rentals", async () => {
        await loadDimFilm();
        await loadDimActor();
        await loadDimCustomer();
        await loadDimStore();

        const sourceCount = await AppDataSource.getRepository(Rental).count();

        await loadFactRental();

        const targetCount = await TargetDataSource.getRepository(FactRental).count();

        expect(targetCount).toBe(sourceCount);
        expect(targetCount).toBeGreaterThan(16000); // Sakila has ~16,044 rentals
        console.log(`✅ Loaded ${targetCount} rental facts`);
    });

    test("should load all fact payments", async () => {
        const sourceCount = await AppDataSource.getRepository(Payment).count();

        await loadFactPayment();

        const targetCount = await TargetDataSource.getRepository(FactPayment).count();

        expect(targetCount).toBe(sourceCount);
        expect(targetCount).toBeGreaterThan(16000); // Sakila has ~16,044 payments
        console.log(`Loaded ${targetCount} payment facts`);
    });

    test("should load bridge tables correctly", async () => {
        await loadBridgeFilmActor();
        await loadBridgeFilmCategory();

        const filmActorCount = await TargetDataSource
            .createQueryBuilder()
            .select("COUNT(*)", "count")
            .from("bridge_film_actor", "bfa")
            .getRawOne();

        const filmCategoryCount = await TargetDataSource
            .createQueryBuilder()
            .select("COUNT(*)", "count")
            .from("bridge_film_category", "bfc")
            .getRawOne();

        expect(parseInt(filmActorCount.count)).toBe(5462); // Sakila has 5462 film-actor relationships
        expect(parseInt(filmCategoryCount.count)).toBe(1000); // Sakila has 1000 film-category relationships

        console.log(`Loaded ${filmActorCount.count} film-actor links`);
        console.log(`Loaded ${filmCategoryCount.count} film-category links`);
    });
});