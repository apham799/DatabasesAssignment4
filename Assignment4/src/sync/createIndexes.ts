import { TargetDataSource } from "../data-target";
import { Table, TableIndex } from "typeorm";

export async function createIndexes() {
    console.log("\n Creating indexes...");

    const queryRunner = TargetDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
        console.log("Creating dimension indexes...");

        // metadata
        const dimFilmTable = await queryRunner.getTable("dim_film");
        const dimActorTable = await queryRunner.getTable("dim_actor");
        const dimCategoryTable = await queryRunner.getTable("dim_category");
        const dimCustomerTable = await queryRunner.getTable("dim_customer");
        const dimStoreTable = await queryRunner.getTable("dim_store");
        const dimDateTable = await queryRunner.getTable("dim_date");
        const factRentalTable = await queryRunner.getTable("fact_rental");
        const factPaymentTable = await queryRunner.getTable("fact_payment");
        const bridgeFilmActorTable = await queryRunner.getTable("bridge_film_actor");
        const bridgeFilmCategoryTable = await queryRunner.getTable("bridge_film_category");

        // DimFilm
        if (dimFilmTable) {
            await queryRunner.createIndex(dimFilmTable, new TableIndex({
                name: "idx_dim_film_film_id",
                columnNames: ["film_id"]
            }));
        }

        // DimActor
        if (dimActorTable) {
            await queryRunner.createIndex(dimActorTable, new TableIndex({
                name: "idx_dim_actor_actor_id",
                columnNames: ["actor_id"]
            }));
        }

        // DimCategory
        if (dimCategoryTable) {
            await queryRunner.createIndex(dimCategoryTable, new TableIndex({
                name: "idx_dim_category_category_id",
                columnNames: ["category_id"]
            }));
        }

        // DimCustomer
        if (dimCustomerTable) {
            await queryRunner.createIndex(dimCustomerTable, new TableIndex({
                name: "idx_dim_customer_customer_id",
                columnNames: ["customer_id"]
            }));
            await queryRunner.createIndex(dimCustomerTable, new TableIndex({
                name: "idx_dim_customer_city",
                columnNames: ["city"]
            }));
            await queryRunner.createIndex(dimCustomerTable, new TableIndex({
                name: "idx_dim_customer_country",
                columnNames: ["country"]
            }));
        }

        // DimStore
        if (dimStoreTable) {
            await queryRunner.createIndex(dimStoreTable, new TableIndex({
                name: "idx_dim_store_store_id",
                columnNames: ["store_id"]
            }));
            await queryRunner.createIndex(dimStoreTable, new TableIndex({
                name: "idx_dim_store_city",
                columnNames: ["city"]
            }));
            await queryRunner.createIndex(dimStoreTable, new TableIndex({
                name: "idx_dim_store_country",
                columnNames: ["country"]
            }));
        }

        // DimDate
        if (dimDateTable) {
            await queryRunner.createIndex(dimDateTable, new TableIndex({
                name: "idx_dim_date_date",
                columnNames: ["date"]
            }));
            await queryRunner.createIndex(dimDateTable, new TableIndex({
                name: "idx_dim_date_year",
                columnNames: ["year"]
            }));
            await queryRunner.createIndex(dimDateTable, new TableIndex({
                name: "idx_dim_date_year_quarter",
                columnNames: ["year", "quarter"]
            }));
            await queryRunner.createIndex(dimDateTable, new TableIndex({
                name: "idx_dim_date_year_month",
                columnNames: ["year", "month"]
            }));
        }

        console.log("Creating fact table indexes...");

        // FactRental
        if (factRentalTable) {
            await queryRunner.createIndex(factRentalTable, new TableIndex({
                name: "idx_fact_rental_date_rented",
                columnNames: ["date_key_rented"]
            }));
            await queryRunner.createIndex(factRentalTable, new TableIndex({
                name: "idx_fact_rental_date_returned",
                columnNames: ["date_key_returned"]
            }));
            await queryRunner.createIndex(factRentalTable, new TableIndex({
                name: "idx_fact_rental_film_key",
                columnNames: ["film_key"]
            }));
            await queryRunner.createIndex(factRentalTable, new TableIndex({
                name: "idx_fact_rental_customer_key",
                columnNames: ["customer_key"]
            }));
            await queryRunner.createIndex(factRentalTable, new TableIndex({
                name: "idx_fact_rental_store_key",
                columnNames: ["store_key"]
            }));
            await queryRunner.createIndex(factRentalTable, new TableIndex({
                name: "idx_fact_rental_staff_id",
                columnNames: ["staff_id"]
            }));
        }

        // FactPayment
        if (factPaymentTable) {
            await queryRunner.createIndex(factPaymentTable, new TableIndex({
                name: "idx_fact_payment_date_paid",
                columnNames: ["date_key_paid"]
            }));
            await queryRunner.createIndex(factPaymentTable, new TableIndex({
                name: "idx_fact_payment_customer_key",
                columnNames: ["customer_key"]
            }));
            await queryRunner.createIndex(factPaymentTable, new TableIndex({
                name: "idx_fact_payment_store_key",
                columnNames: ["store_key"]
            }));
            await queryRunner.createIndex(factPaymentTable, new TableIndex({
                name: "idx_fact_payment_staff_id",
                columnNames: ["staff_id"]
            }));
        }

        console.log("Creating bridge table indexes...");

        // BridgeFilmActor indexes
        if (bridgeFilmActorTable) {
            await queryRunner.createIndex(bridgeFilmActorTable, new TableIndex({
                name: "idx_bridge_film_actor_film",
                columnNames: ["film_key"]
            }));
            await queryRunner.createIndex(bridgeFilmActorTable, new TableIndex({
                name: "idx_bridge_film_actor_actor",
                columnNames: ["actor_key"]
            }));
        }

        // BridgeFilmCategory
        if (bridgeFilmCategoryTable) {
            await queryRunner.createIndex(bridgeFilmCategoryTable, new TableIndex({
                name: "idx_bridge_film_category_film",
                columnNames: ["film_key"]
            }));
            await queryRunner.createIndex(bridgeFilmCategoryTable, new TableIndex({
                name: "idx_bridge_film_category_category",
                columnNames: ["category_key"]
            }));
        }

        console.log("All indexes created successfully");

    } catch (error) {
        // Ignore "index already exists" errors
        if (error.message && error.message.includes('already exists')) {
            console.log("Indexes already exist (skipped)");
        } else {
            console.error("Error creating indexes:", error);
            throw error;
        }
    } finally {
        await queryRunner.release();
    }
}