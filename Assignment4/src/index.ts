import { AppDataSource } from "./data-source"
import { TargetDataSource } from "./data-target";
//import { User } from "./entity/User"

import { loadDimDate } from "./load/loadDimDate";
import { loadDimStore } from "./load/loadDimStore";
import { loadDimCustomer } from "./load/loadDimCustomer";
import { loadDimFilm } from "./load/loadDimFilm";
import { loadDimActor } from "./load/loadDimActor";
import { loadDimCategory } from "./load/loadDimCategory";

import { loadBridgeFilmActor } from "./load/loadBridgeFilmActor";
import { loadBridgeFilmCategory } from "./load/loadBridgeFilmCategory";

import { loadFactRental } from "./load/loadFactRental";
import { loadFactPayment } from "./load/loadFactPayment";

import { incrementalSync } from "./sync/incrementalSync";

import { createIndexes } from "./sync/createIndexes";
import { validateData } from "./sync/validateData";
import {initAnalytics} from "./sync/initAnalytics";

// Import sync commands
//import { initAnalytics } from "./sync/init";
//import { fullLoad } from "./sync/fullLoad";
//import { incrementalSync } from "./sync/incremental";
//import { validateSync } from "./sync/validate";

//Original
/**AppDataSource.initialize().then(async () => {

    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    await AppDataSource.manager.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    console.log("Loaded users: ", users)

    console.log("Here you can setup and run express / fastify / any other framework.")

}).catch(error => console.log(error))**/

async function fullLoad() {
    console.log("\n🚀 Starting Full Load (Initial)...\n");
    try {
        await TargetDataSource.manager.transaction(async () => {
            console.log(" Transaction started");

            // Dimensions
            console.log("\n Loading Dimensions...");
            await loadDimDate();
            await loadDimStore();
            await loadDimCustomer();
            await loadDimFilm();
            await loadDimActor();
            await loadDimCategory();

            // Bridges
            console.log("\n Loading Bridges...");
            await loadBridgeFilmActor();
            await loadBridgeFilmCategory();

            // Facts
            console.log("\n Loading Facts...");
            await loadFactRental();
            await loadFactPayment();

            console.log("\n All operations completed");
        });

        console.log("Transaction committed - Full load completed!");

        await createIndexes();

        await validateData();
    } catch (error) {
        console.error("Full Load Failed.\n Error", error);
        console.error("Rolled Back");
        throw error;
    }
}

async function main() {

    try {
        console.log("\n🔌 Connecting to source & target databases...");

        await AppDataSource.initialize();
        console.log("Connected to MySQL");

        await TargetDataSource.initialize();
        console.log("Connected to SQLite");

        /*console.log("Starting ETL process with transaction...\n");

        //https://www.reddit.com/r/nestjs/comments/19c9z3l/how_can_i_use_transactions_with_typeorm_across/
        //https://typeorm.io/docs/query-runner/
        await TargetDataSource.manager.transaction(async () => {
            console.log("Transaction started");

            //Dimensions
            console.log("Loading Dimensions...");
            await loadDimDate();
            await loadDimStore();
            await loadDimCustomer();
            await loadDimFilm();
            await loadDimActor();
            await loadDimCategory();

            //Bridges
            console.log("Loading Bridges...");
            await loadBridgeFilmActor();
            await loadBridgeFilmCategory();

            // Facts
            console.log("Loading Facts...");
            await loadFactRental();
            await loadFactPayment();

            console.log("All operations completed");
        });

        console.log("Transaction committed - ETL completed successfully!");*/

        const command = process.argv[2];

        switch (command) {
            case "Init":
                await initAnalytics();
                break;
            case "Full-Load":
                await fullLoad();
                break;
            case "Incremental":
                await incrementalSync();
                break;
            case "Validate":
                await validateData(); // Run validation only
                break;
            case "Create-Indexes":
                await createIndexes(); // Create indexes only
                break;
            default:
                console.log("\n Init - Initializes sakila-warehouse and Creates Tables")
                console.log("\n Full-Load - Initial load of all data");
                console.log("\n Incremental - Sync only changed data");
                console.log("\n Validate-Data - Runs Data Validation Checks");
                console.log("\n Create-Indexes - Create Indexes");
        }

    } catch (error) {
        console.error("Transaction rolled back ", error);
        throw error;

    } finally {
        console.log("Closing connections");
        await AppDataSource.destroy();
        await TargetDataSource.destroy();
        console.log("Connections closed");
    }

    //const command = process.argv[2];


    /*switch (command) {
        case "init": await initAnalytics(); break;
        case "full-load": await fullLoad(); break;
        case "incremental": await incrementalSync(); break;
        case "validate": await validateSync(); break;
        default:
            console.log("Commands: init, full-load, incremental, validate");
    }*/
}

main();
