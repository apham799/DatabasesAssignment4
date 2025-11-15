import { initAnalytics } from "../src/sync/initAnalytics";
import { TargetDataSource } from "../src/data-target";
import { AppDataSource } from "../src/data-source";
import { DimFilm } from "../src/entity/target/DimFilm";
import { DimActor } from "../src/entity/target/DimActor";
import { DimCategory } from "../src/entity/target/DimCategory";
import { DimCustomer } from "../src/entity/target/DimCustomer";
import { DimStore } from "../src/entity/target/DimStore";
import { DimDate } from "../src/entity/target/DimDate";
import { FactRental } from "../src/entity/target/FactRental";
import { FactPayment } from "../src/entity/target/FactPayment";
import { SyncState } from "../src/entity/target/SyncState";
import { cleanupTestDatabases } from "./setup";

describe("Init Command", () => {
    afterAll(async () => {
        await cleanupTestDatabases();
    });

    test("should initialize SQLite database and create all tables", async () => {

        await initAnalytics();

        expect(AppDataSource.isInitialized).toBe(true);
        expect(TargetDataSource.isInitialized).toBe(true);

        const dimFilmRepo = TargetDataSource.getRepository(DimFilm);
        const dimActorRepo = TargetDataSource.getRepository(DimActor);
        const dimCategoryRepo = TargetDataSource.getRepository(DimCategory);
        const dimCustomerRepo = TargetDataSource.getRepository(DimCustomer);
        const dimStoreRepo = TargetDataSource.getRepository(DimStore);
        const dimDateRepo = TargetDataSource.getRepository(DimDate);

        expect(dimFilmRepo).toBeDefined();
        expect(dimActorRepo).toBeDefined();
        expect(dimCategoryRepo).toBeDefined();
        expect(dimCustomerRepo).toBeDefined();
        expect(dimStoreRepo).toBeDefined();
        expect(dimDateRepo).toBeDefined();

        const factRentalRepo = TargetDataSource.getRepository(FactRental);
        const factPaymentRepo = TargetDataSource.getRepository(FactPayment);

        expect(factRentalRepo).toBeDefined();
        expect(factPaymentRepo).toBeDefined();

        const syncStateRepo = TargetDataSource.getRepository(SyncState);
        expect(syncStateRepo).toBeDefined();

        const dateCount = await dimDateRepo.count();
        expect(dateCount).toBeGreaterThan(0);
        console.log(`dim_date pre-populated with ${dateCount} dates`);
    });

    test("should create tables with correct schema", async () => {
        const dimFilm = await TargetDataSource.getRepository(DimFilm)
            .createQueryBuilder("f")
            .getOne();

        expect(dimFilm).toHaveProperty('film_key');
        expect(dimFilm).toHaveProperty('film_id');


        const queryRunner = TargetDataSource.createQueryRunner();
        const factRentalTable = await queryRunner.getTable("fact_rental");

        const rentalIdColumn = factRentalTable?.columns.find(c => c.name === 'rental_id');
        expect(rentalIdColumn?.isUnique).toBe(true);

        await queryRunner.release();
    });
});