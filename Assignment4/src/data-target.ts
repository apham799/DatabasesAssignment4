import "reflect-metadata"
import { DataSource } from "typeorm"
//import { User } from "./entity/User"
import { DimFilm } from "./entity/target/DimFilm";
import { DimActor } from "./entity/target/DimActor";
import { DimCategory } from "./entity/target/DimCategory";
import { DimStore } from "./entity/target/DimStore";
import { DimCustomer } from "./entity/target/DimCustomer";
import { BridgeFilmActor } from "./entity/target/BridgeFilmActor";
import { BridgeFilmCategory } from "./entity/target/BridgeFilmCategory";
import { FactRental } from "./entity/target/FactRental";
import { FactPayment } from "./entity/target/FactPayment";
import { DimDate } from "./entity/target/DimDate";
import { SyncState } from "./entity/target/SyncState";
import { validateData } from "./sync/validateData";

export const TargetDataSource = new DataSource({
    type: "sqlite",
    //host: "localhost",
    //port: 3306,
    //username: "apham799",
    //password: "Ap(43#26!23$",
    database: "sakila_warehouse.db",
    synchronize: true,
    logging: false,
    entities: [
        DimFilm,
        DimActor,
        DimCategory,
        DimStore,
        DimCustomer,
        BridgeFilmActor,
        BridgeFilmCategory,
        FactRental,
        FactPayment,
        DimDate,
        SyncState,
        validateData],
    migrations: [],
    subscribers: [],
})
