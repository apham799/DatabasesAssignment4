import { setupTestDatabases, cleanupTestDatabases } from "./setup";
import { validateData } from "../src/sync/validateData";
import { loadDimFilm } from "../src/load/loadDimFilm";
import { loadDimActor } from "../src/load/loadDimActor";
import { loadDimCategory } from "../src/load/loadDimCategory";
import { loadDimCustomer } from "../src/load/loadDimCustomer";
import { loadDimStore } from "../src/load/loadDimStore";
import { loadBridgeFilmActor } from "../src/load/loadBridgeFilmActor";
import { loadBridgeFilmCategory } from "../src/load/loadBridgeFilmCategory";
import { loadFactRental } from "../src/load/loadFactRental";
import { loadFactPayment } from "../src/load/loadFactPayment";

describe("Validate Command", () => {
    beforeAll(async () => {
        await setupTestDatabases();

        await loadDimFilm();
        await loadDimActor();
        await loadDimCategory();
        await loadDimCustomer();
        await loadDimStore();
        await loadBridgeFilmActor();
        await loadBridgeFilmCategory();
        await loadFactRental();
        await loadFactPayment();
    });

    afterAll(async () => {
        await cleanupTestDatabases();
    });

    test("should validate data consistency between MySQL and SQLite", async () => {
        const result = await validateData();
        expect(result).not.toBeUndefined();
        console.log(`Data validation completed`);
    });

    test("should complete validation without errors", async () => {
        // Just verify validation runs successfully
        await expect(validateData()).resolves.not.toThrow();
        console.log(`Validation ran without errors`);
    });
});